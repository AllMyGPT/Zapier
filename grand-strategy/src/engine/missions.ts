import { provincesOf } from './core';
import { neighbours } from './map';
import type { GameState, Mission } from './types';

/**
 * Generic mission tree for a nation that has no hand-written one. Built from the starting map:
 * the nearest rival becomes the expansion target, so every realm gets a concrete, reachable story arc.
 */
export function genericMissions(s: GameState, tag: string): Mission[] {
  const n = s.nations[tag];
  if (!n) return [];
  const own = Object.values(s.provinces).filter((p) => p.owner === tag);
  if (!own.length) return [];
  // bordering foreign realms, weighted by shared borders, smaller targets first
  const border: Record<string, Set<string>> = {};
  for (const p of own) for (const e of neighbours(s, p.id)) {
    const q = s.provinces[e.to];
    if (!q?.owner || q.owner === tag || q.owner === 'REB') continue;
    const o = s.nations[q.owner];
    if (!o || o.liege === tag || n.liege === q.owner || n.allies.includes(q.owner)) continue;
    (border[q.owner] ??= new Set()).add(q.id);
  }
  const size = (t: string) => provincesOf(s, t).length;
  const rivals = Object.keys(border).sort((a, b) => border[b].size - border[a].size || size(a) - size(b));
  const rival = rivals[0];
  const rivalProvs = rival ? Object.values(s.provinces).filter((p) => p.owner === rival).map((p) => p.id) : [];
  const front = rival ? [...border[rival]] : [];
  const era = s.era;
  const id = (k: string) => `gen_${tag}_${k}`;
  const out: Mission[] = [];

  // column 0: the state
  if (era === 'ww2') {
    const ic = Math.round((n.x.ic ?? 10) * 1.25);
    out.push({ id: id('mobilize'), tag, col: 0, icon: 'prosperity', title: 'Economía de guerra', text: 'Reconvertir la industria civil para sostener un conflicto largo.',
      conditions: [{ type: 'minX', key: 'ic', value: ic }], rewards: [{ type: 'x', key: 'dissent', amount: -3 }, { type: 'manpower', amount: 20000 }, { type: 'chronicle', text: `${n.name} pone su economía en pie de guerra.` }] });
    out.push({ id: id('supplies'), tag, col: 0, icon: 'prosperity', requires: [id('mobilize')], title: 'Arsenales llenos', text: 'Acumular suministros antes de la gran ofensiva.',
      conditions: [{ type: 'minX', key: 'stock_supplies', value: Math.round((n.x.stock_supplies ?? 500) + 1500) }], rewards: [{ type: 'x', key: 'stock_supplies', amount: 800 }, { type: 'prestige', amount: 25 }] });
  } else {
    out.push({ id: id('crown'), tag, col: 0, icon: 'court', title: era === 'medieval' ? 'Afianzar la corona' : 'Un reino estable', text: era === 'medieval' ? 'Que nadie dude de quién gobierna: gloria y buen nombre para la casa reinante.' : 'Orden en las provincias y confianza en la Corona.',
      conditions: era === 'medieval' ? [{ type: 'minPrestige', value: Math.round(n.prestige + 120) }] : [{ type: 'minStability', value: 2 }],
      rewards: [{ type: 'treasury', amount: 80 }, { type: 'stability', amount: 1 }, { type: 'chronicle', text: `La corona de ${n.name} se asienta con firmeza.` }] });
    out.push({ id: id('treasury'), tag, col: 0, icon: 'prosperity', requires: [id('crown')], title: 'Arcas llenas', text: 'Un tesoro saneado paga ejércitos, templos y voluntades.',
      conditions: [{ type: 'minTreasury', value: era === 'medieval' ? 350 : 500 }], rewards: [{ type: 'prestige', amount: 40 }, { type: 'manpower', amount: era === 'medieval' ? 3000 : 8000 }] });
  }
  // column 1: expansion against the main rival
  if (rival) {
    const rn = s.nations[rival].name;
    out.push({ id: id('border'), tag, col: 1, icon: 'war', title: `La frontera con ${rn}`, text: `Las tierras fronterizas de ${rn} son la llave de nuestra expansión. Tomar al menos una.`,
      conditions: [{ type: 'ownsCount', provinces: front, count: 1 }], rewards: [{ type: 'claim', provinces: rivalProvs }, { type: 'prestige', amount: 40 }, { type: 'chronicle', text: `${n.name} arrebata tierras a ${rn}.` }] });
    out.push({ id: id('subdue'), tag, col: 1, icon: 'war', requires: [id('border')], title: `Someter a ${rn}`, text: `Doblegar a ${rn} hasta controlar la mayor parte de su territorio, o borrarlo del mapa.`,
      conditions: [{ type: 'ownsCount', provinces: rivalProvs, count: Math.max(1, Math.ceil(rivalProvs.length * 0.6)) }], rewards: [{ type: 'prestige', amount: 80 }, { type: 'treasury', amount: 150 }, { type: 'stability', amount: 1 }] });
  }
  out.push({ id: id('power'), tag, col: 1, icon: 'prosperity', requires: rival ? [id('border')] : [], title: era === 'ww2' ? 'Potencia mundial' : 'Gran potencia', text: 'Extender el dominio hasta contar entre los grandes del mundo.',
    conditions: [{ type: 'minProvinces', value: own.length + Math.max(4, Math.round(own.length * 0.5)) }], rewards: [{ type: 'prestige', amount: 120 }, { type: 'chronicle', text: `${n.name} se cuenta ya entre las grandes potencias.` }] });
  // column 2: diplomacy and war
  out.push({ id: id('ally'), tag, col: 2, icon: 'peace', title: 'Amigos poderosos', text: 'Ningún reino sobrevive solo. Sellar al menos una alianza.',
    conditions: [{ type: 'minAllies', value: 1 }], rewards: [{ type: 'prestige', amount: 30 }, { type: 'treasury', amount: 40 }] });
  out.push({ id: id('victory'), tag, col: 2, icon: 'war', requires: [id('ally')], title: 'Victoria en el campo', text: 'Ganar una guerra e imponer la paz al vencido.',
    conditions: [{ type: 'warsWon', value: 1 }], rewards: [{ type: 'prestige', amount: 60 }, { type: 'manpower', amount: era === 'ww2' ? 30000 : 2000 }, { type: 'chronicle', text: `Los cronistas cantan la victoria de ${n.name}.` }] });
  return out;
}
