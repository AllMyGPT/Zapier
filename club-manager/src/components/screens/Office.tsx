'use client';
import React, { useMemo, useState } from 'react';
import { useGame } from '../GameApp';
import { Crest, FormDots, Bar } from '../ui';
import { compName, dateLabel, table } from '@/game/calendar';
import { expectationLabel, expectedPos, fmtMoney, news, strengthOf, objectiveStatus, setObjectives } from '@/game/season';
import { clubPlayers } from '@/game/lineup';
import { ovr, avgRating } from '@/game/player';

export default function Office() {
  const { gs, refresh, goto, openPlayer, toast } = useGame();
  const club = gs.clubs[gs.manager.clubId];
  const [open, setOpen] = useState<number | null>(null);
  const L = gs.leagues[club.leagueId];
  const rows = table(gs, L.id);
  const myIdx = rows.findIndex(r => r.id === club.id);
  const slice = rows.slice(Math.max(0, Math.min(myIdx - 3, rows.length - 7)), Math.max(7, Math.min(rows.length, myIdx + 4)));
  const upcoming = gs.fixtures.filter(f => !f.played && (f.home === club.id || f.away === club.id)).sort((a, b) => a.date - b.date).slice(0, 5);
  const recent = gs.fixtures.filter(f => f.played && (f.home === club.id || f.away === club.id)).sort((a, b) => b.date - a.date).slice(0, 5);
  const squad = clubPlayers(gs, club.id);
  const best = squad.filter(p => p.stats.apps >= 2).sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 3);
  const top = squad.slice().sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3);

  const jobs = useMemo(() => {
    if (!gs.manager.sacked) return [];
    return Object.values(gs.clubs).filter(c => c.id !== club.id && c.reputation <= gs.manager.reputation + 8).sort((a, b) => b.reputation - a.reputation).slice(0, 12).filter((_, i) => i % 3 === 0 || i < 2).slice(0, 4);
  }, [gs, club.id]);

  const takeJob = (id: string) => {
    gs.manager.clubId = id; gs.manager.sacked = false; gs.manager.board = 60; gs.finance = []; gs.offers = gs.offers.filter(o => o.status === "done"); gs.shortlist = [];
    news(gs, 'board', `Nuevo reto: ${gs.clubs[id].name}`, `Firmas como nuevo entrenador. Objetivo: ${expectationLabel(gs, id)}.`);
    setObjectives(gs);
    toast(`Eres el nuevo entrenador del ${gs.clubs[id].name}`); refresh();
  };

  return (
    <div className="col" style={{ gap: 14 }}>
      {gs.manager.sacked && (
        <div className="panel" style={{ borderColor: 'var(--bad)' }}>
          <h2>Has sido destituido</h2>
          <p className="muted">Pero tu nombre suena en otros banquillos. Estas son las ofertas que tienes sobre la mesa:</p>
          <div className="grid g4">{jobs.map(c => (
            <button key={c.id} className="club-card" onClick={() => takeJob(c.id)}><Crest club={c} size={34} /><div><b>{c.name}</b><div className="small muted">{gs.leagues[c.leagueId].name}</div></div></button>
          ))}</div>
        </div>
      )}
      <div className="grid g3">
        <div className="panel nextmatch">
          <h3>Próximo partido</h3>
          <div className="nm-bg" />
          {upcoming[0] ? (() => {
            const f = upcoming[0]; const h = gs.clubs[f.home], a = gs.clubs[f.away];
            return (
              <div className="col" style={{ alignItems: 'center' }}>
                <div className="small muted">{compName(gs, f.comp)} · {f.roundName ?? `Jornada ${f.round}`}</div>
                <div className="row" style={{ gap: 18, margin: '10px 0' }}><Crest club={h} size={62} /><span className="vs-big" style={{ fontSize: 34 }}>VS</span><Crest club={a} size={62} /></div>
                <b>{h.name} – {a.name}</b>
                <div className="small muted">{dateLabel(gs.season, f.date)}</div>
                <button className="btn sm" style={{ marginTop: 8 }} onClick={() => goto('tactics')}>Preparar alineación</button>
              </div>
            );
          })() : <div className="empty">Sin partidos pendientes</div>}
        </div>
        <div className="panel">
          <h3>Directiva</h3>
          <Gauge v={gs.manager.board} />
          <div className="small">Objetivo: <b>{expectationLabel(gs, club.id)}</b> (puesto esperado {expectedPos(gs, club.id)}º)</div>
          <div className="small muted" style={{ marginTop: 6 }}>Reputación del mánager: {Math.round(gs.manager.reputation)} · Afición: {Math.round(club.fans)}%</div>
          <div style={{ marginTop: 10 }}><span className="small muted">Últimos resultados: </span><FormDots form={(gs.lastResults ?? []).map(r => (r > 0 ? 'V' : r < 0 ? 'D' : 'E'))} /></div>
          <div className="small muted" style={{ marginTop: 6 }}>Nivel medio del once: {strengthOf(gs, club.id).toFixed(1)}</div>
          {objectiveStatus(gs).length > 0 && <div className="objs">{objectiveStatus(gs).map(o => <div key={o.label} className={`obj ${o.state}`}><i>{o.state === 'ok' ? '✓' : o.state === 'bad' ? '✕' : '…'}</i>{o.label}</div>)}</div>}
        </div>
        <div className="panel">
          <h3>{L.name}</h3>
          <table className="t"><tbody>{slice.map(r => {
            const i = rows.indexOf(r);
            return <tr key={r.id} className={r.id === club.id ? 'me' : ''}><td className="num">{i + 1}</td><td><span className="row" style={{ gap: 6 }}><Crest club={gs.clubs[r.id]} size={16} />{gs.clubs[r.id].name}</span></td><td className="r num">{r.p}</td><td className="r num"><b>{r.pts}</b></td></tr>;
          })}</tbody></table>
          <button className="btn sm" style={{ marginTop: 8 }} onClick={() => goto('comps')}>Ver clasificación</button>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        <div className="panel">
          <div className="card-title"><h3 style={{ margin: 0 }}>Bandeja de entrada</h3><button className="btn sm" onClick={() => { gs.news.forEach(n => (n.read = true)); refresh(); }}>Marcar todo leído</button></div>
          <div className="col scroll" style={{ gap: 6 }}>
            {gs.news.slice(0, 40).map(n => (
              <div key={n.id} className={`news-item ${n.read ? '' : 'unread'}`} onClick={() => { n.read = true; setOpen(open === n.id ? null : n.id); refresh(); }}>
                <div className="row"><span className={`nicon ${n.kind}`}>{({ board: '🏛️', transfer: '🔁', injury: '🩹', match: '⚽', club: '🏟️', youth: '🌱', info: '📰' } as Record<string, string>)[n.kind]}</span><b className="grow">{n.title}</b><span className="small muted">{dateLabel(gs.season, n.date, false)}</span></div>
                {open === n.id && n.body && <div className="small" style={{ marginTop: 6, color: '#c8d5ec' }}>{n.body}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="col">
          <div className="panel">
            <h3>Calendario</h3>
            <table className="t"><tbody>
              {recent.slice().reverse().map(f => <FxRow key={f.id} id={f.id} />)}
              {upcoming.map(f => <FxRow key={f.id} id={f.id} />)}
            </tbody></table>
          </div>
          <div className="grid g2">
            <div className="panel tight"><h3>Mejores notas</h3>{best.map(p => <div key={p.id} className="row small" style={{ cursor: 'pointer' }} onClick={() => openPlayer(p.id)}><span className="grow">{p.name}</span><b>{avgRating(p).toFixed(2)}</b></div>)}{!best.length && <div className="small muted">—</div>}</div>
            <div className="panel tight"><h3>Goleadores</h3>{top.map(p => <div key={p.id} className="row small" style={{ cursor: 'pointer' }} onClick={() => openPlayer(p.id)}><span className="grow">{p.name}</span><b>{p.stats.goals}</b></div>)}</div>
          </div>
          <div className="panel tight small muted">Saldo {fmtMoney(club.balance)} · Masa salarial {fmtMoney(squad.reduce((a, p) => a + p.wage, 0))}/sem · Media plantilla {Math.round(squad.reduce((a, p) => a + ovr(p), 0) / squad.length)}</div>
        </div>
      </div>
    </div>
  );
}

function FxRow({ id }: { id: number }) {
  const { gs } = useGame();
  const f = gs.fixtures.find(x => x.id === id)!;
  const me = gs.manager.clubId;
  const home = f.home === me;
  const opp = gs.clubs[home ? f.away : f.home];
  let res = '';
  let cls = '';
  if (f.played) {
    const my = home ? f.hg! : f.ag!, ot = home ? f.ag! : f.hg!;
    res = `${f.hg}-${f.ag}${f.pens ? ` (p ${f.pens[0]}-${f.pens[1]})` : ''}`;
    cls = my > ot ? 'good' : my < ot ? 'bad' : '';
  }
  return (
    <tr>
      <td className="small muted">{dateLabel(gs.season, f.date, false)}</td>
      <td className="small muted">{home ? 'C' : 'F'}</td>
      <td><span className="row" style={{ gap: 6 }}><Crest club={opp} size={16} />{opp.name}</span></td>
      <td className="small muted">{compName(gs, f.comp).split(' ').slice(0, 2).join(' ')}</td>
      <td className="r">{f.played ? <span className={`pill ${cls}`}>{res}</span> : <span className="small muted">—</span>}</td>
    </tr>
  );
}

/** Semicircular board-confidence gauge. */
function Gauge({ v }: { v: number }) {
  const pct = Math.max(0, Math.min(100, v));
  const color = pct > 60 ? '#3ddc84' : pct > 30 ? '#ffb020' : '#ff5468';
  const ang = Math.PI * (1 - pct / 100);
  const R = 62, cx = 75, cy = 72;
  const x = cx + R * Math.cos(ang), y = cy - R * Math.sin(ang);
  return (
    <div className="gauge">
      <svg viewBox="0 0 150 82">
        <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#ff5468" /><stop offset=".5" stopColor="#ffb020" /><stop offset="1" stopColor="#3ddc84" /></linearGradient></defs>
        <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="url(#gg)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${Math.PI * R * pct / 100} 999`} />
        <circle cx={x} cy={y} r="7" fill="#fff" stroke={color} strokeWidth="3" />
      </svg>
      <div className="val"><span className="kpi" style={{ color }}>{Math.round(pct)}%</span></div>
    </div>
  );
}
