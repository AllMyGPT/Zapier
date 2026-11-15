import type { Attrs, AttrKey, Player, Pos } from './types';
import { Rng } from './rng';

export const ATTR_KEYS: AttrKey[] = ['pac', 'sho', 'pas', 'dri', 'def', 'hea', 'sta', 'gk'];
export const ATTR_LABEL: Record<AttrKey, string> = {
  pac: 'Velocidad', sho: 'Remate', pas: 'Pase', dri: 'Técnica', def: 'Defensa', hea: 'Juego aéreo', sta: 'Resistencia', gk: 'Portería',
};
export const ATTR_SHORT: Record<AttrKey, string> = { pac: 'VEL', sho: 'REM', pas: 'PAS', dri: 'TEC', def: 'DEF', hea: 'AER', sta: 'RES', gk: 'POR' };

export const POS_LABEL: Record<Pos, string> = {
  GK: 'POR', CB: 'DFC', LB: 'LI', RB: 'LD', DM: 'MCD', CM: 'MC', AM: 'MP', LW: 'EI', RW: 'ED', ST: 'DC',
};
export const POS_ORDER: Pos[] = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
export const POS_GROUP: Record<Pos, 'POR' | 'DEF' | 'MED' | 'DEL'> = {
  GK: 'POR', CB: 'DEF', LB: 'DEF', RB: 'DEF', DM: 'MED', CM: 'MED', AM: 'MED', LW: 'DEL', RW: 'DEL', ST: 'DEL',
};

export const WEIGHTS: Record<Pos, Partial<Record<AttrKey, number>>> = {
  GK: { gk: 0.82, pas: 0.06, pac: 0.04, hea: 0.04, sta: 0.04 },
  CB: { def: 0.42, hea: 0.2, pac: 0.12, pas: 0.1, sta: 0.1, dri: 0.06 },
  LB: { def: 0.3, pac: 0.22, sta: 0.15, pas: 0.14, dri: 0.12, hea: 0.05, sho: 0.02 },
  RB: { def: 0.3, pac: 0.22, sta: 0.15, pas: 0.14, dri: 0.12, hea: 0.05, sho: 0.02 },
  DM: { def: 0.3, pas: 0.25, sta: 0.15, hea: 0.08, dri: 0.1, pac: 0.07, sho: 0.05 },
  CM: { pas: 0.3, dri: 0.18, sta: 0.14, def: 0.14, sho: 0.1, pac: 0.08, hea: 0.06 },
  AM: { pas: 0.28, dri: 0.26, sho: 0.2, pac: 0.1, sta: 0.08, hea: 0.03, def: 0.05 },
  LW: { pac: 0.26, dri: 0.28, sho: 0.16, pas: 0.16, sta: 0.09, hea: 0.02, def: 0.03 },
  RW: { pac: 0.26, dri: 0.28, sho: 0.16, pas: 0.16, sta: 0.09, hea: 0.02, def: 0.03 },
  ST: { sho: 0.36, pac: 0.16, dri: 0.16, hea: 0.14, pas: 0.08, sta: 0.07, def: 0.03 },
};

const clamp = (v: number, a = 1, b = 99) => Math.max(a, Math.min(b, Math.round(v)));

export function ratingAt(attrs: Attrs, pos: Pos): number {
  const w = WEIGHTS[pos];
  let s = 0;
  for (const k of ATTR_KEYS) s += (w[k] ?? 0) * attrs[k];
  return s;
}

export function ovr(p: Player): number { return Math.round(ratingAt(p.attrs, p.pos)); }

export function genAttrs(pos: Pos, target: number, rng: Rng): Attrs {
  const w = WEIGHTS[pos];
  const a = {} as Attrs;
  for (const k of ATTR_KEYS) {
    const wk = w[k] ?? 0;
    let off: number;
    if (wk >= 0.2) off = 3; else if (wk >= 0.1) off = 0; else if (wk >= 0.05) off = -6; else if (wk > 0) off = -14; else off = -32;
    a[k] = clamp(target + off + rng.gauss(0, 4.5), 5, 97);
  }
  if (pos === 'GK') { a.sho = clamp(rng.range(12, 35)); a.dri = clamp(rng.range(20, 45)); a.def = clamp(rng.range(15, 35)); }
  else a.gk = clamp(rng.range(5, 18));
  for (let it = 0; it < 4; it++) {
    const cur = ratingAt(a, pos);
    const d = target - cur;
    if (Math.abs(d) < 0.5) break;
    for (const k of ATTR_KEYS) if ((w[k] ?? 0) > 0) a[k] = clamp(a[k] + d, 5, 99);
  }
  return a;
}

export function age(p: { born: number }, season: number) { return season - p.born; }

/** Market value. Real players carry their Transfermarkt value as an anchor: the model only moves it
 *  as much as the player's rating, age and contract have changed since it was recorded. */
export function marketValue(p: Player, season: number): number {
  const model = modelValue(p, season);
  if (!p.tmValue || !p.tmRef) return roundMoney(model);
  const ratio = Math.max(0.35, Math.min(2.5, model / p.tmRef));
  return roundMoney(Math.max(25_000, p.tmValue * ratio));
}

export function modelValue(p: Player, season: number): number {
  const o = ovr(p);
  const a = age(p, season);
  let v = 1_000_000 * Math.exp((o - 60) * 0.168);
  const gap = Math.max(0, p.pot - o);
  if (a <= 21) v *= 1 + gap * 0.05;
  else if (a <= 24) v *= 1 + gap * 0.03;
  else if (a <= 27) v *= 1;
  else if (a <= 29) v *= 0.85;
  else if (a === 30) v *= 0.68;
  else if (a === 31) v *= 0.52;
  else if (a === 32) v *= 0.38;
  else v *= 0.24;
  const yrs = p.contractEnd - season;
  if (yrs <= 0) v *= 0.45; else if (yrs === 1) v *= 0.75;
  if (p.injury > 60) v *= 0.8;
  if (v < 25_000) v = 25_000;
  return v;
}

export function fairWage(p: Player, season: number, clubRep = 75): number {
  const o = ovr(p);
  let w = 4000 * Math.exp((o - 60) * 0.15);
  const a = age(p, season);
  if (a <= 20) w *= 0.6;
  w *= 0.75 + clubRep / 300;
  return roundMoney(Math.max(800, w));
}

export function roundMoney(v: number) {
  if (v >= 10_000_000) return Math.round(v / 500_000) * 500_000;
  if (v >= 1_000_000) return Math.round(v / 100_000) * 100_000;
  if (v >= 100_000) return Math.round(v / 10_000) * 10_000;
  return Math.round(v / 1000) * 1000;
}

const FAMILY: Record<Pos, Partial<Record<Pos, number>>> = {
  GK: {},
  CB: { DM: -4, RB: -6, LB: -6 },
  LB: { RB: -4, LW: -7, CB: -6, DM: -10 },
  RB: { LB: -4, RW: -7, CB: -6, DM: -10 },
  DM: { CM: -2, CB: -5, AM: -9 },
  CM: { DM: -3, AM: -3, LW: -9, RW: -9 },
  AM: { CM: -3, LW: -5, RW: -5, ST: -6, DM: -9 },
  LW: { RW: -3, AM: -5, ST: -5, LB: -12 },
  RW: { LW: -3, AM: -5, ST: -5, RB: -12 },
  ST: { AM: -6, LW: -5, RW: -5 },
};

/** Effective rating of a player when deployed at a slot position. */
export function slotRating(p: Player, slot: Pos): number {
  if (p.pos === slot) return ratingAt(p.attrs, slot);
  if (slot === 'GK' || p.pos === 'GK') return Math.min(30, ratingAt(p.attrs, slot) - 20);
  const pen = FAMILY[p.pos][slot] ?? -14;
  return ratingAt(p.attrs, slot) + pen * 0.6 + Math.min(0, pen) * 0.2;
}

export function emptyStats() { return { apps: 0, goals: 0, assists: 0, cs: 0, ratingSum: 0, yel: 0, red: 0 }; }

export function avgRating(p: Player) { return p.stats.apps ? p.stats.ratingSum / p.stats.apps : 0; }

export function playerStatus(p: Player): string {
  if (p.injury > 0) return `Lesionado (${Math.ceil(p.injury / 7)} sem.)`;
  if (p.susp > 0) return `Sancionado (${p.susp})`;
  return '';
}

export function available(p: Player) { return p.injury <= 0 && p.susp <= 0; }

export const NAT_FLAG: Record<string, string> = {
  ESP: '🇪🇸', ENG: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', FRA: '🇫🇷', GER: '🇩🇪', ITA: '🇮🇹', POR: '🇵🇹', BRA: '🇧🇷', ARG: '🇦🇷', NED: '🇳🇱', BEL: '🇧🇪', URU: '🇺🇾', CRO: '🇭🇷',
  NOR: '🇳🇴', DEN: '🇩🇰', SWE: '🇸🇪', SUI: '🇨🇭', AUT: '🇦🇹', POL: '🇵🇱', SRB: '🇷🇸', COL: '🇨🇴', MAR: '🇲🇦', SEN: '🇸🇳', NGA: '🇳🇬', GHA: '🇬🇭',
  CIV: '🇨🇮', CMR: '🇨🇲', ALG: '🇩🇿', TUN: '🇹🇳', EGY: '🇪🇬', USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦', JPN: '🇯🇵', KOR: '🇰🇷', AUS: '🇦🇺', TUR: '🇹🇷',
  SCO: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', WAL: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}', IRL: '🇮🇪', NIR: '🇬🇧', UKR: '🇺🇦', CZE: '🇨🇿', SVK: '🇸🇰', SVN: '🇸🇮', HUN: '🇭🇺', GRE: '🇬🇷', ECU: '🇪🇨', PAR: '🇵🇾',
  CHI: '🇨🇱', PER: '🇵🇪', VEN: '🇻🇪', GEO: '🇬🇪', ALB: '🇦🇱', KOS: '🇽🇰', BIH: '🇧🇦', MLI: '🇲🇱', GUI: '🇬🇳', COD: '🇨🇩', BFA: '🇧🇫', GAB: '🇬🇦',
  JAM: '🇯🇲', ISL: '🇮🇸', FIN: '🇫🇮', ROU: '🇷🇴', BUL: '🇧🇬', MNE: '🇲🇪', MKD: '🇲🇰', ISR: '🇮🇱', IRN: '🇮🇷', CPV: '🇨🇻', ANG: '🇦🇴', ZAM: '🇿🇲',
  RSA: '🇿🇦', HAI: '🇭🇹', CRC: '🇨🇷', HON: '🇭🇳', PAN: '🇵🇦', BOL: '🇧🇴', UZB: '🇺🇿', LUX: '🇱🇺', DOM: '🇩🇴', CUW: '🇨🇼', SUR: '🇸🇷', TOG: '🇹🇬', BEN: '🇧🇯', MOZ: '🇲🇿', EQG: '🇬🇶', CTA: '🇨🇫', NZL: '🇳🇿', ARM: '🇦🇲', LTU: '🇱🇹', EST: '🇪🇪', LVA: '🇱🇻', CYP: '🇨🇾', SLE: '🇸🇱', GAM: '🇬🇲', MAD: '🇲🇬', COM: '🇰🇲', LBR: '🇱🇷', SUD: '🇸🇩', KEN: '🇰🇪', TAN: '🇹🇿', UGA: '🇺🇬', CHN: '🇨🇳', PHI: '🇵🇭', IDN: '🇮🇩', KSA: '🇸🇦', QAT: '🇶🇦', IRQ: '🇮🇶', SYR: '🇸🇾', JOR: '🇯🇴', LBY: '🇱🇾', MTN: '🇲🇷', GNB: '🇬🇼', BDI: '🇧🇮', RWA: '🇷🇼', ZIM: '🇿🇼', NIG: '🇳🇪', TRI: '🇹🇹', GLP: '🇬🇵', MTQ: '🇲🇶', GUF: '🇬🇫',
};
export const flag = (nat: string) => NAT_FLAG[nat] ?? '🏳️';
