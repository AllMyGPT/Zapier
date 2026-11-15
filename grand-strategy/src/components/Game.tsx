'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { applyCommand, armiesOf, missionStatus, missionsOf, nationScore, peaceCost, rules, step, warScore, warsOf } from '@/engine/core';
import type { Command, GameState } from '@/engine/types';
import { formatDate } from '@/engine/util';
import { cloudEnabled, saveGame } from '@/lib/saves';
import { describeEffect } from '@/lib/describe';
import { artEra, eventArt, leaderPortrait, peaceArt, portraitFor } from '@/lib/art';
import Arms from './Arms';
import Portrait from './Portrait';
import Guide from './Guide';
import MapView from './MapView';
import StatIcon from './StatIcon';
import Panels, { type Tab } from './Panels';

const SPEEDS = [0, 800, 350, 150, 60, 15]; // ms per day

export default function Game({ initial, onExit }: { initial: GameState; onExit: () => void; paused?: boolean }) {
  const sRef = useRef<GameState>(initial);
  const s = sRef.current;
  const [version, setVersion] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [mode, setMode] = useState('political');
  const [prov, setProv] = useState<string | null>(s.nations[s.player]?.capital ?? null);
  const [army, setArmy] = useState<string | null>(null);
  const [tab, setTabRaw] = useState<Tab>('province');
  // mobile: the side panel is a bottom sheet (min = tabs only, half, full)
  const [sheet, setSheet] = useState<'min' | 'half' | 'full'>('min');
  const setTab = useCallback((t: Tab) => { setTabRaw(t); setSheet((v) => (v === 'min' ? 'half' : v)); }, []);
  const [toast, setToast] = useState<string | null>(null);
  const [dispatches, setDispatches] = useState<{ id: number; kind: string; text: string; day: number }[]>([]);
  const dispatchId = useRef(0);
  const pushDispatch = useCallback((list: { kind: string; text: string; day: number }[]) => {
    const items = list.slice(-4).map((l) => ({ ...l, id: ++dispatchId.current }));
    setDispatches((d) => [...d, ...items].slice(-5));
    for (const it of items) window.setTimeout(() => setDispatches((d) => d.filter((x) => x.id !== it.id)), it.kind === 'battle' ? 6000 : 9000);
  }, []);
  const lastLog = useRef(s.log.length);
  const r = rules(s);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const notify = useCallback((t: string) => { setToast(t); window.setTimeout(() => setToast((x) => (x === t ? null : x)), 4000); }, []);
  const cmd = useCallback((c: Command) => {
    const err = applyCommand(sRef.current, sRef.current.player, c);
    if (err) notify(err);
    refresh();
    return err;
  }, [notify, refresh]);

  const blocked = s.pendingEvents.length > 0 || s.peaceOffers.some((o) => o.to === s.player) || !!s.gameOver;

  useEffect(() => {
    if (!speed || blocked) return;
    const ms = SPEEDS[speed];
    const perTick = ms < 30 ? 3 : 1;
    const id = window.setInterval(() => {
      for (let i = 0; i < perTick; i++) {
        step(sRef.current);
        if (sRef.current.pendingEvents.length || sRef.current.peaceOffers.some((o) => o.to === sRef.current.player)) break;
      }
      // surface important news about the player
      const st = sRef.current;
      const fresh = st.log.slice(lastLog.current).filter((l) => l.tags.includes(st.player) && ['war', 'peace', 'character', 'battle', 'mission', 'story'].includes(l.kind));
      if (fresh.length) pushDispatch(fresh);
      // a war declared on the player pauses the game
      if (fresh.some((l) => l.kind === 'war' && /declara la guerra/.test(l.text) && !l.text.startsWith(st.nations[st.player]?.name ?? '~'))) { setSpeed(0); notify('¡Te han declarado la guerra! El juego se ha pausado.'); }
      lastLog.current = st.log.length;
      refresh();
    }, Math.max(ms, 30));
    return () => window.clearInterval(id);
  }, [speed, blocked, refresh, notify]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); setSpeed((v) => (v ? 0 : 3)); }
      if (/^Digit[1-5]$/.test(e.code)) setSpeed(Number(e.code.slice(5)));
      if (e.key === '+') setSpeed((v) => Math.min(5, v + 1));
      if (e.key === '-') setSpeed((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const me = s.nations[s.player];
  const ruler = me.rulerId ? s.characters[me.rulerId] : null;
  const event = s.pendingEvents[0] ? s.events.find((e) => e.id === s.pendingEvents[0].eventId) : null;
  const offer = s.peaceOffers.find((o) => o.to === s.player);
  const modes = [{ id: 'political', label: 'Político' }, { id: 'diplomatic', label: 'Diplomático' }, { id: 'terrain', label: 'Terreno' }, ...r.mapModes.map((m) => ({ id: m.id, label: m.label }))];

  const doSave = async () => {
    const name = prompt('Nombre de la partida', `${me.name} — ${formatDate(s.day)}`);
    if (!name) return;
    try {
      const cloud = cloudEnabled() && confirm('¿Guardar en la nube (Supabase)? Cancelar = guardar en este dispositivo.');
      await saveGame(s, name, cloud);
      notify('Partida guardada');
    } catch (e) { notify((e as Error).message); }
  };

  return (
    <div className="game">
      <div className="topbar">
        <div className="flag">
          <div className="ruler" onClick={() => setTab(s.era === 'ww2' ? 'nation' : 'court')} title="Soberano">
            <Portrait src={ruler ? portraitFor(s, ruler) : leaderPortrait(artEra(s), me.tag)} color={me.color} size={38} title={ruler ? `${ruler.name} de ${ruler.dynasty}` : me.name} />
            <span className="ruler-arms"><Arms tag={me.tag} color={me.color} size={22} title={me.name} /></span>
          </div>
          <div className="flag-name"><span>{me.name}</span>{ruler && <small>{ruler.name} de {ruler.dynasty}</small>}</div>
        </div>
        {r.topBar(s, s.player).map((st) => (
          <div key={st.label} className="stat" title={st.hint ? `${st.label}\n${st.hint}` : st.label}><StatIcon label={st.label} /><div className="v"><b>{st.value}</b><span>{st.label}</span></div></div>
        ))}
        <div className="grow" />
        <div className={`date ${speed ? 'running' : ''}`}>{formatDate(s.day)}</div>
        <div className="row speed">
          <button className={speed === 0 ? 'on' : ''} onClick={() => setSpeed(0)} title="Pausa (espacio)">❚❚</button>
          {[1, 2, 3, 4, 5].map((v) => <button key={v} className={speed === v ? 'on' : ''} onClick={() => setSpeed(v)}>{'›'.repeat(Math.min(v, 3))}{v > 3 ? v : ''}</button>)}
        </div>
        <button onClick={doSave} title="Guardar"><span className="ico">💾</span><span className="lbl">Guardar</span></button>
        <button className="ghost" title="Menú" onClick={() => { if (confirm('¿Salir al menú? Se perderá el progreso no guardado.')) onExit(); }}><span className="ico">☰</span><span className="lbl">Menú</span></button>
      </div>
      <div className={`main sheet-${sheet}`}>
        <div className="mapwrap">
          <MapView
            s={s} version={version} mode={mode} selectedProvince={prov} selectedArmy={army}
            onArmy={(id) => { setArmy(id); setProv(s.armies[id]?.location ?? null); setTab('army'); }}
            onProvince={(id, secondary) => {
              const a = army ? s.armies[army] : null;
              if (a && a.owner === s.player && (secondary || tab === 'army')) {
                if (id !== a.location) { cmd({ type: 'move', armyId: a.id, to: id }); return; }
              }
              setProv(id);
              setArmy(null);
              setTab('province');
            }}
          />
          <div className="mapmodes">
            {modes.map((m) => <button key={m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>{m.label}</button>)}
          </div>
          <Outliner s={s} selected={army} onArmy={(id) => { setArmy(id); setProv(s.armies[id]?.location ?? null); setTab('army'); }} onWars={() => setTab('wars')} onMissions={() => setTab('missions')} />
          {army && s.armies[army]?.owner === s.player && <div className="hint">Ejército seleccionado: toca (o clic derecho en) una provincia para moverlo</div>}
        </div>
        <Panels sheet={sheet} setSheet={setSheet} s={s} version={version} tab={tab} setTab={setTab} prov={prov} setProv={setProv} army={army} setArmy={setArmy} cmd={cmd} notify={notify} refresh={refresh} />
      </div>
      {toast && <div className="toast">{toast}</div>}
      <Guide />
      <div className="dispatches">
        {dispatches.map((d) => (
          <div key={d.id} className={`dispatch ${d.kind}`} onClick={() => setDispatches((x) => x.filter((y) => y.id !== d.id))}>
            <span className="dicon">{DISPATCH_ICON[d.kind] ?? '✦'}</span>
            <div><div className="dkind">{DISPATCH_LABEL[d.kind] ?? 'Despacho'} · {formatDate(d.day)}</div><div className="dtext">{d.text}</div></div>
          </div>
        ))}
      </div>

      {event && (
        <div className="modal-bg"><div className="modal modal-event">
          <div className="modal-art" style={{ backgroundImage: `url(${event.image ? `/art/events/${artEra(s)}-${event.image}.jpg` : eventArt(artEra(s), event.title, event.text)}), url(${event.image ? `/art/events/ww2-${event.image}.jpg` : eventArt('ww2', event.title, event.text)})` }} />
          <h2>{event.title}</h2>
          <div className="modal-date">{formatDate(s.day)}</div>
          <p>{event.text}</p>
          {event.note && <p className="event-note">{event.note}</p>}
          <div className="col">
            {event.options.map((o, i) => {
              const fx = o.effects.map((e) => describeEffect(s, s.player, e)).filter(Boolean) as { text: string; good: boolean | null }[];
              return (
                <button key={i} className="opt" onClick={() => cmd({ type: 'eventChoice', eventId: event.id, option: i })}>
                  <span className="opt-label">{o.label}</span>
                  {o.hint && <span className="opt-hint">{o.hint}</span>}
                  {fx.length > 0 && <span className="opt-fx">{fx.map((f, k) => <span key={k} className={f.good === true ? 'good' : f.good === false ? 'bad' : 'neutral'}>{f.text}</span>)}</span>}
                </button>
              );
            })}
          </div>
        </div></div>
      )}
      {!event && offer && (() => {
        const w = s.wars.find((x) => x.id === offer.warId);
        const ws = w ? warScore(s, w, s.player) : 0;
        const cost = w ? peaceCost(s, w, offer.from, offer.to, offer.provinces, offer.gold, offer.extra) : 0;
        return (
          <div className="modal-bg"><div className="modal modal-event">
            <div className="modal-art" style={{ backgroundImage: `url(${peaceArt(artEra(s))}), url(${peaceArt('ww2')})` }} />
            <h2>Propuesta de paz</h2>
            <p><b>{s.nations[offer.from]?.name}</b> ofrece la paz en «{w?.name}».</p>
            <p>{offer.provinces.length ? <>Exige: {offer.provinces.map((p) => s.provinces[p].name).join(', ')}</> : 'Paz blanca: sin cambios territoriales.'}
              {offer.gold ? ` · ${offer.gold} de oro` : ''}{offer.extra ? ` · ${r.peaceExtras.find((e) => e.id === offer.extra)?.label}` : ''}</p>
            <p className="muted">Puntuación de guerra para ti: {ws} · valor de las exigencias: {cost}</p>
            <div className="row">
              <button className="primary" onClick={() => cmd({ type: 'answerPeace', offerId: offer.id, accept: true })}>Aceptar</button>
              <button onClick={() => cmd({ type: 'answerPeace', offerId: offer.id, accept: false })}>Rechazar</button>
            </div>
          </div></div>
        );
      })()}
      {s.gameOver && (
        <div className="modal-bg"><div className="modal modal-event">
          <div className="modal-art" style={{ backgroundImage: `url(/art/era-${artEra(s)}.jpg), url(/art/era-${s.era}.jpg)` }} />
          <h2>Fin de la partida</h2>
          <p>{s.gameOver}</p>
          <EndSummary s={s} />
          <div className="row"><button className="primary" onClick={onExit}>Volver al menú</button><button onClick={() => { sRef.current.gameOver = null; sRef.current.endDay += 365 * 50; refresh(); }}>Seguir jugando</button></div>
        </div></div>
      )}
    </div>
  );
}

function Outliner({ s, selected, onArmy, onWars, onMissions }: { s: GameState; selected: string | null; onArmy: (id: string) => void; onWars: () => void; onMissions: () => void }) {
  const [open, setOpen] = useState(true);
  const mine = armiesOf(s, s.player);
  const wars = warsOf(s, s.player);
  const sieges = Object.values(s.provinces).filter((p) => p.siege && (p.siege.by === s.player || p.owner === s.player));
  const ready = missionsOf(s, s.player).filter((m) => missionStatus(s, s.player, m) === 'ready').length;
  return (
    <div className={`outliner ${open ? '' : 'closed'}`}>
      <button className="outliner-head" onClick={() => setOpen((v) => !v)}>Resumen {open ? '▾' : '▸'}</button>
      {open && (
        <div className="outliner-body">
          {ready > 0 && <div className="ol-row ol-ready" onClick={onMissions}><span className="ol-name">★ {ready === 1 ? 'Un objetivo listo' : `${ready} objetivos listos`}</span><b>›</b></div>}
          {wars.length > 0 && <div className="ol-sec">Guerras</div>}
          {wars.map((w) => {
            const ws = warScore(s, w, s.player);
            return (
              <div key={w.id} className="ol-row ol-war" onClick={onWars} title={w.name}>
                <span className="ol-name">⚔ {w.name}</span>
                <span className="ol-score"><span style={{ width: `${Math.abs(ws) / 2}%`, left: ws >= 0 ? '50%' : `${50 - Math.abs(ws) / 2}%`, background: ws >= 0 ? '#7bd17b' : '#e0644f' }} /></span>
                <b style={{ color: ws >= 0 ? '#9fe09f' : '#f0a090' }}>{ws > 0 ? '+' : ''}{ws}</b>
              </div>
            );
          })}
          <div className="ol-sec">Ejércitos ({mine.length})</div>
          {mine.slice(0, 14).map((a) => {
            const org = a.units.reduce((t, u) => t + u.org, 0) / Math.max(1, a.units.length);
            return (
              <div key={a.id} className={`ol-row ${a.id === selected ? 'sel' : ''}`} onClick={() => onArmy(a.id)}>
                <span className="ol-name">{a.inBattle ? '⚔ ' : a.path.length ? '➜ ' : ''}{a.name}</span>
                <span className="ol-org"><span style={{ width: `${org * 100}%` }} /></span>
                <b>{a.units.length}</b>
              </div>
            );
          })}
          {sieges.length > 0 && <div className="ol-sec">Asedios</div>}
          {sieges.slice(0, 6).map((p) => (
            <div key={p.id} className="ol-row"><span className="ol-name">🏰 {p.name}</span><b>{Math.round((p.siege!.progress / rules(s).siegeBaseDays) * 100)}%</b></div>
          ))}
        </div>
      )}
    </div>
  );
}

const DISPATCH_ICON: Record<string, string> = { war: '⚔', peace: '🕊', character: '♛', battle: '⚑', mission: '★', story: '✒' };
const DISPATCH_LABEL: Record<string, string> = { war: 'Guerra', peace: 'Paz', character: 'Corte', battle: 'Parte de batalla', mission: 'Objetivo cumplido', story: 'Crónica' };

function EndSummary({ s }: { s: GameState }) {
  const rows = Object.values(s.nations).filter((n) => n.alive && !n.x.pseudo && !n.liege).map((n) => ({ n, v: nationScore(s, n.tag) })).sort((a, b) => b.v - a.v);
  const rank = rows.findIndex((r) => r.n.tag === s.player) + 1;
  const rec = s.record?.[s.player];
  const done = s.missionsDone?.[s.player]?.length ?? 0;
  const total = missionsOf(s, s.player).length;
  const story = (s.chronicle ?? s.log).filter((l) => (l.kind === 'story' || l.kind === 'mission') && l.tags.includes(s.player)).slice(-6);
  const verdict = rank === 1 ? 'Tu nombre encabeza los anales de la época.' : rank <= 3 ? 'Los cronistas te cuentan entre los grandes de tu tiempo.' : rank <= 8 ? 'Dejas un legado respetable.' : 'La historia apenas recordará tu reinado.';
  return (
    <div className="end-summary">
      <div className="end-rank"><span>{rank || '—'}</span><small>puesto de {rows.length}</small></div>
      <p className="end-verdict">{verdict}</p>
      <div className="end-grid">
        <div><b>{nationScore(s, s.player)}</b><span>puntuación</span></div>
        <div><b>{done}/{total}</b><span>objetivos</span></div>
        <div><b>{rec?.won ?? 0}</b><span>guerras ganadas</span></div>
        <div><b>{rec?.conquered ?? 0}</b><span>conquistas</span></div>
      </div>
      {rows.length > 0 && <div className="end-top">{rows.slice(0, 5).map((r, i) => <div key={r.n.tag} className={r.n.tag === s.player ? 'me' : ''}>{i + 1}. {r.n.name} <span className="muted">{r.v}</span></div>)}</div>}
      {story.length > 0 && <div className="end-story">{story.map((l, i) => <p key={i}>«{l.text}»</p>)}</div>}
    </div>
  );
}
