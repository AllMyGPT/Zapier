'use client';
import React from 'react';
import { useGame } from '../GameApp';
import { Crest, Face, Flag, Ovr, PosBadge } from '../ui';
import { age, ovr } from '@/game/player';
import { fmtMoney, isUserFixture } from '@/game/season';
import { dateLabel } from '@/game/calendar';
import { MENTALITY_LABEL } from '@/game/tactics';
import { SCOUT_COST, applyTacticalAdvice, isKnownPlayer, missionDaysLeft, missionSlots, recommendTactics, reportPlayers, scoutOf, startMission } from '@/game/scout';

const PRESS = ['baja', 'media', 'alta'];
const WIDTH = ['estrecha', 'normal', 'abierta'];

/** Recommended setup against a rival, with a button to apply it to the first team. */
export function TacticAdvice({ rivalId }: { rivalId: string }) {
  const { gs, refresh, toast } = useGame();
  const rival = gs.clubs[rivalId];
  const adv = recommendTactics(gs, rivalId);
  return (
    <div className="panel tight col" style={{ gap: 6 }}>
      <b>Táctica recomendada contra {rival.name}</b>
      <div className="small">Sistema <b>{adv.formation}</b> · {MENTALITY_LABEL[adv.mentality]} · presión {PRESS[adv.pressing - 1]} · anchura {WIDTH[adv.width - 1]} · pase {adv.passing}</div>
      {adv.notes.map((n, i) => <div key={i} className="small muted">• {n}</div>)}
      <div><button className="btn sm primary" onClick={() => { toast(applyTacticalAdvice(gs, adv)); refresh(); }}>Aplicar a mi equipo</button></div>
    </div>
  );
}

export default function Scout() {
  const { gs, refresh, toast, openPlayer } = useGame();
  const s = scoutOf(gs);
  const me = gs.clubs[gs.manager.clubId];
  const slots = missionSlots(gs);
  const countries = [...new Map(Object.values(gs.leagues).map(l => [l.country, l.countryName ?? l.country] as const)).entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const leagues = Object.values(gs.leagues).filter(l => l.clubIds.length).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, 'es'));
  const clubs = Object.values(gs.clubs).filter(c => c.id !== me.id).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const nextFx = gs.fixtures.filter(f => !f.played && isUserFixture(gs, f)).sort((a, b) => a.date - b.date)[0];
  const rivalId = nextFx ? (nextFx.home === me.id ? nextFx.away : nextFx.home) : null;
  const go = (kind: 'pais' | 'liga' | 'club', id: string) => { toast(startMission(gs, kind, id)); refresh(); };
  const known = s.known.map(k => {
    const [kind, id] = k.split(':');
    if (kind === 'pais') return countries.find(c => c[0] === id)?.[1] ?? id;
    if (kind === 'liga') return gs.leagues[id]?.name ?? id;
    return gs.clubs[id]?.name ?? id;
  });

  return (
    <div className="col">
      <div className="grid g2">
        <div className="panel col" style={{ gap: 8 }}>
          <h3 style={{ margin: 0 }}>Misiones de ojeo</h3>
          <div className="small muted">Tienes {slots} ojeador{slots > 1 ? 'es' : ''} disponible{slots > 1 ? 's' : ''} a la vez. Cuando vuelven, el informe muestra a los mejores jóvenes del objetivo y esa zona pasa a ser conocida: verás el potencial exacto de sus jugadores.</div>
          {!s.missions.length && <div className="small">Ningún ojeador en el campo ahora mismo.</div>}
          {s.missions.map(m => (
            <div key={m.id} className="row" style={{ justifyContent: 'space-between' }}>
              <b>{m.label}</b><span className="pill">{missionDaysLeft(gs, m)} días</span>
            </div>
          ))}
          <div className="small muted">Conocido: {known.join(' · ')}</div>
        </div>
        <div className="panel col" style={{ gap: 8 }}>
          <h3 style={{ margin: 0 }}>Enviar ojeadores</h3>
          <div className="small muted">País {fmtMoney(SCOUT_COST.pais)} · liga {fmtMoney(SCOUT_COST.liga)} · club {fmtMoney(SCOUT_COST.club)}</div>
          <div className="scout-grid">
            {countries.map(([code, name]) => <button key={code} className="btn sm" onClick={() => go('pais', code)} disabled={s.known.includes(`pais:${code}`)}>{s.known.includes(`pais:${code}`) ? '✓ ' : ''}{name}</button>)}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>Ligas</div>
          <div className="scout-grid">
            {leagues.map(l => <button key={l.id} className="btn sm" onClick={() => go('liga', l.id)} disabled={s.known.includes(`liga:${l.id}`)}>{s.known.includes(`liga:${l.id}`) ? '✓ ' : ''}{l.name}</button>)}
          </div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            <select id="scout-club" defaultValue="">
              <option value="" disabled>Un club concreto…</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn sm" onClick={() => { const el = document.getElementById('scout-club') as HTMLSelectElement | null; if (el?.value) go('club', el.value); }}>Ojear club</button>
          </div>
        </div>
      </div>

      {rivalId && nextFx && (
        <div className="col" style={{ gap: 6 }}>
          <div className="small muted">Próximo partido: {gs.clubs[rivalId].name} · {dateLabel(gs.season, nextFx.date)}</div>
          <TacticAdvice rivalId={rivalId} />
        </div>
      )}

      <div className="panel col" style={{ gap: 8 }}>
        <h3 style={{ margin: 0 }}>Informes</h3>
        {!s.reports.length && <div className="empty">Aún no hay informes. Envía un ojeador para descubrir talentos.</div>}
        {s.reports.map(r => {
          const ps = reportPlayers(gs, r);
          return (
            <div key={r.id} className="col" style={{ gap: 4 }}>
              <b>{r.title}</b><span className="small muted">Temporada {r.season}/{(r.season + 1) % 100} · {ps.length} jugadores</span>
              <div className="tablewrap">
                <table className="t">
                  <thead><tr><th>Jugador</th><th>Pos</th><th className="c">Edad</th><th className="c">Med</th><th className="c">Pot</th><th>Club</th></tr></thead>
                  <tbody>
                    {ps.map(p => {
                      const known = isKnownPlayer(gs, p);
                      return (
                        <tr key={p.id} className="click" onClick={() => openPlayer(p.id)}>
                          <td><Face p={p} /><Flag nat={p.nat} /><b>{p.name}</b></td>
                          <td><PosBadge pos={p.pos} /></td>
                          <td className="c num">{age(p, gs.season)}</td>
                          <td className="c"><Ovr v={ovr(p)} /></td>
                          <td className="c num">{known ? p.pot : `≈ ${Math.round(p.pot / 5) * 5}`}</td>
                          <td>{p.clubId && gs.clubs[p.clubId] ? <span className="row" style={{ gap: 4 }}><Crest club={gs.clubs[p.clubId]} size={18} />{gs.clubs[p.clubId].short}</span> : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
