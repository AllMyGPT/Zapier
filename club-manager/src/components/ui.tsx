'use client';
import React from 'react';
import type { Club, Player } from '@/game/types';
import { POS_GROUP, POS_LABEL, flag, ovr } from '@/game/player';

export function ovrColor(v: number) {
  if (v >= 85) return ['#1a7f4b', '#b8ffd6'];
  if (v >= 78) return ['#2f8f3a', '#e2ffd2'];
  if (v >= 70) return ['#7a8a1f', '#fbffd0'];
  if (v >= 62) return ['#8f6a1f', '#ffeccc'];
  return ['#7a2f35', '#ffd6da'];
}
export function Ovr({ v }: { v: number }) { const [bg, fg] = ovrColor(v); return <span className="ovr" style={{ background: bg, color: fg }}>{Math.round(v)}</span>; }
export function PosBadge({ pos }: { pos: Player['pos'] }) { return <span className={`pos ${POS_GROUP[pos]}`}>{POS_LABEL[pos]}</span>; }
export function Flag({ nat }: { nat: string }) { return <span title={nat} style={{ marginRight: 4 }}>{flag(nat)}</span>; }

export function Bar({ v, max = 100, color }: { v: number; max?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  const c = color ?? (pct > 75 ? 'var(--good)' : pct > 50 ? 'var(--accent)' : pct > 30 ? 'var(--warn)' : 'var(--bad)');
  return <div className="bar"><i style={{ width: `${pct}%`, background: c }} /></div>;
}

function initials(name: string) {
  const words = name.replace(/\b(FC|CF|AC|AS|SS|SC|RC|CD|UD|SD|CA|RCD|AFC|VfB|VfL|TSG|SV|1\.|FSV|OGC|LOSC|Stade|Real|Club|de|del|la|Olympique)\b/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Procedurally generated crest (not the official badge). */
export function Crest({ club, size = 36 }: { club: Pick<Club, 'colors' | 'name' | 'short' | 'id'>; size?: number }) {
  const [a, b] = club.colors;
  let h = 0; for (const ch of club.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const style = h % 4;
  const id = `cr-${club.id}`;
  const txt = initials(club.name);
  const light = (hex: string) => { const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 150; };
  const textColor = light(style === 1 ? b : a) ? '#0b1220' : '#ffffff';
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.4))' }}>
      <defs>
        <clipPath id={id}><path d="M50 3 L95 15 L92 60 Q88 95 50 112 Q12 95 8 60 L5 15 Z" /></clipPath>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="100" height="115" fill={a} />
        {style === 0 && [0, 1, 2, 3, 4].map(i => i % 2 ? <rect key={i} x={i * 20} y="0" width="20" height="115" fill={b} /> : null)}
        {style === 1 && <rect width="100" height="115" fill={b} />}
        {style === 1 && <rect x="0" y="40" width="100" height="26" fill={a} />}
        {style === 2 && <path d="M0 0 L100 0 L100 115 Z" fill={b} />}
        {style === 3 && <rect x="0" y="0" width="100" height="38" fill={b} />}
        <rect width="100" height="115" fill={`url(#${id}g)`} />
      </g>
      <path d="M50 3 L95 15 L92 60 Q88 95 50 112 Q12 95 8 60 L5 15 Z" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="4" />
      <text x="50" y={txt.length > 2 ? 68 : 72} textAnchor="middle" fontFamily="Barlow Condensed, Arial Narrow, sans-serif" fontWeight="800" fontSize={txt.length > 2 ? 27 : 38} fill={textColor} stroke={textColor === '#ffffff' ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.4)'} strokeWidth="1.5">{txt}</text>
    </svg>
  );
}

export function Modal({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={wide ? { width: 'min(1200px, 100%)' } : undefined}>
        <button className="btn sm ghost x" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export function Stars({ v }: { v: number }) {
  const n = Math.max(0.5, Math.min(5, v));
  return <span className="stars">{'★'.repeat(Math.floor(n))}{n % 1 >= 0.5 ? '½' : ''}<span style={{ opacity: .25 }}>{'★'.repeat(5 - Math.ceil(n))}</span></span>;
}

export function FormDots({ form }: { form: string[] }) {
  return <span>{form.slice(-5).map((f, i) => <span key={i} className={`form-dot ${f}`}>{f}</span>)}</span>;
}

export function RatingCell({ p }: { p: Player }) { return <Ovr v={ovr(p)} />; }

export function useSort<T>(rows: T[], init: string, getters: Record<string, (r: T) => number | string>) {
  const [key, setKey] = React.useState(init);
  const [dir, setDir] = React.useState<1 | -1>(-1);
  const sorted = React.useMemo(() => {
    const g = getters[key]; if (!g) return rows;
    return rows.slice().sort((a, b) => { const x = g(a), y = g(b); return (x < y ? -1 : x > y ? 1 : 0) * dir; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, key, dir]);
  const th = (k: string, label: string, cls = '') => (
    <th className={`sort ${cls}`} onClick={() => { if (k === key) setDir(d => (d === 1 ? -1 : 1)); else { setKey(k); setDir(-1); } }}>{label}{key === k ? (dir === -1 ? ' ▾' : ' ▴') : ''}</th>
  );
  return { sorted, th };
}
