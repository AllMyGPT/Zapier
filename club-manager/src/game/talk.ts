import type { GameState } from './types';
import type { Match } from './engine';
import { strengthOf } from './season';

export type TalkKind = 'calma' | 'motivar' | 'exigir';
export interface TalkResult { msg: string; up: number; same: number; down: number }

export const PRE_TALKS: [TalkKind, string, string][] = [
  ['calma', 'Tranquilidad', 'Sin presión: disfrutad y jugad vuestro fútbol.'],
  ['motivar', 'Motivar', 'Arenga para salir a por todas.'],
  ['exigir', 'Exigir', 'Hoy no valen excusas: quiero la victoria.'],
];
export const HALF_TALKS: [TalkKind, string, string][] = [
  ['calma', 'Mantener la calma', 'Seguid con el plan, cabeza fría.'],
  ['motivar', 'Animar', 'Podemos darle la vuelta, creed en ello.'],
  ['exigir', 'Echar la bronca', 'Esto no es lo que hemos preparado.'],
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Applies a morale delta per player with individual variance; returns the reaction tally. */
function apply(gs: GameState, ids: number[], delta: (morale: number) => number): Omit<TalkResult, 'msg'> {
  let up = 0, same = 0, down = 0;
  for (const id of ids) {
    const p = gs.players[id]; if (!p) continue;
    const d = Math.round(delta(p.morale) + (Math.random() * 4 - 2));
    p.morale = clamp(p.morale + d, 5, 100);
    if (d >= 2) up++; else if (d <= -2) down++; else same++;
  }
  return { up, same, down };
}

function verdict(r: Omit<TalkResult, 'msg'>) {
  const n = r.up + r.same + r.down || 1;
  if (r.up / n >= 0.6) return 'El vestuario sale enchufado.';
  if (r.down / n >= 0.35) return 'La charla no ha sentado bien a varios jugadores.';
  return 'Reacción tibia: unos asienten, otros miran al suelo.';
}

/** Pre-match team talk. Effect depends on whether we start as favourites. */
export function preMatchTalk(gs: GameState, clubId: string, oppId: string, home: boolean, kind: TalkKind): TalkResult {
  const club = gs.clubs[clubId];
  const ids = [...club.lineup.filter(x => x >= 0), ...club.bench];
  const diff = strengthOf(gs, clubId) - strengthOf(gs, oppId) + (home ? 1.5 : -1.5);
  const fav = diff > 1.5, under = diff < -1.5;
  const r = apply(gs, ids, m => {
    if (kind === 'calma') return fav ? 4 : under ? 1 : 3;
    if (kind === 'motivar') return (under ? 7 : fav ? 1 : 4) - (m > 88 ? 4 : 0); // over-excited players can tense up
    return fav ? 6 : m < 55 ? -5 : under ? -1 : 2; // demanding works when you're expected to win
  });
  return { ...r, msg: verdict(r) };
}

/** Half-time talk for the user's side, based on the current score. */
export function halfTimeTalk(m: Match, si: 0 | 1, kind: TalkKind): TalkResult {
  const s = m.sides[si], o = m.sides[si === 0 ? 1 : 0];
  const d = s.goals - o.goals;
  const ids = s.onPitch.filter((x): x is number => x != null);
  const r = apply(m.gs, ids, mo => {
    if (kind === 'calma') return d > 0 ? 5 : d === 0 ? 2 : -1;
    if (kind === 'motivar') return d < 0 ? 6 : d === 0 ? 4 : 1;
    return d < 0 ? (mo < 50 ? -4 : 5) : d === 0 ? 3 : -3; // a rant while winning annoys the players
  });
  m.sides[0].cache = undefined; m.sides[1].cache = undefined;
  return { ...r, msg: verdict(r) };
}
