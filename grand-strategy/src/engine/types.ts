import type { Terrain } from '@/data/provinces';

export type Era = 'medieval' | 'earlymodern' | 'ww2';

export interface Province {
  id: string;
  name: string;
  lon: number;
  lat: number;
  terrain: Terrain;
  landmass: string;
  coastal: boolean;
  dev: number; // base wealth / tax
  owner: string | null;
  controller: string | null;
  cores: string[];
  culture: string;
  religion: string;
  fort: number;
  manpower: number; // base manpower contribution
  buildings: Record<string, number>;
  unrest: number;
  siege: { by: string; progress: number } | null;
  // era-specific numeric fields (industry, victory points, trade value, colony size…)
  x: Record<string, number>;
}

export interface Unit {
  type: string;
  str: number; // 0..1 strength
  org: number; // 0..1 morale / organisation
}

export interface Army {
  id: string;
  owner: string;
  name: string;
  location: string;
  path: string[];
  progress: number; // days spent on current edge
  units: Unit[];
  leaderId: string | null;
  rebelAgainst?: string;
  inBattle: boolean;
  retreating: boolean;
}

export interface Character {
  id: string;
  name: string;
  dynasty: string;
  born: number; // day index
  female: boolean;
  father: string | null;
  mother: string | null;
  spouse: string | null;
  tag: string; // realm the character belongs to
  traits: string[];
  diplomacy: number;
  martial: number;
  stewardship: number;
  intrigue: number;
  alive: boolean;
  died?: number;
  isLeader?: boolean; // general / army leader
}

export interface Nation {
  tag: string;
  name: string;
  color: string;
  capital: string;
  alive: boolean;
  treasury: number;
  manpower: number;
  stability: number;
  prestige: number;
  infamy: number;
  religion: string;
  culture: string;
  government: string;
  liege: string | null; // vassal / puppet relationship
  allies: string[];
  relations: Record<string, number>;
  truces: Record<string, number>; // tag -> day truce ends
  claims: string[]; // province ids this nation may fight for
  rulerId: string | null;
  heirId: string | null;
  faction: string | null; // ww2 alliance block
  tech: Record<string, number>;
  flags: Record<string, number>;
  // era-specific numeric state (piety, inflation, IC, dissent, sliders…)
  x: Record<string, number>;
  // era-specific queues / lists
  queue: { id: string; kind: string; label: string; progress: number; cost: number; data?: Record<string, unknown> }[];
  lastIncome: Record<string, number>;
}

export interface War {
  id: string;
  name: string;
  attackers: string[];
  defenders: string[];
  start: number;
  battleScore: number; // attacker-positive
  goal: string | null; // province id targeted by the casus belli
}

export type Effect =
  | { type: 'treasury' | 'manpower' | 'stability' | 'prestige' | 'infamy'; tag?: string; amount: number }
  | { type: 'x'; tag?: string; key: string; amount: number }
  | { type: 'relations'; tag?: string; other: string; amount: number }
  | { type: 'cede'; from: string; to: string; provinces: string[] }
  | { type: 'declareWar'; tag?: string; target: string; goal?: string }
  | { type: 'alliance'; tag?: string; other: string }
  | { type: 'joinFaction'; tag?: string; faction: string }
  | { type: 'annex'; tag?: string; target: string }
  | { type: 'vassalize'; tag?: string; target: string }
  | { type: 'spawnArmy'; tag?: string; province: string; units: Record<string, number> }
  | { type: 'flag'; tag?: string; flag: string }
  | { type: 'unrest'; province: string; amount: number }
  | { type: 'claim'; tag?: string; provinces: string[] }
  | { type: 'tech'; tag?: string; key: string; amount: number }
  | { type: 'government'; tag?: string; value: string }
  | { type: 'religion'; tag?: string; provinces: string[]; value: string; nation?: boolean };

export interface EventOption {
  label: string;
  effects: Effect[];
  aiWeight?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  tag?: string; // who receives it (undefined = every living nation… usually used with condition)
  date?: string; // ISO yyyy-mm-dd: fires on or after
  oneShot?: boolean;
  condition?: Condition[];
  mtthMonths?: number; // mean time to happen for random events
  options: EventOption[];
}

export type Condition =
  | { type: 'owns'; province: string; tag?: string }
  | { type: 'notOwns'; province: string; tag?: string }
  | { type: 'exists'; tag: string }
  | { type: 'atWar'; tag?: string; value: boolean }
  | { type: 'atWarWith'; tag?: string; other: string }
  | { type: 'flag'; flag: string; tag?: string; value: boolean }
  | { type: 'minStability'; value: number }
  | { type: 'maxStability'; value: number }
  | { type: 'isPlayer'; value: boolean };

export interface PendingEvent {
  eventId: string;
  tag: string;
}

export interface LogEntry {
  day: number;
  text: string;
  tags: string[];
  kind: 'war' | 'peace' | 'diplo' | 'battle' | 'event' | 'economy' | 'character' | 'info';
}

export interface GameState {
  version: number;
  era: Era;
  mapId: string;
  scenarioId: string;
  scenarioName: string;
  day: number; // days since 0001-01-01 (proleptic, UTC)
  startDay: number;
  endDay: number;
  rng: number;
  nextId: number;
  player: string;
  provinces: Record<string, Province>;
  nations: Record<string, Nation>;
  armies: Record<string, Army>;
  characters: Record<string, Character>;
  wars: War[];
  events: GameEvent[];
  firedEvents: string[];
  pendingEvents: PendingEvent[];
  log: LogEntry[];
  peaceOffers: PeaceOffer[];
  factions: Record<string, { name: string; leader: string; color: string }>;
  gameOver: string | null;
}

export interface PeaceOffer {
  id: string;
  warId: string;
  from: string;
  to: string;
  provinces: string[];
  gold: number;
  extra: string | null; // 'vassalize' | 'annex' | 'puppet'
  day: number;
}

export type Command =
  | { type: 'move'; armyId: string; to: string }
  | { type: 'split'; armyId: string }
  | { type: 'merge'; armyIds: string[] }
  | { type: 'disband'; armyId: string }
  | { type: 'declareWar'; target: string; goal?: string | null }
  | { type: 'offerPeace'; warId: string; target: string; provinces: string[]; gold: number; extra: string | null }
  | { type: 'answerPeace'; offerId: string; accept: boolean }
  | { type: 'proposeAlliance'; target: string }
  | { type: 'breakAlliance'; target: string }
  | { type: 'improveRelations'; target: string }
  | { type: 'eventChoice'; eventId: string; option: number }
  | { type: 'action'; id: string; args: Record<string, string | number> };
