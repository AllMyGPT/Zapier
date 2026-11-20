'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Fixture, GameState } from '@/game/types';
import { advance, endSeason, fmtMoney, simFixture, buildMatch, applyResult, isDerby, setObjectives } from '@/game/season';
import { compName, dateLabel, seasonLabel, table, inWindow } from '@/game/calendar';
import { Crest, Modal, SceneHero, TalkBar } from './ui';
import { PRE_TALKS, preMatchTalk, type TalkKind, type TalkResult } from '@/game/talk';
import { pressQuestion, answerPress, type PressQuestion } from '@/game/press';
import { resolveDecision } from '@/game/events';
import { PLANS, preseasonPending, runPreseason, type PlanId } from '@/game/preseason';
import { PlayerCard } from './ui';
import { avgRating, ovr } from '@/game/player';
import type { Player } from '@/game/types';
import { Icon } from './Icons';
import TitleScreen from './TitleScreen';
import Office from './screens/Office';
import Squad from './screens/Squad';
import TacticsScreen from './screens/Tactics';
import TrainingScreen from './screens/Training';
import Transfers from './screens/Transfers';
import Finances from './screens/Finances';
import ClubScreen from './screens/ClubScreen';
import Competitions from './screens/Competitions';
import SaveScreen from './screens/SaveScreen';
import LifeScreen from './screens/LifeScreen';
import Scout, { TacticAdvice } from './screens/Scout';
import PlayerModal from './PlayerModal';
import MatchView from './MatchView';
import { saveLocal } from '@/lib/storage';
import { runToEnd, type Match } from '@/game/engine';
import { ensureLineup } from '@/game/lineup';

export type Tab = 'office' | 'squad' | 'tactics' | 'training' | 'transfers' | 'scout' | 'finances' | 'club' | 'comps' | 'life' | 'save';
interface Ctx { gs: GameState; v: number; refresh: () => void; toast: (s: string) => void; openPlayer: (id: number) => void; goto: (t: Tab) => void; setGs: (g: GameState | null) => void }
const GameCtx = createContext<Ctx | null>(null);
export const useGame = () => useContext(GameCtx)!;

const NAV: [Tab, string][] = [
  ['office', 'Despacho'], ['squad', 'Plantilla'], ['tactics', 'Tácticas'], ['training', 'Entrenamiento'],
  ['transfers', 'Fichajes'], ['scout', 'Ojeador'], ['finances', 'Finanzas'], ['club', 'Club'], ['comps', 'Competiciones'], ['life', 'Vida'], ['save', 'Partida'],
];

/** Scene photo, kicker and subtitle for each screen's banner. */
const SCENES: Record<Tab, [string, string, string]> = {
  office: ['office', 'Centro de mando', 'Agenda, directiva y noticias del club'],
  squad: ['dressing', 'Vestuario', 'Tu plantilla, contratos, estado y rendimiento'],
  tactics: ['chalkboard', 'La pizarra', 'Sistema, mentalidad y once titular'],
  training: ['training', 'Ciudad deportiva', 'Planifica la semana y haz crecer a tus jugadores'],
  transfers: ['negotiation', 'Mercado', 'Ofertas y negociaciones'],
  scout: ['chalkboard', 'Ojeadores', 'Misiones, informes y la táctica del próximo rival'],
  finances: ['negotiation', 'Cuentas del club', 'Ingresos, gastos y presupuesto'],
  club: ['exterior', 'Instalaciones', 'Estadio, personal y cantera'],
  comps: ['trophies', 'Sala de trofeos', 'Clasificaciones, copas y calendario'],
  life: ['life/home-penthouse', 'Vida personal', 'Casa, coche, amor, familia y escándalos'],
  save: ['manager', 'Partida', 'Guarda y carga tu carrera'],
};

export default function GameApp() {
  const [gs, setGsState] = useState<GameState | null>(null);
  const [v, setV] = useState(0);
  const [tab, setTab] = useState<Tab>('office');
  const [toastMsg, setToast] = useState<string | null>(null);
  const [player, setPlayer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [pre, setPre] = useState<Fixture | null>(null);
  const [talk, setTalk] = useState<TalkResult | null>(null);
  const [match, setMatch] = useState<{ m: Match; f: Fixture } | null>(null);
  const [summary, setSummary] = useState<{ f: Fixture; m: Match } | null>(null);
  const [seasonEnd, setSeasonEnd] = useState<string[] | null>(null);
  const [press, setPress] = useState<{ q: PressQuestion; done?: string } | null>(null);
  const [awards, setAwards] = useState<{ label: string; p: Player; stat: string }[]>([]);
  const toastT = useRef<ReturnType<typeof setTimeout>>();

  const refresh = useCallback(() => setV(x => x + 1), []);
  const toast = useCallback((s: string) => { setToast(s); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 3800); }, []);
  const setGs = useCallback((g: GameState | null) => { if (g && g.manager.clubId && (!g.objectives || g.objectives.season !== g.season)) setObjectives(g); setGsState(g); setTab('office'); setV(x => x + 1); }, []);

  // autosave once the user pauses: big worlds take a moment to serialise, so wait longer when there are many players
  useEffect(() => { if (gs) { const big = gs.nextId > 15000; const t = setTimeout(() => { saveLocal(gs, 0); }, big ? 2500 : 400); return () => clearTimeout(t); } }, [gs, v]);

  if (!gs) return <TitleScreen onStart={g => setGs(g)} />;
  const club = gs.clubs[gs.manager.clubId];
  const unread = gs.news.filter(n => !n.read).length;
  const pendingOffers = gs.offers.filter(o => o.incoming && o.status === 'pending').length;

  /** Plays the whole rest of the season with the current lineups; stops early for decisions or a sacking. */
  const simulateSeason = () => {
    if (busy || gs.manager.sacked) return;
    if (!confirm('Simular la temporada: tus partidos se juegan automáticamente con la alineación actual. ¿Continuar?')) return;
    setBusy(true);
    setTimeout(() => {
      let ended: string[] | null = null; let stop = 'Simulación detenida.';
      for (let guard = 0; guard < 5000; guard++) {
        const r = advance(gs);
        if (r.type === 'match') { simFixture(gs, r.fixture); continue; }
        if (r.type === 'decision') { stop = 'Tienes una decisión pendiente: resuélvela para seguir simulando.'; break; }
        if (r.type === 'sacked') { stop = 'Te han destituido.'; break; }
        if (r.type === 'seasonEnd') { setAwards(seasonAwards(gs)); ended = endSeason(gs); break; }
      }
      setBusy(false);
      if (ended) setSeasonEnd(ended); else toast(stop);
      refresh();
    }, 30);
  };

  const doContinue = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      const r = advance(gs);
      setBusy(false);
      if (r.type === 'match') { setTalk(null); setPre(r.fixture); }
      else if (r.type === 'seasonEnd') { setAwards(seasonAwards(gs)); const s = endSeason(gs); setSeasonEnd(s); }
      else if (r.type === 'sacked') { /* handled by office banner */ setTab('office'); }
      else if (r.type === 'decision') { /* the decision modal opens from gs.pending */ }
      else toast(r.reason);
      refresh();
    }, 30);
  };

  const startMatch = (watch: boolean) => {
    const f = pre!; setPre(null);
    const warn = ensureLineup(gs, club);
    if (warn.length) toast(`Cambios forzados en la alineación: ${warn.join(', ')}`);
    if (!watch) {
      const m = buildMatch(gs, f);
      runToEnd(m);
      applyResult(gs, f, m); setSummary({ f, m }); refresh(); return;
    }
    setMatch({ m: buildMatch(gs, f), f });
  };
  const finishMatch = () => { if (!match) return; applyResult(gs, match.f, match.m); setSummary(match); setMatch(null); refresh(); };

  const ctx: Ctx = { gs, v, refresh, toast, openPlayer: setPlayer, goto: setTab, setGs };
  const L = gs.leagues[club.leagueId];
  const pos = table(gs, L.id).findIndex(r => r.id === club.id) + 1;

  return (
    <GameCtx.Provider value={ctx}>
      <div className="backdrop" style={{ ['--scene' as string]: `url(/art/${SCENES[tab][0]}.webp)` } as React.CSSProperties} />
      <div className="shell">
        <aside className="side">
          <div className="brand"><img src="/art/emblem.svg" alt="" /><div className="wm"><b>Pizarra</b><span>Club Manager</span></div></div>
          {NAV.filter(([k]) => k !== 'life' || gs.life?.enabled).map(([k, label]) => (
            <button key={k} className={`nav ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
              <span className="ic"><Icon name={k} /></span>{label}
              {k === 'office' && unread > 0 && <span className="badge">{unread}</span>}
              {k === 'transfers' && pendingOffers > 0 && <span className="badge">{pendingOffers}</span>}
            </button>
          ))}
          <div className="foot grow" />
          <div className="mgr"><div className="row" style={{ gap: 8 }}><Crest club={club} size={26} /><div><b>{gs.manager.name}</b><div className="muted">Temporada {seasonLabel(gs.season)}</div></div></div></div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div className="club"><Crest club={club} size={46} /><div><h2>{club.name}</h2><div className="small"><span className="muted">{L.name} · {pos}º</span> · <span className="date-chip">{dateLabel(gs.season, gs.day)}</span></div></div></div>
            <div className="row wrap" style={{ gap: 0 }}>
              <div className="stat"><b className="num">{fmtMoney(club.balance)}</b><span>Saldo</span></div>
              <div className="stat"><b className="num">{fmtMoney(club.transferBudget)}</b><span>Fichajes</span></div>
              <div className="stat"><b className="num" style={{ color: gs.manager.board > 60 ? 'var(--good)' : gs.manager.board > 30 ? 'var(--warn)' : 'var(--bad)' }}>{Math.round(gs.manager.board)}%</b><span>Directiva</span></div>
              <div className="stat"><b style={{ color: inWindow(gs.day) ? 'var(--good)' : 'var(--muted)', fontSize: 14, paddingTop: 4 }}>{inWindow(gs.day) ? 'ABIERTO' : 'CERRADO'}</b><span>Mercado</span></div>
            </div>
            <div className="right">
              <button className="btn" onClick={simulateSeason} disabled={busy || !!gs.manager.sacked} title="Juega el resto de la temporada sin ver los partidos">Simular temporada ⏩</button>
              <button className="btn primary big" onClick={doContinue} disabled={busy || !!gs.manager.sacked}>{busy ? <span className="spin" /> : 'Continuar ▶'}</button>
            </div>
          </div>
          <SceneHero img={SCENES[tab][0]} kicker={SCENES[tab][1]} title={NAV.find(n => n[0] === tab)![1]} sub={SCENES[tab][2]} />
          <div key={tab} className="screen-in">
          {tab === 'office' && <Office />}
          {tab === 'squad' && <Squad />}
          {tab === 'tactics' && <TacticsScreen />}
          {tab === 'training' && <TrainingScreen />}
          {tab === 'transfers' && <Transfers />}
          {tab === 'scout' && <Scout />}
          {tab === 'finances' && <Finances />}
          {tab === 'club' && <ClubScreen />}
          {tab === 'comps' && <Competitions />}
          {tab === 'life' && gs.life?.enabled && <LifeScreen />}
          {tab === 'save' && <SaveScreen />}
          </div>
        </main>
      </div>

      <div className="ticker" aria-label="Últimas noticias">
        <div className="lbl">Última hora</div>
        <div className="track">{(() => { const items = gs.news.slice(-8).reverse().map(n => n.title); const list = items.length ? items : ['Bienvenido a tu nuevo club']; return [...list, ...list].map((t, i) => <span key={i}>{t}</span>); })()}</div>
      </div>

      {player != null && gs.players[player] && <PlayerModal id={player} onClose={() => { setPlayer(null); refresh(); }} />}

      {pre && (() => {
        const opp = gs.clubs[pre.home === club.id ? pre.away : pre.home];
        const home = gs.clubs[pre.home], away = gs.clubs[pre.away];
        return (
          <Modal onClose={() => setPre(null)} scene="tunnel">
            <div style={{ textAlign: 'center' }}><span className="matchday-kicker">Día de partido</span>{isDerby(gs, pre.home, pre.away) && <span className="derby-badge">Derbi</span>}<div className="muted small" style={{ marginTop: 8, textTransform: 'uppercase', letterSpacing: '.14em' }}>{compName(gs, pre.comp)} {pre.roundName ?? `· Jornada ${pre.round}`}</div></div>
            <div className="row" style={{ justifyContent: 'center', gap: 30, margin: '26px 0' }}>
              <div className="col" style={{ alignItems: 'center', width: 220 }}><Crest club={home} size={96} /><h2 style={{ textAlign: 'center', fontStyle: 'italic', textTransform: 'uppercase' }}>{home.name}</h2></div>
              <div className="vs-big">VS</div>
              <div className="col" style={{ alignItems: 'center', width: 220 }}><Crest club={away} size={96} /><h2 style={{ textAlign: 'center', fontStyle: 'italic', textTransform: 'uppercase' }}>{away.name}</h2></div>
            </div>
            <p className="muted" style={{ textAlign: 'center' }}>{home.stadium} · Rival: {opp.name} ({opp.tactics.formation})</p>
            <div style={{ maxWidth: 620, margin: '0 auto 14px' }}><TacticAdvice rivalId={opp.id} /></div>
            <TalkBar title="Charla en el vestuario" options={PRE_TALKS} result={talk} onPick={k => { setTalk(preMatchTalk(gs, club.id, opp.id, pre.home === club.id, k as TalkKind)); refresh(); }} />
            <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
              <button className="btn" onClick={() => { setPre(null); setTab('tactics'); }}>Revisar tácticas</button>
              <button className="btn" onClick={() => startMatch(false)}>Resultado rápido</button>
              <button className="btn primary big" onClick={() => startMatch(true)}>Jugar en directo ▶</button>
            </div>
          </Modal>
        );
      })()}

      {match && <MatchView m={match.m} f={match.f} onFinish={finishMatch} />}

      {summary && <MatchSummary f={summary.f} m={summary.m} onClose={() => { if (gs.leagues[summary.f.comp] || gs.cups[summary.f.comp]) setPress({ q: pressQuestion(gs, summary.f) }); setSummary(null); }} />}

      {!pre && !match && !summary && !press && !seasonEnd && preseasonPending(gs) && (
        <div className="overlay">
          <div className="modal scene" style={{ width: 'min(1000px, 100%)' }}>
            <div className="scene-bg" style={{ backgroundImage: 'url(/art/training.webp)' }} />
            <div className="inner">
              <span className="matchday-kicker">Pretemporada {seasonLabel(gs.season)}</span>
              <h1 style={{ margin: '10px 0 4px' }}>Planifica el verano</h1>
              <p className="muted" style={{ marginTop: 0 }}>Elige cómo preparar la temporada. Se jugarán tres amistosos que no cuentan en las estadísticas oficiales.</p>
              <div className="plans">{PLANS.map(pl => (
                <button key={pl.id} className="plan" onClick={() => { runPreseason(gs, pl.id as PlanId); setTab('office'); refresh(); toast('Pretemporada completada: mira los resultados en la bandeja de entrada.'); }}>
                  <b>{pl.title}</b><span>{pl.desc}</span><span className="pro">▲ {pl.pros}</span><span className="con">▼ {pl.cons}</span>
                </button>
              ))}</div>
            </div>
          </div>
        </div>
      )}

      {!pre && !match && !summary && !press && gs.pending?.[0] && (() => {
        const d = gs.pending[0]; const p = d.pid != null ? gs.players[d.pid] : undefined;
        return (
          <div className="overlay">
            <div className="modal decision">
              <span className="matchday-kicker">Decisión del míster</span>
              <div className="row" style={{ alignItems: 'flex-start', gap: 18, marginTop: 14 }}>
                {p && <div onClick={() => setPlayer(p.id)} style={{ cursor: 'pointer' }}><PlayerCard p={p} club={p.clubId ? gs.clubs[p.clubId] : null} rating={ovr(p)} /></div>}
                <div className="grow"><h2 style={{ marginBottom: 6 }}>{d.title}</h2><p style={{ color: '#d3e0f7', marginTop: 0 }}>{d.body}</p>
                  <div className="col" style={{ gap: 8 }}>{d.options.map((o, i) => (
                    <button key={i} className="press-a" onClick={() => { resolveDecision(gs, d.id, i); toast(`Decisión tomada: ${o.label}`); refresh(); }}><b style={{ fontStyle: 'normal' }}>{o.label}</b><div className="small muted" style={{ fontStyle: 'normal' }}>{o.hint}</div></button>
                  ))}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {press && (
        <Modal onClose={() => setPress(null)}>
          <span className="matchday-kicker">Rueda de prensa</span>
          <div className="press-q"><span className="press-mic">🎙️</span><div><div className="small muted">{press.q.journalist}</div><b>{press.q.q}</b></div></div>
          {!press.done ? (
            <div className="col" style={{ gap: 8 }}>{press.q.answers.map((a, i) => (
              <button key={i} className="press-a" onClick={() => { answerPress(gs, press.q, a); setPress({ ...press, done: a.headline }); refresh(); }}>«{a.text}»</button>
            ))}<button className="btn ghost sm" style={{ alignSelf: 'flex-end' }} onClick={() => setPress(null)}>No comparecer</button></div>
          ) : (
            <div className="col"><div className="press-head">{press.done}</div><div className="row"><button className="btn primary right" onClick={() => setPress(null)}>Salir de la sala</button></div></div>
          )}
        </Modal>
      )}

      {seasonEnd && (
        <Modal onClose={() => setSeasonEnd(null)} scene="trophies">
          <span className="matchday-kicker">Balance</span>
          <h1 style={{ marginTop: 10 }}>Fin de temporada</h1>
          <p className="muted">Comienza la temporada {seasonLabel(gs.season)}. Se ha abierto el mercado de verano y ha llegado una nueva hornada de juveniles.</p>
          {awards.length > 0 && (
            <div className="awards">{awards.map(a => (
              <div key={a.label} className="award" onClick={() => setPlayer(a.p.id)}><div className="award-l">{a.label}</div><PlayerCard p={a.p} club={a.p.clubId ? gs.clubs[a.p.clubId] : null} rating={ovr(a.p)} /><div className="award-s">{a.p.name} · {a.stat}</div></div>
            ))}</div>
          )}
          <div className="col" style={{ gap: 6 }}>{seasonEnd.map((s, i) => <div key={i} className="news-item" style={{ cursor: 'default' }}>{s}</div>)}</div>
          <div className="row" style={{ marginTop: 16 }}><button className="btn primary right" onClick={() => setSeasonEnd(null)}>Empezar nueva temporada</button></div>
        </Modal>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </GameCtx.Provider>
  );
}

function MatchSummary({ f, m, onClose }: { f: Fixture; m: Match; onClose: () => void }) {
  const { gs, openPlayer } = useGame();
  const h = gs.clubs[f.home], a = gs.clubs[f.away];
  return (
    <Modal onClose={onClose} wide>
      <div style={{ textAlign: 'center' }}><span className="matchday-kicker">Final del partido</span><div className="muted small" style={{ marginTop: 8, textTransform: 'uppercase', letterSpacing: '.14em' }}>{compName(gs, f.comp)}</div></div>
      <div className="scoreboard" style={{ margin: '16px auto', maxWidth: 760 }}>
        <div className="team"><Crest club={h} size={46} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span></div>
        <div className="score num">{f.hg} - {f.ag}</div>
        <div className="team away"><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span><Crest club={a} size={46} /></div>
      </div>
      {f.pens && <p style={{ textAlign: 'center' }} className="muted">Penaltis: {f.pens[0]} - {f.pens[1]}</p>}
      {(() => {
        const all = [0, 1].flatMap(si => [...m.sides[si].played].map(id => ({ id, r: m.sides[si].rating[id] ?? 6 })));
        const best = all.sort((a, b) => b.r - a.r)[0]; const p = best && gs.players[best.id];
        if (!p) return null;
        return <div className="motm"><PlayerCard p={p} club={p.clubId ? gs.clubs[p.clubId] : null} rating={ovr(p)} /><div><div className="kicker-sm">Jugador del partido</div><h2 style={{ margin: '4px 0' }}>{p.name}</h2><div className="kpi" style={{ color: 'var(--accent)' }}>{best.r.toFixed(1)}</div><div className="small muted">{m.events.filter(e => e.pid === p.id && e.kind === 'goal').length} goles · {m.events.filter(e => e.pid2 === p.id && e.kind === 'goal').length} asistencias</div></div></div>;
      })()}
      <div className="grid g2">
        {[0, 1].map(si => {
          const s = m.sides[si];
          return (
            <div className="panel tight" key={si}>
              <h3>{s.club.name}</h3>
              <table className="t"><thead><tr><th>Jugador</th><th className="c">Nota</th><th>Eventos</th></tr></thead>
                <tbody>{[...s.played].map(id => {
                  const evs = m.events.filter(e => e.pid === id || e.pid2 === id);
                  return (
                    <tr key={id} className="click" onClick={() => openPlayer(id)}>
                      <td>{gs.players[id]?.name}</td>
                      <td className="c"><b style={{ color: (s.rating[id] ?? 6) >= 7.5 ? 'var(--good)' : (s.rating[id] ?? 6) < 5.8 ? 'var(--bad)' : undefined }}>{(s.rating[id] ?? 6).toFixed(1)}</b></td>
                      <td>{evs.map((e, i) => <span key={i} title={e.text}>{e.kind === 'goal' ? (e.pid === id ? '⚽' : '🅰️') : e.kind === 'yellow' ? '🟨' : e.kind === 'red' ? '🟥' : e.kind === 'injury' ? '🩹' : e.kind === 'sub' ? (e.pid === id ? '🔼' : '🔽') : ''} </span>)}</td>
                    </tr>
                  );
                })}</tbody></table>
            </div>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 14 }}><button className="btn primary right" onClick={onClose}>Continuar</button></div>
    </Modal>
  );
}

export { simFixture };

/** Season awards for the user's league, computed before stats are reset. */
function seasonAwards(gs: import('@/game/types').GameState) {
  const L = gs.leagues[gs.clubs[gs.manager.clubId].leagueId];
  const ps = Object.values(gs.players).filter(p => p.clubId && L.clubIds.includes(p.clubId));
  const out: { label: string; p: Player; stat: string }[] = [];
  const minApps = Math.max(5, Math.round(Math.max(...ps.map(p => p.stats.apps)) * 0.5));
  const best = ps.filter(p => p.stats.apps >= minApps).sort((a, b) => avgRating(b) - avgRating(a))[0];
  if (best) out.push({ label: 'Mejor jugador', p: best, stat: `nota ${avgRating(best).toFixed(2)}` });
  const top = ps.slice().sort((a, b) => b.stats.goals - a.stats.goals)[0];
  if (top?.stats.goals) out.push({ label: 'Pichichi', p: top, stat: `${top.stats.goals} goles` });
  const young = ps.filter(p => gs.season - p.born <= 21 && p.stats.apps >= minApps / 2).sort((a, b) => avgRating(b) - avgRating(a))[0];
  if (young) out.push({ label: 'Mejor joven', p: young, stat: `${gs.season - young.born} años · nota ${avgRating(young).toFixed(2)}` });
  return out;
}
