'use client';
import React, { useState } from 'react';
import { useGame } from '../GameApp';
import { Crest, FormDots } from '../ui';
import { compName, dateLabel, isEuro, table, seasonLabel } from '@/game/calendar';
import type { Fixture } from '@/game/types';

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
        {gs.cups[comp]?.winner && <span className="pill good">🏆 Campeón: {gs.clubs[gs.cups[comp].winner!].name}</span>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <div className="col">
          {isLeague && <LeagueTable comp={comp} />}
          {isEuro(comp) && gs.cups[comp]?.groups && (
            <div className="grid g2">{gs.cups[comp].groups!.map((g, i) => (
              <div className="panel tight" key={i}><h3>Grupo {'ABCDEFGH'[i]}</h3>
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
          const zone = L.tier === 1 ? (i < 4 ? 'var(--accent)' : i < L.euroSpots ? 'var(--blue)' : L.continent !== 'sa' && i < L.euroSpots + (L.euro2Spots ?? L.euroSpots) ? 'var(--cyan)' : i >= rows.length - L.relegate ? 'var(--bad)' : 'transparent') : (i < L.promote ? 'var(--good)' : L.relegate && i >= rows.length - L.relegate ? 'var(--bad)' : 'transparent');
          return (
            <tr key={r.id} className={r.id === me ? 'me' : ''}>
              <td style={{ borderLeft: `3px solid ${zone}` }}>{i + 1}</td>
              <td><span className="row" style={{ gap: 8 }}><Crest club={gs.clubs[r.id]} size={20} /><b>{gs.clubs[r.id].name}</b></span></td>
              <td className="c">{r.p}</td><td className="c">{r.w}</td><td className="c">{r.d}</td><td className="c">{r.l}</td><td className="c">{r.gf}</td><td className="c">{r.ga}</td><td className="c">{r.gf - r.ga}</td><td className="c"><b>{r.pts}</b></td><td><FormDots form={r.form} /></td>
            </tr>
          );
        })}</tbody>
      </table>
      <div className="small muted" style={{ padding: 8 }}>{L.tier === 1 ? <>▍<span style={{ color: 'var(--accent)' }}>Top 4</span> {L.continent === 'sa' ? <>▍<span style={{ color: 'var(--blue)' }}>Copa de Campeones de América (hasta {L.euroSpots}º)</span></> : <>▍<span style={{ color: 'var(--blue)' }}>Copa de Campeones (hasta {L.euroSpots}º)</span> ▍<span style={{ color: 'var(--cyan)' }}>Copa Continental (hasta {L.euroSpots + (L.euro2Spots ?? L.euroSpots)}º)</span></>}{L.relegate > 0 && <> ▍<span style={{ color: 'var(--bad)' }}>Descenso</span></>}</> : <>▍<span style={{ color: 'var(--good)' }}>Ascenso</span>{L.relegate > 0 && <> ▍<span style={{ color: 'var(--bad)' }}>Descenso</span></>}</>}</div>
    </div>
  );
}

function CupRounds({ comp }: { comp: string }) {
  const { gs } = useGame();
  const fx = gs.fixtures.filter(f => f.comp === comp && !(isEuro(comp) && f.roundName?.startsWith('Grupo')));
  const names = Array.from(new Set(fx.map(f => f.roundName ?? '')));
  if (!fx.length) return <div className="panel empty">{isEuro(comp) ? 'Las eliminatorias empiezan tras la fase de grupos.' : 'Sin partidos.'}</div>;
  return (
    <div className="col">{names.map(n => (
      <div className="panel tight" key={n}><h3>{n}</h3><table className="t"><tbody>{fx.filter(f => f.roundName === n).map(f => <FixtureRow key={f.id} f={f} showDate />)}</tbody></table></div>
    ))}</div>
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
