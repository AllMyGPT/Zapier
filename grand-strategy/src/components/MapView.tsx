'use client';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { MAPS } from '@/data/maps';
import { isHostile, rules, topLiege } from '@/engine/core';
import type { GameState, Province } from '@/engine/types';
import { geometry } from '@/lib/geometry';

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

function baseColor(s: GameState, p: Province, mode: MapMode): string {
  if (mode === 'political') return p.owner ? s.nations[p.owner]?.color ?? '#777' : '#4b4b45';
  if (mode === 'terrain') return ({ p: '#7d9a52', f: '#3f6b3a', h: '#9a8a55', m: '#8a8279', w: '#5d7a6a', d: '#cdb57a', j: '#2f6b3f' } as Record<string, string>)[p.terrain];
  if (mode === 'diplomatic') {
    const pl = s.player;
    if (!p.owner) return '#4b4b45';
    if (p.owner === pl) return '#d9a441';
    if (topLiege(s, p.owner) === pl) return '#e8cf87';
    if (isHostile(s, pl, p.owner)) return '#c8553d';
    if (s.nations[pl].allies.includes(p.owner)) return '#5fa86b';
    const rel = s.nations[pl].relations[p.owner] ?? 0;
    return rel > 50 ? '#7fa7c9' : rel < -50 ? '#8a6060' : '#777b80';
  }
  const m = rules(s).mapModes.find((x) => x.id === mode);
  return m ? m.color(s, p) : '#777';
}

function MapView({ s, version, mode, selectedProvince, selectedArmy, onProvince, onArmy }: Props) {
  const g = useMemo(() => geometry(s.mapId), [s.mapId]);
  const svgRef = useRef<SVGSVGElement>(null);
  // initial view: fit provinces that have an owner
  const initial = useMemo(() => {
    // centre on the player's realm, with at least a sub-continental span
    const mine = Object.values(s.provinces).filter((p) => p.owner === s.player).map((p) => g.centers[p.id]);
    const owned = (mine.length ? mine : Object.values(s.provinces).filter((p) => p.owner).map((p) => g.centers[p.id]));
    const xs = owned.map((c) => c[0]), ys = owned.map((c) => c[1]);
    const pad = 60;
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const w = Math.max(700, Math.max(...xs) - Math.min(...xs) + pad * 2), h = Math.max(500, Math.max(...ys) - Math.min(...ys) + pad * 2);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.scenarioId, g]);
  const [view, setView] = useState(initial);
  useEffect(() => setView(initial), [initial]);
  type Drag = { x: number; y: number; vx: number; vy: number; moved: boolean; pointers: Map<number, [number, number]>; pinch?: number };
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);

  const toWorld = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const scale = Math.max(view.w / r.width, view.h / r.height);
    const ox = view.x + (view.w - r.width * scale) / 2, oy = view.y + (view.h - r.height * scale) / 2;
    return { x: ox + (clientX - r.left) * scale, y: oy + (clientY - r.top) * scale, scale };
  };
  const zoom = (factor: number, cx: number, cy: number) => {
    const w = toWorld(cx, cy);
    setView((v) => {
      const nw = Math.min(g.width * 1.2, Math.max(120, v.w * factor));
      const k = nw / v.w;
      return { x: w.x - (w.x - v.x) * k, y: w.y - (w.y - v.y) * k, w: nw, h: v.h * k };
    });
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const armies = Object.values(s.armies);
  const byLoc: Record<string, typeof armies> = {};
  for (const a of armies) (byLoc[a.location] ??= []).push(a);
  const selArmy = selectedArmy ? s.armies[selectedArmy] : null;
  const font = Math.max(7, view.w / 140);

  return (
    <svg
      ref={svgRef}
      className={dragging ? 'dragging' : ''}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMid meet"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        const d: Drag = drag.current ?? { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false, pointers: new Map() };
        d.pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (d.pointers.size === 2) { const [a, b] = [...d.pointers.values()]; d.pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
        else { d.x = e.clientX; d.y = e.clientY; d.vx = view.x; d.vy = view.y; d.moved = false; }
        drag.current = d;
      }}
      onPointerMove={(e) => {
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
          const r = svgRef.current!.getBoundingClientRect();
          const scale = Math.max(view.w / r.width, view.h / r.height);
          setView((v) => ({ ...v, x: d.vx - dx * scale, y: d.vy - dy * scale }));
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
          drag.current = null;
          setDragging(false);
        }
      }}
    >
      <rect x={g.minX} y={g.minY} width={g.width} height={g.height} fill={MAPS[s.mapId].seaColor} />
      <Provinces s={s} version={version} mode={mode} cells={g.cells} />
      {/* occupation stripes */}
      <defs>
        <pattern id="occ" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="#000" opacity=".45" /></pattern>
      </defs>
      {Object.values(s.provinces).filter((p) => p.controller && p.controller !== p.owner).map((p) => (
        <path key={`o${p.id}`} d={g.cells[p.id]} fill="url(#occ)" stroke={s.nations[p.controller!]?.color ?? '#000'} strokeWidth={1.2} pointerEvents="none" />
      ))}
      {selectedProvince && <path d={g.cells[selectedProvince]} fill="none" stroke="#fff" strokeWidth={2.5} pointerEvents="none" />}
      {/* labels */}
      {view.w < 1400 && Object.values(s.provinces).map((p) => {
        const [x, y] = g.centers[p.id];
        return <text key={`t${p.id}`} x={x} y={y + font * 1.9} fontSize={font * 0.8} textAnchor="middle" fill="#000a" pointerEvents="none" style={{ fontFamily: 'var(--serif)' }}>{p.name}</text>;
      })}
      {Object.values(s.provinces).filter((p) => p.siege).map((p) => {
        const [x, y] = g.centers[p.id];
        return <text key={`s${p.id}`} x={x} y={y - font * 1.5} fontSize={font} textAnchor="middle" pointerEvents="none">🔥</text>;
      })}
      {Object.values(s.provinces).filter((p) => p.x.cot).map((p) => {
        const [x, y] = g.centers[p.id];
        return <text key={`c${p.id}`} x={x + font * 1.6} y={y - font} fontSize={font} fill="#ffd76a" pointerEvents="none">★</text>;
      })}
      {/* movement path */}
      {selArmy && selArmy.path.length > 0 && (
        <polyline points={[selArmy.location, ...selArmy.path].map((pid) => g.centers[pid].join(',')).join(' ')} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="6 4" pointerEvents="none" />
      )}
      {Object.entries(byLoc).map(([pid, list]) => list.map((a, i) => {
        const [cx, cy] = g.centers[pid];
        const x = cx - font * 1.6 + i * font * 0.9, y = cy - font * 0.7 + i * font * 0.5;
        const color = a.owner === 'REB' ? '#111' : s.nations[a.owner]?.color ?? '#888';
        const sel = a.id === selectedArmy;
        const n = a.units.length;
        const org = a.units.reduce((t, u) => t + u.org, 0) / Math.max(1, n);
        return (
          <g key={a.id} data-aid={a.id} style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={font * 3.2} height={font * 1.5} rx={2} fill={color} stroke={sel ? '#fff' : a.inBattle ? '#ff5533' : '#000'} strokeWidth={sel ? 2 : 1} />
            <rect x={x} y={y + font * 1.5} width={font * 3.2 * org} height={font * 0.25} fill="#7bd17b" />
            <text x={x + font * 1.6} y={y + font * 1.12} fontSize={font} textAnchor="middle" fill={contrast(color)} fontWeight={700}>{a.inBattle ? '⚔' : ''}{n}</text>
          </g>
        );
      }))}
    </svg>
  );
}

const Provinces = memo(function Provinces({ s, mode, cells }: { s: GameState; version: number; mode: MapMode; cells: Record<string, string> }) {
  return (
    <g>
      {Object.values(s.provinces).map((p) => (
        <path key={p.id} data-pid={p.id} d={cells[p.id]} fill={baseColor(s, p, mode)} stroke="#0008" strokeWidth={0.7} style={{ cursor: 'pointer' }}>
          <title>{p.name}{p.owner ? ` — ${s.nations[p.owner]?.name}` : ''}</title>
        </path>
      ))}
    </g>
  );
}, (a, b) => a.version === b.version && a.mode === b.mode);

function contrast(hex: string) {
  const v = parseInt(hex.replace('#', '').slice(0, 6), 16);
  const l = 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
  return l > 150 ? '#111' : '#fff';
}

export default MapView;
