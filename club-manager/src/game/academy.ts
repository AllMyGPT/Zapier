import type { GameState, Player } from './types';
import { age, ovr } from './player';
import { inWindow } from './calendar';
import { invalidateStrength, news, strengthOf } from './season';

/** Reserve (B) team of a club, if it has one. */
export function reserveOf(gs: GameState, clubId: string) {
  return Object.values(gs.clubs).find(c => c.parentId === clubId);
}

export const RESERVE_MAX_AGE = 23;

function dropFromLineup(gs: GameState, p: Player) {
  invalidateStrength();
  if (!p.clubId) return;
  const c = gs.clubs[p.clubId];
  c.lineup = c.lineup.map(x => (x === p.id ? -1 : x));
  c.bench = c.bench.filter(x => x !== p.id);
}

/** First team → B team (young players only). */
export function sendToReserve(gs: GameState, pid: number): string {
  const p = gs.players[pid]; const me = gs.manager.clubId;
  const r = reserveOf(gs, me);
  if (!r) return 'Tu club no tiene filial.';
  if (p.clubId !== me) return 'Solo puedes bajar jugadores de tu primer equipo.';
  if (age(p, gs.season) > RESERVE_MAX_AGE) return `El filial solo admite jugadores de hasta ${RESERVE_MAX_AGE} años.`;
  dropFromLineup(gs, p);
  p.clubId = r.id; p.youth = false; p.listed = false;
  p.morale = Math.max(5, p.morale - (ovr(p) >= strengthOf(gs, me) - 4 ? 8 : 2));
  return `${p.name} baja al ${r.name} para sumar minutos.`;
}

/** B team / academy → first team. */
export function callUp(gs: GameState, pid: number): string {
  const p = gs.players[pid]; const me = gs.manager.clubId;
  const r = reserveOf(gs, me);
  if (p.clubId === me && p.youth) { p.youth = false; p.morale = Math.min(100, p.morale + 8); return `${p.name} sube del juvenil al primer equipo.`; }
  if (!r || p.clubId !== r.id) return 'Este jugador no está en tu filial.';
  dropFromLineup(gs, p);
  p.clubId = me; p.morale = Math.min(100, p.morale + 10);
  return `${p.name} sube del ${r.name} al primer equipo.`;
}

/** Season-long loan to a club in a lower tier (or a weaker side) where he will play. */
export function loanOut(gs: GameState, pid: number): string {
  const p = gs.players[pid]; const me = gs.manager.clubId;
  if (p.clubId !== me) return 'Solo puedes ceder jugadores de tu plantilla.';
  if (!inWindow(gs.day)) return 'Las cesiones solo se pueden cerrar con el mercado abierto.';
  if (p.loanFrom) return 'Ya está cedido.';
  const o = ovr(p); const myTier = gs.leagues[gs.clubs[me].leagueId].tier;
  const cands = Object.values(gs.clubs)
    .filter(c => c.id !== me && !c.parentId && c.country === gs.clubs[me].country && gs.leagues[c.leagueId].tier >= myTier)
    .map(c => ({ c, gap: Math.abs(strengthOf(gs, c.id) - (o + 1)) }))
    .filter(x => x.gap < 6)
    .sort((a, b) => a.gap - b.gap);
  const dest = cands[0]?.c;
  if (!dest) return 'Ningún club encaja ahora mismo con su nivel. Prueba más adelante.';
  dropFromLineup(gs, p);
  p.loanFrom = me; p.clubId = dest.id; p.listed = false; p.youth = false;
  news(gs, 'transfer', `${p.name}, cedido al ${dest.name}`, `Jugará cedido toda la temporada en ${gs.leagues[dest.leagueId].name}. El club de destino paga su ficha.`);
  return `${p.name} se marcha cedido al ${dest.name} (${gs.leagues[dest.leagueId].name}).`;
}

/** Players of the user's club currently out on loan. */
export function loanedOut(gs: GameState) {
  return Object.values(gs.players).filter(p => p.loanFrom === gs.manager.clubId);
}

export const ACADEMY_LABEL = ['', 'Básica', 'Modesta', 'Buena', 'Muy buena', 'Excelente', 'Élite'];
export const academyCost = (level: number) => level * 6_000_000;
/** Invest in the youth facilities: more and better youngsters, faster development for under-22s. */
export function upgradeAcademy(gs: GameState): string {
  const c = gs.clubs[gs.manager.clubId]; const lvl = c.academy ?? 2;
  if (lvl >= 6) return 'Tu cantera ya es de élite.';
  const cost = academyCost(lvl);
  if (c.balance < cost) return `Necesitas ${(cost / 1e6).toFixed(0)} M€ en caja.`;
  c.balance -= cost; c.academy = lvl + 1;
  gs.finance.push({ date: gs.day + gs.season * 1000, label: 'Inversión en la cantera', amount: -cost });
  news(gs, 'youth', `La cantera sube a nivel ${ACADEMY_LABEL[c.academy]}`, 'Más juveniles y de más calidad en cada hornada, y los menores de 22 progresan más rápido.');
  return `Cantera mejorada: ahora es ${ACADEMY_LABEL[c.academy].toLowerCase()}.`;
}
