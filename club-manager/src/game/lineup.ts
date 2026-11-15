import type { Club, GameState, Player, Pos } from './types';
import { FORMATIONS } from './tactics';
import { available, ovr, slotRating } from './player';

export function clubPlayers(gs: GameState, clubId: string, includeYouth = false): Player[] {
  const out: Player[] = [];
  for (const id in gs.players) { const p = gs.players[id]; if (p.clubId === clubId && (includeYouth || !p.youth)) out.push(p); }
  return out;
}

const fitFactor = (p: Player) => 0.6 + 0.4 * (p.fitness / 100);

/** Best XI for a formation plus a bench of up to 9. */
export function autoPick(players: Player[], formation: string): { lineup: number[]; bench: number[] } {
  const slots = FORMATIONS[formation]?.slots ?? FORMATIONS['4-4-2'].slots;
  const pool = players.filter(available);
  const used = new Set<number>();
  const lineup: number[] = new Array(slots.length).fill(-1);
  const score = (p: Player, pos: Pos) => slotRating(p, pos) * fitFactor(p);
  // pass 1: natural positions, strongest first
  const order = slots.map((s, i) => i).sort((a, b) => (slots[a].pos === 'GK' ? -1 : 0) - (slots[b].pos === 'GK' ? -1 : 0));
  for (const i of order) {
    const cand = pool.filter(p => !used.has(p.id) && p.pos === slots[i].pos).sort((a, b) => score(b, slots[i].pos) - score(a, slots[i].pos));
    if (cand.length && cand[0].fitness > 55) { lineup[i] = cand[0].id; used.add(cand[0].id); }
  }
  // pass 2: fill remaining by best fit
  for (const i of order) {
    if (lineup[i] !== -1) continue;
    const cand = pool.filter(p => !used.has(p.id)).sort((a, b) => score(b, slots[i].pos) - score(a, slots[i].pos));
    if (cand.length) { lineup[i] = cand[0].id; used.add(cand[0].id); }
  }
  const rest = pool.filter(p => !used.has(p.id)).sort((a, b) => ovr(b) * fitFactor(b) - ovr(a) * fitFactor(a));
  const bench: number[] = [];
  const gk = rest.find(p => p.pos === 'GK');
  if (gk) bench.push(gk.id);
  for (const p of rest) { if (bench.length >= 9) break; if (!bench.includes(p.id) && p.pos !== 'GK') bench.push(p.id); }
  return { lineup: lineup.filter(x => x !== -1).length === slots.length ? lineup : lineup.map(x => x), bench };
}

/** Validate a human lineup: replace unavailable players by auto picks. Returns list of replaced names. */
export function ensureLineup(gs: GameState, club: Club): string[] {
  const players = clubPlayers(gs, club.id);
  const slots = FORMATIONS[club.tactics.formation].slots;
  const ok = (id: number) => { const p = gs.players[id]; return p && p.clubId === club.id && !p.youth && available(p); };
  const replaced: string[] = [];
  if (club.lineup.length !== slots.length) club.lineup = autoPick(players, club.tactics.formation).lineup;
  const used = new Set(club.lineup.filter(ok));
  for (let i = 0; i < slots.length; i++) {
    const id = club.lineup[i];
    if (id !== undefined && ok(id) && club.lineup.indexOf(id) === i) continue;
    if (id !== undefined && gs.players[id]) replaced.push(gs.players[id].name);
    const cand = players.filter(p => available(p) && !used.has(p.id)).sort((a, b) => slotRating(b, slots[i].pos) - slotRating(a, slots[i].pos));
    if (cand[0]) { club.lineup[i] = cand[0].id; used.add(cand[0].id); }
  }
  club.bench = club.bench.filter(id => ok(id) && !used.has(id)).slice(0, 9);
  if (club.bench.length < 7) {
    const rest = players.filter(p => available(p) && !used.has(p.id) && !club.bench.includes(p.id)).sort((a, b) => ovr(b) - ovr(a));
    for (const p of rest) { if (club.bench.length >= 9) break; club.bench.push(p.id); }
  }
  return replaced;
}
