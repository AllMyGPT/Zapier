import type { CupState, Fixture, GameState } from './types';
import { Rng } from './rng';

export const LEAGUE_START = 45; // ~15 Aug
export const leagueDay = (round: number) => LEAGUE_START + round * 7;
export const T2_DAY = (round: number) => LEAGUE_START + round * 14 + 1;
export const CUP_DAYS = [5, 10, 16, 23, 32].map(k => LEAGUE_START + k * 7 + 4);
export const CUP_ROUNDS = ['Primera ronda', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
export const EURO_GROUP_DAYS = [4, 6, 8, 10, 12, 14].map(k => LEAGUE_START + k * 7 + 3);
export const EURO_KO_DAYS: [number, number][] = [[20, 21], [25, 26], [29, 30]].map(([a, b]) => [LEAGUE_START + a * 7 + 3, LEAGUE_START + b * 7 + 3]);
export const EURO_FINAL_DAY = LEAGUE_START + 35 * 7 + 5;
export const EURO_ROUNDS = ['Fase de grupos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
export const SEASON_END_DAY = 330;
export const WINDOWS: [number, number][] = [[0, 62], [184, 214]];
export const inWindow = (day: number) => WINDOWS.some(([a, b]) => day >= a && day <= b);

export function roundRobin(ids: string[], rng: Rng): [string, string][][] {
  const t = rng.shuffle(ids.slice());
  if (t.length % 2) t.push('BYE');
  const n = t.length; const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const rd: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      if (a === 'BYE' || b === 'BYE') continue;
      rd.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(rd);
    t.splice(1, 0, t.pop()!);
  }
  return [...rounds, ...rounds.map(rd => rd.map(([a, b]) => [b, a] as [string, string]))];
}

export function addFixture(gs: GameState, f: Omit<Fixture, 'id'>) { const fx = { ...f, id: gs.nextId++ } as Fixture; gs.fixtures.push(fx); return fx; }

export function scheduleSeason(gs: GameState, rng: Rng, euroTeams: string[]) {
  gs.fixtures = [];
  gs.cups = {};
  for (const L of Object.values(gs.leagues)) {
    const rounds = roundRobin(L.clubIds, rng);
    rounds.forEach((rd, r) => rd.forEach(([h, a]) => addFixture(gs, { comp: L.id, round: r + 1, date: L.tier === 1 ? leagueDay(r) : T2_DAY(r), home: h, away: a })));
  }
  // domestic cups
  for (const country of ['esp', 'eng', 'ita', 'ger', 'fra']) {
    const ids = Object.values(gs.leagues).filter(l => l.country === country).flatMap(l => l.clubIds);
    const id = 'cup_' + country;
    gs.cups[id] = { id, name: CUP_NAME[country], country, stage: 0, rounds: CUP_ROUNDS, alive: ids.slice() };
    drawCupRound(gs, rng, id);
  }
  // european cup
  const groups: string[][] = Array.from({ length: 8 }, () => []);
  const pots = euroTeams.slice().sort((a, b) => gs.clubs[b].reputation - gs.clubs[a].reputation);
  for (let pot = 0; pot < 4; pot++) {
    const chunk = rng.shuffle(pots.slice(pot * 8, pot * 8 + 8));
    for (const c of chunk) {
      // avoid same country in group when possible
      const order = rng.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).sort((x, y) => groups[x].length - groups[y].length);
      const g = order.find(i => groups[i].length === pot && !groups[i].some(o => gs.clubs[o].country === gs.clubs[c].country)) ?? order.find(i => groups[i].length === pot)!;
      groups[g].push(c);
    }
  }
  gs.cups.euro = { id: 'euro', name: 'Copa de Campeones', stage: 0, rounds: EURO_ROUNDS, alive: euroTeams.slice(), groups };
  const pairs: [number, number][][] = [[[0, 1], [2, 3]], [[0, 2], [3, 1]], [[0, 3], [1, 2]], [[1, 0], [3, 2]], [[2, 0], [1, 3]], [[3, 0], [2, 1]]];
  groups.forEach((g, gi) => pairs.forEach((md, k) => md.forEach(([a, b]) => addFixture(gs, { comp: 'euro', round: k + 1, roundName: `Grupo ${'ABCDEFGH'[gi]} · J${k + 1}`, date: EURO_GROUP_DAYS[k], home: g[a], away: g[b] }))));
}

export const CUP_NAME: Record<string, string> = { esp: 'Copa Nacional (ESP)', eng: 'Copa Inglesa', ita: 'Copa Italiana', ger: 'Copa Alemana', fra: 'Copa Francesa' };

export function drawCupRound(gs: GameState, rng: Rng, cupId: string) {
  const cup = gs.cups[cupId];
  const st = cup.stage;
  let teams = rng.shuffle(cup.alive.slice());
  if (st === 0) {
    // reduce to 16: strongest get byes
    const matches = teams.length - 16;
    teams.sort((a, b) => gs.clubs[a].reputation - gs.clubs[b].reputation);
    const playing = rng.shuffle(teams.slice(0, matches * 2));
    for (let i = 0; i < playing.length; i += 2) addFixture(gs, { comp: cupId, round: 1, roundName: cup.rounds[0], date: CUP_DAYS[0], home: playing[i], away: playing[i + 1] });
    return;
  }
  for (let i = 0; i + 1 < teams.length; i += 2) addFixture(gs, { comp: cupId, round: st + 1, roundName: cup.rounds[st], date: CUP_DAYS[st], home: teams[i], away: teams[i + 1] });
}

export interface Row { id: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number; form: string[] }
export function table(gs: GameState, compId: string, clubIds?: string[]): Row[] {
  const ids = clubIds ?? gs.leagues[compId]?.clubIds ?? [];
  const rows: Record<string, Row> = {};
  for (const id of ids) rows[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  for (const f of gs.fixtures) {
    if (f.comp !== compId || !f.played || !rows[f.home] || !rows[f.away]) continue;
    if (compId === 'euro' && !f.roundName?.startsWith('Grupo')) continue;
    const h = rows[f.home], a = rows[f.away];
    h.p++; a.p++; h.gf += f.hg!; h.ga += f.ag!; a.gf += f.ag!; a.ga += f.hg!;
    if (f.hg! > f.ag!) { h.w++; a.l++; h.pts += 3; h.form.push('V'); a.form.push('D'); }
    else if (f.hg! < f.ag!) { a.w++; h.l++; a.pts += 3; a.form.push('V'); h.form.push('D'); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('E'); a.form.push('E'); }
  }
  return Object.values(rows).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || gs.clubs[y.id].reputation - gs.clubs[x.id].reputation);
}

export function dateLabel(season: number, day: number, withYear = true) {
  const d = new Date(Date.UTC(season, 6, 1 + day));
  const s = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
  return s;
}
export const seasonLabel = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;
export function compName(gs: GameState, comp: string) { return gs.leagues[comp]?.name ?? gs.cups[comp]?.name ?? comp; }
export type { CupState };
