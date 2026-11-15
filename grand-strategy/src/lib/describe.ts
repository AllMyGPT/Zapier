import { conditionMet } from '@/engine/core';
import type { Condition, Effect, GameState } from '@/engine/types';

/** Human-readable summaries of effects and conditions, so every choice shows what it costs and gives. */

const nm = (s: GameState, t?: string) => (t ? s.nations[t]?.name ?? t : 'tu reino');
const pv = (s: GameState, ids: string[], max = 4) => {
  const names = ids.map((p) => s.provinces[p]?.name ?? p);
  return names.length > max ? `${names.slice(0, max).join(', ')} y ${names.length - max} más` : names.join(', ');
};
const sign = (v: number) => (v > 0 ? `+${Math.round(v * 10) / 10}` : `${Math.round(v * 10) / 10}`);

const X_LABEL: Record<string, string> = {
  piety: 'piedad', inflation: 'inflación', colonists: 'colonos', ic: 'industria (CI)', dissent: 'disidencia',
  stock_energy: 'energía', stock_metal: 'metal', stock_rare: 'materiales raros', stock_oil: 'petróleo', stock_supplies: 'suministros',
};
const money = (s: GameState) => (s.era === 'earlymodern' ? 'ducados' : s.era === 'ww2' ? 'fondos' : 'oro');

export function describeEffect(s: GameState, tag: string, e: Effect): { text: string; good: boolean | null } | null {
  const who = 'tag' in e && e.tag && e.tag !== tag ? ` (${nm(s, e.tag)})` : '';
  switch (e.type) {
    case 'treasury': return { text: `${sign(e.amount)} ${money(s)}${who}`, good: e.amount > 0 };
    case 'manpower': return { text: `${sign(e.amount).replace(/(\d)(?=(\d{3})+$)/g, '$1.')} ${s.era === 'medieval' ? 'levas' : 'mano de obra'}${who}`, good: e.amount > 0 };
    case 'stability': return { text: `${sign(e.amount)} estabilidad${who}`, good: e.amount > 0 };
    case 'prestige': return { text: `${sign(e.amount)} prestigio${who}`, good: e.amount > 0 };
    case 'infamy': return { text: `${sign(e.amount)} agresividad${who}`, good: e.amount < 0 };
    case 'x': return { text: `${sign(e.amount)} ${X_LABEL[e.key] ?? e.key}${who}`, good: ['inflation', 'dissent'].includes(e.key) ? e.amount < 0 : e.amount > 0 };
    case 'tech': return { text: `${sign(e.amount)} tecnología (${e.key})${who}`, good: e.amount > 0 };
    case 'relations': return { text: `${sign(e.amount)} relaciones con ${nm(s, e.other)}`, good: e.amount > 0 };
    case 'relationsWith': return { text: `${sign(e.amount)} relaciones con ${e.religion ? `los de religión ${e.religion}` : e.culture ? `la cultura ${e.culture}` : 'todos'}`, good: e.amount > 0 };
    case 'cede': return { text: `${nm(s, e.from)} cede ${pv(s, e.provinces)} a ${nm(s, e.to)}`, good: e.to === tag ? true : e.from === tag ? false : null };
    case 'declareWar': return { text: `Guerra contra ${nm(s, e.target)}${e.goal ? ` por ${s.provinces[e.goal]?.name ?? e.goal}` : ''}`, good: null };
    case 'alliance': return { text: `Alianza con ${nm(s, e.other)}`, good: true };
    case 'joinFaction': return { text: `Unirse a ${s.factions[e.faction]?.name ?? e.faction}`, good: null };
    case 'annex': return { text: `Anexionar ${nm(s, e.target)}`, good: true };
    case 'vassalize': return { text: `${nm(s, e.target)} pasa a ser vasallo`, good: true };
    case 'spawnArmy': return { text: `Nuevo ejército en ${s.provinces[e.province]?.name ?? e.province}`, good: true };
    case 'claim': return { text: `Reclamaciones sobre ${pv(s, e.provinces)}`, good: true };
    case 'unrest': return { text: `${sign(e.amount)} malestar en ${s.provinces[e.province]?.name ?? e.province}`, good: e.amount < 0 };
    case 'unrestRealm': return { text: `${sign(e.amount)} malestar en todo el reino`, good: e.amount < 0 };
    case 'government': return { text: `Nuevo gobierno: ${e.value}`, good: null };
    case 'religion': return { text: `Religión ${e.value}${e.nation ? ' (oficial)' : ''} en ${pv(s, e.provinces)}`, good: null };
    case 'trigger': return { text: 'Tendrá consecuencias…', good: null };
    case 'breakAlliance': return { text: `Fin de la alianza con ${nm(s, e.other)}`, good: null };
    case 'release': return { text: `${nm(s, e.target)} deja de ser vasallo`, good: null };
    case 'char': {
      const A = s.characters[e.a], B = e.b ? s.characters[e.b] : null;
      const nmA = A?.name ?? 'alguien';
      if (e.op === 'lovers') return { text: `${nmA} y ${B?.name ?? '…'} se hacen amantes`, good: null };
      if (e.op === 'breakup') return { text: `${nmA} rompe con su amante`, good: null };
      if (e.op === 'legitimize') return { text: `${nmA} es legitimad${A?.female ? 'a' : 'o'}`, good: true };
      if (e.op === 'banish') return { text: `${nmA} es desterrad${A?.female ? 'a' : 'o'} de la corte`, good: null };
      if (e.op === 'kill') return { text: `${nmA} no verá otro amanecer`, good: null };
      if (e.op === 'inLove') return { text: `Nace el amor en el matrimonio (más hijos)`, good: true };
      if (e.op === 'trait') return { text: `${nmA} gana el rasgo «${e.value}»`, good: null };
      return null;
    }
    case 'flag': case 'chronicle': return null;
  }
}

export function describeCondition(s: GameState, tag: string, c: Condition): string {
  switch (c.type) {
    case 'owns': return `Poseer ${s.provinces[c.province]?.name ?? c.province}`;
    case 'notOwns': return `No poseer ${s.provinces[c.province]?.name ?? c.province}`;
    case 'ownsAll': return `Poseer ${pv(s, c.provinces, 5)}`;
    case 'ownsCount': return `Poseer ${c.count} de: ${pv(s, c.provinces, 5)}`;
    case 'minProvinces': return `Tener ${c.value} provincias`;
    case 'minPrestige': return `${c.value} de prestigio`;
    case 'minTreasury': return `${c.value} de ${money(s)}`;
    case 'minX': return `${c.value} de ${X_LABEL[c.key] ?? c.key}`;
    case 'minStability': return `Estabilidad ${c.value > 0 ? '+' : ''}${c.value} o más`;
    case 'maxStability': return `Estabilidad ${c.value} o menos`;
    case 'allied': return `Alianza con ${nm(s, c.other)}`;
    case 'minAllies': return c.value === 1 ? 'Tener un aliado' : `Tener ${c.value} aliados`;
    case 'liegeOf': return `${nm(s, c.other)} como vasallo`;
    case 'notVassal': return 'Ser independiente';
    case 'exists': return `${nm(s, c.tag)} existe`;
    case 'notExists': return `${nm(s, c.tag)} ha desaparecido`;
    case 'atWar': return c.value ? 'Estar en guerra' : 'Estar en paz';
    case 'atWarWith': return `En guerra con ${nm(s, c.other)}`;
    case 'minYear': return `A partir de ${c.value}`;
    case 'maxYear': return `Antes de ${c.value + 1}`;
    case 'warsWon': return c.value === 1 ? 'Ganar una guerra' : `Ganar ${c.value} guerras`;
    case 'religionIs': return `Religión: ${c.value}`;
    case 'missionDone': return `Completar «${s.missions?.find((m) => m.id === c.mission)?.title ?? c.mission}»`;
    case 'flag': return c.value ? 'Haber tomado cierta decisión' : 'No haber tomado cierta decisión';
    case 'isPlayer': return '';
    case 'maxTreasury': return `Como mucho ${c.value} de ${money(s)}`;
    case 'maxPrestige': return `Prestigio de ${c.value} o menos`;
    case 'maxX': return `${X_LABEL[c.key] ?? c.key} de ${c.value} o menos`;
    case 'isVassal': return 'Ser vasallo';
    case 'minWarMonths': return `Una guerra de ${c.value} meses o más`;
    case 'minUnrest': return `Malestar de ${c.value} en alguna provincia`;
    case 'maxProvinces': return `Tener ${c.value} provincias o menos`;
  }
}

export function conditionState(s: GameState, tag: string, c: Condition) {
  return { text: describeCondition(s, tag, c), ok: conditionMet(s, tag, c) };
}
