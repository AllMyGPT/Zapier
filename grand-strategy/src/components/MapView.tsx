'use client';
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MAPS } from '@/data/maps';
import { isHostile, rules, topLiege } from '@/engine/core';
import { edgeBetween, terrainCost } from '@/engine/map';
import type { Army, GameState, Province } from '@/engine/types';
import { components, geometry, project, type MapGeometry } from '@/lib/geometry';

export type MapMode = string;

interface Props {
  s: GameState;
  version: number;
  mode: MapMode;
  selectedProvince: string | null;
  selectedArmy: string | null;
  onProvince: (id: string, secondary: boolean) => void;
  onArmy: (id: string) => void;
}

// [terrain, lat0, lat1, lon0, lon1] painted in order; later bands cover earlier ones
const BIOMES: [string, number, number, number, number][] = [
  ['p', -40, 90, -180, 180],
  ['h', 55, 90, -180, 180],
  ['f', 45, 62, -180, 180],
  ['d', 14, 34, -20, 62],
  ['d', 22, 34, -118, -100],
  ['j', -14, 13, -180, 180],
  ['p', 4, 13, -20, 45],
];
const TERRAIN_BASE: Record<string, string> = { p: '#b3b574', f: '#6a8a4c', h: '#a99f66', m: '#968c7c', w: '#748f72', d: '#dcc48e', j: '#4b8650' };

function modeColor(s: GameState, p: Province, mode: MapMode): string | null {
  if (mode === 'political') return p.owner ? s.nations[p.owner]?.color ?? '#777' : null;
  if (mode === 'terrain') return null;
  if (mode === 'diplomatic') {
    const pl = s.player;
    if (!p.owner) return null;
    if (p.owner === pl) return '#d9a441';
    if (topLiege(s, p.owner) === pl) return '#e8cf87';
    if (isHostile(s, pl, p.owner)) return '#c8553d';
    if (s.nations[pl].allies.includes(p.owner)) return '#5fa86b';
    const rel = s.nations[pl].relations[p.owner] ?? 0;
    return rel > 50 ? '#7fa7c9' : rel < -50 ? '#8a6060' : '#8b8e92';
  }
  const m = rules(s).mapModes.find((x) => x.id === mode);
  return m ? m.color(s, p) : null;
}

const TEX = ['p', 'f', 'h', 'm', 'w', 'd', 'j'];
/** painted terrain textures (public/art/terrain); only used once they actually load */
function useTextures() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(TEX.map((t) => new Promise<void>((res, rej) => { const i = new Image(); i.onload = () => res(); i.onerror = rej; i.src = `/art/terrain/${t}.jpg`; })))
      .then(() => alive && setOk(true)).catch(() => {});
    return () => { alive = false; };
  }, []);
  return ok;
}
/** plain repeating tile (textures are made seamless by scripts/seamless.sh) */
function MirrorPattern({ id, href, size }: { id: string; href: string; size: number }) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <image href={href} width={size} height={size} preserveAspectRatio="none" />
    </pattern>
  );
}

/** real coastlines (Natural Earth, public domain) for the historical map; built by scripts/build-land.mjs */
function useWorld(mapId: string, g: MapGeometry) {
  const [w, setW] = useState<{ d: string; islands: string[] } | null>(null);
  useEffect(() => {
    if (mapId !== 'earth' && mapId !== 'world') { setW(null); return; }
    let alive = true;
    fetch(`/geo/land-${mapId}.json`).then((r) => r.json()).then((j) => alive && setW(j)).catch(() => {});
    return () => { alive = false; };
  }, [mapId]);
  return useMemo(() => {
    if (!w) return null;
    const discs = w.islands.filter((id) => g.centers[id]).map((id) => { const [x, y] = g.centers[id]; const r = 9; return `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`; }).join('');
    return w.d + discs;
  }, [w, g]);
}

/** soft drifting clouds, painted once on a canvas */
function useClouds() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d');
    if (!x) return;
    for (let i = 0; i < 70; i++) {
      const cx = Math.random() * 512, cy = Math.random() * 512, r = 30 + Math.random() * 90;
      for (const [dx, dy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
        const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r);
        g.addColorStop(0, 'rgba(255,252,244,0.22)');
        g.addColorStop(1, 'rgba(255,252,244,0)');
        x.fillStyle = g;
        x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2);
      }
    }
    setUrl(c.toDataURL('image/png'));
  }, []);
  return url;
}

/** paper grain generated once on the client */
function usePaper() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    if (!x) return;
    const small = document.createElement('canvas');
    small.width = small.height = 24;
    const sx = small.getContext('2d')!;
    const img = sx.createImageData(24, 24);
    for (let i = 0; i < img.data.length; i += 4) { img.data[i] = 70; img.data[i + 1] = 50; img.data[i + 2] = 28; img.data[i + 3] = Math.random() * 110; }
    sx.putImageData(img, 0, 0);
    x.imageSmoothingEnabled = true;
    x.drawImage(small, 0, 0, 256, 256);
    const fine = x.getImageData(0, 0, 256, 256);
    for (let i = 0; i < fine.data.length; i += 4) { fine.data[i + 3] = Math.max(0, Math.min(255, fine.data[i + 3] + (Math.random() - 0.5) * 40)); }
    x.putImageData(fine, 0, 0);
    setUrl(c.toDataURL('image/png'));
  }, []);
  return url;
}

const CATEGORY: Record<string, string> = {
  levy: 'inf', archers: 'arc', pikemen: 'inf', infantry: 'inf', militia: 'inf', mountain: 'mtn', marines: 'mar',
  light_cav: 'cav', knights: 'cav', cavalry: 'cav', siege: 'art', artillery: 'art', armor: 'arm', motorized: 'mot',
};
function category(a: Army) {
  const count: Record<string, number> = {};
  for (const u of a.units) { const c = CATEGORY[u.type] ?? 'inf'; count[c] = (count[c] ?? 0) + (c === 'arm' ? 2.5 : c === 'cav' ? 1.5 : 1); }
  return Object.entries(count).sort((x, y) => y[1] - x[1])[0]?.[0] ?? 'inf';
}

/** unit symbol in a 24×24 box, drawn in the spirit of wargame unit counters (Hearts of Iron 2): a figure or vehicle in pale steel
 *  with dark detailing, read at a glance. Light ink = the unit, dark ink = details and shadow. */
function UnitIcon({ cat }: { cat: string }) {
  const L = '#efe6cc', D = '#2a2116', M = '#b8ad8e';
  if (cat === 'cav') return (
    <g>
      {/* lancer on a galloping horse, side view */}
      <path stroke={D} strokeWidth="0.9" d="M8.6 8.2 L1.4 0.9" />
      <path fill={D} d="M0.8 0.6 L2.2 0.4 L1.6 1.9Z" />
      <path fill={L} d="M8.6 3.8 L11.4 3.8 L11.8 9.6 L8.4 9.8Z" />
      <circle fill={L} cx="10.2" cy="2.4" r="1.5" />
      <path fill={L} d="M4.2 12.2 Q6 10.4 9.6 10.6 L15.4 10.2 Q16.6 9.8 17.2 8.2 L18.2 5.4 Q18.6 4.4 19.8 4.4 L21.4 5.4 Q21.8 6.2 21 6.9 L19.6 7.6 Q18.8 8.4 18.4 9.6 Q17.8 11.6 16.6 12.6 L16.2 13.4 L16.8 20.8 L15 20.8 L14.4 14.2 L10.4 14.6 L9.8 20.8 L8 20.8 L7.8 14.4 Q5.6 14.6 4.6 13.8 Q4 13.2 4.2 12.2Z" />
      <path fill={M} d="M7.8 14.4 L10.4 14.6 L14.4 14.2 L15 20.8 L16.8 20.8 L16.8 19 L15 18.8Z" opacity=".5" />
      <path fill={D} d="M19.4 5.2 L20.4 5.2 L20 6.2Z" />
      <path fill="none" stroke={L} strokeWidth="1.2" strokeLinecap="round" d="M4.4 11 Q1.4 12 2.2 15.8" />
    </g>
  );
  if (cat === 'art') return (
    <g>
      {/* spoked wheel, carriage and a long barrel */}
      <circle fill="none" stroke={L} strokeWidth="1.5" cx="8" cy="17" r="4.8" />
      <circle fill={D} cx="8" cy="17" r="1.2" />
      <path stroke={M} strokeWidth="0.6" d="M8 12.2 V21.8 M3.2 17 H12.8 M4.8 13.8 L11.2 20.2 M11.2 13.8 L4.8 20.2" />
      <path fill={L} d="M6.4 13.4 L12.6 13.4 L13.8 16.2 L6 16.2Z" />
      <path fill={L} d="M9.6 12.2 L21.6 5.8 L22.8 8.2 L10.8 14.2Z" />
      <path fill={D} d="M20.6 5.4 L22.8 4.6 L23.2 6.6 L21.8 7.2Z" />
    </g>
  );
  if (cat === 'arm') return (
    <g>
      {/* tank: hull, sloped turret, long gun and a track with road wheels */}
      <rect fill={D} x="1.6" y="15.4" width="20.8" height="5.6" rx="2.8" />
      {[3.8, 7.4, 11, 14.6, 18.2].map((x) => <circle key={x} fill={M} cx={x} cy="18.2" r="1.05" />)}
      <path fill={L} d="M2.6 15.4 L3.6 12.2 L20.6 12.2 L21.4 15.4Z" />
      <path fill={L} d="M7.4 12.4 Q8 8 12 7.6 Q15.8 8 16.6 12.4Z" />
      <rect fill={L} x="15.2" y="9.2" width="8.4" height="1.6" />
      <rect fill={D} x="22.6" y="8.8" width="1" height="2.4" />
      <circle fill={D} cx="11.4" cy="9.8" r="0.9" />
    </g>
  );
  if (cat === 'mot') return (
    <g>
      {/* lorry: cab with windscreen, canvas-covered load, two wheels */}
      <path fill={L} d="M9.2 7 Q14.4 5.2 20.6 7 L20.8 15.2 L9.2 15.2Z" />
      <path fill={M} d="M9.2 12.8 L20.8 12.8 L20.8 15.2 L9.2 15.2Z" />
      <path fill={L} d="M1.6 9.4 L5 9.4 L6.6 12.4 L6.8 15.2 L1.6 15.2Z" />
      <path fill={D} d="M2.4 10.4 L4.6 10.4 L5.6 12.2 L2.4 12.2Z" />
      <rect fill={D} x="1.6" y="15" width="19.4" height="1.4" />
      <circle fill={D} cx="4.6" cy="17.6" r="2.6" />
      <circle fill={L} cx="4.6" cy="17.6" r="1" />
      <circle fill={D} cx="16.6" cy="17.6" r="2.6" />
      <circle fill={L} cx="16.6" cy="17.6" r="1" />
    </g>
  );
  if (cat === 'mtn') return (
    <g>
      {/* alpine troops: two peaks with snow caps and a banner */}
      <path fill={L} d="M1 21.2 L9 6.4 L13 13.4 L15.6 9.2 L23 21.2Z" />
      <path fill={D} d="M7.4 10.2 L9 6.4 L10.6 10.2 L9 9.2Z" />
      <path fill={D} d="M14.2 11.4 L15.6 9.2 L17 11.4 L15.6 10.6Z" />
      <path fill={D} d="M9 6.4 V1.8" stroke={D} strokeWidth="0.8" />
      <path fill={L} d="M9 1.8 L13 2.9 L9 4Z" />
    </g>
  );
  if (cat === 'mar') return (
    <g fill="none" stroke={L} strokeWidth="1.6" strokeLinecap="round">
      {/* anchor */}
      <circle cx="12" cy="4.4" r="1.9" />
      <path d="M12 6.4 V20.6 M7.4 9.4 H16.6" />
      <path d="M4.2 14.2 Q12 25 19.8 14.2" />
      <path d="M4.2 14.2 L3.4 11.8 M19.8 14.2 L20.6 11.8" />
    </g>
  );
  if (cat === 'arc') return (
    <g>
      {/* longbowman: bow, nocked arrow and quiver */}
      <path fill="none" stroke={L} strokeWidth="1.8" d="M6.4 2 Q20.4 12 6.4 22" />
      <path stroke={M} strokeWidth="0.6" d="M6.4 2 L6.4 22" />
      <path stroke={L} strokeWidth="1.1" d="M2.6 12 H16.2" />
      <path fill={L} d="M15.2 9.6 L20 12 L15.2 14.4Z" />
      <path stroke={L} strokeWidth="1" d="M2.6 12 L1.2 10.4 M2.6 12 L1.2 13.6" />
      <path fill={D} d="M18.8 16.6 L22.8 15 L23.6 22 L19.6 22.4Z" />
      <path stroke={L} strokeWidth="0.7" d="M20.4 16.4 L19.4 9 M22.2 15.6 L22.2 8.8" />
    </g>
  );
  if (cat === 'inf') return (
    <g>
      {/* rifleman with helmet, tunic, belt and rifle at the shoulder */}
      <path fill={L} d="M8 6.4 Q8.4 2 12.2 2 Q16 2 16.4 6.4Z" />
      <rect fill={D} x="7.2" y="5.8" width="10" height="1.1" rx=".5" />
      <ellipse fill={M} cx="12.2" cy="8.2" rx="2.4" ry="2.2" />
      <path fill={L} d="M7.6 10.4 Q12.2 8.6 16.8 10.4 L17.4 17.4 L7 17.4Z" />
      <rect fill={D} x="7" y="14.4" width="10.4" height="1" />
      <path fill={D} d="M7.6 17.2 L11.2 17.2 L10.8 22.6 L7.8 22.6Z" />
      <path fill={D} d="M12.8 17.2 L16.4 17.2 L16.4 22.6 L13.2 22.6Z" />
      <path fill={L} d="M17.6 3.2 L18.8 3 L19.4 21.8 L18.2 22Z" />
      <path fill={D} d="M18.2 1.2 L19.4 3.4 L18.4 3.6Z" />
    </g>
  );
  // levies, militia and anything else: a pikeman with a round shield
  return (
    <g>
      <path stroke={L} strokeWidth="1.2" d="M4 22 L20.6 2.6" />
      <path fill={D} d="M19.4 0.6 L22.2 2.8 L21 4.2Z" />
      <circle fill={L} cx="9.4" cy="14.4" r="5" />
      <circle fill="none" stroke={D} strokeWidth="0.9" cx="9.4" cy="14.4" r="4.2" />
      <circle fill={D} cx="9.4" cy="14.4" r="1.2" />
    </g>
  );
}

function armyPoint(s: GameState, g: MapGeometry, a: Army): [number, number] {
  const c = g.centers[a.location];
  if (!a.path.length || a.inBattle || !a.progress) return c;
  const next = a.path[0];
  const edge = edgeBetween(s, a.location, next);
  const n = g.centers[next];
  if (!edge || !n) return c;
  const r = rules(s);
  const speed = Math.min(...a.units.map((u) => r.unitTypes[u.type]?.speed ?? 1), 3) * (a.retreating ? 1.5 : 1);
  const need = (edge.cost * terrainCost(s.provinces[next].terrain) * r.moveBaseDays) / Math.max(0.2, speed);
  const t = Math.min(0.9, a.progress / Math.max(1, need));
  return [c[0] + (n[0] - c[0]) * t, c[1] + (n[1] - c[1]) * t];
}

function MapView({ s, version, mode, selectedProvince, selectedArmy, onProvince, onArmy }: Props) {
  const g = useMemo(() => geometry(s.mapId), [s.mapId]);
  const svgRef = useRef<SVGSVGElement>(null);
  const paper = usePaper();
  const tex = useTextures();
  const clouds = useClouds();
  const world = useWorld(s.mapId, g);
  const [pxW, setPxW] = useState(1200);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPxW(el.clientWidth || 1200));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // the realm-centred view: where "Centrar en tu reino" takes you
  const realm = useMemo(() => {
    const mine = Object.values(s.provinces).filter((p) => p.owner === s.player).map((p) => g.centers[p.id]);
    const owned = (mine.length ? mine : Object.values(s.provinces).filter((p) => p.owner).map((p) => g.centers[p.id]));
    const xs = owned.map((c) => c[0]), ys = owned.map((c) => c[1]);
    const pad = 60;
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const w = Math.max(700, Math.max(...xs) - Math.min(...xs) + pad * 2), h = Math.max(500, Math.max(...ys) - Math.min(...ys) + pad * 2);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.scenarioId, g]);
  // world maps open on the whole planet, so every continent and nation is in view from the first frame
  const initial = useMemo(() => (s.mapId === 'world' ? { x: g.minX, y: g.minY, w: g.width, h: g.height } : realm), [s.mapId, g, realm]);
  const [view, setView] = useState(initial);
  useEffect(() => setView(initial), [initial]);
  type Drag = { x: number; y: number; vx: number; vy: number; moved: boolean; pointers: Map<number, [number, number]>; pinch?: number };
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);

  // During pan/zoom the already-painted SVG is moved with a GPU transform; the viewBox is committed once the gesture settles.
  const live = useRef({ tx: 0, ty: 0, k: 1 });
  const pendingReset = useRef(false);
  const commitTimer = useRef<number | null>(null);
  const applyLive = () => {
    const el = svgRef.current;
    if (!el) return;
    const L = live.current;
    el.style.transform = L.k === 1 && !L.tx && !L.ty ? '' : `translate(${L.tx}px, ${L.ty}px) scale(${L.k})`;
  };
  const commit = () => {
    if (commitTimer.current) { window.clearTimeout(commitTimer.current); commitTimer.current = null; }
    const L = { ...live.current };
    if (L.k === 1 && !L.tx && !L.ty) return;
    const el = svgRef.current!;
    const W = el.clientWidth, H = el.clientHeight;
    pendingReset.current = true;
    setView((v) => {
      const sc = Math.max(v.w / W, v.h / H);
      const ox = v.x + (v.w - W * sc) / 2, oy = v.y + (v.h - H * sc) / 2;
      return { x: ox + (-L.tx / L.k) * sc, y: oy + (-L.ty / L.k) * sc, w: (W / L.k) * sc, h: (H / L.k) * sc };
    });
  };
  useLayoutEffect(() => {
    if (!pendingReset.current) return;
    pendingReset.current = false;
    live.current = { tx: 0, ty: 0, k: 1 };
    applyLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  const zoom = (factor: number, clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return;
    const host = el.parentElement!.getBoundingClientRect();
    const cx = clientX - host.left, cy = clientY - host.top;
    const L = live.current;
    const curW = view.w / L.k;
    const nw = Math.min(g.width * 1.2, Math.max(120, curW * factor));
    const sc = curW / nw;
    L.tx = cx - sc * (cx - L.tx); L.ty = cy - sc * (cy - L.ty); L.k *= sc;
    applyLive();
    if (commitTimer.current) window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(commit, 170);
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  // phones: keep the selected province above the bottom sheet
  useEffect(() => {
    const el = svgRef.current;
    if (!el || !selectedProvince || window.innerWidth > 820) return;
    const c = g.centroids[selectedProvince];
    if (!c) return;
    const W = el.clientWidth, H = el.clientHeight;
    setView((v) => {
      const sc = Math.max(v.w / W, v.h / H);
      const oy = v.y + (v.h - H * sc) / 2, ox = v.x + (v.w - W * sc) / 2;
      const sy = (c[1] - oy) / sc, sx = (c[0] - ox) / sc;
      if (sy > H * 0.08 && sy < H * 0.42 && sx > W * 0.1 && sx < W * 0.9) return v;
      return { ...v, x: c[0] - v.w / 2, y: c[1] - 0.25 * H * sc - (v.h - H * sc) / 2 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince]);

  const ppu = pxW / view.w; // screen pixels per world unit
  const font = 11 / ppu; // world size of an ~11px screen font
  const armies = Object.values(s.armies);
  const byLoc: Record<string, Army[]> = {};
  for (const a of armies) (byLoc[a.inBattle || !a.progress || !a.path.length ? a.location : `${a.location}>${a.path[0]}`] ??= []).push(a);
  const selArmy = selectedArmy ? s.armies[selectedArmy] : null;
  const r = rules(s);

  const tipRef = useRef<HTMLDivElement>(null);
  const hoverTip = (e: React.PointerEvent) => {
    const el = tipRef.current;
    if (!el) return;
    if (drag.current?.moved) { el.style.opacity = '0'; return; }
    const target = (e.target as Element).closest('[data-pid],[data-aid]');
    if (!target) { el.style.opacity = '0'; return; }
    const html = target.getAttribute('data-aid') ? armyTip(s, target.getAttribute('data-aid')!) : provinceTip(s, target.getAttribute('data-pid')!);
    if (el.dataset.k !== html) { el.innerHTML = html; el.dataset.k = html; }
    const host = el.parentElement!.getBoundingClientRect();
    const x = e.clientX - host.left + 16, y = e.clientY - host.top + 18;
    el.style.transform = `translate(${Math.min(x, host.width - 250)}px, ${Math.min(y, host.height - 140)}px)`;
    el.style.opacity = '1';
  };

  return (
    <>
    <svg
      ref={svgRef}
      className={dragging ? 'dragging' : ''}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMid meet"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        const d: Drag = drag.current ?? { x: e.clientX, y: e.clientY, vx: live.current.tx, vy: live.current.ty, moved: false, pointers: new Map() };
        d.pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (d.pointers.size === 2) { const [a, b] = [...d.pointers.values()]; d.pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
        else { d.x = e.clientX; d.y = e.clientY; d.vx = live.current.tx; d.vy = live.current.ty; d.moved = false; }
        drag.current = d;
      }}
      onPointerLeave={() => { if (tipRef.current) tipRef.current.style.opacity = '0'; }}
      onPointerMove={(e) => {
        hoverTip(e);
        const d = drag.current;
        if (!d || !d.pointers.has(e.pointerId)) return;
        d.pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (d.pointers.size === 2 && d.pinch) {
          const [a, b] = [...d.pointers.values()];
          const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
          zoom(d.pinch / dist, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
          d.pinch = dist;
          d.moved = true;
          return;
        }
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { d.moved = true; setDragging(true); }
        if (d.moved) {
          if (commitTimer.current) { window.clearTimeout(commitTimer.current); commitTimer.current = null; }
          live.current.tx = d.vx + dx; live.current.ty = d.vy + dy;
          applyLive();
        }
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        d?.pointers.delete(e.pointerId);
        if (d && d.pointers.size === 0) {
          if (!d.moved) {
            const target = (e.target as Element).closest('[data-pid],[data-aid]');
            if (target?.getAttribute('data-aid')) onArmy(target.getAttribute('data-aid')!);
            else if (target?.getAttribute('data-pid')) onProvince(target.getAttribute('data-pid')!, e.button === 2);
          }
          if (d.moved) commit();
          drag.current = null;
          setDragging(false);
        }
      }}
    >
      <defs>
        {/* world maps paint the sea in user space so the gradient runs on past the map's edges: no hard border around the planet */}
        <radialGradient id="seaGrad" {...(s.mapId === 'world'
          ? { gradientUnits: 'userSpaceOnUse' as const, cx: g.minX + g.width * 0.5, cy: g.minY + g.height * 0.45, r: Math.max(g.width, g.height) * 0.55 }
          : { cx: '50%', cy: '45%', r: '75%' })}>
          <stop offset="0" stopColor={MAPS[s.mapId].seaColor} />
          <stop offset="1" stopColor="#0b1a26" />
        </radialGradient>
        <pattern id="waves" width="46" height="26" patternUnits="userSpaceOnUse">
          <path d="M2 8 q5 -4 10 0 t10 0 M24 21 q5 -4 10 0 t10 0" fill="none" stroke="#cfe6ee" strokeOpacity=".07" strokeWidth=".9" />
        </pattern>
        {paper && <pattern id="paper" width="220" height="220" patternUnits="userSpaceOnUse"><image href={paper} width="220" height="220" preserveAspectRatio="none" /></pattern>}
        {tex && TEX.map((t) => <MirrorPattern key={t} id={`tex-${t}`} href={`/art/terrain/${t}.jpg`} size={340} />)}
        {tex && <MirrorPattern id="tex-sea" href="/art/terrain/sea.jpg" size={560} />}
        {world && <clipPath id="landclip"><path d={world} /></clipPath>}
        <clipPath id="mapclip"><rect x={g.minX} y={g.minY} width={g.width} height={g.height} /></clipPath>
        <pattern id="occ" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3.2" height="7" fill="#000" opacity=".42" /></pattern>
        <radialGradient id="battleGlow"><stop offset="0" stopColor="#ff5a2a" stopOpacity=".85" /><stop offset="1" stopColor="#ff5a2a" stopOpacity="0" /></radialGradient>
      </defs>

      <rect x={g.minX - g.width} y={g.minY - g.height} width={g.width * 3} height={g.height * 3} fill={s.mapId === 'world' ? 'url(#seaGrad)' : '#0b1a26'} />
      <rect x={g.minX} y={g.minY} width={g.width} height={g.height} fill="url(#seaGrad)" />
      {tex && <rect x={g.minX - g.width} y={g.minY - g.height} width={g.width * 3} height={g.height * 3} fill="url(#tex-sea)" opacity={0.3} pointerEvents="none" />}
      <rect x={g.minX - g.width} y={g.minY - g.height} width={g.width * 3} height={g.height * 3} fill="url(#waves)" pointerEvents="none" />

      <g clipPath="url(#mapclip)">
      <StaticLand coast={world ?? g.land} wild={!!world} tex={tex} />
      <g clipPath={world ? 'url(#landclip)' : undefined}>
      <Provinces s={s} version={version} mode={mode} g={g} tex={tex} />
      <Glyphs g={g} strong={mode === 'terrain'} subtle={tex} />
      <Borders s={s} version={version} g={g} mode={mode} />

      {Object.values(s.provinces).filter((p) => p.controller && p.controller !== p.owner).map((p) => (
        <path key={`o${p.id}`} d={g.cells[p.id]} fill="url(#occ)" stroke={s.nations[p.controller!]?.color ?? '#000'} strokeWidth={1.4} vectorEffect="non-scaling-stroke" pointerEvents="none" />
      ))}
      {selectedProvince && (
        <g pointerEvents="none">
          <path d={g.cells[selectedProvince]} fill="#fff" opacity={0.14} />
          <path d={g.cells[selectedProvince]} fill="none" stroke="#1a1208" strokeWidth={4.5} vectorEffect="non-scaling-stroke" opacity={0.6} />
          <path className="sel-pulse" d={g.cells[selectedProvince]} fill="none" stroke="#ffe08a" strokeWidth={2.2} vectorEffect="non-scaling-stroke" />
        </g>
      )}
      </g>
      {world && <path d={world} fill="none" stroke="#24180c" strokeOpacity=".9" strokeWidth={1.3} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      </g>
      {paper && <rect x={g.minX - g.width} y={g.minY - g.height} width={g.width * 3} height={g.height * 3} fill="url(#paper)" opacity={0.55} pointerEvents="none" />}

      <Labels s={s} version={version} g={g} ppu={ppu} />

      {/* capitals */}
      {Object.values(s.nations).filter((n) => n.alive && s.provinces[n.capital]?.owner === n.tag && (n.tag === s.player || (!n.liege && Object.values(s.provinces).filter((p) => p.owner === n.tag).length >= 3))).map((n) => {
        const [x, y] = g.centroids[n.capital];
        const k = font * 0.11;
        return (
          <g key={`cap${n.tag}`} transform={`translate(${x} ${y - font * 0.4}) scale(${k})`} pointerEvents="none">
            <path d="M-6 4 L-6 -3 L-4 -3 L-4 -1 L-2 -1 L-2 -3 L2 -3 L2 -1 L4 -1 L4 -3 L6 -3 L6 4Z" fill="#f2dfa4" stroke="#2a1d0c" strokeWidth={1.3} />
            <rect x={-1.2} y={0.6} width={2.4} height={3.4} fill="#2a1d0c" />
          </g>
        );
      })}

      {/* sieges */}
      {Object.values(s.provinces).filter((p) => p.siege).map((p) => {
        const [x, y] = g.centroids[p.id];
        const pr = Math.min(1, p.siege!.progress / r.siegeBaseDays);
        const rad = font * 1.15;
        return (
          <g key={`s${p.id}`} pointerEvents="none" transform={`translate(${x} ${y + font * 1.6})`}>
            <circle r={rad} fill="#1a120acc" stroke="#000" strokeWidth={font * 0.12} />
            <circle r={rad * 0.82} fill="none" stroke="#ffffff22" strokeWidth={font * 0.25} />
            <circle r={rad * 0.82} fill="none" stroke={s.nations[p.siege!.by]?.color ?? '#e44'} strokeWidth={font * 0.25} pathLength={100} strokeDasharray={`${pr * 100} 100`} transform="rotate(-90)" />
            <path transform={`scale(${font * 0.075}) translate(-6 -6)`} d="M1 11 L1 4 L3 4 L3 6 L5 6 L5 4 L7 4 L7 6 L9 6 L9 4 L11 4 L11 11Z" fill="#e8d6a8" />
          </g>
        );
      })}

      {/* movement paths */}
      {armies.filter((a) => a.owner === s.player && a.path.length && a.id !== selectedArmy).map((a) => (
        <polyline key={`mp${a.id}`} points={[armyPoint(s, g, a), ...a.path.map((pid) => g.centers[pid])].map((c) => c.join(',')).join(' ')} fill="none" stroke="#f3e7c4" strokeOpacity=".45" strokeWidth={1.4} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" pointerEvents="none" />
      ))}
      {selArmy && selArmy.path.length > 0 && (() => {
        const pts = [armyPoint(s, g, selArmy), ...selArmy.path.map((pid) => g.centers[pid])];
        const end = pts[pts.length - 1];
        return (
          <g pointerEvents="none">
            <polyline points={pts.map((c) => c.join(',')).join(' ')} fill="none" stroke="#1a1208" strokeOpacity=".7" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <polyline className="march" points={pts.map((c) => c.join(',')).join(' ')} fill="none" stroke="#9ff08c" strokeWidth={2.6} strokeDasharray="7 6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle cx={end[0]} cy={end[1]} r={font * 0.55} fill="#9ff08c" stroke="#1a1208" strokeWidth={font * 0.15} />
          </g>
        );
      })()}

      {/* battles */}
      {[...new Set(armies.filter((a) => a.inBattle).map((a) => a.location))].map((pid) => {
        const [x, y] = g.centers[pid];
        return (
          <g key={`b${pid}`} transform={`translate(${x} ${y})`} pointerEvents="none">
            <circle className="battle-glow" r={font * 3.2} fill="url(#battleGlow)" />
          </g>
        );
      })}

      {/* army counters */}
      {Object.entries(byLoc).map(([key, list]) => list.map((a, i) => {
        const [px, py] = armyPoint(s, g, a);
        const h = font * 1.75, w = h * 2.35;
        const x = px - w / 2, y = py - h * 1.15 - i * h * 1.12;
        const color = a.owner === 'REB' ? '#2a2a2a' : s.nations[a.owner]?.color ?? '#888';
        const sel = a.id === selectedArmy;
        const n = a.units.length;
        const org = a.units.reduce((t, u) => t + u.org, 0) / Math.max(1, n);
        const str = a.units.reduce((t, u) => t + u.str, 0) / Math.max(1, n);
        const mine = a.owner === s.player;
        const enemy = isHostile(s, s.player, a.owner);
        return (
          <g key={a.id} data-aid={a.id} className="counter" style={{ cursor: 'pointer', transform: `translate(${x}px, ${y}px)` }} data-loc={key}>
            <rect x={-font * 0.12} y={-font * 0.12} width={w + font * 0.24} height={h + font * 0.62} rx={font * 0.3} fill="#000" opacity={0.45} />
            {sel && <rect x={-font * 0.35} y={-font * 0.35} width={w + font * 0.7} height={h + font * 1.05} rx={font * 0.45} fill="none" stroke="#ffe08a" strokeWidth={font * 0.22} className="sel-pulse" />}
            {/* a cardboard counter: wooden frame, painted roundel with brass rim, cream number plate */}
            <rect width={w} height={h} rx={font * 0.3} fill="#2b1f12" stroke={a.inBattle ? '#ff6a3d' : enemy ? '#d9534a' : mine ? '#e3c06f' : '#8d7a55'} strokeWidth={font * 0.16} />
            <rect x={font * 0.1} y={font * 0.1} width={w - font * 0.2} height={h - font * 0.2} rx={font * 0.22} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={font * 0.06} />
            <circle cx={h / 2} cy={h / 2} r={h * 0.44} fill={color} stroke="#f3dfa6" strokeWidth={font * 0.14} />
            <circle cx={h / 2} cy={h / 2} r={h * 0.34} fill="none" stroke="#000" strokeOpacity={0.28} strokeWidth={font * 0.07} />
            <ellipse cx={h / 2} cy={h * 0.3} rx={h * 0.3} ry={h * 0.13} fill="#fff" opacity={0.22} />
            <g transform={`translate(${h * 0.2} ${h * 0.2}) scale(${(h * 0.6) / 24})`} style={{ filter: `drop-shadow(0 ${font * 0.04}px 0 #1a1208)` }}><UnitIcon cat={category(a)} /></g>
            <rect x={h * 0.92} y={h * 0.1} width={w - h * 0.98} height={h * 0.8} rx={font * 0.2} fill="#efe0b8" stroke="#7a5a2a" strokeWidth={font * 0.06} />
            <text x={h + (w - h) / 2 - font * 0.12} y={h * 0.7} fontSize={font * 1.1} textAnchor="middle" fill="#2a1d0e" fontWeight={700} style={{ fontFamily: 'var(--display)' }}>{a.inBattle ? '⚔' : n}</text>
            <rect x={0} y={h + font * 0.1} width={w} height={font * 0.22} fill="#00000099" />
            <rect x={0} y={h + font * 0.1} width={w * org} height={font * 0.22} fill="#7bd17b" />
            <rect x={0} y={h + font * 0.34} width={w} height={font * 0.16} fill="#00000099" />
            <rect x={0} y={h + font * 0.34} width={w * str} height={font * 0.16} fill="#e0b74f" />
          </g>
        );
      }))}
    </svg>
    {clouds && <div className="clouds" style={{ backgroundImage: `url(${clouds})`, opacity: Math.max(0, Math.min(0.4, (0.5 - ppu) * 1.6)), backgroundPosition: `${-view.x * ppu * 0.6}px ${-view.y * ppu * 0.6}px` }} />}
    <div ref={tipRef} className="maptip" />
    <div className="zoomctl">
      <button aria-label="Acercar" onClick={() => { const r = svgRef.current!.getBoundingClientRect(); zoom(1 / 1.4, r.left + r.width / 2, r.top + r.height / 2); }}>+</button>
      <button aria-label="Alejar" onClick={() => { const r = svgRef.current!.getBoundingClientRect(); zoom(1.4, r.left + r.width / 2, r.top + r.height / 2); }}>−</button>
      <button aria-label="Centrar en tu reino" onClick={() => { live.current = { tx: 0, ty: 0, k: 1 }; applyLive(); setView(realm); }}>◎</button>
    </div>
    <Minimap s={s} version={version} g={g} coast={world} view={view} onJump={(x, y) => { live.current = { tx: 0, ty: 0, k: 1 }; applyLive(); setView((v) => ({ ...v, x: x - v.w / 2, y: y - v.h / 2 })); }} />
    </>
  );
}

const TERRAIN_NAME: Record<string, string> = { p: 'Llanura', f: 'Bosque', h: 'Colinas', m: 'Montañas', w: 'Marisma', d: 'Desierto', j: 'Selva' };
const esc = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
function provinceTip(s: GameState, pid: string) {
  const p = s.provinces[pid];
  if (!p) return '';
  const o = p.owner ? s.nations[p.owner] : null;
  const c = p.controller && p.controller !== p.owner ? s.nations[p.controller] : null;
  return `<div class="tt-title">${esc(p.name)}</div>`
    + `<div class="tt-row"><span class="tt-sw" style="background:${o?.color ?? '#555'}"></span>${o ? esc(o.name) : 'Sin dueño'}</div>`
    + (c ? `<div class="tt-row tt-bad">Ocupada por ${esc(c.name)}</div>` : '')
    + `<div class="tt-grid"><span>Terreno</span><b>${TERRAIN_NAME[p.terrain] ?? p.terrain}</b><span>Riqueza</span><b>${p.dev}</b><span>Fortificación</span><b>${p.fort}</b>${p.unrest > 0 ? `<span>Malestar</span><b>${p.unrest.toFixed(1)}</b>` : ''}</div>`
    + (p.siege ? `<div class="tt-row tt-bad">Asediada por ${esc(s.nations[p.siege.by]?.name ?? '')}</div>` : '')
    + `<div class="tt-hint">Clic para ver · clic derecho para mover el ejército</div>`;
}
function armyTip(s: GameState, aid: string) {
  const a = s.armies[aid];
  if (!a) return '';
  const r = rules(s);
  const o = s.nations[a.owner];
  const count: Record<string, number> = {};
  for (const u of a.units) count[u.type] = (count[u.type] ?? 0) + 1;
  const org = a.units.reduce((t, u) => t + u.org, 0) / Math.max(1, a.units.length);
  const str = a.units.reduce((t, u) => t + u.str, 0) / Math.max(1, a.units.length);
  return `<div class="tt-title">${esc(a.name)}</div>`
    + `<div class="tt-row"><span class="tt-sw" style="background:${o?.color ?? '#222'}"></span>${o ? esc(o.name) : 'Rebeldes'}</div>`
    + `<div class="tt-grid">${Object.entries(count).map(([k, v]) => `<span>${esc(r.unitTypes[k]?.name ?? k)}</span><b>${v}</b>`).join('')}`
    + `<span>Moral</span><b>${Math.round(org * 100)} %</b><span>Fuerza</span><b>${Math.round(str * 100)} %</b></div>`
    + (a.inBattle ? '<div class="tt-row tt-bad">En combate</div>' : a.path.length ? `<div class="tt-row">Marcha hacia ${esc(s.provinces[a.path[a.path.length - 1]]?.name ?? '')}</div>` : '');
}

/** overview map with the current viewport; click to jump */
const Minimap = memo(function Minimap({ s, g, coast, view, onJump }: { s: GameState; version: number; g: MapGeometry; coast: string | null; view: { x: number; y: number; w: number; h: number }; onJump: (x: number, y: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const jump = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const k = Math.max(g.width / r.width, g.height / r.height);
    const ox = g.minX + (g.width - r.width * k) / 2, oy = g.minY + (g.height - r.height * k) / 2;
    onJump(ox + (e.clientX - r.left) * k, oy + (e.clientY - r.top) * k);
  };
  return (
    <div className="minimap">
      <svg ref={ref} viewBox={`${g.minX} ${g.minY} ${g.width} ${g.height}`} preserveAspectRatio="xMidYMid meet"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); jump(e); }}
        onPointerMove={(e) => { if (e.buttons) jump(e); }}>
        <rect x={g.minX} y={g.minY} width={g.width} height={g.height} fill="#10283a" />
        {coast && <path d={coast} fill="#7a715a" />}
        <g clipPath={coast ? 'url(#landclip)' : undefined}>
          {Object.values(s.provinces).map((p) => <path key={p.id} d={g.cells[p.id]} fill={p.owner ? s.nations[p.owner]?.color ?? '#777' : '#6d6a5d'} />)}
        </g>
        <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="#ffffff14" stroke="#ffe08a" strokeWidth={g.width / 160} />
      </svg>
    </div>
  );
}, (a, b) => a.version === b.version && a.g === b.g && a.view === b.view && a.coast === b.coast);

/** coast halo bands + terrain base: never changes during a game */
const StaticLand = memo(function StaticLand({ coast, wild, tex }: { coast: string; wild: boolean; tex: boolean }) {
  return (
    <g pointerEvents="none">
      <path d={coast} fill="none" stroke="#2f6a83" strokeOpacity=".28" strokeWidth={26} strokeLinejoin="round" />
      <path d={coast} fill="none" stroke="#4e8ea3" strokeOpacity=".3" strokeWidth={15} strokeLinejoin="round" />
      <path d={coast} fill="none" stroke="#86bcc4" strokeOpacity=".35" strokeWidth={7} strokeLinejoin="round" />
      <path d={coast} fill="none" stroke="#c9e2dc" strokeOpacity=".35" strokeWidth={2.6} strokeLinejoin="round" />
      <path d={coast} fill="#2b2216" transform="translate(1.6 2.2)" opacity={0.55} />
      {wild && <>
        {/* unclaimed land: painted terrain by rough latitude biome, dimmed */}
        <clipPath id="wildclip"><path d={coast} /></clipPath>
        <g clipPath="url(#wildclip)">
          {BIOMES.map(([t, lat0, lat1, lon0, lon1], i) => {
            const [x0, y1] = project(lon0, lat0), [x1, y0] = project(lon1, lat1);
            return <rect key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={tex ? `url(#tex-${t})` : TERRAIN_BASE[t]} />;
          })}
          <path d={coast} fill="#3b3428" opacity={tex ? 0.42 : 0.3} />
        </g>
      </>}
    </g>
  );
}, (a, b) => a.coast === b.coast && a.wild === b.wild && a.tex === b.tex);

const Provinces = memo(function Provinces({ s, mode, g, tex }: { s: GameState; version: number; mode: MapMode; g: MapGeometry; tex: boolean }) {
  const overlay = mode === 'terrain' ? 0 : mode === 'political' ? (tex ? 0.6 : 0.8) : 0.8;
  return (
    <g>
      {Object.values(s.provinces).map((p) => {
        const c = modeColor(s, p, mode);
        return (
          <g key={p.id} data-pid={p.id} style={{ cursor: 'pointer' }}>
            <path d={g.cells[p.id]} fill={tex ? `url(#tex-${p.terrain})` : TERRAIN_BASE[p.terrain] ?? '#999'} />
            {c ? <path d={g.cells[p.id]} fill={c} opacity={overlay} /> : mode !== 'terrain' && <path d={g.cells[p.id]} fill="#5b574c" opacity={0.55} />}
          </g>
        );
      })}
    </g>
  );
}, (a, b) => a.version === b.version && a.mode === b.mode && a.g === b.g && a.tex === b.tex);

const Glyphs = memo(function Glyphs({ g, strong, subtle }: { g: MapGeometry; strong: boolean; subtle: boolean }) {
  const paths = useMemo(() => {
    const o = { mShade: '', mLight: '', mLine: '', snow: '', hill: '', tree: '', treeHi: '', jungle: '', marsh: '', dune: '', field: '' };
    for (const { t, x, y, s, v } of g.glyphs) {
      const k = s * 1.15;
      if (t === 'm') {
        const w = 3.1 * k, h = 3.4 * k + v * 1.2;
        o.mLight += `M${x - w},${y + 2 * k}L${x},${y - h}L${x + 0.3 * k},${y + 2 * k}Z`;
        o.mShade += `M${x},${y - h}L${x + w},${y + 2 * k}L${x + 0.3 * k},${y + 2 * k}Z`;
        o.mLine += `M${x - w},${y + 2 * k}L${x},${y - h}L${x + w},${y + 2 * k}`;
        if (v > 0.35) o.snow += `M${x - w * 0.32},${y - h * 0.55}L${x},${y - h}L${x + w * 0.3},${y - h * 0.58}L${x + 0.05},${y - h * 0.45}Z`;
      } else if (t === 'h') {
        o.hill += `M${x - 2.8 * k},${y + 0.9 * k}Q${x},${y - 2.2 * k} ${x + 2.8 * k},${y + 0.9 * k}`;
      } else if (t === 'f' || t === 'j') {
        const rr = (t === 'j' ? 1.7 : 1.35) * k;
        const circ = (cx: number, cy: number, r0: number) => `M${cx - r0},${cy}a${r0},${r0} 0 1,0 ${2 * r0},0a${r0},${r0} 0 1,0 ${-2 * r0},0`;
        if (t === 'j') o.jungle += circ(x, y, rr) + circ(x + rr * 1.1, y + rr * 0.5, rr * 0.8);
        else { o.tree += circ(x, y, rr) + (v > 0.5 ? circ(x + rr * 1.2, y + rr * 0.6, rr * 0.85) : ''); o.treeHi += circ(x - rr * 0.3, y - rr * 0.35, rr * 0.4); }
      } else if (t === 'w') {
        o.marsh += `M${x - 2.2 * k},${y}h${4.4 * k}M${x - 1.2 * k},${y + 1.3 * k}h${2.4 * k}M${x + 0.2 * k},${y}l-0.6,${-1.6 * k}M${x + 0.8 * k},${y}l0.4,${-1.4 * k}`;
      } else if (t === 'd') {
        o.dune += `M${x - 2.8 * k},${y + 0.4 * k}Q${x - 0.6 * k},${y - 1.6 * k} ${x + 2.8 * k},${y + 0.4 * k}`;
      } else if (v > 0.5) {
        o.field += `M${x - 1.4 * k},${y}h${2.8 * k}`;
      }
    }
    return o;
  }, [g]);
  return (
    <g pointerEvents="none" opacity={(strong ? 1 : 0.55) * (subtle ? 0.6 : 1)}>
      <path d={paths.field} stroke="#5a4a2a" strokeOpacity=".35" strokeWidth={0.5} fill="none" />
      <path d={paths.dune} stroke="#7a5a2a" strokeOpacity=".55" strokeWidth={0.6} fill="none" />
      <path d={paths.marsh} stroke="#2e4a3e" strokeOpacity=".6" strokeWidth={0.55} fill="none" />
      <path d={paths.hill} stroke="#4a3a22" strokeOpacity=".6" strokeWidth={0.7} fill="none" />
      <path d={paths.tree} fill="#24401f" fillOpacity=".55" />
      <path d={paths.jungle} fill="#173a1c" fillOpacity=".6" />
      <path d={paths.treeHi} fill="#d9e6b0" fillOpacity=".25" />
      <path d={paths.mLight} fill="#f4ecd8" fillOpacity=".5" />
      <path d={paths.mShade} fill="#2e2418" fillOpacity=".55" />
      <path d={paths.mLine} stroke="#2a2016" strokeOpacity=".7" strokeWidth={0.45} fill="none" strokeLinejoin="round" />
      <path d={paths.snow} fill="#ffffff" fillOpacity=".9" />
    </g>
  );
}, (a, b) => a.g === b.g && a.strong === b.strong && a.subtle === b.subtle);

const Borders = memo(function Borders({ s, g }: { s: GameState; version: number; g: MapGeometry; mode: MapMode }) {
  const ownersKey = Object.values(s.provinces).map((p) => p.owner).join();
  const { coast, prov, vassal, nat } = useMemo(() => {
    let coast = '', prov = '', vassal = '', nat = '';
    for (const e of g.edges) {
      if (!e.b) { coast += e.d; continue; }
      const A = s.provinces[e.a]?.owner ?? null, B = s.provinces[e.b]?.owner ?? null;
      if (A === B) prov += e.d;
      else if (A && B && topLiege(s, A) === topLiege(s, B)) vassal += e.d;
      else nat += e.d;
    }
    return { coast, prov, vassal, nat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, ownersKey]);
  return (
    <g pointerEvents="none" fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d={prov} stroke="#2a1f12" strokeOpacity=".3" strokeWidth={0.7} strokeDasharray="2.5 2" vectorEffect="non-scaling-stroke" />
      <path d={vassal} stroke="#1a120a" strokeOpacity=".6" strokeWidth={1.3} strokeDasharray="6 3" vectorEffect="non-scaling-stroke" />
      <path d={nat} stroke="#1a120a" strokeOpacity=".85" strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
      <path d={nat} stroke="#fff5d8" strokeOpacity=".2" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      <path d={coast} stroke="#2a1d10" strokeOpacity=".9" strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
    </g>
  );
}, (a, b) => a.version === b.version && a.g === b.g);

/** large curved realm names (zoomed out) and province names (zoomed in) */
const Labels = memo(function Labels({ s, g, ppu }: { s: GameState; version: number; g: MapGeometry; ppu: number }) {
  const realms = useMemo(() => {
    const byOwner: Record<string, string[]> = {};
    for (const p of Object.values(s.provinces)) if (p.owner) (byOwner[p.owner] ??= []).push(p.id);
    const out: { tag: string; name: string; d: string; fs: number; id: string; light: boolean }[] = [];
    for (const [tag, ids] of Object.entries(byOwner)) {
      const nat = s.nations[tag];
      if (!nat) continue;
      const comp = components(ids, g.touches)[0];
      const pts = comp.map((id) => g.centroids[id]);
      const wts = comp.map((id) => Math.sqrt(g.areas[id] || 1));
      const W = wts.reduce((a, b) => a + b, 0);
      const mx = pts.reduce((a, p, i) => a + p[0] * wts[i], 0) / W, my = pts.reduce((a, p, i) => a + p[1] * wts[i], 0) / W;
      let sxx = 0, syy = 0, sxy = 0;
      pts.forEach((p, i) => { const dx = p[0] - mx, dy = p[1] - my; sxx += dx * dx * wts[i]; syy += dy * dy * wts[i]; sxy += dx * dy * wts[i]; });
      let ang = comp.length > 1 ? 0.5 * Math.atan2(2 * sxy, sxx - syy) : 0;
      ang = Math.max(-0.55, Math.min(0.55, ang > Math.PI / 2 ? ang - Math.PI : ang < -Math.PI / 2 ? ang + Math.PI : ang));
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const ts = pts.map((p) => (p[0] - mx) * ux + (p[1] - my) * uy);
      const ns = pts.map((p) => -(p[0] - mx) * uy + (p[1] - my) * ux);
      const meanR = Math.sqrt(comp.reduce((a, id) => a + (g.areas[id] || 0), 0) / comp.length) * 0.55;
      const L = Math.max(...ts) - Math.min(...ts) + meanR * 1.3;
      const thick = Math.max(...ns) - Math.min(...ns) + meanR * 1.2;
      const name = nat.name.toUpperCase();
      let fs = Math.min(L / (name.length * 0.72 + 0.6), thick * 0.62, 130);
      fs = Math.max(fs, meanR * 0.32);
      const tc = (Math.max(...ts) + Math.min(...ts)) / 2;
      const cx = mx + ux * tc, cy = my + uy * tc;
      const half = L / 2;
      const sag = comp.length > 2 ? L * 0.03 : 0;
      const ext = half * 3; // long path so text never runs off the end; text is centred
      const ax = cx - ux * ext, ay = cy - uy * ext + sag * 4, bx = cx + ux * ext, by = cy + uy * ext + sag * 4;
      const qx = cx + uy * sag * 4, qy = cy - ux * sag * 4;
      const d = `M${ax.toFixed(1)},${(ay + fs * 0.35).toFixed(1)} Q${qx.toFixed(1)},${(qy + fs * 0.35).toFixed(1)} ${bx.toFixed(1)},${(by + fs * 0.35).toFixed(1)}`;
      const v = parseInt((nat.color || '#888').replace('#', '').slice(0, 6), 16);
      const lum = 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
      out.push({ tag, name, d, fs, id: `rl-${tag.replace(/[^a-zA-Z0-9]/g, '')}`, light: lum < 105 });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, Object.values(s.provinces).map((p) => p.owner).join(), Object.values(s.nations).map((n) => n.name).join()]);

  const showProv = ppu > 1.5;
  const provFs = 10.5 / ppu;
  return (
    <g pointerEvents="none">
      <defs>{realms.map((r) => <path key={r.id} id={r.id} d={r.d} />)}</defs>
      {realms.map((r) => {
        const px = r.fs * ppu;
        if (px < 7) return null;
        const op = Math.max(0.22, Math.min(0.82, 0.82 - (ppu - 1.3) * 0.35));
        return (
          <text key={r.tag} className={`realm-label ${r.light ? 'light' : ''}`} fontSize={r.fs} opacity={op} letterSpacing={r.fs * 0.14}>
            <textPath href={`#${r.id}`} startOffset="50%" textAnchor="middle">{r.name}</textPath>
          </text>
        );
      })}
      {showProv && Object.values(s.provinces).map((p) => {
        const [x, y] = g.centroids[p.id];
        return <text key={`t${p.id}`} className="prov-label" x={x} y={y + provFs * 1.25} fontSize={provFs} textAnchor="middle" strokeWidth={provFs * 0.28}>{p.name}</text>;
      })}
    </g>
  );
}, (a, b) => a.version === b.version && a.g === b.g && Math.abs(a.ppu - b.ppu) / b.ppu < 0.08);

export default MapView;
