import type { GameState, Mentality, Player, ScoutMission, ScoutReport, ScoutState, Tactics } from './types';
import { autoPick, callupPlayers, clubPlayers } from './lineup';
import { ovr, age } from './player';
import { fmtMoney, invalidateStrength, money, news, strengthOf } from './season';

/* ============================================================================
   Scouting: send scouts to a country, a league or a club. Each mission takes a
   few weeks and costs money; when it finishes you get a report with the best
   young players found and those leagues or clubs become "known" (exact ratings).
   Also: the tactical report for the next rival.
   ========================================================================== */

export const SCOUT_DAYS = { pais: 35, liga: 21, club: 10 } as const;
export const SCOUT_COST = { pais: 900_000, liga: 250_000, club: 60_000 } as const;
/** Absolute day across seasons, so missions can finish next season. */
const abs = (gs: GameState) => gs.season * 365 + gs.day;

export function scoutOf(gs: GameState): ScoutState {
  if (!gs.scouting) {
    const c = gs.clubs[gs.manager.clubId];
    gs.scouting = { missions: [], known: c ? [`pais:${c.country}`, `liga:${c.leagueId}`] : [], nextId: 1, reports: [] };
  }
  return gs.scouting;
}

/** How many missions can run at once: the scouting department decides. */
export function missionSlots(gs: GameState): number {
  return 1 + Math.floor(gs.clubs[gs.manager.clubId].staff.scout / 2);
}

export function isKnownClub(gs: GameState, clubId: string): boolean {
  const c = gs.clubs[clubId]; const k = scoutOf(gs).known;
  return !!c && (c.id === gs.manager.clubId || k.includes(`club:${c.id}`) || k.includes(`liga:${c.leagueId}`) || k.includes(`pais:${c.country}`));
}
/** Exact potential is visible for players of known clubs; the rest is a guess. */
export function isKnownPlayer(gs: GameState, p: Player): boolean {
  return !!p.clubId && isKnownClub(gs, p.clubId);
}

/** Who a mission covers: a country, a league or a club. */
export function missionScope(gs: GameState, target: string): { clubs: string[]; label: string } {
  const [kind, id] = target.split(':') as ['pais' | 'liga' | 'club', string];
  if (kind === 'pais') {
    const L = Object.values(gs.leagues).filter(l => l.country === id);
    return { clubs: L.flatMap(l => l.clubIds), label: `Ojeo de ${L[0]?.countryName ?? id}` };
  }
  if (kind === 'liga') { const L = gs.leagues[id]; return { clubs: L ? L.clubIds : [], label: `Ojeo de ${L?.name ?? id}` }; }
  const c = gs.clubs[id]; return { clubs: c ? [c.id] : [], label: `Ojeo del ${c?.name ?? id}` };
}

export function startMission(gs: GameState, kind: 'pais' | 'liga' | 'club', id: string): string {
  const s = scoutOf(gs); const me = gs.clubs[gs.manager.clubId];
  const target = `${kind}:${id}`;
  if (s.missions.some(m => m.target === target)) return 'Ya hay un ojeador trabajando en eso.';
  if (isKnownClub(gs, id) && kind === 'club') return 'Ya conoces a fondo a ese club.';
  if (s.missions.length >= missionSlots(gs)) return `Tus ojeadores están ocupados (${missionSlots(gs)} misión/es a la vez). Mejora el departamento de ojeo para enviar más.`;
  const cost = SCOUT_COST[kind];
  if (me.balance < cost) return `Necesitas ${fmtMoney(cost)} en caja para enviar ojeadores.`;
  const scope = missionScope(gs, target);
  if (!scope.clubs.length) return 'No encuentro nada que ojear ahí.';
  money(gs, me.id, -cost, `Gastos de ojeo: ${scope.label}`);
  const start = abs(gs);
  s.missions.push({ id: s.nextId++, target, label: scope.label, start, end: start + SCOUT_DAYS[kind], cost });
  return `${scope.label}: los ojeadores parten hoy. Informe en unas ${Math.round(SCOUT_DAYS[kind] / 7)} semanas.`;
}

/** Days left for a mission (0 when it is due). */
export function missionDaysLeft(gs: GameState, m: ScoutMission) { return Math.max(0, m.end - abs(gs)); }

/** Called every game day: finished missions reveal their players and become known. */
export function tickScouting(gs: GameState) {
  const s = gs.scouting; if (!s || !s.missions.length) return;
  const due = s.missions.filter(m => abs(gs) >= m.end);
  if (!due.length) return;
  s.missions = s.missions.filter(m => !due.includes(m));
  for (const m of due) completeMission(gs, m);
}

function completeMission(gs: GameState, m: ScoutMission) {
  const s = scoutOf(gs);
  const [kind, id] = m.target.split(':');
  s.known.push(m.target);
  const scope = missionScope(gs, m.target);
  const staff = gs.clubs[gs.manager.clubId].staff.scout;
  const pool = Object.values(gs.players)
    .filter(p => p.clubId && scope.clubs.includes(p.clubId) && p.clubId !== gs.manager.clubId)
    .sort((a, b) => b.pot - a.pot || ovr(b) - ovr(a));
  const top = pool.slice(0, kind === 'club' ? 5 + staff : 6 + staff * 2).map(p => p.id);
  const rep: ScoutReport = { id: s.nextId++, day: gs.day, season: gs.season, title: m.label, pids: top };
  s.reports.unshift(rep);
  if (s.reports.length > 20) s.reports.length = 20;
  void id;
  news(gs, 'info', `Informe de ojeador: ${m.label}`, `${top.length} jugadores destacados. Ya conoces mejor esa zona; revisa la sección Ojeador.`);
}

export interface TacticalAdvice { formation: string; mentality: Mentality; pressing: 1 | 2 | 3; width: 1 | 2 | 3; passing: Tactics['passing']; notes: string[] }

/** Recommended setup against the next rival: formation by how they line up, intensity by the strength gap. */
export function recommendTactics(gs: GameState, rivalId: string): TacticalAdvice {
  const me = gs.clubs[gs.manager.clubId]; const rival = gs.clubs[rivalId];
  const diff = strengthOf(gs, me.id) - strengthOf(gs, rivalId);
  const rf = rival.tactics.formation;
  const notes: string[] = [];
  let formation = diff >= 0 ? '4-3-3' : '4-4-2';
  if (rf.startsWith('3-') || rf.startsWith('5-')) {
    formation = '4-3-3'; notes.push(`${rival.short} juega con tres atrás: atacad por fuera con extremos y laterales que suban.`);
  } else if (rf === '4-3-3' || rf === '4-2-3-1') {
    formation = '4-4-2 rombo'; notes.push(`${rival.short} ataca por bandas: cerrad los carriles con dos líneas de cuatro y presionad sus extremos.`);
  } else if (rf === '4-1-4-1' || rf === '5-3-2') {
    formation = '4-2-3-1'; notes.push(`${rival.short} se cierra con muchos hombres: busca al mediapunta entre líneas.`);
  } else notes.push(`${rival.short} juega en ${rf}: sistema equilibrado, sin cambios bruscos.`);
  const mentality: Mentality = diff >= 15 ? 2 : diff >= 6 ? 1 : diff <= -15 ? -2 : diff <= -6 ? -1 : 0;
  const pressing: 1 | 2 | 3 = diff >= 5 ? 3 : diff <= -8 ? 1 : 2;
  const width: 1 | 2 | 3 = rf.startsWith('3-') || rf.startsWith('5-') ? 3 : 2;
  const passing: Tactics['passing'] = diff <= -8 ? 'largo' : 'mixto';
  if (diff >= 6) notes.push('Somos superiores: presión alta y mentalidad ofensiva.');
  else if (diff <= -6) notes.push('Son superiores: bloque corto, paciencia y salidas rápidas al espacio.');
  else notes.push('Partido parejo: mentalidad equilibrada.');
  return { formation, mentality, pressing, width, passing, notes };
}

/** Puts the advised setup on the first team: new system, intensity and the best XI for it. */
export function applyTacticalAdvice(gs: GameState, adv: TacticalAdvice): string {
  const me = gs.clubs[gs.manager.clubId];
  const pick = autoPick([...clubPlayers(gs, me.id), ...callupPlayers(gs, me)], adv.formation);
  me.tactics = { ...me.tactics, formation: adv.formation, mentality: adv.mentality, pressing: adv.pressing, width: adv.width, passing: adv.passing };
  me.lineup = pick.lineup; me.bench = pick.bench;
  invalidateStrength();
  return `Táctica aplicada: ${adv.formation}. La alineación se ha recalculado para el sistema.`;
}

/** Players of a report, shown with the same rules as the rest of the game. */
export function reportPlayers(gs: GameState, r: ScoutReport) {
  return r.pids.map(id => gs.players[id]).filter((p): p is Player => !!p && !!p.clubId);
}
export const playerAge = (gs: GameState, p: Player) => age(p, gs.season);
