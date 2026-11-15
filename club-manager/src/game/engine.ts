import type { Club, GameState, Player, Pos, Tactics } from './types';
import { FORMATIONS, type Slot } from './tactics';
import { Rng } from './rng';
import { available, ovr, slotRating } from './player';

export interface Tick {
  t: number;          // match second
  bx: number; by: number; // absolute ball position: x 0 = home goal line, 1 = away goal line
  poss: 0 | 1;        // 0 home, 1 away
  holder: number;     // player id
  kind?: 'goal' | 'shot' | 'save' | 'miss' | 'foul' | 'card' | 'red' | 'corner' | 'sub' | 'injury' | 'half' | 'end' | 'kickoff' | 'pen' | 'offside';
  text?: string;
}
export interface MEvent { min: number; side: 0 | 1; kind: string; pid?: number; pid2?: number; text: string }

export interface Side {
  clubId: string;
  club: Club;
  tactics: Tactics;
  slots: Slot[];
  onPitch: (number | null)[];
  bench: number[];
  subsUsed: number;
  energy: Record<number, number>;
  rating: Record<number, number>;
  played: Set<number>;
  yellow: Set<number>;
  goals: number;
  shots: number; onTarget: number; corners: number; fouls: number; possTicks: number; passes: number; passOk: number;
  cache?: { def: number; mid: number; att: number; gk: number };
}

export interface Match {
  rng: Rng;
  gs: GameState;
  sides: [Side, Side];
  t: number;            // seconds
  half: 1 | 2 | 3 | 4;  // 3,4 = extra time
  stoppage: number;
  poss: 0 | 1;
  ballX: number;        // in attack frame of possessing team (0 own goal → 1 rival goal)
  ballY: number;
  holder: number;
  lastPasser: number | null;
  events: MEvent[];
  ticks: Tick[];
  finished: boolean;
  knockout: boolean;
  firstLeg?: [number, number];
  pens?: [number, number];
  neutral: boolean;
  userSide: 0 | 1 | null;
  injuries: { pid: number; days: number; name: string }[];
  reds: number[];
}

const TICK = 20; // seconds per tick
export const K_DIFF = 56;
const sig = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function makeSide(gs: GameState, club: Club, lineup: number[], bench: number[]): Side {
  const slots = FORMATIONS[club.tactics.formation].slots;
  const s: Side = {
    clubId: club.id, club, tactics: { ...club.tactics }, slots, onPitch: lineup.slice(0, slots.length), bench: bench.slice(),
    subsUsed: 0, energy: {}, rating: {}, played: new Set(), yellow: new Set(), goals: 0, shots: 0, onTarget: 0, corners: 0, fouls: 0, possTicks: 0, passes: 0, passOk: 0,
  };
  for (const id of [...s.onPitch, ...s.bench]) if (id != null) { s.energy[id] = gs.players[id].fitness; s.rating[id] = 6.0; }
  for (const id of s.onPitch) if (id != null) s.played.add(id);
  return s;
}

export function createMatch(gs: GameState, home: Club, away: Club, lineups: { home: [number[], number[]]; away: [number[], number[]] }, opts: { seed: number; knockout?: boolean; firstLeg?: [number, number]; neutral?: boolean; userSide?: 0 | 1 | null }): Match {
  const m: Match = {
    rng: new Rng(opts.seed), gs,
    sides: [makeSide(gs, home, ...lineups.home), makeSide(gs, away, ...lineups.away)],
    t: 0, half: 1, stoppage: 0, poss: 0, ballX: 0.5, ballY: 0.5, holder: 0, lastPasser: null, events: [], ticks: [], finished: false,
    knockout: !!opts.knockout, firstLeg: opts.firstLeg, neutral: !!opts.neutral, userSide: opts.userSide ?? null, injuries: [], reds: [],
  };
  m.stoppage = m.rng.int(1, 4) * 60;
  kickoff(m, 0, 'Comienza el partido');
  return m;
}

function P(m: Match, id: number): Player { return m.gs.players[id]; }
function name(m: Match, id: number) { const n = P(m, id).name; const parts = n.split(' '); return parts.length > 1 && n.length > 16 ? parts.slice(1).join(' ') : n; }
const minute = (m: Match) => Math.min(m.half >= 3 ? 120 : 90, Math.floor(m.t / 60) + 1);

function eff(m: Match, side: Side, id: number, slotIdx: number): number {
  const p = P(m, id);
  const base = slotRating(p, side.slots[slotIdx].pos);
  const en = side.energy[id] ?? 100;
  const morale = 0.95 + (p.morale / 100) * 0.1;
  const cohesion = 0.96 + (side.club.cohesion / 100) * 0.06;
  return base * (0.72 + 0.28 * en / 100) * morale * cohesion;
}

function strengths(m: Match, si: 0 | 1) {
  const s = m.sides[si];
  if (s.cache) return s.cache;
  let def = 0, nd = 0, mid = 0, nm = 0, att = 0, na = 0, gk = 40;
  s.onPitch.forEach((id, i) => {
    if (id == null) return;
    const pos = s.slots[i].pos; const e = eff(m, s, id, i);
    if (pos === 'GK') gk = e;
    else if (pos === 'CB' || pos === 'LB' || pos === 'RB') { def += e; nd++; }
    else if (pos === 'DM' || pos === 'CM' || pos === 'AM') { mid += e; nm++; if (pos === 'DM') { def += e * 0.5; nd += 0.5; } if (pos === 'AM') { att += e * 0.5; na += 0.5; } }
    else { att += e; na++; }
  });
  const home = !m.neutral && si === 0 ? 1.6 : 0;
  const men = s.tactics.mentality;
  const missing = s.onPitch.filter(x => x == null).length;
  s.cache = {
    def: (nd ? def / nd : 40) * (1 + nd * 0.012) - men * 1.2 + home - missing * 2.5,
    mid: (nm ? mid / nm : 40) * (1 + nm * 0.01) + home - missing * 3,
    att: (na ? att / na : 40) + men * 1.2 + home - missing * 1.5,
    gk: gk + home * 0.5,
  };
  return s.cache;
}
const invalidate = (m: Match) => { m.sides[0].cache = undefined; m.sides[1].cache = undefined; };

function abs(m: Match): [number, number] {
  return m.poss === 0 ? [m.ballX, m.ballY] : [1 - m.ballX, 1 - m.ballY];
}

function pushTick(m: Match, kind?: Tick['kind'], text?: string) {
  const [bx, by] = abs(m);
  m.ticks.push({ t: m.t, bx, by, poss: m.poss, holder: m.holder, kind, text });
}
function ev(m: Match, side: 0 | 1, kind: string, text: string, pid?: number, pid2?: number) {
  m.events.push({ min: minute(m), side, kind, text, pid, pid2 });
}

/** Pick a player of side whose slot x is close to ballX (frame of that side). */
function pickNear(m: Match, si: 0 | 1, x: number, y: number | null, exclude?: number, posFilter?: (p: Pos) => boolean): number {
  const s = m.sides[si];
  const ids: number[] = []; const w: number[] = [];
  s.onPitch.forEach((id, i) => {
    if (id == null || id === exclude) return;
    const sl = s.slots[i];
    if (posFilter && !posFilter(sl.pos)) return;
    if (sl.pos === 'GK' && x > 0.2) return;
    const dx = Math.abs(sl.x + 0.1 - x), dy = y == null ? 0 : Math.abs(sl.y - y);
    ids.push(id); w.push(1 / (0.05 + dx * dx * 6 + dy * dy * 1.5));
  });
  if (!ids.length) return s.onPitch.find(x => x != null) ?? 0;
  return m.rng.weighted(ids, w);
}
function slotOf(s: Side, id: number) { return s.onPitch.indexOf(id); }

/** Who arrives to finish a move: weighted by slot role and finishing (or heading) skill, so goals spread
 *  across wingers, attacking midfielders and late runners instead of always the centre-forward. */
const FINISH_W: Partial<Record<Pos, number>> = { ST: 0.85, LW: 0.62, RW: 0.62, AM: 0.58, CM: 0.28, DM: 0.1, LB: 0.07, RB: 0.07, CB: 0.07 };
const HEAD_W: Partial<Record<Pos, number>> = { ST: 1, LW: 0.35, RW: 0.35, AM: 0.35, CM: 0.3, DM: 0.2, LB: 0.1, RB: 0.1, CB: 0.45 };
function pickFinisher(m: Match, si: 0 | 1, exclude?: number, header = false): number {
  const s = m.sides[si];
  const ids: number[] = []; const w: number[] = [];
  s.onPitch.forEach((id, i) => {
    if (id == null || id === exclude) return;
    const base = (header ? HEAD_W : FINISH_W)[s.slots[i].pos] ?? 0;
    if (!base) return;
    const sk = header ? P(m, id).attrs.hea : P(m, id).attrs.sho;
    ids.push(id); w.push(base * Math.pow(Math.max(40, sk) / 80, 2));
  });
  if (!ids.length) return pickNear(m, si, 0.9, 0.5, exclude);
  return m.rng.weighted(ids, w);
}
function bump(s: Side, id: number, v: number) { if (s.rating[id] !== undefined) s.rating[id] = clamp(s.rating[id] + v, 3, 10); }

function kickoff(m: Match, si: 0 | 1, text: string) {
  m.poss = si; m.ballX = 0.5; m.ballY = 0.5;
  m.holder = pickNear(m, si, 0.75, 0.5, undefined, p => p === 'ST' || p === 'AM' || p === 'CM');
  m.lastPasser = null;
  pushTick(m, 'kickoff', text);
}

function turnover(m: Match, newX?: number) {
  const d: 0 | 1 = m.poss === 0 ? 1 : 0;
  m.poss = d;
  m.ballX = clamp(newX ?? 1 - m.ballX, 0.03, 0.97);
  m.ballY = 1 - m.ballY;
  m.holder = pickNear(m, d, m.ballX, m.ballY);
  m.lastPasser = null;
}

const T_GOAL = ['¡GOOOL de {p}! Definición perfecta.', '¡GOL! {p} no perdona.', '¡Golazo de {p}!', '¡GOL de {p}! El portero no pudo hacer nada.', '¡{p} marca! Estalla la grada.'];
const T_SAVE = ['Paradón de {g} ante el disparo de {p}.', '{p} chuta, pero {g} responde con seguridad.', '¡Qué parada de {g}!'];
const T_MISS = ['{p} dispara... ¡fuera por poco!', 'Remate de {p} que se marcha alto.', '{p} lo intenta, pero el balón sale desviado.', 'Disparo de {p} al lateral de la red.'];
const fill = (t: string, o: Record<string, string>) => t.replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');

function shoot(m: Match, xg: number, shooter: number, kindText?: string) {
  const a = m.sides[m.poss], d = m.sides[m.poss === 0 ? 1 : 0];
  const di = m.poss === 0 ? 1 : 0;
  const p = P(m, shooter);
  a.shots++;
  const gkId = d.onPitch[0];
  const gk = gkId != null ? eff(m, d, gkId, 0) : 30;
  const shotSkill = (p.attrs.sho * 0.8 + p.attrs.dri * 0.2) * (0.75 + 0.25 * (a.energy[shooter] ?? 100) / 100);
  let pGoal = xg * Math.exp((shotSkill - 72) / 105) * Math.exp((72 - gk) / 60) * 0.76;
  pGoal = clamp(pGoal, 0.01, 0.92);
  const onT = clamp(0.12 + p.attrs.sho / 450 + xg * 0.4, 0.15, 0.8);
  bump(a, shooter, 0.08);
  const gName = gkId != null ? name(m, gkId) : 'el portero';
  if (m.rng.chance(pGoal)) {
    a.onTarget++; a.goals++;
    bump(a, shooter, 1.0);
    if (m.lastPasser && m.lastPasser !== shooter) bump(a, m.lastPasser, 0.6);
    if (gkId != null) bump(d, gkId, -0.35);
    d.onPitch.forEach((id, i) => { if (id != null && d.slots[i].pos !== 'GK' && ['CB', 'LB', 'RB'].includes(d.slots[i].pos)) bump(d, id, -0.12); });
    const assist = m.lastPasser && m.lastPasser !== shooter ? m.lastPasser : undefined;
    const txt = (kindText ? kindText + ' ' : '') + fill(m.rng.pick(T_GOAL), { p: name(m, shooter) }) + (assist ? ` Asistencia de ${name(m, assist)}.` : '');
    m.ballX = 0.99;
    pushTick(m, 'goal', txt);
    ev(m, m.poss, 'goal', txt, shooter, assist);
    invalidate(m);
    kickoff(m, di as 0 | 1, `${m.sides[0].club.short} ${m.sides[0].goals} - ${m.sides[1].goals} ${m.sides[1].club.short}`);
    return;
  }
  if (m.rng.chance(onT)) {
    a.onTarget++;
    if (gkId != null) bump(d, gkId, 0.22);
    const txt = fill(m.rng.pick(T_SAVE), { p: name(m, shooter), g: gName });
    m.ballX = 0.97;
    pushTick(m, 'save', txt);
    if (m.rng.chance(0.45)) { a.corners++; corner(m); return; }
    turnover(m, 0.05); m.holder = gkId ?? m.holder;
  } else {
    const txt = fill(m.rng.pick(T_MISS), { p: name(m, shooter) });
    m.ballX = 0.99; m.ballY = clamp(m.ballY + m.rng.range(-0.15, 0.15), 0.3, 0.7);
    pushTick(m, 'miss', txt);
    turnover(m, 0.06); if (d.onPitch[0] != null) m.holder = d.onPitch[0]!;
  }
}

function corner(m: Match) {
  const a = m.sides[m.poss];
  m.ballX = 0.99; m.ballY = m.rng.chance(0.5) ? 0.02 : 0.98;
  const taker = a.tactics.corner && a.onPitch.includes(a.tactics.corner) ? a.tactics.corner : pickNear(m, m.poss, 0.8, m.ballY, undefined, p => p !== 'GK' && p !== 'CB');
  m.holder = taker; m.lastPasser = taker;
  pushTick(m, 'corner', `Córner para ${a.club.name}. Lo saca ${name(m, taker)}.`);
  const header = bestBy(m, m.poss, p => p.attrs.hea, taker);
  const d = m.sides[m.poss === 0 ? 1 : 0];
  const dh = avgAttr(m, d, 'hea');
  if (m.rng.chance(sig((P(m, header).attrs.hea - dh) / 12 - 0.9))) {
    m.ballX = 0.92; m.ballY = 0.5; m.holder = header;
    shoot(m, 0.11, header, 'Remate de cabeza tras el córner...');
  } else {
    pushTick(m, undefined, 'La defensa despeja el córner.');
    turnover(m, m.rng.range(0.15, 0.35));
  }
}

function bestBy(m: Match, si: 0 | 1, f: (p: Player) => number, exclude?: number) {
  const s = m.sides[si]; let best = -1, bv = -1;
  s.onPitch.forEach((id, i) => { if (id == null || id === exclude || s.slots[i].pos === 'GK') return; const v = f(P(m, id)) + m.rng.range(0, 12); if (v > bv) { bv = v; best = id; } });
  return best;
}
function avgAttr(m: Match, s: Side, k: keyof Player['attrs']) {
  let t = 0, n = 0; s.onPitch.forEach(id => { if (id != null) { t += P(m, id).attrs[k]; n++; } }); return n ? t / n : 50;
}

function foul(m: Match, fouler: number, victim: number) {
  const di: 0 | 1 = m.poss === 0 ? 1 : 0; const d = m.sides[di]; const a = m.sides[m.poss];
  d.fouls++; bump(d, fouler, -0.08);
  const r = m.rng.next();
  let txt = `Falta de ${name(m, fouler)} sobre ${name(m, victim)}.`;
  let kind: Tick['kind'] = 'foul';
  if (r < 0.012) { txt = `¡Roja directa para ${name(m, fouler)}! Entrada durísima.`; sendOff(m, di, fouler); kind = 'red'; }
  else if (r < 0.16) {
    if (d.yellow.has(fouler)) { txt = `¡Segunda amarilla para ${name(m, fouler)}! Se va a la calle.`; sendOff(m, di, fouler); kind = 'red'; }
    else { d.yellow.add(fouler); bump(d, fouler, -0.3); txt += ` Amarilla para ${name(m, fouler)}.`; kind = 'card'; ev(m, di, 'yellow', `Amarilla: ${P(m, fouler).name}`, fouler); }
  }
  pushTick(m, kind, txt);
  if (m.ballX > 0.86 && Math.abs(m.ballY - 0.5) < 0.3 && m.rng.chance(0.55)) {
    const taker = a.tactics.penalty && a.onPitch.includes(a.tactics.penalty) ? a.tactics.penalty : bestBy(m, m.poss, p => p.attrs.sho);
    m.ballX = 0.89; m.ballY = 0.5; m.holder = taker; m.lastPasser = null;
    pushTick(m, 'pen', `¡PENALTI! ${name(m, taker)} se dispone a lanzar...`);
    shoot(m, 0.78, taker, 'Penalti...');
    return;
  }
  if (m.ballX > 0.68 && Math.abs(m.ballY - 0.5) < 0.3 && m.rng.chance(0.45)) {
    const taker = a.tactics.freekick && a.onPitch.includes(a.tactics.freekick) ? a.tactics.freekick : bestBy(m, m.poss, p => p.attrs.sho * 0.6 + p.attrs.pas * 0.4);
    m.holder = taker; m.lastPasser = null;
    pushTick(m, undefined, `Falta peligrosa. ${name(m, taker)} se perfila...`);
    shoot(m, 0.07, taker, 'Lanzamiento directo...');
  }
}

function sendOff(m: Match, si: 0 | 1, pid: number) {
  const s = m.sides[si];
  const i = s.onPitch.indexOf(pid);
  if (i >= 0) s.onPitch[i] = null;
  bump(s, pid, -1.5); m.reds.push(pid);
  ev(m, si, 'red', `Roja: ${P(m, pid).name}`, pid);
  if (i === 0) { // goalkeeper sent off: move an outfielder in goal
    const j = s.onPitch.findIndex((x, k) => x != null && k > 0);
    if (j > 0) { s.onPitch[0] = s.onPitch[j]; s.onPitch[j] = null; }
  }
  invalidate(m);
}

function injure(m: Match, si: 0 | 1, pid: number) {
  const s = m.sides[si];
  const injuries: [string, number, number][] = [['Molestias musculares', 3, 8], ['Esguince de tobillo', 10, 28], ['Rotura de isquiotibiales', 21, 50], ['Contusión', 2, 6], ['Lesión de rodilla', 30, 120], ['Sobrecarga en el gemelo', 5, 14]];
  const [nm, a, b] = m.rng.weighted(injuries, [30, 20, 12, 25, 4, 18]);
  const days = m.rng.int(a, b);
  m.injuries.push({ pid, days, name: nm });
  const txt = `${name(m, pid)} se ha lesionado (${nm.toLowerCase()}).`;
  pushTick(m, 'injury', txt); ev(m, si, 'injury', txt, pid);
  if (!(m.userSide === si) || true) {
    // auto-substitute (user can still change afterwards)
    const i = s.onPitch.indexOf(pid);
    const cand = s.bench.filter(id => !s.played.has(id)).map(id => ({ id, r: slotRating(P(m, id), s.slots[i].pos) })).sort((x, y) => y.r - x.r);
    if (cand[0] && s.subsUsed < 5) substitute(m, si, pid, cand[0].id, true);
    else { s.energy[pid] = 10; }
  }
}

export function substitute(m: Match, si: 0 | 1, outId: number, inId: number, forced = false): boolean {
  const s = m.sides[si];
  const i = s.onPitch.indexOf(outId);
  if (i < 0 || s.subsUsed >= 5 || s.played.has(inId) || !s.bench.includes(inId)) return false;
  s.onPitch[i] = inId; s.subsUsed++; s.played.add(inId);
  s.bench = s.bench.filter(x => x !== inId);
  if (s.energy[inId] === undefined) s.energy[inId] = P(m, inId).fitness;
  if (s.rating[inId] === undefined) s.rating[inId] = 6.0;
  if (m.holder === outId) m.holder = inId;
  const txt = `Cambio en ${s.club.name}: entra ${name(m, inId)}, sale ${name(m, outId)}${forced ? ' (lesionado)' : ''}.`;
  pushTick(m, 'sub', txt); ev(m, si, 'sub', txt, inId, outId);
  invalidate(m);
  return true;
}

/** Swap two on-pitch slots (position change) */
export function swapSlots(m: Match, si: 0 | 1, a: number, b: number) {
  const s = m.sides[si]; [s.onPitch[a], s.onPitch[b]] = [s.onPitch[b], s.onPitch[a]]; invalidate(m);
}

export function setTactics(m: Match, si: 0 | 1, t: Tactics) {
  const s = m.sides[si];
  if (t.formation !== s.tactics.formation) {
    const newSlots = FORMATIONS[t.formation].slots;
    // remap players by best fit for new slots
    const ids = s.onPitch.filter((x): x is number => x != null);
    const nOn: (number | null)[] = new Array(newSlots.length).fill(null);
    const gk = s.onPitch[0];
    if (gk != null) nOn[0] = gk;
    const rest = ids.filter(x => x !== gk);
    for (let i = 1; i < newSlots.length && rest.length; i++) {
      rest.sort((a, b) => slotRating(P(m, b), newSlots[i].pos) - slotRating(P(m, a), newSlots[i].pos));
      nOn[i] = rest.shift()!;
    }
    // keep red-carded holes
    const missing = s.onPitch.filter(x => x == null).length;
    for (let k = 0; k < missing; k++) { const j = nOn.lastIndexOf(nOn.filter(x => x != null).slice(-1)[0] ?? -1); if (j > 0) nOn[j] = null; }
    s.slots = newSlots; s.onPitch = nOn;
  }
  s.tactics = { ...t };
  invalidate(m);
}

function aiManage(m: Match, si: 0 | 1) {
  const s = m.sides[si];
  const min = minute(m);
  if (min < 55 || s.subsUsed >= 5) return;
  if (m.rng.next() > 0.08) return;
  // replace most tired
  let worst = -1, we = 101;
  s.onPitch.forEach((id, i) => { if (id != null && i > 0 && (s.energy[id] ?? 100) < we) { we = s.energy[id]; worst = id; } });
  if (worst >= 0 && (we < 62 || (min > 70 && we < 72))) {
    const i = s.onPitch.indexOf(worst);
    const cand = s.bench.filter(id => !s.played.has(id) && P(m, id).pos !== 'GK').map(id => ({ id, r: slotRating(P(m, id), s.slots[i].pos) })).sort((a, b) => b.r - a.r);
    if (cand[0] && cand[0].r > slotRating(P(m, worst), s.slots[i].pos) - 8) substitute(m, si, worst, cand[0].id);
  }
  const diff = s.goals - m.sides[si === 0 ? 1 : 0].goals;
  if (min > 70) {
    const want = (diff < 0 ? 1 : diff > 0 ? -1 : 0) as -1 | 0 | 1;
    if (s.tactics.mentality !== want) { s.tactics.mentality = want; invalidate(m); }
  }
}

function drain(m: Match) {
  for (const si of [0, 1] as const) {
    const s = m.sides[si];
    s.onPitch.forEach(id => {
      if (id == null) return;
      const p = P(m, id);
      const rate = (0.085 + (s.tactics.pressing - 1) * 0.025 + (s.tactics.tempo - 1) * 0.015) * (1.45 - p.attrs.sta / 100);
      s.energy[id] = Math.max(0, (s.energy[id] ?? 100) - rate * (p.pos === 'GK' ? 0.2 : 1));
    });
  }
  if (Math.floor(m.t / TICK) % 9 === 0) invalidate(m);
}

/** Advance the match one tick. */
export function stepMatch(m: Match): void {
  if (m.finished) return;
  m.t += TICK;
  drain(m);
  const halfLen = m.half <= 2 ? 45 * 60 : 15 * 60;
  const halfEnd = (m.half === 1 ? halfLen : m.half === 2 ? 90 * 60 : m.half === 3 ? 105 * 60 : 120 * 60) + (m.half <= 2 ? m.stoppage : 60);
  if (m.t >= halfEnd) { endPeriod(m); return; }
  if (m.userSide !== 0) aiManage(m, 0);
  if (m.userSide !== 1) aiManage(m, 1);

  const ai = m.poss; const di: 0 | 1 = ai === 0 ? 1 : 0;
  const A = m.sides[ai], D = m.sides[di];
  A.possTicks++;
  const sa = strengths(m, ai), sd = strengths(m, di);
  // injuries (rare)
  if (m.rng.chance(0.0011)) {
    const si = m.rng.chance(0.5) ? 0 : 1; const s = m.sides[si];
    const ids = s.onPitch.filter((x): x is number => x != null);
    const v = m.rng.pick(ids);
    if (v != null) { injure(m, si as 0 | 1, v); return; }
  }
  const holderSlot = slotOf(A, m.holder);
  if (holderSlot < 0) m.holder = pickNear(m, ai, m.ballX, m.ballY);
  const hp = P(m, m.holder);
  const x = m.ballX;
  const t = A.tactics;
  const men = t.mentality;
  const pressing = D.tactics.pressing;
  // zone contest
  const zoneDef = x > 0.66 ? sd.def : x > 0.33 ? sd.mid : (sd.att * 0.7 + sd.mid * 0.3);
  const zoneAtt = x > 0.66 ? sa.att : x > 0.33 ? sa.mid : (sa.def * 0.5 + sa.mid * 0.5);

  // decide action
  const wide = Math.abs(m.ballY - 0.5) > 0.28;
  let action: 'pass' | 'long' | 'dribble' | 'shot' | 'cross' | 'hold';
  if (x > 0.74) {
    const pShot = 0.22 + (x - 0.74) * 1.2 + men * 0.03 + (hp.pos === 'ST' ? 0.08 : 0);
    action = m.rng.chance(pShot) ? 'shot' : wide && m.rng.chance(0.55) ? 'cross' : m.rng.chance(0.45) ? 'dribble' : 'pass';
  } else if (x > 0.4) {
    const ls = hp.attrs.sho > 76 && x > 0.6 && m.rng.chance(0.05 + men * 0.01);
    action = ls ? 'shot' : m.rng.chance(t.passing === 'largo' ? 0.2 : t.passing === 'mixto' ? 0.1 : 0.04) ? 'long' : m.rng.chance(0.25 + (hp.attrs.dri - 70) / 200) ? 'dribble' : 'pass';
  } else {
    action = m.rng.chance(t.passing === 'largo' ? 0.35 : t.passing === 'mixto' ? 0.18 : 0.06) ? 'long' : m.rng.chance(0.15) ? 'hold' : 'pass';
  }

  if (action === 'shot') {
    const d = 1 - x;
    const xg = clamp(0.42 * Math.exp(-d * 7.5) * (1 + (Math.abs(m.ballY - 0.5) < 0.2 ? 0.25 : -0.2)), 0.015, 0.5);
    // shot can be blocked
    if (m.rng.chance(sig((sd.def - sa.att) / 20 - 1.0))) {
      pushTick(m, 'shot', `Disparo de ${name(m, m.holder)}... ¡bloqueado por la defensa!`);
      A.shots++;
      if (m.rng.chance(0.5)) { A.corners++; corner(m); } else turnover(m);
      return;
    }
    // the ball carrier shoots about half the time; otherwise it's laid off to a runner arriving in the box
    if (m.rng.chance(0.58)) {
      const runner = pickFinisher(m, ai, m.holder);
      if (runner !== m.holder) { m.lastPasser = m.holder; m.holder = runner; }
    }
    shoot(m, xg, m.holder);
    return;
  }
  if (action === 'cross') {
    const target = pickFinisher(m, ai, m.holder, true);
    m.lastPasser = m.holder;
    const ok = m.rng.chance(sig((hp.attrs.pas - 70) / 15 + (P(m, target).attrs.hea - avgAttr(m, D, 'hea')) / 14 - 0.5));
    if (ok) {
      m.ballX = clamp(0.88 + m.rng.range(0, 0.06), 0, 0.96); m.ballY = 0.5 + m.rng.range(-0.12, 0.12); m.holder = target;
      pushTick(m, 'shot', `Centro de ${name(m, m.lastPasser)} al área...`);
      shoot(m, 0.12 * (P(m, target).attrs.hea / 75), target, `Remate de ${name(m, target)}...`);
    } else if (m.rng.chance(0.42)) { A.corners++; corner(m); }
    else { pushTick(m, undefined, `Centro de ${name(m, m.holder)} despejado.`); turnover(m); }
    return;
  }
  if (action === 'hold') { m.ballY = clamp(m.ballY + m.rng.range(-0.2, 0.2), 0.1, 0.9); m.holder = pickNear(m, ai, x, m.ballY, m.holder); pushTick(m); return; }

  const skill = action === 'dribble' ? hp.attrs.dri * 0.7 + hp.attrs.pac * 0.3 : hp.attrs.pas;
  const base = action === 'pass' ? 1.2 : action === 'long' ? 0.1 : 0.05;
  const tempoPen = (t.tempo - 2) * 0.18;
  const pressPen = (pressing - 2) * 0.2;
  const energyA = (A.energy[m.holder] ?? 100) / 100;
  const pOk = sig(base + (skill * 0.35 + zoneAtt * 0.65 - zoneDef) / K_DIFF - tempoPen - pressPen + (energyA - 0.8) * 0.8);
  A.passes++;
  if (m.rng.chance(pOk)) {
    A.passOk++;
    bump(A, m.holder, action === 'dribble' ? 0.05 : 0.015);
    const gain = action === 'pass' ? m.rng.range(0.03, 0.13) + (t.tempo - 2) * 0.02 + men * 0.01 : action === 'long' ? m.rng.range(0.18, 0.34) : m.rng.range(0.06, 0.15);
    const nx = clamp(x + gain, 0.04, 0.97);
    // offside on long balls/through passes
    if (nx > 0.7 && D.tactics.offside && m.rng.chance(0.07 + (action === 'long' ? 0.08 : 0))) {
      pushTick(m, 'offside', `Fuera de juego de ${name(m, pickNear(m, ai, nx, null, m.holder))}.`);
      turnover(m, 1 - nx);
      return;
    }
    if (action === 'dribble') {
      m.ballX = nx; m.ballY = clamp(m.ballY + m.rng.range(-0.12, 0.12), 0.04, 0.96);
      pushTick(m);
    } else {
      m.lastPasser = m.holder;
      const ny = clamp(m.rng.range(0.1, 0.9) * (t.width === 3 ? 1.1 : t.width === 1 ? 0.85 : 1) + (t.width === 1 ? 0.07 : t.width === 3 ? -0.05 : 0), 0.04, 0.96);
      const recv = pickNear(m, ai, nx, ny, m.holder);
      const rs = A.slots[slotOf(A, recv)];
      m.ballX = nx; m.ballY = rs ? clamp(rs.y + m.rng.range(-0.1, 0.1), 0.03, 0.97) : ny; m.holder = recv;
      pushTick(m);
    }
  } else {
    bump(A, m.holder, -0.04);
    const tackler = pickNear(m, di, 1 - x, 1 - m.ballY);
    bump(D, tackler, 0.05);
    const pFoul = 0.11 + (pressing - 2) * 0.04 + (action === 'dribble' ? 0.08 : 0);
    if (m.rng.chance(pFoul)) { foul(m, tackler, m.holder); return; }
    if (x < 0.25 && m.rng.chance(0.18)) {
      // dangerous loss: opponent counter from high
      turnover(m, 1 - x);
      pushTick(m, undefined, `¡Pérdida peligrosa de ${name(m, P(m, m.holder) ? m.holder : tackler)}!`);
      return;
    }
    turnover(m);
    m.holder = tackler;
    pushTick(m);
  }
}

function endPeriod(m: Match) {
  if (m.half === 1) {
    m.half = 2; m.t = 45 * 60; m.stoppage = m.rng.int(2, 6) * 60;
    pushTick(m, 'half', `Descanso: ${m.sides[0].club.short} ${m.sides[0].goals} - ${m.sides[1].goals} ${m.sides[1].club.short}`);
    for (const s of m.sides) for (const id of s.onPitch) if (id != null) s.energy[id] = Math.min(100, s.energy[id] + 6);
    kickoff(m, 1, 'Comienza la segunda parte');
    return;
  }
  const [h, a] = [m.sides[0].goals, m.sides[1].goals];
  let tied = h === a;
  if (m.firstLeg) { const aggH = h + m.firstLeg[1]; const aggA = a + m.firstLeg[0]; tied = aggH === aggA; }
  if (m.half === 2 && m.knockout && tied) {
    m.half = 3; m.t = 90 * 60;
    pushTick(m, 'half', 'Final del tiempo reglamentario. ¡Habrá prórroga!');
    kickoff(m, 0, 'Comienza la prórroga');
    return;
  }
  if (m.half === 3) { m.half = 4; m.t = 105 * 60; kickoff(m, 1, 'Segunda parte de la prórroga'); return; }
  if (m.knockout && tied) shootout(m);
  m.finished = true;
  const extra = m.pens ? ` (penaltis ${m.pens[0]}-${m.pens[1]})` : '';
  pushTick(m, 'end', `¡Final del partido! ${m.sides[0].club.name} ${h} - ${a} ${m.sides[1].club.name}${extra}`);
  // final rating adjustments
  for (const si of [0, 1] as const) {
    const s = m.sides[si]; const o = m.sides[si === 0 ? 1 : 0];
    const diff = s.goals - o.goals;
    for (const id of s.played) bump(s, id, diff > 0 ? 0.3 : diff < 0 ? -0.2 : 0);
    if (o.goals === 0) s.onPitch.forEach((id, i) => { if (id != null && ['GK', 'CB', 'LB', 'RB'].includes(s.slots[i].pos)) bump(s, id, 0.4); });
  }
}

function shootout(m: Match) {
  const score: [number, number] = [0, 0];
  const takers = [0, 1].map(si => {
    const s = m.sides[si];
    return s.onPitch.filter((x): x is number => x != null).sort((a, b) => P(m, b).attrs.sho - P(m, a).attrs.sho);
  });
  const gk = [m.sides[0].onPitch[0], m.sides[1].onPitch[0]];
  const take = (si: 0 | 1, k: number) => {
    const list = takers[si]; const id = list[k % list.length];
    const keeper = gk[si === 0 ? 1 : 0];
    const pg = clamp(0.76 + (P(m, id).attrs.sho - 75) / 200 - ((keeper != null ? P(m, keeper).attrs.gk : 60) - 75) / 220, 0.55, 0.92);
    const g = m.rng.chance(pg);
    if (g) score[si]++;
    m.events.push({ min: 120, side: si, kind: 'pen', pid: id, text: `${P(m, id).name}: ${g ? 'gol' : 'fallo'}` });
  };
  for (let k = 0; k < 5; k++) {
    take(0, k); take(1, k);
  }
  let k = 5;
  while (score[0] === score[1] && k < 30) { take(0, k); take(1, k); k++; }
  m.pens = score;
}

export function runToEnd(m: Match) { let guard = 0; while (!m.finished && guard++ < 2000) stepMatch(m); }

export function minuteOf(m: Match) { return minute(m); }
export function possessionPct(m: Match): [number, number] {
  const a = m.sides[0].possTicks, b = m.sides[1].possTicks; const t = a + b || 1; return [Math.round(a / t * 100), Math.round(b / t * 100)];
}
export { available, ovr };
