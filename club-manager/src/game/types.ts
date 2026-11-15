import type { Pos } from '@/data/types';
export type { Pos };

export interface Attrs {
  pac: number; // velocidad
  sho: number; // remate
  pas: number; // pase
  dri: number; // regate / técnica
  def: number; // defensa / entrada
  hea: number; // juego aéreo
  sta: number; // resistencia
  gk: number;  // portería
}
export type AttrKey = keyof Attrs;

export interface SeasonStats {
  apps: number; goals: number; assists: number; cs: number; ratingSum: number; yel: number; red: number;
}

export interface Player {
  id: number;
  name: string;
  pos: Pos;
  born: number;
  nat: string;
  clubId: string | null;
  attrs: Attrs;
  pot: number;
  fitness: number;   // 0-100
  morale: number;    // 0-100
  form: number[];    // last ratings
  injury: number;    // days out
  injuryName?: string;
  susp: number;      // matches suspended
  yellows: number;   // accumulated yellow cards in league
  wage: number;      // € per week
  contractEnd: number; // season (year) in which contract ends (30 June)
  listed: boolean;   // transfer listed
  youth?: boolean;   // in youth academy
  generated?: boolean;
  stats: SeasonStats;
  history: { season: number; club: string; apps: number; goals: number; rating: number }[];
  num: number;       // shirt number
  loanFrom?: string;
  lastTalk?: number; // game day of the last one-to-one chat with the manager
  promise?: { until: number; apps: number }; // promised playing time: deadline day and apps at promise time
  startOvr?: number; // overall at the start of the season, to show progress
}

export type Mentality = -2 | -1 | 0 | 1 | 2;
export interface Tactics {
  formation: string;
  mentality: Mentality;
  pressing: 1 | 2 | 3;
  tempo: 1 | 2 | 3;
  width: 1 | 2 | 3;
  passing: 'corto' | 'mixto' | 'largo';
  offside: boolean;
  captain?: number;
  penalty?: number;
  freekick?: number;
  corner?: number;
}

export interface Staff { coach: number; gk: number; fitness: number; physio: number; scout: number; youth: number }

export interface Club {
  id: string;
  name: string;
  short: string;
  city: string;
  stadium: string;
  capacity: number;
  colors: [string, string];
  reputation: number;
  leagueId: string;     // e.g. 'esp1', 'esp2'
  country: string;      // league country id 'esp'
  balance: number;      // €
  transferBudget: number; // €
  ticketPrice: number;  // €
  fans: number;         // 0-100 fan mood
  staff: Staff;
  tactics: Tactics;
  lineup: number[];     // 11 ids, slot order of formation
  bench: number[];      // up to 9 ids
  expansion?: { daysLeft: number; seats: number };
  sponsor: { name: string; weekly: number; until: number };
  training: Training;
  cohesion: number;     // 0-100 tactical familiarity
  parentId?: string;    // reserve (B) team: id of its first team
}

export interface Training { intensity: 1 | 2 | 3; focus: 'general' | 'ataque' | 'defensa' | 'fisico' | 'tactica' | 'balon_parado' | 'descanso' }

export interface League {
  id: string; name: string; country: string; tier: 1 | 2 | 3; clubIds: string[];
  promote: number; relegate: number; euroSpots: number;
}

export interface Fixture {
  id: number;
  comp: string;        // league id, 'cup_esp', 'euro'
  round: number;
  roundName?: string;
  date: number;        // day index from game start
  home: string; away: string;
  hg?: number; ag?: number;
  pens?: [number, number];
  played?: boolean;
  scorers?: { pid: number; club: string; min: number }[];
  leg?: 1 | 2; tieId?: number;
}

export interface CupState {
  id: string; name: string; country?: string;
  stage: number;       // index into rounds
  rounds: string[];
  alive: string[];
  groups?: string[][];
  done?: boolean; winner?: string;
}

export interface NewsItem { id: number; date: number; title: string; body: string; read?: boolean; kind: 'board' | 'transfer' | 'injury' | 'match' | 'club' | 'youth' | 'info' }

export interface TransferOffer {
  id: number; playerId: number; fromClub: string; toClub: string; fee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'done' | 'contract';
  counter?: number; date: number; incoming: boolean; // incoming = offer received by user
}

export interface FinanceLog { date: number; label: string; amount: number }

export interface GameState {
  version: number;
  seed: number;
  manager: { name: string; clubId: string; reputation: number; board: number; history: { season: number; club: string; pos: number; league: string; trophies: string[] }[]; sacked?: boolean };
  season: number;      // starting year, e.g. 2026 for 2026/27
  day: number;         // days since 1 July of first season
  seasonStartDay: number;
  players: Record<number, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
  fixtures: Fixture[];
  cups: Record<string, CupState>;
  news: NewsItem[];
  offers: TransferOffer[];
  shortlist: number[];
  finance: FinanceLog[];
  nextId: number;
  trophies: { season: number; comp: string; club: string }[];
  lastResults?: number[];
  seasonSummary?: string[];
  objectives?: Objectives;
  pending?: Decision[]; // events waiting for the manager's decision
  eventLog?: Record<string, number>; // last day each decision kind fired (cooldowns)
  preseason?: { season: number; plan: string; results: { opp: string; gf: number; ga: number; home: boolean }[] };
}

/** Effects of a decision option (serialisable, applied by events.applyEffect). */
export interface Effect { board?: number; fans?: number; money?: number; teamMorale?: number; teamFitness?: number; pid?: number; morale?: number; wageMul?: number; listed?: boolean; sellTo?: string; fee?: number; extendYears?: number; budget?: number; news?: string; listTopWages?: number }
export interface Decision { id: number; date: number; kind: string; title: string; body: string; pid?: number; options: { label: string; hint: string; effect: Effect }[] }

/** Board objectives for the current season: league position, cup round reached and minimum balance. */
export interface Objectives { season: number; pos: number; cup: number; minBalance: number }
