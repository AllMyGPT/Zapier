import type { NationDef, Scenario } from '@/engine/core';
import type { GameEvent } from '@/engine/types';
import { ev, N } from './helpers';

const R = 'secular';
type Ex = Parameters<typeof N>[7];
const W = (tag: string, name: string, color: string, provs: string[], culture: string, gov: string, extra: Ex = {}) => N(tag, name, color, provs, R, culture, gov, extra);

// industry (ic) and daily resources per province
const ECON: Record<string, Partial<Record<'ic' | 'energy' | 'metal' | 'rare' | 'oil' | 'vp', number>>> = {
  westfalen: { ic: 14, energy: 30, vp: 5 }, rhineland: { ic: 12, energy: 10, vp: 5 }, saxony: { ic: 8, energy: 8 }, brandenburg: { ic: 9, vp: 20 }, silesia: { ic: 5, energy: 15 },
  bavaria: { ic: 5, vp: 5 }, swabia: { ic: 5 }, hannover: { ic: 4, oil: 1 }, franconia: { ic: 3 }, hesse: { ic: 3 }, holstein: { ic: 3 }, prussia: { ic: 2 }, pomerania: { ic: 1 }, mecklenburg: { ic: 1 }, frisia: { ic: 1 },
  london: { ic: 14, vp: 25 }, midlands: { ic: 12, energy: 25, metal: 5 }, york: { ic: 8, energy: 20 }, northumbria: { ic: 5, energy: 8 }, lowlands: { ic: 6, energy: 6 }, wessex: { ic: 4 }, east_anglia: { ic: 3 }, wales: { ic: 3, energy: 15 }, ulster: { ic: 2 }, highlands: { ic: 1 }, cornwall: { ic: 1, rare: 1 },
  ile_de_france: { ic: 12, vp: 25 }, picardie: { ic: 5, energy: 10 }, lorraine: { ic: 6, metal: 20, energy: 5 }, lyonnais: { ic: 5 }, provence: { ic: 4 }, normandie: { ic: 3 }, champagne: { ic: 3 }, bourgogne: { ic: 2 }, guyenne: { ic: 2 }, languedoc: { ic: 1, rare: 2 },
  flandre: { ic: 6, energy: 10 }, brabant: { ic: 5, energy: 5 }, holland: { ic: 6 },
  lombardia: { ic: 10 }, piemonte: { ic: 8 }, genova: { ic: 5 }, venezia: { ic: 4 }, toscana: { ic: 3, metal: 3 }, roma: { ic: 3, vp: 15 }, napoli: { ic: 3 }, romagna: { ic: 2 }, sardegna: { metal: 2, energy: 2 }, sicilia: { ic: 1 },
  moscow: { ic: 14, vp: 25 }, ingria: { ic: 10, vp: 10 }, kiev: { ic: 5, vp: 5 }, poltava: { ic: 4 }, don: { ic: 6, energy: 25 }, zaporozhye: { ic: 6, metal: 20, energy: 15 }, ural: { ic: 8, metal: 20, rare: 5, energy: 10 },
  nizhny: { ic: 5 }, tsaritsyn: { ic: 4 }, kazan: { ic: 2 }, samara: { ic: 2, oil: 4 }, kursk: { ic: 2, metal: 5 }, azerbaijan: { oil: 30, ic: 2 }, kuban: { oil: 10, ic: 1 }, georgia: { rare: 2, ic: 1 }, crimea: { ic: 1 },
  new_england: { ic: 25, vp: 15 }, virginia: { ic: 15, energy: 30, metal: 20 }, carolina: { ic: 6, oil: 20 }, florida: { ic: 2 }, new_france: { ic: 6, metal: 10, energy: 5 },
  bohemia: { ic: 6, energy: 8 }, moravia: { ic: 3, energy: 4 }, upper_hungary: { ic: 1 }, austria: { ic: 4, vp: 5 }, styria: { ic: 2, metal: 5 }, hungary: { ic: 3 }, transylvania: { rare: 3 }, wallachia: { oil: 15, ic: 2 },
  malopolska: { ic: 3, energy: 15 }, mazovia: { ic: 3, vp: 10 }, wielkopolska: { ic: 2 }, svealand: { ic: 4, metal: 10 }, norrland: { metal: 25 }, gotaland: { ic: 2 }, oslo: { ic: 2 }, jylland: { ic: 1 }, sjaelland: { ic: 2 },
  castilla_nueva: { ic: 2, vp: 10 }, cataluna: { ic: 3 }, asturias: { ic: 2, metal: 10, energy: 5 }, andalucia: { rare: 5, ic: 1 }, lisboa: { ic: 1 }, tabriz: { oil: 10 }, basra: { oil: 10 }, mosul: { oil: 8 }, venezuela: { oil: 20 },
  constantinople: { ic: 2 }, cairo: { ic: 1 }, kongo: { rare: 8 }, gold_coast: { rare: 3 }, peru: { rare: 5, metal: 3 }, mexico: { rare: 5, oil: 5, ic: 2 }, new_granada: { rare: 3 }, finland: { ic: 2 }, serbia: { ic: 1, metal: 3 }, bosnia: { metal: 3 },
};

function econ(): Scenario['provinceOverrides'] {
  const o: NonNullable<Scenario['provinceOverrides']> = {};
  for (const [pid, e] of Object.entries(ECON)) o[pid] = { x: { ...e } };
  return o;
}

const FACTIONS = {
  allies: { name: 'Aliados', leader: 'ENG', color: '#3b6fb6' },
  axis: { name: 'Eje', leader: 'GER', color: '#4a4a4a' },
  comintern: { name: 'Komintern', leader: 'SOV', color: '#b03a2e' },
};

function nations1936(): NationDef[] {
  return [
    W('GER', 'Alemania', '#5d6d7e', ['brandenburg', 'rhineland', 'westfalen', 'hannover', 'hesse', 'saxony', 'mecklenburg', 'pomerania', 'holstein', 'franconia', 'swabia', 'bavaria', 'silesia', 'prussia', 'frisia'], 'germanic', 'fascist', {
      faction: 'axis', manpower: 1_800_000, tech: { infantry: 1, armor: 1, air: 1, doctrine: 2, industry: 1 }, x: { nu: 80, fighters: 4, bombers: 3, navy: 3, subs: 4, aggression: 3, combat: 1.15 },
      claims: ['austria', 'bohemia', 'danzig', 'lorraine'],
      armies: [{ province: 'brandenburg', units: { infantry: 10, motorized: 2, armor: 2 }, name: 'Grupo de Ejércitos Norte' }, { province: 'bavaria', units: { infantry: 8, mountain: 2 }, name: 'Grupo de Ejércitos Sur' }, { province: 'rhineland', units: { infantry: 6 }, name: 'Grupo de Ejércitos Oeste' }],
    }),
    W('ENG', 'Reino Unido', '#c0392b', ['london', 'wessex', 'cornwall', 'midlands', 'east_anglia', 'york', 'northumbria', 'wales', 'lowlands', 'highlands', 'ulster', 'cyprus', 'jerusalem', 'acre', 'gold_coast', 'newfoundland'], 'english', 'democracy', {
      faction: 'allies', manpower: 1_200_000, tech: { naval: 3, air: 1, industry: 1, infantry: 1 }, x: { nu: 85, fighters: 4, bombers: 2, navy: 15, subs: 3 },
      armies: [{ province: 'london', units: { infantry: 8, armor: 1 }, name: 'Fuerza Expedicionaria' }, { province: 'jerusalem', units: { infantry: 3, motorized: 1 }, name: 'Ejército de Oriente Medio' }],
    }),
    W('FRA', 'Francia', '#2e86c1', ['ile_de_france', 'picardie', 'normandie', 'bretagne', 'champagne', 'lorraine', 'bourgogne', 'anjou', 'poitou', 'guyenne', 'gascogne', 'toulouse', 'languedoc', 'provence', 'lyonnais', 'auvergne', 'berry', 'dauphine', 'corsica', 'algiers', 'oran', 'tunis', 'fez', 'marrakesh', 'damascus', 'aleppo', 'antioch', 'senegal', 'guinea'], 'frankish', 'democracy', {
      faction: 'allies', manpower: 1_500_000, tech: { infantry: 2, armor: 1, industry: 1 }, x: { nu: 70, fighters: 4, bombers: 2, navy: 8, subs: 3 },
      armies: [{ province: 'lorraine', units: { infantry: 14, armor: 1 }, name: 'Línea Maginot' }, { province: 'champagne', units: { infantry: 8 }, name: '1.er Grupo de Ejércitos' }, { province: 'algiers', units: { infantry: 4 }, name: 'Armée d\'Afrique' }],
    }),
    W('ITA', 'Italia', '#27ae60', ['roma', 'piemonte', 'lombardia', 'venezia', 'genova', 'toscana', 'romagna', 'abruzzo', 'napoli', 'puglia', 'calabria', 'sicilia', 'sardegna', 'tripoli', 'cyrenaica'], 'latin', 'fascist', {
      manpower: 1_100_000, tech: { infantry: 1, air: 1, naval: 2 }, x: { nu: 60, fighters: 3, bombers: 3, navy: 8, subs: 4, aggression: 2 }, claims: ['albania', 'dalmatia', 'corsica', 'tunis'],
      armies: [{ province: 'piemonte', units: { infantry: 8, mountain: 2 } }, { province: 'cyrenaica', units: { infantry: 6 }, name: 'Ejército de Libia' }],
    }),
    W('SOV', 'Unión Soviética', '#a93226', ['moscow', 'ingria', 'novgorod', 'pskov', 'tver', 'smolensk', 'ryazan', 'vladimir', 'yaroslavl', 'vologda', 'archangelsk', 'nizhny', 'kazan', 'samara', 'ural', 'kiev', 'chernigov', 'kursk', 'voronezh', 'poltava', 'podolia', 'zaporozhye', 'crimea', 'don', 'kuban', 'tsaritsyn', 'astrakhan', 'belarus', 'karelia', 'georgia', 'armenia', 'azerbaijan'], 'slavic', 'communist', {
      faction: 'comintern', manpower: 4_000_000, tech: { infantry: 1, armor: 1, industry: 1 }, x: { nu: 90, fighters: 5, bombers: 3, navy: 4, subs: 5, combat: 0.65 },
      claims: ['estonia', 'livonia', 'courland', 'volhynia', 'red_ruthenia', 'moldavia', 'finland'],
      armies: [{ province: 'belarus', units: { infantry: 14, armor: 2 }, name: 'Frente Occidental' }, { province: 'kiev', units: { infantry: 12, cavalry: 2 }, name: 'Frente de Kiev' }, { province: 'ingria', units: { infantry: 8 }, name: 'Frente de Leningrado' }],
    }),
    W('USA', 'Estados Unidos', '#1f618d', ['new_england', 'virginia', 'carolina', 'florida'], 'english', 'democracy', { manpower: 2_500_000, tech: { industry: 2, naval: 2, air: 1 }, x: { nu: 90, navy: 12, fighters: 2, neutral: 1 }, armies: [{ province: 'new_england', units: { infantry: 4 } }] }),
    W('CAN', 'Canadá', '#cd6155', ['new_france'], 'english', 'democracy', { faction: 'allies', x: { navy: 2 } }),
    W('SPR', 'España', '#e67e22', ['castilla_nueva', 'castilla_vieja', 'galicia', 'asturias', 'leon', 'navarra', 'aragon', 'cataluna', 'valencia', 'murcia', 'andalucia', 'granada', 'extremadura', 'baleares', 'canarias', 'tangier'], 'latin', 'democracy', { manpower: 500_000, x: { nu: 40 }, armies: [{ province: 'castilla_nueva', units: { infantry: 6 } }] }),
    W('POR', 'Portugal', '#16a085', ['lisboa', 'porto', 'algarve', 'azores', 'cape_verde'], 'latin', 'authoritarian'),
    W('IRL', 'Irlanda', '#58d68d', ['leinster', 'munster', 'connacht'], 'english', 'democracy'),
    W('BEL', 'Bélgica', '#f4d03f', ['brabant', 'flandre', 'kongo'], 'frankish', 'democracy', { armies: [{ province: 'brabant', units: { infantry: 6 } }] }),
    W('HOL', 'Países Bajos', '#e59866', ['holland'], 'germanic', 'democracy', { x: { navy: 2 } }),
    W('SWI', 'Suiza', '#e74c3c', ['switzerland'], 'germanic', 'democracy', { x: { nu: 100 }, armies: [{ province: 'switzerland', units: { mountain: 4 } }] }),
    W('AUS', 'Austria', '#ecf0f1', ['austria', 'styria', 'tyrol'], 'germanic', 'authoritarian', { armies: [{ province: 'austria', units: { infantry: 3 } }] }),
    W('CZE', 'Checoslovaquia', '#5dade2', ['bohemia', 'moravia', 'upper_hungary'], 'slavic', 'democracy', { tech: { armor: 1 }, armies: [{ province: 'bohemia', units: { infantry: 8, armor: 1 } }] }),
    W('HUN', 'Hungría', '#196f3d', ['hungary', 'pannonia'], 'magyar', 'authoritarian', { claims: ['transylvania', 'upper_hungary'] }),
    W('ROM', 'Rumanía', '#f7dc6f', ['wallachia', 'transylvania', 'moldavia', 'dobruja'], 'latin', 'authoritarian', { armies: [{ province: 'wallachia', units: { infantry: 6 } }] }),
    W('YUG', 'Yugoslavia', '#aed6f1', ['serbia', 'croatia', 'dalmatia', 'bosnia', 'macedonia'], 'slavic', 'authoritarian', { armies: [{ province: 'serbia', units: { infantry: 8 } }] }),
    W('BUL', 'Bulgaria', '#1e8449', ['bulgaria'], 'slavic', 'authoritarian'),
    W('GRE', 'Grecia', '#85c1e9', ['thessaly', 'morea', 'crete'], 'greek', 'authoritarian', { armies: [{ province: 'thessaly', units: { infantry: 4, mountain: 1 } }] }),
    W('ALB', 'Albania', '#922b21', ['albania'], 'latin', 'authoritarian'),
    W('TUR', 'Turquía', '#117864', ['ankara', 'constantinople', 'thrace', 'bithynia', 'aydin', 'konya', 'trebizond', 'sivas', 'cilicia'], 'turkic', 'authoritarian', { x: { nu: 80 }, armies: [{ province: 'thrace', units: { infantry: 6 } }] }),
    W('POL', 'Polonia', '#ec7063', ['mazovia', 'wielkopolska', 'malopolska', 'danzig', 'red_ruthenia', 'volhynia'], 'slavic', 'authoritarian', {
      manpower: 900_000, x: { nu: 75, fighters: 2 }, armies: [{ province: 'wielkopolska', units: { infantry: 10, cavalry: 3 }, name: 'Ejército Poznań' }, { province: 'mazovia', units: { infantry: 8 }, name: 'Ejército Varsovia' }],
    }),
    W('LIT', 'Lituania', '#16a085', ['lithuania'], 'slavic', 'authoritarian'),
    W('LAT', 'Letonia', '#a04000', ['livonia', 'courland'], 'slavic', 'authoritarian'),
    W('EST', 'Estonia', '#2874a6', ['estonia'], 'slavic', 'democracy'),
    W('FIN', 'Finlandia', '#d6eaf8', ['finland', 'osterbotten'], 'norse', 'democracy', { x: { nu: 95 }, armies: [{ province: 'finland', units: { infantry: 5 } }] }),
    W('SWE', 'Suecia', '#2471a3', ['svealand', 'gotaland', 'norrland', 'skane'], 'norse', 'democracy', { x: { navy: 2 } }),
    W('NOR', 'Noruega', '#c0392b', ['oslo', 'bergen', 'trondelag'], 'norse', 'democracy'),
    W('DEN', 'Dinamarca', '#e74c3c', ['sjaelland', 'jylland', 'iceland'], 'norse', 'democracy'),
    W('EGY', 'Egipto', '#d4ac0d', ['cairo', 'alexandria', 'sinai'], 'arabic', 'authoritarian', { liege: 'ENG' }),
    W('IRQ', 'Irak', '#7dcea0', ['baghdad', 'mosul', 'basra'], 'arabic', 'authoritarian', { liege: 'ENG' }),
    W('PER', 'Persia', '#45b39d', ['tabriz'], 'arabic', 'authoritarian'),
    W('MEX', 'México', '#196f3d', ['mexico', 'veracruz', 'yucatan'], 'latin', 'authoritarian'),
    W('GUA', 'Guatemala', '#5dade2', ['guatemala'], 'latin', 'authoritarian'),
    W('CUB', 'Cuba', '#2e86c1', ['cuba'], 'latin', 'authoritarian'),
    W('HAI', 'La Española', '#922b21', ['hispaniola'], 'latin', 'authoritarian'),
    W('PAN', 'Panamá', '#f0b27a', ['panama'], 'latin', 'democracy'),
    W('COL', 'Colombia', '#f4d03f', ['new_granada'], 'latin', 'democracy'),
    W('VNZ', 'Venezuela', '#b03a2e', ['venezuela'], 'latin', 'authoritarian'),
    W('PRU', 'Perú', '#e74c3c', ['peru'], 'latin', 'authoritarian'),
    W('BRA', 'Brasil', '#27ae60', ['bahia', 'pernambuco'], 'latin', 'authoritarian'),
  ].map((n) => ({ ...n, x: { ...(n.x ?? {}) } }));
}

const DOW = (id: string, tag: string, date: string, target: string, title: string, text: string, goal: string, extraCond: GameEvent['condition'] = []): GameEvent =>
  ev({ id, tag, date, title, text, condition: [{ type: 'exists', tag: target }, ...extraCond], options: [{ label: 'Declarar la guerra', effects: [{ type: 'declareWar', target, goal }], aiWeight: 1 }, { label: 'Todavía no', effects: [], aiWeight: 0 }] });

const EVENTS: GameEvent[] = [
  ev({ id: 'spanish_civil_war', tag: 'SPR', date: '1936-07-18', title: 'Alzamiento militar', text: 'Una parte del ejército se subleva contra el gobierno de la República. El país se parte en dos.',
    options: [{ label: 'Victoria nacional (gobierno autoritario)', effects: [{ type: 'government', value: 'fascist' }, { type: 'manpower', amount: -250000 }, { type: 'x', key: 'dissent', amount: 30 }, { type: 'relations', other: 'GER', amount: 80 }, { type: 'relations', other: 'ITA', amount: 80 }], aiWeight: 7 },
      { label: 'Victoria republicana (giro comunista)', effects: [{ type: 'government', value: 'communist' }, { type: 'manpower', amount: -250000 }, { type: 'x', key: 'dissent', amount: 30 }, { type: 'relations', other: 'SOV', amount: 100 }], aiWeight: 3 }] }),
  ev({ id: 'axis_pact', tag: 'ITA', date: '1936-10-25', title: 'El Eje Roma-Berlín', text: 'Alemania propone un eje político entre ambas capitales.', condition: [{ type: 'exists', tag: 'GER' }],
    options: [{ label: 'Unirse al Eje', effects: [{ type: 'joinFaction', faction: 'axis' }], aiWeight: 9 }, { label: 'Mantener la neutralidad', effects: [{ type: 'relations', other: 'GER', amount: -50 }], aiWeight: 1 }] }),
  ev({ id: 'anschluss', tag: 'GER', date: '1938-03-12', title: 'Anschluss', text: 'El gobierno austriaco vacila. Nuestras tropas pueden entrar sin disparar un tiro.', condition: [{ type: 'exists', tag: 'AUS' }],
    options: [{ label: 'Anexionar Austria', effects: [{ type: 'annex', target: 'AUS' }, { type: 'infamy', amount: 5 }], aiWeight: 9 }, { label: 'Respetar su independencia', effects: [], aiWeight: 1 }] }),
  ev({ id: 'munich', tag: 'CZE', date: '1938-09-30', title: 'El acuerdo de Múnich', text: 'Londres y París aceptan la exigencia alemana sobre los Sudetes. Checoslovaquia está sola.', condition: [{ type: 'exists', tag: 'GER' }],
    options: [{ label: 'Ceder Bohemia', effects: [{ type: 'cede', from: 'CZE', to: 'GER', provinces: ['bohemia'] }], aiWeight: 9 }, { label: 'Resistir', effects: [{ type: 'declareWar', tag: 'GER', target: 'CZE', goal: 'bohemia' }], aiWeight: 1 }] }),
  ev({ id: 'prague', tag: 'GER', date: '1939-03-15', title: 'La ocupación de Praga', text: 'Lo que queda del Estado checo puede ser absorbido.', condition: [{ type: 'exists', tag: 'CZE' }, { type: 'owns', province: 'bohemia' }],
    options: [{ label: 'Ocupar Moravia y crear un estado eslovaco', effects: [{ type: 'cede', from: 'CZE', to: 'GER', provinces: ['moravia'] }, { type: 'vassalize', target: 'CZE' }, { type: 'infamy', amount: 8 }], aiWeight: 9 }, { label: 'No', effects: [], aiWeight: 1 }] }),
  ev({ id: 'albania', tag: 'ITA', date: '1939-04-07', title: 'La invasión de Albania', text: 'El pequeño reino al otro lado del Adriático está indefenso.', condition: [{ type: 'exists', tag: 'ALB' }],
    options: [{ label: 'Anexionar Albania', effects: [{ type: 'annex', target: 'ALB' }, { type: 'infamy', amount: 4 }], aiWeight: 9 }, { label: 'No', effects: [], aiWeight: 1 }] }),
  ev({ id: 'guarantee_poland', tag: 'ENG', date: '1939-03-31', title: 'La garantía a Polonia', text: 'Tras la ocupación de Praga, Londres garantiza la independencia polaca junto a París.', condition: [{ type: 'exists', tag: 'POL' }],
    options: [{ label: 'Garantizar Polonia', effects: [{ type: 'alliance', other: 'POL' }, { type: 'alliance', tag: 'FRA', other: 'POL' }], aiWeight: 1 }, { label: 'No comprometerse', effects: [], aiWeight: 0 }] }),
  ev({ id: 'mr_pact', tag: 'GER', date: '1939-08-23', title: 'Pacto con Moscú', text: 'Un pacto de no agresión con la URSS repartiría Europa oriental.', condition: [{ type: 'exists', tag: 'SOV' }],
    options: [{ label: 'Firmar el pacto', effects: [{ type: 'relations', other: 'SOV', amount: 150 }, { type: 'flag', flag: 'mr_pact' }, { type: 'claim', provinces: ['danzig', 'wielkopolska', 'mazovia', 'malopolska'] }, { type: 'claim', tag: 'SOV', provinces: ['volhynia', 'red_ruthenia', 'lithuania', 'livonia', 'courland', 'estonia', 'moldavia'] }], aiWeight: 9 }, { label: 'Rechazar', effects: [], aiWeight: 1 }] }),
  DOW('fall_weiss', 'GER', '1939-09-01', 'POL', 'Fall Weiss', 'Todo está listo para la invasión de Polonia.', 'danzig'),
  ev({ id: 'guarantee_eng', tag: 'ENG', date: '1939-09-03', title: 'La garantía a Polonia', text: 'Alemania ha invadido Polonia. Hemos dado nuestra palabra.', condition: [{ type: 'atWarWith', tag: 'GER', other: 'POL' }],
    options: [{ label: 'Declarar la guerra a Alemania', effects: [{ type: 'declareWar', target: 'GER' }], aiWeight: 1 }, { label: 'Apaciguamiento', effects: [{ type: 'x', key: 'dissent', amount: 15 }], aiWeight: 0 }] }),
  ev({ id: 'guarantee_fra', tag: 'FRA', date: '1939-09-03', title: 'Mort pour Dantzig?', text: 'Alemania ha invadido Polonia.', condition: [{ type: 'atWarWith', tag: 'GER', other: 'POL' }],
    options: [{ label: 'Cumplir con nuestra alianza', effects: [{ type: 'declareWar', target: 'GER' }], aiWeight: 1 }, { label: 'Neutralidad', effects: [{ type: 'x', key: 'dissent', amount: 15 }], aiWeight: 0 }] }),
  DOW('soviet_poland', 'SOV', '1939-09-17', 'POL', 'La invasión del este de Polonia', 'El Estado polaco se derrumba. Es la hora de recuperar los territorios del oeste.', 'volhynia', [{ type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }]),
  DOW('winter_war', 'SOV', '1939-11-30', 'FIN', 'La Guerra de Invierno', 'Finlandia se niega a ceder Carelia.', 'finland'),
  DOW('weserubung', 'GER', '1940-04-09', 'NOR', 'Weserübung', 'Hay que asegurar el hierro sueco y las costas noruegas.', 'oslo', [{ type: 'atWar', value: true }]),
  DOW('fall_gelb', 'GER', '1940-05-10', 'BEL', 'Fall Gelb', 'La ofensiva a través de las Ardenas y los Países Bajos.', 'brabant', [{ type: 'atWarWith', other: 'FRA' }]),
  DOW('fall_gelb_nl', 'GER', '1940-05-10', 'HOL', 'Invasión de los Países Bajos', 'Rotterdam y Ámsterdam deben caer.', 'holland', [{ type: 'atWarWith', other: 'FRA' }]),
  DOW('italy_france', 'ITA', '1940-06-10', 'FRA', 'La puñalada por la espalda', 'Francia se tambalea. Es el momento de reclamar Niza y Córcega.', 'provence', [{ type: 'atWarWith', tag: 'GER', other: 'FRA' }]),
  DOW('greece', 'ITA', '1940-10-28', 'GRE', 'El ultimátum a Grecia', 'Atenas rechaza nuestras exigencias.', 'thessaly'),
  DOW('barbarossa', 'GER', '1941-06-22', 'SOV', 'Operación Barbarroja', 'El gran ajuste de cuentas con el bolchevismo.', 'moscow'),
  ev({ id: 'usa_war', tag: 'USA', date: '1941-12-11', title: 'Un día que vivirá en la infamia', text: 'Las potencias del Eje nos han declarado la guerra.', condition: [{ type: 'exists', tag: 'GER' }],
    options: [{ label: 'Unirse a los Aliados', effects: [{ type: 'joinFaction', faction: 'allies' }, { type: 'declareWar', target: 'GER' }, { type: 'x', key: 'nu', amount: 10 }], aiWeight: 1 }] }),
  ev({ id: 'red_army_reform', tag: 'SOV', date: '1942-01-01', title: 'La reforma del Ejército Rojo', text: 'Tras las derrotas iniciales, los mandos purgados son reemplazados por oficiales probados en combate.',
    options: [{ label: 'Restaurar la autoridad de los generales', effects: [{ type: 'x', key: 'combat', amount: 0.3 }, { type: 'x', key: 'nu', amount: 5 }] }] }),
  ev({ id: 'ww2_strike', date: '1936-02-01', mtthMonths: 400, oneShot: false, title: 'Huelga industrial', text: 'Los obreros de las fábricas de armamento se declaran en huelga.', options: [{ label: 'Negociar', effects: [{ type: 'x', key: 'dissent', amount: 2 }] }, { label: 'Reprimir', effects: [{ type: 'x', key: 'dissent', amount: 5 }, { type: 'x', key: 'nu', amount: 2 }] }] }),
];

export const ww1936: Scenario = {
  id: 'ww1936', era: 'ww2', name: '1936 — El camino a la guerra',
  description: 'Alemania ha remilitarizado Renania, Italia ha invadido Abisinia y en España estalla la tensión. Tres bloques ideológicos se preparan para una guerra que decidirá el siglo.',
  start: '1936-01-01', end: '1948-01-01', recommended: ['GER', 'ENG', 'FRA', 'SOV', 'ITA', 'USA', 'POL'],
  nations: nations1936(), factions: FACTIONS, provinceOverrides: econ(), events: EVENTS,
  relations: [['GER', 'FRA', -100], ['GER', 'SOV', -150], ['ENG', 'FRA', 150], ['GER', 'ITA', 50], ['SOV', 'POL', -80], ['HUN', 'ROM', -80], ['ENG', 'USA', 100]],
};

/** 1939 is derived from 1936 with the pre-war annexations applied. */
function nations1939(): NationDef[] {
  const ns = nations1936();
  const get = (t: string) => ns.find((n) => n.tag === t)!;
  const move = (from: string, to: string, provs: string[]) => {
    get(from).provinces = get(from).provinces.filter((p) => !provs.includes(p));
    get(to).provinces.push(...provs);
  };
  move('AUS', 'GER', ['austria', 'styria', 'tyrol']);
  move('CZE', 'GER', ['bohemia', 'moravia']);
  move('ALB', 'ITA', ['albania']);
  const out = ns.filter((n) => !['AUS', 'ALB'].includes(n.tag));
  const cze = out.find((n) => n.tag === 'CZE')!;
  Object.assign(cze, { name: 'Eslovaquia', capital: 'upper_hungary', liege: 'GER', government: 'fascist', armies: [] });
  const spr = out.find((n) => n.tag === 'SPR')!;
  spr.government = 'fascist'; spr.manpower = 300_000;
  const ita = out.find((n) => n.tag === 'ITA')!;
  ita.faction = 'axis';
  const ger = get('GER');
  ger.tech = { infantry: 2, armor: 2, air: 2, doctrine: 3, industry: 2 };
  ger.x = { ...ger.x, fighters: 10, bombers: 8, navy: 5, subs: 8 };
  ger.armies = [
    { province: 'pomerania', units: { infantry: 12, armor: 3, motorized: 2 }, name: 'Grupo de Ejércitos Norte' },
    { province: 'silesia', units: { infantry: 16, armor: 4, motorized: 3 }, name: 'Grupo de Ejércitos Sur' },
    { province: 'rhineland', units: { infantry: 14 }, name: 'Grupo de Ejércitos C' },
    { province: 'prussia', units: { infantry: 6 }, name: '3.er Ejército' },
  ];
  ger.claims = ['danzig', 'wielkopolska', 'mazovia'];
  get('POL').allies = ['ENG', 'FRA'];
  get('ENG').armies!.push({ province: 'picardie', units: { infantry: 4 }, name: 'BEF' });
  get('FRA').tech = { infantry: 2, armor: 1, industry: 1 };
  return out;
}

export const ww1939: Scenario = {
  id: 'ww1939', era: 'ww2', name: '1939 — Fall Weiss',
  description: 'Austria y Bohemia ya son alemanas, el pacto con Moscú está firmado y la Wehrmacht cruza la frontera polaca. Gran Bretaña y Francia han dado su garantía.',
  start: '1939-08-31', end: '1948-01-01', recommended: ['GER', 'POL', 'ENG', 'FRA', 'SOV', 'ITA'],
  nations: nations1939(), factions: FACTIONS, provinceOverrides: econ(),
  events: EVENTS.filter((e) => !['spanish_civil_war', 'axis_pact', 'anschluss', 'munich', 'prague', 'albania', 'guarantee_poland'].includes(e.id)).map((e) => (e.id === 'mr_pact' ? { ...e, date: '1939-08-31' } : e)),
  relations: [['GER', 'FRA', -150], ['GER', 'POL', -150], ['ENG', 'FRA', 150], ['GER', 'ITA', 120], ['GER', 'SOV', 0], ['ENG', 'POL', 100], ['FRA', 'POL', 100], ['ENG', 'USA', 100]],
};
