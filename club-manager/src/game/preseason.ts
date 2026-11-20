import type { Fixture, GameState } from './types';
import { buildMatch, fmtMoney, money, news, rngFor } from './season';
import { runToEnd } from './engine';
import { clubPlayers } from './lineup';
import { ATTR_KEYS, age } from './player';
import { reserveOf } from './academy';

export type PlanId = 'gira' | 'montana' | 'local';
export const PRESEASON_DEADLINE = 40; // days: pre-season runs in July and early August

export const PLANS: { id: PlanId; title: string; desc: string; pros: string; cons: string }[] = [
  { id: 'gira', title: 'Gira internacional', desc: 'Tres amistosos ante grandes de Europa en una gira por Asia y Estados Unidos.', pros: 'Ingresos y afición', cons: 'Viajes: la plantilla llega cansada' },
  { id: 'montana', title: 'Stage de montaña', desc: 'Concentración en altura con doble sesión y tres amistosos sin focos.', pros: 'Química de equipo y resistencia', cons: 'Trabajo duro: baja algo la moral' },
  { id: 'local', title: 'Amistosos de la zona', desc: 'Partidos ante el filial y clubes modestos cercanos, con minutos para los canteranos.', pros: 'Progreso de los jóvenes', cons: 'Menos ingresos y rodaje' },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function preseasonPending(gs: GameState) {
  return !!gs.manager.clubId && !gs.manager.sacked && gs.day < PRESEASON_DEADLINE && gs.preseason?.season !== gs.season;
}

/** Runs the chosen pre-season: three simulated friendlies (no official stats) plus the plan's effects. */
export function runPreseason(gs: GameState, plan: PlanId) {
  const rng = rngFor(gs, 'preseason');
  const me = gs.clubs[gs.manager.clubId];
  const all = Object.values(gs.clubs).filter(c => c.id !== me.id && !c.parentId);
  const tierOf = (id: string) => gs.leagues[gs.clubs[id].leagueId].tier;
  let pool: string[];
  if (plan === 'gira') pool = all.filter(c => c.country !== me.country && tierOf(c.id) === 1 && c.reputation >= Math.min(85, me.reputation)).map(c => c.id);
  else if (plan === 'montana') pool = all.filter(c => c.country === me.country && tierOf(c.id) > tierOf(me.id)).map(c => c.id);
  else pool = all.filter(c => c.country === me.country && tierOf(c.id) >= tierOf(me.id) && c.reputation < me.reputation).map(c => c.id);
  if (pool.length < 3) pool = all.filter(c => c.country === me.country).map(c => c.id);
  const opps = rng.shuffle(pool.slice()).slice(0, 3);
  if (plan === 'local') { const r = reserveOf(gs, me.id); if (r) opps[0] = r.id; }

  const results: { opp: string; gf: number; ga: number; home: boolean }[] = [];
  let pts = 0;
  opps.forEach((opp, i) => {
    const home = plan !== 'gira' && i !== 1;
    const f = { id: -(gs.nextId++), comp: 'friendly', round: i + 1, roundName: 'Amistoso', date: gs.day, home: home ? me.id : opp, away: home ? opp : me.id } as Fixture;
    const m = buildMatch(gs, f);
    runToEnd(m);
    const gf = m.sides[home ? 0 : 1].goals, ga = m.sides[home ? 1 : 0].goals;
    results.push({ opp, gf, ga, home });
    pts += gf > ga ? 1 : gf < ga ? -1 : 0;
  });

  const squad = clubPlayers(gs, me.id, true);
  let extra = '';
  if (plan === 'gira') {
    const fee = Math.round((0.5 + Math.pow(me.reputation / 10, 3) * 0.006) * 1_000_000 / 100_000) * 100_000;
    money(gs, me.id, fee, 'Gira de pretemporada');
    me.fans = clamp(me.fans + 3, 5, 100); me.cohesion = clamp(me.cohesion + 5, 0, 100);
    for (const p of squad) p.fitness = clamp(p.fitness - 8, 40, 100);
    extra = `La gira deja ${fmtMoney(fee)} en caja y nuevos aficionados, pero el equipo vuelve cansado.`;
  } else if (plan === 'montana') {
    me.cohesion = clamp(me.cohesion + 10, 0, 100);
    for (const p of squad) { if (rng.chance(0.6)) p.attrs.sta = Math.min(99, p.attrs.sta + 1); p.morale = clamp(p.morale - 2, 5, 100); }
    extra = 'El grupo sale muy unido y con más fondo físico, aunque algo quemado del trabajo.';
  } else {
    money(gs, me.id, 300_000, 'Amistosos de pretemporada');
    me.cohesion = clamp(me.cohesion + 7, 0, 100); me.fans = clamp(me.fans + 2, 5, 100);
    const young = [...squad, ...(reserveOf(gs, me.id) ? clubPlayers(gs, reserveOf(gs, me.id)!.id) : [])].filter(p => age(p, gs.season) <= 21);
    for (const p of young) for (let k = 0; k < 2; k++) { const a = rng.pick(ATTR_KEYS.filter(x => x !== 'gk')); p.attrs[a] = Math.min(99, p.attrs[a] + 1); }
    extra = `${young.length} jóvenes han sumado minutos y progresan.`;
  }
  for (const p of squad) p.morale = clamp(p.morale + pts, 5, 100);
  gs.preseason = { season: gs.season, plan, results };
  const line = results.map(r => `${r.home ? me.short : gs.clubs[r.opp].short} ${r.home ? r.gf : r.ga}-${r.home ? r.ga : r.gf} ${r.home ? gs.clubs[r.opp].short : me.short}`).join(' · ');
  news(gs, 'match', `Pretemporada: ${PLANS.find(x => x.id === plan)!.title}`, `${line}. ${extra}`);
  return { results, extra };
}
