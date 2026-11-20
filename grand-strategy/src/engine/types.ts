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
  /** hereditary claims on other realms (tags), e.g. through a royal mother */
  claims?: string[];
  bio?: string;
  /** secret lover (character id) */
  lover?: string | null;
  /** born out of wedlock: cannot inherit unless legitimised */
  bastard?: boolean;
  /** truly in love with their spouse (better marriage, more children) */
  inLove?: boolean;
  /** chosen portrait (player-created characters) */
  portrait?: string;
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
  | { type: 'religion'; tag?: string; provinces: string[]; value: string; nation?: boolean }
  /** schedule a follow-up event for this nation in N days (chains) */
  | { type: 'trigger'; tag?: string; event: string; days: number }
  /** write a line in the realm's chronicle */
  | { type: 'chronicle'; tag?: string; text: string }
  /** unrest in every province of the realm */
  | { type: 'unrestRealm'; tag?: string; amount: number }
  /** relations with every living nation of a religion / culture */
  | { type: 'relationsWith'; tag?: string; religion?: string; culture?: string; amount: number }
  /** character-level operations used by romance and court events */
  | { type: 'breakAlliance'; tag?: string; other: string }
  | { type: 'release'; tag?: string; target: string }
  | { type: 'char'; op: 'lovers' | 'breakup' | 'legitimize' | 'banish' | 'kill' | 'inLove' | 'trait' | 'marry'; a: string; b?: string; value?: string };

export interface EventOption {
  label: string;
  effects: Effect[];
  aiWeight?: number;
  /** extra flavour shown under the option (the mechanical effects are listed automatically) */
  hint?: string;
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
  /** illustration category: war, peace, court, disaster, prosperity, faith, revolt, explore */
  image?: string;
  /** only fired through a 'trigger' effect, never by date/condition polling */
  triggeredOnly?: boolean;
  /** historical note shown in the event window */
  note?: string;
}

/** A national objective. Completing it (conditions met, then claimed) grants the rewards. */
export interface Mission {
  id: string;
  tag: string;
  title: string;
  text: string;
  requires?: string[];
  conditions: Condition[];
  rewards: Effect[];
  icon?: string; // same categories as event images
  /** column in the mission tree (0..3) for layout */
  col?: number;
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
  | { type: 'isPlayer'; value: boolean }
  | { type: 'notExists'; tag: string }
  | { type: 'ownsAll'; provinces: string[]; tag?: string }
  | { type: 'ownsCount'; provinces: string[]; count: number; tag?: string }
  | { type: 'minProvinces'; value: number; tag?: string }
  | { type: 'minPrestige'; value: number }
  | { type: 'minTreasury'; value: number }
  | { type: 'minX'; key: string; value: number }
  | { type: 'allied'; other: string }
  | { type: 'minAllies'; value: number }
  | { type: 'liegeOf'; other: string }
  | { type: 'notVassal' }
  | { type: 'minYear'; value: number }
  | { type: 'maxYear'; value: number }
  | { type: 'warsWon'; value: number }
  | { type: 'religionIs'; value: string }
  | { type: 'missionDone'; mission: string }
  | { type: 'maxTreasury'; value: number }
  | { type: 'maxPrestige'; value: number }
  | { type: 'maxX'; key: string; value: number }
  | { type: 'isVassal' }
  | { type: 'minWarMonths'; value: number }
  | { type: 'minUnrest'; value: number }
  | { type: 'maxProvinces'; value: number };

export interface PendingEvent {
  eventId: string;
  tag: string;
}

export interface LogEntry {
  day: number;
  text: string;
  tags: string[];
  kind: 'war' | 'peace' | 'diplo' | 'battle' | 'event' | 'economy' | 'character' | 'info' | 'story' | 'mission' | 'siege';
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
  /** follow-up events waiting for their day (optional for old saves) */
  scheduled?: { eventId: string; tag: string; day: number }[];
  missions?: Mission[];
  /** per nation: completed mission ids */
  missionsDone?: Record<string, string[]>;
  /** per nation: wars won / lost, for scoring and missions */
  record?: Record<string, { won: number; lost: number; battlesWon: number; battlesLost: number; conquered: number }>;
  /** dynasty name → renown and founding day */
  dynasties?: Record<string, { renown: number; founded: number }>;
  /** the player's history, kept for the whole game (the log only keeps the latest entries) */
  chronicle?: LogEntry[];
  /** scenario-level switches */
  options?: {
    /** unit types that can be produced (industrial rules); others need an unlock flag x.unlock_<type> */
    allowedUnits?: string[];
    /** art set: 'ww1', 'ww2', 'modern'… (defaults to the era) */
    artEra?: string;
    /** AI arms race: unlocks the military-AI research branch */
    aiRace?: boolean;
    /** every province of the map must have an owner at the start (contemporary world scenarios) */
    fullWorld?: boolean;
  };
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
  | { type: 'stop'; armyId: string }
  | { type: 'merge'; armyIds: string[] }
  | { type: 'disband'; armyId: string }
  | { type: 'declareWar'; target: string; goal?: string | null }
  | { type: 'offerPeace'; warId: string; target: string; provinces: string[]; gold: number; extra: string | null }
  | { type: 'answerPeace'; offerId: string; accept: boolean }
  | { type: 'proposeAlliance'; target: string }
  | { type: 'breakAlliance'; target: string }
  | { type: 'improveRelations'; target: string }
  | { type: 'eventChoice'; eventId: string; option: number }
  | { type: 'claimMission'; id: string }
  | { type: 'action'; id: string; args: Record<string, string | number> };
