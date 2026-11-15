'use client';
import React from 'react';
import { useGame } from '../GameApp';
import { Bar, Ovr, PosBadge } from '../ui';
import { clubPlayers } from '@/game/lineup';
import { age, ovr, ATTR_LABEL } from '@/game/player';
import type { Attrs } from '@/game/types';
import type { Training } from '@/game/types';

const FOCUS: [Training['focus'], string, string][] = [
  ['general', '⚖️ General', 'Mejora equilibrada de todos los atributos de cada puesto.'],
  ['ataque', '🎯 Ataque', 'Remate, técnica y pase. Ideal si te cuesta generar ocasiones.'],
  ['defensa', '🛡️ Defensa', 'Entradas, colocación y juego aéreo.'],
  ['fisico', '💪 Físico', 'Velocidad y resistencia. Más desgaste semanal.'],
  ['tactica', '🧠 Táctica', 'Aumenta la cohesión del equipo con tu sistema más rápido.'],
  ['balon_parado', '🚩 Balón parado', 'Faltas, córners y remates de cabeza.'],
  ['descanso', '😴 Descanso', 'Sin progreso, pero máxima recuperación física y moral.'],
];

export default function TrainingScreen() {
  const { gs, refresh } = useGame();
  const club = gs.clubs[gs.manager.clubId];
  const tr = club.training;
  const players = clubPlayers(gs, club.id, true).sort((a, b) => a.fitness - b.fitness);
  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
      <div className="col">
        <div className="panel">
          <h3>Plan semanal</h3>
          <div className="small muted" style={{ marginBottom: 10 }}>El foco individual de cada jugador (tabla de la derecha) concentra su progreso en un atributo. El entrenamiento se aplica cada lunes. Los jóvenes con potencial y los que juegan más progresan más rápido. La calidad del cuerpo técnico (Club → Personal) multiplica el progreso.</div>
          <div className="col" style={{ gap: 4 }}><span className="small muted">Intensidad</span>
            <div className="seg">{([1, 2, 3] as const).map(i => <button key={i} className={tr.intensity === i ? 'on' : ''} onClick={() => { tr.intensity = i; refresh(); }}>{['Suave', 'Normal', 'Dura'][i - 1]}</button>)}</div>
            <span className="small muted">{tr.intensity === 3 ? 'Más progreso, pero menos recuperación y riesgo de lesiones.' : tr.intensity === 1 ? 'Recuperación rápida, poco progreso.' : 'Equilibrio entre progreso y frescura.'}</span>
          </div>
          <div className="grid g2" style={{ marginTop: 14 }}>
            {FOCUS.map(([k, l, d]) => (
              <button key={k} className={`club-card ${tr.focus === k ? 'on' : ''}`} onClick={() => { tr.focus = k; refresh(); }}>
                <div><b>{l}</b><div className="small muted">{d}</div></div>
              </button>
            ))}
          </div>
        </div>
        <div className="panel"><h3>Cuerpo técnico</h3><div className="small">Entrenador: nivel {club.staff.coach}/5 · Preparador físico: {club.staff.fitness}/5 · Fisioterapia: {club.staff.physio}/5 · Porteros: {club.staff.gk}/5</div></div>
      </div>
      <div className="panel">
        <h3>Estado físico de la plantilla</h3>
        <div className="tablewrap">
          <table className="t"><thead><tr><th>Pos</th><th>Jugador</th><th className="c">Edad</th><th className="c">Med</th><th>Físico</th><th>Moral</th><th>Foco individual</th></tr></thead>
            <tbody>{players.map(p => (
              <tr key={p.id}><td><PosBadge pos={p.pos} /></td><td>{p.name}{p.youth && <span className="pill blue" style={{ marginLeft: 6 }}>Cantera</span>}{p.injury > 0 && <span className="pill bad" style={{ marginLeft: 6 }}>🩹 {Math.ceil(p.injury / 7)} sem</span>}</td><td className="c">{age(p, gs.season)}</td><td className="c"><Ovr v={ovr(p)} /></td><td style={{ width: 110 }}><Bar v={p.fitness} /></td><td style={{ width: 90 }}><Bar v={p.morale} color="var(--blue)" /></td><td><select value={p.trainFocus ?? ''} onChange={e => { p.trainFocus = (e.target.value || undefined) as keyof Attrs | undefined; refresh(); }} style={{ padding: '3px 6px', fontSize: 12 }}><option value="">—</option>{(Object.keys(ATTR_LABEL) as (keyof Attrs)[]).filter(k => p.pos === 'GK' || k !== 'gk').map(k => <option key={k} value={k}>{ATTR_LABEL[k]}</option>)}</select></td></tr>
            ))}</tbody></table>
        </div>
      </div>
    </div>
  );
}
