import { MAPS } from '@/data/maps';
import type { GameState } from './types';

export interface Edge { to: string; sea: boolean; cost: number }

const LAND_LINK_FACTOR = 1.75;
const SEA_LANE_MAX = 11; // degrees
const kx = (lat: number) => Math.cos((lat * Math.PI) / 180);

export function distance(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
  const dx = (a.lon - b.lon) * kx((a.lat + b.lat) / 2);
  const dy = a.lat - b.lat;
  return Math.hypot(dx, dy);
}

const cache: Record<string, Record<string, Edge[]>> = {};

/**
 * Adjacency graph. Land links connect each province to nearby provinces of the same landmass
 * (relative-nearest-neighbour rule), straits are explicit, and coastal provinces get slower sea lanes.
 */
export function adjacency(mapId = 'earth'): Record<string, Edge[]> {
  if (cache[mapId]) return cache[mapId];
  const def = MAPS[mapId];
  const pts = def.rows.map(([id, , lon, lat, , landmass, coastal]) => ({ id, lon, lat, landmass, coastal: !!coastal }));
  const g: Record<string, Edge[]> = {};
  for (const p of pts) g[p.id] = [];
  const add = (a: string, b: string, sea: boolean, cost: number) => {
    if (a === b || g[a].some((e) => e.to === b)) return;
    g[a].push({ to: b, sea, cost });
    g[b].push({ to: a, sea, cost });
  };
  for (const a of pts) {
    const same = pts.filter((b) => b.id !== a.id && b.landmass === a.landmass).map((b) => ({ b, d: distance(a, b) }));
    same.sort((u, v) => u.d - v.d);
    if (!same.length) continue;
    const nn = same[0].d;
    for (const { b, d } of same) {
      if (d > nn * LAND_LINK_FACTOR && d > 2.6) break;
      // Gabriel-like test: skip if another province sits between a and b.
      const mid = { lon: (a.lon + b.lon) / 2, lat: (a.lat + b.lat) / 2 };
      const blocked = pts.some((c) => c.id !== a.id && c.id !== b.id && c.landmass === a.landmass && distance(c, mid) < d / 2 * 0.92);
      if (!blocked && d < 9) add(a.id, b.id, false, d);
    }
  }
  for (const [a, b] of def.straits) {
    const pa = pts.find((p) => p.id === a)!, pb = pts.find((p) => p.id === b)!;
    add(a, b, false, distance(pa, pb) + 0.5);
  }
  // sea lanes between coasts
  const coasts = pts.filter((p) => p.coastal);
  for (const a of coasts) {
    const near = coasts
      .filter((b) => b.id !== a.id && !g[a.id].some((e) => e.to === b.id))
      .map((b) => ({ b, d: distance(a, b) }))
      .filter((x) => x.d <= SEA_LANE_MAX || (a.landmass !== 'eu' && x.d <= 30))
      .sort((u, v) => u.d - v.d)
      .slice(0, a.landmass === 'eu' ? 3 : 4);
    for (const { b, d } of near) add(a.id, b.id, true, d * 1.6 + 2);
  }
  // transatlantic lanes (Azores / Canarias / Cabo Verde hubs)
  for (const [a, b] of def.lanes) {
    const pa = pts.find((p) => p.id === a)!, pb = pts.find((p) => p.id === b)!;
    add(a, b, true, distance(pa, pb) * 1.2);
  }
  cache[mapId] = g;
  return g;
}

export const neighbours = (s: { mapId: string }, id: string) => adjacency(s.mapId)[id] ?? [];

/** Dijkstra over the adjacency graph honouring a passability predicate. */
export function findPath(
  s: GameState,
  from: string,
  to: string,
  canEnter: (pid: string) => boolean,
  allowSea = true,
): string[] | null {
  if (from === to) return [];
  const dist: Record<string, number> = { [from]: 0 };
  const prev: Record<string, string> = {};
  const open = new Set([from]);
  while (open.size) {
    let cur = '';
    let best = Infinity;
    for (const o of open) if (dist[o] < best) { best = dist[o]; cur = o; }
    open.delete(cur);
    if (cur === to) break;
    for (const e of neighbours(s, cur)) {
      if (e.sea && !allowSea) continue;
      if (e.to !== to && !canEnter(e.to)) continue;
      if (e.to === to && !canEnter(e.to)) return null;
      const nd = best + e.cost * terrainCost(s.provinces[e.to]?.terrain);
      if (nd < (dist[e.to] ?? Infinity)) { dist[e.to] = nd; prev[e.to] = cur; open.add(e.to); }
    }
  }
  if (dist[to] === undefined) return null;
  const path: string[] = [];
  for (let c = to; c !== from; c = prev[c]) path.unshift(c);
  return path;
}

export function terrainCost(t?: string): number {
  return t === 'm' ? 1.8 : t === 'w' || t === 'j' ? 1.5 : t === 'f' || t === 'h' ? 1.3 : t === 'd' ? 1.2 : 1;
}
export function terrainDefence(t?: string): number {
  return t === 'm' ? 1.5 : t === 'h' ? 1.25 : t === 'f' || t === 'w' || t === 'j' ? 1.15 : 1;
}
export function edgeBetween(s: { mapId: string }, a: string, b: string): Edge | undefined {
  return neighbours(s, a).find((e) => e.to === b);
}
