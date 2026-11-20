'use client';
import React from 'react';
import { useGame } from '../GameApp';
import { fmtMoney } from '@/game/season';
import { clubPlayers } from '@/game/lineup';

const CATS: [string, string][] = [
  ['Taquilla', 'Taquilla'], ['Derechos de TV', 'Televisión'], ['Merchandising', 'Merchandising'], ['Patrocinio', 'Patrocinio'], ['Premio', 'Premios'], ['Venta', 'Ventas de jugadores'],
  ['Salarios jugadores', 'Salarios jugadores'], ['Salarios cuerpo', 'Cuerpo técnico'], ['Mantenimiento', 'Mantenimiento'], ['Fichaje', 'Fichajes'], ['Rescisión', 'Rescisiones'], ['Obras', 'Obras estadio'], ['Contratación', 'Contratación personal'],
];

export default function Finances() {
  const { gs } = useGame();
  const club = gs.clubs[gs.manager.clubId];
  const season = gs.finance.filter(f => Math.floor(f.date / 1000) === gs.season);
  const agg: Record<string, number> = {};
  for (const f of season) { const c = CATS.find(([k]) => f.label.startsWith(k)); const key = c ? c[1] : 'Otros'; agg[key] = (agg[key] ?? 0) + f.amount; }
  const income = Object.entries(agg).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const expense = Object.entries(agg).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]);
  const maxAbs = Math.max(1, ...Object.values(agg).map(Math.abs));
  const totalIn = income.reduce((a, [, v]) => a + v, 0), totalOut = expense.reduce((a, [, v]) => a + v, 0);
  const wages = clubPlayers(gs, club.id, true).reduce((a, p) => a + p.wage, 0);
  // balance evolution: cumulative from current balance backwards
  const pts: number[] = []; let b = club.balance;
  for (let i = season.length - 1; i >= 0; i--) { pts.unshift(b); b -= season[i].amount; }
  pts.unshift(b);
  const step = Math.max(1, Math.floor(pts.length / 80));
  const series = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
  const mn = Math.min(...series), mx = Math.max(...series);
  const W = 600, H = 140;
  const path = series.map((v, i) => `${i ? 'L' : 'M'}${(i / Math.max(1, series.length - 1)) * W},${H - ((v - mn) / Math.max(1, mx - mn)) * (H - 10) - 5}`).join(' ');

  const Row = ({ k, v }: { k: string; v: number }) => (
    <div className="row small" style={{ margin: '5px 0' }}>
      <span style={{ width: 150 }}>{k}</span>
      <div className="grow"><div className="bar" style={{ height: 10 }}><i style={{ width: `${(Math.abs(v) / maxAbs) * 100}%`, background: v > 0 ? 'var(--good)' : 'var(--bad)' }} /></div></div>
      <b className="num" style={{ width: 90, textAlign: 'right', color: v > 0 ? 'var(--good)' : 'var(--bad)' }}>{fmtMoney(v)}</b>
    </div>
  );

  return (
    <div className="col">
      <div className="grid g4">
        <div className="panel"><div className="small muted">Saldo</div><div className="kpi" style={{ color: club.balance < 0 ? 'var(--bad)' : undefined }}>{fmtMoney(club.balance)}</div></div>
        <div className="panel"><div className="small muted">Presupuesto de fichajes</div><div className="kpi">{fmtMoney(club.transferBudget)}</div></div>
        <div className="panel"><div className="small muted">Masa salarial</div><div className="kpi">{fmtMoney(wages)}</div><div className="small muted">por semana · {fmtMoney(wages * 52)}/año</div></div>
        <div className="panel"><div className="small muted">Resultado temporada</div><div className="kpi" style={{ color: totalIn + totalOut >= 0 ? 'var(--good)' : 'var(--bad)' }}>{fmtMoney(totalIn + totalOut)}</div></div>
      </div>
      <div className="panel">
        <h3>Evolución del saldo (temporada)</h3>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }} role="img" aria-label="Evolución del saldo">
          <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b6f24a" stopOpacity=".35" /><stop offset="1" stopColor="#b6f24a" stopOpacity="0" /></linearGradient></defs>
          {series.length > 1 && <><path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#fg)" /><path d={path} fill="none" stroke="#b6f24a" strokeWidth="2.5" /></>}
          <text x="4" y="14" fill="#8ea2c4" fontSize="11">{fmtMoney(mx)}</text><text x="4" y={H - 4} fill="#8ea2c4" fontSize="11">{fmtMoney(mn)}</text>
        </svg>
      </div>
      <div className="grid g2">
        <div className="panel"><h3>Ingresos · {fmtMoney(totalIn)}</h3>{income.map(([k, v]) => <Row key={k} k={k} v={v} />)}{!income.length && <div className="muted small">Aún sin movimientos esta temporada.</div>}</div>
        <div className="panel"><h3>Gastos · {fmtMoney(totalOut)}</h3>{expense.map(([k, v]) => <Row key={k} k={k} v={v} />)}</div>
      </div>
      <div className="panel">
        <h3>Últimos movimientos</h3>
        <div className="tablewrap" style={{ maxHeight: 300 }}><table className="t"><tbody>{season.slice(-40).reverse().map((f, i) => <tr key={i}><td>{f.label}</td><td className="r num" style={{ color: f.amount >= 0 ? 'var(--good)' : 'var(--bad)' }}>{fmtMoney(f.amount)}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
