import {
  addRelation, annex, armiesOf, atWar, isFriendly, isHostile, joinFaction, livingNations, log, militaryPower,
  provincesOf, registerRuleset, relation, spawnArmy, transferProvince, warsOf,
} from '@/engine/core';
import { neighbours } from '@/engine/map';
import type { ActionDef, Ruleset, UnitType } from '@/engine/ruleset';
import type { GameState, Nation } from '@/engine/types';
import { chance, clamp, pick } from '@/engine/util';

// costs are IC-days; manpower in men
const U = (id: string, name: string, attack: number, defence: number, speed: number, siege: number, cost: number, manpower: number, buildDays: number): UnitType =>
  ({ id, name, attack, defence, speed, siege, cost, manpower, upkeep: 0, buildDays, size: manpower });

const unitTypes: Record<string, UnitType> = {
  militia: U('militia', 'Milicia', 0.6, 1, 1, 0.5, 120, 10000, 60),
  infantry: U('infantry', 'División de infantería', 1, 1.6, 1, 1, 360, 12000, 90),
  mountain: U('mountain', 'Cazadores de montaña', 1.2, 1.7, 1, 1, 450, 12000, 110),
  cavalry: U('cavalry', 'Caballería', 1, 1, 1.5, 0.8, 300, 10000, 90),
  motorized: U('motorized', 'Infantería motorizada', 1.3, 1.6, 1.8, 1.2, 700, 12000, 120),
  armor: U('armor', 'División acorazada', 3, 1.8, 1.8, 1.5, 1100, 10000, 150),
  marines: U('marines', 'Infantería de marina', 1.1, 1.3, 1, 1, 500, 10000, 120),
  artillery: U('artillery', 'Artillería pesada', 1.6, 0.9, 0.8, 2.5, 420, 8000, 100),
  drones: U('drones', 'Unidad de drones', 2.1, 0.7, 2.2, 1.2, 380, 3000, 60),
  ai_swarm: U('ai_swarm', 'Sistemas autónomos de IA', 3.6, 1.4, 2.4, 2, 1300, 2000, 160),
};
/** units of the classic 1936–45 scenarios; others need scenario options or an unlock */
const CLASSIC = ['militia', 'infantry', 'mountain', 'cavalry', 'motorized', 'armor', 'marines'];
export const allowedUnit = (s: GameState, n: Nation, id: string) => (s.options?.allowedUnits ?? CLASSIC).includes(id) || (n.x[`unlock_${id}`] ?? 0) > 0;
const SPECIAL: Record<string, { name: string; cost: number; days: number; key: string }> = {
  fighters: { name: 'Ala de cazas', cost: 500, days: 100, key: 'fighters' },
  bombers: { name: 'Ala de bombarderos', cost: 700, days: 120, key: 'bombers' },
  navy: { name: 'Flotilla de superficie', cost: 1500, days: 300, key: 'navy' },
  submarines: { name: 'Flotilla de submarinos', cost: 600, days: 150, key: 'subs' },
  factory: { name: 'Fábrica (+1 CI)', cost: 600, days: 270, key: 'factory' },
};
const TECHS: Record<string, string> = { infantry: 'Infantería', armor: 'Blindados', air: 'Aviación', naval: 'Naval', industry: 'Industria', doctrine: 'Doctrina', ai: 'IA y sistemas autónomos' };
const techKeys = (s: GameState) => Object.keys(TECHS).filter((k) => k !== 'ai' || s.options?.aiRace);
const ALLOC = ['prod', 'supply', 'reinf', 'cg', 'upg'] as const;
const ALLOC_LABEL: Record<string, string> = { prod: 'Producción', supply: 'Suministros', reinf: 'Refuerzos', cg: 'Bienes de consumo', upg: 'Mejoras' };
const IDEOLOGY_FACTION: Record<string, string> = { fascist: 'axis', democracy: 'allies', communist: 'comintern' };

function baseIC(s: GameState, n: Nation) {
  return provincesOf(s, n.tag).reduce((t, p) => t + (p.controller === n.tag ? (p.x.ic ?? 0) : 0), 0) + (n.x.factory ?? 0);
}
function resourceIncome(s: GameState, n: Nation) {
  const r = { energy: 0, metal: 0, rare: 0, oil: 0 };
  for (const p of provincesOf(s, n.tag)) if (p.controller === n.tag) {
    r.energy += p.x.energy ?? 0; r.metal += p.x.metal ?? 0; r.rare += p.x.rare ?? 0; r.oil += p.x.oil ?? 0;
  }
  return r;
}
function effectiveIC(s: GameState, n: Nation) {
  const ic = baseIC(s, n) * (1 + (n.tech.industry ?? 0) * 0.08);
  const shortage = ['energy', 'metal', 'rare'].some((k) => (n.x[`stock_${k}`] ?? 0) <= 0) ? 0.6 : 1;
  const dissent = 1 - (n.x.dissent ?? 0) / 150;
  const bombed = 1 - Math.min(0.4, (n.x.bombed ?? 0) / 100);
  return ic * shortage * dissent * bombed;
}
const techCost = (n: Nation, k: string) => 60 + 45 * Math.pow((n.tech[k] ?? 0) + 1, 1.3);

/** provinces connected to the capital through friendly-controlled land (or the sea with naval superiority) */
// supply networks change slowly: recompute each nation's at most every 5 days (or when its wars change)
const supplyCache = new WeakMap<GameState, Map<string, { day: number; wars: number; set: Set<string> }>>();
function supplied(s: GameState, n: Nation): Set<string> {
  let m = supplyCache.get(s);
  if (!m) { m = new Map(); supplyCache.set(s, m); }
  const wars = s.wars.length * 1000 + s.wars.reduce((t, w) => t + w.attackers.length + w.defenders.length, 0);
  const hit = m.get(n.tag);
  if (hit && s.day - hit.day < 5 && hit.wars === wars) return hit.set;
  const set = computeSupplied(s, n);
  m.set(n.tag, { day: s.day, wars, set });
  return set;
}
function computeSupplied(s: GameState, n: Nation): Set<string> {
  const seen = new Set<string>();
  const roots = provincesOf(s, n.tag).filter((p) => p.controller === n.tag && (p.id === n.capital || p.x.ic)).map((p) => p.id);
  for (const al of n.allies) { const a = s.nations[al]; if (a?.alive && s.provinces[a.capital]?.controller === al) roots.push(a.capital); }
  const queue = [...roots];
  const sea = navalSuperiority(s, n.tag);
  while (queue.length) {
    const c = queue.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    for (const e of neighbours(s, c)) {
      if (e.sea && !sea) continue;
      if (isFriendly(s, n.tag, s.provinces[e.to].controller)) queue.push(e.to);
    }
  }
  return seen;
}
function enemyNaval(s: GameState, tag: string) {
  const enemies = new Set<string>();
  for (const w of warsOf(s, tag)) for (const t of (w.attackers.includes(tag) ? w.defenders : w.attackers)) enemies.add(t);
  return [...enemies].reduce((t, e) => t + (s.nations[e]?.x.navy ?? 0) * (1 + (s.nations[e]?.tech.naval ?? 0) * 0.1), 0);
}
function navalSuperiority(s: GameState, tag: string) {
  const n = s.nations[tag];
  if (!n) return false;
  const mine = (n.x.navy ?? 0) * (1 + (n.tech.naval ?? 0) * 0.1) + n.allies.reduce((t, a) => t + (s.nations[a]?.x.navy ?? 0) * 0.5, 0);
  return mine >= enemyNaval(s, tag) * 0.7;
}
function airPower(s: GameState, tag: string) {
  const n = s.nations[tag];
  return ((n?.x.fighters ?? 0) + (n?.x.bombers ?? 0) * 1.2) * (1 + (n?.tech.air ?? 0) * 0.1);
}

const actions: ActionDef[] = [
  {
    id: 'produce', label: 'Ordenar producción', group: 'Producción',
    description: 'Añade una división, ala aérea, flotilla o fábrica a la cola. Avanza con la CI asignada a producción.',
    args: [{ key: 'item', label: 'Elemento', kind: 'choice', options: [
      ...Object.values(unitTypes).map((u) => ({ value: u.id, label: `${u.name} (${u.cost} CI·día, ${(u.manpower / 1000).toFixed(0)}k hombres)` })),
      ...Object.entries(SPECIAL).map(([k, v]) => ({ value: k, label: `${v.name} (${v.cost} CI·día)` })),
    ] }, { key: 'count', label: 'Cantidad', kind: 'number' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const u = unitTypes[a.item as string];
      if (u && s.nations[tag].manpower < u.manpower * Math.max(1, Number(a.count || 1))) return 'Mano de obra insuficiente';
      if (u && !allowedUnit(s, s.nations[tag], u.id)) return 'No disponible en esta época';
      if (a.item === 'armor' && (s.nations[tag].tech.armor ?? 0) < 1) return 'Requiere Blindados 1';
      if (a.item === 'ai_swarm' && (s.nations[tag].tech.ai ?? 0) < 3) return 'Requiere IA y sistemas autónomos 3';
      if (a.item === 'drones' && (s.nations[tag].tech.air ?? 0) < 2) return 'Requiere Aviación 2';
      if ((a.item === 'navy' || a.item === 'submarines') && !provincesOf(s, tag).some((p) => p.coastal)) return 'Sin costa';
      return u || SPECIAL[a.item as string] ? true : 'Elige elemento';
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const count = clamp(Number(a.count || 1), 1, 20);
      for (let i = 0; i < count; i++) {
        const u = unitTypes[a.item as string];
        const sp = SPECIAL[a.item as string];
        if (u) n.manpower -= u.manpower;
        n.queue.push({ id: `q${s.nextId++}`, kind: u ? 'unit' : 'special', label: u?.name ?? sp.name, progress: 0, cost: u?.cost ?? sp.cost, data: { item: a.item, days: u?.buildDays ?? sp.days } });
      }
    },
  },
  {
    id: 'cancel', label: 'Cancelar producción', group: 'Producción',
    description: 'Elimina el último elemento de la cola.',
    run: (s, tag) => {
      const q = s.nations[tag].queue.pop();
      const u = q && unitTypes[q.data?.item as string];
      if (u) s.nations[tag].manpower += u.manpower;
    },
  },
  {
    id: 'allocate', label: 'Reparto de la CI', group: 'Industria',
    description: 'Porcentaje de la capacidad industrial destinado a cada uso (suma 100).',
    args: ALLOC.map((k) => ({ key: k, label: ALLOC_LABEL[k], kind: 'number' as const })),
    available: (_s, _t, a) => (!a || Math.abs(ALLOC.reduce((t, k) => t + Number(a[k] ?? 0), 0) - 100) < 1 ? true : 'Debe sumar 100 %'),
    run: (s, tag, a) => { for (const k of ALLOC) s.nations[tag].x[`al_${k}`] = Number(a[k]); },
  },
  {
    id: 'research', label: 'Elegir investigación', group: 'Investigación',
    description: 'Fija la rama tecnológica que investigan tus equipos.',
    args: [{ key: 'tech', label: 'Rama', kind: 'choice', options: Object.entries(TECHS).map(([k, v]) => ({ value: k, label: v })) }],
    available: (s, _tag, a) => (!a || a.tech !== 'ai' || s.options?.aiRace ? true : 'No disponible en esta época'),
    run: (s, tag, a) => { s.nations[tag].flags[`research_${a.tech}`] = s.day; s.nations[tag].x.researchIdx = Object.keys(TECHS).indexOf(a.tech as string); },
  },
  {
    id: 'join_faction', label: 'Unirse a una alianza', group: 'Diplomacia',
    description: 'Entra en el bloque afín a tu ideología. Sus miembros se defienden mutuamente.',
    args: [{ key: 'faction', label: 'Bloque', kind: 'choice', options: [{ value: 'axis', label: 'Eje' }, { value: 'allies', label: 'Aliados' }, { value: 'comintern', label: 'Komintern' }] }],
    available: (s, tag, a) => {
      const n = s.nations[tag];
      if (n.faction) return 'Ya perteneces a un bloque';
      if (!a) return true;
      const f = a.faction as string;
      if (!s.factions[f]) return 'Bloque inexistente';
      if (IDEOLOGY_FACTION[n.government] && IDEOLOGY_FACTION[n.government] !== f) return 'Ideología incompatible';
      return relation(s, tag, s.factions[f].leader) >= 0 || IDEOLOGY_FACTION[n.government] === f ? true : 'El líder del bloque te rechaza';
    },
    run: (s, tag, a) => joinFaction(s, tag, a.faction as string),
  },
  {
    id: 'demand_territory', label: 'Exigir territorio', group: 'Diplomacia', scope: 'province',
    description: 'Exige una provincia con población afín (núcleo tuyo). Si se niegan, obtienes casus belli.',
    args: [{ key: 'province', label: 'Provincia', kind: 'province' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p?.owner || p.owner === tag) return 'Provincia ajena';
      return p.cores.includes(tag) || s.nations[tag].claims.includes(p.id) ? true : 'Debe ser núcleo o reclamación tuya';
    },
    run: (s, tag, a) => {
      const p = s.provinces[a.province as string];
      const o = s.nations[p.owner!];
      const fear = militaryPower(s, tag) / Math.max(1, militaryPower(s, o.tag) + o.allies.reduce((t, al) => t + militaryPower(s, al) * 0.5, 0));
      s.nations[tag].infamy += 3;
      if (o.tag !== s.player && fear > 2.5 && !o.faction) {
        transferProvince(s, p.id, tag);
        log(s, `${o.name} cede ${p.name} a ${s.nations[tag].name} bajo presión.`, [tag, o.tag], 'diplo');
      } else {
        s.nations[tag].claims.push(p.id);
        addRelation(s, tag, o.tag, -50);
        log(s, `${o.name} rechaza ceder ${p.name}.`, [tag, o.tag], 'diplo');
      }
    },
  },
  {
    id: 'strategic_bombing', label: 'Bombardeo estratégico', group: 'Aviación',
    description: 'Tus bombarderos atacan la industria enemiga (reduce su CI). Los cazas enemigos causan pérdidas.',
    args: [{ key: 'target', label: 'Enemigo', kind: 'nation' }],
    available: (s, tag, a) => ((s.nations[tag].x.bombers ?? 0) < 1 ? 'Sin bombarderos' : !a || isHostile(s, tag, a.target as string) ? true : 'Debe ser enemigo'),
    run: (s, tag, a) => {
      const n = s.nations[tag], o = s.nations[a.target as string];
      const ratio = (n.x.bombers ?? 0) * (1 + (n.tech.air ?? 0) * 0.1) / Math.max(1, (o.x.fighters ?? 0) * (1 + (o.tech.air ?? 0) * 0.1));
      o.x.bombed = Math.min(60, (o.x.bombed ?? 0) + ratio * 6);
      const losses = chance(s, 0.5 / Math.max(0.5, ratio)) ? 1 : 0;
      n.x.bombers = Math.max(0, n.x.bombers - losses);
      log(s, `${n.name} bombardea la industria de ${o.name}${losses ? ' (perdido un ala)' : ''}.`, [tag, o.tag], 'war');
    },
  },
  {
    id: 'mobilize', label: 'Movilización general', group: 'Política',
    description: '+50 % de mano de obra disponible a costa de disidencia.',
    available: (s, tag) => (s.nations[tag].flags.mobilized ? 'Ya movilizado' : true),
    run: (s, tag) => { const n = s.nations[tag]; n.flags.mobilized = s.day; n.manpower *= 1.5; n.x.dissent = (n.x.dissent ?? 0) + 5; },
  },
  {
    id: 'garrison', label: 'Desplegar guarnición', group: 'Producción', scope: 'province',
    description: 'Crea inmediatamente una milicia con mano de obra (sin coste industrial) en una provincia propia.',
    args: [{ key: 'province', label: 'Provincia', kind: 'province' }],
    available: (s, tag, a) => {
      if (s.nations[tag].manpower < 10000) return 'Mano de obra insuficiente';
      const p = a && s.provinces[a.province as string];
      return !a || (p && p.owner === tag && p.controller === tag) ? true : 'Provincia propia y controlada';
    },
    run: (s, tag, a) => { s.nations[tag].manpower -= 10000; s.nations[tag].x.dissent = (s.nations[tag].x.dissent ?? 0) + 0.5; spawnArmy(s, tag, a.province as string, { militia: 1 }); },
  },
];

export const ww2: Ruleset & { canUseSea(s: GameState, tag: string): boolean } = {
  era: 'ww2',
  name: 'Guerra total',
  unitTypes,
  moveBaseDays: 1.6,
  siegeBaseDays: 12,
  actions,
  canUseSea: (s, tag) => !atWar(s, tag) || navalSuperiority(s, tag),
  init(s) {
    for (const n of Object.values(s.nations)) {
      if (n.x.pseudo) continue;
      for (const k of techKeys(s)) n.tech[k] ??= 0;
      n.x.al_prod ??= 45; n.x.al_supply ??= 20; n.x.al_reinf ??= 10; n.x.al_cg ??= 20; n.x.al_upg ??= 5;
      n.x.dissent ??= 0; n.x.nu ??= 70; n.x.stubborn ??= Math.max(1, n.x.nu / 45); n.x.rp ??= 0; n.x.researchIdx ??= 4;
      n.x.fighters ??= 0; n.x.bombers ??= 0; n.x.navy ??= 0; n.x.subs ??= 0;
      for (const k of ['energy', 'metal', 'rare', 'oil', 'supplies']) n.x[`stock_${k}`] ??= 500;
      n.manpower = n.manpower || provincesOf(s, n.tag).reduce((t, p) => t + p.dev * 40000, 0);
    }
    for (const p of Object.values(s.provinces)) {
      p.x.vp ??= Math.max(1, Math.round(p.dev / 2));
      if (p.owner && s.nations[p.owner]?.capital === p.id) { p.x.vp += 10; p.fort = Math.max(p.fort, 1); }
      p.x.ic ??= 0;
    }
  },
  daily(s) {
    for (const n of livingNations(s)) {
      const ic = effectiveIC(s, n);
      n.x.ic = ic;
      // resources consumption
      const inc = resourceIncome(s, n);
      const used = baseIC(s, n);
      // world market: part of the shortfall is imported, unless an enemy navy blockades the coast
      const share = atWar(s, n.tag) && !navalSuperiority(s, n.tag) ? 0.35 : 1;
      const need = { energy: used * 0.2, metal: used * 0.1, rare: used * 0.05 };
      for (const k of ['energy', 'metal', 'rare'] as const) inc[k] += Math.max(0, need[k] - inc[k]) * share;
      inc.oil += Math.max(0, 2 - inc.oil) * share;
      n.x.stock_energy = clamp((n.x.stock_energy ?? 0) + inc.energy - used * 2 / 10, 0, 99999);
      n.x.stock_metal = clamp((n.x.stock_metal ?? 0) + inc.metal - used / 10, 0, 99999);
      n.x.stock_rare = clamp((n.x.stock_rare ?? 0) + inc.rare - used * 0.5 / 10, 0, 99999);
      const mech = armiesOf(s, n.tag).reduce((t, a) => t + a.units.filter((u) => u.type === 'armor' || u.type === 'motorized').length, 0);
      n.x.stock_oil = clamp((n.x.stock_oil ?? 0) + inc.oil - mech * 0.2 - (n.x.fighters + n.x.bombers) * 0.1 - n.x.navy * 0.2, 0, 99999);
      const divs = armiesOf(s, n.tag).reduce((t, a) => t + a.units.length, 0);
      n.x.stock_supplies = clamp((n.x.stock_supplies ?? 0) + ic * n.x.al_supply / 100 * 1.5 - divs * 0.15 * (atWar(s, n.tag) ? 1.5 : 1), 0, 99999);
      // production
      let pts = ic * n.x.al_prod / 100;
      for (const q of n.queue) {
        if (pts <= 0) break;
        const maxRate = q.cost / (Number(q.data?.days) || 90);
        const use = Math.min(pts, maxRate, q.cost - q.progress);
        q.progress += use;
        pts -= use;
      }
      for (const q of n.queue.filter((x) => x.progress >= x.cost - 1e-6)) {
        const item = q.data?.item as string;
        if (unitTypes[item]) {
          const cap = s.provinces[n.capital].controller === n.tag ? n.capital : provincesOf(s, n.tag).find((p) => p.controller === n.tag)?.id;
          if (cap) spawnArmy(s, n.tag, cap, { [item]: 1 });
        } else if (SPECIAL[item]) n.x[SPECIAL[item].key] = (n.x[SPECIAL[item].key] ?? 0) + 1;
      }
      n.queue = n.queue.filter((x) => x.progress < x.cost - 1e-6);
      // research
      const keys = techKeys(s);
      const key = keys[n.x.researchIdx ?? 4] ?? 'industry';
      n.x.rp += (1 + ic * 0.012) * (1 + n.x.al_upg / 200);
      if (n.x.rp >= techCost(n, key)) {
        n.x.rp = 0;
        n.tech[key] = (n.tech[key] ?? 0) + 1;
        if (n.tag === s.player) log(s, `Investigación completada: ${TECHS[key]} ${n.tech[key]}.`, [n.tag], 'economy');
        if (n.tag !== s.player) n.x.researchIdx = (n.x.researchIdx + 1) % keys.length;
      }
      // reinforcement & organisation
      const reinf = ic * n.x.al_reinf / 100;
      const sup = supplied(s, n);
      const outOfSupplies = n.x.stock_supplies <= 0;
      const outOfOil = n.x.stock_oil <= 0;
      for (const a of armiesOf(s, n.tag)) {
        const ok = sup.has(a.location) && !outOfSupplies;
        for (const u of a.units) {
          if (!ok) { u.org = Math.max(0, u.org - 0.04); u.str = Math.max(0.02, u.str - 0.004); }
          else if (!a.inBattle) {
            u.org = Math.min(1, u.org + 0.03 * (1 + (n.tech.doctrine ?? 0) * 0.1));
            if (u.str < 1 && n.manpower > 0 && reinf > 0) {
              const add = Math.min(1 - u.str, 0.004 * reinf / 10);
              const t = unitTypes[u.type];
              n.manpower -= add * (t?.manpower ?? 0);
              u.str += add;
            }
          }
          if (outOfOil && (u.type === 'armor' || u.type === 'motorized')) u.org = Math.max(0, u.org - 0.02);
        }
      }
      n.x.bombed = Math.max(0, (n.x.bombed ?? 0) - 0.1);
    }
  },
  monthly(s) {
    for (const n of livingNations(s)) {
      const ic = n.x.ic ?? 0;
      const cgNeed = 15 + (n.x.dissent ?? 0) * 0.5;
      n.x.dissent = clamp((n.x.dissent ?? 0) + (n.x.al_cg < cgNeed ? (cgNeed - n.x.al_cg) * 0.08 : -0.5) + (atWar(s, n.tag) && n.government === 'democracy' ? 0.1 : 0), 0, 100);
      const mpGrowth = provincesOf(s, n.tag).reduce((t, p) => t + p.dev * (p.controller === n.tag ? 600 : 0), 0);
      n.manpower += mpGrowth;
      n.lastIncome = { 'CI efectiva': ic };
      n.infamy = Math.max(0, n.infamy - 0.2);
    }
    // occupied-territory partisans
    for (const p of Object.values(s.provinces)) {
      if (p.owner && p.controller && p.controller !== p.owner && p.controller !== 'REB' && chance(s, 0.01)) {
        const reb = spawnArmy(s, 'REB', p.id, { militia: 1 }, `Partisanos de ${p.name}`);
        reb.rebelAgainst = p.controller;
      }
    }
  },
  yearly() {},
  ai(s, n) {
    // allocation: war footing
    const war = atWar(s, n.tag);
    if (n.tag !== s.player) {
      n.x.al_prod = war ? 55 : 45; n.x.al_supply = war ? 25 : 15; n.x.al_reinf = war ? 10 : 5; n.x.al_cg = Math.max(10, 15 + (n.x.dissent ?? 0) * 0.5); n.x.al_upg = Math.max(0, 100 - n.x.al_prod - n.x.al_supply - n.x.al_reinf - n.x.al_cg);
      const total = ALLOC.reduce((t, k) => t + n.x[`al_${k}`], 0);
      for (const k of ALLOC) n.x[`al_${k}`] = n.x[`al_${k}`] * 100 / total;
    }
    if (n.queue.length < 3) {
      const ic = n.x.ic ?? 0;
      const options = ['infantry', 'infantry', 'infantry', ...['artillery', 'drones', 'ai_swarm', 'cavalry'].filter((u) => allowedUnit(s, n, u)), ...(n.tech.armor >= 1 && ic > 20 && allowedUnit(s, n, 'armor') ? ['armor', 'motorized'] : []), ...(ic > 15 ? ['fighters', 'bombers'] : []), ...(n.x.navy < ic / 15 && provincesOf(s, n.tag).some((p) => p.coastal) ? ['navy'] : []), ...(!war && ic < 30 ? ['factory'] : [])];
      const item = pick(s, options);
      const ok = actions[0].available!(s, n.tag, { item, count: 1 });
      if (ok === true) actions[0].run(s, n.tag, { item, count: 1 });
      else if (n.manpower < 12000) actions[0].run(s, n.tag, { item: 'factory', count: 1 });
    }
    if (war && (n.x.bombers ?? 0) >= 3 && chance(s, 0.3)) {
      const enemy = warsOf(s, n.tag).flatMap((w) => (w.attackers.includes(n.tag) ? w.defenders : w.attackers))[0];
      if (enemy) actions.find((a) => a.id === 'strategic_bombing')!.run(s, n.tag, { target: enemy });
    }
    if (!n.faction && !n.x.neutral && IDEOLOGY_FACTION[n.government] && s.factions[IDEOLOGY_FACTION[n.government]] && chance(s, 0.03) && provincesOf(s, n.tag).length > 1) {
      const f = IDEOLOGY_FACTION[n.government];
      if (relation(s, n.tag, s.factions[f].leader) > 20) joinFaction(s, n.tag, f);
    }
  },
  combatMultiplier(s, army, unit, attacking) {
    const n = s.nations[army.owner];
    if (!n) return 1;
    let m = (1 + (n.tech.doctrine ?? 0) * 0.05) * (n.x.combat ?? 1);
    if (unit.type === 'armor' || unit.type === 'motorized') m *= 1 + (n.tech.armor ?? 0) * 0.1;
    else m *= 1 + (n.tech.infantry ?? 0) * 0.08;
    m *= 1 + (n.tech.ai ?? 0) * 0.05;
    if (unit.type === 'drones' || unit.type === 'ai_swarm') m *= 1 + (n.tech.ai ?? 0) * 0.08 + (n.tech.air ?? 0) * 0.04;
    if (unit.type === 'mountain' && ['m', 'h'].includes(s.provinces[army.location].terrain)) m *= 1.4;
    if (unit.type === 'armor' && ['m', 'w', 'j', 'f'].includes(s.provinces[army.location].terrain)) m *= 0.7;
    // air superiority over the battlefield
    const enemies = warsOf(s, n.tag).flatMap((w) => (w.attackers.includes(n.tag) ? w.defenders : w.attackers));
    const enemyAir = enemies.reduce((t, e) => t + airPower(s, e), 0) / Math.max(1, enemies.length);
    m *= 1 + 0.25 * Math.tanh((airPower(s, n.tag) - enemyAir) / 15);
    if (!attacking) m *= 1.05;
    return m;
  },
  provinceValue(_s, p) { return p.x.vp ?? 1; },
  aiMayDeclare(s, n, target, goal) {
    // democracies never start wars; authoritarian regimes only over claims; nobody attacks a faction mate
    if (n.government === 'democracy') return false;
    if (n.faction && n.faction === s.nations[target]?.faction) return false;
    if (n.government === 'authoritarian') return !!goal;
    return true;
  },
  shouldCapitulate(s, tag) {
    const n = s.nations[tag];
    if (!atWar(s, tag)) return false;
    const own = provincesOf(s, tag);
    const total = own.reduce((t, p) => t + (p.x.vp ?? 1), 0);
    const lost = own.filter((p) => p.controller !== tag && p.controller && isHostile(s, tag, p.controller)).reduce((t, p) => t + (p.x.vp ?? 1), 0);
    const capitalLost = s.provinces[n.capital]?.controller !== tag;
    return total > 0 && lost / total * 100 > (n.x.nu ?? 70) * (capitalLost ? 0.7 : 1) && (n.x.nu ?? 70) < 100;
  },
  topBar(s, tag) {
    const n = s.nations[tag];
    return [
      { label: 'CI', value: `${(n.x.ic ?? 0).toFixed(0)} / ${baseIC(s, n)}`, hint: ALLOC.map((k) => `${ALLOC_LABEL[k]}: ${Math.round(n.x[`al_${k}`])} %`).join('\n') },
      { label: 'Mano de obra', value: `${Math.round(n.manpower / 1000)}k` },
      { label: 'Energía', value: Math.round(n.x.stock_energy).toString() },
      { label: 'Metal', value: Math.round(n.x.stock_metal).toString() },
      { label: 'Raros', value: Math.round(n.x.stock_rare).toString() },
      { label: 'Petróleo', value: Math.round(n.x.stock_oil).toString() },
      { label: 'Comercio', value: atWar(s, tag) && !navalSuperiority(s, tag) ? 'Bloqueado' : 'Abierto' },
      { label: 'Suministros', value: Math.round(n.x.stock_supplies).toString() },
      { label: 'Disidencia', value: `${(n.x.dissent ?? 0).toFixed(1)} %` },
    ];
  },
  nationStats(s, tag) {
    const n = s.nations[tag];
    const keys = techKeys(s);
    const cur = keys[n.x.researchIdx ?? 4];
    return [
      { label: 'Gobierno', value: { fascist: 'Fascista', democracy: 'Democracia', communist: 'Comunista', authoritarian: 'Autoritario' }[n.government] ?? n.government },
      { label: 'Bloque', value: n.faction ? s.factions[n.faction]?.name ?? n.faction : 'Neutral' },
      { label: 'Unidad nacional', value: `${n.x.nu ?? 70} % (capitula si pierde ese % de puntos de victoria)` },
      { label: 'Reparto CI', value: ALLOC.map((k) => `${ALLOC_LABEL[k]} ${Math.round(n.x[`al_${k}`])} %`).join(' · ') },
      { label: 'Investigación', value: `${TECHS[cur]} (${Math.round(100 * (n.x.rp ?? 0) / techCost(n, cur))} %)` },
      { label: 'Tecnología', value: keys.map((k) => `${TECHS[k]} ${n.tech[k] ?? 0}`).join(' · ') },
      { label: 'Aviación', value: `${n.x.fighters ?? 0} alas de caza · ${n.x.bombers ?? 0} de bombardeo` },
      { label: 'Armada', value: `${n.x.navy ?? 0} flotillas · ${n.x.subs ?? 0} submarinos · ${navalSuperiority(s, tag) ? 'superioridad naval' : 'inferioridad naval'}` },
      { label: 'Daño por bombardeo', value: `${(n.x.bombed ?? 0).toFixed(0)} %` },
      { label: 'Beligerancia', value: n.infamy.toFixed(1) },
    ];
  },
  provinceStats(s, p) {
    const n = p.owner ? s.nations[p.owner] : null;
    const inSupply = n ? supplied(s, n).has(p.id) : false;
    return [
      { label: 'Industria (CI)', value: String(p.x.ic ?? 0) },
      { label: 'Puntos de victoria', value: String(p.x.vp ?? 0) },
      { label: 'Recursos', value: `⚡${p.x.energy ?? 0} ⛏${p.x.metal ?? 0} 💎${p.x.rare ?? 0} 🛢${p.x.oil ?? 0}` },
      { label: 'Fortificación', value: String(p.fort) },
      { label: 'Suministro', value: inSupply ? 'Conectado' : 'Aislado' },
    ];
  },
  mapModes: [
    { id: 'faction', label: 'Bloques', color: (s, p) => { const f = p.owner ? s.nations[p.owner]?.faction : null; return f ? s.factions[f]?.color ?? '#888' : '#6b6b6b'; } },
    { id: 'industry', label: 'Industria', color: (_s, p) => `hsl(30 70% ${15 + Math.min(60, (p.x.ic ?? 0) * 3)}%)` },
    { id: 'resources', label: 'Recursos', color: (_s, p) => (p.x.oil ? '#222' : p.x.rare ? '#7a4fcf' : p.x.metal ? '#8a8a8a' : p.x.energy ? '#b3833a' : '#3c4a3c') },
  ],
  peaceExtras: [{ id: 'puppet', label: 'Gobierno títere', cost: 70 }, { id: 'annex', label: 'Anexión', cost: 100 }],
  onPeaceExtra(s, winner, loser, extra) {
    if (extra === 'annex') annex(s, winner, loser);
    else if (s.nations[winner] && s.nations[loser]) { s.nations[loser].liege = winner; s.nations[loser].faction = s.nations[winner].faction; s.nations[loser].government = s.nations[winner].government; }
  },
  onWarDeclared(s, attacker, target, goal) {
    const n = s.nations[attacker];
    n.infamy += goal ? 2 : 5;
    if (n.government === 'democracy' && !s.nations[target].faction) n.x.dissent = (n.x.dissent ?? 0) + 10;
    // the target's faction joins
    const t = s.nations[target];
    const w = s.wars[s.wars.length - 1];
    if (t.faction) for (const m of livingNations(s)) if (m.faction === t.faction && !w.attackers.includes(m.tag) && !w.defenders.includes(m.tag)) w.defenders.push(m.tag);
    // high belligerence pushes neutrals towards the Allies
    if (n.infamy > 20) for (const m of livingNations(s)) if (m.government === 'democracy') addRelation(s, m.tag, attacker, -10);
  },
  victory(s) {
    const vp: Record<string, number> = {};
    for (const p of Object.values(s.provinces)) {
      const f = p.controller ? s.nations[p.controller]?.faction ?? s.nations[p.controller]?.tag : null;
      if (f) vp[f] = (vp[f] ?? 0) + (p.x.vp ?? 0);
    }
    const best = Object.entries(vp).sort((a, b) => b[1] - a[1])[0];
    return best ? `Victoria de ${s.factions[best[0]]?.name ?? s.nations[best[0]]?.name ?? best[0]} (${best[1]} PV)` : 'Empate';
  },
};

registerRuleset(ww2);
