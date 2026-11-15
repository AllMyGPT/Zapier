import type { GameState, Player, Role, TransferOffer } from './types';
import { Rng } from './rng';
import { age, fairWage, marketValue, ovr, roundMoney } from './player';
import { clubPlayers } from './lineup';
import { inWindow } from './calendar';
import { fmtMoney, money, news, strengthOf } from './season';

export function askingPrice(gs: GameState, p: Player): number {
  const v = marketValue(p, gs.season);
  if (!p.clubId) return 0;
  if (p.listed) return roundMoney(v * 0.85);
  const ranks = clubPlayers(gs, p.clubId).map(ovr).sort((a, b) => b - a);
  const idx = ranks.indexOf(ovr(p));
  return roundMoney(v * (idx < 3 ? 1.6 : idx < 11 ? 1.3 : 1.05));
}

export type BidResult = { ok: true; msg: string } | { ok: false; msg: string; counter?: number };

export function makeBid(gs: GameState, pid: number, fee: number): BidResult {
  const p = gs.players[pid]; const me = gs.clubs[gs.manager.clubId];
  if (!p) return { ok: false, msg: 'Jugador no encontrado.' };
  if (p.clubId === me.id) return { ok: false, msg: 'Ya es jugador de tu club.' };
  if (p.clubId && !inWindow(gs.day)) return { ok: false, msg: 'El mercado está cerrado. Solo puedes fichar jugadores libres.' };
  if (fee > me.transferBudget) return { ok: false, msg: `No tienes presupuesto suficiente (disponible ${fmtMoney(me.transferBudget)}).` };
  if (!p.clubId) { gs.offers.push({ id: gs.nextId++, playerId: pid, fromClub: me.id, toClub: '', fee: 0, status: 'contract', date: gs.day, incoming: false }); return { ok: true, msg: `${p.name} está libre. Negocia su contrato.` }; }
  const ask = askingPrice(gs, p);
  const seller = gs.clubs[p.clubId];
  const existing = gs.offers.find(o => o.playerId === pid && !o.incoming && (o.status === 'pending' || o.status === 'countered' || o.status === 'rejected') && o.date === gs.day);
  if (existing && existing.status === 'rejected') return { ok: false, msg: `${seller.name} no quiere volver a negociar hoy.` };
  const o: TransferOffer = { id: gs.nextId++, playerId: pid, fromClub: me.id, toClub: seller.id, fee, status: 'pending', date: gs.day, incoming: false };
  gs.offers.push(o);
  if (fee >= ask) { o.status = 'contract'; return { ok: true, msg: `${seller.name} acepta ${fmtMoney(fee)}. Ahora negocia el contrato con ${p.name}.` }; }
  if (fee >= ask * 0.8) { o.status = 'countered'; o.counter = roundMoney(ask); return { ok: false, msg: `${seller.name} rechaza la oferta pero pediría ${fmtMoney(o.counter)}.`, counter: o.counter }; }
  o.status = 'rejected';
  return { ok: false, msg: `${seller.name} rechaza la oferta de plano. Consideran que vale bastante más.` };
}

export function wageDemand(gs: GameState, p: Player): number {
  const me = gs.clubs[gs.manager.clubId];
  const fw = fairWage(p, gs.season, me.reputation);
  const repGap = (ovr(p) - me.reputation) / 100;
  return roundMoney(Math.max(fw, p.clubId ? p.wage * 1.1 : 0) * (1 + Math.max(0, repGap)));
}

export function willingToJoin(gs: GameState, p: Player): boolean {
  const me = gs.clubs[gs.manager.clubId];
  if (!p.clubId) return true;
  const from = gs.clubs[p.clubId];
  return me.reputation + 12 >= from.reputation || me.reputation >= ovr(p) - 4;
}

export const ROLE_LABEL: Record<Role, string> = { estrella: 'Estrella', titular: 'Titular', rotacion: 'Rotación', promesa: 'Promesa', suplente: 'Suplente' };
const ROLE_RANK: Record<Role, number> = { estrella: 4, titular: 3, rotacion: 2, promesa: 1, suplente: 0 };
/** The role a player expects at your club, from where he would rank in your squad. */
export function expectedRole(gs: GameState, p: Player): Role {
  const me = gs.manager.clubId;
  const ranks = clubPlayers(gs, me).filter(x => x.id !== p.id).map(ovr).sort((a, b) => b - a);
  const better = ranks.filter(r => r > ovr(p)).length;
  if (better <= 1 && ovr(p) >= 80) return 'estrella';
  if (better <= 10) return 'titular';
  if (age(p, gs.season) <= 21) return 'promesa';
  return better <= 17 ? 'rotacion' : 'suplente';
}
export interface ContractTerms { role?: Role; bonus?: number; clause?: number }

export function offerContract(gs: GameState, pid: number, wage: number, years: number, terms: ContractTerms = {}): { ok: boolean; msg: string } {
  const p = gs.players[pid]; const me = gs.clubs[gs.manager.clubId];
  const deal = gs.offers.find(o => o.playerId === pid && !o.incoming && o.status === 'contract');
  const renewing = p.clubId === me.id;
  if (!deal && !renewing) return { ok: false, msg: 'No hay un acuerdo de traspaso en curso.' };
  if (!renewing && !willingToJoin(gs, p)) { if (deal) deal.status = 'rejected'; return { ok: false, msg: `${p.name} no quiere fichar por un club de menor nivel.` }; }
  // role, signing bonus and release clause all move what he asks for
  const exp = expectedRole(gs, p); const role = terms.role ?? exp;
  const roleGap = ROLE_RANK[role] - ROLE_RANK[exp];
  if (roleGap <= -2 && ovr(p) >= 70) return { ok: false, msg: `${p.name} no acepta ser ${ROLE_LABEL[role].toLowerCase()}: espera un rol de ${ROLE_LABEL[exp].toLowerCase()}.` };
  const mv = marketValue(p, gs.season);
  const clauseF = !terms.clause ? 1.03 : terms.clause < mv * 1.5 ? 0.96 : terms.clause > mv * 4 ? 1.04 : 1;
  const bonusPerWeek = (terms.bonus ?? 0) / (52 * years) * 0.8;
  const demand = Math.max(0, wageDemand(gs, p) * (renewing ? 0.95 : 1) * (roleGap > 0 ? 0.94 : roleGap < 0 ? 1.15 : 1) * clauseF - bonusPerWeek);
  if (terms.bonus && terms.bonus > Math.max(0, me.balance)) return { ok: false, msg: 'El club no tiene saldo para pagar esa prima de fichaje.' };
  const a = age(p, gs.season);
  const yearsOk = a >= 31 ? years <= 2 || wage >= demand * 1.1 : true;
  if (wage < demand * 0.93 || !yearsOk) return { ok: false, msg: `${p.name} rechaza la propuesta. Pide unos ${fmtMoney(demand)}/semana${a >= 31 ? ' y como mucho 2 años, salvo mejora salarial' : ''}.` };
  const projected = clubPlayers(gs, me.id, true).reduce((s, x) => s + x.wage, 0) + wage - (renewing ? p.wage : 0);
  if (projected * 52 > Math.max(me.balance, 0) * 0.6 + me.reputation * 2_500_000 && wage > p.wage) return { ok: false, msg: 'La directiva no aprueba ese salario: la masa salarial sería insostenible.' };
  const applyTerms = () => {
    p.role = role; p.releaseClause = terms.clause || undefined;
    if (terms.bonus) money(gs, me.id, -terms.bonus, `Prima de fichaje de ${p.name}`);
  };
  if (renewing) {
    applyTerms();
    p.wage = wage; p.contractEnd = gs.season + years; p.morale = Math.min(100, p.morale + 8 + Math.max(0, roleGap) * 3);
    return { ok: true, msg: `${p.name} renueva hasta junio de ${gs.season + years}.` };
  }
  if (deal!.fee > me.transferBudget) return { ok: false, msg: 'Presupuesto insuficiente.' };
  const from = p.clubId;
  if (from) {
    me.transferBudget -= deal!.fee;
    money(gs, me.id, -deal!.fee, `Fichaje de ${p.name}`);
    money(gs, me.id, -Math.round(deal!.fee * 0.05), `Comisión del agente de ${p.name}`);
    money(gs, from, deal!.fee, `Venta de ${p.name}`);
    gs.clubs[from].transferBudget += Math.round(deal!.fee * 0.6);
    const fc = gs.clubs[from]; fc.lineup = fc.lineup.filter(x => x !== pid); fc.bench = fc.bench.filter(x => x !== pid);
  }
  p.clubId = me.id; p.wage = wage; p.contractEnd = gs.season + years; p.listed = false; p.morale = 80 + Math.max(0, roleGap) * 4; p.num = 0;
  applyTerms();
  const used = new Set(clubPlayers(gs, me.id).map(x => x.num));
  p.num = [p.pos === 'GK' ? 13 : 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 33, 34].find(n => !used.has(n)) ?? 40;
  me.bench = [...me.bench, pid].slice(-9);
  deal!.status = 'done';
  gs.shortlist = gs.shortlist.filter(x => x !== pid);
  news(gs, 'transfer', `Fichaje cerrado: ${p.name}`, `${p.name} firma por ${years} temporadas${from ? ` procedente del ${gs.clubs[from].name} por ${fmtMoney(deal!.fee)}` : ' como agente libre'}.`);
  return { ok: true, msg: `¡${p.name} es nuevo jugador del ${me.name}!` };
}

export function acceptIncoming(gs: GameState, offerId: number): string {
  const o = gs.offers.find(x => x.id === offerId); if (!o || o.status !== 'pending') return 'Oferta no disponible';
  const p = gs.players[o.playerId]; const me = gs.clubs[gs.manager.clubId]; const buyer = gs.clubs[o.fromClub];
  if (p.clubId !== me.id) { o.status = 'rejected'; return 'El jugador ya no está en tu club.'; }
  transferPlayer(gs, p, buyer.id, o.fee);
  me.transferBudget += Math.round(o.fee * 0.8);
  o.status = 'done';
  news(gs, 'transfer', `Venta: ${p.name}`, `${p.name} se marcha al ${buyer.name} por ${fmtMoney(o.fee)}. El 80% se suma al presupuesto de fichajes.`);
  return `${p.name} vendido por ${fmtMoney(o.fee)}.`;
}
export function rejectIncoming(gs: GameState, offerId: number) { const o = gs.offers.find(x => x.id === offerId); if (o) o.status = 'rejected'; }

export function transferPlayer(gs: GameState, p: Player, toClub: string, fee: number) {
  const from = p.clubId;
  if (from) { money(gs, from, fee, `Venta de ${p.name}`); const fc = gs.clubs[from]; fc.lineup = fc.lineup.map(x => x === p.id ? -1 : x); fc.bench = fc.bench.filter(x => x !== p.id); }
  money(gs, toClub, -fee, `Fichaje de ${p.name}`);
  const to = gs.clubs[toClub];
  to.transferBudget = Math.max(0, to.transferBudget - fee);
  p.clubId = toClub; p.listed = false; p.contractEnd = gs.season + 2 + (age(p, gs.season) < 28 ? 2 : 0); p.wage = fairWage(p, gs.season, to.reputation); p.num = 0;
  const used = new Set(clubPlayers(gs, toClub).filter(x => x.id !== p.id).map(x => x.num));
  p.num = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28].find(n => !used.has(n)) ?? 40;
}

export function releasePlayer(gs: GameState, pid: number): string {
  const p = gs.players[pid]; const me = gs.clubs[gs.manager.clubId];
  const years = Math.max(0, p.contractEnd - gs.season);
  const comp = Math.round(p.wage * 52 * Math.max(0.5, years) * 0.5);
  money(gs, me.id, -comp, `Rescisión de ${p.name}`);
  p.clubId = null; p.listed = false; p.youth = false;
  me.lineup = me.lineup.map(x => x === pid ? -1 : x); me.bench = me.bench.filter(x => x !== pid);
  return `${p.name} queda libre. Indemnización: ${fmtMoney(comp)}.`;
}

/** AI-to-AI market activity, weekly while the window is open */
export function aiTransfers(gs: GameState, rng: Rng) {
  const clubs = Object.values(gs.clubs).filter(c => c.id !== gs.manager.clubId);
  const pool = Object.values(gs.players).filter(p => !p.youth && !p.loanFrom && (p.clubId === null || p.clubId !== gs.manager.clubId));
  let deals = 0;
  for (const c of rng.shuffle(clubs.slice())) {
    if (deals > 12) break;
    if (!rng.chance(0.12)) continue;
    const squad = clubPlayers(gs, c.id);
    const lvl = strengthOf(gs, c.id);
    const counts: Record<string, number> = {};
    squad.forEach(p => counts[p.pos] = (counts[p.pos] ?? 0) + 1);
    const pos = (['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] as const).slice().sort((a, b) => (counts[a] ?? 0) - (counts[b] ?? 0) + rng.range(-1.5, 1.5))[0];
    const cands = pool.filter(p => p.pos === pos && p.clubId !== c.id && ovr(p) >= lvl - 1 && ovr(p) <= lvl + 6 && age(p, gs.season) <= 31 && (!p.clubId || gs.clubs[p.clubId].reputation <= c.reputation + 3));
    if (!cands.length) continue;
    const t = rng.pick(cands);
    const fee = t.clubId ? askingPrice(gs, t) : 0;
    if (fee > c.transferBudget) continue;
    const fromName = t.clubId ? gs.clubs[t.clubId].name : null;
    transferPlayer(gs, t, c.id, fee);
    deals++;
    if (squad.length > 27) { const worst = squad.filter(p => !p.loanFrom).sort((a, b) => ovr(a) - ovr(b))[0]; if (worst) worst.clubId = null; }
    if (ovr(t) >= 80) news(gs, 'info', `Bombazo: ${t.name} al ${c.name}`, `${t.name} ficha por el ${c.name}${fromName ? ` procedente del ${fromName} por ${fmtMoney(fee)}` : ' como agente libre'}.`);
  }
}

/** AI clubs bid for user's players */
export function incomingOffers(gs: GameState, rng: Rng) {
  const me = gs.clubs[gs.manager.clubId];
  const mine = clubPlayers(gs, me.id);
  if (gs.offers.some(o => o.incoming && o.status === 'pending')) return;
  // release clauses: a richer club can pay it and the player leaves straight away
  for (const p of mine) {
    if (!p.releaseClause || !rng.chance(0.03)) continue;
    const mv = marketValue(p, gs.season);
    if (p.releaseClause > mv * 1.6) continue;
    const buyers = Object.values(gs.clubs).filter(c => c.id !== me.id && !c.parentId && c.reputation > me.reputation && c.transferBudget >= p.releaseClause! && strengthOf(gs, c.id) <= ovr(p) + 6);
    if (!buyers.length) continue;
    const b = rng.pick(buyers);
    const fee = p.releaseClause;
    transferPlayer(gs, p, b.id, fee); p.releaseClause = undefined; p.role = undefined;
    me.transferBudget += Math.round(fee * 0.8);
    news(gs, 'transfer', `¡El ${b.name} paga la cláusula de ${p.name}!`, `Deposita ${fmtMoney(fee)} y se lo lleva sin negociar. El 80% pasa a tu presupuesto de fichajes.`);
    return;
  }
  for (const p of rng.shuffle(mine.slice())) {
    const prob = p.listed ? 0.35 : 0.04;
    if (!rng.chance(prob)) continue;
    const o = ovr(p);
    const buyers = Object.values(gs.clubs).filter(c => c.id !== me.id && strengthOf(gs, c.id) <= o + 4 && strengthOf(gs, c.id) >= o - 8 && c.transferBudget > marketValue(p, gs.season) * 0.8);
    if (!buyers.length) continue;
    const b = rng.pick(buyers);
    const fee = roundMoney(marketValue(p, gs.season) * rng.range(p.listed ? 0.75 : 0.95, p.listed ? 1.1 : 1.4));
    gs.offers.push({ id: gs.nextId++, playerId: p.id, fromClub: b.id, toClub: me.id, fee, status: 'pending', date: gs.day, incoming: true });
    news(gs, 'transfer', `Oferta por ${p.name}`, `El ${b.name} ofrece ${fmtMoney(fee)} por ${p.name}. Responde en Fichajes → Ofertas recibidas.`);
    return;
  }
}
