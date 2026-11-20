'use client';
import React, { useState } from 'react';
import { useGame } from '../GameApp';
import { Crest, FormDots } from '../ui';
import { compName, dateLabel, isEuro, table, seasonLabel } from '@/game/calendar';
import type { Fixture } from '@/game/types';
import { contSpots, winnerOf } from '@/game/season';

export default function Competitions() {
  const { gs, openPlayer } = useGame();
  const me = gs.clubs[gs.manager.clubId];
  const [comp, setComp] = useState(me.leagueId);
  const [round, setRound] = useState<number | null>(null);
  const isLeague = !!gs.leagues[comp];
  const fx = gs.fixtures.filter(f => f.comp === comp);
  const rounds = Array.from(new Set(fx.map(f => f.round))).sort((a, b) => a - b);
  const current = round ?? (rounds.find(r => fx.some(f => f.round === r && !f.played)) ?? rounds[rounds.length - 1]);
  const scorers = (() => {
    const cnt: Record<number, number> = {};
    for (const f of fx) for (const s of f.scorers ?? []) cnt[s.pid] = (cnt[s.pid] ?? 0) + 1;
    return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([id, n]) => ({ p: gs.players[+id], n })).filter(x => x.p);
  })();

  return (
    <div className="col">
      <div className="panel tight row wrap">
        <select value={comp} onChange={e => { setComp(e.target.value); setRound(null); }}>
          {(() => {
            const byCountry = new Map<string, typeof gs.leagues[string][]>();
            for (const l of Object.values(gs.leagues).sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id))) { const k = l.countryName ?? l.country; byCountry.set(k, [...(byCountry.get(k) ?? []), l]); }
            const mine = gs.clubs[gs.manager.clubId].country;
            const keys = [...byCountry.keys()].sort((a, b) => Number(byCountry.get(b)![0].country === mine) - Number(byCountry.get(a)![0].country === mine));
            return keys.map(k => <optgroup key={k} label={k}>{byCountry.get(k)!.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</optgroup>);
          })()}
          <optgroup label="Copas continentales">{Object.values(gs.cups).filter(c => isEuro(c.id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
          <optgroup label="Copas nacionales">{Object.values(gs.cups).filter(c => !isEuro(c.id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
        </select>
        <span className="muted small">Temporada {seasonLabel(gs.season)}</span>
      </div>
      <div className="panel tight row wrap comp-chips">
        {[me.leagueId, 'cup_' + me.country, 'euro', 'euro2', 'euro3', 'sud'].filter(id => gs.leagues[id] || gs.cups[id]).map(id => {
          const c = gs.cups[id]; const inIt = !c || c.alive.includes(me.id) || gs.fixtures.some(f => f.comp === id && (f.home === me.id || f.away === me.id));
          return <button key={id} className={`btn sm ${comp === id ? 'active' : ''}`} onClick={() => { setComp(id); setRound(null); }}>{compIcon(id)} {compName(gs, id)}{c && inIt ? (c.alive.includes(me.id) && !c.done ? ' · vivos' : c.winner === me.id ? ' · 🏆' : ' · fuera') : ''}</button>;
        })}
        {gs.cups[comp]?.winner && <span className="pill good">🏆 Campeón: {gs.clubs[gs.cups[comp].winner!].name}</span>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <div className="col">
          {isLeague && <LeagueTable comp={comp} />}
          {!isLeague && gs.cups[comp] && <CupStatus comp={comp} />}
          {isEuro(comp) && gs.cups[comp]?.groups && (
            <div className="grid groups-grid">{gs.cups[comp].groups!.map((g, i) => (
              <div className="panel tight tablewrap" key={i}><h3>Grupo {'ABCDEFGH'[i]}</h3>
                <table className="t"><tbody>{table(gs, comp, g).map((r, j) => <tr key={r.id} className={r.id === me.id ? 'me' : ''}><td style={{ color: j < 2 ? 'var(--good)' : undefined }}>{j + 1}</td><td><span className="row" style={{ gap: 6 }}><Crest club={gs.clubs[r.id]} size={16} />{gs.clubs[r.id].name}</span></td><td className="r">{r.p}</td><td className="r">{r.gf - r.ga}</td><td className="r"><b>{r.pts}</b></td></tr>)}</tbody></table>
              </div>
            ))}</div>
          )}
          {!isLeague && <CupRounds comp={comp} />}
        </div>
        <div className="col">
          {isLeague && (
            <div className="panel">
              <div className="card-title"><h3 style={{ margin: 0 }}>Jornada {current}</h3>
                <div className="row"><button className="btn sm" onClick={() => setRound(Math.max(rounds[0], current - 1))}>◀</button><button className="btn sm" onClick={() => setRound(Math.min(rounds[rounds.length - 1], current + 1))}>▶</button></div></div>
              <table className="t"><tbody>{fx.filter(f => f.round === current).map(f => <FixtureRow key={f.id} f={f} />)}</tbody></table>
            </div>
          )}
          <div className="panel">
            <h3>Goleadores · {compName(gs, comp)}</h3>
            <table className="t"><tbody>{scorers.map(({ p, n }, i) => <tr key={p.id} className="click" onClick={() => openPlayer(p.id)}><td className="muted">{i + 1}</td><td>{p.name}</td><td className="small muted">{p.clubId ? gs.clubs[p.clubId].short : ''}</td><td className="r"><b>{n}</b></td></tr>)}</tbody></table>
            {!scorers.length && <div className="muted small">Aún no hay goles.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeagueTable({ comp }: { comp: string }) {
  const { gs } = useGame();
  const L = gs.leagues[comp];
  const rows = table(gs, comp);
  const me = gs.manager.clubId;
  return (
    <div className="panel tight tablewrap">
      <table className="t">
        <thead><tr><th>#</th><th>Equipo</th><th className="c">PJ</th><th className="c">G</th><th className="c">E</th><th className="c">P</th><th className="c">GF</th><th className="c">GC</th><th className="c">DG</th><th className="c">Pts</th><th>Forma</th></tr></thead>
        <tbody>{rows.map((r, i) => {
          const zone = L.tier === 1 ? (i < 4 ? 'var(--accent)' : i < L.euroSpots ? 'var(--blue)' : L.continent !== 'sa' && i < L.euroSpots + (L.euro2Spots ?? L.euroSpots) ? 'var(--cyan)' : L.continent !== 'sa' && gs.cups.euro3 && i < contSpots(L, 2)[0] + contSpots(L, 2)[1] ? '#b066ff' : i >= rows.length - L.relegate ? 'var(--bad)' : 'transparent') : (i < L.promote ? 'var(--good)' : L.relegate && i >= rows.length - L.relegate ? 'var(--bad)' : 'transparent');
          return (
            <tr key={r.id} className={r.id === me ? 'me' : ''}>
              <td style={{ borderLeft: `3px solid ${zone}` }}>{i + 1}</td>
              <td><span className="row" style={{ gap: 8 }}><Crest club={gs.clubs[r.id]} size={20} /><b>{gs.clubs[r.id].name}</b></span></td>
              <td className="c">{r.p}</td><td className="c">{r.w}</td><td className="c">{r.d}</td><td className="c">{r.l}</td><td className="c">{r.gf}</td><td className="c">{r.ga}</td><td className="c">{r.gf - r.ga}</td><td className="c"><b>{r.pts}</b></td><td><FormDots form={r.form} /></td>
            </tr>
          );
        })}</tbody>
      </table>
      <div className="small muted" style={{ padding: 8 }}>{L.tier === 1 ? <>▍<span style={{ color: 'var(--accent)' }}>Top 4</span> {L.continent === 'sa' ? <>▍<span style={{ color: 'var(--blue)' }}>Copa de Campeones de América (hasta {L.euroSpots}º)</span></> : <>▍<span style={{ color: 'var(--blue)' }}>Copa de Campeones (hasta {L.euroSpots}º)</span> ▍<span style={{ color: 'var(--cyan)' }}>Copa Continental (hasta {L.euroSpots + (L.euro2Spots ?? L.euroSpots)}º)</span>{gs.cups.euro3 && contSpots(L, 2)[1] > 0 && <> ▍<span style={{ color: '#b066ff' }}>Copa Conferencia (hasta {contSpots(L, 2)[0] + contSpots(L, 2)[1]}º)</span></>}</>}{L.relegate > 0 && <> ▍<span style={{ color: 'var(--bad)' }}>Descenso</span></>}</> : <>▍<span style={{ color: 'var(--good)' }}>Ascenso</span>{L.relegate > 0 && <> ▍<span style={{ color: 'var(--bad)' }}>Descenso</span></>}</>}</div>
    </div>
  );
}

const compIcon = (id: string) => (id.startsWith('cup_') ? '🏆' : id === 'euro' ? '⭐' : id === 'euro2' ? '🟠' : id === 'euro3' ? '🟣' : id === 'sud' ? '🌎' : '📊');

/** Where the cup stands: current round, clubs left and how the user's club is doing. */
function CupStatus({ comp }: { comp: string }) {
  const { gs } = useGame();
  const cup = gs.cups[comp]; const me = gs.manager.clubId;
  const mine = gs.fixtures.filter(f => f.comp === comp && (f.home === me || f.away === me));
  const next = mine.find(f => !f.played);
  const played = mine.filter(f => f.played);
  const state = cup.winner === me ? '🏆 ¡Campeones!' : !mine.length && !cup.alive.includes(me) ? 'No participas esta temporada.' : cup.alive.includes(me) && !cup.done ? 'Seguís vivos.' : `Eliminados${played.length ? ` en ${played[played.length - 1].roundName?.replace(/ · J\d+$/, '').replace(/^Grupo .*/, 'la fase de grupos') ?? ''}` : ''}.`;
  const stages = cup.rounds.map((r, i) => <span key={r} className={`pill ${i < cup.stage || cup.done ? 'good' : i === cup.stage ? 'blue' : ''}`}>{r}</span>);
  return (
    <div className="panel tight col">
      <div className="card-title"><h3 style={{ margin: 0 }}>{compIcon(comp)} {cup.name}</h3><span className="small muted">{cup.done ? 'Terminada' : `${cup.alive.length} equipos en liza`}</span></div>
      <div className="row wrap" style={{ gap: 6 }}>{stages}</div>
      <div className="small"><b>{state}</b>{next && <> Próximo: {gs.clubs[next.home === me ? next.away : next.home].name} ({next.home === me ? 'en casa' : 'fuera'}), {dateLabel(gs.season, next.date, false)} · {next.roundName}.</>}</div>
      {cup.winner && <div className="small">Campeón: <b>{gs.clubs[cup.winner].name}</b></div>}
    </div>
  );
}

function CupRounds({ comp }: { comp: string }) {
  const { gs } = useGame();
  const me = gs.manager.clubId;
  const fx = gs.fixtures.filter(f => f.comp === comp && !(isEuro(comp) && f.roundName?.startsWith('Grupo')));
  const names = Array.from(new Set(fx.map(f => f.roundName ?? ''))).reverse();
  if (!fx.length) return <div className="panel empty">{isEuro(comp) ? 'Las eliminatorias empiezan tras la fase de grupos.' : 'Sin partidos.'}</div>;
  return (
    <div className="col">{names.map(n => {
      const rfx = fx.filter(f => f.roundName === n);
      const ties = rfx.filter(f => !f.tieId || f.leg === 1);
      return (
        <div className="panel tight" key={n}><h3>{n}</h3>
          <div className="ties">{ties.map(f => {
            const l2 = f.tieId ? rfx.find(x => x.tieId === f.tieId && x.leg === 2) : undefined;
            const done = l2 ? !!l2.played : !!f.played;
            const w = done ? winnerOf(gs, l2 ?? f) : undefined;
            const agg = l2 && l2.played && f.played ? [f.hg! + l2.ag!, f.ag! + l2.hg!] : null;
            const side = (id: string, goals?: number) => <div className={`tie-side ${w === id ? 'win' : w ? 'out' : ''} ${id === me ? 'me' : ''}`}><Crest club={gs.clubs[id]} size={16} /><span className="grow">{gs.clubs[id].name}</span>{goals != null && <b className="num">{goals}</b>}</div>;
            return (
              <div className="tie" key={f.id}>
                {side(f.home, agg ? agg[0] : f.played ? f.hg : undefined)}
                {side(f.away, agg ? agg[1] : f.played ? f.ag : undefined)}
                <div className="small muted">{l2 ? <>Ida {f.played ? `${f.hg}-${f.ag}` : dateLabel(gs.season, f.date, false)} · Vuelta {l2.played ? `${l2.ag}-${l2.hg}` : dateLabel(gs.season, l2.date, false)}{(l2.pens) && ` · pen. ${l2.pens[1]}-${l2.pens[0]}`}</> : <>{f.played ? (f.pens ? `pen. ${f.pens[0]}-${f.pens[1]}` : 'Final del partido') : dateLabel(gs.season, f.date, false)}</>}</div>
              </div>
            );
          })}</div>
        </div>
      );
    })}</div>
  );
}

function FixtureRow({ f, showDate }: { f: Fixture; showDate?: boolean }) {
  const { gs } = useGame();
  const me = gs.manager.clubId;
  const h = gs.clubs[f.home], a = gs.clubs[f.away];
  return (
    <tr className={f.home === me || f.away === me ? 'me' : ''}>
      {showDate && <td className="small muted">{dateLabel(gs.season, f.date, false)}{f.leg ? ` · ${f.leg}ª` : ''}</td>}
      <td className="r"><span className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>{h.name}<Crest club={h} size={16} /></span></td>
      <td className="c"><b>{f.played ? `${f.hg} - ${f.ag}` : dateLabel(gs.season, f.date, false)}</b>{f.pens && <div className="small muted">pen. {f.pens[0]}-{f.pens[1]}</div>}</td>
      <td><span className="row" style={{ gap: 6 }}><Crest club={a} size={16} />{a.name}</span></td>
    </tr>
  );
}

function stageOf(gs: import('@/game/types').GameState, comp: string) { return gs.cups[comp]?.stage ?? 0; }
