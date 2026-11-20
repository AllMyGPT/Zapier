'use client';
import React, { useState } from 'react';
import { useGame } from '../GameApp';
import { Ovr, PosBadge, Bar } from '../ui';
import PitchLines from '../PitchLines';
import { FORMATIONS, FORMATION_KEYS, MENTALITY_LABEL, LEVEL3 } from '@/game/tactics';
import { autoPick, callupPlayers, clubPlayers, toggleFixed } from '@/game/lineup';
import { reserveOf } from '@/game/academy';
import { setReserveManual } from '@/game/academy';
import { available, ovr, ovr as o2, slotRating, POS_LABEL, playerStatus } from '@/game/player';
import { ovrColor } from '../ui';
import { useMedia, isBroken, markBroken } from '@/lib/media';
import type { Player as TPlayer } from '@/game/types';
import type { Mentality, Player } from '@/game/types';

type Sel = { kind: 'slot'; i: number } | { kind: 'pl'; id: number } | null;

export default function TacticsScreen() {
  const { gs, refresh, toast, openPlayer } = useGame();
  const [sel, setSel] = useState<Sel>(null);
  const [which, setWhich] = useState<'first' | 'reserve'>('first');
  const reserve = reserveOf(gs, gs.manager.clubId);
  // the manager can also coach the reserve team (the filial), when the club has one
  const club = which === 'reserve' && reserve ? gs.clubs[reserve.id] : gs.clubs[gs.manager.clubId];
  const t = club.tactics;
  const slots = FORMATIONS[t.formation].slots;
  const players = [...clubPlayers(gs, club.id), ...(club.id === gs.manager.clubId ? callupPlayers(gs, club) : [])];
  const P = (id: number) => gs.players[id] as Player | undefined;
  while (club.lineup.length < slots.length) club.lineup.push(-1);
  const inXI = new Set(club.lineup);
  const bench = club.bench.filter(id => P(id) && P(id)!.clubId === club.id);
  const reserves = players.filter(p => !inXI.has(p.id) && !bench.includes(p.id)).sort((a, b) => ovr(b) - ovr(a));

  const place = (target: Sel) => {
    if (!sel) { setSel(target); return; }
    const idOf = (s: Sel) => (s!.kind === 'slot' ? club.lineup[s!.i] : s!.id);
    const a = sel, b = target!;
    const ida = idOf(a), idb = idOf(b);
    const put = (s: Sel, id: number) => {
      if (s!.kind === 'slot') club.lineup[s!.i] = id;
      else {
        const old = s!.id;
        const bi = club.bench.indexOf(old);
        if (bi >= 0) club.bench[bi] = id;
      }
    };
    if (a.kind === 'pl' && b.kind === 'pl') {
      // bench <-> reserve swap
      const ai = club.bench.indexOf(ida), bi = club.bench.indexOf(idb);
      if (ai >= 0 && bi < 0) club.bench[ai] = idb; else if (bi >= 0 && ai < 0) club.bench[bi] = ida;
    } else {
      put(a, idb); put(b, ida);
      if (a.kind === 'pl' && club.bench.indexOf(ida) < 0 && b.kind === 'slot' && idb >= 0 && !club.bench.includes(idb) && club.bench.length < 9) club.bench.push(idb);
      if (b.kind === 'pl' && club.bench.indexOf(idb) < 0 && a.kind === 'slot' && ida >= 0 && !club.bench.includes(ida) && club.bench.length < 9) club.bench.push(ida);
    }
    club.bench = club.bench.filter((x, i, arr) => x >= 0 && !club.lineup.includes(x) && arr.indexOf(x) === i);
    setSel(null); refresh();
  };

  const setFormation = (f: string) => {
    if (f === t.formation) return;
    const newSlots = FORMATIONS[f].slots;
    const ids = club.lineup.filter(x => x >= 0 && P(x));
    const gk = ids.find(x => P(x)!.pos === 'GK') ?? ids[0];
    const rest = ids.filter(x => x !== gk);
    const nl: number[] = [gk];
    for (let i = 1; i < newSlots.length; i++) {
      rest.sort((a, b) => slotRating(P(b)!, newSlots[i].pos) - slotRating(P(a)!, newSlots[i].pos));
      nl.push(rest.shift() ?? -1);
    }
    t.formation = f; club.lineup = nl; club.cohesion = Math.max(30, club.cohesion - 12);
    toast('Formación cambiada: los jugadores necesitarán tiempo para adaptarse (cohesión).'); refresh();
  };
  const auto = () => { const r = autoPick(players, t.formation, club.fixed); club.lineup = r.lineup; club.bench = r.bench; refresh(); toast('Alineación automática aplicada'); };

  const chip = (p: Player | undefined, i: number) => {
    const slot = slots[i];
    const r = p ? Math.round(slotRating(p, slot.pos)) : 0;
    const [bg, fg] = ovrColor(r);
    const isSel = sel?.kind === 'slot' && sel.i === i;
    return (
      <div key={i} className={`tslot ${isSel ? 'sel' : ''}`} style={{ left: `${slot.y * 100}%`, top: `${(1 - slot.x) * 88 + 6}%` }} onClick={() => place({ kind: 'slot', i })}>
        <Shirt p={p} bg={slot.pos === 'GK' ? '#f5c84b' : club.colors[0]} border={club.colors[1]} fg={slot.pos === 'GK' ? '#222' : textOn(club.colors[0])} />
        <div className="nm">{p && (club.fixed ?? []).includes(p.id) ? '🔒 ' : ''}{p ? shortName(p.name) : 'Vacío'}{p && !available(p) ? ' ⚠️' : ''}</div>
        <div className="row" style={{ gap: 3 }}><span className="rt" style={{ background: bg, color: fg }}>{r || '-'}</span><span className="rt" style={{ background: 'rgba(0,0,0,.55)' }}>{POS_LABEL[slot.pos]}</span></div>
      </div>
    );
  };

  const PlRow = ({ p, where }: { p: Player; where: string }) => {
    const isSel = sel?.kind === 'pl' && sel.id === p.id;
    return (
      <tr className={`click ${isSel ? 'me' : ''}`} onClick={() => place({ kind: 'pl', id: p.id })} onDoubleClick={() => openPlayer(p.id)}>
        <td className="muted num">{p.num}</td><td><PosBadge pos={p.pos} /></td><td><button className={`lockbtn ${(club.fixed ?? []).includes(p.id) ? 'on' : ''}`} title="Titular indiscutible: la alineación automática nunca lo deja fuera" onClick={e => { e.stopPropagation(); toast(toggleFixed(club, p.id)); refresh(); }}>🔒</button>{p.name} {playerStatus(p) && <span className="pill bad">{playerStatus(p)}</span>}</td><td className="c"><Ovr v={o2(p)} /></td><td style={{ width: 60 }}><Bar v={p.fitness} /></td><td className="small muted">{where}</td>
      </tr>
    );
  };

  const Opt = <T extends string | number>({ label, value, opts, on }: { label: string; value: T; opts: [T, string][]; on: (v: T) => void }) => (
    <div className="col" style={{ gap: 4 }}><span className="small muted">{label}</span><div className="seg">{opts.map(([v, l]) => <button key={String(v)} className={value === v ? 'on' : ''} onClick={() => { on(v); refresh(); }}>{l}</button>)}</div></div>
  );

  return (
    <div className="col">
    {reserve && (
      <div className="panel tight row wrap" style={{ gap: 10 }}>
        <div className="seg"><button className={which === 'first' ? 'on' : ''} onClick={() => { setWhich('first'); setSel(null); }}>Primer equipo</button><button className={which === 'reserve' ? 'on' : ''} onClick={() => { setWhich('reserve'); setSel(null); }}>Filial · {reserve.name}</button></div>
        {which === 'reserve' && (
          <>
            <div className="seg"><button className={!reserve.manual ? 'on' : ''} onClick={() => { setReserveManual(gs, false); refresh(); }}>Automático (ayudante)</button><button className={reserve.manual ? 'on' : ''} onClick={() => { toast(setReserveManual(gs, true)); refresh(); }}>Manual (tú diriges)</button></div>
            <span className="small muted">{reserve.manual ? 'Tú eliges el once, el sistema y la mentalidad del filial.' : 'El filial se alinea solo cada jornada. Cambia a manual para dirigirlo como entrenador y DT.'}</span>
          </>
        )}
      </div>
    )}
    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 460px) minmax(0, 1fr)' }}>
      <div className="col">
        <div className="panel tight">
          <div className="row wrap" style={{ marginBottom: 10 }}>
            <select value={t.formation} onChange={e => setFormation(e.target.value)}>{FORMATION_KEYS.map(f => <option key={f}>{f}</option>)}</select>
            <button className="btn sm" onClick={auto}>Alineación automática</button>
            <span className="small muted right">Cohesión {Math.round(club.cohesion)}%</span>
          </div>
          <div className="tpitch"><PitchLines />{slots.map((_, i) => chip(P(club.lineup[i]), i))}</div>
          <div className="small muted" style={{ marginTop: 8 }}>Haz clic en dos jugadores (campo, banquillo o reservas) para intercambiarlos. Doble clic en la lista abre la ficha. 🔒 marca a un titular indiscutible: la alineación automática y las rotaciones nunca lo dejan fuera si está disponible.</div>
        </div>
      </div>
      <div className="col">
        <div className="panel">
          <h3>Instrucciones de equipo</h3>
          <div className="styles">{STYLES.map(s => (
            <button key={s.name} className="style-card" onClick={() => { Object.assign(t, s.set); refresh(); }} title={s.desc}><b>{s.name}</b><span>{s.desc}</span></button>
          ))}</div>
          <div className="row wrap" style={{ gap: 16 }}>
            <Opt label="Mentalidad" value={t.mentality} opts={([-2, -1, 0, 1, 2] as Mentality[]).map(m => [m, MENTALITY_LABEL[m]])} on={v => (t.mentality = v)} />
            <Opt label="Presión" value={t.pressing} opts={[1, 2, 3].map(v => [v as 1 | 2 | 3, LEVEL3[v - 1]])} on={v => (t.pressing = v)} />
            <Opt label="Ritmo" value={t.tempo} opts={[1, 2, 3].map(v => [v as 1 | 2 | 3, LEVEL3[v - 1]])} on={v => (t.tempo = v)} />
            <Opt label="Amplitud" value={t.width} opts={[[1, 'Estrecho'], [2, 'Normal'], [3, 'Abierto']] as [1 | 2 | 3, string][]} on={v => (t.width = v)} />
            <Opt label="Pases" value={t.passing} opts={[['corto', 'Cortos'], ['mixto', 'Mixtos'], ['largo', 'Directos']]} on={v => (t.passing = v)} />
            <Opt label="Fuera de juego" value={t.offside ? 1 : 0} opts={[[1, 'Sí'], [0, 'No']]} on={v => (t.offside = v === 1)} />
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>Capitán: {nm(gs, t.captain)} · Penaltis: {nm(gs, t.penalty)} · Faltas: {nm(gs, t.freekick)} · Córners: {nm(gs, t.corner)} <span>(asígnalos desde la ficha del jugador)</span></div>
        </div>
        <div className="panel tight">
          <div className="tablewrap" style={{ maxHeight: '56vh' }}>
            <table className="t">
              <thead><tr><th>#</th><th>Pos</th><th>Banquillo ({bench.length}/9)</th><th className="c">Med</th><th>Físico</th><th></th></tr></thead>
              <tbody>
                {bench.map(id => <PlRow key={id} p={P(id)!} where="Suplente" />)}
                <tr><th colSpan={6}>Reservas</th></tr>
                {reserves.map(p => <PlRow key={p.id} p={p} where="" />)}
                {bench.length < 9 && <tr><td colSpan={6}><button className="btn sm" onClick={() => { const add = reserves.filter(available).slice(0, 9 - bench.length).map(p => p.id); club.bench = [...club.bench, ...add]; refresh(); }}>Completar banquillo</button></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

const nm = (gs: ReturnType<typeof useGame>['gs'], id?: number) => (id && gs.players[id]?.clubId === gs.manager.clubId ? gs.players[id].name : 'automático');
export function shortName(n: string) { const p = n.split(' '); return p.length > 1 ? p.slice(-1)[0].length > 3 ? p.slice(-1)[0] : p.slice(-2).join(' ') : n; }
export function textOn(hex: string) { const n = parseInt(hex.replace('#', '').slice(0, 6), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 150 ? '#0b1220' : '#ffffff'; }

/** Pitch token: the player's photo framed in club colours, or a numbered shirt disc. */
function Shirt({ p, bg, border, fg }: { p?: TPlayer | null; bg: string; border: string; fg: string }) {
  const photo = useMedia().photo(p?.name ?? '', p?.born ?? 0);
  if (p && photo && !isBroken(photo)) {
    return (
      <div className="shirt photo" style={{ borderColor: bg, background: bg }}>
        <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => markBroken(photo)} />
        <span className="sn" style={{ background: bg, color: fg, borderColor: border }}>{p.num}</span>
      </div>
    );
  }
  return <div className="shirt" style={{ background: bg, borderColor: border, color: fg }}>{p?.num ?? '?'}</div>;
}

/** One-click playing styles: each sets several team instructions at once (the engine reads them all). */
const STYLES: { name: string; desc: string; set: Partial<import('@/game/types').Tactics> }[] = [
  { name: 'Contraataque', desc: 'Bloque medio, transiciones rápidas y pase directo.', set: { mentality: -1, pressing: 1, tempo: 3, width: 2, passing: 'largo' } },
  { name: 'Posesión', desc: 'Pase corto, ritmo pausado y amplitud.', set: { mentality: 0, pressing: 2, tempo: 1, width: 3, passing: 'corto' } },
  { name: 'Presión alta', desc: 'Robar arriba y atacar en vertical. Desgasta mucho.', set: { mentality: 1, pressing: 3, tempo: 3, width: 2, passing: 'mixto' } },
  { name: 'Juego directo', desc: 'Balones largos y centros desde las bandas.', set: { mentality: 1, pressing: 2, tempo: 2, width: 3, passing: 'largo' } },
  { name: 'Autobús', desc: 'Defensa muy baja y estrecha para proteger un resultado.', set: { mentality: -2, pressing: 1, tempo: 1, width: 1, passing: 'largo' } },
  { name: 'Equilibrado', desc: 'Sin riesgos: todo en valores medios.', set: { mentality: 0, pressing: 2, tempo: 2, width: 2, passing: 'mixto' } },
];
