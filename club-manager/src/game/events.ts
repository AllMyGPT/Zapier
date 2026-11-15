import type { Decision, Effect, GameState, Player } from './types';
import type { Rng } from './rng';
import { age, marketValue, ovr } from './player';
import { clubPlayers } from './lineup';
import { LEAGUE_START, inWindow } from './calendar';
import { fmtMoney, money, news, strengthOf } from './season';
import { askingPrice } from './market';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** International breaks (days since 1 July). */
export const INTL_BREAKS = [LEAGUE_START + 23, LEAGUE_START + 58, LEAGUE_START + 93, LEAGUE_START + 233];
const BIG_NATIONS = new Set(['ESP', 'ENG', 'FRA', 'GER', 'ITA', 'POR', 'NED', 'BEL', 'BRA', 'ARG', 'URU', 'CRO', 'COL', 'MAR', 'SEN', 'NOR', 'DEN', 'SUI', 'USA', 'JPN', 'POL', 'AUT', 'TUR', 'SRB', 'UKR', 'SCO', 'WAL', 'NGA', 'GHA', 'CIV', 'EGY', 'ALG', 'CMR', 'MEX', 'ECU', 'CHI', 'KOR', 'SWE', 'CZE', 'GEO']);

const COOLDOWN: Record<string, number> = { discipline: 45, raise: 35, sponsor: 120, youthbid: 60, friendly: 365, cuts: 60 };
function push(gs: GameState, d: Omit<Decision, 'id' | 'date'>) {
  gs.pending = [...(gs.pending ?? []), { ...d, id: gs.nextId++, date: gs.day }];
  gs.eventLog = { ...(gs.eventLog ?? {}), [d.kind]: gs.day };
}
const ready = (gs: GameState, kind: string) => { const last = gs.eventLog?.[kind]; return last == null || gs.day < last || gs.day - last >= (COOLDOWN[kind] ?? 30); };

/** Applies a decision effect to the user's club. */
export function applyEffect(gs: GameState, e: Effect) {
  const c = gs.clubs[gs.manager.clubId];
  if (e.board) gs.manager.board = clamp(gs.manager.board + e.board, 0, 100);
  if (e.fans) c.fans = clamp(c.fans + e.fans, 5, 100);
  if (e.money) money(gs, c.id, e.money, e.money > 0 ? 'Ingreso extraordinario' : 'Gasto extraordinario');
  if (e.budget) c.transferBudget = Math.max(0, c.transferBudget + e.budget);
  if (e.teamMorale || e.teamFitness) for (const p of clubPlayers(gs, c.id)) {
    if (e.teamMorale) p.morale = clamp(p.morale + e.teamMorale, 5, 100);
    if (e.teamFitness) p.fitness = clamp(p.fitness + e.teamFitness, 25, 100);
  }
  const p = e.pid != null ? gs.players[e.pid] : undefined;
  if (p) {
    if (e.morale) p.morale = clamp(p.morale + e.morale, 5, 100);
    if (e.wageMul) p.wage = Math.round(p.wage * e.wageMul / 1000) * 1000;
    if (e.extendYears) p.contractEnd = Math.max(p.contractEnd, gs.season + e.extendYears);
    if (e.listed != null) p.listed = e.listed;
    if (e.sellTo && e.fee) {
      const to = gs.clubs[e.sellTo];
      c.lineup = c.lineup.map(x => (x === p.id ? -1 : x)); c.bench = c.bench.filter(x => x !== p.id);
      p.clubId = to.id; p.youth = false; p.listed = false; p.num = 0;
      money(gs, c.id, e.fee, `Venta de ${p.name}`); money(gs, to.id, -e.fee, `Fichaje de ${p.name}`);
      c.transferBudget += Math.round(e.fee * 0.5);
    }
  }
  if (e.listTopWages) for (const x of clubPlayers(gs, c.id).sort((a, b) => b.wage - a.wage).slice(0, e.listTopWages)) x.listed = true;
  if (e.news) news(gs, 'club', e.news, '');
}

export function resolveDecision(gs: GameState, decisionId: number, option: number) {
  const d = gs.pending?.find(x => x.id === decisionId); if (!d) return;
  applyEffect(gs, d.options[option].effect);
  gs.pending = gs.pending!.filter(x => x.id !== decisionId);
}

// ---------------------------------------------------------------------------
// Event generators. Each returns true if it created something.
type Gen = (gs: GameState, rng: Rng) => boolean;

const indiscipline: Gen = (gs, rng) => {
  const ps = clubPlayers(gs, gs.manager.clubId).filter(p => age(p, gs.season) < 30);
  if (!ps.length) return false;
  const p = rng.pick(ps);
  const what = rng.pick(['llegó tarde al entrenamiento', 'fue visto de fiesta a las 4 de la madrugada antes de un partido', 'se encaró con un compañero en el vestuario', 'colgó un vídeo polémico en redes sociales']);
  push(gs, {
    kind: 'discipline', pid: p.id, title: `Problema de disciplina: ${p.name}`,
    body: `${p.name} ${what}. La prensa ya lo sabe y el vestuario espera tu reacción.`,
    options: [
      { label: 'Multa ejemplar', hint: 'La directiva lo aplaude; el jugador se molesta.', effect: { pid: p.id, morale: -8, board: 2, teamMorale: 1, money: 0 } },
      { label: 'Charla en privado', hint: 'Sin ruido: lo arreglas en el despacho.', effect: { pid: p.id, morale: 2 } },
      { label: 'Dejarlo pasar', hint: 'El vestuario lo nota.', effect: { teamMorale: -3, board: -1 } },
    ],
  });
  return true;
};

const raiseRequest: Gen = (gs, rng) => {
  const me = gs.manager.clubId;
  const ps = clubPlayers(gs, me).filter(p => p.stats.apps >= 6 && p.stats.ratingSum / p.stats.apps >= 7 && p.contractEnd <= gs.season + 2);
  if (!ps.length) return false;
  const p = rng.pick(ps);
  const ask = Math.round(p.wage * 1.35 / 1000) * 1000;
  push(gs, {
    kind: 'raise', pid: p.id, title: `${p.name} pide una mejora de contrato`,
    body: `Su agente recuerda que está siendo de los mejores del equipo y que su contrato acaba en ${p.contractEnd}. Pide ${fmtMoney(ask)}/semana (ahora cobra ${fmtMoney(p.wage)}).`,
    options: [
      { label: 'Aceptar y renovar', hint: `+35 % de sueldo, contrato hasta ${gs.season + 4}.`, effect: { pid: p.id, wageMul: 1.35, extendYears: 4, morale: 12 } },
      { label: 'Ofrecer la mitad', hint: '+15 %: puede que lo acepte a regañadientes.', effect: { pid: p.id, wageMul: 1.15, extendYears: 3, morale: rng.chance(0.55) ? 3 : -6 } },
      { label: 'Negarse', hint: 'Se sentirá infravalorado y podría pedir salir.', effect: { pid: p.id, morale: -14, listed: p.morale < 50 } },
    ],
  });
  return true;
};

const sponsor: Gen = (gs, rng) => {
  const c = gs.clubs[gs.manager.clubId];
  const amount = Math.round((0.4 + Math.pow(c.reputation / 10, 3) * 0.004) * 1_000_000 / 100_000) * 100_000;
  const brand = rng.pick(['una casa de apuestas', 'una marca de bebidas energéticas', 'una criptomoneda', 'una aerolínea del Golfo']);
  push(gs, {
    kind: 'sponsor', title: 'Oferta de patrocinio puntual',
    body: `${brand[0].toUpperCase() + brand.slice(1)} ofrece ${fmtMoney(amount)} por patrocinar la camiseta de entrenamiento esta temporada. Parte de la afición ya ha mostrado su rechazo en redes.`,
    options: [
      { label: 'Aceptar', hint: `+${fmtMoney(amount)} en caja; algo de malestar en la grada.`, effect: { money: amount, fans: -4, board: 2 } },
      { label: 'Negociar más', hint: 'Puede subir la oferta o retirarse.', effect: rng.chance(0.5) ? { money: Math.round(amount * 1.4), fans: -4, board: 3, news: 'El patrocinador acepta mejorar su oferta' } : { news: 'El patrocinador retira su oferta' } },
      { label: 'Rechazar', hint: 'La afición lo valora.', effect: { fans: 3 } },
    ],
  });
  return true;
};

const youthBid: Gen = (gs, rng) => {
  const me = gs.manager.clubId;
  const ps = Object.values(gs.players).filter(p => (p.clubId === me && age(p, gs.season) <= 20) || (p.clubId && gs.clubs[p.clubId]?.parentId === me)).filter(p => p.pot >= 78);
  if (!ps.length || !inWindow(gs.day)) return false;
  const p = rng.pick(ps);
  const bigger = Object.values(gs.clubs).filter(c => c.country !== gs.clubs[me].country && c.reputation > gs.clubs[me].reputation + 4 && !c.parentId);
  if (!bigger.length) return false;
  const buyer = rng.pick(bigger);
  const fee = Math.round(Math.max(marketValue(p, gs.season) * 1.6, 1_500_000) / 100_000) * 100_000;
  push(gs, {
    kind: 'youthbid', pid: p.id, title: `El ${buyer.name} quiere a ${p.name}`,
    body: `El ${buyer.name} ofrece ${fmtMoney(fee)} por tu canterano ${p.name} (${age(p, gs.season)} años, media ${ovr(p)}). Tus técnicos creen que puede llegar muy alto.`,
    options: [
      { label: 'Vender', hint: `+${fmtMoney(fee)}; la cantera pierde a su joya.`, effect: { pid: p.id, sellTo: buyer.id, fee, fans: -3 } },
      { label: 'Rechazar y renovarle', hint: 'Mejora de contrato y gesto de confianza.', effect: { pid: p.id, morale: 10, wageMul: 2, extendYears: 4, fans: 2 } },
      { label: 'Rechazar sin más', hint: 'Quizá le llegue la oferta a los oídos…', effect: { pid: p.id, morale: rng.chance(0.5) ? -6 : 2 } },
    ],
  });
  return true;
};

const friendly: Gen = (gs, rng) => {
  if (gs.day < 150 || gs.day > 215) return false;
  const fee = Math.round((0.6 + gs.clubs[gs.manager.clubId].reputation / 60) * 1_000_000 / 100_000) * 100_000;
  push(gs, {
    kind: 'friendly', title: 'Invitación a un torneo de invierno',
    body: `Un torneo en ${rng.pick(['Arabia Saudí', 'Miami', 'Catar', 'China'])} invita al club durante el parón y ofrece ${fmtMoney(fee)}. El viaje cansará a la plantilla.`,
    options: [
      { label: 'Aceptar', hint: `+${fmtMoney(fee)}; la plantilla pierde forma física.`, effect: { money: fee, teamFitness: -15, board: 2 } },
      { label: 'Rechazar', hint: 'Descanso para el grupo.', effect: { teamMorale: 2 } },
    ],
  });
  return true;
};

const boardCuts: Gen = (gs) => {
  const c = gs.clubs[gs.manager.clubId];
  if (c.balance > 0) return false;
  const wages = clubPlayers(gs, c.id).reduce((a, p) => a + p.wage, 0);
  const cut = Math.round(c.transferBudget * 0.5 / 100_000) * 100_000;
  push(gs, {
    kind: 'cuts', title: 'La directiva exige reducir gastos',
    body: `El club está en números rojos (${fmtMoney(c.balance)}) y la masa salarial es de ${fmtMoney(wages)}/semana. El consejo pide medidas.`,
    options: [
      { label: 'Recortar el presupuesto de fichajes', hint: `-${fmtMoney(cut)} para fichar; la directiva lo agradece.`, effect: { budget: -cut, board: 6 } },
      { label: 'Poner a la venta a los sueldos altos', hint: 'Lista de transferibles; el vestuario se inquieta.', effect: { teamMorale: -3, board: 4, listTopWages: 3, news: 'El club pone a la venta a tres de sus sueldos más altos' } },
      { label: 'Pedir paciencia', hint: 'La directiva no lo verá con buenos ojos.', effect: { board: -6 } },
    ],
  });
  return true;
};

// ---------------------------------------------------------------------------
/** Called once a week from the daily loop. */
export function weeklyEvents(gs: GameState, rng: Rng) {
  const me = gs.manager.clubId; const c = gs.clubs[me];
  if (!c || gs.manager.sacked) return;
  // decision events: at most one waiting at a time, roughly every three weeks
  if (!(gs.pending?.length) && rng.chance(0.33)) {
    const gens: [string, Gen, number][] = [['discipline', indiscipline, 3], ['raise', raiseRequest, 3], ['sponsor', sponsor, 1.5], ['youthbid', youthBid, 2], ['friendly', friendly, 2], ['cuts', boardCuts, c.balance < 0 ? 4 : 0]];
    const open = gens.filter(g => g[2] > 0 && ready(gs, g[0]));
    for (let tries = 0; tries < 3 && open.length; tries++) {
      const g = rng.weighted(open, open.map(x => x[2]));
      if (g[1](gs, rng)) break;
      open.splice(open.indexOf(g), 1);
    }
  }
  // rumours: a bigger club is following one of your best players
  if (rng.chance(0.12)) {
    const best = clubPlayers(gs, me).sort((a, b) => ovr(b) - ovr(a)).slice(0, 5);
    const p = best.length ? rng.pick(best) : undefined;
    const suitors = Object.values(gs.clubs).filter(x => x.reputation > c.reputation && x.id !== me && !x.parentId);
    if (p && suitors.length) {
      const s = rng.pick(suitors);
      news(gs, 'info', `Rumor: el ${s.name} sigue a ${p.name}`, `Según la prensa, el ${s.name} ha enviado ojeadores a ver a ${p.name}. Su precio de mercado ronda ${fmtMoney(askingPrice(gs, p))}.`);
      if (p.morale < 60) p.morale = clamp(p.morale - 3, 5, 100);
    }
  }
  // fans and board mood
  if (c.fans < 28 && rng.chance(0.25)) news(gs, 'club', 'Pañolada en la grada', 'La afición muestra su enfado con pañuelos blancos. La asistencia al estadio se resiente.');
  if (gs.manager.board < 25 && rng.chance(0.3)) news(gs, 'board', 'Ultimátum de la directiva', 'El presidente avisa: o llegan resultados en las próximas semanas o habrá cambios en el banquillo.');
}

/** International break: national-team call-ups for the user's players. */
export function internationalBreak(gs: GameState, rng: Rng) {
  if (!INTL_BREAKS.includes(gs.day)) return;
  const me = gs.manager.clubId;
  const called: Player[] = clubPlayers(gs, me).filter(p => BIG_NATIONS.has(p.nat) && ovr(p) >= Math.max(74, strengthOf(gs, me) - 2));
  if (!called.length) return;
  const hurt: string[] = [];
  for (const p of called) {
    p.fitness = Math.max(40, p.fitness - rng.int(8, 18));
    if (rng.chance(0.06)) { p.injury = rng.int(6, 20); p.injuryName = 'Lesión con su selección'; hurt.push(p.name); }
  }
  news(gs, 'info', `Parón de selecciones: ${called.length} convocados`, `Se marchan con sus selecciones: ${called.map(p => p.name).join(', ')}. Volverán cansados.${hurt.length ? ` Malas noticias: ${hurt.join(', ')} vuelve(n) lesionado(s).` : ''}`);
}
