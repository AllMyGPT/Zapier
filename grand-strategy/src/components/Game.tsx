'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { applyCommand, peaceCost, rules, step, warScore } from '@/engine/core';
import type { Command, GameState } from '@/engine/types';
import { formatDate } from '@/engine/util';
import { cloudEnabled, saveGame } from '@/lib/saves';
import MapView from './MapView';
import Panels, { type Tab } from './Panels';

const SPEEDS = [0, 800, 350, 150, 60, 15]; // ms per day

export default function Game({ initial, onExit }: { initial: GameState; onExit: () => void }) {
  const sRef = useRef<GameState>(initial);
  const s = sRef.current;
  const [version, setVersion] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [mode, setMode] = useState('political');
  const [prov, setProv] = useState<string | null>(s.nations[s.player]?.capital ?? null);
  const [army, setArmy] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('province');
  const [toast, setToast] = useState<string | null>(null);
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
      for (const l of st.log.slice(lastLog.current)) if (l.tags.includes(st.player) && ['war', 'peace', 'character'].includes(l.kind)) notify(l.text);
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
        <div className="flag"><span className="swatch" style={{ background: me.color, width: 18, height: 18 }} />{me.name}</div>
        {r.topBar(s, s.player).map((st) => (
          <div key={st.label} className="stat" title={st.hint}><b>{st.value}</b><span>{st.label}</span></div>
        ))}
        <div className="grow" />
        <div className="date">{formatDate(s.day)}</div>
        <div className="row speed">
          <button className={speed === 0 ? 'on' : ''} onClick={() => setSpeed(0)} title="Pausa (espacio)">❚❚</button>
          {[1, 2, 3, 4, 5].map((v) => <button key={v} className={speed === v ? 'on' : ''} onClick={() => setSpeed(v)}>{'›'.repeat(Math.min(v, 3))}{v > 3 ? v : ''}</button>)}
        </div>
        <button onClick={doSave}>Guardar</button>
        <button className="ghost" onClick={() => { if (confirm('¿Salir al menú? Se perderá el progreso no guardado.')) onExit(); }}>Menú</button>
      </div>
      <div className="main">
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
          {army && s.armies[army]?.owner === s.player && <div className="hint">Ejército seleccionado: toca/clic derecho en una provincia para moverlo</div>}
        </div>
        <Panels s={s} version={version} tab={tab} setTab={setTab} prov={prov} setProv={setProv} army={army} setArmy={setArmy} cmd={cmd} notify={notify} refresh={refresh} />
      </div>
      {toast && <div className="toast">{toast}</div>}

      {event && (
        <div className="modal-bg"><div className="modal">
          <h2>{event.title}</h2>
          <div className="muted">{formatDate(s.day)}</div>
          <p>{event.text}</p>
          <div className="col">
            {event.options.map((o, i) => <button key={i} onClick={() => cmd({ type: 'eventChoice', eventId: event.id, option: i })}>{o.label}</button>)}
          </div>
        </div></div>
      )}
      {!event && offer && (() => {
        const w = s.wars.find((x) => x.id === offer.warId);
        const ws = w ? warScore(s, w, s.player) : 0;
        const cost = w ? peaceCost(s, w, offer.from, offer.to, offer.provinces, offer.gold, offer.extra) : 0;
        return (
          <div className="modal-bg"><div className="modal">
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
        <div className="modal-bg"><div className="modal">
          <h2>Fin de la partida</h2>
          <p>{s.gameOver}</p>
          <div className="row"><button className="primary" onClick={onExit}>Volver al menú</button><button onClick={() => { sRef.current.gameOver = null; sRef.current.endDay += 365 * 50; refresh(); }}>Seguir jugando</button></div>
        </div></div>
      )}
    </div>
  );
}
