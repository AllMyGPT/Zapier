import type { RawLeague } from '@/data/types';
import { LEAGUE as ESP } from '@/data/leagues/esp';
import { LEAGUE as ENG } from '@/data/leagues/eng';
import { LEAGUE as ITA } from '@/data/leagues/ita';
import { LEAGUE as GER } from '@/data/leagues/ger';
import { LEAGUE as FRA } from '@/data/leagues/fra';
import type { Club, GameState, League, Player, Pos } from './types';
import { Rng, hashStr } from './rng';
import { emptyStats, fairWage, genAttrs, modelValue } from './player';
import { genName, FOREIGN_NATS, SPONSORS } from './names';
import { autoPick, clubPlayers, withPlayerIndex } from './lineup';

export const RAW_LEAGUES: RawLeague[] = [ESP, ENG, ITA, GER, FRA];
export const EURO_SPOTS: Record<string, number> = { esp: 7, eng: 7, ita: 6, ger: 6, fra: 6 };
export const TV_WEEKLY: Record<string, number> = { esp: 1_400_000, eng: 2_600_000, ita: 1_100_000, ger: 1_100_000, fra: 800_000 };
/** Continental places of the big five when the rest of Europe is in the world too. */
export const EURO_SPOTS_WIDE: Record<string, [number, number]> = { eng: [5, 2], esp: [5, 2], ita: [4, 2], ger: [4, 2], fra: [3, 2] };

/** Nationality code used for generated players of a country (works with old saves too). */
export function natOf(gs: GameState, country: string): string {
  for (const l of Object.values(gs.leagues)) if (l.country === country && l.nat) return l.nat;
  return RAW_LEAGUES.find(l => l.id === country)?.nat ?? 'ESP';
}
/** Weekly TV base of a country's top flight. */
export function tvOf(gs: GameState, country: string): number {
  for (const l of Object.values(gs.leagues)) if (l.country === country && l.tier === 1 && l.tv) return l.tv;
  return TV_WEEKLY[country] ?? 150_000;
}
export const START_SEASON = 2026;
const POSITIONS: Pos[] = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];

export function newClub(raw: { id: string; name: string; short: string; city: string; stadium: string; capacity: number; colors: [string, string]; reputation: number; parent?: string; academy?: number }, leagueId: string, country: string, budgetM: number, rng: Rng): Club {
  const rep = raw.reputation;
  return {
    id: raw.id, name: raw.name, short: raw.short, city: raw.city, stadium: raw.stadium, capacity: raw.capacity, colors: raw.colors,
    reputation: rep, leagueId, country,
    balance: Math.round((5 + Math.pow(rep / 10, 3) * 0.12) * 1_000_000 / 100_000) * 100_000,
    transferBudget: Math.round(budgetM * 1_000_000),
    ticketPrice: Math.round(15 + Math.pow(rep / 100, 3) * 70),
    fans: 60,
    staff: (() => { const l = Math.max(1, Math.min(5, Math.round((rep - 50) / 10))); return { coach: l, gk: l, fitness: l, physio: l, scout: l, youth: l }; })(),
    tactics: { formation: rng.pick(['4-4-2', '4-3-3', '4-2-3-1', '4-3-3', '4-2-3-1', '3-5-2', '4-1-4-1']), mentality: 0, pressing: 2, tempo: 2, width: 2, passing: 'mixto', offside: true },
    lineup: [], bench: [],
    sponsor: { name: rng.pick(SPONSORS), weekly: Math.round(Math.pow(rep / 10, 3.2) * 360 / 1000) * 1000, until: START_SEASON + 2 },
    training: { intensity: 2, focus: 'general' },
    cohesion: 70,
    parentId: raw.parent,
    academy: raw.academy ?? (rep >= 88 ? 4 : rep >= 75 ? 3 : 2),
  };
}

export function makePlayer(gs: GameState, rng: Rng, o: { name: string; pos: Pos; born: number; nat: string; ovr: number; pot: number; clubId: string | null; rep: number; generated?: boolean; youth?: boolean; tmValue?: number; contractEnd?: number }): Player {
  const p: Player = {
    id: gs.nextId++, name: o.name, pos: o.pos, born: o.born, nat: o.nat, clubId: o.clubId,
    attrs: genAttrs(o.pos, o.ovr, rng), pot: Math.max(o.pot, o.ovr),
    fitness: 100, morale: 65 + rng.int(-5, 10), form: [], injury: 0, susp: 0, yellows: 0, wage: 0,
    contractEnd: gs.season + rng.int(1, 5), listed: false, stats: emptyStats(), history: [], num: 0,
    generated: o.generated, youth: o.youth,
  };
  p.wage = fairWage(p, gs.season, o.rep);
  p.startOvr = o.ovr;
  if (o.contractEnd && o.contractEnd > gs.season) p.contractEnd = o.contractEnd; // year the deal ends (30 June), same convention as the game
  if (o.tmValue) { p.tmValue = Math.round(o.tmValue * 1_000_000); p.tmRef = modelValue(p, gs.season); }
  gs.players[p.id] = p;
  return p;
}

export function genSquad(gs: GameState, rng: Rng, club: Club, nat: string, level: number) {
  const plan: Pos[] = ['GK', 'GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'LB', 'RB', 'RB', 'DM', 'DM', 'CM', 'CM', 'CM', 'AM', 'LW', 'RW', 'LW', 'ST', 'ST', 'ST'];
  const reserve = !!club.parentId; // B teams are young squads with more upside
  const elite = reserve && (gs.clubs[club.parentId!]?.academy ?? 0) >= 5;
  for (const pos of plan) {
    const age = reserve ? rng.int(18, 23) : rng.int(18, 34);
    const o = Math.round(level + rng.gauss(0, 3.5) - (age < 21 ? 4 : 0) - (age > 31 ? 2 : 0));
    const pot = age < 24 ? o + rng.int(2, reserve ? (elite ? 24 : 18) : 12) : o + rng.int(0, 2);
    makePlayer(gs, rng, { name: genName(nat, rng), pos, born: gs.season - age, nat: rng.chance(0.85) ? nat : rng.pick(FOREIGN_NATS), ovr: Math.max(48, o), pot, clubId: club.id, rep: club.reputation, generated: true });
  }
}

export function assignNumbers(gs: GameState, clubId: string) {
  const ps = clubPlayers(gs, clubId);
  const used = new Set<number>();
  const pref: Record<Pos, number[]> = { GK: [1, 13, 25, 31], CB: [4, 5, 3, 15, 24], LB: [3, 12, 18], RB: [2, 22, 20], DM: [6, 16, 14], CM: [8, 6, 14, 16], AM: [10, 8, 21], LW: [11, 7, 17], RW: [7, 11, 19], ST: [9, 19, 23, 29] };
  ps.sort((a, b) => b.attrs.sho + b.attrs.pas - a.attrs.sho - a.attrs.pas);
  for (const p of ps) if (p.num && !used.has(p.num)) used.add(p.num); else p.num = 0;
  for (const p of ps) {
    if (p.num) continue;
    const n = pref[p.pos].find(x => !used.has(x)) ?? Array.from({ length: 99 }, (_, i) => i + 1).find(x => !used.has(x))!;
    p.num = n; used.add(n);
  }
}

export function createWorld(managerName: string, seed = Date.now() % 1e9, extra: RawLeague[] = []): GameState {
  const rng = new Rng(seed);
  const gs: GameState = {
    version: 1, seed, manager: { name: managerName, clubId: '', reputation: 50, board: 60, history: [] },
    season: START_SEASON, day: 0, seasonStartDay: 0, players: {}, clubs: {}, leagues: {}, fixtures: [], cups: {}, news: [], offers: [], shortlist: [], finance: [], nextId: 1, trophies: [],
  };
  const wideEurope = extra.some(l => (l.continent ?? 'eu') === 'eu');
  for (const L of [...RAW_LEAGUES, ...extra]) {
    const spots: [number, number] = L.euro ?? (wideEurope ? EURO_SPOTS_WIDE[L.id] : undefined) ?? [EURO_SPOTS[L.id] ?? 0, EURO_SPOTS[L.id] ?? 0];
    const l1: League = {
      id: L.id + '1', name: L.name, country: L.id, tier: 1, clubIds: [], promote: 0, relegate: L.tier2.length ? 3 : 0,
      euroSpots: spots[0], euro2Spots: spots[1], nat: L.nat, countryName: L.country, continent: L.continent ?? 'eu',
      tv: L.tv ?? TV_WEEKLY[L.id], legs: L.clubs.length > 24 ? 1 : 2,
    };
    const l2: League = { id: L.id + '2', name: L.tier2Name, country: L.id, tier: 2, clubIds: [], promote: 3, relegate: 0, euroSpots: 0, nat: L.nat, countryName: L.country, continent: L.continent ?? 'eu' };
    gs.leagues[l1.id] = l1; if (L.tier2.length) gs.leagues[l2.id] = l2;
    for (const rc of L.clubs) {
      const club = newClub(rc, l1.id, L.id, rc.budget, rng);
      gs.clubs[club.id] = club; l1.clubIds.push(club.id);
      for (const line of rc.players.split('\n')) {
        const parts = line.trim().split('|');
        if (parts.length < 6) continue;
        const [name, pos, born, nat, o, pot, mv, ct] = parts;
        if (!POSITIONS.includes(pos as Pos)) continue;
        const prng = new Rng(hashStr(name + rc.id) ^ seed);
        makePlayer(gs, prng, { name, pos: pos as Pos, born: +born, nat, ovr: +o, pot: +pot, clubId: club.id, rep: club.reputation, tmValue: mv ? +mv : undefined, contractEnd: ct ? +ct : undefined });
      }
    }
    for (const rc of L.tier2) {
      const club = newClub(rc, l2.id, L.id, 2 + rc.reputation / 20, rng);
      gs.clubs[club.id] = club; l2.clubIds.push(club.id);
      genSquad(gs, rng, club, L.nat, 62 + (rc.reputation - 55) * 0.4);
    }
    if (L.tier3) {
      l2.relegate = 4; // Segunda sends four down when there is a third tier
      L.tier3.groups.forEach((g, gi) => {
        const l3: League = { id: L.id + '3' + 'abcdefgh'[gi], name: `${L.tier3!.name} · ${g.name}`, country: L.id, tier: 3, clubIds: [], promote: 2, relegate: 0, euroSpots: 0, nat: L.nat, countryName: L.country, continent: L.continent ?? 'eu' };
        gs.leagues[l3.id] = l3;
        for (const rc of g.clubs) {
          const club = newClub(rc, l3.id, L.id, 0.5 + rc.reputation / 40, rng);
          gs.clubs[club.id] = club; l3.clubIds.push(club.id);
          genSquad(gs, rng, club, L.nat, 55 + (rc.reputation - 48) * 0.45);
        }
      });
    }
  }
  // free agents pool
  for (let i = 0; i < 60; i++) {
    const nat = rng.pick(['ESP', 'ENG', 'ITA', 'GER', 'FRA', ...FOREIGN_NATS]);
    const age = rng.int(19, 33);
    makePlayer(gs, rng, { name: genName(['ESP', 'ENG', 'ITA', 'GER', 'FRA'].includes(nat) ? nat : rng.pick(['ESP', 'FRA', 'ITA']), rng), pos: rng.pick(POSITIONS), born: gs.season - age, nat, ovr: rng.int(55, 70), pot: rng.int(60, 74), clubId: null, rep: 60, generated: true });
  }
  withPlayerIndex(gs, () => {
    for (const c of Object.values(gs.clubs)) {
      assignNumbers(gs, c.id);
      const pick = autoPick(clubPlayers(gs, c.id, true), c.tactics.formation);
      c.lineup = pick.lineup; c.bench = pick.bench;
    }
  });
  return gs;
}

export function leagueOf(gs: GameState, clubId: string) { return gs.leagues[gs.clubs[clubId].leagueId]; }
