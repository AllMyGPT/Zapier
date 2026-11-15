import {
  addRelation, age, annex, armiesOf, atWar, declareWar, killCharacter, livingNations, log,
  militaryPower, provincesOf, registerRuleset, relation, rules, spawnArmy, topLiege, vassalsOf,
} from '@/engine/core';
import { neighbours } from '@/engine/map';
import type { ActionDef, Ruleset, UnitType } from '@/engine/ruleset';
import type { Character, GameState, Nation, Province } from '@/engine/types';
import { chance, clamp, pick, rand, randInt, uid } from '@/engine/util';
import {
  childrenOf, ensureRulers, monthlyCharacters, ownedArg, processGoldQueues, queueBuilding, randomCharacter, recruitAction, stat, upkeep,
} from './common';

const U = (id: string, name: string, attack: number, defence: number, speed: number, siege: number, cost: number, manpower: number, upkeep: number, buildDays: number): UnitType =>
  ({ id, name, attack, defence, speed, siege, cost, manpower, upkeep, buildDays, size: manpower });

const unitTypes: Record<string, UnitType> = {
  levy: U('levy', 'Leva campesina', 1, 1.2, 1, 0.1, 8, 1000, 0.25, 20),
  archers: U('archers', 'Arqueros', 1.4, 1.1, 1, 0.1, 14, 500, 0.35, 30),
  pikemen: U('pikemen', 'Piqueros', 1.2, 2, 0.9, 0.1, 18, 500, 0.4, 30),
  light_cav: U('light_cav', 'Caballería ligera', 1.6, 0.8, 1.5, 0, 25, 300, 0.6, 40),
  knights: U('knights', 'Caballeros', 3.2, 2.2, 1.2, 0, 55, 200, 1.2, 60),
  siege: U('siege', 'Ingenios de asedio', 0.3, 0.3, 0.7, 3, 40, 200, 0.6, 60),
};

const BUILDINGS: Record<string, { label: string; cost: number; days: number; desc: string }> = {
  castle: { label: 'Castillo', cost: 80, days: 180, desc: '+1 fortificación' },
  church: { label: 'Iglesia', cost: 50, days: 120, desc: '+0,5 piedad mensual' },
  market: { label: 'Mercado', cost: 60, days: 120, desc: '+25 % impuestos' },
  barracks: { label: 'Cuartel', cost: 60, days: 120, desc: '+25 % mano de obra' },
};

const LAWS = ['Primogenitura', 'Gavelkind (reparto)', 'Antigüedad'];
const CHRISTIAN = ['catholic', 'orthodox'];

function ruler(s: GameState, n: Nation) { return n.rulerId ? s.characters[n.rulerId] : null; }
function demesneLimit(s: GameState, n: Nation) { return 3 + Math.floor(stat(ruler(s, n), 'stewardship') / 3) + (n.x.crown ?? 1); }

function provinceIncome(p: Province) { return p.dev * 0.45 * (1 + (p.buildings.market ?? 0) * 0.25) * (p.controller === p.owner ? 1 : 0.2); }

function computeHeir(s: GameState, n: Nation): string | null {
  const r = ruler(s, n);
  if (!r) return null;
  const alive = (c?: Character | null) => !!c && c.alive;
  const law = n.x.law ?? 0;
  const dynastyMembers = Object.values(s.characters).filter((c) => c.alive && c.dynasty === r.dynasty && c.id !== r.id);
  if (law === 2) {
    const males = dynastyMembers.filter((c) => !c.female && c.tag === n.tag).sort((a, b) => a.born - b.born);
    return males[0]?.id ?? dynastyMembers.sort((a, b) => a.born - b.born)[0]?.id ?? null;
  }
  const kids = childrenOf(s, r.id).filter(alive);
  const son = kids.find((k) => !k.female);
  if (son) return son.id;
  // grandchildren through deceased sons
  for (const k of childrenOf(s, r.id).filter((c) => !c.female)) {
    const gs = childrenOf(s, k.id).filter(alive);
    if (gs.length) return (gs.find((g) => !g.female) ?? gs[0]).id;
  }
  const daughter = kids.find((k) => k.female);
  if (daughter) return daughter.id;
  if (r.father) {
    const sib = childrenOf(s, r.father).filter((c) => alive(c) && c.id !== r.id);
    if (sib.length) return (sib.find((c) => !c.female) ?? sib[0]).id;
  }
  return dynastyMembers.sort((a, b) => a.born - b.born)[0]?.id ?? null;
}

function succession(s: GameState, n: Nation) {
  const dead = ruler(s, n);
  const heirId = n.heirId && s.characters[n.heirId]?.alive ? n.heirId : computeHeir(s, n);
  let heir = heirId ? s.characters[heirId] : null;
  // gavelkind: younger sons receive provinces as vassal realms
  if ((n.x.law ?? 0) === 1 && dead) {
    const sons = childrenOf(s, dead.id).filter((c) => c.alive && !c.female && c.id !== heir?.id && age(s, c) >= 0);
    const lands = provincesOf(s, n.tag).filter((p) => p.id !== n.capital).sort((a, b) => b.dev - a.dev);
    for (const son of sons) {
      const share = lands.splice(0, Math.max(1, Math.floor(lands.length / (sons.length + 2))));
      if (!share.length) break;
      const v = createVassal(s, n, share.map((p) => p.id), son);
      log(s, `Por el gavelkind, ${son.name} recibe ${share.map((p) => p.name).join(', ')} (${v.name}).`, [n.tag], 'character');
    }
  }
  if (heir && heir.tag !== n.tag) {
    const other = s.nations[heir.tag];
    if (other?.alive && other.rulerId === heir.id) {
      // personal union: the inheriting realm becomes liege
      n.liege = other.tag;
      log(s, `${heir.name}, soberano de ${other.name}, hereda ${n.name}: unión personal.`, [n.tag, other.tag], 'character');
      n.rulerId = randomCharacter(s, n.tag, { dynasty: heir.dynasty }).id;
      n.heirId = null;
      return;
    }
    heir.tag = n.tag;
  }
  if (!heir) {
    heir = randomCharacter(s, n.tag, { ageYears: randInt(s, 20, 45) });
    n.stability = clamp(n.stability - 1, -3, 3);
    n.prestige -= 50;
    log(s, `${n.name} se queda sin heredero: una nueva casa, ${heir.dynasty}, toma el poder.`, [n.tag], 'character');
    for (const v of vassalsOf(s, n.tag)) addRelation(s, v.tag, n.tag, -30);
  } else {
    log(s, `${heir.name} de ${heir.dynasty} sucede en el trono de ${n.name}.`, [n.tag], 'character');
    for (const v of vassalsOf(s, n.tag)) addRelation(s, v.tag, n.tag, -10 + stat(heir, 'diplomacy'));
  }
  n.rulerId = heir.id;
  n.heirId = computeHeir(s, n);
}

function createVassal(s: GameState, liege: Nation, pids: string[], holder?: Character): Nation {
  const tag = uid(s, 'V');
  const holderC = holder ?? randomCharacter(s, liege.tag, {});
  const main = s.provinces[pids[0]];
  const lighten = (hex: string) => {
    const v = parseInt(hex.slice(1), 16);
    const f = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.35 + rand(s) * 20 - 10));
    return `#${[(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`;
  };
  const v: Nation = {
    ...structuredClone(liege), tag, name: `Señorío de ${main.name}`, color: lighten(liege.color), capital: main.id, alive: true,
    treasury: 20, manpower: 0, stability: 0, prestige: 0, infamy: 0, liege: liege.tag, allies: [], relations: {}, truces: {}, claims: [],
    rulerId: holderC.id, heirId: null, flags: {}, queue: [], lastIncome: {}, x: { piety: 0, crown: 0, law: 1 },
  };
  s.nations[tag] = v;
  holderC.tag = tag;
  for (const pid of pids) {
    const p = s.provinces[pid];
    p.owner = p.controller = tag;
    if (!p.cores.includes(tag)) p.cores.push(tag);
  }
  setRel(s, tag, liege.tag, 40 + stat(holderC, 'diplomacy') * 3);
  // move the holder's spouse & children
  for (const c of Object.values(s.characters)) if (c.alive && (c.father === holderC.id || c.mother === holderC.id || c.id === holderC.spouse)) c.tag = tag;
  return v;
}
const setRel = (s: GameState, a: string, b: string, v: number) => { addRelation(s, a, b, v - relation(s, a, b)); };

function realmIncome(s: GameState, n: Nation) {
  const r = ruler(s, n);
  const demesne = provincesOf(s, n.tag);
  const over = Math.max(0, demesne.length - demesneLimit(s, n));
  const base = demesne.reduce((t, p) => t + provinceIncome(p), 0) * (1 + stat(r, 'stewardship') * 0.03) * (1 - over * 0.08);
  const tribute = vassalsOf(s, n.tag).reduce((t, v) => t + provincesOf(s, v.tag).reduce((u, p) => u + provinceIncome(p), 0) * (0.15 + (n.x.crown ?? 1) * 0.05), 0);
  return { demesne: Math.max(0, base), tribute };
}

const actions: ActionDef[] = [
  recruitAction('Ejército'),
  {
    id: 'raise_levies', label: 'Convocar levas', group: 'Ejército',
    description: 'Llama a las armas a las levas del dominio y de los vasallos leales. Gratis, pero agota la mano de obra.',
    available: (s, tag) => (s.nations[tag].manpower >= 2000 ? true : 'Necesitas al menos 2.000 hombres disponibles'),
    run: (s, tag) => {
      const n = s.nations[tag];
      const count = Math.min(30, Math.floor(n.manpower / 1000));
      n.manpower -= count * 1000;
      const cap = s.provinces[n.capital].controller === tag ? n.capital : provincesOf(s, tag).find((p) => p.controller === tag)?.id;
      if (!cap) return;
      const a = spawnArmy(s, tag, cap, { levy: Math.ceil(count * 0.6), archers: Math.floor(count * 0.25), light_cav: Math.floor(count * 0.1), knights: Math.max(1, Math.floor(count * 0.05)) }, 'Hueste real');
      if (n.rulerId && !Object.values(s.armies).some((x) => x.leaderId === n.rulerId)) a.leaderId = n.rulerId;
      for (const v of vassalsOf(s, tag)) {
        if (relation(s, v.tag, tag) < 0 || v.tag === s.player) continue;
        const vc = provincesOf(s, v.tag).find((p) => p.controller === v.tag);
        if (vc && v.manpower >= 1000) { const k = Math.floor(v.manpower / 1000); v.manpower -= k * 1000; spawnArmy(s, v.tag, vc.id, { levy: k }, `Mesnada de ${v.name}`); }
      }
    },
  },
  {
    id: 'build', label: 'Construir', group: 'Dominio', scope: 'province',
    description: 'Mejora una provincia de tu dominio.',
    args: [ownedArg(), { key: 'building', label: 'Edificio', kind: 'choice', options: Object.entries(BUILDINGS).map(([k, b]) => ({ value: k, label: `${b.label} (${b.cost} oro, ${b.desc})` })) }],
    available: (s, tag, a) => {
      if (!a) return true;
      const p = s.provinces[a.province as string], b = BUILDINGS[a.building as string];
      if (!p || p.owner !== tag) return 'Solo en tu dominio';
      if (!b) return 'Elige un edificio';
      if ((p.buildings[a.building as string] ?? 0) >= 3) return 'Nivel máximo';
      return s.nations[tag].treasury >= b.cost ? true : 'Oro insuficiente';
    },
    run: (s, tag, a) => { const b = BUILDINGS[a.building as string]; s.nations[tag].treasury -= b.cost; queueBuilding(s, tag, a.province as string, a.building as string, b.label, b.days); },
  },
  {
    id: 'grant_title', label: 'Conceder título', group: 'Vasallos', scope: 'province',
    description: 'Entrega una provincia a un miembro de la corte como vasallo. Reduce la sobrecarga de dominio y mejora la opinión de la nobleza.',
    args: [ownedArg()],
    available: (s, tag, a) => {
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p || p.owner !== tag) return 'Solo en tu dominio';
      if (p.id === s.nations[tag].capital) return 'No puedes ceder la capital';
      return true;
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const r = ruler(s, n);
      const candidate = Object.values(s.characters).find((c) => c.alive && c.tag === tag && c.id !== n.rulerId && c.id !== n.heirId && !c.female && age(s, c) >= 16 && c.dynasty === r?.dynasty);
      const v = createVassal(s, n, [a.province as string], candidate);
      n.prestige += 10;
      for (const o of vassalsOf(s, tag)) if (o.tag !== v.tag) addRelation(s, o.tag, tag, 5);
      log(s, `${n.name} concede ${s.provinces[a.province as string].name} a ${s.characters[v.rulerId!].name}.`, [tag], 'diplo');
    },
  },
  {
    id: 'revoke_title', label: 'Revocar título', group: 'Vasallos',
    description: 'Arrebata las tierras a un vasallo. Si se niega, se rebelará; el resto de vasallos se indignará.',
    args: [{ key: 'target', label: 'Vasallo', kind: 'nation' }],
    available: (s, tag, a) => (!a || s.nations[a.target as string]?.liege === tag ? true : 'Debe ser tu vasallo directo'),
    run: (s, tag, a) => {
      const v = s.nations[a.target as string];
      for (const o of vassalsOf(s, tag)) addRelation(s, o.tag, tag, -15);
      if (relation(s, v.tag, tag) > 50 && militaryPower(s, v.tag) < militaryPower(s, tag) * 0.4 || v.tag === s.player) {
        annex(s, tag, v.tag);
        log(s, `${s.nations[tag].name} revoca los títulos de ${v.name}.`, [tag], 'diplo');
      } else {
        v.liege = null;
        declareWar(s, v.tag, tag, null, `Rebelión de ${v.name}`);
      }
    },
  },
  {
    id: 'gift_vassal', label: 'Regalo a un vasallo', group: 'Vasallos',
    description: 'Compra la lealtad de un vasallo con oro.',
    args: [{ key: 'target', label: 'Vasallo', kind: 'nation' }],
    cost: () => '30 oro',
    available: (s, tag, a) => (s.nations[tag].treasury < 30 ? 'Oro insuficiente' : !a || s.nations[a.target as string]?.liege === tag ? true : 'Debe ser tu vasallo'),
    run: (s, tag, a) => { s.nations[tag].treasury -= 30; s.nations[a.target as string].treasury += 30; addRelation(s, a.target as string, tag, 30); },
  },
  {
    id: 'crown_authority', label: 'Cambiar autoridad de la Corona', group: 'Leyes',
    description: 'Más autoridad = más tributo y límite de dominio, pero menos opinión de los vasallos.',
    args: [{ key: 'level', label: 'Nivel', kind: 'choice', options: ['Mínima', 'Baja', 'Media', 'Alta', 'Absoluta'].map((l, i) => ({ value: String(i), label: l })) }],
    available: (s, tag) => (s.nations[tag].flags.law_change && s.day - s.nations[tag].flags.law_change < 3650 ? 'Solo cada 10 años' : true),
    run: (s, tag, a) => {
      const n = s.nations[tag];
      const lvl = Number(a.level);
      const diff = lvl - (n.x.crown ?? 1);
      n.x.crown = lvl;
      n.flags.law_change = s.day;
      for (const v of vassalsOf(s, tag)) addRelation(s, v.tag, tag, -diff * 25);
    },
  },
  {
    id: 'succession_law', label: 'Cambiar ley de sucesión', group: 'Leyes',
    description: 'Primogenitura evita la fragmentación pero exige prestigio; el gavelkind reparte el reino entre los hijos.',
    args: [{ key: 'law', label: 'Ley', kind: 'choice', options: LAWS.map((l, i) => ({ value: String(i), label: l })) }],
    available: (s, tag) => (s.nations[tag].prestige < 100 ? 'Requiere 100 de prestigio' : true),
    run: (s, tag, a) => {
      const n = s.nations[tag];
      n.prestige -= 100;
      n.x.law = Number(a.law);
      n.heirId = computeHeir(s, n);
      for (const v of vassalsOf(s, tag)) addRelation(s, v.tag, tag, -20);
    },
  },
  {
    id: 'marriage', label: 'Concertar matrimonio', group: 'Corte',
    description: 'Casa a un miembro soltero de tu dinastía con la corte de otro reino. Mejora relaciones y puede crear derechos sucesorios (uniones personales).',
    args: [{ key: 'character', label: 'Familiar', kind: 'character' }, { key: 'target', label: 'Reino', kind: 'nation' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const c = s.characters[a.character as string];
      const o = s.nations[a.target as string];
      if (!c || !c.alive || c.spouse || age(s, c) < 15) return 'Elige un familiar adulto soltero';
      if (!o?.alive || o.tag === tag) return 'Elige otro reino';
      if (relation(s, tag, o.tag) < -20) return 'Relaciones demasiado malas';
      return true;
    },
    run: (s, tag, a) => {
      const c = s.characters[a.character as string];
      const o = s.nations[a.target as string];
      const orul = ruler(s, o);
      // prefer a child of the other ruler
      const partner = orul ? childrenOf(s, orul.id).find((k) => k.alive && !k.spouse && k.female !== c.female && age(s, k) >= 15) : null;
      const spouse = partner ?? randomCharacter(s, o.tag, { female: !c.female, ageYears: Math.max(15, age(s, c) - randInt(s, -3, 6)), dynasty: orul?.dynasty });
      c.spouse = spouse.id; spouse.spouse = c.id;
      // wife joins husband's court
      if (c.female) c.tag = spouse.tag; else spouse.tag = c.tag;
      addRelation(s, tag, o.tag, 40);
      log(s, `Boda: ${c.name} de ${c.dynasty} con ${spouse.name} de ${spouse.dynasty} (${o.name}).`, [tag, o.tag], 'character');
    },
  },
  {
    id: 'fabricate_claim', label: 'Fabricar reclamación', group: 'Intriga',
    description: 'Tu canciller falsifica documentos para reclamar una provincia vecina: otorga casus belli.',
    args: [{ key: 'province', label: 'Provincia ajena', kind: 'province' }],
    cost: () => '40 oro',
    available: (s, tag, a) => {
      if (s.nations[tag].treasury < 40) return 'Oro insuficiente';
      if (!a) return true;
      const p = s.provinces[a.province as string];
      if (!p?.owner || p.owner === tag) return 'Elige una provincia ajena';
      const border = provincesOf(s, tag).some((q) => neighbours(s, q.id).some((e) => e.to === p.id));
      return border ? true : 'Debe limitar con tu reino';
    },
    run: (s, tag, a) => {
      const n = s.nations[tag];
      n.treasury -= 40;
      const p = s.provinces[a.province as string];
      if (chance(s, 0.3 + stat(ruler(s, n), 'intrigue') * 0.05)) { n.claims.push(p.id); log(s, `${n.name} obtiene una reclamación sobre ${p.name}.`, [tag], 'diplo'); }
      else { addRelation(s, tag, p.owner!, -30); log(s, `La falsificación de ${n.name} sobre ${p.name} ha sido descubierta.`, [tag], 'diplo'); }
    },
  },
  {
    id: 'assassinate', label: 'Conspirar para asesinar', group: 'Intriga',
    description: 'Intenta eliminar al soberano de otro reino. Si se descubre, perderás prestigio y piedad.',
    args: [{ key: 'target', label: 'Reino', kind: 'nation' }],
    cost: () => '60 oro',
    available: (s, tag, a) => (s.nations[tag].treasury < 60 ? 'Oro insuficiente' : !a || (a.target !== tag && s.nations[a.target as string]?.rulerId) ? true : 'Objetivo inválido'),
    run: (s, tag, a) => {
      const n = s.nations[tag], o = s.nations[a.target as string];
      n.treasury -= 60;
      const odds = 0.15 + (stat(ruler(s, n), 'intrigue') - stat(ruler(s, o), 'intrigue')) * 0.04;
      if (chance(s, clamp(odds, 0.05, 0.6))) { killCharacter(s, o.rulerId!, 'asesinado'); }
      else log(s, `Una conspiración contra ${o.name} fracasa.`, [tag, o.tag], 'character');
      if (chance(s, 0.4)) { n.prestige -= 50; n.x.piety = (n.x.piety ?? 0) - 50; addRelation(s, tag, o.tag, -100); log(s, `¡${n.name} estaba detrás de la conspiración!`, [tag, o.tag], 'character'); }
    },
  },
  {
    id: 'donate', label: 'Donar a la Iglesia', group: 'Religión',
    description: 'Convierte oro en piedad.',
    cost: () => '50 oro → +25 piedad',
    available: (s, tag) => (s.nations[tag].treasury >= 50 ? true : 'Oro insuficiente'),
    run: (s, tag) => { s.nations[tag].treasury -= 50; s.nations[tag].x.piety = (s.nations[tag].x.piety ?? 0) + 25; },
  },
  {
    id: 'crusade', label: 'Proclamar guerra santa', group: 'Religión',
    description: 'Con 300 de piedad, llama a todos los reinos de tu fe contra el señor de Jerusalén (o la provincia sagrada más cercana).',
    available: (s, tag) => {
      const n = s.nations[tag];
      if ((n.x.piety ?? 0) < 300) return 'Requiere 300 de piedad';
      const holder = s.provinces.jerusalem?.owner;
      if (!holder || holder === tag || s.nations[holder].religion === n.religion) return 'Los lugares santos ya están en manos de tu fe';
      return true;
    },
    run: (s, tag) => {
      const n = s.nations[tag];
      n.x.piety -= 300;
      const holder = s.provinces.jerusalem.owner!;
      const w = declareWar(s, tag, holder, 'jerusalem', 'Guerra Santa');
      if (!w) return;
      for (const o of livingNations(s)) if (o.religion === n.religion && !o.liege && o.tag !== tag && !w.attackers.includes(o.tag) && !w.defenders.includes(o.tag) && (o.tag !== s.player)) w.attackers.push(o.tag);
      n.prestige += 100;
    },
  },
  {
    id: 'demand_fealty', label: 'Exigir vasallaje', group: 'Diplomacia',
    description: 'Exige a un reino pequeño y amistoso que te jure fidelidad.',
    args: [{ key: 'target', label: 'Reino', kind: 'nation' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const o = s.nations[a.target as string];
      if (!o?.alive || o.liege || o.tag === tag) return 'Objetivo inválido';
      return true;
    },
    run: (s, tag, a) => {
      const o = s.nations[a.target as string];
      const ratio = militaryPower(s, tag) / Math.max(1, militaryPower(s, o.tag));
      const ok = o.tag !== s.player && ratio > 3 && relation(s, o.tag, tag) > 50 + stat(ruler(s, o), 'martial') * 5;
      if (ok) { o.liege = tag; log(s, `${o.name} jura vasallaje a ${s.nations[tag].name}.`, [tag, o.tag], 'diplo'); }
      else { addRelation(s, o.tag, tag, -20); log(s, `${o.name} rechaza someterse a ${s.nations[tag].name}.`, [tag, o.tag], 'diplo'); }
    },
  },
];

export const medieval: Ruleset & { onCharacterDeath(s: GameState, c: Character): void } = {
  era: 'medieval',
  name: 'Feudal y dinástico',
  unitTypes,
  moveBaseDays: 4,
  siegeBaseDays: 45,
  actions,
  init(s) {
    ensureRulers(s, true);
    for (const n of Object.values(s.nations)) {
      if (n.x.pseudo) continue;
      n.x.piety ??= 50; n.x.crown ??= 1; n.x.law ??= 0;
      n.manpower = n.manpower || provincesOf(s, n.tag).reduce((t, p) => t + p.dev * 600, 0);
      n.heirId = n.heirId ?? computeHeir(s, n);
      if (n.liege) setRel(s, n.tag, n.liege, Math.max(relation(s, n.tag, n.liege), 60));
    }
  },
  daily(s) { processGoldQueues(s); },
  monthly(s) {
    monthlyCharacters(s, true);
    for (const n of livingNations(s)) {
      const inc = realmIncome(s, n);
      const exp = upkeep(s, n.tag);
      n.lastIncome = { 'Dominio': inc.demesne, 'Tributo vasallos': inc.tribute, 'Mantenimiento': -exp };
      n.treasury += inc.demesne + inc.tribute - exp;
      if (n.liege) s.nations[n.liege] && (n.treasury -= inc.demesne * (0.15 + (s.nations[n.liege].x.crown ?? 1) * 0.05));
      const maxMp = provincesOf(s, n.tag).reduce((t, p) => t + p.dev * 600 * (1 + (p.buildings.barracks ?? 0) * 0.25), 0);
      n.manpower = Math.min(maxMp, n.manpower + maxMp / 60);
      const churches = provincesOf(s, n.tag).reduce((t, p) => t + (p.buildings.church ?? 0), 0);
      n.x.piety = (n.x.piety ?? 0) + 0.5 + churches * 0.5 + (ruler(s, n)?.traits.includes('piadoso') ? 1 : 0);
      n.prestige += provincesOf(s, n.tag).length * 0.05 + (n.liege ? 0 : 0.5);
      if (n.treasury < 0) { n.stability = clamp(n.stability - 0.1, -3, 3); for (const a of armiesOf(s, n.tag)) for (const u of a.units) u.org = Math.max(0, u.org - 0.2); }
      // vassal opinion drift
      if (n.liege) {
        const liege = s.nations[n.liege];
        const lr = ruler(s, liege);
        const over = Math.max(0, provincesOf(s, liege.tag).length - demesneLimit(s, liege));
        const target = 20 + stat(lr, 'diplomacy') * 4 - (liege.x.crown ?? 1) * 10 - over * 8 + Math.min(40, liege.prestige / 20);
        const cur = relation(s, n.tag, liege.tag);
        setRel(s, n.tag, liege.tag, cur + Math.sign(target - cur) * Math.min(3, Math.abs(target - cur)));
        // join liege wars
        for (const w of s.wars) {
          const side = w.attackers.includes(liege.tag) ? w.attackers : w.defenders.includes(liege.tag) ? w.defenders : null;
          if (side && !w.attackers.includes(n.tag) && !w.defenders.includes(n.tag) && relation(s, n.tag, liege.tag) > -20) side.push(n.tag);
        }
        // faction revolt
        if (relation(s, n.tag, liege.tag) < -50 && n.tag !== s.player && !atWar(s, n.tag) && chance(s, 0.05)) {
          declareWar(s, n.tag, liege.tag, null, `Revuelta de ${n.name}`);
        }
      }
      if (!n.heirId || !s.characters[n.heirId]?.alive) n.heirId = computeHeir(s, n);
    }
    // AI marriages
    for (const c of Object.values(s.characters)) {
      if (!c.alive || c.spouse || age(s, c) < 16 || age(s, c) > 45 || c.tag === s.player || !chance(s, 0.05)) continue;
      const n = s.nations[c.tag];
      if (!n?.alive || ruler(s, n)?.dynasty !== c.dynasty) continue;
      const sp = randomCharacter(s, c.tag, { female: !c.female, ageYears: Math.max(16, age(s, c) - randInt(s, -2, 8)) });
      c.spouse = sp.id; sp.spouse = c.id;
    }
  },
  yearly(s) {
    // keep saves small: forget characters dead for more than 80 years
    for (const c of Object.values(s.characters)) if (!c.alive && c.died !== undefined && s.day - c.died > 365 * 80) delete s.characters[c.id];
    for (const n of livingNations(s)) if ((n.x.piety ?? 0) < -100) { n.stability = clamp(n.stability - 1, -3, 3); log(s, `${n.name} ha sido excomulgado por su impiedad.`, [n.tag], 'event'); n.x.piety = -50; }
  },
  ai(s, n) {
    const r = rules(s);
    if (atWar(s, n.tag) && n.manpower > 3000 && !armiesOf(s, n.tag).some((a) => a.name === 'Hueste real')) r.actions.find((a) => a.id === 'raise_levies')!.run(s, n.tag, {});
    if (atWar(s, n.tag) && n.treasury > 80 && n.manpower > 500) {
      const cap = s.provinces[n.capital];
      if (cap.owner === n.tag && cap.controller === n.tag) {
        const type = pick(s, ['knights', 'archers', 'pikemen', 'light_cav']);
        if (n.treasury >= unitTypes[type].cost) r.actions[0].run(s, n.tag, { province: n.capital, type });
      }
    }
    if (!atWar(s, n.tag)) {
      // disband levies in peace
      for (const a of armiesOf(s, n.tag)) if (a.name === 'Hueste real' || a.name.startsWith('Mesnada')) {
        n.manpower += a.units.reduce((t, u) => t + u.str * (unitTypes[u.type]?.manpower ?? 0), 0);
        delete s.armies[a.id];
      }
      if (n.treasury > 150 && chance(s, 0.2)) {
        const p = pick(s, provincesOf(s, n.tag));
        const b = pick(s, Object.keys(BUILDINGS));
        if (p && (p.buildings[b] ?? 0) < 2) { n.treasury -= BUILDINGS[b].cost; queueBuilding(s, n.tag, p.id, b, BUILDINGS[b].label, BUILDINGS[b].days); }
      }
      if (n.treasury > 200 && armiesOf(s, n.tag).length < 2) r.actions[0].run(s, n.tag, { province: n.capital, type: 'knights' });
      // overloaded demesne → grant titles
      const own = provincesOf(s, n.tag);
      if (own.length > demesneLimit(s, n) + 1 && chance(s, 0.3)) {
        const p = own.filter((q) => q.id !== n.capital).sort((a, b) => a.dev - b.dev)[0];
        if (p) actions.find((a) => a.id === 'grant_title')!.run(s, n.tag, { province: p.id });
      }
      if (n.treasury > 100 && chance(s, 0.04) && !n.liege) {
        const border = new Set<string>();
        for (const p of own) for (const e of neighbours(s, p.id)) { const q = s.provinces[e.to]; if (q.owner && topLiege(s, q.owner) !== topLiege(s, n.tag)) border.add(q.id); }
        const t = [...border][0];
        if (t) actions.find((a) => a.id === 'fabricate_claim')!.run(s, n.tag, { province: t });
      }
      if ((n.x.piety ?? 0) > 400 && CHRISTIAN.includes(n.religion) && chance(s, 0.1)) {
        const ok = actions.find((a) => a.id === 'crusade')!.available!(s, n.tag);
        if (ok === true) actions.find((a) => a.id === 'crusade')!.run(s, n.tag, {});
      }
    }
  },
  combatMultiplier(s, army) {
    const n = s.nations[army.owner];
    if (!n) return 1;
    return 1 + Math.min(0.2, n.prestige / 5000) + (n.treasury < 0 ? -0.2 : 0);
  },
  provinceValue(_s, p) { return 1 + p.dev; },
  topBar(s, tag) {
    const n = s.nations[tag];
    const inc = Object.values(n.lastIncome).reduce((t, v) => t + v, 0);
    return [
      { label: 'Oro', value: `${Math.round(n.treasury)} (${inc >= 0 ? '+' : ''}${inc.toFixed(1)})`, hint: Object.entries(n.lastIncome).map(([k, v]) => `${k}: ${v.toFixed(1)}`).join('\n') },
      { label: 'Levas', value: Math.round(n.manpower).toLocaleString('es') },
      { label: 'Prestigio', value: Math.round(n.prestige).toString() },
      { label: 'Piedad', value: Math.round(n.x.piety ?? 0).toString() },
    ];
  },
  nationStats(s, tag) {
    const n = s.nations[tag];
    const r = ruler(s, n);
    const h = n.heirId ? s.characters[n.heirId] : null;
    return [
      { label: 'Soberano', value: r ? `${r.name} de ${r.dynasty} (${age(s, r)} años)` : '—' },
      { label: 'Atributos', value: r ? `Dip ${stat(r, 'diplomacy')} · Mar ${stat(r, 'martial')} · Adm ${stat(r, 'stewardship')} · Int ${stat(r, 'intrigue')}` : '—' },
      { label: 'Rasgos', value: r?.traits.join(', ') || '—' },
      { label: 'Heredero', value: h ? `${h.name} de ${h.dynasty} (${age(s, h)})${h.tag !== tag ? ` — en ${s.nations[h.tag]?.name}` : ''}` : 'Ninguno' },
      { label: 'Sucesión', value: LAWS[n.x.law ?? 0] },
      { label: 'Autoridad de la Corona', value: ['Mínima', 'Baja', 'Media', 'Alta', 'Absoluta'][n.x.crown ?? 1] },
      { label: 'Dominio', value: `${provincesOf(s, tag).length} / ${demesneLimit(s, n)} provincias` },
      { label: 'Vasallos', value: vassalsOf(s, tag).map((v) => `${v.name} (${relation(s, v.tag, tag)})`).join(', ') || 'Ninguno' },
      { label: 'Señor', value: n.liege ? `${s.nations[n.liege].name} (opinión ${relation(s, tag, n.liege)})` : 'Independiente' },
    ];
  },
  provinceStats(_s, p) {
    return [
      { label: 'Riqueza', value: String(p.dev) },
      { label: 'Fortificación', value: String(p.fort) },
      { label: 'Edificios', value: Object.entries(p.buildings).map(([k, v]) => `${BUILDINGS[k]?.label ?? k} ${v}`).join(', ') || '—' },
    ];
  },
  mapModes: [
    { id: 'realm', label: 'Reinos (con vasallos)', color: (s, p) => (p.owner ? s.nations[topLiege(s, p.owner)]?.color ?? '#777' : '#555') },
    { id: 'religion', label: 'Religión', color: (_s, p) => RELIGION_COLORS[p.religion] ?? '#888' },
  ],
  peaceExtras: [{ id: 'vassalize', label: 'Vasallaje', cost: 60 }, { id: 'annex', label: 'Anexión total', cost: 100 }],
  onPeaceExtra(s, winner, loser, extra) {
    if (extra === 'annex') annex(s, winner, loser);
    else if (extra === 'vassalize') { s.nations[loser].liege = winner; setRel(s, loser, winner, 0); }
  },
  onWarDeclared(s, attacker, target, goal) {
    const n = s.nations[attacker];
    const hasCB = goal && (n.claims.includes(goal) || s.provinces[goal]?.cores.includes(attacker));
    if (!hasCB) {
      n.prestige -= 30;
      if (s.nations[target].religion === n.religion) n.x.piety = (n.x.piety ?? 0) - 60;
      for (const v of vassalsOf(s, attacker)) addRelation(s, v.tag, attacker, -10);
    }
  },
  onCharacterDeath(s, c) {
    for (const n of livingNations(s)) {
      if (n.rulerId === c.id) succession(s, n);
      else if (n.heirId === c.id) n.heirId = computeHeir(s, n);
    }
  },
  victory(s) {
    const scores = livingNations(s).filter((n) => !n.liege).map((n) => ({ n, v: n.prestige + (n.x.piety ?? 0) / 2 + provincesOf(s, n.tag).length * 20 + vassalsOf(s, n.tag).length * 30 }));
    scores.sort((a, b) => b.v - a.v);
    return `${scores[0]?.n.name ?? '—'} es el reino más glorioso`;
  },
};

export const RELIGION_COLORS: Record<string, string> = {
  catholic: '#e6d36a', orthodox: '#b88ad6', sunni: '#3f9b4f', shia: '#2d6e4f', pagan: '#9a6a3a', jewish: '#4f7fcf', protestant: '#4a7bd0', reformed: '#8e5ac8',
  sol: '#f2b84b', luna: '#8fb8de', viejos: '#7a8f5a', native: '#a0866b',
};

registerRuleset(medieval);
