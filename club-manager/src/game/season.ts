import type { Club, Fixture, GameState, League, NewsItem, Objectives, Player } from './types';
import { Rng, hashStr } from './rng';
import { createMatch, runToEnd, type Match } from './engine';
import { autoPick, clubPlayers, ensureLineup, withPlayerIndex } from './lineup';
import { CUP_DAYS, EURO_FINAL_DAY, EURO_GROUP_DAYS, EURO_KO_DAYS, EURO_DAY_OFFSET, isEuro, SEASON_END_DAY, addFixture, compName, drawCupRound, inWindow, scheduleSeason, seasonLabel, table, WINDOWS } from './calendar';
import { age, emptyStats, fairWage, marketValue, ovr, ratingAt, ATTR_KEYS, WEIGHTS } from './player';
import { TV_WEEKLY, assignNumbers, genSquad, makePlayer, RAW_LEAGUES } from './data';
import { genName, FOREIGN_NATS, SPONSORS } from './names';
import { aiTransfers, incomingOffers } from './market';
import { weeklyEvents, internationalBreak } from './events';
import { lifeWeekly, lifeSeasonEnd } from './life';
import { sponsorBonus } from './sponsors';

export function rngFor(gs: GameState, salt: string | number) { return new Rng(hashStr(`${gs.seed}:${gs.season}:${gs.day}:${salt}`)); }

export function news(gs: GameState, kind: NewsItem['kind'], title: string, body: string) {
  gs.news.unshift({ id: gs.nextId++, date: gs.day, title, body, kind });
  if (gs.news.length > 120) gs.news.length = 120;
}
export function money(gs: GameState, clubId: string, amount: number, label: string) {
  const c = gs.clubs[clubId]; c.balance += amount;
  if (clubId === gs.manager.clubId) { gs.finance.push({ date: gs.day + gs.season * 1000, label, amount }); if (gs.finance.length > 600) gs.finance.splice(0, gs.finance.length - 600); }
}

/** Euro participants for the very first season: by reputation within each league */
export function initialEuroTeams(gs: GameState, second = false) {
  const out: string[] = [];
  for (const L of Object.values(gs.leagues)) if (L.tier === 1) out.push(...L.clubIds.slice().sort((a, b) => gs.clubs[b].reputation - gs.clubs[a].reputation).slice(second ? L.euroSpots : 0, second ? L.euroSpots * 2 : L.euroSpots));
  return out;
}

/** Same-city clubs in the same country play a derby. */
export function isDerby(gs: GameState, a: string, b: string) {
  const x = gs.clubs[a], y = gs.clubs[b];
  return !!x && !!y && x.country === y.country && x.city === y.city;
}

export const CUP_TARGET_LABEL = ['jugar la copa', 'llegar a octavos', 'llegar a cuartos', 'llegar a semifinales', 'llegar a la final', 'ganar la copa'];
/** Sets the board's objectives at the start of a season. */
export function setObjectives(gs: GameState) {
  const c = gs.clubs[gs.manager.clubId]; const L = gs.leagues[c.leagueId];
  const pos = expectedPos(gs, c.id);
  const cup = L.tier > 1 ? 1 : pos <= 2 ? 4 : pos <= 5 ? 3 : pos <= 10 ? 2 : 1;
  gs.objectives = { season: gs.season, pos, cup, minBalance: Math.round(c.balance * 0.6 / 100_000) * 100_000 };
}
/** Furthest cup round index reached by the user's club this season (5 = winner). */
export function cupReached(gs: GameState) {
  const c = gs.clubs[gs.manager.clubId]; const cup = gs.cups['cup_' + c.country];
  if (!cup) return 0;
  if (cup.winner === c.id) return 5;
  const rounds = gs.fixtures.filter(f => f.comp === cup.id && (f.home === c.id || f.away === c.id)).map(f => f.round);
  return rounds.length ? Math.max(...rounds) - 1 : 0;
}
export function objectiveStatus(gs: GameState): { label: string; state: 'ok' | 'bad' | 'open' }[] {
  const o = gs.objectives; if (!o) return [];
  const c = gs.clubs[gs.manager.clubId];
  const pos = table(gs, c.leagueId).findIndex(r => r.id === c.id) + 1;
  const cup = gs.cups['cup_' + c.country];
  const reached = cupReached(gs);
  const alive = !!cup && !cup.winner && cup.alive.includes(c.id);
  const played = gs.fixtures.some(f => f.comp === c.leagueId && f.played);
  return [
    { label: `Liga: ${o.pos === 1 ? 'ser campeón' : `terminar ${o.pos}º o mejor`} (ahora ${played ? pos + 'º' : '—'})`, state: !played ? 'open' : pos <= o.pos ? 'ok' : 'bad' },
    { label: `Copa: ${CUP_TARGET_LABEL[o.cup]}`, state: reached >= o.cup ? 'ok' : alive ? 'open' : 'bad' },
    { label: `Finanzas: saldo de al menos ${fmtMoney(o.minBalance)} (ahora ${fmtMoney(c.balance)})`, state: c.balance >= o.minBalance ? 'ok' : 'bad' },
  ];
}

export function startCareer(gs: GameState, clubId: string) {
  gs.manager.clubId = clubId;
  const c = gs.clubs[clubId];
  gs.manager.reputation = Math.max(35, c.reputation - 15);
  gs.manager.board = 65;
  scheduleSeason(gs, rngFor(gs, 'sched'), initialEuroTeams(gs), initialEuroTeams(gs, true));
  youthIntake(gs, c, rngFor(gs, 'youth'));
  setObjectives(gs);
  news(gs, 'board', `Bienvenido a ${c.name}`, `La directiva te da la bienvenida como nuevo entrenador. Objetivo de la temporada: ${expectationLabel(gs, clubId)}. Presupuesto de fichajes: ${fmtMoney(c.transferBudget)}.`);
  news(gs, 'info', 'Mercado de fichajes abierto', 'El mercado de verano está abierto hasta el 31 de agosto. Revisa la plantilla y busca refuerzos en la sección Fichajes.');
}

export function fmtMoney(v: number) {
  const a = Math.abs(v); const s = v < 0 ? '-' : '';
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(a >= 1e8 ? 0 : 1)} M€`;
  if (a >= 1e3) return `${s}${Math.round(a / 1e3)} mil €`;
  return `${s}${Math.round(a)} €`;
}

export function expectedPos(gs: GameState, clubId: string) {
  const L = gs.leagues[gs.clubs[clubId].leagueId];
  const st = new Map(L.clubIds.map(id => [id, strengthOf(gs, id)] as const)); // compute once, not per comparison
  const sorted = L.clubIds.slice().sort((a, b) => st.get(b)! - st.get(a)!);
  return sorted.indexOf(clubId) + 1;
}
export function expectationLabel(gs: GameState, clubId: string) {
  const L = gs.leagues[gs.clubs[clubId].leagueId]; const e = expectedPos(gs, clubId);
  if (L.tier === 2) return e <= 3 ? 'conseguir el ascenso' : 'quedar en la mitad alta';
  if (L.tier === 3) return e <= 2 ? 'conseguir el ascenso' : e <= 8 ? 'pelear por el ascenso' : 'quedar en la mitad alta';
  if (e === 1) return 'ganar la liga';
  if (e <= 4) return 'terminar entre los 4 primeros';
  if (e <= L.euroSpots) return 'clasificarse para Europa';
  if (e <= L.clubIds.length - 6) return 'quedar en mitad de tabla';
  return 'evitar el descenso';
}
export function strengthOf(gs: GameState, clubId: string) {
  const ps = clubPlayers(gs, clubId).map(ovr).sort((a, b) => b - a).slice(0, 14);
  return ps.reduce((a, b) => a + b, 0) / (ps.length || 1);
}

// ---------------- matches ----------------
export function isUserFixture(gs: GameState, f: Fixture) { return f.home === gs.manager.clubId || f.away === gs.manager.clubId; }

export function prepareSide(gs: GameState, club: Club): [number[], number[]] {
  if (club.id === gs.manager.clubId) { ensureLineup(gs, club); return [club.lineup.slice(), club.bench.slice()]; }
  const pick = autoPick(clubPlayers(gs, club.id), club.tactics.formation);
  club.lineup = pick.lineup; club.bench = pick.bench;
  return [pick.lineup, pick.bench];
}

export function firstLegOf(gs: GameState, f: Fixture): [number, number] | undefined {
  if (f.leg !== 2) return undefined;
  const l1 = gs.fixtures.find(x => x.tieId === f.tieId && x.leg === 1);
  return l1 && l1.played ? [l1.hg!, l1.ag!] : undefined;
}

export function buildMatch(gs: GameState, f: Fixture): Match {
  const home = gs.clubs[f.home], away = gs.clubs[f.away];
  const knockout = (f.comp.startsWith('cup_') || (isEuro(f.comp) && !f.roundName?.startsWith('Grupo'))) && f.leg !== 1;
  const userSide = f.home === gs.manager.clubId ? 0 : f.away === gs.manager.clubId ? 1 : null;
  return createMatch(gs, home, away, { home: prepareSide(gs, home), away: prepareSide(gs, away) }, {
    seed: hashStr(`${gs.seed}-${f.id}-${gs.season}`), knockout, firstLeg: firstLegOf(gs, f), neutral: f.roundName === 'Final', userSide,
  });
}

export function applyResult(gs: GameState, f: Fixture, m: Match) {
  f.hg = m.sides[0].goals; f.ag = m.sides[1].goals; f.played = true; f.pens = m.pens;
  f.scorers = m.events.filter(e => e.kind === 'goal' && e.pid != null).map(e => ({ pid: e.pid!, club: m.sides[e.side].clubId, min: e.min }));
  const isLeague = !!gs.leagues[f.comp];
  for (const si of [0, 1] as const) {
    const s = m.sides[si]; const opp = m.sides[si === 0 ? 1 : 0];
    const club = s.club;
    // suspensions served
    for (const p of clubPlayers(gs, club.id)) if (p.susp > 0 && !s.played.has(p.id)) p.susp--;
    const res = s.goals > opp.goals ? 1 : s.goals < opp.goals ? -1 : 0;
    for (const id of s.played) {
      const p = gs.players[id]; if (!p) continue;
      const r = Math.round((s.rating[id] ?? 6) * 10) / 10;
      p.stats.apps++; p.stats.ratingSum += r;
      p.form.push(r); if (p.form.length > 5) p.form.shift();
      p.fitness = Math.max(25, Math.round(s.energy[id] ?? p.fitness));
      p.morale = clamp(p.morale + (res > 0 ? 5 : res < 0 ? -4 : 1) + (r >= 7.5 ? 3 : r < 5.5 ? -2 : 0), 5, 100);
      if (opp.goals === 0 && (p.pos === 'GK' || ['CB', 'LB', 'RB'].includes(p.pos)) && s.onPitch.includes(id)) p.stats.cs++;
    }
    for (const e of m.events) {
      if (e.side !== si) continue;
      if (e.kind === 'goal' && e.pid) { gs.players[e.pid].stats.goals++; if (e.pid2) gs.players[e.pid2].stats.assists++; }
      if (e.kind === 'yellow' && e.pid) { const p = gs.players[e.pid]; p.stats.yel++; if (isLeague) { p.yellows++; if (p.yellows >= 5) { p.yellows = 0; p.susp += 1; if (club.id === gs.manager.clubId) news(gs, 'match', `${p.name}, sancionado`, `Acumula 5 amarillas y se perderá el próximo partido.`); } } }
      if (e.kind === 'red' && e.pid) { const p = gs.players[e.pid]; p.stats.red++; const n = 1 + (m.rng.chance(0.3) ? 1 : 0) + (m.rng.chance(0.1) ? 1 : 0); p.susp += n; if (club.id === gs.manager.clubId) news(gs, 'match', `${p.name}, expulsado`, `Cumplirá ${n} partido(s) de sanción.`); }
    }
    for (const inj of m.injuries) if (gs.players[inj.pid]?.clubId === club.id) {
      const p = gs.players[inj.pid]; const physio = club.staff.physio;
      p.injury = Math.max(p.injury, Math.round(inj.days * (1.15 - physio * 0.06))); p.injuryName = inj.name;
      if (club.id === gs.manager.clubId) news(gs, 'injury', `Lesión: ${p.name}`, `${inj.name}. Baja estimada: ${Math.ceil(p.injury / 7)} semana(s).`);
    }
    // non-played squad morale drift
    if (si === 0 && !m.neutral) gate(gs, club, opp.club, f);
    club.fans = clamp(club.fans + res * (isDerby(gs, f.home, f.away) ? 5 : 2), 5, 100);
  }
  if (isUserFixture(gs, f)) {
    const us = f.home === gs.manager.clubId ? 0 : 1;
    const res = Math.sign(m.sides[us].goals - m.sides[1 - us].goals);
    const oppStr = strengthOf(gs, m.sides[1 - us].clubId), myStr = strengthOf(gs, gs.manager.clubId);
    const surprise = (oppStr - myStr) / 4;
    const derby = isDerby(gs, f.home, f.away) ? res * 2 : 0;
    gs.manager.board = clamp(gs.manager.board + derby + (res > 0 ? 2 + Math.max(0, surprise) : res < 0 ? -2.5 + Math.min(0, surprise) * 0.5 : 0.3 + surprise * 0.3), 0, 100);
    gs.manager.reputation = clamp(gs.manager.reputation + (res > 0 ? 0.25 : res < 0 ? -0.15 : 0.05), 1, 100);
    gs.lastResults = [...(gs.lastResults ?? []), res].slice(-6);
  }
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function gate(gs: GameState, home: Club, away: Club, f: Fixture) {
  const big = f.comp === 'euro' ? 1.25 : f.comp === 'euro2' ? 1.1 : f.comp.startsWith('cup_') ? 0.85 : 1;
  const demand = (0.45 + home.reputation / 200 + away.reputation / 400) * (0.7 + home.fans / 200) * big * (home.city === away.city ? 1.2 : 1);
  const priceRef = 15 + Math.pow(home.reputation / 100, 3) * 70;
  const priceF = Math.pow(priceRef / Math.max(5, home.ticketPrice), 0.8);
  const att = Math.round(Math.min(1, demand * priceF) * home.capacity);
  const income = att * home.ticketPrice;
  (f as Fixture & { att?: number }).att = att;
  money(gs, home.id, income, `Taquilla vs ${away.name} (${att.toLocaleString('es-ES')} esp.)`);
}

export function simFixture(gs: GameState, f: Fixture) {
  const m = buildMatch(gs, f);
  runToEnd(m);
  applyResult(gs, f, m);
}

export function winnerOf(gs: GameState, f: Fixture): string {
  if (f.leg === 2) {
    const l1 = gs.fixtures.find(x => x.tieId === f.tieId && x.leg === 1)!;
    const aggH = f.hg! + l1.ag!, aggA = f.ag! + l1.hg!;
    if (aggH !== aggA) return aggH > aggA ? f.home : f.away;
  } else if (f.hg !== f.ag) return f.hg! > f.ag! ? f.home : f.away;
  if (f.pens) return f.pens[0] > f.pens[1] ? f.home : f.away;
  return f.home;
}

// ---------------- daily loop ----------------
export type AdvanceResult = { type: 'match'; fixture: Fixture } | { type: 'event'; reason: string } | { type: 'decision' } | { type: 'seasonEnd' } | { type: 'sacked' };

export function userFixtureToday(gs: GameState) { return gs.fixtures.find(f => f.date === gs.day && !f.played && isUserFixture(gs, f)); }

export function playOthersToday(gs: GameState) {
  const today = gs.fixtures.filter(f => f.date === gs.day && !f.played && !isUserFixture(gs, f));
  if (today.length) withPlayerIndex(gs, () => { for (const f of today) simFixture(gs, f); });
  progressCups(gs);
}

export function advance(gs: GameState, maxDays = 60): AdvanceResult {
  for (let i = 0; i < maxDays; i++) {
    if (gs.manager.sacked) return { type: 'sacked' };
    if (gs.pending?.length) return { type: 'decision' };
    const uf = userFixtureToday(gs);
    if (uf) return { type: 'match', fixture: uf };
    playOthersToday(gs);
    if (gs.day >= SEASON_END_DAY) return { type: 'seasonEnd' };
    const before = gs.news.length ? gs.news[0].id : 0;
    nextDay(gs);
    const important = gs.news.find(n => n.id > before && (n.kind === 'transfer' || n.kind === 'board'));
    if (gs.manager.sacked) return { type: 'sacked' };
    if (gs.pending?.length) return { type: 'decision' };
    if (important) return { type: 'event', reason: important.title };
    if (userFixtureToday(gs)) return { type: 'match', fixture: userFixtureToday(gs)! };
  }
  return { type: 'event', reason: 'Continúa' };
}

function nextDay(gs: GameState) {
  gs.day++;
  const rng = rngFor(gs, 'day');
  for (const id in gs.players) {
    const p = gs.players[id];
    if (p.injury > 0) { p.injury--; if (p.injury === 0 && p.clubId === gs.manager.clubId) news(gs, 'injury', `${p.name} recibe el alta`, 'Vuelve a estar disponible.'); }
    if (p.clubId) {
      const c = gs.clubs[p.clubId];
      const intensity = c.training.focus === 'descanso' ? 0 : c.training.intensity;
      p.fitness = Math.min(100, p.fitness + 5 + c.staff.fitness * 0.5 - intensity * 0.8 + (p.attrs.sta - 70) / 40);
    } else p.fitness = Math.min(100, p.fitness + 3);
  }
  for (const c of Object.values(gs.clubs)) if (c.expansion) {
    c.expansion.daysLeft--;
    if (c.expansion.daysLeft <= 0) { c.capacity += c.expansion.seats; if (c.id === gs.manager.clubId) news(gs, 'club', 'Ampliación terminada', `${c.stadium} tiene ahora ${c.capacity.toLocaleString('es-ES')} asientos.`); c.expansion = undefined; }
  }
  if (gs.day % 7 === 0) {
    weekly(gs, rng); if (gs.day > 3) weeklyEvents(gs, rng);
    const mood = lifeWeekly(gs); // the manager's personal mood spills into the dressing room
    if (mood) for (const p of clubPlayers(gs, gs.manager.clubId)) p.morale = clamp(p.morale + mood, 5, 100);
  }
  internationalBreak(gs, rng);
  if (gs.day === WINDOWS[0][1] + 1 || gs.day === WINDOWS[1][1] + 1) news(gs, 'info', 'Mercado cerrado', 'El mercado de fichajes se ha cerrado. Solo puedes fichar jugadores libres.');
  if (gs.day === WINDOWS[1][0]) news(gs, 'info', 'Mercado de invierno abierto', 'Hasta el 31 de enero puedes comprar y vender jugadores.');
}

function weekly(gs: GameState, rng: Rng) {
  withPlayerIndex(gs, () => weeklyFinance(gs, rng)); // no player changes club here, so the index is safe
  weeklyRest(gs, rng);
}

function weeklyFinance(gs: GameState, rng: Rng) {
  for (const c of Object.values(gs.clubs)) {
    const ps = clubPlayers(gs, c.id, true);
    const wages = ps.reduce((a, p) => a + p.wage, 0);
    const staffW = Object.values(c.staff).reduce((a, l) => a + l * l * 6000, 0);
    const tier = gs.leagues[c.leagueId].tier;
    const tv = tier === 1 ? TV_WEEKLY[c.country] * (0.6 + c.reputation / 160) : tier === 2 ? 120_000 + c.reputation * 1500 : 25_000 + c.reputation * 500;
    const merch = Math.pow(c.reputation / 10, 3.3) * 220 * (0.7 + c.fans / 200);
    money(gs, c.id, -wages, 'Salarios jugadores');
    money(gs, c.id, -staffW, 'Salarios cuerpo técnico');
    money(gs, c.id, Math.round(tv), 'Derechos de TV');
    money(gs, c.id, Math.round(merch), 'Merchandising');
    money(gs, c.id, c.sponsor.weekly, `Patrocinio ${c.sponsor.name}`);
    money(gs, c.id, -Math.round(c.capacity * 3.5), 'Mantenimiento estadio');
    training(gs, c, ps, rng);
  }
}

function weeklyRest(gs: GameState, rng: Rng) {
  const season = gs.season;
  const u = gs.clubs[gs.manager.clubId];
  // board review
  const L = gs.leagues[u.leagueId];
  const rows = table(gs, L.id); const pos = rows.findIndex(r => r.id === u.id) + 1; const played = rows[0]?.p ?? 0;
  if (played >= 6) {
    const exp = expectedPos(gs, u.id);
    gs.manager.board = clamp(gs.manager.board + (exp - pos) * 0.25, 0, 100);
    if (u.balance < -20_000_000) gs.manager.board = clamp(gs.manager.board - 1.5, 0, 100);
    if (gs.manager.board < 12 && played >= 10) {
      gs.manager.sacked = true;
      news(gs, 'board', 'Has sido destituido', `La directiva de ${u.name} ha decidido prescindir de tus servicios tras los malos resultados (puesto ${pos}º, objetivo ${exp}º).`);
      return;
    }
    if (gs.manager.board < 25 && rng.chance(0.3)) news(gs, 'board', 'La directiva está preocupada', `Los resultados no acompañan. Vamos ${pos}º y el objetivo era ${expectationLabel(gs, u.id)}. Necesitamos una reacción inmediata.`);
  }
  // contract warnings
  if (gs.day === 175 || gs.day === 280) {
    const exp = clubPlayers(gs, u.id).filter(p => p.contractEnd <= season + 1);
    if (exp.length) news(gs, 'club', 'Contratos que expiran', `Terminan contrato este verano: ${exp.map(p => p.name).join(', ')}. Renueva desde la ficha del jugador o se marcharán libres.`);
  }
  if (gs.day % 28 === 0 && gs.day > 70) {
    const matches = gs.fixtures.filter(f => f.played && (f.home === u.id || f.away === u.id)).length;
    for (const p of clubPlayers(gs, u.id)) {
      if ((p.role === 'estrella' || p.role === 'titular') && p.injury === 0 && matches >= 6 && p.stats.apps < matches * (p.role === 'estrella' ? 0.6 : 0.45)) {
        p.morale = clamp(p.morale - 6, 5, 100);
        news(gs, 'club', `${p.name} se queja de su rol`, `Firmó como ${p.role} y apenas cuenta (${p.stats.apps} de ${matches} partidos). Su moral cae.`);
      }
    }
  }
  if (inWindow(gs.day)) { aiTransfers(gs, rng); incomingOffers(gs, rng); }
  if (u.cohesion < 100) u.cohesion = clamp(u.cohesion + (u.training.focus === 'tactica' ? 4 : 1.5), 0, 100);
}

function training(gs: GameState, c: Club, ps: Player[], rng: Rng) {
  const isUser = c.id === gs.manager.clubId;
  const t = c.training;
  const intensity = t.focus === 'descanso' ? 0 : t.intensity;
  const focusAttrs: Record<string, (keyof Player['attrs'])[]> = {
    general: [], ataque: ['sho', 'dri', 'pas'], defensa: ['def', 'hea'], fisico: ['pac', 'sta'], tactica: ['pas', 'def'], balon_parado: ['sho', 'hea', 'pas'], descanso: [],
  };
  for (const p of ps) {
    const a = age(p, gs.season);
    const o = ratingAt(p.attrs, p.pos);
    let g = 0;
    if (a <= 23) g = Math.max(0, p.pot - o) * 0.02;
    else if (a <= 27) g = Math.max(0, p.pot - o) * 0.012;
    else if (a <= 30) g = 0.01;
    else g = -0.04 - (a - 30) * 0.025;
    if (g > 0) g *= (0.7 + c.staff.coach * 0.1) * (0.6 + intensity * 0.25) * (p.youth ? 0.8 : 1) * (0.85 + Math.min(p.stats.apps, 20) * 0.015);
    // spread across weighted attrs
    const w = WEIGHTS[p.pos];
    const keys = ATTR_KEYS.filter(k => (w[k] ?? 0) > 0);
    const extra = focusAttrs[t.focus] ?? [];
    for (const k of keys) {
      const share = (w[k] ?? 0) * 1.0 + (extra.includes(k) ? 0.15 : 0) + (p.trainFocus === k ? 0.5 : 0);
      const delta = g * share * (p.pos === 'GK' ? (0.7 + c.staff.gk * 0.1) / (0.7 + c.staff.coach * 0.1) * (k === 'gk' ? 1.1 : 1) : 1) * 1.15;
      if (rng.chance(Math.abs(delta) % 1)) p.attrs[k] = Math.max(1, Math.min(99, p.attrs[k] + Math.sign(delta)));
      if (Math.abs(delta) >= 1) p.attrs[k] = Math.max(1, Math.min(99, p.attrs[k] + Math.trunc(delta)));
    }
    if (isUser && intensity === 3 && rng.chance(0.006)) { p.injury = rng.int(3, 12); p.injuryName = 'Lesión en el entrenamiento'; news(gs, 'injury', `${p.name} se lesiona entrenando`, `Baja de ${p.injury} días. La carga alta de entrenamiento aumenta el riesgo.`); }
    if (isUser && !p.youth) {
      // playing time morale
      const o2 = ovr(p);
      if (o2 > 70 && p.stats.apps < Math.floor(gs.day / 21) - 2) p.morale = clamp(p.morale - 1.5, 5, 100);
      if (t.focus === 'descanso') p.morale = clamp(p.morale + 1, 5, 100);
      p.morale = clamp(p.morale + (65 - p.morale) * 0.03, 5, 100);
      // promised playing time: at least two matches before the deadline
      if (p.promise && gs.day >= p.promise.until) {
        if (p.stats.apps - p.promise.apps >= 2) { p.morale = clamp(p.morale + 4, 5, 100); news(gs, 'club', `${p.name} valora que cumplieras tu palabra`, 'Le prometiste minutos y los ha tenido. Su confianza en ti ha crecido.'); }
        else { p.morale = clamp(p.morale - 14, 5, 100); news(gs, 'club', `${p.name} se siente engañado`, 'Le prometiste minutos y apenas ha jugado. Su moral se ha hundido y podría pedir salir.'); if (p.morale < 30) p.listed = true; }
        p.promise = undefined;
      }
    }
  }
}

// ---------------- cups ----------------
function progressCups(gs: GameState) {
  const rng = rngFor(gs, 'cups');
  for (const cup of Object.values(gs.cups)) {
    if (cup.done) continue;
    const comp = cup.id;
    const roundFx = gs.fixtures.filter(f => f.comp === comp && (f.roundName === cup.rounds[cup.stage] || (isEuro(cup.id) && cup.stage === 0 && f.roundName?.startsWith('Grupo'))));
    if (!roundFx.length || roundFx.some(f => !f.played)) continue;
    if (isEuro(cup.id)) { progressEuro(gs, rng, cup.id); continue; }
    const winners = roundFx.map(f => winnerOf(gs, f));
    if (cup.stage === 0) {
      const losers = new Set(roundFx.map(f => (winnerOf(gs, f) === f.home ? f.away : f.home)));
      cup.alive = cup.alive.filter(id => !losers.has(id));
    } else cup.alive = winners;
    if (cup.alive.length <= 1) { finishCup(gs, cup.id, cup.alive[0]); continue; }
    cup.stage++;
    drawCupRound(gs, rng, cup.id);
    const u = gs.manager.clubId;
    if (cup.alive.includes(u)) { const f = gs.fixtures.find(x => x.comp === comp && x.round === cup.stage + 1 && (x.home === u || x.away === u)); if (f) news(gs, 'match', `${cup.name}: sorteo de ${cup.rounds[cup.stage]}`, `Rival: ${gs.clubs[f.home === u ? f.away : f.home].name} (${f.home === u ? 'en casa' : 'fuera'}).`); }
    else if (roundFx.some(f => f.home === u || f.away === u)) news(gs, 'match', `Eliminados de la ${cup.name}`, 'Toca centrarse en el resto de competiciones.');
    void CUP_DAYS;
  }
}

function progressEuro(gs: GameState, rng: Rng, id: string) {
  const cup = gs.cups[id];
  const u = gs.manager.clubId;
  if (cup.stage === 0) {
    const firsts: string[] = [], seconds: string[] = [];
    cup.groups!.forEach((g, gi) => { const t = table(gs, id, g); firsts.push(t[0].id); seconds.push(t[1].id); void gi; });
    cup.alive = [...firsts, ...seconds];
    const sec = rng.shuffle(seconds.slice());
    // avoid same group pairing
    for (let i = 0; i < 8; i++) if (cup.groups![i].includes(sec[i])) { const j = (i + 1) % 8; [sec[i], sec[j]] = [sec[j], sec[i]]; }
    cup.stage = 1;
    for (let i = 0; i < 8; i++) twoLeg(gs, sec[i], firsts[i], 1, id);
  } else if (cup.stage <= 3) {
    const leg2 = gs.fixtures.filter(f => f.comp === id && f.roundName === cup.rounds[cup.stage] && f.leg === 2);
    const winners = rng.shuffle(leg2.map(f => winnerOf(gs, f)));
    const wasIn = cup.alive.includes(u);
    cup.alive = winners;
    if (wasIn && !winners.includes(u)) news(gs, 'match', `Adiós a la ${cup.name}`, `Eliminados en ${cup.rounds[cup.stage].toLowerCase()}.`);
    cup.stage++;
    if (cup.stage === 4) addFixture(gs, { comp: id, round: 9, roundName: 'Final', date: EURO_FINAL_DAY - 2 * EURO_DAY_OFFSET[id], home: winners[0], away: winners[1] });
    else for (let i = 0; i < winners.length; i += 2) twoLeg(gs, winners[i], winners[i + 1], cup.stage, id);
  } else {
    const f = gs.fixtures.find(x => x.comp === id && x.roundName === 'Final')!;
    finishCup(gs, id, winnerOf(gs, f));
  }
  if (cup.stage >= 1 && cup.stage <= 4 && cup.alive.includes(u) && !cup.done) news(gs, 'match', `${cup.name}: ${cup.rounds[cup.stage]}`, 'Seguimos vivos en Europa. Consulta el cruce en Competiciones.');
}

function twoLeg(gs: GameState, a: string, b: string, stage: number, id: string) {
  const tie = gs.nextId++;
  const [d1, d2] = EURO_KO_DAYS[stage - 1].map(d => d + EURO_DAY_OFFSET[id]);
  const name = gs.cups[id].rounds[stage];
  addFixture(gs, { comp: id, round: 6 + stage, roundName: name, date: d1, home: a, away: b, leg: 1, tieId: tie });
  addFixture(gs, { comp: id, round: 6 + stage, roundName: name, date: d2, home: b, away: a, leg: 2, tieId: tie });
}

function finishCup(gs: GameState, cupId: string, winner: string) {
  const cup = gs.cups[cupId]; cup.done = true; cup.winner = winner;
  gs.trophies.push({ season: gs.season, comp: cup.name, club: winner });
  const prize = cupId === 'euro' ? 25_000_000 : cupId === 'euro2' ? 9_000_000 : 4_000_000;
  money(gs, winner, prize, `Premio campeón ${cup.name}`);
  gs.clubs[winner].reputation = Math.min(99, gs.clubs[winner].reputation + (cupId === 'euro' ? 3 : cupId === 'euro2' ? 2 : 1));
  if (winner === gs.manager.clubId) { news(gs, 'board', `¡CAMPEONES de la ${cup.name}!`, `Título histórico. Premio de ${fmtMoney(prize)}. La afición está eufórica.`); gs.manager.board = Math.min(100, gs.manager.board + 20); gs.manager.reputation = Math.min(100, gs.manager.reputation + 6); }
  else news(gs, 'info', `${gs.clubs[winner].name} gana la ${cup.name}`, '');
}

// ---------------- youth ----------------
export function youthIntake(gs: GameState, c: Club, rng: Rng) {
  const L = RAW_LEAGUES.find(l => l.id === c.country)!;
  const n = rng.int(3, 5);
  const names: string[] = [];
  for (let i = 0; i < n; i++) {
    const pos = rng.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST'] as const);
    const base = 44 + c.staff.youth * 2.5 + c.reputation / 12 + rng.gauss(0, 4);
    const pot = Math.min(94, Math.round(base + 12 + c.staff.youth * 2 + Math.abs(rng.gauss(0, 7)) + (rng.chance(0.04) ? 10 : 0)));
    const p = makePlayer(gs, rng, { name: genName(L.nat, rng), pos, born: gs.season - rng.int(16, 17), nat: L.nat, ovr: Math.round(base), pot, clubId: c.id, rep: 40, generated: true, youth: true });
    p.wage = 1000; p.contractEnd = gs.season + 3;
    names.push(`${p.name} (${pos}, pot. ${p.pot > 80 ? 'alto' : p.pot > 72 ? 'medio' : 'bajo'})`);
  }
  if (c.id === gs.manager.clubId) {
    news(gs, 'youth', 'Nueva hornada de la cantera', `Se incorporan al juvenil: ${names.join(', ')}.`);
    const gem = Object.values(gs.players).filter(p => p.clubId === c.id && p.youth && p.born >= gs.season - 17).sort((a, b) => b.pot - a.pot)[0];
    if (gem && gem.pot >= 82) news(gs, 'youth', `¡Joya en la cantera: ${gem.name}!`, `Tu director de cantera está entusiasmado con ${gem.name} (${gem.pos}, ${gs.season - gem.born} años). Cree que puede llegar a la élite. Dale minutos en el filial o en una cesión.`);
  }
}

// ---------------- season end ----------------
export function endSeason(gs: GameState): string[] {
  const rng = rngFor(gs, 'end');
  const summary: string[] = [];
  const u = gs.manager.clubId;
  const prevEuro: string[] = [], prevEuro2: string[] = [];
  const order: Record<string, string[]> = {}; // final standings per league, best first
  for (const L of Object.values(gs.leagues)) {
    const rows = table(gs, L.id);
    const champ = rows[0].id;
    gs.trophies.push({ season: gs.season, comp: L.name, club: champ });
    summary.push(`${L.name}: campeón ${gs.clubs[champ].name}`);
    const st = new Map(L.clubIds.map(id => [id, strengthOf(gs, id)] as const));
    const expMap = new Map(L.clubIds.slice().sort((a, b) => st.get(b)! - st.get(a)!).map((id, k) => [id, k + 1] as const));
    rows.forEach((r, i) => {
      const c = gs.clubs[r.id];
      const prize = (L.tier === 1 ? (TV_WEEKLY[L.country] / 1e6) * 20_000_000 : L.tier === 2 ? 3_000_000 : 600_000) * (1 - i / rows.length) * 0.5;
      money(gs, c.id, Math.round(prize), `Premio clasificación (${i + 1}º)`);
      const exp = expMap.get(c.id) ?? i + 1;
      c.reputation = clamp(c.reputation + (exp - (i + 1)) * 0.35 + (i === 0 ? 2 : 0) + (L.tier === 2 ? -0.3 : L.tier === 3 ? -0.5 : 0), 30, 99);
    });
    order[L.id] = rows.map(r => r.id);
    if (L.tier === 1) { prevEuro.push(...rows.slice(0, L.euroSpots).map(r => r.id)); prevEuro2.push(...rows.slice(L.euroSpots, L.euroSpots * 2).map(r => r.id)); }
    if (L.clubIds.includes(u)) {
      const pos = rows.findIndex(r => r.id === u) + 1; const exp = expectedPos(gs, u);
      const trophies = gs.trophies.filter(t => t.season === gs.season && t.club === u).map(t => t.comp);
      gs.manager.history.push({ season: gs.season, club: gs.clubs[u].name, pos, league: L.name, trophies });
      const o = gs.objectives;
      const cupOk = o ? cupReached(gs) >= o.cup : true, finOk = o ? gs.clubs[u].balance >= o.minBalance : true;
      const delta = (exp - pos) * 4 + trophies.length * 10 + (o ? (cupOk ? 5 : -5) + (finOk ? 3 : -6) : 0);
      { const sb = sponsorBonus(gs, gs.clubs[u], pos, L.euroSpots, L.tier > 1 && pos <= L.promote); if (sb) summary.push(sb); }
      if (o) summary.push(`Objetivos: copa ${cupOk ? 'cumplido' : 'no cumplido'} (${CUP_TARGET_LABEL[o.cup]}); finanzas ${finOk ? 'cumplido' : 'no cumplido'}.`);
      gs.manager.board = clamp(55 + delta + (gs.manager.board - 50) * 0.3, 5, 100);
      gs.manager.reputation = clamp(gs.manager.reputation + delta * 0.3, 1, 100);
      summary.unshift(`Tu equipo terminó ${pos}º en ${L.name} (objetivo: ${exp}º).`);
      if (pos === 1) news(gs, 'board', `¡CAMPEONES DE LIGA!`, `${gs.clubs[u].name} gana ${L.name} ${seasonLabel(gs.season)}.`);
    }
  }
  // promotion / relegation between each pair of adjacent tiers (lower tiers may be split in groups)
  const countries = [...new Set(Object.values(gs.leagues).map(l => l.country))];
  for (const country of countries) {
    const ls = Object.values(gs.leagues).filter(l => l.country === country);
    const maxTier = Math.max(...ls.map(l => l.tier));
    const moves: { up: string[]; down: string[]; upper: League; lowers: League[] }[] = [];
    for (let t = 1; t < maxTier; t++) {
      const upper = ls.find(l => l.tier === t)!; const lowers = ls.filter(l => l.tier === t + 1);
      const down = upper.relegate ? order[upper.id].slice(-upper.relegate) : [];
      const blocked = (id: string) => { const par = gs.clubs[id].parentId; return !!par && !!gs.clubs[par] && gs.leagues[gs.clubs[par].leagueId].tier >= t; }; // a B team may not join its first team's tier or go above it
      const up = lowers.flatMap(l => order[l.id].filter(id => !blocked(id)).slice(0, l.promote));
      for (const l of lowers) for (const id of order[l.id].slice(0, l.promote)) if (blocked(id)) summary.push(`${gs.clubs[id].name} no puede ascender: su primer equipo ya juega en ${upper.name}.`);
      moves.push({ up, down, upper, lowers });
    }
    for (const { up, down, upper, lowers } of moves) {
      for (const id of down) {
        upper.clubIds = upper.clubIds.filter(x => x !== id);
        const dest = lowers.slice().sort((a, b) => a.clubIds.length - b.clubIds.length)[0]; // keep groups balanced
        dest.clubIds.push(id); gs.clubs[id].leagueId = dest.id;
      }
      const baseline = upper.clubIds.map(id => strengthOf(gs, id)).sort((a, b) => a - b);
      const target = baseline[2] ?? 71;
      for (const id of up) {
        const from = gs.leagues[gs.clubs[id].leagueId];
        from.clubIds = from.clubIds.filter(x => x !== id); upper.clubIds.push(id); gs.clubs[id].leagueId = upper.id;
        strengthenPromoted(gs, gs.clubs[id], rng, target);
      }
      if (down.includes(u)) summary.unshift('Tu equipo ha DESCENDIDO.');
      if (up.includes(u)) summary.unshift('¡Tu equipo ha conseguido el ASCENSO!');
      if (up.length || down.length) summary.push(`${upper.name}: ascienden ${up.map(i => gs.clubs[i].name).join(', ') || '—'}; descienden ${down.map(i => gs.clubs[i].name).join(', ') || '—'}`);
    }
  }
  // players: history, retirements, contracts
  const nextSeason = gs.season + 1;
  const reserveLeavers: string[] = [];
  for (const id in gs.players) {
    const p = gs.players[id];
    if (p.stats.apps && p.clubId) p.history.push({ season: gs.season, club: gs.clubs[p.clubId].short, apps: p.stats.apps, goals: p.stats.goals, rating: Math.round(p.stats.ratingSum / p.stats.apps * 100) / 100 });
    p.stats = emptyStats(); p.yellows = 0; p.susp = 0;
    const a = nextSeason - p.born;
    const o = ovr(p);
    if (a >= 35 && (rng.chance(0.5 + (a - 35) * 0.25) || o < 70) || (!p.clubId && a >= 33 && rng.chance(0.5))) {
      if (p.clubId === u) summary.push(`${p.name} se retira del fútbol.`);
      delete gs.players[id]; continue;
    }
    if (a >= 31) { p.attrs.pac = Math.max(20, p.attrs.pac - rng.int(1, 3)); p.attrs.sta = Math.max(20, p.attrs.sta - rng.int(0, 2)); }
    if (p.loanFrom) {
      if (p.loanFrom === u && p.clubId) { const h = p.history[p.history.length - 1]; summary.push(`${p.name} vuelve de su cesión en el ${gs.clubs[p.clubId].name}: ${h?.season === gs.season ? `${h.apps} partidos, ${h.goals} goles, nota ${h.rating.toFixed(2)}` : 'apenas ha jugado'} · media ${p.startOvr ?? '?'} → ${o}.`); }
      p.clubId = p.loanFrom; p.loanFrom = undefined;
    }
    if (p.youth && a >= 19) {
      p.youth = false;
      const res = p.clubId ? Object.values(gs.clubs).find(c => c.parentId === p.clubId) : undefined;
      if (res && p.clubId && o < strengthOf(gs, p.clubId) - 8) { if (p.clubId === u) summary.push(`${p.name} termina su etapa juvenil y pasa al ${res.name}.`); p.clubId = res.id; }
      else if (p.clubId === u) summary.push(`${p.name} sube al primer equipo por edad.`);
    }
    // reserve teams stay young: over-age players step up to the first team or leave
    if (p.clubId && gs.clubs[p.clubId]?.parentId && a > 23) {
      const par = gs.clubs[p.clubId].parentId!;
      if (o >= strengthOf(gs, par) - 6) { p.clubId = par; if (par === u) summary.push(`${p.name} da el salto del filial al primer equipo.`); }
      else { if (par === u) reserveLeavers.push(p.name); p.clubId = null; p.listed = false; continue; }
    }
    if (p.clubId && p.contractEnd <= gs.season + 1 && !p.youth) {
      const c = gs.clubs[p.clubId];
      if (c.id === u) { summary.push(`${p.name} termina contrato y se marcha libre.`); p.clubId = null; p.listed = false; continue; }
      const avg = strengthOf(gs, c.id);
      if (o >= avg - 7 && a < 33 && rng.chance(0.75)) { p.contractEnd = nextSeason + rng.int(1, 3); p.wage = fairWage(p, nextSeason, c.reputation); }
      else { p.clubId = null; p.listed = false; }
    }
  }
  if (reserveLeavers.length) summary.push(`Superan la edad del filial y quedan libres: ${reserveLeavers.join(', ')}.`);
  // budgets, sponsors, squads
  for (const c of Object.values(gs.clubs)) {
    const base = Math.pow(c.reputation / 10, 3) * 120_000;
    c.transferBudget = Math.max(500_000, Math.round((base + Math.max(0, c.balance) * 0.35) / 100_000) * 100_000);
    if (c.sponsor.until <= nextSeason) c.sponsor = { name: rng.pick(SPONSORS), weekly: Math.round(Math.pow(c.reputation / 10, 3.2) * 120 / 1000) * 1000, until: nextSeason + 2 };
    if (c.id !== u) youthAI(gs, c, rng);
  }
  lifeSeasonEnd(gs);
  gs.season = nextSeason; gs.day = 0;
  for (const p of Object.values(gs.players)) p.startOvr = ovr(p);
  for (const c of Object.values(gs.clubs)) { fillSquad(gs, c, rng); assignNumbers(gs, c.id); }
  const uc = gs.clubs[u];
  uc.cohesion = Math.max(50, uc.cohesion - 10);
  scheduleSeason(gs, rngFor(gs, 'sched'), prevEuro.length === 32 ? prevEuro : initialEuroTeams(gs), prevEuro2.length === 32 ? prevEuro2 : initialEuroTeams(gs, true));
  youthIntake(gs, uc, rng);
  setObjectives(gs);
  // free agents refill
  const fa = Object.values(gs.players).filter(p => !p.clubId).length;
  for (let i = fa; i < 60; i++) makePlayer(gs, rng, { name: genName(rng.pick(['ESP', 'ENG', 'ITA', 'GER', 'FRA']), rng), pos: rng.pick(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']), born: gs.season - rng.int(19, 32), nat: rng.pick(['ESP', 'ENG', 'ITA', 'GER', 'FRA', ...FOREIGN_NATS]), ovr: rng.int(55, 70), pot: rng.int(60, 74), clubId: null, rep: 60, generated: true });
  gs.manager.board = Math.max(gs.manager.board, 40);
  news(gs, 'board', `Temporada ${seasonLabel(gs.season)}`, `Nuevo objetivo: ${expectationLabel(gs, u)}. Presupuesto de fichajes: ${fmtMoney(uc.transferBudget)}.`);
  gs.seasonSummary = summary;
  return summary;
}

function youthAI(gs: GameState, c: Club, rng: Rng) {
  const L = RAW_LEAGUES.find(l => l.id === c.country)!;
  for (let i = 0; i < 2; i++) {
    const pos = rng.pick(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] as const);
    const base = 46 + c.reputation / 8 + rng.gauss(0, 4);
    const res = Object.values(gs.clubs).find(x => x.parentId === c.id);
    makePlayer(gs, rng, { name: genName(L.nat, rng), pos, born: gs.season + 1 - rng.int(17, 18), nat: L.nat, ovr: Math.round(base), pot: Math.round(base + 10 + Math.abs(rng.gauss(0, 7))), clubId: res ? res.id : c.id, rep: c.reputation, generated: true });
  }
}

function fillSquad(gs: GameState, c: Club, rng: Rng) {
  if (c.id === gs.manager.clubId) return;
  const ps = clubPlayers(gs, c.id);
  const need: [string, number][] = [['GK', 2], ['CB', 4], ['LB', 2], ['RB', 2], ['DM', 1], ['CM', 3], ['AM', 1], ['LW', 1], ['RW', 1], ['ST', 2]];
  const level = strengthOf(gs, c.id) - 3;
  for (const [pos, n] of need) {
    let have = ps.filter(p => p.pos === pos).length;
    while (have < n) {
      // try free agents first
      const young = !!c.parentId;
      const fa = Object.values(gs.players).filter(p => !p.clubId && p.pos === pos && (!young || gs.season - p.born <= 21)).sort((a, b) => ovr(b) - ovr(a))[0];
      if (fa && ovr(fa) >= level - 8) { fa.clubId = c.id; fa.contractEnd = gs.season + 2; fa.wage = fairWage(fa, gs.season, c.reputation); }
      else makePlayer(gs, rng, { name: genName(RAW_LEAGUES.find(l => l.id === c.country)!.nat, rng), pos: pos as Player['pos'], born: gs.season - (young ? rng.int(18, 21) : rng.int(20, 29)), nat: RAW_LEAGUES.find(l => l.id === c.country)!.nat, ovr: Math.round(level + rng.gauss(0, 2)), pot: Math.round(level + (young ? rng.int(5, 14) : 4)), clubId: c.id, rep: c.reputation, generated: true });
      have++;
    }
  }
  // trim
  const all = clubPlayers(gs, c.id).sort((a, b) => ovr(b) - ovr(a));
  for (const p of all.filter(x => !x.loanFrom).slice(30)) { p.clubId = null; }
}

function strengthenPromoted(gs: GameState, c: Club, rng: Rng, target: number) {
  // promoted clubs sign a few better players so they can compete
  const L = RAW_LEAGUES.find(l => l.id === c.country)!;
  const ps = clubPlayers(gs, c.id).sort((a, b) => ovr(a) - ovr(b));
  for (const p of ps.filter(x => !x.loanFrom).slice(0, 6)) p.clubId = null;
  for (const pos of ['CB', 'CM', 'ST', 'LW', 'GK', 'RB'] as const) makePlayer(gs, rng, { name: genName(L.nat, rng), pos, born: gs.season - rng.int(23, 30), nat: L.nat, ovr: Math.round(target + rng.gauss(0, 2)), pot: Math.round(target + 2), clubId: c.id, rep: c.reputation, generated: true });
  for (const p of clubPlayers(gs, c.id)) { const d = Math.max(0, target - 3 - ovr(p) + rng.int(-2, 2)); if (d > 0) for (const k of ATTR_KEYS) p.attrs[k] = Math.min(99, p.attrs[k] + d); }
  c.reputation = Math.max(c.reputation, 62);
}

export { marketValue, EURO_GROUP_DAYS };
