'use client';
import React, { useState } from 'react';
import { useGame } from './GameApp';
import { Modal, PosBadge, Flag, Bar, Crest, Stars, PlayerCard } from './ui';
import { ATTR_KEYS, ATTR_LABEL, POS_LABEL, age, avgRating, fairWage, marketValue, ovr, playerStatus, slotRating } from '@/game/player';
import type { Pos } from '@/game/types';
import { fmtMoney } from '@/game/season';
import { askingPrice, makeBid, offerContract, releasePlayer, wageDemand, expectedRole, ROLE_LABEL, type ContractTerms } from '@/game/market';
import type { Role } from '@/game/types';
import { inWindow } from '@/game/calendar';
import { potStars } from './screens/Squad';
import { reserveOf, sendToReserve, callUp, loanOut, RESERVE_MAX_AGE } from '@/game/academy';
import { playerChat, CHAT_COOLDOWN, type ChatKind } from '@/game/talk';

const attrColor = (v: number) => (v >= 85 ? '#46d2ff' : v >= 75 ? '#3ddc84' : v >= 65 ? '#c6f432' : v >= 55 ? '#ffb020' : '#ff5468');

const ALL_POS: Pos[] = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];

export default function PlayerModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { gs, refresh, toast } = useGame();
  const p = gs.players[id];
  const me = gs.clubs[gs.manager.clubId];
  const own = p.clubId === me.id;
  const myReserve = reserveOf(gs, me.id);
  const inReserve = !!myReserve && p.clubId === myReserve.id;
  const onLoan = p.loanFrom === me.id;
  const club = p.clubId ? gs.clubs[p.clubId] : null;
  const value = marketValue(p, gs.season);
  const ask = p.clubId && !own ? askingPrice(gs, p) : 0;
  const [fee, setFee] = useState(Math.round((ask || value) / 100_000) / 10);
  const [wage, setWage] = useState(Math.round((own ? Math.max(p.wage, fairWage(p, gs.season, me.reputation)) : wageDemand(gs, p)) / 1000));
  const [years, setYears] = useState(own ? 3 : 4);
  const [msg, setMsg] = useState('');
  const [role, setRole] = useState<Role>(p.role ?? expectedRole(gs, p));
  const [bonus, setBonus] = useState(0);   // thousands of €
  const [clause, setClause] = useState(p.releaseClause ? Math.round(p.releaseClause / 1e6) : 0); // millions of €
  const terms = (): ContractTerms => ({ role, bonus: bonus * 1000, clause: clause * 1e6 });
  const termsUI = (
    <div className="terms">
      <label>Rol <select value={role} onChange={e => setRole(e.target.value as Role)}>{(Object.keys(ROLE_LABEL) as Role[]).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}{r === expectedRole(gs, p) ? ' (espera)' : ''}</option>)}</select></label>
      <label>Prima de fichaje <input type="number" min={0} step={50} value={bonus} onChange={e => setBonus(Math.max(0, +e.target.value))} style={{ width: 80 }} /> mil €</label>
      <label>Cláusula <input type="number" min={0} value={clause} onChange={e => setClause(Math.max(0, +e.target.value))} style={{ width: 70 }} /> M€ <span className="small muted">(0 = sin cláusula)</span></label>
    </div>
  );
  const deal = gs.offers.find(o => o.playerId === id && !o.incoming && o.status === 'contract');
  const st = potStars(p, me.staff.scout, own);
  const posRatings = ALL_POS.map(pos => ({ pos, r: Math.round(slotRating(p, pos)) })).sort((a, b) => b.r - a.r).slice(0, 4);
  const short = gs.shortlist.includes(id);
  const act = (m: string) => { setMsg(m); refresh(); };

  return (
    <Modal onClose={onClose}>
      <div className="row wrap" style={{ alignItems: 'flex-start', gap: 18 }}>
        <PlayerCard p={p} club={club} rating={ovr(p)} />
        <div className="grow">
          <div className="kicker-sm">Ficha del jugador</div>
          <h1 style={{ marginBottom: 6 }}>{p.name}</h1>
          <div className="row wrap small"><PosBadge pos={p.pos} /><span><Flag nat={p.nat} />{p.nat}</span><span>{age(p, gs.season)} años</span>{club ? <span className="row" style={{ gap: 6 }}><Crest club={club} size={18} />{club.name}</span> : <span className="pill good">Agente libre</span>}{p.youth && <span className="pill blue">Cantera</span>}{playerStatus(p) && <span className="pill bad">{playerStatus(p)}{p.injuryName ? ` · ${p.injuryName}` : ''}</span>}{p.generated && <span className="pill">Jugador generado</span>}</div>
          <div className="grid g4" style={{ marginTop: 14 }}>
            <div className="statbox"><span>Valor</span><b>{fmtMoney(value)}</b></div>
            <div className="statbox"><span>Sueldo</span><b>{fmtMoney(p.wage)}/sem</b></div>
            <div className="statbox"><span>Contrato hasta</span><b>{p.contractEnd}</b></div>
            <div className="statbox"><span>Potencial</span><div><Stars v={st.mid} />{st.unc > 0 && <span className="small muted"> ±{st.unc.toFixed(1)}</span>}</div></div>
          </div>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="panel tight">
          <h3>Atributos</h3>
          {ATTR_KEYS.filter(k => p.pos === 'GK' || k !== 'gk').map(k => (
            <div className="attr" key={k}><span className="muted">{ATTR_LABEL[k]}</span><Bar v={p.attrs[k]} max={99} color={attrColor(p.attrs[k])} /><b className="num" style={{ color: attrColor(p.attrs[k]) }}>{p.attrs[k]}</b></div>
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
          {(inReserve || onLoan) && (
            <div className="panel tight col">
              <h3 style={{ margin: 0 }}>{inReserve ? `Jugador del filial (${myReserve!.name})` : `Cedido en el ${club!.name}`}</h3>
              <div className="small muted">{onLoan ? `Vuelve al final de la temporada. Esta campaña: ${p.stats.apps} partidos, ${p.stats.goals} goles${p.stats.apps ? `, nota ${avgRating(p).toFixed(2)}` : ''}.` : 'Juega con el filial para sumar minutos. Puedes subirlo cuando quieras.'}</div>
              {inReserve && <div><button className="btn sm primary" onClick={() => act(callUp(gs, id))}>Subir al primer equipo</button></div>}
            </div>
          )}
          {own ? (
            <div className="panel tight col">
              <h3 style={{ margin: 0 }}>Gestión</h3>
              <div className="row wrap">
                <button className={`btn sm ${p.listed ? 'active' : ''}`} onClick={() => { p.listed = !p.listed; act(p.listed ? 'Jugador en la lista de transferibles.' : 'Retirado de la lista.'); }}>{p.listed ? '✓ Transferible' : 'Poner a la venta'}</button>
                {myReserve && !p.youth && age(p, gs.season) <= RESERVE_MAX_AGE && <button className="btn sm" onClick={() => act(sendToReserve(gs, id))}>Bajar al filial</button>}
                {!p.youth && <button className="btn sm" onClick={() => act(loanOut(gs, id))}>Ceder una temporada</button>}
                {p.youth ? <button className="btn sm" onClick={() => act(callUp(gs, id))}>Subir al primer equipo</button> : age(p, gs.season) < 19 && <button className="btn sm" onClick={() => { p.youth = true; me.lineup = me.lineup.map(x => (x === id ? -1 : x)); me.bench = me.bench.filter(x => x !== id); act('Enviado a la cantera.'); }}>Bajar a la cantera</button>}
                {(['captain', 'penalty', 'freekick', 'corner'] as const).map(k => (
                  <button key={k} className={`btn sm ${me.tactics[k] === id ? 'active' : ''}`} onClick={() => { me.tactics[k] = id; act('Asignado.'); }}>{({ captain: 'Capitán', penalty: 'Penaltis', freekick: 'Faltas', corner: 'Córners' })[k]}</button>
                ))}
              </div>
              <div className="row wrap">
                <span className="small muted">Renovar:</span>
                <input type="number" value={wage} min={1} onChange={e => setWage(+e.target.value)} style={{ width: 90 }} /><span className="small">mil €/sem</span>
                <select value={years} onChange={e => setYears(+e.target.value)}>{[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y} año{y > 1 ? 's' : ''}</option>)}</select>
                <button className="btn sm primary" onClick={() => act(offerContract(gs, id, wage * 1000, years, terms()).msg)}>Ofrecer</button>
              </div>
              {termsUI}
              <div className="small muted">Pide aprox. {fmtMoney(wageDemand(gs, p) * 0.95)}/sem. Un rol mejor, una prima o una cláusula baja le convencen con menos sueldo.{p.role ? ` Rol actual: ${ROLE_LABEL[p.role]}.` : ''}{p.releaseClause ? ` Cláusula: ${fmtMoney(p.releaseClause)}.` : ''}</div>
              <div className="chat">
                <span className="small muted">Hablar con él:</span>
                {([['elogiar', 'Elogiar'], ['exigir', 'Exigir más'], ['minutos', 'Prometer minutos']] as [ChatKind, string][]).map(([k, l]) => (
                  <button key={k} className="btn sm" disabled={p.lastTalk != null && gs.day - p.lastTalk < CHAT_COOLDOWN} onClick={() => act(playerChat(gs, id, k))}>{l}</button>
                ))}
                {p.promise && <span className="pill warn">Promesa de minutos: {Math.max(0, p.promise.until - gs.day)} días</span>}
              </div>
              <div><button className="btn sm danger" onClick={() => { if (confirm(`¿Rescindir el contrato de ${p.name}?`)) { act(releasePlayer(gs, id)); } }}>Rescindir contrato</button></div>
            </div>
          ) : !(inReserve || onLoan) && (
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
                  <div className="small">Traspaso acordado{deal.fee ? ` (${fmtMoney(deal.fee)} + 5 % de comisión del agente)` : ''}. Negocia el contrato. Pide unos <b>{fmtMoney(wageDemand(gs, p))}/sem</b> y espera un rol de <b>{ROLE_LABEL[expectedRole(gs, p)].toLowerCase()}</b>.</div>
                  {termsUI}
                  <div className="row wrap">
                    <input type="number" value={wage} onChange={e => setWage(+e.target.value)} style={{ width: 90 }} /><span className="small">mil €/sem</span>
                    <select value={years} onChange={e => setYears(+e.target.value)}>{[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y} año{y > 1 ? 's' : ''}</option>)}</select>
                    <button className="btn sm primary" onClick={() => { const r = offerContract(gs, id, wage * 1000, years, terms()); act(r.msg); if (r.ok) toast(r.msg); }}>Ofrecer contrato</button>
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
