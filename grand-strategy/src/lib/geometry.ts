import { Delaunay } from 'd3-delaunay';
import { MAPS } from '@/data/maps';
import { distance } from '@/engine/map';

export interface MapGeometry { width: number; height: number; cells: Record<string, string>; centers: Record<string, [number, number]>; minX: number; minY: number }

const SCALE = 22;
export const project = (lon: number, lat: number): [number, number] => [lon * SCALE * 0.72, -lat * SCALE];

const cache: Record<string, MapGeometry> = {};

/** Voronoi cells from province centres; synthetic "sea" seeds carve coastlines where provinces are sparse. */
export function geometry(mapId: string): MapGeometry {
  if (cache[mapId]) return cache[mapId];
  const rows = MAPS[mapId].rows;
  const pts = rows.map(([id, , lon, lat]) => ({ id, lon, lat }));
  const nn = pts.map((a) => Math.min(...pts.filter((b) => b !== a).map((b) => distance(a, b))));
  const lons = pts.map((p) => p.lon), lats = pts.map((p) => p.lat);
  const [lo0, lo1, la0, la1] = [Math.min(...lons) - 4, Math.max(...lons) + 4, Math.min(...lats) - 4, Math.max(...lats) + 4];
  const seeds: [number, number][] = pts.map((p) => project(p.lon, p.lat));
  const step = 1.1;
  for (let lat = la0; lat <= la1; lat += step) {
    for (let lon = lo0; lon <= lo1; lon += step / Math.cos((lat * Math.PI) / 180) * 0.8) {
      let best = Infinity, bi = 0;
      for (let i = 0; i < pts.length; i++) { const d = distance(pts[i], { lon, lat }); if (d < best) { best = d; bi = i; } }
      if (best > Math.max(2.1, Math.min(4.2, nn[bi] * 0.8))) seeds.push(project(lon, lat));
    }
  }
  const [x0, y1] = project(lo0, la0), [x1, y0] = project(lo1, la1);
  const vor = Delaunay.from(seeds).voronoi([x0, y0, x1, y1]);
  const cells: Record<string, string> = {}, centers: Record<string, [number, number]> = {};
  pts.forEach((p, i) => { cells[p.id] = vor.renderCell(i); centers[p.id] = seeds[i]; });
  const g = { width: x1 - x0, height: y1 - y0, cells, centers, minX: x0, minY: y0 };
  cache[mapId] = g;
  return g;
}
