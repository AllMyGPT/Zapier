import type { NationDef, Scenario } from '@/engine/core';
import type { Condition, Effect, EventOption, GameEvent, Mission } from '@/engine/types';
import { N } from './helpers';
import { ww1936 } from './ww2';

/*
 * 1936 — La Guerra Civil Española. Reglas de guerra industrial (era 'ww2').
 * El resto del mundo parte de la situación del escenario de 1936 (sus naciones, economía y eventos de alto nivel),
 * de modo que la Segunda Guerra Mundial puede estallar alrededor de España: Hendaya y la División Azul son dilemas reales.
 *
 * Reparto de julio de 1936 con las provincias del mapa:
 *  - Bando sublevado: Galicia, León, Castilla la Vieja (Burgos, Valladolid, Salamanca), Navarra, Aragón (Zaragoza, Huesca, Teruel),
 *    Andalucía occidental (Sevilla, Cádiz, Córdoba), Baleares (Mallorca e Ibiza), Canarias y el Protectorado de Marruecos.
 *  - República: Castilla la Nueva (Madrid), Cataluña, Valencia, Murcia, Granada (que aquí representa la Andalucía oriental
 *    republicana: Málaga, Jaén, Almería), Extremadura (Badajoz) y Asturias (que representa toda la franja norte: Asturias,
 *    Santander y el País Vasco).
 * La guerra solo termina por capitulación (los líderes no ceden provincias a cambio de paz) y un evento convierte
 * la capitulación del vencido en anexión.
 *
 * Mapa mundial completo. Fuera de la península: el Sáhara español (Río de Oro e Ifni) se sumó a la sublevación
 * en los primeros días; la Guinea española siguió fiel a la República hasta septiembre de 1936, cuando la guarnición
 * de Fernando Poo se adhirió al alzamiento. Etiopía ya es italiana: Adís Abeba cayó el 5 de mayo de 1936.
 */

const R = 'secular';
type Ex = Parameters<typeof N>[7];
const W = (tag: string, name: string, color: string, provs: string[], culture: string, gov: string, extra: Ex = {}) => N(tag, name, color, provs, R, culture, gov, extra);
const HARD = 1000;

// ------------------------------------------------------------------ helpers
const E = (e: GameEvent): GameEvent => ({ oneShot: true, ...e });
const T = (e: GameEvent): GameEvent => ({ oneShot: true, triggeredOnly: true, ...e });
const P = (e: Omit<GameEvent, 'oneShot'>): GameEvent => ({ ...e, oneShot: false });
const opt = (label: string, effects: Effect[], aiWeight?: number, hint?: string): EventOption => ({ label, effects, aiWeight, hint });
const X = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'x', tag, key, amount } : { type: 'x', key, amount });
const MP = (amount: number, tag?: string): Effect => (tag ? { type: 'manpower', tag, amount } : { type: 'manpower', amount });
const PR = (amount: number, tag?: string): Effect => (tag ? { type: 'prestige', tag, amount } : { type: 'prestige', amount });
const REL = (other: string, amount: number, tag?: string): Effect => (tag ? { type: 'relations', tag, other, amount } : { type: 'relations', other, amount });
const TECH = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'tech', tag, key, amount } : { type: 'tech', key, amount });
const FL = (flag: string, tag?: string): Effect => (tag ? { type: 'flag', tag, flag } : { type: 'flag', flag });
const TR = (event: string, days: number, tag?: string): Effect => (tag ? { type: 'trigger', tag, event, days } : { type: 'trigger', event, days });
const CH = (text: string, tag?: string): Effect => (tag ? { type: 'chronicle', tag, text } : { type: 'chronicle', text });
const SPAWN = (tag: string, province: string, units: Record<string, number>): Effect => ({ type: 'spawnArmy', tag, province, units });
const IC = (amount: number, tag?: string): Effect => X('factory', amount, tag);
const DIS = (amount: number, tag?: string): Effect => X('dissent', amount, tag);
const SUP = (amount: number, tag?: string): Effect => X('stock_supplies', amount, tag);
const NU = (amount: number, tag?: string): Effect => X('nu', amount, tag);
const CMB = (amount: number, tag?: string): Effect => X('combat', amount, tag);
const AIR = (fighters: number, bombers: number, tag?: string): Effect[] => [X('fighters', fighters, tag), X('bombers', bombers, tag)].filter((e) => (e as { amount: number }).amount !== 0);

const war = (other: string, tag?: string): Condition => (tag ? { type: 'atWarWith', tag, other } : { type: 'atWarWith', other });
const civilWar: Condition = { type: 'atWarWith', tag: 'NAC', other: 'REP' };
/** frequent bookkeeping events (supplies, weariness) run silently for the AI; the player gets a few dated decisions instead */
const AI: Condition = { type: 'isPlayer', value: false };
const HUMAN: Condition = { type: 'isPlayer', value: true };
const atWar = (value = true): Condition => ({ type: 'atWar', value });
const exists = (tag: string): Condition => ({ type: 'exists', tag });
const gone = (tag: string): Condition => ({ type: 'notExists', tag });
const owns = (province: string, tag?: string): Condition => (tag ? { type: 'owns', province, tag } : { type: 'owns', province });
const flag = (f: string, tag?: string, value = true): Condition => (tag ? { type: 'flag', flag: f, tag, value } : { type: 'flag', flag: f, value });
const minX = (key: string, value: number): Condition => ({ type: 'minX', key, value });
const year = (value: number): Condition => ({ type: 'minYear', value });
const until = (value: number): Condition => ({ type: 'maxYear', value });

// ------------------------------------------------------------------ economía de España en 1936
const SPAIN_ECON: Record<string, Record<string, number>> = {
  castilla_nueva: { ic: 3, vp: 30 }, cataluna: { ic: 5, vp: 20, energy: 2 }, valencia: { ic: 2, vp: 12 }, asturias: { ic: 3, energy: 10, metal: 8, vp: 10 },
  murcia: { ic: 1, metal: 2, vp: 3 }, granada: { metal: 1, vp: 4 }, extremadura: { vp: 3 },
  castilla_vieja: { ic: 1, vp: 10 }, andalucia: { ic: 1, rare: 4, metal: 2, vp: 10 }, galicia: { ic: 1, vp: 3 }, leon: { energy: 3, vp: 2 }, navarra: { vp: 2 },
  aragon: { vp: 6 }, baleares: { vp: 3 }, canarias: { vp: 1 }, tangier: { vp: 2 },
};
function overrides(): Scenario['provinceOverrides'] {
  const o: NonNullable<Scenario['provinceOverrides']> = {};
  for (const [pid, v] of Object.entries(ww1936.provinceOverrides ?? {})) o[pid] = { ...v, x: { ...(v.x ?? {}) } };
  for (const [pid, x] of Object.entries(SPAIN_ECON)) o[pid] = { x: { ...x } };
  // Madrid, Oviedo y la sierra de Guadarrama: frentes fortificados desde el otoño de 1936
  for (const [pid, f] of Object.entries({ castilla_nueva: 3, asturias: 3, aragon: 3, cataluna: 2, valencia: 2, castilla_vieja: 4, navarra: 3, leon: 2, galicia: 2, andalucia: 2, extremadura: 1 })) o[pid] = { ...o[pid], fort: f };
  return o;
}

// ------------------------------------------------------------------ naciones
function nations(): NationDef[] {
  const world = ww1936.nations.filter((n) => !['SPR', 'ETH'].includes(n.tag))
    .map((n) => ({ ...n, provinces: [...n.provinces], x: { ...(n.x ?? {}) }, armies: n.armies?.map((a) => ({ ...a, units: { ...a.units } })) }));
  const get = (t: string) => world.find((n) => n.tag === t)!;
  // mayo de 1936: Italia se ha anexionado Etiopía y sus frentes de Eritrea y Somalia se han disuelto
  get('ITA').provinces.push('ethiopia', 'ogaden');
  get('ITA').armies = get('ITA').armies!.filter((a) => !['eritrea', 'somalia'].includes(a.province)).concat({ province: 'ethiopia', units: { infantry: 6 }, name: 'Ejército del África Oriental Italiana' });
  // durante la guerra de España nadie entra en guerra con los contendientes por su cuenta: la intervención llega por eventos
  get('ITA').x.aggression = 0.5;
  get('POR').x = { ...get('POR').x, aggression: 0 };
  return [
    W('REP', 'República Española', '#8e44ad', ['castilla_nueva', 'cataluna', 'valencia', 'murcia', 'granada', 'extremadura', 'asturias', 'equatorial_guinea'], 'latin', 'democracy', {
      manpower: 450_000, x: { nu: 85, stubborn: HARD, neutral: 1, aggression: 0, navy: 4, subs: 1, fighters: 2, bombers: 1, combat: 0.75, stock_supplies: 3000 },
      description: 'El gobierno del Frente Popular conserva Madrid, Barcelona, Valencia, la industria del norte, la mayor parte de la flota y las reservas de oro del Banco de España. Pero el Estado se ha desmoronado: el poder está en manos de comités, partidos, sindicatos y milicias.',
      armies: [
        { province: 'castilla_nueva', units: { militia: 5, infantry: 1 }, name: 'Milicias y columnas de Madrid' },
        { province: 'cataluna', units: { militia: 4, infantry: 1 }, name: 'Columnas catalanas' },
        { province: 'asturias', units: { militia: 2, infantry: 1 }, name: 'Milicias del Norte' },
        { province: 'valencia', units: { militia: 2 }, name: 'Columnas de Levante' },
        { province: 'extremadura', units: { militia: 1 }, name: 'Defensa de Badajoz' },
        { province: 'granada', units: { militia: 1 }, name: 'Milicias de Andalucía oriental' },
        { province: 'murcia', units: { marines: 1 }, name: 'Base naval de Cartagena' },
      ],
    }),
    W('NAC', 'Bando sublevado', '#7f6a3a', ['castilla_vieja', 'galicia', 'leon', 'navarra', 'aragon', 'andalucia', 'baleares', 'canarias', 'tangier', 'western_sahara'], 'latin', 'authoritarian', {
      manpower: 350_000, x: { nu: 85, stubborn: HARD, neutral: 1, aggression: 0.05, navy: 3, fighters: 1, bombers: 1, combat: 1.3, factory: 8, stock_supplies: 4000 },
      description: 'Los militares sublevados controlan la mitad agraria del país, Galicia, Navarra y Andalucía occidental, y cuentan con el ejército profesional de África. Sin la flota, que sigue en manos republicanas, necesitan ayuda exterior para cruzar el Estrecho.',
      armies: [
        { province: 'tangier', units: { infantry: 4 }, name: 'Ejército de África' },
        { province: 'andalucia', units: { infantry: 2 }, name: 'División de Sevilla' },
        { province: 'navarra', units: { infantry: 2, mountain: 2 }, name: 'Columnas de Navarra (requetés)' },
        { province: 'castilla_vieja', units: { infantry: 3 }, name: 'Ejército del Norte' },
        { province: 'aragon', units: { infantry: 2 }, name: 'División de Zaragoza' },
        { province: 'galicia', units: { infantry: 2 }, name: 'División de La Coruña' }, { province: 'leon', units: { infantry: 2 }, name: 'Columnas de León' }, { province: 'baleares', units: { infantry: 1 }, name: 'Guarnición de Mallorca' },
      ],
    }),
    ...world,
  ];
}

// ------------------------------------------------------------------ 1936
const Y36: GameEvent[] = [
  E({ id: 'sp_coup', tag: 'NAC', date: '1936-07-17', image: 'war', title: 'Un golpe que no triunfa',
    text: 'El 17 de julio se sublevó el ejército de África; el 18, numerosas guarniciones de la península. En Madrid y Barcelona la rebelión ha sido aplastada por fuerzas leales y milicias obreras; en Sevilla, Zaragoza, Valladolid o Pamplona ha triunfado. El golpe que debía durar días se ha convertido en una guerra.',
    note: 'El general Mola dirigía la conspiración. El general Sanjurjo, llamado a encabezarla, murió el 20 de julio al estrellarse su avioneta en Estoril. Franco voló de Canarias a Tetuán para ponerse al frente del ejército de África.',
    options: [
      opt('Una Junta de Defensa Nacional en Burgos', [FL('coup'), NU(3), TR('sp_airlift', 1, 'NAC'), CH('Se constituye en Burgos la Junta de Defensa Nacional de los sublevados.')], 1),
    ] }),
  T({ id: 'sp_airlift', tag: 'NAC', image: 'explore', title: 'El Estrecho', condition: [civilWar],
    text: 'Las mejores tropas están en Marruecos y la flota, cuyas tripulaciones se han amotinado contra sus oficiales, bloquea el Estrecho. Franco ha enviado emisarios a Roma y a Berlín para pedir aviones de transporte.',
    options: [
      opt('Pedir aviones a Berlín y a Roma', [FL('airlift_request'), TR('sp_feuerzauber', 2, 'GER'), TR('sp_savoia', 3, 'ITA'), CH('Emisarios de Franco piden aviones a Hitler y a Mussolini.')], 9),
      opt('Forzar el paso con un convoy', [MP(-5000), SPAWN('NAC', 'andalucia', { infantry: 1 }), X('navy', -1, 'REP'), CH('Un convoy cruza el Estrecho bajo protección aérea.')], 1, 'Arriesgado sin dominio del mar.'),
    ] }),
  T({ id: 'sp_feuerzauber', tag: 'GER', image: 'war', title: 'Unternehmen Feuerzauber', condition: [civilWar],
    text: 'Dos emisarios de Franco, enviados a través de la organización del partido en Marruecos, han llegado hasta Hitler en Bayreuth. Piden aviones de transporte para llevar el ejército de África a la península.',
    note: 'Desde finales de julio de 1936, una veintena de trimotores Junkers Ju 52 trasladaron a Sevilla a más de 13 000 soldados en el primer puente aéreo militar a gran escala.',
    options: [
      opt('Enviar los Junkers', [SPAWN('NAC', 'andalucia', { infantry: 3 }), ...AIR(1, 0, 'NAC'), REL('NAC', 20), REL('ENG', -10), FL('ger_spain'), CH('Los Junkers alemanes trasladan a la península al ejército de África.')], 8),
      opt('No intervenir en España', [REL('NAC', -30), REL('ITA', -10)], 2),
    ] }),
  T({ id: 'sp_savoia', tag: 'ITA', image: 'war', title: 'Los Savoia para Franco', condition: [civilWar],
    text: 'Franco pide bombarderos. Mussolini duda; luego decide que una España afín cambiaría el equilibrio del Mediterráneo frente a Francia y Gran Bretaña.',
    options: [
      opt('Enviar doce Savoia-Marchetti', [...AIR(0, 1, 'NAC'), SPAWN('NAC', 'andalucia', { infantry: 1 }), REL('NAC', 20), FL('ita_spain'), CH('Bombarderos italianos aterrizan en Marruecos.')], 8),
      opt('No implicarse', [REL('NAC', -30)], 2),
    ] }),
  E({ id: 'sp_rep_arms', tag: 'REP', date: '1936-07-17', image: 'court', title: 'Armas para la República', condition: [civilWar],
    text: 'El gobierno de José Giral ha disuelto las unidades sublevadas y entregado armas a las organizaciones obreras. Pide ahora aviones y material al gobierno francés del Frente Popular.',
    options: [
      opt('Pedir ayuda a París', [TR('sp_blum', 3, 'FRA'), CH('Madrid pide aviones y armas al gobierno de Léon Blum.')], 7),
      opt('Comprar en el mercado internacional', [SUP(400), X('stock_rare', -100)], 3, 'Caro y lento: intermediarios, contrabandistas y material anticuado.'),
    ] }),
  T({ id: 'sp_blum', tag: 'FRA', image: 'court', title: 'El dilema de Blum', condition: [civilWar],
    text: 'Un gobierno amigo pide ayuda al otro lado de los Pirineos. La derecha francesa amenaza con una crisis, el presidente de la República se opone y Londres desaconseja cualquier implicación.',
    note: 'Francia envió algunos aviones a finales de julio y agosto de 1936 y, el 8 de agosto, cerró la frontera y propuso un acuerdo internacional de no intervención.',
    options: [
      opt('Unos aviones y después la no intervención', [...AIR(2, 0, 'REP'), REL('REP', 10), REL('ENG', 10), FL('fra_nonint'), CH('Francia entrega algunos aviones y propone un pacto de no intervención.')], 7),
      opt('Abrir la frontera a las armas', [...AIR(3, 1, 'REP'), SUP(800, 'REP'), REL('REP', 40), REL('GER', -30), REL('ITA', -30), REL('ENG', -20), DIS(6)], 3, 'Una política de riesgo, interior y exterior.'),
    ] }),
  E({ id: 'sp_mexico', tag: 'MEX', date: '1936-08-01', image: 'prosperity', title: 'Fusiles para España', condition: [civilWar],
    text: 'El presidente Cárdenas se ha comprometido a ayudar al gobierno legítimo de España. El ejército mexicano puede ceder fusiles y cartuchos de sus propios arsenales.',
    options: [
      opt('Enviar armas y munición', [SUP(600, 'REP'), REL('REP', 40), REL('USA', -10), CH('México envía fusiles y munición a la República.')], 8),
      opt('Limitarse al apoyo diplomático', [REL('REP', 15)], 2),
    ] }),
  E({ id: 'sp_portugal', tag: 'POR', date: '1936-08-01', image: 'court', title: 'Salazar y la guerra de España', condition: [civilWar],
    text: 'Para el Estado Novo, una victoria del Frente Popular al otro lado de la frontera sería una amenaza. Los sublevados piden poder usar puertos, carreteras y la radio portuguesa.',
    options: [
      opt('Apoyar discretamente a los sublevados', [SUP(500, 'NAC'), MP(8000, 'NAC'), REL('NAC', 30), REL('REP', -60), CH('Portugal facilita el tránsito de material y voluntarios para los sublevados.')], 8),
      opt('Neutralidad estricta', [REL('ENG', 10)], 2),
    ] }),
  E({ id: 'sp_badajoz', tag: 'NAC', date: '1936-08-01', image: 'war', title: 'La columna de Madrid', condition: [civilWar, owns('extremadura', 'REP')],
    text: 'Las columnas del ejército de África, con legionarios y regulares, avanzan desde Sevilla hacia el norte por la carretera de Extremadura. El objetivo es unir las dos zonas sublevadas y seguir hacia Madrid.',
    note: 'Tras la toma de Badajoz (14 de agosto de 1936), las tropas sublevadas fusilaron a centenares de personas, entre ellas muchos prisioneros, en la plaza de toros y otros lugares. La represión en la retaguardia fue sistemática en ambas zonas durante los primeros meses, aunque con lógicas distintas.',
    options: [
      opt('Avanzar por Extremadura hacia el Tajo', [CMB(0.05), FL('columna_madrid'), CH('Las columnas sublevadas avanzan por Extremadura.')], 7),
      opt('Asegurar primero Andalucía', [MP(10000), SUP(200)], 3),
    ] }),
  E({ id: 'sp_nonintervention', tag: 'ENG', date: '1936-09-01', image: 'peace', title: 'El Comité de No Intervención', condition: [civilWar],
    text: 'Veintisiete países se comprometen en Londres a no enviar armas a España. Todos saben que Alemania, Italia y Portugal ya lo hacen, y que la Unión Soviética pronto les seguirá.',
    note: 'El Comité se reunió en Londres desde el 9 de septiembre de 1936. El embargo afectó sobre todo a la República, que como gobierno reconocido tenía derecho a comprar armas.',
    options: [
      opt('Presidir el comité y evitar la escalada', [FL('nonintervention'), REL('GER', 10), REL('ITA', 10), SUP(-300, 'REP'), CH('Londres preside el Comité de No Intervención.')], 9),
      opt('Denunciar las violaciones', [REL('GER', -30), REL('ITA', -30), REL('REP', 20), DIS(3)], 1),
    ] }),
  E({ id: 'sp_alcazar', tag: 'NAC', date: '1936-09-01', image: 'war', title: 'El Alcázar de Toledo', condition: [civilWar, owns('castilla_nueva', 'REP')],
    text: 'Las columnas están a las puertas de Madrid, pero en el Alcázar de Toledo resisten desde julio guardias civiles, cadetes y civiles cercados por milicias. Desviarse para liberarlos costaría días preciosos al avance sobre la capital.',
    note: 'Franco decidió desviarse hacia Toledo, liberado el 27 de septiembre de 1936. Se discute si el retraso permitió a Madrid organizar su defensa.',
    options: [
      opt('Liberar el Alcázar', [PR(40), NU(5), FL('alcazar'), CH('Las tropas sublevadas levantan el cerco del Alcázar de Toledo.')], 7, 'Un símbolo poderoso; Madrid gana tiempo.'),
      opt('Seguir directamente hacia Madrid', [CMB(0.05), NU(-3)], 3),
    ] }),
  E({ id: 'sp_caudillo', tag: 'NAC', date: '1936-09-15', image: 'court', title: 'El mando único', condition: [civilWar],
    text: 'Los generales reunidos en Salamanca discuten si conviene un mando único. Franco, que controla el ejército de África y la ayuda alemana e italiana, es el candidato con más apoyos.',
    note: 'El 1 de octubre de 1936 Franco asumió en Burgos los cargos de Generalísimo y Jefe del Gobierno del Estado.',
    options: [
      opt('Franco, Generalísimo y jefe del Estado', [NU(5), DIS(-6), CMB(0.03), FL('caudillo'), CH('Franco asume el mando único de la zona sublevada.')], 9),
      opt('Mantener una junta colegiada', [DIS(6), NU(-3)], 1),
    ] }),
  E({ id: 'sp_militias', tag: 'REP', date: '1936-09-15', image: 'war', title: 'Del miliciano al soldado', condition: [civilWar],
    text: 'Largo Caballero preside un gobierno de unidad. Las milicias de partidos y sindicatos combaten con valor, pero sin disciplina común ni mandos profesionales. Los comunistas y muchos militares leales piden un ejército regular; los anarquistas temen que eso entierre la revolución.',
    options: [
      opt('Crear el Ejército Popular', [CMB(0.1), DIS(4), FL('ejercito_popular'), CH('Las milicias se integran en las brigadas mixtas del Ejército Popular de la República.')], 8),
      opt('Mantener las columnas de milicias', [CMB(0.03), DIS(-4)], 2),
    ] }),
  E({ id: 'sp_sov_aid', tag: 'SOV', date: '1936-09-15', image: 'war', title: 'La ayuda soviética', condition: [civilWar],
    text: 'Moscú ha respetado hasta ahora la no intervención, pero los envíos alemanes e italianos son evidentes. Ayudar a la República daría prestigio a la URSS, aunque inquietaría a Londres y París.',
    note: 'Los primeros tanques T-26 y aviones I-15 e I-16 llegaron a Cartagena en octubre de 1936, acompañados de asesores militares.',
    options: [
      opt('Enviar tanques, aviones y asesores', [SPAWN('REP', 'castilla_nueva', { armor: 2 }), ...AIR(3, 1, 'REP'), REL('REP', 25), REL('ENG', -15), FL('sov_spain'), TR('sp_gold', 15, 'REP'), CH('Barcos soviéticos descargan tanques y aviones en Cartagena.')], 8),
      opt('Respetar el embargo', [REL('ENG', 15), REL('FRA', 15), PR(-10)], 2),
    ] }),
  T({ id: 'sp_gold', tag: 'REP', image: 'prosperity', title: 'El oro del Banco de España', condition: [civilWar],
    text: 'El frente se acerca a Madrid. El ministro de Hacienda, Negrín, propone poner a salvo las reservas de oro, de las mayores del mundo, y usarlas para pagar las armas. Moscú se ofrece a custodiarlas.',
    note: 'Unas 510 toneladas de oro salieron de Cartagena hacia Odesa en octubre de 1936; otra parte se había vendido antes en Francia. El llamado oro de Moscú financió las compras de material y sigue siendo objeto de debate historiográfico.',
    options: [
      opt('Enviar el oro a Moscú', [SUP(2500), REL('SOV', 20), FL('gold_moscow'), CH('Las reservas de oro del Banco de España zarpan hacia la Unión Soviética.')], 7),
      opt('Venderlo en París', [SUP(1500), REL('FRA', 20), FL('gold_paris')], 3, 'Menos material soviético; más dependencia de los bancos franceses.'),
    ] }),
  E({ id: 'sp_brigades', tag: 'SOV', date: '1936-10-15', image: 'war', title: 'Las Brigadas Internacionales', condition: [civilWar],
    text: 'Miles de voluntarios de medio mundo quieren combatir contra el fascismo en España. La Internacional Comunista puede organizarlos en Albacete y enviarlos a los frentes.',
    note: 'Unos 35 000 voluntarios de más de cincuenta países sirvieron en las Brigadas Internacionales. Las primeras unidades entraron en combate en Madrid a comienzos de noviembre de 1936.',
    options: [
      opt('Organizar las Brigadas', [SPAWN('REP', 'castilla_nueva', { infantry: 3 }), PR(15), FL('brigades'), CH('Las Brigadas Internacionales desfilan por Madrid.')], 8),
      opt('No organizarlas', [], 2),
    ] }),
  E({ id: 'sp_condor', tag: 'GER', date: '1936-10-15', image: 'war', title: 'La Legión Cóndor', condition: [civilWar, flag('ger_spain')],
    text: 'Los asesores alemanes proponen convertir la ayuda en una unidad aérea completa, con mandos y aviones propios, a cambio de que Franco acelere la guerra. Sería un banco de pruebas para la nueva Luftwaffe.',
    note: 'La Legión Cóndor llegó en noviembre de 1936. Junto a la Aviación Legionaria italiana bombardeó Durango y, el 26 de abril de 1937, Gernika, cuya destrucción se convirtió en un símbolo universal de los bombardeos contra población civil.',
    options: [
      opt('Enviar la Legión Cóndor', [...AIR(3, 3, 'NAC'), SPAWN('NAC', 'castilla_vieja', { armor: 1 }), X('fighters', -1), X('bombers', -1), TECH('doctrine', 1), TECH('air', 1), REL('NAC', 15), FL('condor'), CH('La Legión Cóndor llega a España.')], 8, 'Se pierden aparatos, se ganan doctrina y experiencia.'),
      opt('Limitarse a vender material', [SUP(600, 'NAC'), X('stock_rare', 200)], 2, 'A cambio de minerales: piritas y wolframio.'),
    ] }),
  E({ id: 'sp_ctv', tag: 'ITA', date: '1936-12-01', image: 'war', title: 'El Corpo Truppe Volontarie', condition: [civilWar, flag('ita_spain')],
    text: 'Mussolini quiere una victoria rápida y visible. Propone enviar un cuerpo expedicionario entero, con infantería motorizada y tanquetas, disfrazado de voluntarios.',
    note: 'Unos 50 000 soldados italianos llegaron a España entre diciembre de 1936 y febrero de 1937. En febrero de 1937 participaron en la toma de Málaga, tras la cual la columna de civiles que huía hacia Almería fue atacada desde el mar y el aire.',
    options: [
      opt('Enviar el CTV', [SPAWN('NAC', 'andalucia', { infantry: 3, motorized: 2, armor: 1 }), ...AIR(1, 2, 'NAC'), MP(-50000), SUP(-500), REL('NAC', 15), REL('GER', 20), FL('ctv'), CH('Desembarcan en Cádiz las tropas del CTV italiano.')], 8),
      opt('Limitarse a aviones y material', [...AIR(1, 1, 'NAC'), SUP(300, 'NAC')], 2),
    ] }),
  E({ id: 'sp_madrid', tag: 'REP', date: '1936-11-01', image: 'war', title: '¡No pasarán!', condition: [civilWar, owns('castilla_nueva')],
    text: 'Las columnas sublevadas han llegado a la Casa de Campo y la Ciudad Universitaria. El gobierno se traslada a Valencia y deja la ciudad en manos de una Junta de Defensa presidida por el general Miaja, con el teniente coronel Rojo como jefe de Estado Mayor.',
    note: 'Madrid resistió el asalto de noviembre de 1936. En esas mismas semanas, miles de presos sacados de las cárceles madrileñas fueron asesinados en Paracuellos del Jarama y Torrejón de Ardoz, la mayor matanza de la retaguardia republicana.',
    options: [
      opt('Resistir barrio a barrio', [CMB(0.05), NU(8), MP(-20000), FL('madrid_holds'), CH('Madrid resiste el asalto de noviembre de 1936.')], 9),
      opt('Retirarse a la línea del Tajuña', [NU(-10), PR(-30)], 1),
    ] }),
];

// ------------------------------------------------------------------ 1937–1939
const Y37: GameEvent[] = [
  E({ id: 'sp_jarama', tag: 'NAC', date: '1937-02-01', image: 'war', title: 'El Jarama', condition: [civilWar, owns('castilla_nueva', 'REP')],
    text: 'Madrid no ha caído de frente. El Estado Mayor propone envolverla por el sureste y cortar la carretera de Valencia, su cordón umbilical.',
    options: [
      opt('Ofensiva del Jarama', [MP(-20000), MP(-25000, 'REP'), CMB(0.02), CH('La batalla del Jarama termina en una sangrienta estabilización del frente.')], 7),
      opt('Esperar al CTV y atacar por Guadalajara', [TR('sp_guadalajara', 30, 'ITA')], 3),
    ] }),
  E({ id: 'sp_guadalajara', tag: 'ITA', date: '1937-03-01', image: 'war', title: 'Guadalajara', condition: [civilWar, flag('ctv'), owns('castilla_nueva', 'REP')],
    text: 'Las divisiones motorizadas italianas avanzan por la carretera de Guadalajara bajo la lluvia y el aguanieve. Sus vehículos se atascan, su aviación no puede despegar de aeródromos embarrados y los republicanos contraatacan con tanques soviéticos.',
    note: 'La derrota del CTV en Guadalajara (marzo de 1937) fue un golpe para el prestigio de Mussolini y la primera gran victoria defensiva republicana.',
    options: [
      opt('Insistir en el ataque', [MP(-15000), PR(-40), NU(5, 'REP'), PR(30, 'REP'), CH('El CTV es derrotado en Guadalajara.')], 7),
      opt('Retirarse y reorganizar el cuerpo', [PR(-15)], 3),
    ] }),
  E({ id: 'sp_north', tag: 'NAC', date: '1937-03-15', image: 'war', title: 'La campaña del Norte', condition: [civilWar, owns('asturias', 'REP')],
    text: 'Madrid resiste. Mola propone volcarse sobre la franja republicana del norte, aislada del resto de la República, con su industria siderúrgica y sus minas.',
    note: 'La ofensiva sobre Vizcaya comenzó el 31 de marzo de 1937 con el bombardeo de Durango. Bilbao cayó en junio, Santander en agosto y Asturias en octubre. Mola murió en un accidente de aviación el 3 de junio de 1937.',
    options: [
      opt('Ofensiva sobre Vizcaya', [CMB(0.04), FL('north_campaign'), CH('Comienza la ofensiva sublevada sobre el frente norte.')], 8),
      opt('Mantener la presión sobre Madrid', [MP(-15000)], 2),
    ] }),
  E({ id: 'sp_unification', tag: 'NAC', date: '1937-04-01', image: 'court', title: 'El decreto de unificación', condition: [civilWar],
    text: 'Falangistas, carlistas y otras fuerzas rivalizan en la retaguardia con sus propias milicias. El cuartel general propone fundirlas en un partido único bajo el mando del jefe del Estado.',
    note: 'El decreto de 19 de abril de 1937 creó Falange Española Tradicionalista y de las JONS. Los dirigentes que se opusieron fueron apartados.',
    options: [
      opt('Un partido único bajo el mando de Franco', [DIS(-6), NU(4), FL('unification'), CH('Falangistas y carlistas quedan unificados en un partido único.')], 9),
      opt('Mantener la pluralidad de las fuerzas', [DIS(6)], 1),
    ] }),
  E({ id: 'sp_may_days', tag: 'REP', date: '1937-05-01', image: 'revolt', title: 'Los sucesos de mayo', condition: [civilWar, owns('cataluna')],
    text: 'En Barcelona, el intento de la Generalitat de recuperar el control de la Telefónica, en manos de la CNT, ha desatado combates entre anarquistas y el POUM, de un lado, y fuerzas de orden público, comunistas y socialistas, de otro.',
    note: 'Los enfrentamientos (3-8 de mayo de 1937) causaron cientos de muertos y la caída del gobierno de Largo Caballero. Le sucedió Juan Negrín. El POUM fue ilegalizado y su dirigente, Andreu Nin, detenido y asesinado por agentes soviéticos.',
    options: [
      opt('Restablecer la autoridad del gobierno (Negrín)', [DIS(-5), NU(4), CMB(0.05), FL('negrin'), CH('Juan Negrín forma un nuevo gobierno tras los sucesos de mayo.')], 7, 'Más eficacia militar y más peso comunista en el Estado.'),
      opt('Buscar un acuerdo entre las organizaciones', [DIS(3), NU(-2)], 3),
    ] }),
  E({ id: 'sp_brunete', tag: 'REP', date: '1937-07-01', image: 'war', title: 'Brunete', condition: [civilWar, owns('castilla_nueva')],
    text: 'Para aliviar al frente norte, el Estado Mayor de Rojo prepara la primera gran ofensiva del Ejército Popular al oeste de Madrid.',
    options: [
      opt('Lanzar la ofensiva de Brunete', [MP(-25000), MP(-15000, 'NAC'), PR(20), CH('El Ejército Popular ataca en Brunete; tras un avance inicial, la ofensiva se estanca bajo el calor de julio.')], 7),
      opt('Reservar las fuerzas', [SUP(400)], 3),
    ] }),
  E({ id: 'sp_belchite', tag: 'REP', date: '1937-08-15', image: 'war', title: 'Belchite', condition: [civilWar, owns('aragon', 'NAC')],
    text: 'Una ofensiva en Aragón hacia Zaragoza podría obligar a Franco a detener su avance en Santander y Asturias.',
    options: [
      opt('Atacar en Aragón', [MP(-15000), MP(-10000, 'NAC'), PR(10), CH('La ofensiva de Aragón toma Belchite tras duros combates, pero no llega a Zaragoza.')], 7),
      opt('Fortificar Cataluña', [SUP(300), X('nu', 2)], 3),
    ] }),
  E({ id: 'sp_teruel', tag: 'REP', date: '1937-12-01', image: 'war', title: 'Teruel', condition: [civilWar, owns('aragon', 'NAC')],
    text: 'Franco prepara una nueva ofensiva sobre Madrid por Guadalajara. Rojo propone adelantarse con un ataque por sorpresa sobre Teruel, una capital de provincia en un saliente expuesto.',
    note: 'La batalla de Teruel (diciembre de 1937-febrero de 1938) se libró con temperaturas de hasta veinte grados bajo cero. La ciudad fue tomada por la República y reconquistada por los sublevados.',
    options: [
      opt('Atacar Teruel', [MP(-40000), PR(30), FL('teruel'), TR('sp_teruel_nac', 40, 'NAC'), CH('El Ejército Popular toma Teruel en pleno invierno.')], 7),
      opt('Esperar a la ofensiva enemiga', [CMB(0.03)], 3),
    ] }),
  T({ id: 'sp_teruel_nac', tag: 'NAC', image: 'war', title: 'La contraofensiva de Teruel', condition: [civilWar],
    text: 'Los republicanos han tomado Teruel. Los asesores alemanes e italianos aconsejan no desviar fuerzas; Franco no quiere dejar en manos enemigas una capital de provincia.',
    options: [
      opt('Recuperar Teruel cueste lo que cueste', [MP(-40000), MP(-40000, 'REP'), PR(30), NU(-3, 'REP'), CH('Los sublevados recuperan Teruel en febrero de 1938.')], 8),
      opt('Mantener el plan sobre Madrid', [PR(-20)], 2),
    ] }),
  E({ id: 'sp_aragon', tag: 'NAC', date: '1938-03-01', image: 'war', title: 'Hacia el Mediterráneo', condition: [civilWar, owns('valencia', 'REP'), owns('cataluna', 'REP')],
    text: 'El Ejército Popular está desgastado tras Teruel. Una gran ofensiva a través de Aragón podría alcanzar el mar y partir en dos la zona republicana. Queda por decidir el paso siguiente: Cataluña, casi indefensa, o Valencia.',
    note: 'El 15 de abril de 1938 las tropas sublevadas llegaron al Mediterráneo en Vinaròs. Franco se dirigió después hacia Valencia, frenado en la línea XYZ, en lugar de atacar Cataluña.',
    options: [
      opt('Alcanzar el mar y girar hacia Valencia', [CMB(0.04), NU(-6, 'REP'), FL('to_the_sea'), CH('Las tropas sublevadas llegan al Mediterráneo en Vinaròs: la República queda partida en dos.')], 6),
      opt('Alcanzar el mar y seguir hacia Barcelona', [CMB(0.04), NU(-8, 'REP'), MP(-20000), FL('to_the_sea'), REL('FRA', -20)], 4, 'Más rápido, pero París podría reaccionar ante tropas italianas en los Pirineos.'),
    ] }),
  E({ id: 'sp_ebro', tag: 'REP', date: '1938-07-01', image: 'war', title: 'El Ebro', condition: [civilWar, owns('cataluna')],
    text: 'Negrín quiere demostrar a Londres y París que la República aún puede vencer, y aliviar la presión sobre Valencia. El Ejército del Ebro prepara el cruce del río por sorpresa.',
    note: 'La batalla del Ebro (25 de julio-16 de noviembre de 1938) fue la más larga y sangrienta de la guerra. Dejó exhausto al Ejército Popular.',
    options: [
      opt('Cruzar el Ebro', [MP(-60000), MP(-50000, 'NAC'), PR(30), NU(5), TR('sp_ebro_end', 115, 'REP'), CH('El Ejército del Ebro cruza el río en la noche del 25 de julio.')], 7),
      opt('Fortificar y ganar tiempo', [SUP(500), CMB(0.03)], 3, 'Esperar a que estalle una guerra europea.'),
    ] }),
  T({ id: 'sp_ebro_end', tag: 'REP', image: 'disaster', title: 'El final de la batalla del Ebro', condition: [civilWar],
    text: 'Tras casi cuatro meses de combates en la sierra de Pàndols y Cavalls, el Ejército del Ebro vuelve a cruzar el río. Ha perdido gran parte de su material y de sus mejores unidades.',
    options: [opt('Replegarse tras el Ebro', [NU(-10), CMB(-0.05), DIS(5)], 1)] }),
  E({ id: 'sp_farewell', tag: 'REP', date: '1938-10-01', image: 'peace', title: 'La despedida de las Brigadas', condition: [civilWar, flag('brigades', 'SOV')],
    text: 'Tras los acuerdos de Múnich, nadie parece dispuesto a enfrentarse a Hitler por España. Negrín anuncia en la Sociedad de Naciones la retirada de los voluntarios extranjeros, con la esperanza de que Italia y Alemania hagan lo mismo.',
    note: 'Las Brigadas Internacionales desfilaron en Barcelona el 28 de octubre de 1938. Las tropas italianas y alemanas siguieron en España hasta el final de la guerra.',
    options: [
      opt('Retirar a los voluntarios', [MP(-10000), PR(30), REL('ENG', 20), REL('FRA', 20), CH('Barcelona despide a las Brigadas Internacionales.')], 8),
      opt('Mantenerlos en el frente', [REL('ENG', -10), CMB(0.02)], 2),
    ] }),
  E({ id: 'sp_catalonia', tag: 'NAC', date: '1938-12-15', image: 'war', title: 'La ofensiva de Cataluña', condition: [civilWar, owns('cataluna', 'REP')],
    text: 'El Ejército del Ebro está agotado y la aviación republicana apenas puede despegar. El Estado Mayor prepara la ofensiva final sobre Cataluña.',
    options: [
      opt('Lanzar la ofensiva', [CMB(0.06), FL('catalonia_offensive'), CH('Comienza la ofensiva sublevada sobre Cataluña.')], 9),
      opt('Esperar a la primavera', [SUP(500)], 1),
    ] }),
  E({ id: 'sp_retirada', tag: 'REP', date: '1939-01-01', image: 'disaster', title: 'La Retirada', condition: [civilWar, owns('cataluna', 'NAC')],
    text: 'Barcelona ha caído. Por las carreteras hacia los Pirineos huyen soldados, mujeres, niños y ancianos bajo el frío y la aviación. Francia abre por fin la frontera.',
    note: 'En febrero de 1939 cerca de medio millón de personas cruzaron a Francia. Muchos fueron internados en campos improvisados en las playas de Argelès-sur-Mer y Saint-Cyprien.',
    options: [
      opt('Organizar la evacuación a Francia', [MP(-100000), NU(-10), FL('retirada'), CH('Medio millón de personas cruzan la frontera francesa.')], 6),
      opt('Resistir en la zona centro-sur', [NU(5), DIS(10)], 4, 'Negrín espera que una guerra europea cambie la situación.'),
    ] }),
  E({ id: 'sp_recognition', tag: 'ENG', date: '1939-02-15', image: 'court', title: 'El reconocimiento de Burgos', condition: [civilWar, owns('cataluna', 'NAC')],
    text: 'Con Cataluña perdida para la República, Londres y París se preparan para reconocer al gobierno de Burgos como gobierno de España.',
    options: [
      opt('Reconocer al gobierno de Franco', [REL('NAC', 40), REL('NAC', 30, 'FRA'), REL('REP', -40), NU(-10, 'REP'), CH('El Reino Unido y Francia reconocen al gobierno de Franco.')], 9),
      opt('Esperar al final de la guerra', [REL('REP', 10)], 1),
    ] }),
  E({ id: 'sp_casado', tag: 'REP', date: '1939-03-01', image: 'revolt', title: 'El Consejo Nacional de Defensa', condition: [civilWar, owns('cataluna', 'NAC')],
    text: 'El coronel Casado, jefe del Ejército del Centro, con el apoyo de socialistas como Besteiro y de anarquistas, se ha alzado contra el gobierno de Negrín. Cree que puede negociar con Franco una paz honrosa; los comunistas quieren resistir.',
    note: 'El golpe de Casado (5 de marzo de 1939) provocó combates en Madrid entre republicanos. Franco solo aceptó la rendición sin condiciones. Las tropas sublevadas entraron en Madrid el 28 de marzo.',
    options: [
      opt('Negociar la rendición', [NU(-90), DIS(10), FL('casado'), CH('El Consejo Nacional de Defensa intenta negociar la paz con Burgos.')], 8, 'La República capitulará en las próximas semanas.'),
      opt('Resistir hasta el final', [NU(10), DIS(20), MP(-30000)], 2),
    ] }),
];

// ------------------------------------------------------------------ desenlaces y posguerra
const END: GameEvent[] = [
  E({ id: 'sp_end_nac', tag: 'NAC', date: '1936-08-01', image: 'peace', title: 'El último parte', condition: [{ type: 'liegeOf', other: 'REP' }, until(1946)],
    text: 'El ejército republicano se ha rendido. Las tropas entran en Madrid, Valencia y Alicante, donde miles de personas esperan en vano barcos que las lleven al exilio.',
    note: 'El 1 de abril de 1939 Franco firmó el último parte de guerra. La guerra había causado varios cientos de miles de muertos. En la posguerra hubo decenas de miles de ejecuciones, cientos de miles de presos en cárceles y campos de concentración, y un exilio de cientos de miles de personas.',
    options: [opt('Proclamar el fin de la guerra', [{ type: 'annex', target: 'REP' }, NU(10), DIS(10), FL('victory'), CH('Termina la Guerra Civil Española con la victoria del bando sublevado.')], 1)] }),
  E({ id: 'sp_end_rep', tag: 'REP', date: '1936-08-01', image: 'peace', title: 'La República vence', condition: [{ type: 'liegeOf', other: 'NAC' }, until(1946)],
    text: 'Los mandos sublevados han capitulado. La República debe reconstruir un Estado desgarrado, desmovilizar a cientos de miles de combatientes y decidir qué hacer con los vencidos.',
    note: 'Desenlace contrafactual. La experiencia de la guerra hacía previsible una dura depuración en ambos sentidos; las democracias europeas, además, observaban con desconfianza a una República cada vez más dependiente de la ayuda soviética.',
    options: [opt('Proclamar el fin de la guerra', [{ type: 'annex', target: 'NAC' }, NU(10), DIS(10), FL('victory'), CH('Termina la Guerra Civil Española con la victoria de la República.')], 1)] }),
  E({ id: 'sp_hunger', tag: 'NAC', date: '1939-04-01', image: 'disaster', title: 'Los años del hambre', condition: [gone('REP'), until(1941)],
    text: 'El país está arruinado: puentes volados, cosechas perdidas, la cabaña ganadera diezmada y sin divisas. El régimen debe decidir cómo alimentar a la población y reconstruir.',
    note: 'La política autárquica de la posguerra, la represión y el aislamiento hicieron de los años cuarenta una década de hambre, racionamiento y mercado negro (estraperlo).',
    options: [
      opt('Autarquía: producir todo dentro', [IC(1), DIS(8), SUP(-300)], 7),
      opt('Pedir créditos y trigo al extranjero', [SUP(800), REL('ENG', 15), REL('USA', 15), DIS(-3)], 3, 'Más pan a costa de depender de las democracias.'),
    ] }),
  E({ id: 'sp_hendaye', tag: 'NAC', date: '1940-10-01', image: 'court', title: 'Hendaya', condition: [gone('REP'), exists('GER'), war('ENG', 'GER'), atWar(false), until(1941)],
    text: 'Hitler y Franco se reúnen en la estación de Hendaya. Berlín quiere que España entre en la guerra y le ayude a tomar Gibraltar. Madrid pide, a cambio, buena parte del Marruecos francés, Orán, grandes cantidades de trigo, combustible y armamento.',
    note: 'La entrevista de Hendaya (23 de octubre de 1940) terminó sin acuerdo. España, en estado de «no beligerancia», se mantuvo fuera del conflicto sin dejar de colaborar con el Eje.',
    options: [
      opt('Prometer mucho y no comprometer nada', [REL('GER', -10), REL('ENG', 10), FL('hendaye'), CH('Franco y Hitler se reúnen en Hendaya sin llegar a un acuerdo.')], 8, 'España sigue en la «no beligerancia».'),
      opt('Entrar en la guerra junto al Eje', [{ type: 'joinFaction', faction: 'axis' }, X('neutral', -1), { type: 'claim', provinces: ['fez', 'oran', 'marrakesh'] }, DIS(15), CH('España entra en la guerra junto a las potencias del Eje.')], 2, 'Un país exhausto contra la Royal Navy.'),
    ] }),
  E({ id: 'sp_blue_division', tag: 'NAC', date: '1941-06-22', image: 'war', title: 'La División Azul', condition: [gone('REP'), war('SOV', 'GER'), atWar(false), until(1941)],
    text: 'Alemania ha invadido la Unión Soviética. El ministro Serrano Súñer propone enviar una división de voluntarios para devolver la ayuda de la guerra civil sin declarar la guerra a nadie. Otros advierten que Londres y Washington tomarán nota.',
    note: 'La División Española de Voluntarios, conocida como División Azul, combatió en el frente de Leningrado de 1941 a 1943 y tuvo unas 5 000 bajas mortales.',
    options: [
      opt('Enviar una división de voluntarios', [MP(-18000), REL('GER', 10), REL('SOV', -80), REL('ENG', -15), REL('USA', -10), FL('blue_division'), TR('sp_blue_return', 820, 'NAC'), CH('La División Azul parte hacia el frente del Este.')], 7),
      opt('Mantener la no beligerancia sin gestos', [REL('GER', -30), REL('ENG', 10)], 3),
    ] }),
  T({ id: 'sp_blue_return', tag: 'NAC', image: 'peace', title: 'La vuelta a la neutralidad', condition: [exists('GER')],
    text: 'La guerra ha cambiado de signo. Los aliados presionan para que España retire a sus voluntarios y vuelva a una neutralidad estricta.',
    options: [
      opt('Repatriar la división', [REL('ENG', 20), REL('USA', 20), REL('GER', -20), CH('España repatria a la División Azul y vuelve a la neutralidad.')], 8),
      opt('Mantener una legión de voluntarios', [REL('GER', 10), REL('ENG', -20)], 2),
    ] }),
  E({ id: 'sp_wolfram', tag: 'NAC', date: '1943-06-01', image: 'prosperity', title: 'El wolframio', condition: [gone('REP'), exists('GER'), atWar(false), until(1944)],
    text: 'Alemania y los aliados pujan por el wolframio gallego, imprescindible para los proyectiles perforantes. Washington amenaza con cortar el suministro de petróleo si las ventas a Alemania continúan.',
    note: 'En mayo de 1944 España aceptó limitar drásticamente las exportaciones de wolframio a Alemania a cambio de mantener el suministro de petróleo estadounidense.',
    options: [
      opt('Restringir las ventas a Alemania', [REL('USA', 25), REL('ENG', 20), REL('GER', -20), X('stock_oil', 400)], 6),
      opt('Vender al mejor postor', [SUP(800), REL('USA', -20), X('stock_oil', -200)], 4),
    ] }),
  E({ id: 'sp_rep_europe', tag: 'REP', date: '1939-04-01', image: 'court', title: 'Una República ante la guerra europea', condition: [gone('NAC'), exists('GER'), until(1941)],
    text: 'La República ha ganado la guerra, pero Europa se prepara para otra. Londres y París desconfían de un gobierno sostenido por Moscú; Berlín y Roma no olvidan su derrota en España.',
    options: [
      opt('Alinearse con Francia y Gran Bretaña', [{ type: 'joinFaction', faction: 'allies' }, X('neutral', -1), REL('ENG', 30), REL('FRA', 30)], 5),
      opt('Neutralidad y reconstrucción', [DIS(-5), IC(1)], 5),
    ] }),
  // si una paz blanca interrumpiera la guerra civil, la IA la reanuda: ninguno de los dos bandos aceptaba una paz negociada
  P({ id: 'sp_no_peace_nac', tag: 'NAC', mtthMonths: 2, image: 'war', title: 'Una paz imposible', condition: [{ type: 'isPlayer', value: false }, exists('REP'), atWar(false), { type: 'notVassal' }, until(1940)],
    text: 'Ningún bando acepta una paz negociada.', options: [opt('Reanudar la guerra', [{ type: 'declareWar', target: 'REP', goal: 'castilla_nueva' }], 1)] }),
  P({ id: 'sp_no_peace_rep', tag: 'REP', mtthMonths: 2, image: 'war', title: 'Una paz imposible', condition: [{ type: 'isPlayer', value: false }, { type: 'isPlayer', tag: 'NAC', value: true } as Condition, exists('NAC'), atWar(false), { type: 'notVassal' }, until(1940)],
    text: 'Ningún bando acepta una paz negociada.', options: [opt('Reanudar la guerra', [{ type: 'declareWar', target: 'NAC', goal: 'castilla_vieja' }], 1)] }),
];

// ------------------------------------------------------------------ eventos dinámicos de la guerra civil
const POOL: GameEvent[] = [
  // el agotamiento de una guerra larga: la unidad nacional se erosiona en ambos bandos y acaba decidiendo quién capitula
  P({ id: 'sp_p_weariness_rep', tag: 'REP', mtthMonths: 3, image: 'revolt', title: 'El cansancio de la guerra', condition: [AI, civilWar, year(1938), until(1941)],
    text: 'Faltan alimentos, ropa y medicinas. Las quintas llaman ya a muchachos de diecisiete años y a hombres maduros. Cada vez más voces piden negociar una paz que el enemigo no ofrece.',
    options: [opt('«Resistir es vencer»', [NU(-6), DIS(3)], 6, 'La consigna de Negrín: aguantar hasta que estalle la guerra europea.'), opt('Buscar una mediación internacional', [NU(-9), REL('ENG', 10)], 4)] }),
  P({ id: 'sp_p_weariness_nac', tag: 'NAC', mtthMonths: 4, image: 'revolt', title: 'Una guerra que no termina', condition: [AI, civilWar, year(1938), until(1941)],
    text: 'La guerra se alarga más de lo previsto. Los aliados alemanes e italianos exigen pagos y concesiones, y la retaguardia empieza a acusar el desgaste.',
    options: [opt('Movilizar nuevas quintas', [NU(-5), MP(30000)], 6), opt('Pedir más ayuda a Berlín y Roma', [NU(-4), SUP(500), REL('ENG', -10)], 4)] }),
  P({ id: 'sp_p_aid_ai', tag: 'NAC', mtthMonths: 5, image: 'prosperity', title: 'Suministros exteriores', condition: [AI, civilWar, until(1939)],
    text: 'Llegan nuevos envíos de material y combustible a crédito.', options: [opt('Recibirlos', [SUP(500)], 1)] }),
  // el jugador recibe el desgaste de una guerra larga en dos decisiones fechadas, en lugar de un goteo de eventos
  E({ id: 'sp_weariness_rep_1', tag: 'REP', date: '1938-06-01', image: 'revolt', title: 'El cansancio de la guerra', condition: [HUMAN, civilWar, until(1940)],
    text: 'Faltan alimentos, ropa y medicinas. Las quintas llaman ya a muchachos de diecisiete años y a hombres maduros. Cada vez más voces piden negociar una paz que el enemigo no ofrece.',
    options: [opt('«Resistir es vencer»', [NU(-15), DIS(6)], 6, 'La consigna de Negrín: aguantar hasta que estalle la guerra europea.'), opt('Buscar una mediación internacional', [NU(-20), REL('ENG', 15)], 4)] }),
  E({ id: 'sp_weariness_rep_2', tag: 'REP', date: '1939-06-01', image: 'revolt', title: 'Tres años de guerra', condition: [HUMAN, civilWar, until(1941)],
    text: 'Tres años de guerra han agotado a la población y al ejército. Los mandos dudan de que se pueda resistir otro invierno.',
    options: [opt('Seguir resistiendo', [NU(-20), DIS(8)], 6), opt('Abrir negociaciones', [NU(-30)], 4)] }),
  E({ id: 'sp_weariness_nac_1', tag: 'NAC', date: '1938-06-01', image: 'revolt', title: 'Una guerra que no termina', condition: [HUMAN, civilWar, until(1940)],
    text: 'La guerra se alarga más de lo previsto. Los aliados alemanes e italianos exigen pagos y concesiones, y la retaguardia empieza a acusar el desgaste.',
    options: [opt('Movilizar nuevas quintas', [NU(-12), MP(60000)], 6), opt('Pedir más ayuda a Berlín y Roma', [NU(-10), SUP(1000), REL('ENG', -15)], 4)] }),
  E({ id: 'sp_weariness_nac_2', tag: 'NAC', date: '1939-06-01', image: 'revolt', title: 'Tres años de guerra', condition: [HUMAN, civilWar, until(1941)],
    text: 'La victoria prometida no llega y el país está exhausto.', options: [opt('Una última ofensiva', [NU(-15), MP(40000)], 6), opt('Endurecer la economía de guerra', [NU(-12), SUP(800)], 4)] }),
  P({ id: 'sp_p_rearguard', tag: 'REP', mtthMonths: 20, image: 'revolt', title: 'Tensiones en la retaguardia', condition: [civilWar, until(1939)],
    text: 'Partidos y sindicatos se disputan el control de las colectividades, los abastos y los nombramientos. Cada crisis de gobierno resta energía al frente.',
    options: [opt('Reforzar la autoridad del gobierno central', [DIS(-3), NU(-1)], 5), opt('Negociar con todas las organizaciones', [DIS(-1), CMB(-0.01)], 5)] }),
  P({ id: 'sp_p_hunger_rep', tag: 'REP', mtthMonths: 18, image: 'disaster', title: 'Hambre en las ciudades', condition: [civilWar, { type: 'minWarMonths', value: 12 }, until(1939)],
    text: 'Madrid y Barcelona, separadas de las regiones cerealistas, viven con raciones mínimas de lentejas y pan. El bloqueo naval enemigo encarece todo lo que llega por mar.',
    options: [opt('Racionamiento estricto', [DIS(3), SUP(200)], 6), opt('Importar alimentos a cualquier precio', [SUP(-400), DIS(-3)], 4)] }),
  P({ id: 'sp_p_foreign_credit', tag: 'NAC', mtthMonths: 18, image: 'prosperity', title: 'Créditos y suministros', condition: [civilWar, until(1939)],
    text: 'Compañías petroleras estadounidenses venden combustible a crédito y Alemania exige minerales a cambio de material. La retaguardia sublevada, agraria, alimenta sin grandes problemas a su población.',
    options: [opt('Pagar con piritas y wolframio', [SUP(500), X('stock_rare', -100)], 6), opt('Endeudarse a largo plazo', [SUP(400), X('stock_oil', 200)], 4)] }),
  P({ id: 'sp_p_air_raid', tag: 'REP', mtthMonths: 18, image: 'disaster', title: 'Bombardeos sobre la retaguardia', condition: [civilWar, year(1937), until(1939)],
    text: 'Aviones italianos con base en Mallorca bombardean Barcelona, Valencia y Alicante. Los vecinos excavan refugios bajo las plazas.',
    options: [opt('Construir refugios y defensa antiaérea', [SUP(-300), DIS(-2)], 6), opt('Llevar los cazas a la retaguardia', [CMB(-0.02), DIS(-3)], 4)] }),
];

/** a dynamic event the player can see at most `n` times: copy i only fires after copy i-1 and leaves its own flag */
const capped = (e: GameEvent, n = 3): GameEvent[] => Array.from({ length: n }, (_, i) => {
  const f = (k: number) => `seen_${e.id}_${k}`;
  return { ...e, id: i ? `${e.id}_${i + 1}` : e.id, condition: [...(e.condition ?? []), ...(i ? [flag(f(i))] : []), flag(f(i + 1), undefined, false)],
    options: e.options.map((o) => ({ ...o, effects: [...o.effects, FL(f(i + 1))] })) };
});

/** dated events (not chains, not dynamic) only make sense in their own year, unless they say otherwise */
const timed = (evs: GameEvent[]): GameEvent[] => evs.map((e) => {
  if (!e.date || e.triggeredOnly || e.mtthMonths || e.condition?.some((c) => c.type === 'maxYear')) return e;
  const [y, m] = e.date.split('-').map(Number);
  return { ...e, condition: [...(e.condition ?? []), until(y + (m >= 10 ? 1 : 0))] };
});

// ------------------------------------------------------------------ misiones
const M = (id: string, tag: string, col: number, icon: string, title: string, text: string, conditions: Condition[], rewards: Effect[], requires?: string[]): Mission =>
  ({ id, tag, col, icon, title, text, conditions, rewards, ...(requires ? { requires } : {}) });

const MISSIONS: Mission[] = [
  // República
  M('sp_rep_madrid', 'REP', 0, 'war', 'Madrid resiste', 'Conservar Madrid en 1937.', [year(1937), owns('castilla_nueva')], [NU(8), PR(40), CH('Madrid sigue siendo republicana.')]),
  M('sp_rep_madrid2', 'REP', 0, 'war', 'La capital de la resistencia', 'Conservar Madrid en 1939.', [year(1939), owns('castilla_nueva')], [NU(10), PR(60)], ['sp_rep_madrid']),
  M('sp_rep_army', 'REP', 1, 'war', 'El Ejército Popular', 'Convertir las milicias en un ejército regular eficaz.', [minX('combat', 1)], [TECH('infantry', 1), MP(30000)]),
  M('sp_rep_industry', 'REP', 1, 'prosperity', 'Industria de guerra', 'Reconvertir la industria catalana y levantina para la guerra.', [minX('ic', 16)], [IC(2), SUP(600)], ['sp_rep_army']),
  M('sp_rep_north', 'REP', 2, 'war', 'Sostener el Norte', 'Conservar la franja cantábrica en 1938.', [year(1938), owns('asturias')], [NU(5), X('stock_metal', 600)]),
  M('sp_rep_aragon', 'REP', 2, 'war', 'Zaragoza', 'Tomar Aragón.', [owns('aragon')], [PR(60), NU(5)]),
  M('sp_rep_south', 'REP', 3, 'war', 'Sevilla', 'Recuperar la Andalucía occidental.', [owns('andalucia')], [PR(60), MP(40000)]),
  M('sp_rep_victory', 'REP', 3, 'peace', 'La victoria de la República', 'Que el bando sublevado deje de existir.', [gone('NAC')], [PR(200), DIS(-10)], ['sp_rep_south']),
  // Bando sublevado
  M('sp_nac_link', 'NAC', 0, 'war', 'Unir las dos zonas', 'Tomar Extremadura y enlazar el sur con el norte.', [owns('extremadura')], [NU(5), MP(20000)]),
  M('sp_nac_madrid', 'NAC', 0, 'war', 'Madrid', 'Tomar la capital.', [owns('castilla_nueva')], [PR(100), NU(10), CH('Las tropas sublevadas entran en Madrid.')], ['sp_nac_link']),
  M('sp_nac_north', 'NAC', 1, 'war', 'La campaña del Norte', 'Ocupar la franja cantábrica, con sus minas y sus fábricas.', [owns('asturias')], [X('stock_metal', 800), IC(1), MP(30000)]),
  M('sp_nac_sea', 'NAC', 1, 'war', 'Hacia el Mediterráneo', 'Llegar al mar por Valencia o Murcia.', [{ type: 'ownsCount', provinces: ['valencia', 'murcia'], count: 1 }], [NU(5), PR(40)], ['sp_nac_north']),
  M('sp_nac_catalonia', 'NAC', 2, 'war', 'Cataluña', 'Tomar Barcelona.', [owns('cataluna')], [PR(80), IC(2)]),
  M('sp_nac_end', 'NAC', 2, 'peace', 'El fin de la guerra', 'Que la República deje de existir.', [gone('REP')], [PR(150), DIS(-5)], ['sp_nac_catalonia']),
  M('sp_nac_navy', 'NAC', 3, 'explore', 'El dominio del mar', 'Disponer de una flota superior a la republicana.', [minX('navy', 5)], [TECH('naval', 1)]),
  M('sp_nac_neutral', 'NAC', 3, 'peace', 'Fuera de la guerra mundial', 'Llegar a 1944 sin entrar en la Segunda Guerra Mundial.', [year(1944), gone('REP'), atWar(false)], [PR(80), DIS(-5), CH('España llega al final de la guerra mundial sin haber entrado en ella.')], ['sp_nac_end']),
  // Alemania
  M('sp_ger_condor', 'GER', 0, 'war', 'La Legión Cóndor', 'Enviar una fuerza aérea a España.', [flag('condor')], [TECH('air', 1)]),
  M('sp_ger_lessons', 'GER', 0, 'explore', 'Las lecciones de España', 'Mantener la Legión Cóndor hasta 1938.', [flag('condor'), year(1938)], [TECH('doctrine', 1), X('fighters', 2)], ['sp_ger_condor']),
  M('sp_ger_ore', 'GER', 1, 'prosperity', 'Piritas y wolframio', 'Que Andalucía y su minería estén en manos amigas en 1937.', [year(1937), owns('andalucia', 'NAC')], [X('stock_rare', 800), X('stock_metal', 400)]),
  M('sp_ger_victory', 'GER', 1, 'peace', 'Un régimen amigo en Madrid', 'Que la República desaparezca.', [gone('REP')], [PR(40), REL('NAC', 10)]),
  // Italia
  M('sp_ita_ctv', 'ITA', 0, 'war', 'El CTV', 'Enviar un cuerpo expedicionario a España.', [flag('ctv')], [PR(20)]),
  M('sp_ita_baleares', 'ITA', 0, 'explore', 'Mallorca', 'Que las Baleares sigan en manos amigas, como base aérea y naval.', [year(1937), owns('baleares', 'NAC')], [X('navy', 1), X('bombers', 1)], ['sp_ita_ctv']),
  M('sp_ita_victory', 'ITA', 1, 'peace', 'La victoria en España', 'Que la República desaparezca.', [gone('REP')], [PR(60), REL('NAC', 10)]),
  M('sp_ita_navy', 'ITA', 1, 'explore', 'Mare Nostrum', 'Una flota capaz de dominar el Mediterráneo occidental.', [minX('navy', 12)], [TECH('naval', 1)], ['sp_ita_victory']),
  // Unión Soviética
  M('sp_sov_m_aid', 'SOV', 0, 'war', 'Ayuda a la República', 'Enviar material y asesores a España.', [flag('sov_spain')], [PR(20), TECH('armor', 1)]),
  M('sp_sov_gold', 'SOV', 0, 'prosperity', 'El oro de Moscú', 'Que la República pague el material con su oro.', [flag('gold_moscow', 'REP')], [IC(2)], ['sp_sov_m_aid']),
  M('sp_sov_madrid', 'SOV', 1, 'war', 'Madrid, tumba del fascismo', 'Que Madrid siga siendo republicana en 1938.', [year(1938), owns('castilla_nueva', 'REP')], [PR(40)]),
  M('sp_sov_victory', 'SOV', 1, 'peace', 'Una República victoriosa', 'Que el bando sublevado desaparezca.', [gone('NAC')], [PR(80), REL('REP', 10)], ['sp_sov_madrid']),
  // Francia
  M('sp_fra_border', 'FRA', 0, 'peace', 'La no intervención', 'Evitar que la guerra de España se convierta en una guerra europea.', [flag('nonintervention', 'ENG'), year(1937)], [DIS(-3), REL('ENG', 20)]),
  M('sp_fra_pyrenees', 'FRA', 0, 'war', 'Una frontera amiga', 'Que Cataluña siga en manos republicanas en 1938.', [year(1938), owns('cataluna', 'REP')], [NU(3), PR(20)], ['sp_fra_border']),
  M('sp_fra_baleares', 'FRA', 1, 'explore', 'Las rutas de Argelia', 'Que las Baleares no sean una base italiana en 1939: deben ser republicanas.', [year(1939), owns('baleares', 'REP')], [X('navy', 1), PR(20)]),
];

export const spain1936: Scenario = {
  id: 'spain1936', era: 'ww2', menu: 'ww2', map: 'world', name: '1936 — La Guerra Civil Española',
  description: '17 de julio de 1936. Una parte del ejército se subleva contra el gobierno del Frente Popular. El golpe fracasa en Madrid, Barcelona y la mayor parte de las grandes ciudades, y España queda partida en dos. Alemania, Italia y la Unión Soviética intervienen; Francia y Gran Bretaña promueven la no intervención. Después, una Europa en guerra.',
  start: '1936-07-17', end: '1945-01-01',
  options: { allowedUnits: ['militia', 'infantry', 'mountain', 'cavalry', 'motorized', 'armor', 'artillery', 'marines'], artEra: 'ww2', fullWorld: true },
  nations: nations(), factions: ww1936.factions, provinceOverrides: overrides(),
  wars: [{ name: 'Guerra Civil Española', attackers: ['NAC'], defenders: ['REP'] }],
  events: [...(ww1936.events ?? []).filter((e) => !['spanish_civil_war', 'eth_addis'].includes(e.id)), ...timed([...Y36, ...Y37, ...END]), ...POOL.flatMap((e) => (!e.mtthMonths || e.condition?.some((c) => c.type === 'isPlayer' && !c.value) ? [e] : capped(e, e.id === 'sp_p_foreign_credit' ? 2 : 3)))],
  missions: MISSIONS,
  relations: [
    ...(ww1936.relations ?? []).filter(([a, b]) => a !== 'ETH' && b !== 'ETH'),
    ['REP', 'NAC', -200], ['GER', 'NAC', 30], ['ITA', 'NAC', 30], ['POR', 'NAC', 30], ['SOV', 'REP', 20], ['MEX', 'REP', 40], ['FRA', 'REP', 30],
    ['GER', 'REP', 30], ['ITA', 'REP', 30], ['POR', 'REP', 30], ['SOV', 'NAC', 0],
  ],
  recommended: ['REP', 'NAC', 'GER', 'ITA', 'SOV', 'FRA'],
};
