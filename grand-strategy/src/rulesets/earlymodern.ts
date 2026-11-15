import {
  addRelation, age, annex, armiesOf, atWar, killCharacter, livingNations, log, militaryPower, provincesOf,
  registerRuleset, relation, rules, spawnArmy, transferProvince, vassalsOf,
} from '@/engine/core';
import { distance, neighbours } from '@/engine/map';
import type { ActionDef, Ruleset, UnitType } from '@/engine/ruleset';
import type { Character, GameState, Nation, Province } from '@/engine/types';
import { chance, clamp, pick, randInt } from '@/engine/util';
import { ensureRulers, mortality, ownedArg, processGoldQueues, queueBuilding, randomCharacter, recruitAction, stat, upkeep } from './common';
import { RELIGION_COLORS } from './medieval';

const U = (id: string, name: string, attack: number, defence: number, speed: number, siege: number, cost: number, manpower: number, up: number, days: number): UnitType =>
  ({ id, name, attack, defence, speed, siege, cost, manpower, upkeep: up, buildDays: days, size: manpower });

const unitTypes: Record<string, UnitType> = {
  infantry: U('infantry', 'Infantería', 1, 1.2, 1, 0.1, 10, 1000, 0.2, 60),
  cavalry: U('cavalry', 'Caballería', 1.7, 0.9, 1.4, 0, 25, 1000, 0.45, 90),
  artillery: U('artillery', 'Artillería', 1.3, 1.4, 0.8, 2.5, 35, 1000, 0.5, 120),
};

const TECHS: Record<string, string> = { land: 'Tierra', naval: 'Naval', trade: 'Comercio', production: 'Producción', infra: 'Infraestructura' };
const POLICIES: Record<string, [string, string]> = {
  pol_central: ['Descentralización', 'Centralización'],
  pol_aristo: ['Aristocracia', 'Plutocracia'],
  pol_serf: ['Servidumbre', 'Campesinos libres'],
  pol_mercant: ['Libre comercio', 'Mercantilismo'],
  pol_quality: ['Calidad', 'Cantidad'],
  pol_naval: ['Tierra', 'Mar'],
};

const ruler = (s: GameState, n: Nation) => (n.rulerId ? s.characters[n.rulerId] : null);
const techCost = (s: GameState, n: Nation, key: string) => Math.round(150 * Math.pow((n.tech[key] ?? 0) + 1, 1.35) * (1 + provincesOf(s, n.tag).length / 40));
const stabCost = (s: GameState, n: Nation) => 80 + provincesOf(s, n.tag).length * 8 + n.stability * 40;

function income(s: GameState, n: Nation) {
  const ps = provincesOf(s, n.tag);
  const stabMod = 1 + n.stability * 0.06;
  const central = (n.x.pol_central ?? 0) * 0.02;
  let tax = 0, prod = 0, gold = 0;
  for (const p of ps) {
    if (p.controller !== n.tag) continue;
    const colony = p.x.colony !== undefined && p.x.colony < 1000 ? p.x.colony / 1000 * 0.3 : 1;
    const relMod = p.religion === n.religion ? 1 : 0.7;
    tax += p.dev * 0.28 * stabMod * (1 + central) * relMod * colony * (1 + (p.buildings.tax_office ?? 0) * 0.3) * (1 - Math.min(0.5, p.unrest / 20));
    prod += p.dev * 0.12 * (1 + (n.tech.production ?? 0) * 0.08) * colony * (1 + (p.buildings.workshop ?? 0) * 0.3) * (1 + (n.x.pol_serf ?? 0) * 0.02);
    gold += p.x.gold ?? 0;
  }
  let trade = 0;
  for (const p of Object.values(s.provinces)) {
    const m = p.x[`m_${n.tag}`] ?? 0;
    if (m) trade += (p.x.cot ?? 0) * m * 0.05 * (1 + (n.tech.trade ?? 0) * 0.06) * (1 + (n.x.pol_mercant ?? 0) * 0.02);
  }
  const vassalTribute = vassalsOf(s, n.tag).reduce((t, v) => t + (Object.values(v.lastIncome).filter((x) => x > 0).reduce((a, b) => a + b, 0) * 0.1), 0);
  const inflation = 1 - Math.min(0.5, (n.x.inflation ?? 0) / 100);
  return { Impuestos: tax * inflation, Producción: prod * inflation, Comercio: trade * inflation, Minas: gold, Vasallos: vassalTribute };
}

function provinceUnrest(s: GameState, p: Province, n: Nation) {
  let u = -n.stability * 1.5;
  if (p.religion !== n.religion) u += 3;
  if (!p.cores.includes(n.tag)) u += 2;
  if (p.culture !== n.culture) u += 1;
  u += Math.max(0, n.infamy - 20) / 10;
  u += (n.x.pol_serf ?? 0) < -2 ? 1 : 0;
  return Math.max(0, u);
}

const budgetKeys = ['land', 'naval', 'trade', 'production', 'infra', 'stability'] as const;

const actions: ActionDef[] = [
  recruitAction('Ejército'),
  {
    id: 'budget', label: 'Presupuesto', group: 'Economía',
    description: 'Reparte los ingresos mensuales entre investigación, estabilidad y tesoro (porcentajes; el resto va al tesoro).',
    args: budgetKeys.map((k) => ({ key: k, label: k === 'stability' ? 'Estabilidad' : TECHS[k], kind: 'number' as const })),
    available: (_s, _t, a) => (!a || budgetKeys.reduce((t, k) => t + Number(a[k] ?? 0), 0) <= 100 ? true : 'La suma no puede superar 100 %'),
    run: (s, tag, a) => { for (const k of budgetKeys) s.nations[tag].x[`bud_${k}`] = clamp(Number(a[k] ?? 0), 0, 100); },
  },
  {
    id: 'mint', label: 'Acuñar moneda', group: 'Economía',
    description: 'Obtén oro inmediato a cambio de inflación permanente.',
    cost: () => '+100 oro · +3 % inflación',
    run: (s, tag) => { const n = s.nations[tag]; n.treasury += 100; n.x.inflation = (n.x.inflation ?? 0) + 3; },
  },
  {
    id: 'loan', label: 'Pedir préstamo', group: 'Economía',
    description: 'Préstamo de 200 oro a devolver en 5 años con 20 % de interés.',
    available: (s, tag) => ((s.nations[tag].x.loans ?? 0) < 5 ? true : 'Demasiados préstamos'),
    run: (s, tag) => { const n = s.nations[tag]; n.treasury += 200; n.x.loans = (n.x.loans ?? 0) + 1; n.flags[`loan_${s.nextId++}`] = s.day + 365 * 5; },
  },
  {
    id: 'policy', label: 'Ajustar política interna', group: 'Gobierno',
    description: 'Mueve un eje de política un punto (cada 10 años; −1 estabilidad).',
    args: [
      { key: 'policy', label: 'Eje', kind: 'choice', options: Object.entries(POLICIES).map(([k, [a, b]]) => ({ value: k, label: `${a} ↔ ${b}` })) },
      { key: 'dir', label: 'Dirección', kind: 'choice', options: [{ value: '-1', label: '← izquierda' }, { value: '1', label: 'derecha →' }] },
    ],
    available: (s, tag) => (s.nations[tag].flags.policy && s.day - s.nations[tag].flags.policy < 3650 ? 'Solo una vez cada 10 años' : true),
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const k = a.policy as string;
      n.x[k] = clamp((n.x[k] ?? 0) + Number(a.dir), -5, 5);
      n.flags.policy = s.day;
      n.stability = clamp(n.stability - 1, -3, 3);
    },
  },
  {
    id: 'build', label: 'Construir', group: 'Provincia', scope: 'province',
    description: 'Mejoras provinciales.',
    args: [ownedArg(), { key: 'building', label: 'Edificio', kind: 'choice', options: [
      { value: 'tax_office', label: 'Oficina de recaudación (100 oro, +30 % impuestos)' },
      { value: 'workshop', label: 'Manufactura (150 oro, +30 % producción)' },
      { value: 'fortress', label: 'Fortaleza (120 oro, +1 fortificación)' },
      { value: 'shipyard', label: 'Astillero (100 oro, barcos más baratos)' },
    ] }],
    available: (s, tag, a) => {
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p || p.owner !== tag) return 'Solo en tus provincias';
      const cost = { tax_office: 100, workshop: 150, fortress: 120, shipyard: 100 }[a.building as string] ?? 0;
      if (!cost) return 'Elige edificio';
      if ((p.buildings[a.building as string] ?? 0) >= 2) return 'Nivel máximo';
      if (a.building === 'shipyard' && !p.coastal) return 'Requiere costa';
      return s.nations[tag].treasury >= cost ? true : 'Oro insuficiente';
    },
    run: (s, tag, a) => {
      const cost = { tax_office: 100, workshop: 150, fortress: 120, shipyard: 100 }[a.building as string]!;
      s.nations[tag].treasury -= cost;
      queueBuilding(s, tag, a.province as string, a.building as string, String(a.building), 365);
    },
  },
  {
    id: 'ships', label: 'Construir flota', group: 'Armada',
    description: 'Añade barcos a tu flota: permiten cruzar el mar, colonizar lejos y proteger el comercio.',
    cost: (s, tag) => `${shipCost(s, tag)} oro por 5 barcos`,
    available: (s, tag) => (provincesOf(s, tag).some((p) => p.coastal) ? (s.nations[tag].treasury >= shipCost(s, tag) ? true : 'Oro insuficiente') : 'Sin costa'),
    run: (s, tag) => { const n = s.nations[tag]; n.treasury -= shipCost(s, tag); n.x.ships = (n.x.ships ?? 0) + 5; },
  },
  {
    id: 'colonize', label: 'Enviar colonos', group: 'Expansión', scope: 'province',
    description: 'Funda una colonia en una provincia sin dueño alcanzable por mar. Crece hasta convertirse en ciudad.',
    args: [{ key: 'province', label: 'Provincia libre', kind: 'province' }],
    cost: (s, tag, a) => (a?.province ? `${colonyCost(s, tag, a.province as string)} oro` : 'Coste según distancia'),
    available: (s, tag, a) => {
      const n = s.nations[tag];
      if ((n.x.colonists ?? 0) < 1) return 'Sin colonos disponibles (se generan con la tecnología naval)';
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p || p.owner) return 'La provincia debe estar libre';
      if (!reachable(s, tag, p)) return 'Fuera del alcance de tus flotas (descubre el Nuevo Mundo / mejora la tecnología naval)';
      return n.treasury >= colonyCost(s, tag, p.id) ? true : 'Oro insuficiente';
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const p = s.provinces[a.province as string];
      n.treasury -= colonyCost(s, tag, p.id);
      n.x.colonists -= 1;
      if (chance(s, 0.45 + (n.tech.naval ?? 0) * 0.05 - (p.x.natives ?? 0) * 0.02)) {
        transferProvince(s, p.id, tag);
        p.x.colony = 100;
        p.religion = n.religion; p.culture = n.culture; p.cores = [tag];
        log(s, `${n.name} funda una colonia en ${p.name}.`, [tag], 'economy');
      } else log(s, `Los colonos de ${n.name} en ${p.name} han perecido.`, [tag], 'economy');
    },
  },
  {
    id: 'explore', label: 'Financiar expedición', group: 'Expansión',
    description: 'Una expedición transatlántica que descubre rutas a las tierras de ultramar.',
    cost: () => '150 oro',
    available: (s, tag) => (s.nations[tag].flags.discovered ? 'Ya conoces las rutas' : (s.nations[tag].tech.naval ?? 0) < 2 ? 'Requiere tecnología naval 2' : s.nations[tag].treasury >= 150 ? true : 'Oro insuficiente'),
    run: (s, tag) => {
      const n = s.nations[tag];
      n.treasury -= 150;
      if (chance(s, 0.5)) { n.flags.discovered = s.day; log(s, `Una expedición de ${n.name} alcanza el Nuevo Mundo.`, [tag], 'event'); }
      else log(s, `La expedición de ${n.name} se pierde en el océano.`, [tag], 'event');
    },
  },
  {
    id: 'missionary', label: 'Enviar misionero', group: 'Religión', scope: 'province',
    description: 'Intenta convertir una provincia a la religión del Estado.',
    args: [ownedArg()],
    cost: () => '40 oro',
    available: (s, tag, a) => {
      if (s.nations[tag].treasury < 40) return 'Oro insuficiente';
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p || p.owner !== tag) return 'Solo en tus provincias';
      return p.religion !== s.nations[tag].religion ? true : 'Ya profesa la fe del Estado';
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const p = s.provinces[a.province as string];
      n.treasury -= 40;
      if (chance(s, 0.12 + stat(ruler(s, n), 'diplomacy') * 0.01 + n.stability * 0.02)) { p.religion = n.religion; log(s, `${p.name} adopta la fe ${n.religion}.`, [tag], 'event'); }
      else p.unrest += 2;
    },
  },
  {
    id: 'merchant', label: 'Enviar mercader', group: 'Comercio', scope: 'province',
    description: 'Compite por una plaza en un centro de comercio (máx. 5 mercaderes por centro).',
    args: [{ key: 'province', label: 'Centro de comercio', kind: 'province' }],
    cost: () => '25 oro',
    available: (s, tag, a) => {
      if (s.nations[tag].treasury < 25) return 'Oro insuficiente';
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p?.x.cot) return 'Elige un centro de comercio (★)';
      if ((p.x[`m_${tag}`] ?? 0) >= 5) return 'Ya tienes 5 mercaderes';
      if (p.owner && s.nations[p.owner]?.x.pol_mercant >= 4 && p.owner !== tag) return 'Monopolio mercantilista';
      return true;
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const p = s.provinces[a.province as string];
      n.treasury -= 25;
      const present = Object.keys(p.x).filter((k) => k.startsWith('m_') && p.x[k] > 0);
      const total = present.reduce((t, k) => t + p.x[k], 0);
      const odds = 0.3 + (n.tech.trade ?? 0) * 0.05 + (p.owner === tag ? 0.25 : 0) - total * 0.02;
      if (chance(s, clamp(odds, 0.05, 0.9))) {
        if (total >= 5) { const victim = pick(s, present.filter((k) => k !== `m_${tag}`)); if (victim) p.x[victim]--; }
        p.x[`m_${tag}`] = (p.x[`m_${tag}`] ?? 0) + 1;
      }
    },
  },
  {
    id: 'royal_marriage', label: 'Matrimonio real', group: 'Diplomacia',
    description: 'Une las casas reinantes: +relaciones; puede derivar en herencia.',
    args: [{ key: 'target', label: 'Nación', kind: 'nation' }],
    available: (s, tag, a) => (!a ? true : s.nations[a.target as string]?.religion !== s.nations[tag].religion ? 'Requiere la misma religión' : relation(s, tag, a.target as string) < 0 ? 'Relaciones insuficientes' : true),
    run: (s, tag, a) => { addRelation(s, tag, a.target as string, 40); s.nations[tag].flags[`rm_${a.target}`] = s.day; s.nations[a.target as string].flags[`rm_${tag}`] = s.day; log(s, `Matrimonio real entre ${s.nations[tag].name} y ${s.nations[a.target as string].name}.`, [tag, a.target as string], 'diplo'); },
  },
  {
    id: 'vassalize', label: 'Vasallaje diplomático', group: 'Diplomacia',
    description: 'Convierte a una nación pequeña y amiga en vasalla.',
    args: [{ key: 'target', label: 'Nación', kind: 'nation' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const o = s.nations[a.target as string];
      if (!o || o.liege || o.tag === s.player) return 'Objetivo inválido';
      if (relation(s, tag, o.tag) < 150) return 'Relaciones ≥ 150 necesarias';
      return militaryPower(s, tag) > militaryPower(s, o.tag) * 3 ? true : 'No eres lo bastante poderoso';
    },
    run: (s, tag, a) => { s.nations[a.target as string].liege = tag; log(s, `${s.nations[a.target as string].name} acepta el vasallaje de ${s.nations[tag].name}.`, [tag], 'diplo'); },
  },
  {
    id: 'annex_vassal', label: 'Anexionar vasallo', group: 'Diplomacia',
    description: 'Integra pacíficamente a un vasallo leal tras 10 años.',
    args: [{ key: 'target', label: 'Vasallo', kind: 'nation' }],
    available: (s, tag, a) => (!a ? true : s.nations[a.target as string]?.liege !== tag ? 'Debe ser tu vasallo' : relation(s, tag, a.target as string) < 190 ? 'Relaciones ≥ 190' : true),
    run: (s, tag, a) => { annex(s, tag, a.target as string); s.nations[tag].infamy += 3; },
  },
  {
    id: 'claim', label: 'Reclamar provincia', group: 'Diplomacia', scope: 'province',
    description: 'Tus juristas elaboran un casus belli sobre una provincia fronteriza.',
    args: [{ key: 'province', label: 'Provincia', kind: 'province' }],
    cost: () => '60 oro · +2 agresividad',
    available: (s, tag, a) => {
      if (s.nations[tag].treasury < 60) return 'Oro insuficiente';
      if (!a) return true;
      const p = s.provinces[a.province as string];
      return p?.owner && p.owner !== tag ? true : 'Elige provincia ajena';
    },
    run: (s, tag, a) => { const n = s.nations[tag]; n.treasury -= 60; n.infamy += 2; if (chance(s, 0.6)) n.claims.push(a.province as string); },
  },
];

function shipCost(s: GameState, tag: string) {
  const yards = provincesOf(s, tag).reduce((t, p) => t + (p.buildings.shipyard ?? 0), 0);
  return Math.max(50, 100 - yards * 10);
}
function colonyCost(s: GameState, tag: string, pid: string) {
  const n = s.nations[tag];
  const cap = s.provinces[n.capital];
  return Math.round(40 + distance(cap, s.provinces[pid]) * 2);
}
function reachable(s: GameState, tag: string, p: Province): boolean {
  const n = s.nations[tag];
  if (!p.coastal && !neighbours(s, p.id).some((e) => s.provinces[e.to].owner === tag)) return false;
  const far = p.lon < -30 || p.lat < 20;
  if (far && !n.flags.discovered) return false;
  return (n.x.ships ?? 0) > 0 || neighbours(s, p.id).some((e) => !e.sea && s.provinces[e.to].owner === tag);
}

export const earlymodern: Ruleset & { canUseSea(s: GameState, tag: string): boolean; onCharacterDeath(s: GameState, c: Character): void } = {
  era: 'earlymodern',
  name: 'Imperios y colonias',
  unitTypes,
  moveBaseDays: 3.5,
  siegeBaseDays: 60,
  actions,
  canUseSea: (s, tag) => tag === 'REB' || (s.nations[tag]?.x.ships ?? 0) > 0,
  init(s) {
    ensureRulers(s, false);
    for (const n of Object.values(s.nations)) {
      if (n.x.pseudo) continue;
      for (const k of Object.keys(TECHS)) n.tech[k] ??= 1;
      for (const k of Object.keys(POLICIES)) n.x[k] ??= 0;
      n.x.bud_land ??= 20; n.x.bud_naval ??= 10; n.x.bud_trade ??= 10; n.x.bud_production ??= 10; n.x.bud_infra ??= 5; n.x.bud_stability ??= 10;
      n.x.inflation ??= 0; n.x.colonists ??= 0; n.x.ships ??= provincesOf(s, n.tag).some((p) => p.coastal) ? 5 : 0;
      n.manpower = n.manpower || provincesOf(s, n.tag).reduce((t, p) => t + p.dev * 800, 0);
      for (const k of Object.keys(TECHS)) n.x[`rp_${k}`] ??= 0;
      n.x.rp_stability ??= 0;
      // monarch stats live in the ruler character: diplomacy (DIP), stewardship (ADM), martial (MIL)
    }
    for (const p of Object.values(s.provinces)) if (!p.owner) p.x.natives ??= randInt(s, 1, 8);
  },
  daily(s) { processGoldQueues(s); },
  monthly(s) {
    for (const c of Object.values(s.characters)) if (c.alive && chance(s, mortality(s, c))) killCharacter(s, c.id, 'causas naturales');
    for (const n of livingNations(s)) {
      const inc = income(s, n);
      const army = upkeep(s, n.tag) * (1 + (n.x.pol_quality ?? 0) * -0.03);
      const navy = (n.x.ships ?? 0) * 0.15;
      const gross = Object.values(inc).reduce((t, v) => t + v, 0);
      n.lastIncome = { ...inc, Ejército: -army, Armada: -navy };
      // budget: research share comes from gross income
      let spent = 0;
      for (const k of budgetKeys) {
        const share = gross * (n.x[`bud_${k}`] ?? 0) / 100;
        spent += share;
        if (k === 'stability') {
          n.x.rp_stability += share;
          if (n.x.rp_stability >= stabCost(s, n) && n.stability < 3) { n.x.rp_stability = 0; n.stability++; log(s, `La estabilidad de ${n.name} sube a ${n.stability}.`, [n.tag], 'economy'); }
        } else {
          n.x[`rp_${k}`] += share * (1 + stat(ruler(s, n), k === 'land' || k === 'naval' ? 'martial' : k === 'trade' ? 'diplomacy' : 'stewardship') * 0.04);
          if (n.x[`rp_${k}`] >= techCost(s, n, k)) {
            n.x[`rp_${k}`] = 0; n.tech[k]++;
            if (n.tag === s.player) log(s, `Nueva tecnología: ${TECHS[k]} ${n.tech[k]}.`, [n.tag], 'economy');
            if (k === 'naval' && n.tech.naval >= 3 && !n.flags.discovered && provincesOf(s, n.tag).some((p) => p.coastal && p.lon < 0)) n.flags.discovered = s.day;
          }
        }
      }
      n.lastIncome['Investigación'] = -spent;
      n.treasury += gross - spent - army - navy;
      n.x.inflation = Math.max(0, (n.x.inflation ?? 0) + (inc.Minas > 0 ? inc.Minas * 0.01 : 0) - 0.02);
      for (const [k, d] of Object.entries(n.flags)) if (k.startsWith('loan_') && d <= s.day) { n.treasury -= 240; n.x.loans--; delete n.flags[k]; }
      if (n.treasury < 0) { n.stability = clamp(n.stability - 0.25, -3, 3); n.x.loans = (n.x.loans ?? 0) + 1; n.treasury += 200; n.flags[`loan_${s.nextId++}`] = s.day + 365 * 5; }
      const maxMp = provincesOf(s, n.tag).reduce((t, p) => t + p.dev * 800, 0) * (1 + (n.x.pol_quality ?? 0) * 0.05) * (1 + (n.x.pol_serf ?? 0) * -0.02);
      n.manpower = Math.min(maxMp, n.manpower + maxMp / 100);
      n.x.colonists = Math.min(3, (n.x.colonists ?? 0) + (n.tech.naval ?? 0) * 0.02 + (n.x.pol_naval ?? 0) * 0.005);
      // unrest & rebels
      for (const p of provincesOf(s, n.tag)) {
        p.unrest = provinceUnrest(s, p, n);
        if (p.x.colony !== undefined && p.x.colony < 1000) {
          p.x.colony += randInt(s, 5, 25);
          if (p.x.colony >= 1000) { p.dev = Math.max(p.dev, 3); log(s, `La colonia de ${p.name} se convierte en ciudad.`, [n.tag], 'economy'); }
        }
        if (p.unrest > 3 && chance(s, p.unrest / 300) && p.controller === n.tag) {
          const reb = spawnArmy(s, 'REB', p.id, { infantry: Math.max(1, Math.round(p.dev / 2)) }, `Rebeldes de ${p.name}`);
          reb.rebelAgainst = n.tag;
          log(s, `¡Revuelta en ${p.name}!`, [n.tag], 'war');
        }
      }
    }
    // rebel provinces: if rebels hold a province 6 months, the realm loses stability
    for (const p of Object.values(s.provinces)) if (p.controller === 'REB' && p.owner) {
      p.x.rebelHeld = (p.x.rebelHeld ?? 0) + 1;
      if (p.x.rebelHeld >= 6) { const n = s.nations[p.owner]; n.stability = clamp(n.stability - 1, -3, 3); p.controller = p.owner; p.x.rebelHeld = 0; log(s, `Los rebeldes de ${p.name} obtienen concesiones de ${n.name}.`, [n.tag], 'war'); }
    } else p.x.rebelHeld = 0;
    // REB armies attack/siege: give them a target
    for (const a of armiesOf(s, 'REB')) if (!a.path.length && s.provinces[a.location].controller === 'REB') {
      const t = neighbours(s, a.location).find((e) => s.provinces[e.to].owner === a.rebelAgainst);
      if (t) a.path = [t.to];
    }
  },
  yearly(s) {
    for (const n of livingNations(s)) {
      if (!n.heirId || !s.characters[n.heirId]?.alive) {
        const r = ruler(s, n);
        if (chance(s, 0.4)) n.heirId = randomCharacter(s, n.tag, { dynasty: r?.dynasty, ageYears: randInt(s, 0, 12) }).id;
      }
      if (n.infamy > 25) for (const o of livingNations(s)) if (o.tag !== n.tag) addRelation(s, o.tag, n.tag, -10);
    }
  },
  onCharacterDeath(s, c) {
    for (const n of livingNations(s)) {
      if (n.rulerId === c.id) {
        const heir = n.heirId && s.characters[n.heirId]?.alive ? s.characters[n.heirId] : null;
        if (heir) { n.rulerId = heir.id; n.heirId = null; log(s, `${heir.name} es el nuevo monarca de ${n.name}.`, [n.tag], 'character'); }
        else {
          n.rulerId = randomCharacter(s, n.tag, { ageYears: randInt(s, 20, 50) }).id;
          n.stability = clamp(n.stability - 1, -3, 3);
          log(s, `${n.name} sufre una crisis sucesoria: −1 estabilidad.`, [n.tag], 'character');
          // personal union through royal marriage
          const partner = Object.keys(n.flags).filter((k) => k.startsWith('rm_')).map((k) => k.slice(3)).find((t) => s.nations[t]?.alive && !s.nations[t].liege);
          if (partner && chance(s, 0.25) && n.tag !== s.player) { n.liege = partner; log(s, `${s.nations[partner].name} hereda la corona de ${n.name} (unión personal).`, [n.tag, partner], 'diplo'); }
        }
      } else if (n.heirId === c.id) n.heirId = null;
    }
  },
  ai(s, n) {
    const r = rules(s);
    const war = atWar(s, n.tag);
    const myArmy = armiesOf(s, n.tag).reduce((t, a) => t + a.units.length, 0);
    const target = Math.max(3, Math.round(provincesOf(s, n.tag).reduce((t, p) => t + p.dev, 0) / 4));
    if (myArmy < target * (war ? 1.5 : 1) && n.treasury > 30) {
      const cap = s.provinces[n.capital];
      if (cap.controller === n.tag) {
        const type = chance(s, 0.6) ? 'infantry' : chance(s, 0.5) ? 'cavalry' : 'artillery';
        const ok = r.actions[0].available!(s, n.tag, { province: n.capital, type });
        if (ok === true) r.actions[0].run(s, n.tag, { province: n.capital, type });
      }
    }
    if (!war) {
      if ((n.x.colonists ?? 0) >= 1 && n.treasury > 120) {
        const free = Object.values(s.provinces).filter((p) => !p.owner && reachable(s, n.tag, p));
        const p = free.sort((a, b) => distance(s.provinces[n.capital], a) - distance(s.provinces[n.capital], b))[0];
        if (p) actions.find((a) => a.id === 'colonize')!.run(s, n.tag, { province: p.id });
      }
      if (n.treasury > 200 && chance(s, 0.2)) {
        const p = provincesOf(s, n.tag).sort((a, b) => b.dev - a.dev)[randInt(s, 0, 2)];
        if (p && (p.buildings.tax_office ?? 0) < 2) { n.treasury -= 100; queueBuilding(s, n.tag, p.id, 'tax_office', 'tax_office', 365); }
      }
      if (n.treasury > 80 && chance(s, 0.1)) {
        const cots = Object.values(s.provinces).filter((p) => p.x.cot && (p.x[`m_${n.tag}`] ?? 0) < 3);
        const c = cots.sort((a, b) => distance(s.provinces[n.capital], a) - distance(s.provinces[n.capital], b))[0];
        if (c) actions.find((a) => a.id === 'merchant')!.run(s, n.tag, { province: c.id });
      }
      if (n.treasury > 60 && chance(s, 0.1)) {
        const heretic = provincesOf(s, n.tag).find((p) => p.religion !== n.religion);
        if (heretic) actions.find((a) => a.id === 'missionary')!.run(s, n.tag, { province: heretic.id });
      }
      if (!n.flags.discovered && (n.tech.naval ?? 0) >= 2 && n.treasury > 200 && chance(s, 0.05) && provincesOf(s, n.tag).some((p) => p.coastal && p.lon < 2)) actions.find((a) => a.id === 'explore')!.run(s, n.tag, {});
      if ((n.x.ships ?? 0) < 10 && n.treasury > 150 && provincesOf(s, n.tag).some((p) => p.coastal)) actions.find((a) => a.id === 'ships')!.run(s, n.tag, {});
    }
  },
  combatMultiplier(s, army) {
    const n = s.nations[army.owner];
    if (!n) return 1;
    return (1 + (n.tech.land ?? 1) * 0.1) * (1 + (n.x.pol_quality ?? 0) * -0.02) * (1 + Math.max(0, n.stability) * 0.02);
  },
  provinceValue(_s, p) { return 1 + p.dev + (p.x.cot ? 3 : 0); },
  topBar(s, tag) {
    const n = s.nations[tag];
    const inc = Object.values(n.lastIncome).reduce((t, v) => t + v, 0);
    return [
      { label: 'Ducados', value: `${Math.round(n.treasury)} (${inc >= 0 ? '+' : ''}${inc.toFixed(1)})`, hint: Object.entries(n.lastIncome).map(([k, v]) => `${k}: ${v.toFixed(1)}`).join('\n') },
      { label: 'Estabilidad', value: (n.stability > 0 ? '+' : '') + Math.round(n.stability) },
      { label: 'Mano de obra', value: Math.round(n.manpower).toLocaleString('es') },
      { label: 'Agresividad', value: n.infamy.toFixed(1) },
      { label: 'Inflación', value: `${(n.x.inflation ?? 0).toFixed(1)} %` },
      { label: 'Colonos', value: (n.x.colonists ?? 0).toFixed(1) },
    ];
  },
  nationStats(s, tag) {
    const n = s.nations[tag];
    const r = ruler(s, n);
    const h = n.heirId ? s.characters[n.heirId] : null;
    return [
      { label: 'Monarca', value: r ? `${r.name} ${r.dynasty} (${age(s, r)})  ADM ${stat(r, 'stewardship')} · DIP ${stat(r, 'diplomacy')} · MIL ${stat(r, 'martial')}` : '—' },
      { label: 'Heredero', value: h ? `${h.name} (${age(s, h)})` : 'Sin heredero' },
      { label: 'Religión del Estado', value: n.religion },
      { label: 'Tecnología', value: Object.entries(TECHS).map(([k, l]) => `${l} ${n.tech[k] ?? 0} (${Math.round(100 * (n.x[`rp_${k}`] ?? 0) / techCost(s, n, k))} %)`).join(' · ') },
      { label: 'Presupuesto', value: budgetKeys.map((k) => `${k === 'stability' ? 'Estab.' : TECHS[k]} ${n.x[`bud_${k}`] ?? 0} %`).join(' · ') },
      { label: 'Políticas', value: Object.entries(POLICIES).map(([k, [a, b]]) => `${a}/${b}: ${n.x[k] ?? 0}`).join(' · ') },
      { label: 'Flota', value: `${Math.round(n.x.ships ?? 0)} barcos` },
      { label: 'Préstamos', value: String(n.x.loans ?? 0) },
      { label: 'Nuevo Mundo', value: n.flags.discovered ? 'Descubierto' : 'Desconocido' },
    ];
  },
  provinceStats(s, p) {
    const merchants = Object.entries(p.x).filter(([k, v]) => k.startsWith('m_') && v > 0).map(([k, v]) => `${s.nations[k.slice(2)]?.name ?? k} ×${v}`);
    return [
      { label: 'Desarrollo', value: String(p.dev) },
      { label: 'Religión / cultura', value: `${p.religion} / ${p.culture}` },
      { label: 'Descontento', value: p.unrest.toFixed(1) },
      { label: 'Fortificación', value: String(p.fort) },
      ...(p.x.cot ? [{ label: '★ Centro de comercio', value: `valor ${p.x.cot}: ${merchants.join(', ') || 'sin mercaderes'}` }] : []),
      ...(p.x.colony !== undefined && p.x.colony < 1000 ? [{ label: 'Colonia', value: `${Math.round(p.x.colony)} / 1000 colonos` }] : []),
      ...(!p.owner ? [{ label: 'Nativos', value: String(p.x.natives ?? 0) }] : []),
      ...(p.x.gold ? [{ label: 'Oro', value: `${p.x.gold}/mes` }] : []),
    ];
  },
  mapModes: [
    { id: 'religion', label: 'Religión', color: (_s, p) => RELIGION_COLORS[p.religion] ?? '#888' },
    { id: 'trade', label: 'Comercio', color: (_s, p) => (p.x.cot ? `hsl(45 90% ${30 + p.x.cot * 3}%)` : '#3a3a3a') },
    { id: 'unrest', label: 'Descontento', color: (_s, p) => `hsl(${Math.max(0, 120 - p.unrest * 15)} 60% 40%)` },
  ],
  peaceExtras: [{ id: 'vassalize', label: 'Vasallaje', cost: 50 }, { id: 'annex', label: 'Anexión', cost: 100 }],
  onPeaceExtra(s, winner, loser, extra) {
    if (extra === 'annex') { s.nations[winner].infamy += provincesOf(s, loser).length * 1.5; annex(s, winner, loser); }
    else if (extra === 'vassalize') { s.nations[loser].liege = winner; s.nations[winner].infamy += 3; }
  },
  onWarDeclared(s, attacker, target, goal) {
    const n = s.nations[attacker];
    const cb = goal && (n.claims.includes(goal) || s.provinces[goal]?.cores.includes(attacker)) || s.nations[target].religion !== n.religion;
    if (!cb) { n.stability = clamp(n.stability - 2, -3, 3); n.infamy += 3; log(s, `${n.name} declara la guerra sin casus belli: −2 estabilidad.`, [attacker], 'diplo'); }
  },
  victory(s) {
    const scores = livingNations(s).filter((n) => !n.liege).map((n) => ({ n, v: provincesOf(s, n.tag).reduce((t, p) => t + p.dev, 0) + Object.values(n.tech).reduce((t, v) => t + v, 0) * 5 + n.prestige / 10 }));
    scores.sort((a, b) => b.v - a.v);
    return `${scores[0]?.n.name ?? '—'} es la gran potencia de la época`;
  },
};

registerRuleset(earlymodern);
