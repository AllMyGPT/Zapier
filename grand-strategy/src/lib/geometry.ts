import { Delaunay } from 'd3-delaunay';
import { MAPS } from '@/data/maps';
import { distance } from '@/engine/map';
import { LAND_MASK_WORLD } from '@/data/landmask_world';
import type { Terrain } from '@/data/provinces';

type Pt = [number, number];

/** A border segment between two cells (b = null → coastline). Points run from one Voronoi vertex to the other, with organic noise. */
export interface MapEdge { a: string; b: string | null; pts: Pt[]; d: string }

export interface MapGeometry {
  width: number; height: number; minX: number; minY: number;
  cells: Record<string, string>;
  centers: Record<string, Pt>;
  /** visual centre (centroid of the cell polygon) — better for labels than the seed */
  centroids: Record<string, Pt>;
  areas: Record<string, number>;
  edges: MapEdge[];
  /** province → neighbouring provinces that share a drawn border */
  touches: Record<string, string[]>;
  /** all land cells in one path (for coast halos) */
  land: string;
  /** terrain glyph positions, generated once per map */
  glyphs: { t: Terrain; x: number; y: number; s: number; v: number }[];
}

const SCALE = 22;
export const project = (lon: number, lat: number): Pt => [lon * SCALE * 0.72, -lat * SCALE];

const cache: Record<string, MapGeometry> = {};

/** true when a point lies on land in the world map's 1° mask (sea seeds must not be placed there) */
const landWorld = (lon: number, lat: number) => {
  const M = LAND_MASK_WORLD;
  const c = Math.round(lon - M.lo0), r = Math.round(lat - M.la0);
  if (c < 0 || c >= M.cols || r < 0 || r >= M.rows) return false;
  const byte = parseInt(M.hex.substr((r * M.bytesPerRow + (c >> 3)) * 2, 2), 16);
  return ((byte >> (c & 7)) & 1) === 1;
};

/** deterministic hash → [0,1) */
function hash(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** midpoint displacement between a and b; endpoints fixed so neighbouring cells stay watertight */
function wiggle(a: Pt, b: Pt, key: string, rough: number, depth: number): Pt[] {
  const out: Pt[] = [a];
  const rec = (p: Pt, q: Pt, d: number, k: string) => {
    if (d === 0) { out.push(q); return; }
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (len < 2.2) { out.push(q); return; }
    const off = (hash(k) - 0.5) * 2 * rough * len;
    const nx = -(q[1] - p[1]) / len, ny = (q[0] - p[0]) / len;
    const m: Pt = [(p[0] + q[0]) / 2 + nx * off, (p[1] + q[1]) / 2 + ny * off];
    rec(p, m, d - 1, k + 'l');
    rec(m, q, d - 1, k + 'r');
  };
  rec(a, b, depth, key);
  return out;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const vkey = (p: Pt) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
const toD = (pts: Pt[]) => 'M' + pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join('L');

function inside(pt: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Voronoi cells from province centres; synthetic "sea" seeds carve coastlines where provinces are sparse.
 *  Every shared edge gets deterministic noise so borders and coasts look hand-drawn instead of polygonal. */
export function geometry(mapId: string): MapGeometry {
  if (cache[mapId]) return cache[mapId];
  const rows = MAPS[mapId].rows;
  const pts = rows.map(([id, , lon, lat, terrain]) => ({ id, lon, lat, terrain }));
  const nn = pts.map((a) => Math.min(...pts.filter((b) => b !== a).map((b) => distance(a, b))));
  const lons = pts.map((p) => p.lon), lats = pts.map((p) => p.lat);
  const [lo0, lo1, la0, la1] = [Math.min(...lons) - 4, Math.max(...lons) + 4, Math.min(...lats) - 4, Math.max(...lats) + 4];
  const seeds: Pt[] = pts.map((p) => project(p.lon, p.lat));
  const step = 1.1;
  // a seed is placed when the nearest province is farther than at most 4.2°, so only provinces within 6° of
  // latitude can decide it: scan that band per row instead of every province for every point
  for (let lat = la0; lat <= la1; lat += step) {
    const band = pts.map((_, i) => i).filter((i) => Math.abs(pts[i].lat - lat) <= 6);
    for (let lon = lo0; lon <= lo1; lon += step / Math.cos((lat * Math.PI) / 180) * 0.8) {
      let best = Infinity, bi = 0;
      for (const i of band) { const d = distance(pts[i], { lon, lat }); if (d < best) { best = d; bi = i; } }
      // on the world map, land never gets a sea seed: every land point belongs to a province's cell
      if (best > Math.max(2.1, Math.min(4.2, nn[bi] * 0.8)) && !(mapId === 'world' && landWorld(lon, lat))) seeds.push(project(lon, lat));
    }
  }
  // open straits: a sea seed between nearby provinces of different landmasses keeps islands visibly separate
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = rows[i], b = rows[j];
      if (a[5] === b[5]) continue;
      const dij = distance(pts[i], pts[j]);
      if (dij > 5) continue;
      const mid = { lon: (pts[i].lon + pts[j].lon) / 2, lat: (pts[i].lat + pts[j].lat) / 2 };
      // skip if some other province sits on the midpoint (the two are not facing each other across water)
      if (pts.some((q, k) => k !== i && k !== j && distance(q, mid) < dij * 0.45)) continue;
      seeds.push(project(mid.lon, mid.lat));
    }
  }
  const [x0, y1] = project(lo0, la0), [x1, y0] = project(lo1, la1);
  const vor = Delaunay.from(seeds).voronoi([x0, y0, x1, y1]);
  const n = pts.length;

  // 1. collect raw polygons and which land cells use each edge
  const polys: Pt[][] = [];
  const owners: Record<string, number[]> = {};
  for (let i = 0; i < n; i++) {
    const poly = (vor.cellPolygon(i) ?? []).slice(0, -1) as Pt[];
    polys.push(poly);
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length];
      const ka = vkey(a), kb = vkey(b);
      const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      (owners[key] ??= []).push(i);
    }
  }
  const onBox = (p: Pt) => Math.abs(p[0] - x0) < 0.01 || Math.abs(p[0] - x1) < 0.01 || Math.abs(p[1] - y0) < 0.01 || Math.abs(p[1] - y1) < 0.01;

  // 2. noisy version of every edge, stored in canonical direction
  const noisy: Record<string, Pt[]> = {};
  const edges: MapEdge[] = [];
  const touches: Record<string, string[]> = {};
  for (const p of pts) touches[p.id] = [];
  const canonical = (a: Pt, b: Pt) => { const ka = vkey(a), kb = vkey(b); return ka < kb ? { key: `${ka}|${kb}`, from: a, to: b, flip: false } : { key: `${kb}|${ka}`, from: b, to: a, flip: true }; };
  const edgePts = (a: Pt, b: Pt) => {
    const c = canonical(a, b);
    if (!noisy[c.key]) {
      const coast = (owners[c.key]?.length ?? 0) < 2;
      noisy[c.key] = onBox(c.from) && onBox(c.to) ? [c.from, c.to] : wiggle(c.from, c.to, c.key, coast ? 0.26 : 0.17, coast ? 4 : 3);
    }
    return c.flip ? [...noisy[c.key]].reverse() : noisy[c.key];
  };

  const cells: Record<string, string> = {}, centers: Record<string, Pt> = {}, centroids: Record<string, Pt> = {}, areas: Record<string, number> = {};
  pts.forEach((p, i) => {
    const poly = polys[i];
    const ring: Pt[] = [];
    for (let k = 0; k < poly.length; k++) {
      const seg = edgePts(poly[k], poly[(k + 1) % poly.length]);
      ring.push(...seg.slice(0, -1));
    }
    cells[p.id] = toD(ring) + 'Z';
    centers[p.id] = seeds[i];
    // polygon centroid
    let A = 0, cx = 0, cy = 0;
    for (let k = 0; k < poly.length; k++) {
      const [ax, ay] = poly[k], [bx, by] = poly[(k + 1) % poly.length];
      const f = ax * by - bx * ay; A += f; cx += (ax + bx) * f; cy += (ay + by) * f;
    }
    A /= 2;
    centroids[p.id] = A ? [(cx / (6 * A) + seeds[i][0]) / 2, (cy / (6 * A) + seeds[i][1]) / 2] : seeds[i];
    areas[p.id] = Math.abs(A);
  });

  for (const [key, list] of Object.entries(owners)) {
    const [ka, kb] = key.split('|');
    const a = ka.split(',').map(Number) as Pt, b = kb.split(',').map(Number) as Pt;
    const ptsE = noisy[key] ?? edgePts(a, b);
    const i = list[0], j = list[1];
    const A = pts[i].id, B = j !== undefined ? pts[j].id : null;
    if (onBox(a) && onBox(b)) continue;
    edges.push({ a: A, b: B, pts: ptsE, d: toD(ptsE) });
    if (B) { touches[A].push(B); touches[B].push(A); }
  }

  // 3. terrain glyphs: jittered grid inside each cell, density by terrain
  const glyphs: MapGeometry['glyphs'] = [];
  const spacing: Record<Terrain, number> = { m: 7, h: 9, f: 6, j: 5.5, w: 8, d: 10, p: 15 };
  pts.forEach((p, i) => {
    const poly = polys[i];
    const sp = spacing[p.terrain as Terrain] ?? 12;
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const [mx0, mx1, my0, my1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    for (let y = my0 + sp / 2; y < my1; y += sp * 0.8) {
      for (let x = mx0 + sp / 2; x < mx1; x += sp) {
        const k = `${p.id}${Math.round(x)}${Math.round(y)}`;
        const gx = x + (hash(k, 1) - 0.5) * sp * 0.8, gy = y + (hash(k, 2) - 0.5) * sp * 0.6;
        if (!inside([gx, gy], poly)) continue;
        // keep glyphs away from the edges so borders stay crisp
        const c = seeds[i];
        const shrink: Pt = [c[0] + (gx - c[0]) * 1.18, c[1] + (gy - c[1]) * 1.18];
        if (!inside(shrink, poly)) continue;
        if (p.terrain === 'p' && hash(k, 3) > 0.45) continue;
        glyphs.push({ t: p.terrain as Terrain, x: r2(gx), y: r2(gy), s: 0.75 + hash(k, 4) * 0.5, v: hash(k, 5) });
      }
    }
  });

  const g: MapGeometry = {
    width: x1 - x0, height: y1 - y0, minX: x0, minY: y0,
    cells, centers, centroids, areas, edges, touches,
    land: Object.values(cells).join(''), glyphs,
  };
  cache[mapId] = g;
  return g;
}

/** connected groups of provinces (by shared border) */
export function components(ids: string[], touches: Record<string, string[]>): string[][] {
  const set = new Set(ids), seen = new Set<string>(), out: string[][] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const comp: string[] = [], stack = [id];
    seen.add(id);
    while (stack.length) {
      const c = stack.pop()!;
      comp.push(c);
      for (const nb of touches[c] ?? []) if (set.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
    }
    out.push(comp);
  }
  return out.sort((a, b) => b.length - a.length);
}
