import { age, addCharacter, armiesOf, killCharacter, log, provincesOf, rules, spawnArmy } from '@/engine/core';
import type { ActionDef } from '@/engine/ruleset';
import { birthClaims } from './dynasty';
import type { Character, GameState, Nation, Province } from '@/engine/types';
import { chance, dateOf, rand, randInt, pick } from '@/engine/util';

export const NAMES: Record<string, { m: string[]; f: string[]; d: string[] }> = {
  latin: { m: ['Alfonso', 'Fernando', 'Sancho', 'Pedro', 'Juan', 'Enrique', 'Ramiro', 'García', 'Felipe', 'Carlos', 'Luis', 'Jaime'], f: ['Urraca', 'Sancha', 'Isabel', 'Juana', 'Blanca', 'Leonor', 'Elvira', 'Teresa', 'María', 'Constanza'], d: ['Jiménez', 'Ansúrez', 'Lara', 'Haro', 'Castro', 'Trastámara', 'Borja', 'Mendoza', 'Guzmán'] },
  frankish: { m: ['Guillermo', 'Roberto', 'Hugo', 'Felipe', 'Luis', 'Raúl', 'Godofredo', 'Balduino', 'Raimundo', 'Eudes', 'Carlos'], f: ['Matilde', 'Adela', 'Constanza', 'Inés', 'Berta', 'Leonor', 'Blanca', 'Margarita'], d: ['Capeto', 'Blois', 'Anjou', 'Valois', 'Bouillon', 'Lusignan', 'Montfort', 'Clermont'] },
  germanic: { m: ['Enrique', 'Otón', 'Conrado', 'Federico', 'Luis', 'Rodolfo', 'Alberto', 'Bernardo', 'Lotario', 'Hermann'], f: ['Inés', 'Gisela', 'Adelaida', 'Matilde', 'Gertrudis', 'Cunegunda', 'Isabel'], d: ['Salia', 'Welf', 'Hohenstaufen', 'Wittelsbach', 'Habsburgo', 'Wettin', 'Ascania', 'Zähringen'] },
  english: { m: ['Eduardo', 'Haroldo', 'Godwin', 'Ricardo', 'Enrique', 'Guillermo', 'Juan', 'Edmundo', 'Tostig'], f: ['Edith', 'Matilde', 'Leonor', 'Margarita', 'Isabel', 'Juana'], d: ['Wessex', 'Godwinson', 'Plantagenet', 'Lancaster', 'York', 'Tudor', 'Neville', 'Percy'] },
  norse: { m: ['Harald', 'Olaf', 'Magnus', 'Sven', 'Canuto', 'Erik', 'Haakon', 'Sigurd', 'Inge'], f: ['Ingrid', 'Astrid', 'Gyda', 'Thora', 'Ragnhild', 'Sigrid', 'Estrid'], d: ['Hardrada', 'Estridsen', 'Yngling', 'Sverre', 'Folkung', 'Stenkil'] },
  slavic: { m: ['Vladímir', 'Yaroslav', 'Iziaslav', 'Boleslao', 'Casimiro', 'Vratislao', 'Mieszko', 'Sviatoslav', 'Iván', 'Dmitri'], f: ['Ana', 'Dobronega', 'Olga', 'Eufrosina', 'Ludmila', 'Rixa', 'Sofía'], d: ['Rúrikovich', 'Piast', 'Přemyslida', 'Gediminas', 'Nemanjić', 'Jagellón'] },
  greek: { m: ['Constantino', 'Miguel', 'Alejo', 'Juan', 'Manuel', 'Andrónico', 'Isaac', 'Nicéforo', 'Romano'], f: ['Zoe', 'Teodora', 'Irene', 'Ana', 'Eudoxia', 'María', 'Eufrosine'], d: ['Ducas', 'Comneno', 'Ángelo', 'Paleólogo', 'Láscaris', 'Focas', 'Diógenes'] },
  arabic: { m: ['Yusuf', 'Ali', 'Ahmad', 'Muhammad', 'Abd Allah', 'Hasan', 'Umar', 'Saladino', 'Nur al-Din', 'Tugrul'], f: ['Fátima', 'Aisha', 'Zubayda', 'Jadiya', 'Maryam', 'Zaynab'], d: ['Ayubí', 'Fatimí', 'Abasí', 'Selyúcida', 'Almorávide', 'Almohade', 'Zirí', 'Hafsí', 'Nasrí'] },
  magyar: { m: ['Andrés', 'Bela', 'Ladislao', 'Colomán', 'Géza', 'Esteban', 'Salomón'], f: ['Anastasia', 'Sofía', 'Judit', 'Elena', 'Adelaida'], d: ['Árpád', 'Hunyadi', 'Báthory'] },
  turkic: { m: ['Alp Arslan', 'Malik Shah', 'Kilij Arslan', 'Osman', 'Orhan', 'Murad', 'Bayaceto', 'Mehmed'], f: ['Safiya', 'Gulbahar', 'Mahidevran', 'Hafsa'], d: ['Selyúcida', 'Osmanlí', 'Karamanoğlu', 'Danishmendí'] },
  fantasy: { m: ['Aldric', 'Bertrand', 'Corvin', 'Dorian', 'Edric', 'Florian', 'Gareth', 'Hadrien', 'Ivo', 'Lucan', 'Osric', 'Tobias', 'Varian'], f: ['Ysolde', 'Maelis', 'Rowena', 'Selene', 'Aveline', 'Briony', 'Cerys', 'Liora', 'Talia', 'Wren'], d: ['Valcrest', 'Ashmoor', 'Duskhaven', 'Thornwall', 'Greyspire', 'Embermoor', 'Stormvale', 'Ironmere'] },
};

export function namePool(culture: string) {
  return NAMES[culture] ?? NAMES.latin;
}

export const TRAITS = ['valiente', 'cobarde', 'justo', 'codicioso', 'cruel', 'amable', 'genio', 'torpe', 'piadoso', 'cínico', 'ambicioso', 'perezoso', 'enfermizo', 'fuerte', 'seductor', 'bello', 'casto', 'lujurioso', 'celoso'];
export const TRAIT_EFFECTS: Record<string, Partial<Record<'diplomacy' | 'martial' | 'stewardship' | 'intrigue', number>>> = {
  valiente: { martial: 2 }, cobarde: { martial: -2 }, justo: { stewardship: 1, diplomacy: 1 }, codicioso: { stewardship: 2, diplomacy: -1 },
  cruel: { intrigue: 2, diplomacy: -2 }, amable: { diplomacy: 2, intrigue: -1 }, genio: { diplomacy: 3, martial: 3, stewardship: 3, intrigue: 3 },
  torpe: { diplomacy: -3, martial: -3, stewardship: -3, intrigue: -3 }, piadoso: { diplomacy: 1 }, cínico: { intrigue: 2 },
  ambicioso: { martial: 1, intrigue: 1 }, perezoso: { stewardship: -2 }, enfermizo: {}, fuerte: { martial: 1 },
  seductor: { intrigue: 1, diplomacy: 1 }, bello: { diplomacy: 1 }, casto: {}, lujurioso: {}, celoso: { intrigue: 1 },
};
export function stat(c: Character | undefined | null, k: 'diplomacy' | 'martial' | 'stewardship' | 'intrigue'): number {
  if (!c) return 3;
  return Math.max(0, c[k] + c.traits.reduce((t, tr) => t + (TRAIT_EFFECTS[tr]?.[k] ?? 0), 0));
}

export function isoOf(s: GameState, yearsAgo: number) {
  const { y, m, d } = dateOf(s.day);
  return `${String(y - Math.floor(yearsAgo)).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(Math.min(d, 28)).padStart(2, '0')}`;
}

export function randomCharacter(s: GameState, tag: string, opts: { female?: boolean; dynasty?: string; ageYears?: number; culture?: string } = {}): Character {
  const pool = namePool(opts.culture ?? s.nations[tag]?.culture ?? 'latin');
  const female = opts.female ?? false;
  const c = addCharacter(s, {
    name: pick(s, female ? pool.f : pool.m), dynasty: opts.dynasty ?? pick(s, pool.d), born: isoOf(s, opts.ageYears ?? randInt(s, 18, 45)), female,
    dip: randInt(s, 2, 9), mar: randInt(s, 2, 9), ste: randInt(s, 2, 9), int: randInt(s, 2, 9),
    traits: chance(s, 0.6) ? [pick(s, TRAITS)] : [],
  }, tag);
  return c;
}

/** Give every nation without a ruler a generated ruling family. */
export function ensureRulers(s: GameState, withFamily: boolean) {
  for (const n of Object.values(s.nations)) {
    if (n.x.pseudo || n.rulerId) continue;
    const pool = namePool(n.culture);
    const used = new Set(Object.values(s.characters).map((c) => c.dynasty));
    const free = pool.d.filter((d) => !used.has(d));
    const dyn = free.length ? pick(s, free) : `${pick(s, pool.d)} de ${s.provinces[n.capital]?.name ?? n.name}`;
    const ruler = randomCharacter(s, n.tag, { dynasty: dyn, ageYears: randInt(s, 22, 55) });
    n.rulerId = ruler.id;
    if (withFamily) {
      const spouse = randomCharacter(s, n.tag, { female: true, ageYears: Math.max(16, age(s, ruler) - randInt(s, 0, 10)) });
      spouse.spouse = ruler.id; ruler.spouse = spouse.id;
      const kids = randInt(s, 0, 3);
      for (let i = 0; i < kids && age(s, spouse) > 18; i++) {
        const k = randomCharacter(s, n.tag, { dynasty: dyn, female: chance(s, 0.45), ageYears: randInt(s, 0, Math.min(25, age(s, spouse) - 16)) });
        k.father = ruler.id; k.mother = spouse.id;
      }
    }
  }
}

export function mortality(s: GameState, c: Character): number {
  const a = age(s, c);
  let p = a < 5 ? 0.004 : a < 40 ? 0.0012 : a < 55 ? 0.003 : a < 65 ? 0.008 : a < 75 ? 0.018 : 0.04;
  if (c.traits.includes('enfermizo')) p *= 3;
  if (c.traits.includes('fuerte')) p *= 0.6;
  return p;
}

export function monthlyCharacters(s: GameState, births: boolean) {
  for (const c of Object.values(s.characters)) {
    if (!c.alive) continue;
    if (chance(s, mortality(s, c))) { killCharacter(s, c.id, 'causas naturales'); continue; }
    if (births && c.female && c.spouse && age(s, c) >= 16 && age(s, c) <= 44 && chance(s, 0.028 * (c.inLove || s.characters[c.spouse]?.inLove ? 1.6 : 1))) {
      const father = s.characters[c.spouse];
      if (!father?.alive) continue;
      const child = randomCharacter(s, father.tag, { dynasty: father.dynasty, female: chance(s, 0.48), ageYears: 0, culture: s.nations[father.tag]?.culture });
      child.father = father.id; child.mother = c.id;
      for (const k of ['diplomacy', 'martial', 'stewardship', 'intrigue'] as const) child[k] = Math.round((father[k] + c[k]) / 2 + (rand(s) * 6 - 3));
      birthClaims(s, child);
      const n = s.nations[father.tag];
      if (n && (n.rulerId === father.id || n.heirId === father.id)) log(s, `Nace ${child.name} de ${child.dynasty}, hij${child.female ? 'a' : 'o'} de ${father.name}.`, [n.tag], 'character');
    }
  }
}

export function childrenOf(s: GameState, id: string) {
  return Object.values(s.characters).filter((c) => (c.father === id || c.mother === id)).sort((a, b) => a.born - b.born);
}

// ---------------- production queue for gold-based eras
export function queueUnit(s: GameState, tag: string, province: string, type: string) {
  const r = rules(s);
  const t = r.unitTypes[type];
  const n = s.nations[tag];
  n.treasury -= t.cost;
  n.manpower -= t.manpower;
  n.queue.push({ id: `q${s.nextId++}`, kind: 'unit', label: `${t.name} en ${s.provinces[province].name}`, progress: 0, cost: t.buildDays, data: { province, type } });
}
export function queueBuilding(s: GameState, tag: string, province: string, building: string, label: string, days: number) {
  s.nations[tag].queue.push({ id: `q${s.nextId++}`, kind: 'building', label: `${label} en ${s.provinces[province].name}`, progress: 0, cost: days, data: { province, building } });
}
export function processGoldQueues(s: GameState) {
  for (const n of Object.values(s.nations)) {
    if (!n.alive || !n.queue.length) continue;
    for (const q of n.queue) q.progress++;
    const done = n.queue.filter((q) => q.progress >= q.cost);
    n.queue = n.queue.filter((q) => q.progress < q.cost);
    for (const q of done) {
      const pid = q.data?.province as string;
      const p = s.provinces[pid];
      if (!p || p.owner !== n.tag) continue;
      if (q.kind === 'unit') spawnArmy(s, n.tag, pid, { [q.data!.type as string]: 1 });
      if (q.kind === 'building') {
        const b = q.data!.building as string;
        p.buildings[b] = (p.buildings[b] ?? 0) + 1;
        if (b === 'castle' || b === 'fortress') p.fort++;
      }
    }
  }
}

export function upkeep(s: GameState, tag: string): number {
  const r = rules(s);
  return armiesOf(s, tag).reduce((t, a) => t + a.units.reduce((u, x) => u + (r.unitTypes[x.type]?.upkeep ?? 0), 0), 0);
}

export const ownedArg = (label = 'Provincia') => ({ key: 'province', label, kind: 'province' as const });

export function recruitAction(group: string, filter?: (s: GameState, p: Province) => boolean): ActionDef {
  return {
    id: 'recruit', label: 'Reclutar unidad', group, scope: 'province',
    description: 'Recluta una unidad en una provincia propia y controlada. Tarda unos días en formarse.',
    args: [ownedArg(), { key: 'type', label: 'Tipo', kind: 'unit' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const p = s.provinces[a.province as string];
      const t = rules(s).unitTypes[a.type as string];
      if (!p || p.owner !== tag || p.controller !== tag) return 'La provincia debe ser tuya y estar bajo tu control';
      if (filter && !filter(s, p)) return 'No se puede reclutar aquí';
      if (!t) return 'Elige un tipo de unidad';
      const n = s.nations[tag];
      if (n.treasury < t.cost) return `Oro insuficiente (${t.cost})`;
      if (n.manpower < t.manpower) return 'Mano de obra insuficiente';
      return true;
    },
    cost: (s, _tag, a) => { const t = a && rules(s).unitTypes[a.type as string]; return t ? `${t.cost} oro · ${t.manpower.toLocaleString('es')} hombres` : ''; },
    run: (s, tag, a) => queueUnit(s, tag, a.province as string, a.type as string),
  };
}

export function totalDev(s: GameState, tag: string) { return provincesOf(s, tag).reduce((t, p) => t + p.dev, 0); }
export const isNationActive = (n: Nation) => n.alive && !n.x.pseudo;
