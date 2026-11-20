'use client';
import { Fragment, useMemo, useState } from 'react';
import {
  age, armyMen, armiesOf, atWar, isHostile, livingNations, peaceCost, provincesOf, relation, rules, sideOf, topLiege, vassalsOf, warScore,
} from '@/engine/core';
import type { ActionDef } from '@/engine/ruleset';
import type { Command, GameState } from '@/engine/types';
import { formatDate } from '@/engine/util';
import { stat } from '@/rulesets/common';
import Arms from './Arms';
import DynastyPanel from './DynastyPanel';
import { ChroniclePanel, LedgerPanel, MissionsPanel, readyMissions } from './StoryPanels';
import Portrait from './Portrait';
import { artEra, leaderPortrait, portraitFor } from '@/lib/art';

export type Tab = 'province' | 'army' | 'nation' | 'diplomacy' | 'wars' | 'court' | 'queue' | 'log' | 'missions' | 'ledger';

interface Props {
  sheet?: 'min' | 'half' | 'full'; setSheet?: (v: 'min' | 'half' | 'full') => void;
  s: GameState; version: number; tab: Tab; setTab: (t: Tab) => void;
  prov: string | null; setProv: (p: string | null) => void; army: string | null; setArmy: (a: string | null) => void;
  cmd: (c: Command) => string | null; notify: (t: string) => void; refresh: () => void;
}

export default function Panels(p: Props) {
  const { s, tab, setTab } = p;
  const tabs: [Tab, string][] = [['province', 'Provincia'], ['army', 'Ejército'], ['nation', 'Estado'], ['diplomacy', 'Diplomacia'], ['wars', `Guerras${atWar(s, s.player) ? ' ⚔' : ''}`], ...(s.era !== 'ww2' ? [['court', s.era === 'medieval' ? 'Dinastía' : 'Corte'] as [Tab, string]] : []), ['queue', 'Producción'], ['missions', `Objetivos${readyMissions(s) ? ` (${readyMissions(s)})` : ''}`], ['ledger', 'Potencias'], ['log', 'Crónica']];
  return (
    <div className="side">
      {p.setSheet && <button className="grip" aria-label="Mostrar u ocultar el panel" onClick={() => p.setSheet!(p.sheet === 'min' ? 'half' : p.sheet === 'half' ? 'full' : 'min')}><span /></button>}
      <div className="tabs">{tabs.map(([id, label]) => <button key={id} className={`${tab === id ? 'on' : ''} ${id === 'missions' && readyMissions(s) ? 'glow' : ''}`} onClick={() => setTab(id)}>{label}</button>)}</div>
      <div className="content">
        {tab === 'province' && <ProvincePanel {...p} />}
        {tab === 'army' && <ArmyPanel {...p} />}
        {tab === 'nation' && <NationPanel {...p} />}
        {tab === 'diplomacy' && <DiplomacyPanel {...p} />}
        {tab === 'wars' && <WarsPanel {...p} />}
        {tab === 'court' && <DynastyPanel {...p} />}
        {tab === 'queue' && <QueuePanel {...p} />}
        {tab === 'log' && <ChroniclePanel {...p} />}
        {tab === 'missions' && <MissionsPanel {...p} />}
        {tab === 'ledger' && <LedgerPanel {...p} />}
      </div>
    </div>
  );
}

function KV({ items }: { items: { label: string; value: string }[] }) {
  return <dl className="kv">{items.map((i) => <Fragment key={i.label}><dt>{i.label}</dt><dd>{i.value}</dd></Fragment>)}</dl>;
}

const TERRAIN: Record<string, string> = { p: 'Llanura', f: 'Bosque', h: 'Colinas', m: 'Montaña', w: 'Pantano', d: 'Desierto', j: 'Selva' };

function ProvincePanel({ s, prov, setArmy, setTab, cmd, refresh }: Props) {
  if (!prov) return <div className="muted">Selecciona una provincia en el mapa.</div>;
  const p = s.provinces[prov];
  const r = rules(s);
  const owner = p.owner ? s.nations[p.owner] : null;
  const here = Object.values(s.armies).filter((a) => a.location === prov);
  const actions = r.actions.filter((a) => a.scope === 'province');
  return (
    <>
      <div className="prov-banner" style={{ backgroundImage: `linear-gradient(180deg, #0000 15%, #000b 100%), url(/art/terrain/${p.terrain}.jpg)`, ['--nc' as string]: owner?.color ?? '#555' }}>
        {owner && <Arms tag={owner.tag} color={owner.color} size={38} />}
        <div><h2>{p.name}</h2><span>{TERRAIN[p.terrain]}{owner ? ` · ${owner.name}` : ''}</span></div>
      </div>
      <div className="section">
        <KV items={[
          { label: 'Propietario', value: owner ? `${owner.name}${owner.liege ? ` (vasallo de ${s.nations[owner.liege]?.name})` : ''}` : 'Sin dueño' },
          ...(p.controller && p.controller !== p.owner ? [{ label: 'Ocupada por', value: s.nations[p.controller]?.name ?? p.controller }] : []),
          { label: 'Terreno', value: TERRAIN[p.terrain] },
          { label: 'Núcleos', value: p.cores.map((c) => s.nations[c]?.name ?? c).join(', ') || '—' },
          ...(p.siege ? [{ label: 'Asedio', value: `${s.nations[p.siege.by]?.name ?? p.siege.by}: ${Math.round((p.siege.progress / r.siegeBaseDays) * 100)} %` }] : []),
          ...r.provinceStats(s, p),
        ]} />
      </div>
      {here.length > 0 && (
        <div className="section"><h3>Ejércitos</h3><div className="list">
          {here.map((a) => (
            <div key={a.id} className="item click" onClick={() => { setArmy(a.id); setTab('army'); }}>
              <span className="swatch" style={{ background: s.nations[a.owner]?.color ?? '#111' }} /> {a.name} · {a.units.length} unidades · {armyMen(s, a).toLocaleString('es')} hombres
            </div>
          ))}
        </div></div>
      )}
      {actions.length > 0 && (
        <div className="section"><h3>Acciones</h3><div className="col">
          {actions.map((a) => <ActionForm key={a.id} s={s} def={a} fixed={{ province: prov }} cmd={cmd} refresh={refresh} />)}
        </div></div>
      )}
    </>
  );
}

function ArmyPanel({ s, army, setArmy, cmd }: Props) {
  const a = army ? s.armies[army] : null;
  const mine = armiesOf(s, s.player);
  if (!a) {
    return (
      <div className="section"><h3>Tus ejércitos</h3><div className="list">
        {mine.length === 0 && <div className="muted">No tienes ejércitos. Recluta desde una provincia o desde Producción.</div>}
        {mine.map((x) => <div key={x.id} className="item click" onClick={() => setArmy(x.id)}>{x.name} · {s.provinces[x.location].name} · {x.units.length} u.{x.inBattle ? ' ⚔' : ''}{x.path.length ? ' → ' + s.provinces[x.path[x.path.length - 1]].name : ''}</div>)}
      </div></div>
    );
  }
  const r = rules(s);
  const leader = a.leaderId ? s.characters[a.leaderId] : null;
  const own = a.owner === s.player;
  const counts: Record<string, { n: number; str: number; org: number }> = {};
  for (const u of a.units) { const c = (counts[u.type] ??= { n: 0, str: 0, org: 0 }); c.n++; c.str += u.str; c.org += u.org; }
  const sameLoc = mine.filter((x) => x.location === a.location && x.id !== a.id);
  return (
    <>
      <div className="section">
        <h2>{a.name}</h2>
        <KV items={[
          { label: 'Bandera', value: a.owner === 'REB' ? 'Rebeldes' : s.nations[a.owner]?.name },
          { label: 'Ubicación', value: s.provinces[a.location].name },
          { label: 'Destino', value: a.path.length ? a.path.map((x) => s.provinces[x].name).join(' → ') : '—' },
          { label: 'Efectivos', value: armyMen(s, a).toLocaleString('es') },
          { label: 'Mando', value: leader ? `${leader.name} (marcial ${stat(leader, 'martial')})` : 'Sin general' },
          { label: 'Estado', value: a.inBattle ? 'En batalla' : a.retreating ? 'En retirada' : a.path.length ? 'En marcha' : 'Acampado' },
        ]} />
      </div>
      <div className="section"><h3>Unidades</h3>
        <div className="unit muted"><span>Tipo</span><span>Fuerza</span><span>Moral</span></div>
        {Object.entries(counts).map(([t, c]) => (
          <div key={t} className="unit"><span>{c.n}× {r.unitTypes[t]?.name ?? t}</span><div className="bar"><div style={{ width: `${(c.str / c.n) * 100}%` }} /></div><div className="bar"><div style={{ width: `${(c.org / c.n) * 100}%`, background: '#7bd17b' }} /></div></div>
        ))}
      </div>
      {own && (
        <div className="row">
          <button onClick={() => cmd({ type: 'split', armyId: a.id })}>Dividir</button>
          {sameLoc.length > 0 && <button onClick={() => cmd({ type: 'merge', armyIds: [a.id, ...sameLoc.map((x) => x.id)] })}>Fusionar ({sameLoc.length + 1})</button>}
          {a.path.length > 0 && <button onClick={() => cmd({ type: 'stop', armyId: a.id })}>Detener</button>}
          <button className="danger" onClick={() => { if (confirm('¿Licenciar este ejército?')) { cmd({ type: 'disband', armyId: a.id }); setArmy(null); } }}>Licenciar</button>
          <button className="ghost" onClick={() => setArmy(null)}>Lista</button>
        </div>
      )}
      {own && <p className="muted" style={{ fontSize: 12 }}>Para mover: con el ejército seleccionado, haz clic derecho (o toca, en móvil) en la provincia de destino.</p>}
    </>
  );
}

function NationPanel({ s, cmd, refresh }: Props) {
  const r = rules(s);
  const n = s.nations[s.player];
  const groups = useMemo(() => {
    const g: Record<string, ActionDef[]> = {};
    for (const a of r.actions) if (a.scope !== 'province' && !a.hidden) (g[a.group] ??= []).push(a);
    return g;
  }, [r]);
  const inc = Object.entries(n.lastIncome);
  return (
    <>
      <div className="section">
        <div className="realm-head">
          <Portrait src={n.rulerId && s.characters[n.rulerId] ? portraitFor(s, s.characters[n.rulerId]) : leaderPortrait(artEra(s), n.tag)} color={n.color} size={64} />
          <h2><Arms tag={n.tag} color={n.color} size={34} /> {n.name}</h2>
        </div>
        <KV items={[{ label: 'Capital', value: s.provinces[n.capital]?.name ?? '—' }, { label: 'Provincias', value: String(provincesOf(s, n.tag).length) }, ...r.nationStats(s, s.player)]} />
      </div>
      {inc.length > 0 && <div className="section"><h3>Balance mensual</h3><KV items={inc.map(([k, v]) => ({ label: k, value: v.toFixed(1) }))} /></div>}
      {Object.entries(groups).map(([g, list]) => (
        <div key={g} className="section"><h3>{g}</h3><div className="col">
          {list.map((a) => <ActionForm key={a.id} s={s} def={a} cmd={cmd} refresh={refresh} />)}
        </div></div>
      ))}
    </>
  );
}

export function ActionForm({ s, def, fixed = {}, cmd }: { s: GameState; def: ActionDef; fixed?: Record<string, string>; cmd: (c: Command) => string | null; refresh: () => void }) {
  const r = rules(s);
  const n = s.nations[s.player];
  const prefill = () => {
    const v: Record<string, string | number> = { ...fixed };
    for (const a of def.args ?? []) {
      if (v[a.key] !== undefined) continue;
      if (a.kind === 'number') v[a.key] = n.x[`bud_${a.key}`] ?? n.x[`al_${a.key}`] ?? 1;
      if (a.kind === 'choice') v[a.key] = a.options?.[0]?.value ?? '';
      if (a.kind === 'unit') v[a.key] = Object.keys(r.unitTypes)[0];
    }
    return v;
  };
  const [args, setArgs] = useState<Record<string, string | number>>(prefill);
  const [open, setOpen] = useState(false);
  const ok = def.available ? def.available(s, s.player, { ...args, ...fixed }) : true;
  const cost = def.cost?.(s, s.player, { ...args, ...fixed });
  const set = (k: string, v: string | number) => setArgs((x) => ({ ...x, [k]: v }));
  const family = Object.values(s.characters).filter((c) => c.alive && c.tag === s.player).sort((a, b) => a.born - b.born);
  return (
    <details className="action" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>{def.label}</summary>
      {open && (<>
        <div className="desc">{def.description}</div>
        <div className="col">
          {(def.args ?? []).filter((a) => fixed[a.key] === undefined).map((a) => (
            <label key={a.key}>{a.label}
              {a.kind === 'number' && <input type="number" value={args[a.key] ?? ''} onChange={(e) => set(a.key, Number(e.target.value))} />}
              {a.kind === 'choice' && <select value={String(args[a.key] ?? '')} onChange={(e) => set(a.key, e.target.value)}>{a.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
              {a.kind === 'unit' && <select value={String(args[a.key] ?? '')} onChange={(e) => set(a.key, e.target.value)}>{Object.values(r.unitTypes).map((u) => <option key={u.id} value={u.id}>{u.name} ({u.cost})</option>)}</select>}
              {a.kind === 'nation' && <select value={String(args[a.key] ?? '')} onChange={(e) => set(a.key, e.target.value)}><option value="">—</option>{livingNations(s).filter((x) => x.tag !== s.player).sort((x, y) => x.name.localeCompare(y.name)).map((x) => <option key={x.tag} value={x.tag}>{x.name}</option>)}</select>}
              {a.kind === 'character' && <select value={String(args[a.key] ?? '')} onChange={(e) => set(a.key, e.target.value)}><option value="">—</option>{family.map((c) => <option key={c.id} value={c.id}>{c.name} de {c.dynasty} ({age(s, c)}){c.spouse ? ' · casado' : ''}</option>)}</select>}
              {a.kind === 'province' && <select value={String(args[a.key] ?? '')} onChange={(e) => set(a.key, e.target.value)}><option value="">—</option>{Object.values(s.provinces).sort((x, y) => x.name.localeCompare(y.name)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
            </label>
          ))}
          {cost && <div className="muted" style={{ fontSize: 12 }}>Coste: {cost}</div>}
          {ok !== true && <div className="reason">{ok}</div>}
          <button className="primary" disabled={ok !== true} onClick={() => { const err = cmd({ type: 'action', id: def.id, args: { ...args, ...fixed } }); if (!err) setOpen(def.args?.some((x) => x.kind === 'number') ?? false); }}>Ejecutar</button>
        </div>
      </>)}
    </details>
  );
}

function DiplomacyPanel({ s, cmd }: Props) {
  const me = s.nations[s.player];
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const list = livingNations(s).filter((n) => n.tag !== s.player && n.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => provincesOf(s, b.tag).length - provincesOf(s, a.tag).length);
  const t = sel ? s.nations[sel] : null;
  const myClaims = t ? provincesOf(s, t.tag).filter((p) => me.claims.includes(p.id) || p.cores.includes(s.player)) : [];
  const [goal, setGoal] = useState('');
  return (
    <>
      {t && (
        <div className="section">
          <div className="realm-head">
            <Portrait src={t.rulerId && s.characters[t.rulerId] ? portraitFor(s, s.characters[t.rulerId]) : leaderPortrait(artEra(s), t.tag)} color={t.color} size={58} />
            <h2><Arms tag={t.tag} color={t.color} size={34} /> {t.name}</h2>
          </div>
          <KV items={[
            { label: 'Relaciones', value: String(relation(s, s.player, t.tag)) },
            { label: 'Provincias', value: String(provincesOf(s, t.tag).length) },
            { label: 'Gobierno', value: t.government },
            { label: 'Religión', value: t.religion },
            { label: 'Aliados', value: t.allies.map((a) => s.nations[a]?.name).join(', ') || '—' },
            { label: 'Señor', value: t.liege ? s.nations[t.liege]?.name : 'Independiente' },
            { label: 'Vasallos', value: vassalsOf(s, t.tag).map((v) => v.name).join(', ') || '—' },
            ...(t.faction ? [{ label: 'Bloque', value: s.factions[t.faction]?.name ?? t.faction }] : []),
            ...(me.truces[t.tag] ? [{ label: 'Tregua hasta', value: formatDate(me.truces[t.tag]) }] : []),
            ...(t.rulerId && s.characters[t.rulerId] ? [{ label: 'Soberano', value: `${s.characters[t.rulerId].name} de ${s.characters[t.rulerId].dynasty}` }] : []),
          ]} />
          <div className="col" style={{ marginTop: 8 }}>
            <div className="row">
              <button onClick={() => cmd({ type: 'improveRelations', target: t.tag })}>Mejorar relaciones (25)</button>
              {me.allies.includes(t.tag)
                ? <button onClick={() => cmd({ type: 'breakAlliance', target: t.tag })}>Romper alianza</button>
                : <button onClick={() => cmd({ type: 'proposeAlliance', target: t.tag })}>Proponer alianza</button>}
            </div>
            {!isHostile(s, s.player, t.tag) && topLiege(s, t.tag) !== s.player && (
              <div className="row">
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="">Sin casus belli</option>
                  {myClaims.map((p) => <option key={p.id} value={p.id}>Reclamar {p.name}</option>)}
                </select>
                <button className="danger" onClick={() => { if (confirm(`¿Declarar la guerra a ${t.name}?`)) cmd({ type: 'declareWar', target: t.tag, goal: goal || null }); }}>Declarar la guerra</button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="section">
        <h3>Naciones</h3>
        <input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
        <div className="list">
          {list.map((n) => {
            const rel = relation(s, s.player, n.tag);
            const st = isHostile(s, s.player, n.tag) ? '⚔ guerra' : me.allies.includes(n.tag) ? '🤝 aliado' : n.liege === s.player ? 'vasallo' : '';
            return (
              <div key={n.tag} className="item click row" onClick={() => setSel(n.tag)} style={sel === n.tag ? { borderColor: 'var(--accent)' } : undefined}>
                <Arms tag={n.tag} color={n.color} size={18} /><span className="grow">{n.name}</span>
                <span className="muted">{st}</span><span style={{ color: rel >= 0 ? '#9fd39f' : '#e69b8b' }}>{rel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function WarsPanel({ s, cmd }: Props) {
  const r = rules(s);
  const wars = s.wars.filter((w) => sideOf(w, s.player));
  const [warId, setWarId] = useState<string | null>(wars[0]?.id ?? null);
  const w = wars.find((x) => x.id === warId) ?? wars[0];
  const [target, setTarget] = useState('');
  const [provs, setProvs] = useState<string[]>([]);
  const [gold, setGold] = useState(0);
  const [extra, setExtra] = useState('');
  if (!w) return <div className="muted">No estás en guerra. Puedes declararla desde Diplomacia.</div>;
  const side = sideOf(w, s.player)!;
  const enemies = side === 'att' ? w.defenders : w.attackers;
  const friends = side === 'att' ? w.attackers : w.defenders;
  const tgt = target && enemies.includes(target) ? target : enemies[0];
  const pool = Object.values(s.provinces).filter((p) => p.owner && (tgt === enemies[0] ? enemies.includes(p.owner) : p.owner === tgt))
    .sort((a, b) => Number(friends.includes(b.controller ?? '')) - Number(friends.includes(a.controller ?? '')));
  const ws = warScore(s, w, s.player);
  const validProvs = provs.filter((p) => pool.some((x) => x.id === p));
  const cost = peaceCost(s, w, s.player, tgt, validProvs, gold, extra || null);
  return (
    <>
      <div className="section">
        <div className="row">{wars.map((x) => <button key={x.id} className={x.id === w.id ? 'primary' : ''} onClick={() => setWarId(x.id)}>{x.name}</button>)}</div>
      </div>
      <div className="section">
        <h2>{w.name}</h2>
        <KV items={[
          { label: 'Inicio', value: formatDate(w.start) },
          { label: 'Atacantes', value: w.attackers.map((t) => s.nations[t]?.name).join(', ') },
          { label: 'Defensores', value: w.defenders.map((t) => s.nations[t]?.name).join(', ') },
          { label: 'Objetivo', value: w.goal ? s.provinces[w.goal]?.name ?? w.goal : 'Ninguno' },
          { label: 'Batallas', value: String(side === 'att' ? w.battleScore : -w.battleScore) },
        ]} />
        <div style={{ marginTop: 8 }}>Puntuación de guerra: <b style={{ color: ws >= 0 ? '#9fd39f' : '#e69b8b' }}>{ws}</b></div>
        <div className="bar" style={{ marginTop: 4 }}><div style={{ width: `${(ws + 100) / 2}%` }} /></div>
      </div>
      <div className="section">
        <h3>Negociar la paz</h3>
        <div className="col">
          <label className="muted">Con
            <select value={tgt} onChange={(e) => { setTarget(e.target.value); setProvs([]); }}>{enemies.map((t) => <option key={t} value={t}>{s.nations[t]?.name}{t === enemies[0] && friends[0] === s.player ? ' (líder: paz general)' : ' (paz por separado)'}</option>)}</select>
          </label>
          <div className="list" style={{ maxHeight: 200, overflow: 'auto' }}>
            {pool.map((p) => (
              <label key={p.id} className="chk">
                <input type="checkbox" checked={provs.includes(p.id)} onChange={(e) => setProvs((x) => (e.target.checked ? [...x, p.id] : x.filter((y) => y !== p.id)))} />
                {p.name} <span className="muted">({s.nations[p.owner!]?.name}{friends.includes(p.controller ?? '') ? ', ocupada por tu bando' : ''}) · valor {r.provinceValue(s, p)}</span>
              </label>
            ))}
          </div>
          <label className="muted">Oro / reparaciones <input type="number" min={0} value={gold} onChange={(e) => setGold(Number(e.target.value))} /></label>
          <label className="muted">Condición especial
            <select value={extra} onChange={(e) => setExtra(e.target.value)}><option value="">Ninguna</option>{r.peaceExtras.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
          </label>
          <div className="muted">Coste de las exigencias: <b>{cost}</b> / tu puntuación: <b>{ws}</b> {validProvs.length === 0 && !gold && !extra ? '(paz blanca)' : ''}</div>
          <div className="row">
            <button className="primary" onClick={() => { const err = cmd({ type: 'offerPeace', warId: w.id, target: tgt, provinces: validProvs, gold, extra: extra || null }); if (!err) setProvs([]); }}>Enviar propuesta</button>
            <button onClick={() => cmd({ type: 'offerPeace', warId: w.id, target: tgt, provinces: [], gold: 0, extra: null })}>Pedir paz blanca</button>
          </div>
        </div>
      </div>
    </>
  );
}


function QueuePanel({ s, cmd, refresh }: Props) {
  const n = s.nations[s.player];
  const r = rules(s);
  const produce = r.actions.find((a) => a.id === 'produce' || a.id === 'recruit');
  return (
    <>
      <div className="section"><h3>En curso</h3>
        <div className="list">
          {n.queue.length === 0 && <div className="muted">Nada en producción.</div>}
          {n.queue.map((q) => (
            <div key={q.id} className="item">
              {q.label}<div className="bar" style={{ marginTop: 4 }}><div style={{ width: `${Math.min(100, (q.progress / q.cost) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      {produce && produce.scope !== 'province' && <div className="section"><ActionForm s={s} def={produce} cmd={cmd} refresh={refresh} /></div>}
      {produce?.scope === 'province' && <ActionForm s={s} def={produce} fixed={{ province: n.capital }} cmd={cmd} refresh={refresh} />}
    </>
  );
}

