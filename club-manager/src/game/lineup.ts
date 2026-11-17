import type { Club, GameState, Player, Pos } from './types';
import { FORMATIONS } from './tactics';
import { available, ovr, slotRating } from './player';

/** Optional per-club index used during batch work where no player changes club (match days, finance). */
let index: { gs: GameState; by: Map<string, Player[]> } | null = null;
export function withPlayerIndex<T>(gs: GameState, fn: () => T): T {
  if (index) return fn();
  const by = new Map<string, Player[]>();
  for (const id in gs.players) { const p = gs.players[id]; if (!p.clubId) continue; let a = by.get(p.clubId); if (!a) by.set(p.clubId, a = []); a.push(p); }
  index = { gs, by };
  try { return fn(); } finally { index = null; }
}

export function clubPlayers(gs: GameState, clubId: string, includeYouth = false): Player[] {
  if (index && index.gs === gs) { const a = index.by.get(clubId) ?? []; return includeYouth ? a.slice() : a.filter(p => !p.youth); }
  const out: Player[] = [];
  for (const id in gs.players) { const p = gs.players[id]; if (p.clubId === clubId && (includeYouth || !p.youth)) out.push(p); }
  return out;
}

const fitFactor = (p: Player) => 0.6 + 0.4 * (p.fitness / 100);

/** Undisputed starter toggle (max 6 per club). */
export const MAX_FIXED = 6;
export function toggleFixed(club: Club, pid: number): string {
  const f = club.fixed ?? [];
  if (f.includes(pid)) { club.fixed = f.filter(x => x !== pid); return 'Ya no es titular indiscutible.'; }
  if (f.length >= MAX_FIXED) return `Máximo ${MAX_FIXED} titulares indiscutibles.`;
  club.fixed = [...f, pid]; return 'Titular indiscutible: jugará siempre que esté disponible.';
}

/** Youth and reserve players the manager called up for the next match (max 3). */
export function callupPlayers(gs: GameState, club: Club): Player[] {
  return (club.callups ?? []).map(id => gs.players[id]).filter((p): p is Player => !!p);
}

/** Best XI for a formation plus a bench of up to 9. `fixed` = undisputed starters: they always start
 *  when available, whatever their fitness, in their own position or the slot that suits them best. */
export function autoPick(players: Player[], formation: string, fixed: number[] = []): { lineup: number[]; bench: number[] } {
  const slots = FORMATIONS[formation]?.slots ?? FORMATIONS['4-4-2'].slots;
  const pool = players.filter(available);
  const used = new Set<number>();
  const lineup: number[] = new Array(slots.length).fill(-1);
  const score = (p: Player, pos: Pos) => slotRating(p, pos) * fitFactor(p);
  // pass 0: undisputed starters
  const locked = pool.filter(p => fixed.includes(p.id)).sort((a, b) => ovr(b) - ovr(a));
  for (const p of locked) {
    const free = slots.map((s, i) => i).filter(i => lineup[i] === -1 && (p.pos === 'GK') === (slots[i].pos === 'GK'));
    const i = free.find(k => slots[k].pos === p.pos) ?? free.sort((a, b) => slotRating(p, slots[b].pos) - slotRating(p, slots[a].pos))[0];
    if (i != null) { lineup[i] = p.id; used.add(p.id); }
  }
  // pass 1: natural positions, strongest first
  const order = slots.map((s, i) => i).sort((a, b) => (slots[a].pos === 'GK' ? -1 : 0) - (slots[b].pos === 'GK' ? -1 : 0));
  for (const i of order) {
    if (lineup[i] !== -1) continue;
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
  const called = callupPlayers(gs, club);
  const calledIds = new Set(called.map(p => p.id));
  const players = [...clubPlayers(gs, club.id), ...called];
  const slots = FORMATIONS[club.tactics.formation].slots;
  const ok = (id: number) => { const p = gs.players[id]; return !!p && available(p) && (calledIds.has(id) || (p.clubId === club.id && !p.youth)); };
  const replaced: string[] = [];
  if (club.lineup.length !== slots.length) club.lineup = autoPick(players, club.tactics.formation, club.fixed).lineup;
  const used = new Set(club.lineup.filter(ok));
  for (let i = 0; i < slots.length; i++) {
    const id = club.lineup[i];
    if (id !== undefined && ok(id) && club.lineup.indexOf(id) === i) continue;
    if (id !== undefined && gs.players[id]) replaced.push(gs.players[id].name);
    const cand = players.filter(p => available(p) && !used.has(p.id)).sort((a, b) => slotRating(b, slots[i].pos) - slotRating(a, slots[i].pos));
    if (cand[0]) { club.lineup[i] = cand[0].id; used.add(cand[0].id); }
  }
  // undisputed starters who are fit again go straight back into the XI
  for (const fid of club.fixed ?? []) {
    if (!ok(fid) || used.has(fid)) continue;
    const p = gs.players[fid];
    const cands = slots.map((s, i) => i).filter(i => !(club.fixed ?? []).includes(club.lineup[i]) && (p.pos === 'GK') === (slots[i].pos === 'GK'));
    const i = cands.find(k => slots[k].pos === p.pos) ?? cands.sort((a, b) => slotRating(p, slots[b].pos) - slotRating(p, slots[a].pos))[0];
    if (i == null) continue;
    used.delete(club.lineup[i]); club.lineup[i] = fid; used.add(fid);
  }
  club.bench = club.bench.filter(id => ok(id) && !used.has(id)).slice(0, 9);
  // called-up youngsters always travel with the squad
  for (const p of called) if (available(p) && !used.has(p.id) && !club.bench.includes(p.id)) club.bench.unshift(p.id);
  club.bench = club.bench.slice(0, 9);
  if (club.bench.length < 7) {
    const rest = players.filter(p => available(p) && !used.has(p.id) && !club.bench.includes(p.id)).sort((a, b) => ovr(b) - ovr(a));
    for (const p of rest) { if (club.bench.length >= 9) break; club.bench.push(p.id); }
  }
  return replaced;
}
