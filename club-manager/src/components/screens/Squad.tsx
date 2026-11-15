'use client';
import React, { useState } from 'react';
import { useGame } from '../GameApp';
import { Ovr, PosBadge, Flag, Bar, useSort, Stars, PlayerCard, Face } from '../ui';
import { clubPlayers } from '@/game/lineup';
import { age, avgRating, marketValue, ovr, playerStatus, POS_ORDER } from '@/game/player';
import { fmtMoney } from '@/game/season';
import type { Player } from '@/game/types';

export function potStars(p: Player, scout: number, own: boolean) {
  const noise = own ? 0 : (6 - scout) * 1.5;
  return { mid: (p.pot - 55) / 7, unc: noise / 7 };
}

export default function Squad() {
  const { gs, openPlayer } = useGame();
  const [view, setView] = useState<'first' | 'youth'>('first');
  const [mode, setMode] = useState<'table' | 'cards'>('table');
  const club = gs.clubs[gs.manager.clubId];
  const players = clubPlayers(gs, club.id, true).filter(p => (view === 'youth' ? p.youth : !p.youth));
  const { sorted, th } = useSort(players, 'pos', {
    pos: p => -POS_ORDER.indexOf(p.pos) * 100 + ovr(p), name: p => p.name, age: p => age(p, gs.season), ovr: p => ovr(p), pot: p => p.pot,
    fit: p => p.fitness, mor: p => p.morale, val: p => marketValue(p, gs.season), wage: p => p.wage, ct: p => p.contractEnd, apps: p => p.stats.apps, goals: p => p.stats.goals, rat: p => avgRating(p), num: p => p.num,
  });
  const inXI = new Set(club.lineup);
  return (
    <div className="panel">
      <div className="card-title">
        <div className="seg"><button className={view === 'first' ? 'on' : ''} onClick={() => setView('first')}>Primer equipo ({clubPlayers(gs, club.id).length})</button><button className={view === 'youth' ? 'on' : ''} onClick={() => setView('youth')}>Cantera ({clubPlayers(gs, club.id, true).filter(p => p.youth).length})</button></div>
        <div className="seg"><button className={mode === 'table' ? 'on' : ''} onClick={() => setMode('table')}>Tabla</button><button className={mode === 'cards' ? 'on' : ''} onClick={() => setMode('cards')}>Cromos</button></div>
      </div>
      {mode === 'cards' ? (
        <div className="card-grid">
          {sorted.map(p => (
            <div key={p.id} onClick={() => openPlayer(p.id)}>
              <PlayerCard p={p} club={club} rating={ovr(p)} />
              <div className="card-meta"><span>{age(p, gs.season)} años</span><span>{inXI.has(p.id) ? 'Titular' : p.listed ? 'En venta' : fmtMoney(marketValue(p, gs.season))}</span></div>
            </div>
          ))}
          {!sorted.length && <div className="empty">No hay jugadores en esta sección.</div>}
        </div>
      ) : (
      <div className="tablewrap">
        <table className="t">
          <thead><tr>{th('num', '#', 'c')}{th('pos', 'Pos')}{th('name', 'Nombre')}{th('age', 'Edad', 'c')}{th('ovr', 'Med', 'c')}{th('pot', 'Pot')}{th('fit', 'Físico')}{th('mor', 'Moral')}{th('apps', 'PJ', 'c')}{th('goals', 'G', 'c')}{th('rat', 'Nota', 'c')}{th('val', 'Valor', 'r')}{th('wage', 'Sueldo/sem', 'r')}{th('ct', 'Contrato', 'c')}<th>Estado</th></tr></thead>
          <tbody>
            {sorted.map(p => {
              const st = potStars(p, club.staff.scout, true);
              return (
                <tr key={p.id} className="click" onClick={() => openPlayer(p.id)}>
                  <td className="c muted num">{p.num}</td>
                  <td><PosBadge pos={p.pos} /></td>
                  <td><Face p={p} /><Flag nat={p.nat} /><b>{p.name}</b> {inXI.has(p.id) && <span className="pill blue">XI</span>} {p.listed && <span className="pill warn">En venta</span>}</td>
                  <td className="c num">{age(p, gs.season)}</td>
                  <td className="c"><Ovr v={ovr(p)} /></td>
                  <td><Stars v={st.mid} /></td>
                  <td style={{ width: 80 }}><Bar v={p.fitness} /></td>
                  <td style={{ width: 80 }}><Bar v={p.morale} color={p.morale > 70 ? 'var(--good)' : p.morale > 45 ? 'var(--blue)' : 'var(--bad)'} /></td>
                  <td className="c num">{p.stats.apps}</td>
                  <td className="c num">{p.stats.goals}</td>
                  <td className="c num">{p.stats.apps ? avgRating(p).toFixed(1) : '-'}</td>
                  <td className="r num">{fmtMoney(marketValue(p, gs.season))}</td>
                  <td className="r num">{fmtMoney(p.wage)}</td>
                  <td className="c num" style={{ color: p.contractEnd <= gs.season + 1 ? 'var(--warn)' : undefined }}>{p.contractEnd}</td>
                  <td className="small">{playerStatus(p) && <span className="pill bad">{playerStatus(p)}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!sorted.length && <div className="empty">No hay jugadores en esta sección.</div>}
      </div>
      )}
    </div>
  );
}
