'use client';
import React, { useMemo, useState } from 'react';
import { useGame } from '../GameApp';
import { Crest, Flag, Ovr, PosBadge, useSort } from '../ui';
import { age, marketValue, ovr, POS_LABEL } from '@/game/player';
import { fmtMoney } from '@/game/season';
import { acceptIncoming, askingPrice, rejectIncoming } from '@/game/market';
import { dateLabel, inWindow, WINDOWS } from '@/game/calendar';
import type { Player, Pos } from '@/game/types';

export default function Transfers() {
  const { gs, refresh, openPlayer, toast } = useGame();
  const me = gs.clubs[gs.manager.clubId];
  const [tab, setTab] = useState<'search' | 'short' | 'in' | 'log'>('search');
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<Pos | ''>('');
  const [league, setLeague] = useState('');
  const [maxAge, setMaxAge] = useState(40);
  const [minOvr, setMinOvr] = useState(65);
  const [maxVal, setMaxVal] = useState(0);
  const [only, setOnly] = useState<'all' | 'listed' | 'free'>('all');
  const incoming = gs.offers.filter(o => o.incoming && o.status === 'pending');

  const results = useMemo(() => {
    const ql = q.toLowerCase();
    return Object.values(gs.players).filter(p => {
      if (p.clubId === me.id || p.youth) return false;
      if (only === 'free' && p.clubId) return false;
      if (only === 'listed' && !p.listed) return false;
      if (pos && p.pos !== pos) return false;
      if (league && (!p.clubId || gs.clubs[p.clubId].leagueId !== league)) return false;
      if (age(p, gs.season) > maxAge) return false;
      if (ovr(p) < minOvr) return false;
      if (maxVal && marketValue(p, gs.season) > maxVal * 1e6) return false;
      if (ql && !p.name.toLowerCase().includes(ql)) return false;
      return true;
    }).slice(0, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gs, q, pos, league, maxAge, minOvr, maxVal, only, gs.day]);

  const list = tab === 'short' ? gs.shortlist.map(id => gs.players[id]).filter(Boolean) : results;
  const { sorted, th } = useSort<Player>(list, 'ovr', { name: p => p.name, age: p => age(p, gs.season), ovr: p => ovr(p), pot: p => p.pot, val: p => marketValue(p, gs.season), wage: p => p.wage, club: p => (p.clubId ? gs.clubs[p.clubId].name : '') });

  return (
    <div className="col">
      <div className="panel tight row wrap">
        <div className="seg">
          <button className={tab === 'search' ? 'on' : ''} onClick={() => setTab('search')}>Buscar jugadores</button>
          <button className={tab === 'short' ? 'on' : ''} onClick={() => setTab('short')}>Seguimiento ({gs.shortlist.length})</button>
          <button className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>Ofertas recibidas ({incoming.length})</button>
          <button className={tab === 'log' ? 'on' : ''} onClick={() => setTab('log')}>Operaciones</button>
        </div>
        <span className="right small">{inWindow(gs.day) ? <span className="pill good">Mercado abierto</span> : <span className="pill">Mercado cerrado · abre {dateLabel(gs.season, gs.day < WINDOWS[1][0] ? WINDOWS[1][0] : 365, false)}</span>} · Presupuesto <b>{fmtMoney(me.transferBudget)}</b></span>
      </div>
      {tab === 'search' && (
        <div className="panel tight row wrap">
          <input type="text" placeholder="Nombre..." value={q} onChange={e => setQ(e.target.value)} style={{ width: 170 }} />
          <select value={pos} onChange={e => setPos(e.target.value as Pos | '')}><option value="">Todas las posiciones</option>{(Object.keys(POS_LABEL) as Pos[]).map(p => <option key={p} value={p}>{POS_LABEL[p]}</option>)}</select>
          <select value={league} onChange={e => setLeague(e.target.value)}><option value="">Todas las ligas</option>{Object.values(gs.leagues).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          <label className="small">Edad máx <input type="number" value={maxAge} onChange={e => setMaxAge(+e.target.value)} style={{ width: 60 }} /></label>
          <label className="small">Media mín <input type="number" value={minOvr} onChange={e => setMinOvr(+e.target.value)} style={{ width: 60 }} /></label>
          <label className="small">Valor máx (M€, 0=sin límite) <input type="number" value={maxVal} onChange={e => setMaxVal(+e.target.value)} style={{ width: 70 }} /></label>
          <div className="seg"><button className={only === 'all' ? 'on' : ''} onClick={() => setOnly('all')}>Todos</button><button className={only === 'listed' ? 'on' : ''} onClick={() => setOnly('listed')}>Transferibles</button><button className={only === 'free' ? 'on' : ''} onClick={() => setOnly('free')}>Libres</button></div>
        </div>
      )}
      {(tab === 'search' || tab === 'short') && (
        <div className="panel tight tablewrap">
          <table className="t">
            <thead><tr><th>Pos</th>{th('name', 'Nombre')}{th('age', 'Edad', 'c')}{th('ovr', 'Med', 'c')}{th('club', 'Club')}{th('val', 'Valor', 'r')}<th className="r">Precio pedido</th>{th('wage', 'Sueldo', 'r')}<th className="c">Contrato</th></tr></thead>
            <tbody>{sorted.slice(0, 200).map(p => (
              <tr key={p.id} className="click" onClick={() => openPlayer(p.id)}>
                <td><PosBadge pos={p.pos} /></td><td><Flag nat={p.nat} /><b>{p.name}</b> {p.listed && <span className="pill warn">Transferible</span>}</td><td className="c">{age(p, gs.season)}</td><td className="c"><Ovr v={ovr(p)} /></td>
                <td>{p.clubId ? <span className="row" style={{ gap: 6 }}><Crest club={gs.clubs[p.clubId]} size={16} />{gs.clubs[p.clubId].name}</span> : <span className="pill good">Libre</span>}</td>
                <td className="r num">{fmtMoney(marketValue(p, gs.season))}</td><td className="r num">{p.clubId ? fmtMoney(askingPrice(gs, p)) : '—'}</td><td className="r num">{fmtMoney(p.wage)}</td><td className="c">{p.contractEnd + 1}</td>
              </tr>
            ))}</tbody>
          </table>
          {!sorted.length && <div className="empty">Sin resultados. Ajusta los filtros.</div>}
          {sorted.length > 200 && <div className="small muted" style={{ padding: 8 }}>Mostrando 200 de {sorted.length}. Afina la búsqueda.</div>}
        </div>
      )}
      {tab === 'in' && (
        <div className="panel">
          {!incoming.length && <div className="empty">No hay ofertas pendientes. Pon jugadores en la lista de transferibles para atraer compradores.</div>}
          {incoming.map(o => { const p = gs.players[o.playerId]; const c = gs.clubs[o.fromClub]; if (!p) return null; return (
            <div key={o.id} className="news-item row wrap" style={{ cursor: 'default', marginBottom: 6 }}>
              <Crest club={c} size={30} /><div className="grow"><b>{c.name}</b> ofrece <b>{fmtMoney(o.fee)}</b> por <a onClick={() => openPlayer(p.id)} style={{ cursor: 'pointer' }}>{p.name}</a> <span className="small muted">(valor {fmtMoney(marketValue(p, gs.season))})</span></div>
              <button className="btn sm primary" onClick={() => { toast(acceptIncoming(gs, o.id)); refresh(); }}>Aceptar</button>
              <button className="btn sm danger" onClick={() => { rejectIncoming(gs, o.id); refresh(); }}>Rechazar</button>
            </div>
          ); })}
        </div>
      )}
      {tab === 'log' && (
        <div className="panel tablewrap">
          <table className="t"><thead><tr><th>Fecha</th><th>Jugador</th><th>Operación</th><th className="r">Cantidad</th><th>Estado</th></tr></thead>
            <tbody>{gs.offers.slice().reverse().slice(0, 80).map(o => { const p = gs.players[o.playerId]; return (
              <tr key={o.id}><td>{dateLabel(gs.season, o.date, false)}</td><td>{p?.name ?? '—'}</td><td>{o.incoming ? `Oferta de ${gs.clubs[o.fromClub]?.name}` : o.toClub ? `Oferta al ${gs.clubs[o.toClub]?.name}` : 'Agente libre'}</td><td className="r">{fmtMoney(o.fee)}</td><td><span className={`pill ${o.status === 'done' ? 'good' : o.status === 'rejected' ? 'bad' : 'warn'}`}>{({ pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', countered: 'Contraoferta', done: 'Completada', contract: 'Negociando contrato' })[o.status]}</span></td></tr>
            ); })}</tbody></table>
        </div>
      )}
    </div>
  );
}
