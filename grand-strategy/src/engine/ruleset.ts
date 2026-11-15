import type { Army, Era, GameState, Nation, Province, Unit } from './types';

export interface UnitType {
  id: string;
  name: string;
  attack: number;
  defence: number;
  speed: number; // multiplier on movement
  siege: number;
  cost: number; // gold / IC-days
  manpower: number;
  upkeep: number; // per month
  buildDays: number;
  size: number; // men represented at full strength (display only)
}

export interface ActionArg {
  key: string;
  label: string;
  kind: 'nation' | 'province' | 'character' | 'unit' | 'choice' | 'number';
  options?: { value: string; label: string }[];
}

export interface ActionDef {
  id: string;
  label: string;
  group: string;
  description: string;
  args?: ActionArg[];
  scope?: 'nation' | 'province'; // province actions appear in the province panel (arg "province")
  available?: (s: GameState, tag: string, args?: Record<string, string | number>) => string | true; // true or reason
  cost?: (s: GameState, tag: string, args?: Record<string, string | number>) => string;
  run: (s: GameState, tag: string, args: Record<string, string | number>) => void;
}

export interface Stat { label: string; value: string; hint?: string }
export interface Panel { id: string; title: string; render: 'stats' | 'list' | 'queue' | 'characters' | 'sliders'; }

export interface Ruleset {
  era: Era;
  name: string;
  unitTypes: Record<string, UnitType>;
  moveBaseDays: number; // days per degree of distance
  siegeBaseDays: number;
  actions: ActionDef[];
  /** called once when a scenario is instantiated */
  init(s: GameState): void;
  daily(s: GameState): void;
  monthly(s: GameState): void;
  yearly(s: GameState): void;
  /** AI decisions for one nation, once a month */
  ai(s: GameState, n: Nation): void;
  combatMultiplier(s: GameState, army: Army, unit: Unit, attacking: boolean): number;
  /** value of a province in peace deals */
  provinceValue(s: GameState, p: Province): number;
  topBar(s: GameState, tag: string): Stat[];
  nationStats(s: GameState, tag: string): Stat[];
  provinceStats(s: GameState, p: Province): Stat[];
  mapModes: { id: string; label: string; color: (s: GameState, p: Province) => string }[];
  peaceExtras: { id: string; label: string; cost: number }[];
  onPeaceExtra?(s: GameState, winner: string, loser: string, extra: string): void;
  onWarDeclared?(s: GameState, attacker: string, defender: string, goal: string | null): void;
  onProvinceCaptured?(s: GameState, p: Province, by: string): void;
  /** for WW2 capitulation; returns true if the nation should surrender */
  shouldCapitulate?(s: GameState, tag: string): boolean;
  victory?(s: GameState): string | null;
  /** may this AI nation start a war against target? (goal = casus belli province or null) */
  aiMayDeclare?(s: GameState, n: Nation, target: string, goal: string | null): boolean;
}
