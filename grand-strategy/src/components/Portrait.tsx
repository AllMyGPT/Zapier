'use client';
import { useEffect, useState } from 'react';
import { legacyPortrait } from '@/lib/art';

/** Oil portrait in a gilt frame, tinted with the realm colour; falls back to a painted silhouette if the image is missing. */
export default function Portrait({ src, color = '#6b5a3a', size = 72, dead = false, title, badge, seed }: { src: string; color?: string; size?: number; dead?: boolean; title?: string; badge?: string; seed?: string }) {
  const [ok, setOk] = useState(true);
  // small per-person variation (mirror and tone) so shared portraits read as different people
  let h = 0; for (const ch of seed ?? '') h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  const vary = seed ? { transform: h % 2 ? 'scaleX(-1)' : undefined, filter: `saturate(${0.9 + (h % 7) * 0.04}) hue-rotate(${(h % 11) - 5}deg) brightness(${0.95 + (h % 5) * 0.025})` } : undefined;
  const [cur, setCur] = useState(src);
  useEffect(() => { setCur(src); setOk(true); }, [src]);
  return (
    <div className={`portrait ${dead ? 'dead' : ''}`} style={{ width: size, height: size * 1.25, ['--nc' as string]: color }} title={title}>
      {ok ? <img src={cur} style={vary} alt={title ?? ''} onError={() => { const l = legacyPortrait(cur); if (l && l !== cur) setCur(l); else setOk(false); }} draggable={false} /> : (
        <svg viewBox="0 0 60 75" className="silhouette"><path d="M30 14a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm-20 61c0-14 9-24 20-24s20 10 20 24Z" fill="#00000066" /></svg>
      )}
      {badge && <span className="badge">{badge}</span>}
    </div>
  );
}
