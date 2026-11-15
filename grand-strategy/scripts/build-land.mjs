// Builds public/geo/land-earth.json: Natural Earth 1:50m land (public domain, via world-atlas),
// projected with the game's projection, clipped to the playable box and simplified.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const SCALE = 22;
const project = (lon, lat) => [lon * SCALE * 0.72, -lat * SCALE];
// same box as src/lib/geometry.ts (province extent ± 4°) plus a margin
// usage: node scripts/build-land.mjs [earth|world]
const MAP = process.argv[2] ?? 'earth';
const BOX = MAP === 'world' ? { lo0: -180, lo1: 180, la0: -56, la1: 82 } : { lo0: -112, lo1: 70, la0: -26, la1: 76 };

function clip(ring) {
  const edges = [
    (p) => p[0] >= BOX.lo0, (p) => p[0] <= BOX.lo1, (p) => p[1] >= BOX.la0, (p) => p[1] <= BOX.la1,
  ];
  const inter = (a, b, k) => {
    const v = [BOX.lo0, BOX.lo1, BOX.la0, BOX.la1][k], axis = k < 2 ? 0 : 1;
    const t = (v - a[axis]) / (b[axis] - a[axis]);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  let out = ring;
  edges.forEach((inside, k) => {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i], prev = inp[(i + inp.length - 1) % inp.length];
      if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur, k)); out.push(cur); }
      else if (inside(prev)) out.push(inter(prev, cur, k));
    }
  });
  return out;
}
function unwrap(ring) {
  const out = [ring[0]];
  for (const [lo, la] of ring.slice(1)) {
    const prev = out[out.length - 1][0];
    let x = lo;
    while (x - prev > 180) x -= 360;
    while (prev - x > 180) x += 360;
    out.push([x, la]);
  }
  return out;
}
function simplify(ring, tol) {
  const out = [ring[0]];
  for (const p of ring.slice(1)) { const q = out[out.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= tol) out.push(p); }
  return out;
}
let d = '', pts = 0;
const rings = [];
for (const f of land.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) for (const raw of poly) for (const off of [0, -360, 360]) {
    // rings cut by the antimeridian (Chukotka) are unwrapped and clipped once per copy of the world
    const ring = unwrap(raw).map(([lo, la]) => [lo + off, la]);
    if (off && !ring.some(([lo]) => lo < BOX.lo0 || lo > BOX.lo1)) continue;
    let r = clip(ring);
    if (r.length < 3) continue;
    r = simplify(r, 0.1);
    if (r.length < 3) continue;
    const pr = r.map(([lo, la]) => project(lo, la));
    // drop specks
    let a = 0; for (let i = 0; i < pr.length; i++) { const [x1, y1] = pr[i], [x2, y2] = pr[(i + 1) % pr.length]; a += x1 * y2 - x2 * y1; }
    if (Math.abs(a / 2) < 6) continue;
    rings.push(r);
    d += 'M' + pr.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`).join('L') + 'Z';
    pts += pr.length;
  }
}
// provinces whose centre falls outside the coastline data (small islands) get a disc so they stay visible
const src = readFileSync('src/data/provinces.ts', 'utf8') + (MAP === 'world' ? readFileSync('src/data/provinces_world.ts', 'utf8') : '');
const provs = [...src.matchAll(/\['([a-z_]+)', '[^']+', (-?[\d.]+), (-?[\d.]+)/g)].map((m) => ({ id: m[1], lon: +m[2], lat: +m[3] }));
const inside = (pt, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
const islands = provs.filter((p) => !rings.some((r) => inside([p.lon, p.lat], r))).map((p) => p.id);
writeFileSync(`public/geo/land-${MAP}.json`, JSON.stringify({ source: 'Natural Earth 1:50m land (public domain) via world-atlas', islands, d }));
console.log('islands', islands.join(' '));
console.log('points', pts, 'bytes', d.length);
