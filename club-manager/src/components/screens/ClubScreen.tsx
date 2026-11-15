'use client';
import React from 'react';
import { useGame } from '../GameApp';
import { Crest, Stars } from '../ui';
import { fmtMoney, money } from '@/game/season';
import { seasonLabel } from '@/game/calendar';
import type { Staff } from '@/game/types';

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
        <div className="panel"><h3>Palmarés (en tu partida)</h3>{trophies.length ? trophies.map((t, i) => <div key={i}>🏆 {t.comp} {seasonLabel(t.season)}</div>) : <div className="muted small">Sin títulos todavía.</div>}</div>
        <div className="panel"><h3>Carrera de {gs.manager.name}</h3>{gs.manager.history.length ? <table className="t"><tbody>{gs.manager.history.map((h, i) => <tr key={i}><td>{seasonLabel(h.season)}</td><td>{h.club}</td><td>{h.league}</td><td>{h.pos}º</td><td>{h.trophies.join(', ')}</td></tr>)}</tbody></table> : <div className="muted small">Primera temporada en curso.</div>}</div>
      </div>
    </div>
  );
}
