import { MAPS } from '@/data/maps';
import { findPath, neighbours, edgeBetween, terrainCost, terrainDefence } from './map';
import type { Ruleset } from './ruleset';
import type {
  Army, Character, Command, Condition, Effect, Era, GameEvent, GameState, LogEntry, Mission, Nation, PeaceOffer, Province, Unit, War,
} from './types';
import { genericMissions } from './missions';
import { chance, clamp, dateOf, dayFromISO, formatDate, rand, uid, yearsBetween } from './util';

// ------------------------------------------------------------------ registry
const RULESETS: Partial<Record<Era, Ruleset>> = {};
export function registerRuleset(r: Ruleset) { RULESETS[r.era] = r; }
export function rules(s: GameState | Era): Ruleset {
  const era = typeof s === 'string' ? s : s.era;
  const r = RULESETS[era];
  if (!r) throw new Error(`Ruleset ${era} not registered`);
  return r;
}

// ------------------------------------------------------------------ scenario
export interface CharDef {
  name: string; dynasty: string; born: string; female?: boolean;
  dip?: number; mar?: number; ste?: number; int?: number; traits?: string[];
  role?: 'ruler' | 'heir' | 'spouse' | 'child' | 'leader' | 'sibling' | 'parent' | 'relative';
  /** explicit family links, by the exact `name` of another character of the same nation */
  father?: string; mother?: string; spouseOf?: string;
  /** ISO date of death for historical relatives already dead at the start (kept for the family tree) */
  died?: string;
  /** realms (tags) this person has a hereditary claim on */
  claims?: string[];
  /** short historical note shown in the character card */
  bio?: string;
}
export interface NationDef {
  tag: string; name: string; color: string; capital: string; provinces: string[];
  religion: string; culture: string; government: string;
  treasury?: number; manpower?: number; stability?: number; prestige?: number;
  x?: Record<string, number>; tech?: Record<string, number>;
  allies?: string[]; liege?: string; faction?: string; claims?: string[];
  characters?: CharDef[];
  armies?: { province: string; units: Record<string, number>; name?: string; leader?: string }[];
  playable?: boolean;
  description?: string;
}
export interface Scenario {
  id: string; era: Era; map?: string; name: string; description: string; start: string; end: string;
  nations: NationDef[];
  provinceOverrides?: Record<string, Partial<{ religion: string; culture: string; fort: number; dev: number; x: Record<string, number> }>>;
  wars?: { name: string; attackers: string[]; defenders: string[]; goal?: string }[];
  relations?: [string, string, number][];
  factions?: Record<string, { name: string; leader: string; color: string }>;
  events?: GameEvent[];
  missions?: Mission[];
  recommended?: string[];
  /** menu group (defaults to the era): lets 1914 or 2014 use the industrial-war rules */
  menu?: string;
  options?: GameState['options'];
}

/** a player-designed founder of a new dynasty */
export interface FounderDef {
  name: string; dynasty: string; female: boolean; age: number;
  dip: number; mar: number; ste: number; int: number; traits: string[];
  portrait?: string; bio?: string; spouse?: boolean; children?: number;
}

export function createGame(sc: Scenario, player: string, seed = 12345, founder?: FounderDef): GameState {
  const r = rules(sc.era);
  const s: GameState = {
    version: 1, era: sc.era, mapId: sc.map ?? 'earth', scenarioId: sc.id, scenarioName: sc.name,
    day: dayFromISO(sc.start), startDay: dayFromISO(sc.start), endDay: dayFromISO(sc.end),
    rng: seed, nextId: 1, player, provinces: {}, nations: {}, armies: {}, characters: {},
    wars: [], events: [...(sc.events ?? [])], firedEvents: [], pendingEvents: [], log: [], peaceOffers: [],
    factions: sc.factions ?? {}, gameOver: null,
    scheduled: [], missions: [...(sc.missions ?? [])], missionsDone: {}, record: {}, options: sc.options ? { ...sc.options } : undefined,
  };
  for (const [id, name, lon, lat, terrain, landmass, coastal, dev] of MAPS[sc.map ?? 'earth'].rows) {
    s.provinces[id] = {
      id, name, lon, lat, terrain, landmass, coastal: !!coastal, dev, owner: null, controller: null, cores: [],
      culture: 'native', religion: 'pagan', fort: 0, manpower: Math.max(1, Math.round(dev / 2)),
      buildings: {}, unrest: 0, siege: null, x: {},
    };
  }
  s.nations.REB = blankNation('REB', 'Rebeldes', '#222222', '');
  s.nations.REB.x.pseudo = 1;
  for (const nd of sc.nations) {
    const n = blankNation(nd.tag, nd.name, nd.color, nd.capital);
    Object.assign(n, {
      religion: nd.religion, culture: nd.culture, government: nd.government,
      treasury: nd.treasury ?? 100, manpower: nd.manpower ?? 0, stability: nd.stability ?? 0, prestige: nd.prestige ?? 0,
      liege: nd.liege ?? null, faction: nd.faction ?? null, claims: [...(nd.claims ?? [])],
    });
    n.x = { ...(nd.x ?? {}) };
    n.tech = { ...(nd.tech ?? {}) };
    s.nations[nd.tag] = n;
    for (const pid of nd.provinces) {
      const p = s.provinces[pid];
      if (!p) throw new Error(`Unknown province ${pid} in ${sc.id}/${nd.tag}`);
      p.owner = p.controller = nd.tag;
      touchOwners(s);
      p.cores = [nd.tag];
      p.culture = nd.culture;
      p.religion = nd.religion;
    }
    if (!s.provinces[nd.capital]) throw new Error(`Bad capital ${nd.capital}`);
    s.provinces[nd.capital].fort = Math.max(s.provinces[nd.capital].fort, 2);
  }
  for (const [pid, o] of Object.entries(sc.provinceOverrides ?? {})) {
    const p = s.provinces[pid];
    if (!p) throw new Error(`Unknown override ${pid}`);
    if (o.religion) p.religion = o.religion;
    if (o.culture) p.culture = o.culture;
    if (o.fort !== undefined) p.fort = o.fort;
    if (o.dev !== undefined) p.dev = o.dev;
    if (o.x) Object.assign(p.x, o.x);
  }
  for (const nd of sc.nations) {
    const n = s.nations[nd.tag];
    for (const a of nd.allies ?? []) makeAlliance(s, nd.tag, a, true);
    for (const cd of nd.characters ?? []) {
      const c = addCharacter(s, cd, nd.tag);
      if (cd.role === 'ruler') n.rulerId = c.id;
      if (cd.role === 'heir') n.heirId = c.id;
    }
    const ruler = n.rulerId ? s.characters[n.rulerId] : null;
    if (ruler) {
      for (const cd of nd.characters ?? []) {
        const c = Object.values(s.characters).find((k) => k.tag === nd.tag && k.name === cd.name && k.born === dayFromISO(cd.born))!;
        if (cd.role === 'spouse') { c.spouse = ruler.id; ruler.spouse = c.id; }
        if (cd.role === 'heir' || cd.role === 'child') {
          if (ruler.female) c.mother = ruler.id; else c.father = ruler.id;
          if (ruler.spouse) { if (ruler.female) c.father = ruler.spouse; else c.mother = ruler.spouse; }
        }
      }
    }
    for (const ad of nd.armies ?? []) {
      const army = spawnArmy(s, nd.tag, ad.province, ad.units, ad.name);
      if (ad.leader) {
        const c = Object.values(s.characters).find((k) => k.tag === nd.tag && k.name === ad.leader);
        if (c) army.leaderId = c.id;
      }
    }
  }
  // genealogies: explicit links by name ("Name" in the same realm, or "TAG:Name" across realms); they override the role defaults
  const findChar = (tag: string, ref: string) => {
    const [t2, nm] = ref.includes(':') ? ref.split(':') as [string, string] : [tag, ref];
    return Object.values(s.characters).find((k) => k.tag === t2 && k.name === nm);
  };
  for (const nd of sc.nations) {
    for (const cd of nd.characters ?? []) {
      const c = findChar(nd.tag, cd.name);
      if (!c) continue;
      if (cd.father) { const f = findChar(nd.tag, cd.father); if (f) c.father = f.id; }
      if (cd.mother) { const m = findChar(nd.tag, cd.mother); if (m) c.mother = m.id; }
      if (cd.spouseOf) { const sp = findChar(nd.tag, cd.spouseOf); if (sp) { c.spouse = sp.id; sp.spouse = c.id; } }
      if (cd.died) { c.alive = false; c.died = dayFromISO(cd.died); }
      if (cd.claims?.length) c.claims = [...cd.claims];
      if (cd.bio) c.bio = cd.bio;
    }
    const n = s.nations[nd.tag];
    const ruler = n.rulerId ? s.characters[n.rulerId] : null;
    if (ruler) for (const cd of nd.characters ?? []) if (cd.role === 'sibling') {
      const c = findChar(nd.tag, cd.name);
      if (c && !c.father && ruler.father) c.father = ruler.father;
      if (c && !c.mother && ruler.mother) c.mother = ruler.mother;
    }
    if (n.heirId && !s.characters[n.heirId]?.alive) n.heirId = null;
  }
  for (const [a, b, v] of sc.relations ?? []) setRelation(s, a, b, v);
  r.init(s);
  for (const w of sc.wars ?? []) {
    const war: War = { id: uid(s, 'w'), name: w.name, attackers: [...w.attackers], defenders: [...w.defenders], start: s.day, battleScore: 0, goal: w.goal ?? null };
    s.wars.push(war);
  }
  startingGarrisons(s);
  if (founder && s.nations[player]) foundDynasty(s, player, founder);
  // every realm without a hand-written mission tree gets a generic one built from its neighbourhood
  const withTree = new Set(s.missions!.map((m) => m.tag));
  for (const n of livingNations(s)) if (!withTree.has(n.tag) && !n.liege) s.missions!.push(...genericMissions(s, n.tag));
  log(s, `Comienza la partida: ${sc.name} (${formatDate(s.day)}).`, [], 'info');
  return s;
}

function blankNation(tag: string, name: string, color: string, capital: string): Nation {
  return {
    tag, name, color, capital, alive: true, treasury: 0, manpower: 0, stability: 0, prestige: 0, infamy: 0,
    religion: '', culture: '', government: '', liege: null, allies: [], relations: {}, truces: {}, claims: [],
    rulerId: null, heirId: null, faction: null, tech: {}, flags: {}, x: {}, queue: [], lastIncome: {},
  };
}

export function addCharacter(s: GameState, cd: CharDef, tag: string): Character {
  const c: Character = {
    id: uid(s, 'c'), name: cd.name, dynasty: cd.dynasty, born: dayFromISO(cd.born), female: !!cd.female,
    father: null, mother: null, spouse: null, tag, traits: [...(cd.traits ?? [])],
    diplomacy: cd.dip ?? 5, martial: cd.mar ?? 5, stewardship: cd.ste ?? 5, intrigue: cd.int ?? 5, alive: true,
    isLeader: cd.role === 'leader',
  };
  s.characters[c.id] = c;
  return c;
}

// ------------------------------------------------------------------ helpers
export const nation = (s: GameState, tag: string | null | undefined) => (tag ? s.nations[tag] : undefined);
export const livingNations = (s: GameState) => Object.values(s.nations).filter((n) => n.alive && !n.x.pseudo);
// provinces by owner, rebuilt only when ownership changes (every owner assignment calls touchOwners)
const ownerIndex = new WeakMap<GameState, Map<string, Province[]>>();
export function touchOwners(s: GameState) { ownerIndex.delete(s); }
export const provincesOf = (s: GameState, tag: string): Province[] => {
  let m = ownerIndex.get(s);
  if (!m) {
    m = new Map();
    for (const p of Object.values(s.provinces)) if (p.owner) { const l = m.get(p.owner); if (l) l.push(p); else m.set(p.owner, [p]); }
    ownerIndex.set(s, m);
  }
  return (m.get(tag) ?? []).slice();
};
// armies by owner; an army never changes owner, so the index is valid while no army is created (nextId) or removed (count)
const armyIndex = new WeakMap<GameState, { sig: string; m: Map<string, Army[]> }>();
export const armiesOf = (s: GameState, tag: string): Army[] => {
  const sig = `${s.nextId}:${Object.keys(s.armies).length}`;
  let ix = armyIndex.get(s);
  if (!ix || ix.sig !== sig) {
    const m = new Map<string, Army[]>();
    for (const a of Object.values(s.armies)) { const l = m.get(a.owner); if (l) l.push(a); else m.set(a.owner, [a]); }
    ix = { sig, m };
    armyIndex.set(s, ix);
  }
  return (ix.m.get(tag) ?? []).slice();
};
export const age = (s: GameState, c: Character) => Math.floor(yearsBetween(c.born, s.day));

export function log(s: GameState, text: string, tags: string[], kind: LogEntry['kind']) {
  const entry = { day: s.day, text, tags, kind };
  s.log.push(entry);
  if (s.log.length > 400) s.log.splice(0, s.log.length - 400);
  // the chronicle keeps the player's history for the whole game
  if (tags.includes(s.player) && ['story', 'mission', 'war', 'peace', 'character', 'event', 'info'].includes(kind)) {
    (s.chronicle ??= []).push(entry);
    if (s.chronicle.length > 3000) s.chronicle.splice(0, s.chronicle.length - 3000);
  }
}

export function relation(s: GameState, a: string, b: string) { return s.nations[a]?.relations[b] ?? 0; }
export function setRelation(s: GameState, a: string, b: string, v: number) {
  const na = s.nations[a], nb = s.nations[b];
  if (!na || !nb) return;
  na.relations[b] = nb.relations[a] = clamp(Math.round(v), -200, 200);
}
export function addRelation(s: GameState, a: string, b: string, d: number) { setRelation(s, a, b, relation(s, a, b) + d); }

export function topLiege(s: GameState, tag: string): string {
  let t = tag;
  for (let i = 0; i < 6 && s.nations[t]?.liege; i++) t = s.nations[t].liege!;
  return t;
}
export const vassalsOf = (s: GameState, tag: string) => livingNations(s).filter((n) => n.liege === tag);

export function warsOf(s: GameState, tag: string) { return s.wars.filter((w) => w.attackers.includes(tag) || w.defenders.includes(tag)); }
export function sideOf(w: War, tag: string): 'att' | 'def' | null { return w.attackers.includes(tag) ? 'att' : w.defenders.includes(tag) ? 'def' : null; }
export function atWar(s: GameState, tag: string) { return warsOf(s, tag).length > 0; }
export function isHostile(s: GameState, a: string | null, b: string | null): boolean {
  if (!a || !b || a === b) return false;
  for (const w of s.wars) {
    if ((w.attackers.includes(a) && w.defenders.includes(b)) || (w.defenders.includes(a) && w.attackers.includes(b))) return true;
  }
  return false;
}
export function isFriendly(s: GameState, a: string, b: string | null): boolean {
  if (!b) return false;
  if (a === b) return true;
  if (isHostile(s, a, b)) return false;
  const na = s.nations[a];
  if (!na) return false;
  if (na.allies.includes(b)) return true;
  if (topLiege(s, a) === topLiege(s, b)) return true;
  for (const w of s.wars) {
    const sa = sideOf(w, a), sb = sideOf(w, b);
    if (sa && sa === sb) return true;
  }
  return false;
}
export function armiesHostile(s: GameState, a: Army, b: Army): boolean {
  if (a.owner === 'REB' && b.owner === 'REB') return false;
  if (a.owner === 'REB') return b.owner === a.rebelAgainst;
  if (b.owner === 'REB') return a.owner === b.rebelAgainst;
  return isHostile(s, a.owner, b.owner);
}

export function canEnter(s: GameState, tag: string, pid: string): boolean {
  const p = s.provinces[pid];
  if (!p || !p.owner) return false;
  if (tag === 'REB') return true;
  if (isFriendly(s, tag, p.owner) || isFriendly(s, tag, p.controller)) return true;
  if (isHostile(s, tag, p.owner) || isHostile(s, tag, p.controller)) return true;
  return !!s.nations[tag]?.flags[`access_${p.owner}`];
}

export function armyStrength(s: GameState, a: Army): number {
  const r = rules(s);
  return a.units.reduce((t, u) => t + u.str * ((r.unitTypes[u.type]?.attack ?? 1) + (r.unitTypes[u.type]?.defence ?? 1)), 0);
}
export function militaryPower(s: GameState, tag: string): number {
  return armiesOf(s, tag).reduce((t, a) => t + armyStrength(s, a), 0);
}
export function armyMen(s: GameState, a: Army): number {
  const r = rules(s);
  return Math.round(a.units.reduce((t, u) => t + u.str * (r.unitTypes[u.type]?.size ?? 1000), 0));
}

export function spawnArmy(s: GameState, tag: string, pid: string, units: Record<string, number>, name?: string): Army {
  const list: Unit[] = [];
  for (const [type, n] of Object.entries(units)) for (let i = 0; i < n; i++) list.push({ type, str: 1, org: 1 });
  const existing = Object.values(s.armies).find((a) => a.owner === tag && a.location === pid && !a.path.length && !a.inBattle && tag !== 'REB');
  if (existing && !name) { existing.units.push(...list); return existing; }
  const id = uid(s, 'a');
  const count = armiesOf(s, tag).length + 1;
  const army: Army = { id, owner: tag, name: name ?? `${ordinal(count)} Ejército`, location: pid, path: [], progress: 0, units: list, leaderId: null, inBattle: false, retreating: false };
  s.armies[id] = army;
  return army;
}
function ordinal(n: number) { return `${n}.º`; }

/**
 * Every realm starts with a garrison sized to its territory and situation: more land means more troops,
 * and a power already at war musters half again as many. Scenario-written armies count toward the total,
 * so hand-placed forces are topped up instead of doubled.
 */
function startingGarrisons(s: GameState) {
  const r = rules(s);
  const unit = ['levy', 'infantry', 'militia'].find((u) => r.unitTypes[u]) ?? Object.keys(r.unitTypes)[0];
  if (!unit) return;
  const atWar = new Set<string>();
  for (const w of s.wars) for (const t of [...w.attackers, ...w.defenders]) atWar.add(t);
  for (const n of Object.values(s.nations)) {
    if (n.tag === 'REB' || n.x.pseudo) continue;
    const own = provincesOf(s, n.tag);
    if (!own.length) continue;
    const cap = own.find((p) => p.id === n.capital) ?? own.slice().sort((a, b) => b.dev - a.dev)[0];
    let want = Math.min(16, 2 + own.length * 0.8);
    if (atWar.has(n.tag)) want = Math.min(24, want * 1.5);
    const have = armiesOf(s, n.tag).reduce((t, a) => t + a.units.length, 0);
    const missing = Math.round(want) - have;
    if (missing > 0) spawnArmy(s, n.tag, cap.id, { [unit]: missing }, `Guarnición de ${n.name}`);
  }
}

export function canUseSea(s: GameState, tag: string): boolean {
  const r = rules(s) as Ruleset & { canUseSea?: (s: GameState, tag: string) => boolean };
  return r.canUseSea ? r.canUseSea(s, tag) : true;
}

// ------------------------------------------------------------------ simulation
export function step(s: GameState) {
  if (s.gameOver) return;
  const r = rules(s);
  const before = dateOf(s.day);
  s.day++;
  const now = dateOf(s.day);
  movement(s);
  combat(s);
  sieges(s);
  runScheduled(s);
  r.daily(s);
  if (now.m !== before.m) monthly(s);
  if (now.y !== before.y) r.yearly(s);
  if (s.day >= s.endDay && !s.gameOver) {
    s.gameOver = r.victory?.(s) ?? 'Fin del escenario';
    log(s, `Fin de la partida: ${s.gameOver}`, [], 'info');
  }
}

function movement(s: GameState) {
  const r = rules(s);
  for (const a of Object.values(s.armies)) {
    if (!a.path.length || a.inBattle) continue;
    const next = a.path[0];
    if (!canEnter(s, a.owner, next)) { a.path = []; a.progress = 0; continue; }
    const edge = edgeBetween(s, a.location, next);
    if (!edge) { a.path = []; continue; }
    if (edge.sea && !canUseSea(s, a.owner)) { a.path = []; a.progress = 0; continue; }
    const speed = Math.min(...a.units.map((u) => r.unitTypes[u.type]?.speed ?? 1), 3) * (a.retreating ? 1.5 : 1);
    const need = (edge.cost * terrainCost(s.provinces[next].terrain) * r.moveBaseDays) / Math.max(0.2, speed);
    a.progress++;
    if (a.progress >= need) {
      a.location = next;
      a.path.shift();
      a.progress = 0;
      if (!a.path.length) a.retreating = false;
      if (edge.sea) for (const u of a.units) u.org = Math.max(0, u.org - 0.1);
    }
  }
}

function combat(s: GameState) {
  const byLoc: Record<string, Army[]> = {};
  for (const a of Object.values(s.armies)) (byLoc[a.location] ??= []).push(a);
  for (const a of Object.values(s.armies)) a.inBattle = false;
  for (const [pid, armies] of Object.entries(byLoc)) {
    if (armies.length < 2) continue;
    const first = armies.find((a) => !a.retreating) ?? armies[0];
    const sideB = armies.filter((b) => armiesHostile(s, first, b) && !b.retreating);
    if (!sideB.length || first.retreating) continue;
    const sideA = armies.filter((a) => !a.retreating && !sideB.includes(a) && sideB.some((b) => armiesHostile(s, a, b)));
    battleRound(s, pid, sideA, sideB);
  }
}

function sidePower(s: GameState, side: Army[], attacking: boolean) {
  const r = rules(s);
  let p = 0;
  for (const a of side) {
    const leader = a.leaderId ? s.characters[a.leaderId] : null;
    const lb = 1 + (leader ? leader.martial * 0.04 : 0);
    for (const u of a.units) {
      const t = r.unitTypes[u.type];
      if (!t) continue;
      p += (attacking ? t.attack : t.defence) * u.str * (0.4 + 0.6 * u.org) * lb * r.combatMultiplier(s, a, u, attacking);
    }
  }
  return p;
}

function battleRound(s: GameState, pid: string, A: Army[], B: Army[]) {
  const prov = s.provinces[pid];
  // defender = side friendly to the controller
  const aDef = A.some((a) => a.owner === prov.controller || isFriendly(s, a.owner, prov.controller));
  const powA = sidePower(s, A, !aDef), powB = sidePower(s, B, aDef);
  const terr = terrainDefence(prov.terrain) * (1 + prov.fort * 0.08);
  const dmgToB = powA * 0.025 * (0.75 + rand(s) * 0.5) / (aDef ? 1 : terr);
  const dmgToA = powB * 0.025 * (0.75 + rand(s) * 0.5) / (aDef ? terr : 1);
  applyDamage(A, dmgToA);
  applyDamage(B, dmgToB);
  for (const a of [...A, ...B]) a.inBattle = true;
  const broken = (side: Army[]) => {
    const units = side.flatMap((a) => a.units);
    if (!units.length) return true;
    const org = units.reduce((t, u) => t + u.org, 0) / units.length;
    const str = units.reduce((t, u) => t + u.str, 0) / units.length;
    return org < 0.18 || str < 0.12;
  };
  const aBroke = broken(A), bBroke = broken(B);
  if (!aBroke && !bBroke) return;
  const [win, lose] = aBroke && !bBroke ? [B, A] : !aBroke && bBroke ? [A, B] : powA >= powB ? [A, B] : [B, A];
  const winTag = win[0].owner, loseTag = lose[0].owner;
  const lostMen = lose.reduce((t, a) => t + armyMen(s, a), 0);
  for (const w of s.wars) {
    const sw = sideOf(w, winTag === 'REB' ? '' : winTag), sl = sideOf(w, loseTag === 'REB' ? '' : loseTag);
    if (sw && sl && sw !== sl) w.battleScore = clamp(w.battleScore + (sw === 'att' ? 1 : -1) * clamp(2 + lose.reduce((t, a) => t + a.units.length, 0) / 3, 2, 12), -40, 40);
  }
  bumpRecord(s, winTag, 'battlesWon'); bumpRecord(s, loseTag, 'battlesLost');
  log(s, `Batalla de ${prov.name}: ${nationName(s, winTag)} derrota a ${nationName(s, loseTag)} (${lostMen.toLocaleString('es')} supervivientes en retirada).`, [winTag, loseTag], 'battle');
  for (const a of lose) {
    a.inBattle = false;
    if (a.leaderId && chance(s, 0.08)) killCharacter(s, a.leaderId, 'en batalla');
    retreat(s, a);
  }
  for (const a of win) a.inBattle = false;
  cleanupArmies(s);
}
const nationName = (s: GameState, tag: string) => s.nations[tag]?.name ?? tag;

function applyDamage(side: Army[], dmg: number) {
  const units = side.flatMap((a) => a.units);
  if (!units.length) return;
  const per = dmg / units.length;
  for (const u of units) {
    u.str = Math.max(0, u.str - per * 0.35);
    u.org = Math.max(0, u.org - per * 1.1);
  }
}

function retreat(s: GameState, a: Army) {
  const options = neighbours(s, a.location)
    .filter((e) => !e.sea && canEnter(s, a.owner, e.to))
    .filter((e) => !Object.values(s.armies).some((b) => b.location === e.to && armiesHostile(s, a, b)))
    .map((e) => e.to);
  const own = options.find((pid) => isFriendly(s, a.owner, s.provinces[pid].controller)) ?? options[0];
  if (!own || a.owner === 'REB') { delete s.armies[a.id]; return; }
  a.path = [own];
  a.progress = 0;
  a.retreating = true;
}

export function cleanupArmies(s: GameState) {
  for (const a of Object.values(s.armies)) {
    a.units = a.units.filter((u) => u.str > 0.04);
    if (!a.units.length) delete s.armies[a.id];
  }
}

function sieges(s: GameState) {
  const r = rules(s);
  const besiegers: Record<string, Army[]> = {};
  for (const a of Object.values(s.armies)) {
    if (a.path.length || a.inBattle || a.retreating) continue;
    const p = s.provinces[a.location];
    const target = p.controller;
    const liberating = target !== a.owner && isHostile(s, a.owner, target) || (a.owner === 'REB' && target === a.rebelAgainst);
    if (liberating) (besiegers[p.id] ??= []).push(a);
  }
  for (const p of Object.values(s.provinces)) {
    const bs = besiegers[p.id];
    if (!bs) { p.siege = null; continue; }
    const defenders = Object.values(s.armies).some((d) => d.location === p.id && bs.some((b) => armiesHostile(s, b, d)));
    if (defenders) continue;
    const lead = bs[0];
    const power = bs.reduce((t, a) => t + a.units.reduce((u, x) => u + x.str * (0.3 + (r.unitTypes[x.type]?.siege ?? 0)), 0), 0);
    if (!p.siege || p.siege.by !== lead.owner) p.siege = { by: lead.owner, progress: 0 };
    p.siege.progress += Math.min(3, power / 4) / (1 + p.fort);
    if (p.siege.progress >= r.siegeBaseDays) {
      const newCtrl = lead.owner === 'REB' ? 'REB' : (p.owner && isFriendly(s, lead.owner, p.owner) ? p.owner : lead.owner);
      p.controller = newCtrl;
      p.siege = null;
      log(s, `${p.name} ha caído en manos de ${nationName(s, newCtrl)}.`, [newCtrl, p.owner ?? ''], 'war');
      r.onProvinceCaptured?.(s, p, newCtrl);
    }
  }
}

function monthly(s: GameState) {
  const r = rules(s);
  // reinforcement & attrition
  for (const a of Object.values(s.armies)) {
    if (a.owner === 'REB') continue;
    const n = s.nations[a.owner];
    const p = s.provinces[a.location];
    const friendly = isFriendly(s, a.owner, p.controller);
    for (const u of a.units) {
      const t = r.unitTypes[u.type];
      if (friendly && !a.inBattle && u.str < 1 && n.manpower > 0) {
        const need = Math.min(1 - u.str, 0.25);
        const mp = need * (t?.manpower ?? 1);
        const got = Math.min(mp, n.manpower);
        n.manpower -= got;
        u.str += got / (t?.manpower ?? 1);
      }
      if (!a.inBattle) u.org = Math.min(1, u.org + 0.3);
    }
    const supply = 4 + p.dev * 1.5 + (friendly ? 6 : 0);
    if (a.units.length > supply) for (const u of a.units) u.str *= 0.97;
  }
  for (const n of livingNations(s)) {
    // war weariness: long wars erode stability and patience
    const longest = Math.max(0, ...warsOf(s, n.tag).map((w) => s.day - w.start));
    if (longest > 730 && s.era !== 'ww2') n.stability = clamp(n.stability - 0.04 * Math.min(3, longest / 730), -3, 3);
    for (const [t, d] of Object.entries(n.truces)) if (d <= s.day) delete n.truces[t];
    n.infamy = Math.max(0, n.infamy - 0.05);
  }
  r.monthly(s);
  checkEvents(s);
  aiMissions(s);
  for (const n of livingNations(s)) if (n.tag !== s.player) { r.ai(s, n); aiMilitary(s, n); aiDiplomacy(s, n); }
  s.peaceOffers = s.peaceOffers.filter((o) => s.day - o.day < 60 && s.wars.some((w) => w.id === o.warId));
  checkCapitulations(s);
  checkDeadNations(s);
}

// ------------------------------------------------------------------ war & peace
export function declareWar(s: GameState, attacker: string, target: string, goal: string | null = null, name?: string): War | null {
  const a = s.nations[attacker], d = s.nations[target];
  if (!a || !d || !a.alive || !d.alive || attacker === target) return null;
  if (isHostile(s, attacker, target)) return null;
  // co-belligerence: join an existing war against the target alongside a friendly attacker
  const existing = s.wars.find((w) => w.defenders.includes(target) && !w.attackers.includes(attacker) && !w.defenders.includes(attacker)
    && (isFriendly(s, attacker, w.attackers[0]) || relation(s, attacker, w.attackers[0]) >= 100));
  if (existing) {
    existing.attackers.push(attacker, ...vassalsOf(s, attacker).map((v) => v.tag).filter((t) => !existing.attackers.includes(t) && !existing.defenders.includes(t)));
    addRelation(s, attacker, target, -100);
    rules(s).onWarDeclared?.(s, attacker, target, goal);
    log(s, `${a.name} entra en la guerra contra ${d.name} junto a ${s.nations[existing.attackers[0]].name}.`, [attacker, target], 'war');
    return existing;
  }
  // vassals cannot declare on their own; wars target the top liege
  const defLeader = topLiege(s, target);
  const att = [attacker, ...vassalsOf(s, attacker).map((v) => v.tag)];
  const def = [defLeader, ...vassalsOf(s, defLeader).map((v) => v.tag)];
  if (defLeader !== target && !def.includes(target)) def.push(target);
  if (def.includes(attacker)) {
    // independence war against liege
    a.liege = null;
    const idx = def.indexOf(attacker);
    def.splice(idx, 1);
  }
  breakAlliance(s, attacker, defLeader, true);
  if (a.truces[target] && a.truces[target] > s.day) { a.stability -= 2; a.prestige -= 20; log(s, `${a.name} rompe una tregua con ${d.name}.`, [attacker], 'diplo'); }
  const war: War = { id: uid(s, 'w'), name: name ?? `Guerra ${a.name}–${s.nations[defLeader].name}`, attackers: att, defenders: def, start: s.day, battleScore: 0, goal };
  // defensive allies
  for (const al of s.nations[defLeader].allies) {
    if (!war.attackers.includes(al) && !war.defenders.includes(al) && s.nations[al]?.alive && !s.nations[al].allies.includes(attacker)) {
      if (al === s.player || relation(s, al, defLeader) >= -20 || s.nations[al].faction) war.defenders.push(al, ...vassalsOf(s, al).map((v) => v.tag).filter((t) => !war.defenders.includes(t) && !war.attackers.includes(t)));
    }
  }
  for (const al of a.allies) {
    if (!war.attackers.includes(al) && !war.defenders.includes(al) && s.nations[al]?.alive) {
      const n = s.nations[al];
      if (al === s.player || n.faction && n.faction === a.faction || relation(s, al, attacker) > 60) war.attackers.push(al);
    }
  }
  war.attackers = [...new Set(war.attackers)];
  war.defenders = [...new Set(war.defenders)].filter((t) => !war.attackers.includes(t));
  s.wars.push(war);
  addRelation(s, attacker, target, -100);
  rules(s).onWarDeclared?.(s, attacker, target, goal);
  log(s, `${a.name} declara la guerra a ${d.name}. Aliados del defensor: ${war.defenders.slice(1).map((t) => s.nations[t].name).join(', ') || 'ninguno'}.`, [...war.attackers, ...war.defenders], 'war');
  return war;
}

export function warScore(s: GameState, w: War, perspective: string): number {
  const r = rules(s);
  const side = sideOf(w, perspective);
  if (!side) return 0;
  const att = new Set(w.attackers), def = new Set(w.defenders);
  let defTotal = 0, defLost = 0, attTotal = 0, attLost = 0;
  for (const p of Object.values(s.provinces)) {
    if (!p.owner) continue;
    const v = r.provinceValue(s, p);
    if (def.has(p.owner)) { defTotal += v; if (p.controller && att.has(p.controller)) defLost += v; }
    if (att.has(p.owner)) { attTotal += v; if (p.controller && def.has(p.controller)) attLost += v; }
  }
  const occ = (defTotal ? (defLost / defTotal) * 100 : 0) - (attTotal ? (attLost / attTotal) * 100 : 0);
  const score = clamp(occ + w.battleScore, -100, 100);
  return Math.round(side === 'att' ? score : -score);
}

export function peaceCost(s: GameState, w: War, from: string, to: string, provinces: string[], gold: number, extra: string | null): number {
  const r = rules(s);
  const side = sideOf(w, to);
  const loserSide = side === 'att' ? w.attackers : w.defenders;
  const isLeader = loserSide[0] === to;
  const pool = Object.values(s.provinces).filter((p) => p.owner && (isLeader ? loserSide.includes(p.owner) : p.owner === to));
  const total = pool.reduce((t, p) => t + r.provinceValue(s, p), 0) || 1;
  const pv = provinces.reduce((t, pid) => t + r.provinceValue(s, s.provinces[pid]), 0);
  const income = Math.max(10, Object.values(s.nations[to].lastIncome).reduce((t, v) => t + v, 0) * 12);
  let cost = (pv / total) * 100 + (gold / income) * 40;
  if (extra) cost += r.peaceExtras.find((e) => e.id === extra)?.cost ?? 50;
  void from;
  // asking for land is never free, however big the losing side is
  return Math.max(provinces.length ? 1 : 0, Math.round(cost));
}

export function aiAcceptsPeace(s: GameState, offer: Omit<PeaceOffer, 'id' | 'day'>): boolean {
  const w = s.wars.find((x) => x.id === offer.warId);
  if (!w) return false;
  const ws = warScore(s, w, offer.from);
  const cost = peaceCost(s, w, offer.from, offer.to, offer.provinces, offer.gold, offer.extra);
  const years = yearsBetween(w.start, s.day);
  if (cost === 0) {
    const mine = -ws; // the receiver's own war score
    return mine < 10 || (years > 4 && mine < 25) || (years > 8 && mine < 50) || armiesOf(s, offer.to).length === 0;
  }
  const stubborn = (s.nations[offer.to]?.x.stubborn ?? 1) * (1 - Math.min(0.4, Math.max(0, years - 1) * 0.08));
  return ws >= cost * stubborn || (provincesOf(s, offer.to).every((p) => p.controller !== offer.to) && cost <= 100);
}

export function sendPeace(s: GameState, from: string, to: string, warId: string, provinces: string[], gold: number, extra: string | null): 'accepted' | 'rejected' | 'pending' {
  const offer = { warId, from, to, provinces, gold, extra };
  if (to === s.player) {
    s.peaceOffers.push({ ...offer, id: uid(s, 'po'), day: s.day });
    return 'pending';
  }
  if (aiAcceptsPeace(s, offer)) { makePeace(s, offer); return 'accepted'; }
  return 'rejected';
}

export function makePeace(s: GameState, o: Omit<PeaceOffer, 'id' | 'day'>) {
  const w = s.wars.find((x) => x.id === o.warId);
  if (!w) return;
  const r = rules(s);
  const sideTo = sideOf(w, o.to)!;
  const toSide = sideTo === 'att' ? w.attackers : w.defenders;
  const fromSide = sideTo === 'att' ? w.defenders : w.attackers;
  // only the two side leaders can end the whole war; anything else is a separate peace for the non-leader
  const ending = toSide[0] === o.to && fromSide[0] === o.from;
  const leaver = ending ? null : toSide[0] !== o.to ? o.to : o.from;
  const loser = s.nations[o.to], winner = s.nations[o.from];
  for (const pid of o.provinces) transferProvince(s, pid, o.from);
  if (o.gold > 0) { const g = Math.min(o.gold, Math.max(0, loser.treasury)); loser.treasury -= g; winner.treasury += g; }
  if (o.extra) r.onPeaceExtra?.(s, o.from, o.to, o.extra);
  if (o.provinces.length) winner.infamy += o.provinces.length * 0.8;
  if (o.provinces.length || o.gold > 0 || o.extra) { bumpRecord(s, o.from, 'won'); bumpRecord(s, o.to, 'lost'); bumpRecord(s, o.from, 'conquered', o.provinces.length); }
  const leaving = ending ? [...w.attackers, ...w.defenders] : [leaver!];
  if (ending) s.wars = s.wars.filter((x) => x !== w);
  else { w.attackers = w.attackers.filter((t) => t !== leaver); w.defenders = w.defenders.filter((t) => t !== leaver); }
  const other = ending ? [] : leaver === o.to ? fromSide : toSide;
  for (const a of leaving) for (const b of [...leaving, ...other]) {
    if (a !== b && isHostileWasIn(w, a, b) && s.nations[a]) { s.nations[a].truces[b] = s.day + 365 * 5; }
  }
  restoreControl(s);
  const desc = o.provinces.length ? `cede ${o.provinces.map((p) => s.provinces[p].name).join(', ')}` : 'paz blanca';
  log(s, `Paz entre ${winner.name} y ${loser.name}: ${desc}${o.gold ? `, ${o.gold} oro` : ''}${o.extra ? `, ${r.peaceExtras.find((e) => e.id === o.extra)?.label}` : ''}.`, [o.from, o.to], 'peace');
  checkDeadNations(s);
}
function isHostileWasIn(w: War, a: string, b: string) {
  return (w.attackers.includes(a) && w.defenders.includes(b)) || (w.defenders.includes(a) && w.attackers.includes(b)) || true;
}

export function transferProvince(s: GameState, pid: string, to: string) {
  const p = s.provinces[pid];
  const prev = p.owner ? s.nations[p.owner] : undefined;
  p.owner = to;
  touchOwners(s);
  p.controller = to;
  p.siege = null;
  if (!p.cores.includes(to) && s.nations[to]?.culture === p.culture) p.cores.push(to);
  // a surviving nation that loses its capital moves it to its richest remaining province
  if (prev && prev.tag !== to && prev.capital === pid) {
    const next = provincesOf(s, prev.tag).sort((a, b) => Number(b.controller === prev.tag) - Number(a.controller === prev.tag) || b.dev - a.dev)[0];
    if (next) prev.capital = next.id;
  }
  for (const a of Object.values(s.armies)) if (a.location === pid && !canEnter(s, a.owner, pid)) relocateHome(s, a);
}

export function restoreControl(s: GameState) {
  for (const p of Object.values(s.provinces)) {
    if (p.controller !== p.owner && p.controller !== 'REB' && !isHostile(s, p.owner, p.controller)) { p.controller = p.owner; p.siege = null; }
  }
  for (const a of Object.values(s.armies)) if (!canEnter(s, a.owner, a.location)) relocateHome(s, a);
}

function relocateHome(s: GameState, a: Army) {
  const n = s.nations[a.owner];
  if (!n || !n.alive || !s.provinces[n.capital] || s.provinces[n.capital].owner !== a.owner) {
    const any = provincesOf(s, a.owner)[0];
    if (!any) { delete s.armies[a.id]; return; }
    a.location = any.id;
  } else a.location = n.capital;
  a.path = []; a.progress = 0; a.retreating = false;
}

function checkCapitulations(s: GameState) {
  const r = rules(s);
  for (const w of [...s.wars]) {
    for (const tag of [...w.attackers, ...w.defenders]) {
      const n = s.nations[tag];
      if (!n?.alive || n.tag === s.player && !r.shouldCapitulate) continue;
      const owned = provincesOf(s, tag);
      const fully = owned.length > 0 && owned.every((p) => p.controller !== tag);
      const cap = r.shouldCapitulate?.(s, tag) ?? false;
      if (fully || cap) {
        const side = sideOf(w, tag)!;
        const enemies = side === 'att' ? w.defenders : w.attackers;
        log(s, `${n.name} capitula.`, [tag], 'war');
        // every occupier keeps what it holds; the enemy leader takes the rest as vassal/annex
        for (const p of owned) if (p.controller && enemies.includes(p.controller) && p.controller !== 'REB') transferProvince(s, p.id, p.controller);
        const leader = enemies[0];
        const left = provincesOf(s, tag);
        // the other side may already be gone (both leaders capitulated in the same pass)
        if (left.length && leader && s.nations[leader]?.alive) r.onPeaceExtra?.(s, leader, tag, fully ? 'annex' : 'vassalize');
        if (!w.attackers.includes(tag) && !w.defenders.includes(tag)) continue;
        w.attackers = w.attackers.filter((t) => t !== tag);
        w.defenders = w.defenders.filter((t) => t !== tag);
        if (!w.attackers.length || !w.defenders.length) s.wars = s.wars.filter((x) => x !== w);
        restoreControl(s);
      }
    }
  }
}

export function checkDeadNations(s: GameState) {
  for (const n of livingNations(s)) {
    if (provincesOf(s, n.tag).length) continue;
    n.alive = false;
    for (const a of armiesOf(s, n.tag)) delete s.armies[a.id];
    for (const w of s.wars) { w.attackers = w.attackers.filter((t) => t !== n.tag); w.defenders = w.defenders.filter((t) => t !== n.tag); }
    s.wars = s.wars.filter((w) => w.attackers.length && w.defenders.length);
    for (const o of livingNations(s)) { o.allies = o.allies.filter((t) => t !== n.tag); if (o.liege === n.tag) o.liege = null; }
    log(s, `${n.name} ha dejado de existir.`, [n.tag], 'war');
    if (n.tag === s.player) s.gameOver = 'Tu nación ha sido destruida';
  }
  for (const w of [...s.wars]) if (!w.attackers.length || !w.defenders.length) s.wars = s.wars.filter((x) => x !== w);
}

export function makeAlliance(s: GameState, a: string, b: string, silent = false) {
  const na = s.nations[a], nb = s.nations[b];
  if (!na || !nb || a === b) return;
  if (!na.allies.includes(b)) na.allies.push(b);
  if (!nb.allies.includes(a)) nb.allies.push(a);
  if (!silent) log(s, `${na.name} y ${nb.name} firman una alianza.`, [a, b], 'diplo');
}
export function breakAlliance(s: GameState, a: string, b: string, silent = false) {
  const na = s.nations[a], nb = s.nations[b];
  if (!na || !nb || !na.allies.includes(b)) return;
  na.allies = na.allies.filter((t) => t !== b);
  nb.allies = nb.allies.filter((t) => t !== a);
  if (!silent) log(s, `${na.name} rompe su alianza con ${nb.name}.`, [a, b], 'diplo');
}

export function annex(s: GameState, winner: string, loser: string) {
  for (const p of provincesOf(s, loser)) transferProvince(s, p.id, winner);
  for (const v of vassalsOf(s, loser)) v.liege = winner;
  checkDeadNations(s);
}

// ------------------------------------------------------------------ characters
export function killCharacter(s: GameState, id: string, cause: string) {
  const c = s.characters[id];
  if (!c || !c.alive) return;
  c.alive = false;
  c.died = s.day;
  if (c.spouse && s.characters[c.spouse]) s.characters[c.spouse].spouse = null;
  for (const a of Object.values(s.armies)) if (a.leaderId === id) a.leaderId = null;
  const n = s.nations[c.tag];
  if (n && (n.rulerId === id || n.heirId === id)) log(s, `Muere ${c.name} ${c.dynasty ? `de ${c.dynasty}` : ''} (${cause}).`, [c.tag], 'character');
  (rules(s) as Ruleset & { onCharacterDeath?: (s: GameState, c: Character) => void }).onCharacterDeath?.(s, c);
}

// ------------------------------------------------------------------ events
function checkCondition(s: GameState, tag: string, c: Condition): boolean {
  const t = ('tag' in c && c.tag) || tag;
  const n = s.nations[t];
  switch (c.type) {
    case 'owns': return s.provinces[c.province]?.owner === t;
    case 'notOwns': return s.provinces[c.province]?.owner !== t;
    case 'exists': return !!s.nations[c.tag]?.alive;
    case 'atWar': return atWar(s, t) === c.value;
    case 'atWarWith': return isHostile(s, t, c.other);
    case 'flag': return !!n?.flags[c.flag] === c.value;
    case 'minStability': return (n?.stability ?? 0) >= c.value;
    case 'maxStability': return (n?.stability ?? 0) <= c.value;
    case 'isPlayer': return (t === s.player) === c.value;
    case 'notExists': return !s.nations[c.tag]?.alive;
    case 'ownsAll': return c.provinces.every((p) => s.provinces[p]?.owner === t);
    case 'ownsCount': return c.provinces.filter((p) => s.provinces[p]?.owner === t).length >= c.count;
    case 'minProvinces': return provincesOf(s, t).length >= c.value;
    case 'minPrestige': return (n?.prestige ?? 0) >= c.value;
    case 'minTreasury': return (n?.treasury ?? 0) >= c.value;
    case 'minX': return (n?.x[c.key] ?? 0) >= c.value;
    case 'allied': return !!n?.allies.includes(c.other) || (!!n?.faction && n.faction === s.nations[c.other]?.faction);
    case 'minAllies': return (n?.allies.filter((a) => s.nations[a]?.alive).length ?? 0) >= c.value;
    case 'liegeOf': return s.nations[c.other]?.liege === t;
    case 'notVassal': return !n?.liege;
    case 'minYear': return dateOf(s.day).y >= c.value;
    case 'maxYear': return dateOf(s.day).y <= c.value;
    case 'warsWon': return (s.record?.[t]?.won ?? 0) >= c.value;
    case 'religionIs': return n?.religion === c.value;
    case 'missionDone': return !!s.missionsDone?.[t]?.includes(c.mission);
    case 'maxTreasury': return (n?.treasury ?? 0) <= c.value;
    case 'maxPrestige': return (n?.prestige ?? 0) <= c.value;
    case 'maxX': return (n?.x[c.key] ?? 0) <= c.value;
    case 'isVassal': return !!n?.liege;
    case 'minWarMonths': return warsOf(s, t).some((w) => s.day - w.start >= c.value * 30);
    case 'minUnrest': return provincesOf(s, t).some((p) => p.unrest >= c.value);
    case 'maxProvinces': return provincesOf(s, t).length <= c.value;
  }
}
export const conditionMet = (s: GameState, tag: string, c: Condition) => checkCondition(s, tag, c);

function checkEvents(s: GameState) {
  for (const ev of s.events) {
    if (ev.triggeredOnly) continue;
    if (ev.oneShot !== false && s.firedEvents.includes(ev.id) && !ev.mtthMonths) continue;
    if (ev.date && s.day < dayFromISO(ev.date)) continue;
    const receivers = ev.tag ? [ev.tag] : livingNations(s).map((n) => n.tag);
    for (const tag of receivers) {
      if (!s.nations[tag]?.alive) continue;
      if (ev.condition && !ev.condition.every((c) => checkCondition(s, tag, c))) continue;
      // the player's realm lives a little more intensely than the background world
      if (ev.mtthMonths && !chance(s, (tag === s.player && !ev.tag ? 2.2 : 1) / ev.mtthMonths)) continue;
      if (ev.oneShot !== false && !ev.mtthMonths) s.firedEvents.push(ev.id);
      fireEvent(s, ev, tag);
    }
  }
}

export function fireEvent(s: GameState, ev: GameEvent, tag: string) {
  if (tag === s.player) {
    s.pendingEvents.push({ eventId: ev.id, tag });
    return;
  }
  const total = ev.options.reduce((t, o) => t + (o.aiWeight ?? 1), 0);
  let roll = rand(s) * total;
  const opt = ev.options.find((o) => (roll -= o.aiWeight ?? 1) < 0) ?? ev.options[0];
  for (const e of opt.effects) applyEffect(s, tag, e);
  if (!ev.mtthMonths) log(s, `${s.nations[tag].name}: ${ev.title}`, [tag], 'event');
}

export function applyEffect(s: GameState, tag: string, e: Effect) {
  const t = ('tag' in e && e.tag) || tag;
  const n = s.nations[t];
  switch (e.type) {
    case 'treasury': if (n) n.treasury += e.amount; break;
    case 'manpower': if (n) n.manpower = Math.max(0, n.manpower + e.amount); break;
    case 'stability': if (n) n.stability = clamp(n.stability + e.amount, -3, 3); break;
    case 'prestige': if (n) n.prestige += e.amount; break;
    case 'infamy': if (n) n.infamy = Math.max(0, n.infamy + e.amount); break;
    case 'x': if (n) n.x[e.key] = (n.x[e.key] ?? 0) + e.amount; break;
    case 'tech': if (n) n.tech[e.key] = (n.tech[e.key] ?? 0) + e.amount; break;
    case 'relations': addRelation(s, t, e.other, e.amount); break;
    case 'cede': for (const pid of e.provinces) if (s.provinces[pid]?.owner === e.from && s.nations[e.to]?.alive) transferProvince(s, pid, e.to); checkDeadNations(s); break;
    case 'declareWar': if (s.nations[e.target]?.alive && n?.alive) declareWar(s, t, e.target, e.goal ?? null); break;
    case 'alliance': makeAlliance(s, t, e.other); break;
    case 'joinFaction': if (n) joinFaction(s, t, e.faction); break;
    case 'annex': if (s.nations[e.target]?.alive) annex(s, t, e.target); break;
    case 'vassalize': if (s.nations[e.target]?.alive) s.nations[e.target].liege = t; break;
    case 'spawnArmy': if (s.provinces[e.province]) spawnArmy(s, t, e.province, e.units, 'Fuerza expedicionaria'); break;
    case 'flag': if (n) n.flags[e.flag] = s.day; break;
    case 'unrest': if (s.provinces[e.province]) s.provinces[e.province].unrest += e.amount; break;
    case 'claim': if (n) n.claims.push(...e.provinces.filter((p) => !n.claims.includes(p))); break;
    case 'government': if (n) n.government = e.value; break;
    case 'religion': for (const pid of e.provinces) if (s.provinces[pid]) s.provinces[pid].religion = e.value; if (e.nation && n) n.religion = e.value; break;
    case 'trigger': (s.scheduled ??= []).push({ eventId: e.event, tag: t, day: s.day + Math.max(1, e.days) }); break;
    case 'breakAlliance': breakAlliance(s, t, e.other, true); break;
    case 'release': if (s.nations[e.target]?.liege === t) { s.nations[e.target].liege = null; log(s, `${s.nations[e.target].name} recupera su independencia.`, [t, e.target], 'diplo'); } break;
    case 'char': {
      const A = s.characters[e.a], B = e.b ? s.characters[e.b] : undefined;
      if (!A) break;
      if (e.op === 'lovers' && B?.alive && A.alive) { A.lover = B.id; B.lover = A.id; }
      if (e.op === 'breakup') { if (A.lover && s.characters[A.lover]) s.characters[A.lover].lover = null; A.lover = null; }
      if (e.op === 'legitimize') A.bastard = false;
      if (e.op === 'banish' && A.alive) { if (A.lover && s.characters[A.lover]) s.characters[A.lover].lover = null; A.lover = null; A.tag = 'REB'; }
      if (e.op === 'kill' && A.alive) killCharacter(s, A.id, e.value ?? 'circunstancias extrañas');
      if (e.op === 'inLove') A.inLove = true;
      if (e.op === 'marry' && B?.alive && A.alive) { if (A.lover === B.id) { A.lover = null; B.lover = null; } A.spouse = B.id; B.spouse = A.id; B.tag = A.tag; A.inLove = true; B.inLove = true; }
      if (e.op === 'trait' && e.value && !A.traits.includes(e.value)) A.traits.push(e.value);
      break;
    }
    case 'chronicle': log(s, e.text, [t], 'story'); break;
    case 'unrestRealm': for (const p of provincesOf(s, t)) p.unrest = Math.max(0, p.unrest + e.amount); break;
    case 'relationsWith': for (const o of livingNations(s)) if (o.tag !== t && (!e.religion || o.religion === e.religion) && (!e.culture || o.culture === e.culture)) addRelation(s, t, o.tag, e.amount); break;
  }
}

/** follow-up events whose day has come */
function runScheduled(s: GameState) {
  if (!s.scheduled?.length) return;
  const due = s.scheduled.filter((x) => x.day <= s.day);
  if (!due.length) return;
  s.scheduled = s.scheduled.filter((x) => x.day > s.day);
  for (const d of due) {
    const ev = s.events.find((e) => e.id === d.eventId);
    if (!ev || !s.nations[d.tag]?.alive) continue;
    if (ev.condition && !ev.condition.every((c) => checkCondition(s, d.tag, c))) continue;
    fireEvent(s, ev, d.tag);
  }
}

// ------------------------------------------------------------------ missions
export function missionsOf(s: GameState, tag: string): Mission[] { return (s.missions ?? []).filter((m) => m.tag === tag); }
export function missionStatus(s: GameState, tag: string, m: Mission): 'done' | 'ready' | 'open' | 'locked' {
  if (s.missionsDone?.[tag]?.includes(m.id)) return 'done';
  if (m.requires?.some((r) => !s.missionsDone?.[tag]?.includes(r))) return 'locked';
  return m.conditions.every((c) => checkCondition(s, tag, c)) ? 'ready' : 'open';
}
export function completeMission(s: GameState, tag: string, id: string): string | null {
  const m = (s.missions ?? []).find((x) => x.id === id && x.tag === tag);
  if (!m) return 'Misión desconocida';
  const st = missionStatus(s, tag, m);
  if (st === 'done') return 'Ya completada';
  if (st !== 'ready') return 'Aún no se cumplen las condiciones';
  ((s.missionsDone ??= {})[tag] ??= []).push(id);
  for (const e of m.rewards) applyEffect(s, tag, e);
  log(s, `${s.nations[tag].name} cumple el objetivo «${m.title}».`, [tag], 'mission');
  return null;
}
function aiMissions(s: GameState) {
  for (const m of s.missions ?? []) {
    if (m.tag === s.player || !s.nations[m.tag]?.alive) continue;
    if (missionStatus(s, m.tag, m) === 'ready') completeMission(s, m.tag, m.id);
  }
}

/** overall standing, used by the ledger, the end screen and victory */
export function nationScore(s: GameState, tag: string): number {
  const n = s.nations[tag];
  if (!n?.alive) return 0;
  const own = provincesOf(s, tag);
  const dev = own.reduce((t, p) => t + p.dev, 0);
  const vassals = vassalsOf(s, tag).reduce((t, v) => t + provincesOf(s, v.tag).reduce((u, p) => u + p.dev, 0), 0);
  const rec = s.record?.[tag];
  const missions = s.missionsDone?.[tag]?.length ?? 0;
  const base = dev * 4 + vassals * 2 + Math.max(0, n.prestige) / 4 + missions * 25 + (rec ? rec.won * 30 + rec.battlesWon * 2 : 0);
  if (s.era === 'ww2') return Math.round(base + own.reduce((t, p) => t + (p.x.vp ?? 0), 0) * 3 + (n.x.ic ?? 0) * 2);
  if (s.era === 'earlymodern') return Math.round(base + Object.values(n.tech).reduce((t, v) => t + v, 0) * 10);
  return Math.round(base + (n.x.piety ?? 0) / 10);
}
export function bumpRecord(s: GameState, tag: string, k: 'won' | 'lost' | 'battlesWon' | 'battlesLost' | 'conquered', v = 1) {
  const r = ((s.record ??= {})[tag] ??= { won: 0, lost: 0, battlesWon: 0, battlesLost: 0, conquered: 0 });
  r[k] += v;
}

export function joinFaction(s: GameState, tag: string, faction: string) {
  const n = s.nations[tag];
  if (!n || n.faction === faction) return;
  n.faction = faction;
  for (const m of livingNations(s)) if (m.tag !== tag && m.faction === faction) makeAlliance(s, tag, m.tag, true);
  // join the faction's ongoing wars
  for (const w of s.wars) {
    const leader = s.factions[faction]?.leader;
    const side = leader ? sideOf(w, leader) : null;
    if (side && !sideOf(w, tag)) (side === 'att' ? w.attackers : w.defenders).push(tag);
  }
  log(s, `${n.name} se une a ${s.factions[faction]?.name ?? faction}.`, [tag], 'diplo');
}

// ------------------------------------------------------------------ AI
function aiMilitary(s: GameState, n: Nation) {
  const mine = armiesOf(s, n.tag).filter((a) => !a.inBattle && !a.retreating);
  // merge armies sharing a province
  const byLoc: Record<string, Army[]> = {};
  for (const a of mine) if (!a.path.length) (byLoc[a.location] ??= []).push(a);
  for (const group of Object.values(byLoc)) if (group.length > 1) mergeArmies(s, group.map((a) => a.id));
  if (!atWar(s, n.tag)) {
    // pull back to capital area if idle in foreign land
    for (const a of armiesOf(s, n.tag)) if (s.provinces[a.location].owner !== n.tag && !a.path.length) moveArmy(s, a.id, n.capital);
    return;
  }
  // defend the capital: if an enemy army is next to it, the closest army goes home
  const cap = s.provinces[n.capital];
  if (cap && cap.owner === n.tag) {
    const near = new Set([cap.id, ...neighbours(s, cap.id).map((e) => e.to)]);
    const danger = Object.values(s.armies).some((b) => near.has(b.location) && isHostile(s, n.tag, b.owner));
    const guarded = Object.values(s.armies).some((b) => b.owner === n.tag && (b.location === cap.id || b.path[b.path.length - 1] === cap.id));
    if (danger && !guarded) {
      const closest = armiesOf(s, n.tag).filter((b) => !b.inBattle && !b.retreating)
        .sort((x, y) => Math.hypot(s.provinces[x.location].lon - cap.lon, s.provinces[x.location].lat - cap.lat) - Math.hypot(s.provinces[y.location].lon - cap.lon, s.provinces[y.location].lat - cap.lat))[0];
      if (closest) moveArmy(s, closest.id, cap.id);
    }
  }
  // candidate provinces and enemy threat are the same for every army of this nation: compute them once
  const myArmies = armiesOf(s, n.tag);
  const threatAt = new Map<string, number>();
  const hostileArmies = Object.values(s.armies).filter((b) => b.owner !== n.tag && (b.owner === 'REB' ? b.rebelAgainst === n.tag : isHostile(s, n.tag, b.owner)));
  for (const b of hostileArmies) threatAt.set(b.location, (threatAt.get(b.location) ?? 0) + armyStrength(s, b));
  const goals = new Set(s.wars.filter((w) => sideOf(w, n.tag)).map((w) => w.goal).filter(Boolean) as string[]);
  const candidates: { p: Province; base: number }[] = [];
  for (const p of Object.values(s.provinces)) {
    if (!p.owner) continue;
    const ownOccupied = isFriendly(s, n.tag, p.owner) && p.controller && isHostile(s, n.tag, p.controller);
    const enemy = isHostile(s, n.tag, p.controller);
    if (!ownOccupied && !enemy) continue;
    let base = (ownOccupied ? 30 : 10) + p.dev * 2 + ((threatAt.get(p.id) ?? 0) > 0 ? 8 : 0);
    if (goals.has(p.id)) base += 25;
    if (p.id === s.nations[p.owner]?.capital) base += 10;
    candidates.push({ p, base });
  }
  const heading = new Map<string, number>();
  for (const b of myArmies) { const dest = b.path[b.path.length - 1] ?? b.location; heading.set(dest, (heading.get(dest) ?? 0) + 1); }
  for (const a of myArmies) {
    if (a.inBattle || a.retreating || !s.armies[a.id]) continue;
    if (a.path.length && rand(s) < 0.4) continue;
    if (a.path[a.path.length - 1] === n.capital && s.provinces[n.capital].owner === n.tag) continue;
    const strength = armyStrength(s, a);
    const avgStr = a.units.reduce((t, u) => t + u.str, 0) / Math.max(1, a.units.length);
    if (avgStr < 0.5) { moveArmy(s, a.id, n.capital); continue; }
    // choose a target: own occupied provinces first, then enemy provinces (prefer war goal), spread over fronts
    const here = s.provinces[a.location];
    const mine = a.path[a.path.length - 1] ?? a.location;
    const targets: { pid: string; score: number }[] = [];
    for (const { p, base } of candidates) {
      if ((threatAt.get(p.id) ?? 0) > strength * 1.3) continue;
      const d = Math.hypot(p.lon - here.lon, p.lat - here.lat);
      const others = (heading.get(p.id) ?? 0) - (mine === p.id ? 1 : 0);
      targets.push({ pid: p.id, score: base - d * 2 - others * 12 });
    }
    targets.sort((x, y) => y.score - x.score);
    for (const t of targets.slice(0, 4)) {
      if (moveArmy(s, a.id, t.pid)) { const nd = s.armies[a.id]?.path.slice(-1)[0]; if (nd) heading.set(nd, (heading.get(nd) ?? 0) + 1); break; }
    }
  }
  // peace
  for (const w of warsOf(s, n.tag)) {
    const side = sideOf(w, n.tag)!;
    const myLeader = side === 'att' ? w.attackers[0] : w.defenders[0];
    const enemyLeader = side === 'att' ? w.defenders[0] : w.attackers[0];
    if (myLeader !== n.tag || !enemyLeader) continue;
    // do not pester the player with the same peace every month
    if (enemyLeader === s.player && s.day - (n.flags[`po_${w.id}`] ?? -9999) < 300) continue;
    const ws = warScore(s, w, n.tag);
    const years = yearsBetween(w.start, s.day);
    if (ws >= 25 && rand(s) < 0.4) {
      const r = rules(s);
      const occupied = Object.values(s.provinces)
        .filter((p) => p.owner === enemyLeader && p.controller && sideOf(w, p.controller) === side)
        .sort((x, y) => (n.claims.includes(y.id) ? 100 : 0) + r.provinceValue(s, y) - (n.claims.includes(x.id) ? 100 : 0) - r.provinceValue(s, x));
      const pick: string[] = [];
      for (const p of occupied) {
        if (peaceCost(s, w, n.tag, enemyLeader, [...pick, p.id], 0, null) <= ws) pick.push(p.id);
      }
      if (pick.length) { if (enemyLeader === s.player) n.flags[`po_${w.id}`] = s.day; sendPeace(s, n.tag, enemyLeader, w.id, pick, 0, null); }
      else if (years > 1.5) { if (enemyLeader === s.player) n.flags[`po_${w.id}`] = s.day; sendPeace(s, n.tag, enemyLeader, w.id, [], 0, null); }
    } else if ((ws < -30 || years > 5) && rand(s) < 0.25) {
      if (enemyLeader === s.player) {
        if (!s.peaceOffers.some((o) => o.warId === w.id)) s.peaceOffers.push({ id: uid(s, 'po'), warId: w.id, from: n.tag, to: enemyLeader, provinces: [], gold: 0, extra: null, day: s.day });
      } else if (aiAcceptsPeace(s, { warId: w.id, from: n.tag, to: enemyLeader, provinces: [], gold: 0, extra: null })) {
        makePeace(s, { warId: w.id, from: n.tag, to: enemyLeader, provinces: [], gold: 0, extra: null });
      } else if (ws < -30) {
        // concede the occupied provinces the enemy wants most
        const r = rules(s);
        const lost = provincesOf(s, n.tag).filter((p) => p.controller && sideOf(w, p.controller) && sideOf(w, p.controller) !== side)
          .sort((a, b) => r.provinceValue(s, b) - r.provinceValue(s, a));
        const give: string[] = [];
        for (const p of lost) if (peaceCost(s, w, enemyLeader, n.tag, [...give, p.id], 0, null) * (n.x.stubborn ?? 1) <= -ws) give.push(p.id);
        if (give.length) makePeace(s, { warId: w.id, from: enemyLeader, to: n.tag, provinces: give, gold: 0, extra: null });
      }
    }
  }
}

function aiDiplomacy(s: GameState, n: Nation) {
  if (n.liege) {
    // vassals with bad relations may rebel
    const liege = s.nations[n.liege];
    if (liege && relation(s, n.tag, liege.tag) < -100 && militaryPower(s, n.tag) > militaryPower(s, liege.tag) * 0.6 && rand(s) < 0.1) {
      declareWar(s, n.tag, liege.tag, null, `Guerra de independencia de ${n.name}`);
    }
    return;
  }
  const neighbourTags = new Set<string>();
  const border: Record<string, number> = {};
  for (const p of provincesOf(s, n.tag)) for (const e of neighbours(s, p.id)) {
    const o = s.provinces[e.to].owner;
    if (o && o !== n.tag && o !== 'REB') { const top = topLiege(s, o); neighbourTags.add(top); border[top] = (border[top] ?? 0) + 1; }
  }
  neighbourTags.delete(n.tag);
  const myPowOnly = militaryPower(s, n.tag);
  // relations drift towards a "natural" level: borders breed friction, faith, blood and alliances breed friendship
  for (const t of [...neighbourTags, ...n.allies]) {
    if (rand(s) > 0.35) continue;
    const o = s.nations[t];
    if (!o?.alive) continue;
    let base = neighbourTags.has(t) ? -15 - Math.min(20, (border[t] ?? 0) * 4) : 0;
    base += o.religion === n.religion ? 20 : -15;
    if (n.allies.includes(t)) base += 70;
    if (n.flags[`rm_${t}`]) base += 30;
    if (n.faction && n.faction === o.faction) base += 60;
    if (n.flags[`rival_${t}`]) base -= 60;
    if ((o.infamy ?? 0) > 15) base -= (o.infamy - 15) * 2;
    const cur = relation(s, n.tag, t);
    addRelation(s, n.tag, t, Math.sign(base - cur) * Math.min(4, Math.abs(base - cur)) + Math.round((rand(s) - 0.5) * 6));
  }
  // pick a rival: the neighbour of similar strength we share most border with
  if (!Object.keys(n.flags).some((k) => k.startsWith('rival_') && s.nations[k.slice(6)]?.alive) && rand(s) < 0.04) {
    const r = [...neighbourTags].filter((t) => {
      const o = s.nations[t];
      if (!o?.alive || o.x.pseudo || n.allies.includes(t) || (n.faction && n.faction === o.faction)) return false;
      const ratio = militaryPower(s, t) / Math.max(1, myPowOnly);
      return ratio > 0.5 && ratio < 2.5;
    }).sort((a, b) => (border[b] ?? 0) - (border[a] ?? 0))[0];
    if (r) { n.flags[`rival_${r}`] = s.day; addRelation(s, n.tag, r, -25); log(s, `${n.name} considera a ${s.nations[r].name} su gran rival.`, [n.tag, r], 'diplo'); }
  }
  // alliances: with friends, and against a common threat
  if (n.allies.length < 3 && rand(s) < 0.06) {
    const threat = [...neighbourTags].map((t) => s.nations[t]).filter((o) => o && militaryPower(s, o.tag) > myPowOnly * 1.6 && relation(s, n.tag, o.tag) < 0)[0];
    const cand = livingNations(s).filter((o) => {
      if (o.tag === n.tag || o.liege || n.allies.includes(o.tag) || isHostile(s, n.tag, o.tag) || o.tag === s.player) return false;
      if (n.faction && n.faction !== o.faction) return false;
      const rel = relation(s, n.tag, o.tag);
      if (rel > 80) return true;
      // common enemy
      return !!threat && rel > 30 && o.tag !== threat.tag && relation(s, o.tag, threat.tag) < 0;
    }).sort((a, b) => militaryPower(s, b.tag) - militaryPower(s, a.tag));
    const c = cand[0];
    if (c) { makeAlliance(s, n.tag, c.tag); if (threat) log(s, `${n.name} y ${c.name} se alían frente a ${threat.name}.`, [n.tag, c.tag], 'diplo'); }
  }
  // declare war: claims, rivals and opportunities (a neighbour already at war)
  const aggression = n.x.aggression ?? 1;
  const wars = warsOf(s, n.tag).length;
  if (wars === 0 && n.stability >= -1 && rand(s) < 0.035 * aggression && s.day - s.startDay > 120) {
    const myPow = myPowOnly + n.allies.reduce((t, al) => t + militaryPower(s, al) * 0.5, 0);
    const scored = [...neighbourTags].map((t) => {
      const o = s.nations[t];
      if (!o?.alive || n.allies.includes(t) || (n.truces[t] ?? 0) > s.day || o.x.pseudo) return null;
      if (n.faction && n.faction === o.faction) return null;
      const theirPow = militaryPower(s, t) + o.allies.reduce((tt, al) => tt + militaryPower(s, al) * 0.8, 0);
      const claim = provincesOf(s, t).some((p) => n.claims.includes(p.id) || p.cores.includes(n.tag));
      const rival = !!n.flags[`rival_${t}`];
      const busy = atWar(s, t);
      const rel = relation(s, n.tag, t);
      const need = claim ? 1.05 : rival ? 1.3 : busy ? 1.15 : 1.7;
      if (myPow <= theirPow * need) return null;
      if (!claim && !rival && rel > 25) return null;
      const r = rules(s);
      if (r.aiMayDeclare && !r.aiMayDeclare(s, n, t, claim ? 'claim' : null)) return null;
      return { t, score: myPow / Math.max(1, theirPow) + (claim ? 1 : 0) + (rival ? 0.8 : 0) + (busy ? 0.5 : 0) - rel / 100 };
    }).filter(Boolean) as { t: string; score: number }[];
    const target = scored.sort((a, b) => b.score - a.score)[0]?.t;
    if (target && !provincesOf(s, target).some((p) => n.claims.includes(p.id) || p.cores.includes(n.tag))) {
      // no casus belli yet: first forge a claim on a border province, the war comes later
      const bp = provincesOf(s, target).find((p) => neighbours(s, p.id).some((e) => s.provinces[e.to].owner === n.tag));
      if (bp) { n.claims.push(bp.id); addRelation(s, target, n.tag, -15); }
      return;
    }
    if (target) {
      const tp = provincesOf(s, target);
      const goal = tp.find((p) => n.claims.includes(p.id) || p.cores.includes(n.tag))?.id
        ?? tp.find((p) => neighbours(s, p.id).some((e) => s.provinces[e.to].owner === n.tag))?.id ?? null;
      declareWar(s, n.tag, target, goal);
    }
  }
}

export function moveArmy(s: GameState, armyId: string, to: string): boolean {
  const a = s.armies[armyId];
  if (!a || a.inBattle || a.retreating) return false;
  if (a.location === to) { a.path = []; return true; }
  const path = findPath(s, a.location, to, (pid) => canEnter(s, a.owner, pid), canUseSea(s, a.owner));
  if (!path) return false;
  a.path = path;
  a.progress = 0;
  return true;
}

export function mergeArmies(s: GameState, ids: string[]) {
  const armies = ids.map((id) => s.armies[id]).filter(Boolean);
  if (armies.length < 2) return;
  const [first, ...rest] = armies;
  for (const a of rest) {
    if (a.location !== first.location || a.owner !== first.owner) continue;
    first.units.push(...a.units);
    if (!first.leaderId && a.leaderId) first.leaderId = a.leaderId;
    delete s.armies[a.id];
  }
}

// ------------------------------------------------------------------ commands (player & network)
export function applyCommand(s: GameState, tag: string, c: Command): string | null {
  const r = rules(s);
  switch (c.type) {
    case 'move': {
      const a = s.armies[c.armyId];
      if (!a || a.owner !== tag) return 'No es tu ejército';
      return moveArmy(s, c.armyId, c.to) ? null : 'No hay ruta (¿frontera neutral o sin acceso naval?)';
    }
    case 'split': {
      const a = s.armies[c.armyId];
      if (!a || a.owner !== tag || a.units.length < 2) return 'No se puede dividir';
      const half = a.units.splice(0, Math.floor(a.units.length / 2));
      const b = spawnArmy(s, tag, a.location, {}, `${a.name} (B)`);
      b.units = half;
      return null;
    }
    case 'stop': {
      const a = s.armies[c.armyId];
      if (!a || a.owner !== tag || a.retreating) return 'No se puede detener';
      a.path = []; a.progress = 0;
      return null;
    }
    case 'merge': mergeArmies(s, c.armyIds.filter((id) => s.armies[id]?.owner === tag)); return null;
    case 'disband': {
      const a = s.armies[c.armyId];
      if (!a || a.owner !== tag) return 'No es tu ejército';
      s.nations[tag].manpower += a.units.reduce((t, u) => t + u.str * (r.unitTypes[u.type]?.manpower ?? 0) * 0.5, 0);
      delete s.armies[a.id];
      return null;
    }
    case 'declareWar': {
      const n = s.nations[tag];
      if (n.liege) return 'Un vasallo no puede declarar guerras';
      if (n.allies.includes(c.target)) return 'Es tu aliado';
      return declareWar(s, tag, c.target, c.goal ?? null) ? null : 'No se puede declarar la guerra';
    }
    case 'offerPeace': {
      const res = sendPeace(s, tag, c.target, c.warId, c.provinces, c.gold, c.extra);
      return res === 'accepted' ? null : res === 'rejected' ? 'La propuesta de paz ha sido rechazada' : null;
    }
    case 'answerPeace': {
      const o = s.peaceOffers.find((x) => x.id === c.offerId);
      if (!o) return 'Oferta caducada';
      s.peaceOffers = s.peaceOffers.filter((x) => x !== o);
      if (c.accept) makePeace(s, o);
      else log(s, `${s.nations[tag].name} rechaza la paz de ${s.nations[o.from].name}.`, [tag, o.from], 'peace');
      return null;
    }
    case 'proposeAlliance': {
      const o = s.nations[c.target];
      if (!o?.alive) return 'Nación inexistente';
      if (isHostile(s, tag, c.target)) return 'Estáis en guerra';
      if (relation(s, tag, c.target) < 50 && !(o.faction && o.faction === s.nations[tag].faction)) return `Rechazada: relaciones insuficientes (${relation(s, tag, c.target)}/50)`;
      makeAlliance(s, tag, c.target);
      return null;
    }
    case 'breakAlliance': breakAlliance(s, tag, c.target); addRelation(s, tag, c.target, -50); return null;
    case 'improveRelations': {
      const n = s.nations[tag];
      const cost = 25;
      if (n.treasury < cost) return 'Fondos insuficientes';
      n.treasury -= cost;
      addRelation(s, tag, c.target, 15 + Math.round(rand(s) * 10));
      return null;
    }
    case 'eventChoice': {
      const idx = s.pendingEvents.findIndex((p) => p.eventId === c.eventId && p.tag === tag);
      if (idx < 0) return 'Evento no pendiente';
      s.pendingEvents.splice(idx, 1);
      const ev = s.events.find((e) => e.id === c.eventId);
      const opt = ev?.options[c.option];
      if (!ev || !opt) return 'Opción inválida';
      for (const e of opt.effects) applyEffect(s, tag, e);
      log(s, `${ev.title}: ${opt.label}`, [tag], 'event');
      return null;
    }
    case 'claimMission': return completeMission(s, tag, c.id);
    case 'action': {
      const def = r.actions.find((a) => a.id === c.id);
      if (!def) return 'Acción desconocida';
      const ok = def.available ? def.available(s, tag, c.args) : true;
      if (ok !== true) return ok;
      def.run(s, tag, c.args);
      return null;
    }
  }
}

export function serialize(s: GameState): string { return JSON.stringify(s); }
export function deserialize(json: string): GameState { return JSON.parse(json) as GameState; }
export type { Province };

/** the player's own character takes the throne and founds a house; the old line stays at court as pretenders */
function foundDynasty(s: GameState, tag: string, f: FounderDef) {
  const n = s.nations[tag];
  const iso = (yearsAgo: number) => { const d = dateOf(s.day); return `${String(d.y - yearsAgo).padStart(4, '0')}-${String(d.m).padStart(2, '0')}-${String(Math.min(28, d.d)).padStart(2, '0')}`; };
  const old = n.rulerId ? s.characters[n.rulerId] : null;
  const c = addCharacter(s, { name: f.name, dynasty: f.dynasty, born: iso(f.age), female: f.female, dip: f.dip, mar: f.mar, ste: f.ste, int: f.int, traits: f.traits }, tag);
  if (f.portrait) c.portrait = f.portrait;
  c.bio = f.bio || `Fundador${f.female ? 'a' : ''} de la casa de ${f.dynasty}.`;
  n.rulerId = c.id;
  n.heirId = null;
  if (old && old.alive) {
    // the deposed line keeps its blood right: a ready-made source of pretenders
    for (const k of Object.values(s.characters)) if (k.alive && k.tag === tag && k.dynasty === old.dynasty && k.id !== c.id) k.claims = [...new Set([...(k.claims ?? []), tag])];
    log(s, `${old.name} de ${old.dynasty} ha sido apartad${old.female ? 'a' : 'o'} del trono; su linaje no lo olvidará.`, [tag], 'story');
  }
  const pool = Object.values(s.characters);
  const mkSpouse = () => {
    const sp = addCharacter(s, { name: f.female ? 'Consorte' : 'Consorte', dynasty: pool.find((k) => k.tag !== tag && k.dynasty)?.dynasty ?? 'Linaje menor', born: iso(Math.max(16, f.age - 3)), female: !f.female, dip: 5, mar: 5, ste: 5, int: 5 }, tag);
    return sp;
  };
  if (f.spouse) {
    const sp = mkSpouse();
    const names = s.era === 'ww2' ? (f.female ? ['Ernesto', 'Julián', 'Víctor', 'Andrés'] : ['Elena', 'Clara', 'Lucía', 'Margarita']) : (f.female ? ['Rodrigo', 'Álvaro', 'Hugo', 'Fernán'] : ['Leonor', 'Blanca', 'Urraca', 'Constanza']);
    sp.name = names[Math.floor(rand(s) * names.length)];
    c.spouse = sp.id; sp.spouse = c.id;
    const kids = Math.max(0, Math.min(4, f.children ?? 0));
    for (let i = 0; i < kids; i++) {
      const female = rand(s) < 0.45;
      const pick = female ? ['Isabel', 'María', 'Juana', 'Teresa', 'Inés'] : ['Juan', 'Pedro', 'Alonso', 'Diego', 'Martín'];
      const k = addCharacter(s, { name: pick[Math.floor(rand(s) * pick.length)], dynasty: f.dynasty, born: iso(Math.max(0, Math.min(f.age - 18, 2 + i * 3))), female, dip: 4 + Math.round(rand(s) * 4), mar: 4 + Math.round(rand(s) * 4), ste: 4 + Math.round(rand(s) * 4), int: 4 + Math.round(rand(s) * 4) }, tag);
      if (f.female) { k.mother = c.id; k.father = sp.id; } else { k.father = c.id; k.mother = sp.id; }
    }
  }
  const kids = Object.values(s.characters).filter((k) => k.alive && (k.father === c.id || k.mother === c.id)).sort((a, b) => a.born - b.born);
  n.heirId = (kids.find((k) => !k.female) ?? kids[0])?.id ?? null;
  (s.dynasties ??= {})[f.dynasty] = { renown: 10, founded: s.day };
  log(s, `${f.name} funda la casa de ${f.dynasty} y toma las riendas de ${n.name}.`, [tag], 'story');
}
