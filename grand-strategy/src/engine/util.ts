import type { GameState } from './types';

// ---- Deterministic RNG (mulberry32), state kept inside GameState so saves replay identically.
export function rand(s: GameState): number {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const randInt = (s: GameState, min: number, max: number) => min + Math.floor(rand(s) * (max - min + 1));
export const chance = (s: GameState, p: number) => rand(s) < p;
export function pick<T>(s: GameState, arr: T[]): T {
  return arr[Math.floor(rand(s) * arr.length)];
}
export const uid = (s: GameState, prefix: string) => `${prefix}${s.nextId++}`;
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- Calendar (day index since 0001-01-01 UTC)
function utc(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(2000, m - 1, d));
  dt.setUTCFullYear(y);
  return dt.getTime();
}
const BASE = utc(1, 1, 1);
export function dayFromISO(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((utc(y, m, d) - BASE) / 86400000);
}
export function dateOf(day: number): { y: number; m: number; d: number } {
  const dt = new Date(BASE + day * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function formatDate(day: number): string {
  const { y, m, d } = dateOf(day);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}
export const yearsBetween = (a: number, b: number) => (b - a) / 365.25;
