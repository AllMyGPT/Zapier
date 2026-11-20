// Mulberry32 seeded PRNG so results are reproducible from a saved seed.
export class Rng {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0 || 1; }
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  get state() { return this.s; }
  int(min: number, max: number) { return Math.floor(this.next() * (max - min + 1)) + min; }
  range(min: number, max: number) { return min + this.next() * (max - min); }
  chance(p: number) { return this.next() < p; }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  gauss(mean = 0, sd = 1) {
    const u = 1 - this.next(), v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  weighted<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + Math.max(0, b), 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) { r -= Math.max(0, weights[i]); if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
}
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
