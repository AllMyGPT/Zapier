import type { Fixture, GameState } from './types';
import { isDerby, news, strengthOf } from './season';

/** Post-match press conference: a question picked from the result, three answers with trade-offs. */
export interface PressAnswer { text: string; board: number; fans: number; morale: number; headline: string }
export interface PressQuestion { journalist: string; q: string; answers: PressAnswer[] }

const JOURNALISTS = ['Radio Deportiva', 'Diario del Fútbol', 'TV Gol', 'La Grada Digital', 'Onda Fútbol'];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function pressQuestion(gs: GameState, f: Fixture): PressQuestion {
  const q = baseQuestion(gs, f);
  if (!isDerby(gs, f.home, f.away)) return q;
  // derbies: the city is watching, so every answer weighs double with the fans
  return { ...q, q: `Derbi. ${q.q}`, answers: q.answers.map(a => ({ ...a, fans: a.fans * 2, headline: `Derbi: ${a.headline.charAt(0).toLowerCase()}${a.headline.slice(1)}` })) };
}

function baseQuestion(gs: GameState, f: Fixture): PressQuestion {
  const me = gs.manager.clubId;
  const home = f.home === me;
  const my = home ? f.hg! : f.ag!, ot = home ? f.ag! : f.hg!;
  const opp = gs.clubs[home ? f.away : f.home];
  const underdog = strengthOf(gs, me) < strengthOf(gs, opp.id) - 1.5;
  const journalist = JOURNALISTS[(f.id + gs.day) % JOURNALISTS.length];
  if (my > ot) {
    return underdog ? {
      journalist, q: `Victoria de prestigio ante el ${opp.name}. ¿Es el partido de la temporada?`,
      answers: [
        { text: 'Es un premio al trabajo de toda la semana.', board: 1, fans: 2, morale: 2, headline: 'El míster reparte méritos tras la gran victoria' },
        { text: 'Hoy hemos demostrado que podemos con cualquiera.', board: 2, fans: 4, morale: 3, headline: '«Podemos con cualquiera», avisa el míster' },
        { text: 'Solo son tres puntos, mañana a seguir.', board: 1, fans: -1, morale: 0, headline: 'El míster enfría la euforia' },
      ],
    } : {
      journalist, q: `Victoria ${my - ot >= 3 ? 'contundente' : 'trabajada'} ante el ${opp.name}. ¿Satisfecho?`,
      answers: [
        { text: 'Muy contento con la actitud del grupo.', board: 1, fans: 1, morale: 2, headline: 'Elogios del míster al vestuario' },
        { text: 'Hemos cumplido, pero se puede jugar mucho mejor.', board: 2, fans: 0, morale: -1, headline: 'El míster exige más pese a ganar' },
        { text: 'Este equipo va a pelear por todo.', board: 0, fans: 3, morale: 1, headline: 'El míster sube el listón: «A pelear por todo»' },
      ],
    };
  }
  if (my === ot) {
    return {
      journalist, q: `Empate ante el ${opp.name}. ¿Punto ganado o dos perdidos?`,
      answers: [
        { text: 'Un punto que vale, el rival también juega.', board: 0, fans: -1, morale: 1, headline: 'El míster da por bueno el empate' },
        { text: 'Dos puntos perdidos, no me ha gustado.', board: 1, fans: 1, morale: -2, headline: 'El míster, molesto con el empate' },
        { text: 'El arbitraje nos ha condicionado.', board: -1, fans: 2, morale: 1, headline: 'El míster carga contra el arbitraje' },
      ],
    };
  }
  return {
    journalist, q: `Derrota ${ot - my >= 3 ? 'dolorosa' : ''} ante el ${opp.name}. ¿Qué ha fallado?`,
    answers: [
      { text: 'La responsabilidad es mía, no de los jugadores.', board: -1, fans: 1, morale: 3, headline: 'El míster asume la culpa de la derrota' },
      { text: 'Algunos jugadores no han estado a la altura.', board: 1, fans: 0, morale: -4, headline: 'El míster señala a sus jugadores' },
      { text: 'Es fútbol: hay que pasar página rápido.', board: -1, fans: -2, morale: 1, headline: 'El míster pide pasar página' },
    ],
  };
}

export function answerPress(gs: GameState, q: PressQuestion, a: PressAnswer) {
  const club = gs.clubs[gs.manager.clubId];
  gs.manager.board = clamp(gs.manager.board + a.board, 5, 100);
  club.fans = clamp(club.fans + a.fans, 5, 100);
  for (const p of Object.values(gs.players)) if (p.clubId === club.id && !p.youth) p.morale = clamp(p.morale + a.morale, 5, 100);
  news(gs, 'match', a.headline, `${q.journalist}: «${q.q}» — «${a.text}»`);
}
