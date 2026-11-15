'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Fixture, GameState } from '@/game/types';
import { advance, endSeason, fmtMoney, simFixture, buildMatch, applyResult } from '@/game/season';
import { compName, dateLabel, seasonLabel, table, inWindow } from '@/game/calendar';
import { Crest, Modal } from './ui';
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
import PlayerModal from './PlayerModal';
import MatchView from './MatchView';
import { saveLocal } from '@/lib/storage';
import { runToEnd, type Match } from '@/game/engine';
import { ensureLineup } from '@/game/lineup';

export type Tab = 'office' | 'squad' | 'tactics' | 'training' | 'transfers' | 'finances' | 'club' | 'comps' | 'save';
interface Ctx { gs: GameState; v: number; refresh: () => void; toast: (s: string) => void; openPlayer: (id: number) => void; goto: (t: Tab) => void; setGs: (g: GameState | null) => void }
const GameCtx = createContext<Ctx | null>(null);
export const useGame = () => useContext(GameCtx)!;

const NAV: [Tab, string, string][] = [
  ['office', '🏠', 'Despacho'], ['squad', '👥', 'Plantilla'], ['tactics', '📋', 'Tácticas'], ['training', '🏃', 'Entrenamiento'],
  ['transfers', '🔁', 'Fichajes'], ['finances', '💶', 'Finanzas'], ['club', '🏟️', 'Club'], ['comps', '🏆', 'Competiciones'], ['save', '💾', 'Partida'],
];

export default function GameApp() {
  const [gs, setGsState] = useState<GameState | null>(null);
  const [v, setV] = useState(0);
  const [tab, setTab] = useState<Tab>('office');
  const [toastMsg, setToast] = useState<string | null>(null);
  const [player, setPlayer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [pre, setPre] = useState<Fixture | null>(null);
  const [match, setMatch] = useState<{ m: Match; f: Fixture } | null>(null);
  const [summary, setSummary] = useState<{ f: Fixture; m: Match } | null>(null);
  const [seasonEnd, setSeasonEnd] = useState<string[] | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout>>();

  const refresh = useCallback(() => setV(x => x + 1), []);
  const toast = useCallback((s: string) => { setToast(s); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 3800); }, []);
  const setGs = useCallback((g: GameState | null) => { setGsState(g); setTab('office'); setV(x => x + 1); }, []);

  useEffect(() => { if (gs && v % 1 === 0) { const t = setTimeout(() => { saveLocal(gs, 0); }, 400); return () => clearTimeout(t); } }, [gs, v]);

  if (!gs) return <TitleScreen onStart={g => setGs(g)} />;
  const club = gs.clubs[gs.manager.clubId];
  const unread = gs.news.filter(n => !n.read).length;
  const pendingOffers = gs.offers.filter(o => o.incoming && o.status === 'pending').length;

  const doContinue = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      const r = advance(gs);
      setBusy(false);
      if (r.type === 'match') { setPre(r.fixture); }
      else if (r.type === 'seasonEnd') { const s = endSeason(gs); setSeasonEnd(s); }
      else if (r.type === 'sacked') { /* handled by office banner */ setTab('office'); }
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
      <div className="shell">
        <aside className="side">
          <div className="brand">PIZARRA<span>·CM</span></div>
          {NAV.map(([k, ic, label]) => (
            <button key={k} className={`nav ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
              <span className="ic">{ic}</span>{label}
              {k === 'office' && unread > 0 && <span className="badge">{unread}</span>}
              {k === 'transfers' && pendingOffers > 0 && <span className="badge">{pendingOffers}</span>}
            </button>
          ))}
          <div className="foot grow" />
          <div className="foot small muted" style={{ padding: 8 }}>Temporada {seasonLabel(gs.season)}<br />{gs.manager.name}</div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div className="club"><Crest club={club} size={46} /><div><h2>{club.name}</h2><div className="muted small">{L.name} · {pos}º · {dateLabel(gs.season, gs.day)}</div></div></div>
            <div className="row wrap" style={{ gap: 0 }}>
              <div className="stat"><b className="num">{fmtMoney(club.balance)}</b><span>Saldo</span></div>
              <div className="stat"><b className="num">{fmtMoney(club.transferBudget)}</b><span>Fichajes</span></div>
              <div className="stat"><b className="num" style={{ color: gs.manager.board > 60 ? 'var(--good)' : gs.manager.board > 30 ? 'var(--warn)' : 'var(--bad)' }}>{Math.round(gs.manager.board)}%</b><span>Directiva</span></div>
              <div className="stat"><b style={{ color: inWindow(gs.day) ? 'var(--good)' : 'var(--muted)', fontSize: 14, paddingTop: 4 }}>{inWindow(gs.day) ? 'ABIERTO' : 'CERRADO'}</b><span>Mercado</span></div>
            </div>
            <div className="right">
              <button className="btn primary big" onClick={doContinue} disabled={busy || !!gs.manager.sacked}>{busy ? <span className="spin" /> : 'Continuar ▶'}</button>
            </div>
          </div>
          {tab === 'office' && <Office />}
          {tab === 'squad' && <Squad />}
          {tab === 'tactics' && <TacticsScreen />}
          {tab === 'training' && <TrainingScreen />}
          {tab === 'transfers' && <Transfers />}
          {tab === 'finances' && <Finances />}
          {tab === 'club' && <ClubScreen />}
          {tab === 'comps' && <Competitions />}
          {tab === 'save' && <SaveScreen />}
        </main>
      </div>

      {player != null && gs.players[player] && <PlayerModal id={player} onClose={() => { setPlayer(null); refresh(); }} />}

      {pre && (() => {
        const opp = gs.clubs[pre.home === club.id ? pre.away : pre.home];
        const home = gs.clubs[pre.home], away = gs.clubs[pre.away];
        return (
          <Modal onClose={() => setPre(null)}>
            <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Día de partido · {compName(gs, pre.comp)} {pre.roundName ?? `· Jornada ${pre.round}`}</div>
            <div className="row" style={{ justifyContent: 'center', gap: 30, margin: '22px 0' }}>
              <div className="col" style={{ alignItems: 'center' }}><Crest club={home} size={80} /><h2>{home.name}</h2></div>
              <h1 className="muted">VS</h1>
              <div className="col" style={{ alignItems: 'center' }}><Crest club={away} size={80} /><h2>{away.name}</h2></div>
            </div>
            <p className="muted" style={{ textAlign: 'center' }}>{home.stadium} · Rival: {opp.name} ({opp.tactics.formation})</p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
              <button className="btn" onClick={() => { setPre(null); setTab('tactics'); }}>Revisar tácticas</button>
              <button className="btn" onClick={() => startMatch(false)}>Resultado rápido</button>
              <button className="btn primary big" onClick={() => startMatch(true)}>Jugar en directo ▶</button>
            </div>
          </Modal>
        );
      })()}

      {match && <MatchView m={match.m} f={match.f} onFinish={finishMatch} />}

      {summary && <MatchSummary f={summary.f} m={summary.m} onClose={() => setSummary(null)} />}

      {seasonEnd && (
        <Modal onClose={() => setSeasonEnd(null)}>
          <h1>Fin de temporada</h1>
          <p className="muted">Comienza la temporada {seasonLabel(gs.season)}. Se ha abierto el mercado de verano y ha llegado una nueva hornada de juveniles.</p>
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
      <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>{compName(gs, f.comp)} · Final</div>
      <div className="row" style={{ justifyContent: 'center', gap: 24, margin: '14px 0' }}>
        <Crest club={h} size={56} /><h2>{h.name}</h2>
        <h1 style={{ fontSize: 48 }}>{f.hg} - {f.ag}</h1>
        <h2>{a.name}</h2><Crest club={a} size={56} />
      </div>
      {f.pens && <p style={{ textAlign: 'center' }} className="muted">Penaltis: {f.pens[0]} - {f.pens[1]}</p>}
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
