'use client';
import React, { useState } from 'react';
import { useGame } from './GameApp';
import { Modal, Ovr, PosBadge, Flag, Bar, Crest, Stars } from './ui';
import { ATTR_KEYS, ATTR_LABEL, POS_LABEL, age, avgRating, fairWage, marketValue, ovr, playerStatus, slotRating } from '@/game/player';
import type { Pos } from '@/game/types';
import { fmtMoney } from '@/game/season';
import { askingPrice, makeBid, offerContract, releasePlayer, wageDemand } from '@/game/market';
import { inWindow } from '@/game/calendar';
import { potStars } from './screens/Squad';

const ALL_POS: Pos[] = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];

export default function PlayerModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { gs, refresh, toast } = useGame();
  const p = gs.players[id];
  const me = gs.clubs[gs.manager.clubId];
  const own = p.clubId === me.id;
  const club = p.clubId ? gs.clubs[p.clubId] : null;
  const value = marketValue(p, gs.season);
  const ask = p.clubId && !own ? askingPrice(gs, p) : 0;
  const [fee, setFee] = useState(Math.round((ask || value) / 100_000) / 10);
  const [wage, setWage] = useState(Math.round((own ? Math.max(p.wage, fairWage(p, gs.season, me.reputation)) : wageDemand(gs, p)) / 1000));
  const [years, setYears] = useState(own ? 3 : 4);
  const [msg, setMsg] = useState('');
  const deal = gs.offers.find(o => o.playerId === id && !o.incoming && o.status === 'contract');
  const st = potStars(p, me.staff.scout, own);
  const posRatings = ALL_POS.map(pos => ({ pos, r: Math.round(slotRating(p, pos)) })).sort((a, b) => b.r - a.r).slice(0, 4);
  const short = gs.shortlist.includes(id);
  const act = (m: string) => { setMsg(m); refresh(); };

  return (
    <Modal onClose={onClose}>
      <div className="row wrap" style={{ alignItems: 'flex-start', gap: 18 }}>
        <div className="col" style={{ alignItems: 'center', minWidth: 110 }}>
          <div style={{ width: 96, height: 96, borderRadius: 20, background: club ? `linear-gradient(135deg, ${club.colors[0]}, ${club.colors[1]})` : '#334', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontSize: 44, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.6)', border: '2px solid rgba(255,255,255,.3)' }}>{p.num || '–'}</div>
          <Ovr v={ovr(p)} />
        </div>
        <div className="grow">
          <h1 style={{ marginBottom: 4 }}>{p.name}</h1>
          <div className="row wrap small"><PosBadge pos={p.pos} /><span><Flag nat={p.nat} />{p.nat}</span><span>{age(p, gs.season)} años</span>{club ? <span className="row" style={{ gap: 6 }}><Crest club={club} size={18} />{club.name}</span> : <span className="pill good">Agente libre</span>}{p.youth && <span className="pill blue">Cantera</span>}{playerStatus(p) && <span className="pill bad">{playerStatus(p)}{p.injuryName ? ` · ${p.injuryName}` : ''}</span>}{p.generated && <span className="pill">Jugador generado</span>}</div>
          <div className="grid g4" style={{ marginTop: 12 }}>
            <div><div className="small muted">Valor</div><b>{fmtMoney(value)}</b></div>
            <div><div className="small muted">Sueldo</div><b>{fmtMoney(p.wage)}/sem</b></div>
            <div><div className="small muted">Contrato hasta</div><b>{p.contractEnd + 1}</b></div>
            <div><div className="small muted">Potencial</div><Stars v={st.mid} />{st.unc > 0 && <span className="small muted"> ±{st.unc.toFixed(1)}</span>}</div>
          </div>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="panel tight">
          <h3>Atributos</h3>
          {ATTR_KEYS.filter(k => p.pos === 'GK' || k !== 'gk').map(k => (
            <div className="attr" key={k}><span className="muted">{ATTR_LABEL[k]}</span><Bar v={p.attrs[k]} max={99} /><b className="num">{p.attrs[k]}</b></div>
          ))}
          <div className="attr"><span className="muted">Físico</span><Bar v={p.fitness} /><b className="num">{Math.round(p.fitness)}</b></div>
          <div className="attr"><span className="muted">Moral</span><Bar v={p.morale} color="var(--blue)" /><b className="num">{Math.round(p.morale)}</b></div>
          <div className="small muted" style={{ marginTop: 8 }}>Rendimiento por puesto: {posRatings.map(r => `${POS_LABEL[r.pos]} ${r.r}`).join(' · ')}</div>
        </div>
        <div className="col">
          <div className="panel tight">
            <h3>Temporada</h3>
            <div className="grid g4 small">
              <div><div className="muted">PJ</div><b>{p.stats.apps}</b></div><div><div className="muted">Goles</div><b>{p.stats.goals}</b></div>
              <div><div className="muted">Asist.</div><b>{p.stats.assists}</b></div><div><div className="muted">Nota</div><b>{p.stats.apps ? avgRating(p).toFixed(2) : '-'}</b></div>
            </div>
            {p.history.length > 0 && <table className="t" style={{ marginTop: 8 }}><thead><tr><th>Temp.</th><th>Club</th><th className="c">PJ</th><th className="c">G</th><th className="c">Nota</th></tr></thead><tbody>{p.history.slice(-5).reverse().map((h, i) => <tr key={i}><td>{h.season}/{(h.season + 1) % 100}</td><td>{h.club}</td><td className="c">{h.apps}</td><td className="c">{h.goals}</td><td className="c">{h.rating.toFixed(2)}</td></tr>)}</tbody></table>}
          </div>
          {own ? (
            <div className="panel tight col">
              <h3 style={{ margin: 0 }}>Gestión</h3>
              <div className="row wrap">
                <button className={`btn sm ${p.listed ? 'active' : ''}`} onClick={() => { p.listed = !p.listed; act(p.listed ? 'Jugador en la lista de transferibles.' : 'Retirado de la lista.'); }}>{p.listed ? '✓ Transferible' : 'Poner a la venta'}</button>
                {p.youth ? <button className="btn sm" onClick={() => { p.youth = false; act('Sube al primer equipo.'); }}>Subir al primer equipo</button> : age(p, gs.season) < 19 && <button className="btn sm" onClick={() => { p.youth = true; me.lineup = me.lineup.map(x => (x === id ? -1 : x)); me.bench = me.bench.filter(x => x !== id); act('Enviado a la cantera.'); }}>Bajar a la cantera</button>}
                {(['captain', 'penalty', 'freekick', 'corner'] as const).map(k => (
                  <button key={k} className={`btn sm ${me.tactics[k] === id ? 'active' : ''}`} onClick={() => { me.tactics[k] = id; act('Asignado.'); }}>{({ captain: 'Capitán', penalty: 'Penaltis', freekick: 'Faltas', corner: 'Córners' })[k]}</button>
                ))}
              </div>
              <div className="row wrap">
                <span className="small muted">Renovar:</span>
                <input type="number" value={wage} min={1} onChange={e => setWage(+e.target.value)} style={{ width: 90 }} /><span className="small">mil €/sem</span>
                <select value={years} onChange={e => setYears(+e.target.value)}>{[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y} año{y > 1 ? 's' : ''}</option>)}</select>
                <button className="btn sm primary" onClick={() => act(offerContract(gs, id, wage * 1000, years).msg)}>Ofrecer</button>
              </div>
              <div className="small muted">Pide aprox. {fmtMoney(wageDemand(gs, p) * 0.95)}/sem.</div>
              <div><button className="btn sm danger" onClick={() => { if (confirm(`¿Rescindir el contrato de ${p.name}?`)) { act(releasePlayer(gs, id)); } }}>Rescindir contrato</button></div>
            </div>
          ) : (
            <div className="panel tight col">
              <h3 style={{ margin: 0 }}>Fichaje</h3>
              <button className={`btn sm ${short ? 'active' : ''}`} style={{ alignSelf: 'flex-start' }} onClick={() => { gs.shortlist = short ? gs.shortlist.filter(x => x !== id) : [...gs.shortlist, id]; act(short ? 'Eliminado de la lista de seguimiento.' : 'Añadido a la lista de seguimiento.'); }}>{short ? '★ En seguimiento' : '☆ Seguir'}</button>
              {!deal ? (
                <>
                  {p.clubId && <div className="small muted">El {club!.name} pediría unos <b>{fmtMoney(ask)}</b>{p.listed ? ' (transferible)' : ''}. Tu presupuesto: {fmtMoney(me.transferBudget)}.{!inWindow(gs.day) && ' Mercado cerrado.'}</div>}
                  <div className="row wrap">
                    {p.clubId && <><input type="number" step={0.1} value={fee} onChange={e => setFee(+e.target.value)} style={{ width: 100 }} /><span className="small">M€</span></>}
                    <button className="btn sm primary" onClick={() => { const r = makeBid(gs, id, Math.round(fee * 1_000_000)); if (!r.ok && r.counter) setFee(Math.round(r.counter / 100_000) / 10); act(r.msg); }}>{p.clubId ? 'Hacer oferta' : 'Negociar contrato'}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="small">Traspaso acordado{deal.fee ? ` (${fmtMoney(deal.fee)})` : ''}. Negocia el contrato. Pide unos <b>{fmtMoney(wageDemand(gs, p))}/sem</b>.</div>
                  <div className="row wrap">
                    <input type="number" value={wage} onChange={e => setWage(+e.target.value)} style={{ width: 90 }} /><span className="small">mil €/sem</span>
                    <select value={years} onChange={e => setYears(+e.target.value)}>{[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y} año{y > 1 ? 's' : ''}</option>)}</select>
                    <button className="btn sm primary" onClick={() => { const r = offerContract(gs, id, wage * 1000, years); act(r.msg); if (r.ok) toast(r.msg); }}>Ofrecer contrato</button>
                    <button className="btn sm ghost" onClick={() => { deal.status = 'rejected'; act('Negociación cancelada.'); }}>Cancelar</button>
                  </div>
                </>
              )}
            </div>
          )}
          {msg && <div className="panel tight" style={{ borderColor: 'var(--accent)' }}>{msg}</div>}
        </div>
      </div>
    </Modal>
  );
}
