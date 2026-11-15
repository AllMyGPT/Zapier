import type { Club, GameState } from './types';
import { Rng, hashStr } from './rng';
import { fmtMoney, money, news } from './season';
import { cupReached } from './season';
import { table } from './calendar';

export type SponsorGoal = 'top4' | 'europa' | 'copa' | 'ascenso';
export interface SponsorOffer { id: string; name: string; weekly: number; years: number; bonus?: { goal: SponsorGoal; amount: number }; pitch: string }
export const GOAL_LABEL: Record<SponsorGoal, string> = { top4: 'terminar entre los 4 primeros', europa: 'clasificarse para Europa', copa: 'llegar a semifinales de copa', ascenso: 'conseguir el ascenso' };

const BRANDS = ['Nexa Telecom', 'Solaria Energía', 'Banco Atlántico', 'Vuelo Air', 'Kroma Motors', 'Bravo Seguros', 'Lumen Tech', 'Aurum Bet', 'Costa Cervezas', 'Volta Electric', 'Ibérica Foods', 'Pulse Sports'];

/** Three shirt-sponsor offers for this season: safe fixed fee, performance-heavy, long-term. */
export function sponsorOffers(gs: GameState, c: Club): SponsorOffer[] {
  const rng = new Rng(hashStr(`${gs.seed}:${gs.season}:${c.id}:sponsor`));
  const tier = gs.leagues[c.leagueId].tier;
  const base = Math.round(Math.pow(c.reputation / 10, 3.2) * 120 * (tier === 1 ? 1 : tier === 2 ? 0.35 : 0.12) / 1000) * 1000;
  const goal: SponsorGoal = tier > 1 ? 'ascenso' : c.reputation >= 85 ? 'top4' : c.reputation >= 72 ? 'europa' : 'copa';
  const names = rng.shuffle(BRANDS.slice());
  return [
    { id: 'safe', name: names[0], weekly: Math.round(base * 1.05 / 1000) * 1000, years: 2, pitch: 'Fijo y seguro, sin condiciones.' },
    { id: 'perf', name: names[1], weekly: Math.round(base * 0.8 / 1000) * 1000, years: 2, bonus: { goal, amount: Math.round(base * 52 * 0.6 / 100_000) * 100_000 }, pitch: `Menos fijo, pero un gran bonus si consigues ${GOAL_LABEL[goal]}.` },
    { id: 'long', name: names[2], weekly: Math.round(base * 0.95 / 1000) * 1000, years: 4, pitch: 'Contrato largo: estabilidad para cuatro temporadas.' },
  ];
}

export function signSponsor(gs: GameState, c: Club, o: SponsorOffer): string {
  c.sponsor = { name: o.name, weekly: o.weekly, until: gs.season + o.years - 1, bonus: o.bonus };
  news(gs, 'club', `Nuevo patrocinador: ${o.name}`, `${fmtMoney(o.weekly)}/semana hasta ${gs.season + o.years}.${o.bonus ? ` Bonus de ${fmtMoney(o.bonus.amount)} por ${GOAL_LABEL[o.bonus.goal]}.` : ''}`);
  return `${o.name} será el nuevo patrocinador de la camiseta.`;
}

/** Sell the stadium name: a one-off payment plus weekly income, at the cost of fan mood. */
export function namingOffer(gs: GameState, c: Club) {
  const rng = new Rng(hashStr(`${gs.seed}:${c.id}:naming`));
  const brand = rng.pick(['Nexa', 'Solaria', 'Kroma', 'Lumen', 'Volta', 'Aurum']);
  return { brand, name: `${brand} ${rng.pick(['Arena', 'Stadium', 'Park', 'Estadio'])}`, upfront: Math.round(Math.pow(c.reputation / 10, 3) * 25_000 / 100_000) * 100_000, weekly: Math.round(Math.pow(c.reputation / 10, 3) * 40 / 1000) * 1000 };
}
export function sellNaming(gs: GameState, c: Club): string {
  const o = namingOffer(gs, c);
  c.naming = o.name; c.stadium = o.name; c.fans = Math.max(5, c.fans - 8);
  money(gs, c.id, o.upfront, 'Derechos de nombre del estadio');
  c.sponsor = { ...c.sponsor, weekly: c.sponsor.weekly + o.weekly };
  news(gs, 'club', `El estadio pasa a llamarse ${o.name}`, `Ingreso inmediato de ${fmtMoney(o.upfront)} y ${fmtMoney(o.weekly)}/semana. La grada no lo ha recibido bien.`);
  return `Vendido: ahora jugáis en el ${o.name}.`;
}

/** Season end: pay the sponsor's performance bonus if the goal was met. */
export function sponsorBonus(gs: GameState, c: Club, leaguePos: number, euroSpots: number, promoted: boolean) {
  const b = c.sponsor.bonus; if (!b) return null;
  const ok = b.goal === 'top4' ? leaguePos <= 4 : b.goal === 'europa' ? leaguePos <= euroSpots : b.goal === 'copa' ? cupReached(gs) >= 3 : promoted;
  if (ok) money(gs, c.id, b.amount, `Bonus de ${c.sponsor.name}`);
  void table;
  return ok ? `${c.sponsor.name} paga su bonus: ${fmtMoney(b.amount)}.` : `Sin bonus de ${c.sponsor.name} (objetivo: ${GOAL_LABEL[b.goal]}).`;
}
