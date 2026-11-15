'use client';
import React from 'react';
import { useGame } from '../GameApp';
import { Crest, Stars } from '../ui';
import { fmtMoney, money } from '@/game/season';
import { seasonLabel } from '@/game/calendar';
import type { Staff } from '@/game/types';
import { sponsorOffers, signSponsor, namingOffer, sellNaming, GOAL_LABEL } from '@/game/sponsors';

const STAFF: [keyof Staff, string, string][] = [
  ['coach', 'Segundo entrenador', 'Multiplica la progresión de los jugadores en los entrenamientos.'],
  ['fitness', 'Preparador físico', 'Recuperación física diaria más rápida.'],
  ['physio', 'Fisioterapeuta', 'Reduce la duración de las lesiones.'],
  ['gk', 'Entrenador de porteros', 'Mejora el progreso de los porteros.'],
  ['scout', 'Ojeador', 'Información más precisa del potencial de jugadores ajenos.'],
  ['youth', 'Director de cantera', 'Mejores juveniles en cada hornada anual.'],
];
const EXP = [[2000, 6_000_000, 90], [5000, 16_000_000, 150], [10000, 36_000_000, 240]];

export default function ClubScreen() {
  const { gs, refresh, toast } = useGame();
  const club = gs.clubs[gs.manager.clubId];
  const trophies = gs.trophies.filter(t => t.club === club.id);
  const priceRef = Math.round(15 + Math.pow(club.reputation / 100, 3) * 70);
  return (
    <div className="col">
      <div className="grid g2">
        <div className="panel">
          <div className="row"><Crest club={club} size={70} /><div><h2>{club.name}</h2><div className="muted">{club.city} · Reputación <Stars v={(club.reputation - 50) / 9} /></div></div></div>
          <div className="grid g2" style={{ marginTop: 14 }}>
            <div><div className="small muted">Estadio</div><b>{club.stadium}</b></div>
            <div><div className="small muted">Aforo</div><b>{club.capacity.toLocaleString('es-ES')}</b></div>
            <div><div className="small muted">Patrocinador</div><b>{club.sponsor.name}</b> <span className="small muted">({fmtMoney(club.sponsor.weekly)}/sem hasta {club.sponsor.until + 1})</span></div>
            <div><div className="small muted">Afición</div><b>{Math.round(club.fans)}%</b></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="small muted">Precio medio de la entrada: <b>{club.ticketPrice} €</b> (referencia para tu club: {priceRef} €)</div>
            <input type="range" min={5} max={200} value={club.ticketPrice} onChange={e => { club.ticketPrice = +e.target.value; refresh(); }} style={{ width: '100%' }} />
            <div className="small muted">Precios altos reducen la asistencia; precios bajos llenan el estadio y animan a la afición.</div>
          </div>
        </div>
        <div className="panel">
          <h3>Ampliar estadio</h3>
          {club.expansion ? <div>Obras en curso: +{club.expansion.seats.toLocaleString('es-ES')} asientos · faltan {club.expansion.daysLeft} días.</div> : (
            <div className="col">{EXP.map(([seats, cost, days]) => (
              <div key={seats} className="row news-item" style={{ cursor: 'default' }}>
                <div className="grow"><b>+{seats.toLocaleString('es-ES')} asientos</b><div className="small muted">{fmtMoney(cost)} · {days} días</div></div>
                <button className="btn sm" disabled={club.balance < cost} onClick={() => { money(gs, club.id, -cost, `Obras estadio (+${seats})`); club.expansion = { seats, daysLeft: days }; toast('Obras iniciadas'); refresh(); }}>Construir</button>
              </div>
            ))}</div>
          )}
        </div>
      </div>
      <div className="panel">
        <h3>Personal</h3>
        <div className="grid g3">
          {STAFF.map(([k, label, desc]) => {
            const lvl = club.staff[k];
            const cost = (lvl + 1) * (lvl + 1) * 400_000;
            return (
              <div key={k} className="news-item" style={{ cursor: 'default' }}>
                <div className="row"><b className="grow">{label}</b><Stars v={lvl} /></div>
                <div className="small muted" style={{ margin: '4px 0 8px' }}>{desc} Sueldo: {fmtMoney(lvl * lvl * 6000)}/sem.</div>
                <div className="row">
                  {lvl < 5 && <button className="btn sm" disabled={club.balance < cost} onClick={() => { club.staff[k]++; money(gs, club.id, -cost, `Contratación personal (${label})`); toast(`${label} mejorado a nivel ${club.staff[k]}`); refresh(); }}>Mejorar ({fmtMoney(cost)})</button>}
                  {lvl > 1 && <button className="btn sm ghost" onClick={() => { club.staff[k]--; refresh(); }}>Abaratar</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid g2">
        <div className="panel"><h3>Patrocinio y comercial</h3>
          <div className="small">Camiseta: <b>{club.sponsor.name}</b> · {fmtMoney(club.sponsor.weekly)}/sem hasta {club.sponsor.until + 1}{club.sponsor.bonus ? ` · bonus ${fmtMoney(club.sponsor.bonus.amount)} si ${GOAL_LABEL[club.sponsor.bonus.goal]}` : ''}</div>
          {club.sponsor.until <= gs.season ? (
            <div className="col" style={{ gap: 6, marginTop: 10 }}>
              <span className="small muted">Tu contrato termina este verano. Elige el próximo patrocinador:</span>
              {sponsorOffers(gs, club).map(o => (
                <div key={o.id} className="news-item row wrap" style={{ cursor: 'default' }}>
                  <div className="grow"><b>{o.name}</b> · {fmtMoney(o.weekly)}/sem · {o.years} temporadas{o.bonus ? ` · bonus ${fmtMoney(o.bonus.amount)}` : ''}<div className="small muted">{o.pitch}</div></div>
                  <button className="btn sm primary" onClick={() => { toast(signSponsor(gs, club, o)); refresh(); }}>Firmar</button>
                </div>
              ))}
            </div>
          ) : <div className="small muted" style={{ marginTop: 6 }}>En el último año de contrato podrás elegir entre tres ofertas.</div>}
          {!club.naming && (() => { const n = namingOffer(gs, club); return (
            <div className="news-item row wrap" style={{ cursor: 'default', marginTop: 10 }}>
              <div className="grow"><b>Vender el nombre del estadio</b> a {n.brand}: «{n.name}»<div className="small muted">{fmtMoney(n.upfront)} al firmar + {fmtMoney(n.weekly)}/sem. A la afición no le gustará.</div></div>
              <button className="btn sm danger" onClick={() => { if (confirm(`¿Rebautizar el estadio como ${n.name}?`)) { toast(sellNaming(gs, club)); refresh(); } }}>Vender</button>
            </div>); })()}
        </div>
        <div className="panel cabinet"><h3>Vitrina del club (en tu partida)</h3>
          <div className="shelf">
            {trophies.length ? trophies.map((t, i) => <div className="cup" key={i} style={{ animationDelay: `${i * 0.06}s` }}><Cup kind={t.comp} /><div className="cn">{t.comp}</div><div className="cs">{seasonLabel(t.season)}</div></div>) : <div className="empty-shelf">La vitrina espera su primer título.</div>}
          </div>
        </div>
        <div className="panel"><h3>Carrera de {gs.manager.name}</h3>
          <div className="career-kpis">
            <div className="statbox"><span>Temporadas</span><b>{gs.manager.history.length + 1}</b></div>
            <div className="statbox"><span>Títulos</span><b>{gs.manager.history.reduce((a, h) => a + h.trophies.length, 0) + gs.trophies.filter(t => t.club === club.id && t.season === gs.season).length}</b></div>
            <div className="statbox"><span>Mejor puesto</span><b>{gs.manager.history.length ? `${Math.min(...gs.manager.history.map(h => h.pos))}º` : '—'}</b></div>
            <div className="statbox"><span>Reputación</span><b>{Math.round(gs.manager.reputation)}</b></div>
          </div>{gs.manager.history.length ? <table className="t"><tbody>{gs.manager.history.map((h, i) => <tr key={i}><td>{seasonLabel(h.season)}</td><td>{h.club}</td><td>{h.league}</td><td>{h.pos}º</td><td>{h.trophies.join(', ')}</td></tr>)}</tbody></table> : <div className="muted small">Primera temporada en curso.</div>}</div>
      </div>
    </div>
  );
}

/** Trophy silhouette: league shields are wide plates, cups are tall chalices. */
function Cup({ kind }: { kind: string }) {
  const league = /liga|league|serie|bundes|ligue|division|división/i.test(kind) && !/copa|cup|coupe|pokal|coppa|campeones/i.test(kind);
  const gold = !/segunda|2\.|championship|serie b|ligue 2/i.test(kind);
  const a = gold ? '#fff2b0' : '#f1f5fb', b = gold ? '#d4a017' : '#9aa8bf', c = gold ? '#8a6408' : '#5d6b82';
  return (
    <svg viewBox="0 0 54 64" aria-hidden="true">
      <defs><linearGradient id={`cg${kind.length}${gold ? 1 : 0}`} x1="0" x2="1"><stop offset="0" stopColor={c} /><stop offset=".35" stopColor={a} /><stop offset=".6" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient></defs>
      {league ? (
        <g fill={`url(#cg${kind.length}${gold ? 1 : 0})`}><ellipse cx="27" cy="26" rx="22" ry="22" /><ellipse cx="27" cy="26" rx="14" ry="14" fill={c} opacity=".35" /><rect x="22" y="46" width="10" height="8" /><rect x="12" y="54" width="30" height="8" rx="2" /></g>
      ) : (
        <g fill={`url(#cg${kind.length}${gold ? 1 : 0})`}><path d="M12 4h30v14c0 10-7 18-15 18S12 28 12 18z" /><path d="M12 8H5c0 9 4 14 9 15M42 8h7c0 9-4 14-9 15" fill="none" stroke={b} strokeWidth="3" /><rect x="23" y="35" width="8" height="12" /><rect x="14" y="47" width="26" height="6" rx="1" /><rect x="11" y="53" width="32" height="9" rx="2" /></g>
      )}
    </svg>
  );
}
