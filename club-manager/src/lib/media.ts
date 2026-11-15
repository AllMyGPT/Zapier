'use client';
import { useEffect, useState } from 'react';

/** Real crests and player photos (Wikipedia / Wikimedia Commons URLs), loaded lazily from /media.json. */
type Hit = { url: string; page: string };
type Media = { clubs: Record<string, Hit>; players: Record<string, Hit> };

const KEY = 'pizarra.realMedia';
let data: Media | null = null;
let loading: Promise<void> | null = null;
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== '0'; } catch { /* storage unavailable */ }
const subs = new Set<() => void>();
const notify = () => subs.forEach(f => f());

function load() {
  if (!loading) loading = fetch('/media.json').then(r => (r.ok ? r.json() : null)).then(j => { data = j; notify(); }).catch(() => { /* keep generated art */ });
  return loading;
}

export function realMediaEnabled() { return enabled; }
export function setRealMedia(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* ignore */ }
  notify();
}

/** Re-renders the caller when media loads or the toggle changes. */
export function useMedia() {
  const [, set] = useState(0);
  useEffect(() => { const f = () => set(x => x + 1); subs.add(f); load(); return () => { subs.delete(f); }; }, []);
  return {
    on: enabled,
    crest: (clubId: string) => (enabled ? data?.clubs[clubId]?.url : undefined),
    photo: (name: string, born: number) => (enabled ? data?.players[`${name}|${born}`]?.url : undefined),
  };
}

/** Images that failed to load are remembered so we fall back to generated art without flicker. */
const broken = new Set<string>();
export const isBroken = (u: string) => broken.has(u);
export const markBroken = (u: string) => { broken.add(u); notify(); };
