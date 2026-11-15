'use client';
import { memo, type ReactElement } from 'react';

/** Procedural coat of arms: deterministic from the nation tag, tinted with the nation colour. Original heraldry, no real emblems. */

function hash(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const pick = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];

function shade(hex: string, k: number) {
  const v = parseInt(hex.replace('#', '').slice(0, 6), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  const [r, g, b] = [f((v >> 16) & 255), f((v >> 8) & 255), f(v & 255)];
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
function lum(hex: string) {
  const v = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
}

const METALS = ['#e9c766', '#ece6d6']; // or, argent
const SHIELD = 'M4 3h32v14c0 11-8 17-16 21C12 34 4 28 4 17Z';

const ORDINARIES: ((c: string) => ReactElement)[] = [
  (c) => <rect x="15" y="0" width="10" height="44" fill={c} />, // pale
  (c) => <rect x="0" y="13" width="40" height="9" fill={c} />, // fess
  (c) => <path d="M-2 4 L6 -2 L44 34 L36 42Z" fill={c} />, // bend
  (c) => <path d="M0 30 L20 12 L40 30 L40 38 L20 20 L0 38Z" fill={c} />, // chevron
  (c) => <g fill={c}><rect x="16" y="0" width="8" height="44" /><rect x="0" y="13" width="40" height="8" /></g>, // cross
  (c) => <path d="M0 0h6l34 34v8h-6L0 8ZM40 0h-6L0 34v8h6L40 8Z" fill={c} />, // saltire
  (c) => <g fill={c}><rect x="0" y="0" width="20" height="17" /><rect x="20" y="17" width="20" height="30" /></g>, // quarterly
  (c) => <rect x="20" y="0" width="20" height="44" fill={c} />, // per pale
  (c) => <rect x="0" y="0" width="40" height="11" fill={c} />, // chief
  (c) => <g fill={c}>{[0, 1, 2].map((i) => <rect key={i} x="0" y={6 + i * 10} width="40" height="5" />)}</g>, // barry
];

const CHARGES: ((c: string) => ReactElement)[] = [
  (c) => <path d="M20 9l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L20 23.1l-5.8 3.5 1.6-6.5-5.1-4.4 6.7-.5Z" fill={c} />, // mullet
  (c) => <circle cx="20" cy="18" r="6" fill={c} />, // roundel
  (c) => <path d="M20 10l6 8-6 8-6-8Z" fill={c} />, // lozenge
  (c) => <circle cx="20" cy="18" r="5.5" fill="none" stroke={c} strokeWidth="2.6" />, // annulet
  (c) => <path d="M20 9l3 4.5h-1.6v3.1h3.1V15L29 18l-4.5 3v-1.6h-3.1v3.1H23L20 27l-3-4.5h1.6v-3.1h-3.1V21L11 18l4.5-3v1.6h3.1v-3.1H17Z" fill={c} />, // cross pattée-ish
  (c) => <path d="M12 23l3-11 5 6 5-6 3 11Z M12 24h16v3H12Z" fill={c} />, // crown
  (c) => <path d="M20 8 L22 16 L30 18 L22 20 L20 28 L18 20 L10 18 L18 16Z" fill={c} />, // compass star
  (c) => <path d="M13 26 L20 9 L27 26 L23 26 L20 18 L17 26Z" fill={c} />, // tower/peak
];

function Arms({ tag, color, size = 22, title }: { tag: string; color: string; size?: number; title?: string }) {
  const base = color || '#777';
  const metal = lum(base) > 150 ? '#3b2f22' : pick(METALS, hash(tag, 1));
  const field = shade(base, -0.08);
  const ord = pick(ORDINARIES, hash(tag, 2));
  const charge = hash(tag, 3) > 0.35 ? pick(CHARGES, hash(tag, 4)) : null;
  const chargeColor = hash(tag, 5) > 0.5 ? metal : shade(base, lum(base) > 150 ? -0.55 : 0.55);
  const id = `arms-${tag.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className="arms" width={size} height={size * 1.1} viewBox="0 0 40 44" aria-label={title} role="img">
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={`${id}-c`}><path d={SHIELD} /></clipPath>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="40" height="44" fill={field} />
        {ord(metal)}
        {charge && charge(chargeColor)}
        <rect width="40" height="44" fill={`url(#${id}-g)`} />
      </g>
      <path d={SHIELD} fill="none" stroke="#1a130a" strokeWidth="2.2" />
      <path d={SHIELD} fill="none" stroke="#d6b062" strokeWidth="1" />
    </svg>
  );
}

export default memo(Arms);
