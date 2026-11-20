import { addRelation, age, atWar, declareWar, isHostile, livingNations, log, makeAlliance, provincesOf, relation } from '@/engine/core';
import type { ActionDef } from '@/engine/ruleset';
import type { Character, GameState, Nation } from '@/engine/types';
import { chance, clamp, rand } from '@/engine/util';
import { randomCharacter, stat } from './common';
import { weddingNight } from './romance';

/**
 * Dynastic layer shared by the medieval and early-modern rulesets:
 * marriages between real courts, blood claims, succession by claimants, house renown and wars to crown a pretender.
 */

const CHRISTIAN = ['catholic', 'orthodox', 'protestant', 'reformed', 'anglican'];
const ISLAM = ['sunni', 'shia'];

export const rulerOf = (s: GameState, n: Nation | undefined) => (n?.rulerId ? s.characters[n.rulerId] : null);
export const childrenOf = (s: GameState, id: string) => Object.values(s.characters).filter((c) => c.father === id || c.mother === id).sort((a, b) => a.born - b.born);

/** realms currently ruled by a member of this dynasty */
export function realmsOfDynasty(s: GameState, dynasty: string): Nation[] {
  return livingNations(s).filter((n) => rulerOf(s, n)?.dynasty === dynasty);
}
/** the realm whose court this character belongs to by birth: the realm ruled by their house, else where they live */
export function homeRealm(s: GameState, c: Character): Nation | undefined {
  return realmsOfDynasty(s, c.dynasty).sort((a, b) => provincesOf(s, b.tag).length - provincesOf(s, a.tag).length)[0] ?? s.nations[c.tag];
}

function faithOk(a: string, b: string) {
  if (a === b) return true;
  if (CHRISTIAN.includes(a) && CHRISTIAN.includes(b)) return true;
  if (ISLAM.includes(a) && ISLAM.includes(b)) return true;
  return false;
}

/** rank of a realm (0 count … 3 empire) from its size */
export function realmRank(s: GameState, n: Nation | undefined) {
  if (!n) return 0;
  const p = provincesOf(s, n.tag).length + (n.liege ? 0 : 2);
  return p >= 14 ? 3 : p >= 7 ? 2 : p >= 3 ? 1 : 0;
}
export const RANK_NAME = ['Señorío', 'Ducado', 'Reino', 'Imperio'];

/** parents, children, siblings and half-siblings */
export function closeKin(a: Character, b: Character) {
  return a.id === b.father || a.id === b.mother || b.id === a.father || b.id === a.mother
    || (!!a.father && a.father === b.father) || (!!a.mother && a.mother === b.mother);
}

export function canMarry(s: GameState, a: Character, b: Character): true | string {
  if (!a.alive || !b.alive) return 'Ha fallecido';
  if (a.spouse && s.characters[a.spouse]?.alive) return `${a.name} ya está casad${a.female ? 'a' : 'o'}`;
  if (b.spouse && s.characters[b.spouse]?.alive) return `${b.name} ya está casad${b.female ? 'a' : 'o'}`;
  if (a.female === b.female) return 'Deben ser de distinto sexo';
  if (age(s, a) < 15 || age(s, b) < 15) return 'Demasiado joven';
  if (closeKin(a, b)) return 'Parentesco demasiado cercano';
  const fa = s.nations[a.tag]?.religion ?? '', fb = s.nations[b.tag]?.religion ?? '';
  if (!faithOk(fa, fb)) return 'Religiones incompatibles';
  return true;
}

/** eligible spouses from other courts: members of ruling houses, best matches first */
export function marriageCandidates(s: GameState, tag: string, c: Character, limit = 10) {
  const out: { spouse: Character; realm: Nation; score: number; accept: number }[] = [];
  for (const n of livingNations(s)) {
    if (n.tag === tag || n.x.pseudo) continue;
    const r = rulerOf(s, n);
    if (!r) continue;
    for (const k of Object.values(s.characters)) {
      if (k.tag !== n.tag || !k.alive || k.dynasty !== r.dynasty) continue;
      if (canMarry(s, c, k) !== true) continue;
      const gap = Math.abs(age(s, c) - age(s, k));
      if (gap > 18) continue;
      const accept = acceptance(s, tag, c, k);
      const score = realmRank(s, n) * 30 + relation(s, tag, n.tag) / 4 + (k.id === n.rulerId ? 25 : k.id === n.heirId ? 20 : 0) - gap * 1.5 + accept * 20;
      out.push({ spouse: k, realm: n, score, accept });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** probability (0..1) that the other court agrees */
export function acceptance(s: GameState, tag: string, c: Character, k: Character): number {
  const me = s.nations[tag], them = s.nations[k.tag];
  if (!me || !them) return 0;
  if (isHostile(s, tag, k.tag)) return 0;
  let p = 0.45 + relation(s, tag, k.tag) / 250;
  p += (realmRank(s, me) - realmRank(s, them)) * 0.12;
  p += Math.min(0.15, Math.max(-0.15, (me.prestige - them.prestige) / 2000));
  if (c.id === me.rulerId) p += 0.15;
  if (c.id === me.heirId) p += 0.1;
  if (k.id === them.rulerId) p -= 0.1;
  p += (stat(c, 'diplomacy') - 5) * 0.02;
  if (me.allies.includes(k.tag)) p += 0.15;
  return clamp(p, 0, 0.97);
}

/** celebrate the wedding: links, residence, diplomacy, alliance and prestige */
export function wed(s: GameState, c: Character, k: Character, opts: { quiet?: boolean } = {}) {
  c.spouse = k.id; k.spouse = c.id;
  const husband = c.female ? k : c, wife = c.female ? c : k;
  const realmH = s.nations[husband.tag], realmW = s.nations[wife.tag];
  // the bride joins her husband's court, unless she reigns (then he joins hers);
  // two monarchs or heirs keep their own courts
  const key = (c: Character) => { const r = s.nations[c.tag]; return !!r && (r.rulerId === c.id || r.heirId === c.id); };
  if (!(key(husband) && key(wife))) {
    if (realmW && realmW.rulerId === wife.id) husband.tag = wife.tag; else wife.tag = husband.tag;
  }
  if (!realmH || !realmW || realmH.tag === realmW.tag) return;
  addRelation(s, realmH.tag, realmW.tag, 45);
  realmH.flags[`rm_${realmW.tag}`] = s.day;
  realmW.flags[`rm_${realmH.tag}`] = s.day;
  realmH.prestige += 10 + realmRank(s, realmW) * 10;
  realmW.prestige += 10 + realmRank(s, realmH) * 10;
  const royal = [realmH.rulerId, realmH.heirId].includes(husband.id) || [realmW.rulerId, realmW.heirId].includes(wife.id);
  if (royal && !realmH.liege && !realmW.liege && relation(s, realmH.tag, realmW.tag) >= 45 && !realmH.allies.includes(realmW.tag) && !isHostile(s, realmH.tag, realmW.tag)) {
    makeAlliance(s, realmH.tag, realmW.tag, true);
    if (!opts.quiet) log(s, `Alianza matrimonial entre ${realmH.name} y ${realmW.name}.`, [realmH.tag, realmW.tag], 'diplo');
  }
  if (!opts.quiet) log(s, `Boda real: ${husband.name} de ${husband.dynasty} (${realmH.name}) con ${wife.name} de ${wife.dynasty} (${realmW.name}).`, [realmH.tag, realmW.tag], 'character');
}

/** a newborn inherits the parents' claims and a claim on the realm ruled by the mother's house */
export function birthClaims(s: GameState, child: Character) {
  const set = new Set<string>();
  for (const pid of [child.father, child.mother]) {
    const p = pid ? s.characters[pid] : null;
    for (const t of p?.claims ?? []) set.add(t);
  }
  const mother = child.mother ? s.characters[child.mother] : null;
  if (mother && mother.dynasty !== child.dynasty) for (const n of realmsOfDynasty(s, mother.dynasty)) if (!n.liege) set.add(n.tag);
  set.delete(child.tag);
  for (const n of realmsOfDynasty(s, child.dynasty)) set.delete(n.tag);
  if (set.size) child.claims = [...set];
}

/** best living claimant to a realm whose own line has failed */
export function claimantFor(s: GameState, tag: string): Character | null {
  const list = Object.values(s.characters).filter((c) => c.alive && c.claims?.includes(tag) && age(s, c) >= 0);
  if (!list.length) return null;
  const weight = (c: Character) => {
    const n = s.nations[c.tag];
    return (n?.rulerId === c.id ? 1000 : 0) + (n?.heirId === c.id ? 500 : 0) + (c.female ? 0 : 100) - c.born / 3650;
  };
  return list.sort((a, b) => weight(b) - weight(a))[0];
}

/**
 * Called when a realm has no heir of its own. Returns true if a claimant took the throne.
 * A claimant who already reigns elsewhere forms a personal union (the realm becomes their vassal).
 */
export function inheritByClaim(s: GameState, n: Nation): boolean {
  const c = claimantFor(s, n.tag);
  if (!c) return false;
  const home = s.nations[c.tag];
  if (home && home.rulerId === c.id && home.tag !== n.tag && !home.liege) {
    n.liege = home.tag;
    const regent = randomCharacter(s, n.tag, { dynasty: c.dynasty, ageYears: 30 });
    n.rulerId = regent.id; n.heirId = null;
    addRelation(s, n.tag, home.tag, 60);
    log(s, `${c.name} de ${c.dynasty}, soberano de ${home.name}, hereda la corona de ${n.name}: unión personal.`, [n.tag, home.tag], 'character');
    return true;
  }
  if (home && (home.heirId === c.id) && home.tag !== n.tag) {
    // the heir of another realm would rather wait: a younger sibling or child takes this throne if possible
    const alt = childrenOf(s, c.id).find((k) => k.alive && age(s, k) >= 0) ?? null;
    if (alt) { alt.tag = n.tag; n.rulerId = alt.id; n.heirId = null; log(s, `${alt.name} de ${alt.dynasty}, por derecho de sangre, se sienta en el trono de ${n.name}.`, [n.tag], 'character'); return true; }
  }
  c.tag = n.tag;
  const sp = c.spouse ? s.characters[c.spouse] : null;
  if (sp?.alive) sp.tag = n.tag;
  for (const k of childrenOf(s, c.id)) if (k.alive && age(s, k) < 16) k.tag = n.tag;
  n.rulerId = c.id; n.heirId = null;
  log(s, `${c.name} de ${c.dynasty} reclama y obtiene la corona de ${n.name} por derecho de sangre.`, [n.tag], 'character');
  return true;
}

/** a new house took a throne: every claimant's realm gains a casus belli on its capital */
export function grievance(s: GameState, n: Nation) {
  const seen = new Set<string>();
  for (const c of Object.values(s.characters)) {
    if (!c.alive || !c.claims?.includes(n.tag)) continue;
    const realm = s.nations[c.tag];
    if (!realm?.alive || realm.tag === n.tag || seen.has(realm.tag)) continue;
    seen.add(realm.tag);
    if (!realm.claims.includes(n.capital)) realm.claims.push(n.capital);
    log(s, `${c.name} (${realm.name}) no reconoce al nuevo rey de ${n.name}: hay un pretendiente.`, [realm.tag, n.tag], 'diplo');
  }
}

/** primogeniture-style heir: sons, grandsons through sons, daughters, siblings, then the eldest of the house */
export function genericHeir(s: GameState, n: Nation, law = 0): string | null {
  const r = rulerOf(s, n);
  if (!r) return null;
  const alive = (c?: Character | null) => !!c && c.alive;
  const house = Object.values(s.characters).filter((c) => c.alive && c.dynasty === r.dynasty && c.id !== r.id);
  if (law === 2) {
    const males = house.filter((c) => !c.female && c.tag === n.tag).sort((a, b) => a.born - b.born);
    return males[0]?.id ?? house.sort((a, b) => a.born - b.born)[0]?.id ?? null;
  }
  const kids = childrenOf(s, r.id).filter((c) => alive(c) && !c.bastard);
  const son = kids.find((k) => !k.female);
  if (son) return son.id;
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
  return house.filter((c) => c.tag === n.tag).sort((a, b) => a.born - b.born)[0]?.id ?? house.sort((a, b) => a.born - b.born)[0]?.id ?? null;
}

/** house renown grows with the realms its members rule */
export function monthlyRenown(s: GameState) {
  const d = (s.dynasties ??= {});
  for (const n of livingNations(s)) {
    const r = rulerOf(s, n);
    if (!r) continue;
    const e = (d[r.dynasty] ??= { renown: 0, founded: s.day });
    e.renown += 0.2 + provincesOf(s, n.tag).length * (n.liege ? 0.02 : 0.06);
  }
}

/** AI houses marry their children into other courts; falls back to minor nobility */
export function aiMarriages(s: GameState, rate = 0.05) {
  for (const c of Object.values(s.characters)) {
    if (!c.alive || age(s, c) < 16 || age(s, c) > 45 || c.tag === s.player) continue;
    if (c.spouse && s.characters[c.spouse]?.alive) continue;
    const n = s.nations[c.tag];
    if (!n?.alive || rulerOf(s, n)?.dynasty !== c.dynasty || !chance(s, rate)) continue;
    const important = c.id === n.rulerId || c.id === n.heirId || c.father === n.rulerId || c.mother === n.rulerId;
    if (important && chance(s, 0.75)) {
      const opts = marriageCandidates(s, n.tag, c, 6).filter((o) => o.spouse.tag !== s.player);
      const pick = opts.find((o) => rand(s) < o.accept);
      if (pick) { wed(s, c, pick.spouse); continue; }
    }
    const sp = randomCharacter(s, c.tag, { female: !c.female, ageYears: Math.max(16, age(s, c) - Math.round(rand(s) * 8) + 2) });
    wed(s, c, sp, { quiet: true });
  }
}

/** AI realms with a pretender in the family may go to war for the crown */
export function aiPressClaims(s: GameState, n: Nation) {
  if (n.liege || atWar(s, n.tag) || !chance(s, 0.03)) return;
  const fam = Object.values(s.characters).filter((c) => c.alive && c.tag === n.tag && c.claims?.length);
  for (const c of fam) for (const t of c.claims!) {
    const o = s.nations[t];
    if (!o?.alive || o.liege === n.tag || n.allies.includes(t) || n.truces[t]) continue;
    if (provincesOf(s, o.tag).length > provincesOf(s, n.tag).length * 1.3) continue;
    n.flags[`pretender_${t}`] = s.day;
    if (!n.claims.includes(o.capital)) n.claims.push(o.capital);
    declareWar(s, n.tag, t, o.capital, `Guerra de sucesión de ${o.name}`);
    return;
  }
}

/** peace term: crown the pretender. If the pretender reigns already, personal union; else they take the loser's throne. */
export function crownPretender(s: GameState, winner: string, loser: string): boolean {
  const w = s.nations[winner], l = s.nations[loser];
  if (!w || !l) return false;
  const c = Object.values(s.characters).filter((k) => k.alive && k.claims?.includes(loser) && k.tag === winner).sort((a, b) => (b.id === w.rulerId ? 1 : 0) - (a.id === w.rulerId ? 1 : 0) || a.born - b.born)[0];
  if (!c) return false;
  if (c.id === w.rulerId) {
    l.liege = winner;
    log(s, `${c.name} es coronado en ${l.name}: unión personal con ${w.name}.`, [winner, loser], 'character');
  } else {
    c.tag = loser; l.rulerId = c.id; l.heirId = null;
    addRelation(s, loser, winner, 120);
    log(s, `El pretendiente ${c.name} de ${c.dynasty} es coronado en ${l.name}.`, [winner, loser], 'character');
  }
  c.claims = c.claims!.filter((t) => t !== loser);
  return true;
}

/** shared actions: royal marriage with a chosen spouse, and pressing a family claim */
export const dynastyActions: ActionDef[] = [
  {
    id: 'royal_marriage', label: 'Proponer matrimonio', group: 'Corte', hidden: true,
    description: 'Propón un enlace entre un miembro de tu casa y un miembro de otra casa reinante.',
    args: [{ key: 'character', label: 'Familiar', kind: 'character' }, { key: 'spouse', label: 'Cónyuge', kind: 'character' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const c = s.characters[a.character as string], k = s.characters[a.spouse as string];
      if (!c || !k) return 'Elige a los contrayentes';
      if (c.tag !== tag) return 'No pertenece a tu corte';
      const ok = canMarry(s, c, k);
      if (ok !== true) return ok;
      if (s.nations[tag].treasury < 10) return 'No hay dinero para la dote (10)';
      return true;
    },
    cost: () => '10 de dote',
    run: (s, tag, a) => {
      const c = s.characters[a.character as string], k = s.characters[a.spouse as string];
      const n = s.nations[tag];
      n.treasury -= 10;
      const p = acceptance(s, tag, c, k);
      if (rand(s) < p) {
        wed(s, c, k);
        weddingNight(s, c, k);
        log(s, `La casa de ${k.dynasty} acepta: ${c.name} y ${k.name} se casarán.`, [tag], 'story');
      } else {
        addRelation(s, tag, k.tag, -10);
        n.prestige -= 5;
        log(s, `La corte de ${s.nations[k.tag]?.name} rechaza la propuesta de matrimonio para ${c.name}.`, [tag, k.tag], 'diplo');
      }
    },
  },
  {
    id: 'press_claim', label: 'Reclamar un trono', group: 'Corte', hidden: true,
    description: 'Un miembro de tu casa tiene derechos sobre otro reino: declara la guerra para coronarlo.',
    args: [{ key: 'target', label: 'Reino', kind: 'nation' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const t = a.target as string;
      const o = s.nations[t];
      if (!o?.alive) return 'Ese reino no existe';
      if (s.nations[tag].liege) return 'Un vasallo no puede declarar guerras';
      if (s.nations[tag].truces[t]) return 'Hay una tregua en vigor';
      const has = Object.values(s.characters).some((c) => c.alive && c.tag === tag && c.claims?.includes(t));
      return has ? true : 'Nadie de tu casa tiene derechos sobre ese reino';
    },
    run: (s, tag, a) => {
      const o = s.nations[a.target as string];
      const n = s.nations[tag];
      n.flags[`pretender_${o.tag}`] = s.day;
      if (!n.claims.includes(o.capital)) n.claims.push(o.capital);
      declareWar(s, tag, o.tag, o.capital, `Guerra de sucesión de ${o.name}`);
    },
  },
];
