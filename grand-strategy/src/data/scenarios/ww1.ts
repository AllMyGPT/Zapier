import type { NationDef, Scenario } from '@/engine/core';
import type { Condition, Effect, EventOption, GameEvent, Mission } from '@/engine/types';
import { N } from './helpers';

/*
 * 1914 — La Gran Guerra. Usa las reglas de guerra industrial (era 'ww2') con unidades de época:
 * sin motorizados ni carros hasta que un evento los desbloquea (x.unlock_armor + tecnología de blindados).
 *
 * Arquitectura de las guerras (importante para el motor, que solo deja negociar la paz a los líderes de bando):
 *  - Guerra A: Austria-Hungría contra Serbia (28 de julio).
 *  - Guerra B: Alemania contra Rusia (1 de agosto). Rusia lidera la defensa: su salida no arrastra a nadie.
 *  - Guerra C: Alemania contra Francia (3 de agosto). Es la guerra general: Francia lidera la Entente y todos los
 *    que entran después (Reino Unido, Italia, Rumanía, EE. UU.…) lo hacen mediante joinFaction en esta guerra.
 *  - Guerra D: Alemania contra Bélgica (4 de agosto).
 * Las salidas de la guerra (Brest-Litovsk, armisticios de 1918) se modelan con una capitulación forzada
 * (unidad nacional muy negativa) y un evento posterior que devuelve la independencia y aplica el tratado.
 */

const R = 'secular';
/** leaders never trade provinces for peace: only capitulations, white peace after years of deadlock, or the scripted armistices end the war */
const HARD = 1000;
type Ex = Parameters<typeof N>[7];
const W = (tag: string, name: string, color: string, provs: string[], culture: string, gov: string, extra: Ex = {}) => N(tag, name, color, provs, R, culture, gov, extra);

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
const JF = (faction: string, tag?: string): Effect => (tag ? { type: 'joinFaction', tag, faction } : { type: 'joinFaction', faction });
const DW = (target: string, goal?: string): Effect => ({ type: 'declareWar', target, ...(goal ? { goal } : {}) });
const CEDE = (from: string, to: string, provinces: string[]): Effect => ({ type: 'cede', from, to, provinces });
const GOV = (value: string, tag?: string): Effect => (tag ? { type: 'government', tag, value } : { type: 'government', value });
const CLAIM = (provinces: string[], tag?: string): Effect => (tag ? { type: 'claim', tag, provinces } : { type: 'claim', provinces });
const SPAWN = (tag: string, province: string, units: Record<string, number>): Effect => ({ type: 'spawnArmy', tag, province, units });
const IC = (amount: number, tag?: string): Effect => X('factory', amount, tag);
const DIS = (amount: number, tag?: string): Effect => X('dissent', amount, tag);
const SUP = (amount: number, tag?: string): Effect => X('stock_supplies', amount, tag);
const NU = (amount: number, tag?: string): Effect => X('nu', amount, tag);
const CMB = (amount: number, tag?: string): Effect => X('combat', amount, tag);
/** forced capitulation: with a very negative national unity the nation leaves its wars at the next monthly check */
const SURRENDER: Effect = X('nu', -600);
const RESTORE = (to = 80): Effect => X('nu', 600 + to - 80);
/** after an armistice the defeated power accepts the occupation instead of rebelling against its new liege */
const ACCEPT: Effect[] = ['FRA', 'ENG', 'USA', 'ITA', 'SER', 'ROM', 'GRE', 'BEL'].map((o) => ({ type: 'relations', other: o, amount: 150 }) as Effect);
/** possible victors that may hold a capitulated power as a vassal after the armistice */
const VICTORS = ['FRA', 'ENG', 'USA', 'ITA', 'SER', 'BEL', 'ROM', 'GRE', 'RUS', 'GER', 'AUH', 'OTT', 'BUL', 'JAP'];
const FREE = (target: string): Effect[] => VICTORS.filter((t) => t !== target).map((t) => ({ type: 'release', tag: t, target }) as Effect);
const ENTENTE_MEMBERS = ['FRA', 'ENG', 'ITA', 'SER', 'BEL', 'USA', 'ROM', 'POR', 'GRE', 'CAN', 'EGY', 'BRA', 'AUS', 'NZL', 'SAF', 'RAJ', 'JAP', 'MNE'];
/** Versailles: the German colonies become League of Nations mandates and Luxembourg recovers its independence */
const MANDATES: Effect[] = [
  CEDE('GER', 'FRA', ['togo', 'cameroon']), CEDE('GER', 'ENG', ['tanzania', 'dar_es_salaam']), CEDE('GER', 'BEL', ['rwanda', 'burundi']), CEDE('GER', 'SAF', ['namibia', 'karas']),
  CEDE('GER', 'AUS', ['png']), CEDE('GER', 'JAP', ['palau']), { type: 'release', tag: 'GER', target: 'LUX' } as Effect,
];

const war = (other: string, tag?: string): Condition => (tag ? { type: 'atWarWith', tag, other } : { type: 'atWarWith', other });
const atWar = (value = true): Condition => ({ type: 'atWar', value });
const exists = (tag: string): Condition => ({ type: 'exists', tag });
const owns = (province: string, tag?: string): Condition => (tag ? { type: 'owns', province, tag } : { type: 'owns', province });
const flag = (f: string, tag?: string, value = true): Condition => (tag ? { type: 'flag', flag: f, tag, value } : { type: 'flag', flag: f, value });
const minX = (key: string, value: number): Condition => ({ type: 'minX', key, value });
const maxX = (key: string, value: number): Condition => ({ type: 'maxX', key, value });
const year = (value: number): Condition => ({ type: 'minYear', value });
const until = (value: number): Condition => ({ type: 'maxYear', value });

// ------------------------------------------------------------------ economía de 1914 (CI y recursos diarios)
const ECON: Record<string, Partial<Record<'ic' | 'energy' | 'metal' | 'rare' | 'oil' | 'vp', number>>> = {
  // Alemania: el Ruhr, Sajonia y la Alta Silesia; el hierro de la Lorena anexionada se representa en Renania
  westfalen: { ic: 14, energy: 35, metal: 4, vp: 5 }, rhineland: { ic: 10, energy: 8, metal: 12, vp: 5 }, saxony: { ic: 9, energy: 8, rare: 2 }, brandenburg: { ic: 8, vp: 25 },
  silesia: { ic: 6, energy: 18, metal: 4, rare: 2 }, bavaria: { ic: 3, vp: 4 }, swabia: { ic: 3 }, hannover: { ic: 2 }, franconia: { ic: 2 }, hesse: { ic: 2 }, holstein: { ic: 2 },
  prussia: { ic: 1, vp: 5 }, pomerania: { ic: 1 }, danzig: { ic: 1 }, wielkopolska: { ic: 1 },
  // Reino Unido
  london: { ic: 12, vp: 25 }, midlands: { ic: 12, energy: 25, metal: 5 }, york: { ic: 8, energy: 20 }, northumbria: { ic: 6, energy: 10 }, lowlands: { ic: 7, energy: 8 },
  wales: { ic: 3, energy: 18 }, wessex: { ic: 3 }, east_anglia: { ic: 2 }, ulster: { ic: 3 }, cornwall: { ic: 1, rare: 1 }, leinster: { ic: 1 },
  // Francia: el norte industrial y la cuenca de Briey son fronterizos
  ile_de_france: { ic: 12, vp: 30 }, picardie: { ic: 4, energy: 8, vp: 4 }, lorraine: { ic: 4, metal: 18, vp: 6 }, lyonnais: { ic: 4 }, provence: { ic: 2 }, normandie: { ic: 2 },
  champagne: { ic: 2, vp: 4 }, bourgogne: { ic: 1 }, languedoc: { ic: 1, rare: 1 }, algiers: { ic: 1 },
  // Bélgica y neutrales del norte
  brabant: { ic: 5, energy: 6, metal: 4, vp: 10 }, flandre: { ic: 4, energy: 6, vp: 5 }, kongo: { rare: 6 }, holland: { ic: 4 },
  svealand: { ic: 3, metal: 10 }, norrland: { metal: 25 }, gotaland: { ic: 1 }, oslo: { ic: 1 }, sjaelland: { ic: 1 }, switzerland: { ic: 3 },
  // Rusia: Petrogrado, Moscú, el Donbás y Bakú
  ingria: { ic: 7, vp: 20 }, moscow: { ic: 7, vp: 15 }, don: { ic: 2, energy: 5 }, donbas: { ic: 1, energy: 16 }, kharkiv: { ic: 2 }, odesa: { ic: 1, vp: 3 }, zaporozhye: { ic: 3, metal: 18, energy: 6 }, ural: { ic: 3, metal: 10, rare: 3 },
  mazovia: { ic: 3, vp: 8 }, kiev: { ic: 2, vp: 5 }, livonia: { ic: 2 }, nizhny: { ic: 2 }, poltava: { ic: 1 }, kursk: { metal: 3 }, azerbaijan: { ic: 1, oil: 25 }, kuban: { oil: 4 }, georgia: { rare: 2 },
  // Austria-Hungría: Viena, Bohemia, Budapest y el petróleo de Galitzia
  austria: { ic: 8, vp: 20 }, bohemia: { ic: 7, energy: 10, vp: 5 }, moravia: { ic: 3, energy: 5 }, styria: { ic: 2, metal: 6, rare: 1 }, malopolska: { ic: 1, energy: 4, vp: 4 }, red_ruthenia: { oil: 6, vp: 4 },
  hungary: { ic: 4, vp: 15 }, transylvania: { rare: 2 }, upper_hungary: { metal: 2 },
  // Italia
  lombardia: { ic: 4 }, piemonte: { ic: 3 }, genova: { ic: 3 }, venezia: { ic: 1, vp: 6 }, toscana: { ic: 1, metal: 2 }, napoli: { ic: 1 }, roma: { ic: 1, vp: 15 }, sardegna: { metal: 2, energy: 1 },
  // Balcanes, Imperio otomano y Oriente Próximo
  serbia: { metal: 2, vp: 10 }, bosnia: { metal: 2, rare: 1 }, wallachia: { ic: 1, oil: 12, vp: 10 }, bulgaria: { vp: 8 },
  constantinople: { ic: 2, vp: 25 }, aydin: { ic: 1 }, jerusalem: { vp: 6 }, baghdad: { vp: 6 }, damascus: { vp: 5 }, mosul: { oil: 3 }, basra: { oil: 6 }, cairo: { ic: 1, vp: 6 },
  // Península ibérica
  cataluna: { ic: 2 }, asturias: { ic: 1, energy: 6, metal: 8 }, castilla_nueva: { ic: 1, vp: 10 }, andalucia: { rare: 4, metal: 2 }, lisboa: { ic: 1 },
  // Estados Unidos: el Noreste y los Grandes Lagos concentran la industria; Pensilvania, el carbón y el acero; Oklahoma, Texas y California, el petróleo
  new_york: { ic: 24 }, new_england: { ic: 16, vp: 5 }, virginia: { ic: 20, energy: 40, metal: 25 }, great_lakes: { ic: 22, metal: 12 }, midwest: { ic: 5 },
  carolina: { ic: 4 }, florida: { ic: 2 }, deep_south: { ic: 2, metal: 3 }, southern_plains: { oil: 18 }, texas: { oil: 12 }, california: { ic: 3, oil: 14 }, pacific_nw: { ic: 1 },
  rockies: { metal: 3 }, montana: { metal: 3, rare: 2 }, arizona: { rare: 2 },
  // Canadá y Terranova: el níquel de Sudbury y el carbón de Nueva Escocia
  new_france: { ic: 4, metal: 6 }, ontario: { ic: 5, rare: 3 }, maritimes: { ic: 1, energy: 4 }, british_columbia: { energy: 2, metal: 1 }, yukon: { rare: 1 },
  // América Latina: petróleo de Tampico, salitre chileno, estaño boliviano, caucho amazónico
  veracruz: { oil: 15 }, mexico: { ic: 1, rare: 3 }, monterrey: { ic: 1, metal: 3 }, chihuahua: { metal: 2, rare: 1 }, peru: { rare: 4, metal: 3 }, venezuela: { oil: 2 }, zulia: { oil: 1 },
  atacama: { rare: 8, metal: 2 }, santiago: { ic: 1 }, la_paz: { rare: 4 }, buenos_aires: { ic: 4, vp: 5 }, uruguay: { ic: 1 },
  rio: { ic: 2 }, sao_paulo: { ic: 3 }, minas: { metal: 3 }, amazonas: { rare: 2 }, trinidad: { oil: 2 },
  // Asia: la industria japonesa, el carbón de Manchuria, el estaño de Yunnan
  kanto: { ic: 7 }, kansai: { ic: 6 }, kyushu: { ic: 3, energy: 10, metal: 4 }, hokkaido: { energy: 4 }, pyongyang: { energy: 2, metal: 2 }, south_korea: { rare: 1 }, taiwan: { rare: 1 },
  beijing: { ic: 1, vp: 10 }, shanghai: { ic: 3, vp: 5 }, wuhan: { ic: 2, metal: 4 }, guangdong: { ic: 1 }, manchuria: { energy: 5 }, shandong: { energy: 3 }, henan: { energy: 2 }, yunnan: { rare: 3 },
  // la India británica: algodón de Bombay, yute de Calcuta, carbón de Jharia y acero de Tata; petróleo de Birmania
  bengal: { ic: 3, energy: 2 }, mumbai: { ic: 3 }, bihar: { energy: 8, metal: 4 }, tamil_nadu: { ic: 1 }, karnataka: { rare: 2 }, myanmar: { oil: 4 }, assam: { oil: 1 },
  // colonias: caucho y estaño de Malasia, el Congo y Sumatra; petróleo de Persia y de las Indias neerlandesas; oro y diamantes del sur de África
  sri_lanka: { rare: 2 }, malaya: { rare: 6 }, singapore: { ic: 1 }, sumatra: { oil: 8, rare: 2 }, east_kalimantan: { oil: 6 }, java: { ic: 1, rare: 1 },
  khuzestan: { oil: 6 }, hejaz: { vp: 4 }, vietnam: { energy: 3 }, saigon: { rare: 1 }, new_caledonia: { rare: 3, metal: 2 },
  katanga: { rare: 4, metal: 3 }, kasai: { rare: 2 }, karas: { rare: 3 }, zimbabwe: { rare: 2 },
  transvaal: { ic: 1, energy: 4, rare: 8 }, northern_cape: { rare: 3 }, natal: { energy: 2 }, cape: { ic: 1 },
  // Australia y Nueva Zelanda
  nsw: { ic: 3, energy: 6 }, victoria_au: { ic: 3 }, darling: { metal: 4, rare: 1 }, perth: { rare: 3 }, queensland: { metal: 2 }, tasmania: { metal: 2 }, nz_north: { ic: 1 },
};
/** fortresses and, from autumn 1914 on, entrenched fronts: high values slow sieges and favour the defender */
const FORTS: Record<string, number> = {
  // frente occidental
  lorraine: 6, champagne: 5, picardie: 4, ile_de_france: 5, flandre: 4, brabant: 3, rhineland: 6, swabia: 5, westfalen: 3, hesse: 2, bavaria: 2,
  // frente oriental
  prussia: 5, wielkopolska: 4, silesia: 4, brandenburg: 4, mazovia: 4, lithuania: 3, courland: 2, belarus: 2, volhynia: 3, malopolska: 4, red_ruthenia: 5, upper_hungary: 4, transylvania: 4,
  // Italia, Balcanes y Oriente
  tyrol: 6, styria: 4, venezia: 4, serbia: 4, bosnia: 3, macedonia: 3, thrace: 5, constantinople: 6, armenia: 4, georgia: 3, sinai: 2, switzerland: 4,
};

function overrides(): Scenario['provinceOverrides'] {
  const o: NonNullable<Scenario['provinceOverrides']> = {};
  // Outside Europe the belligerents' provinces weigh almost nothing in victory points: war score, peace costs and capitulations
  // keep depending on the European fronts (peace costs are rounded, so a larger pool would make French provinces free to cede)
  const overseas = worldNations().filter((n) => n.liege === 'ENG' || n.tag === 'JAP');
  for (const pid of [...WORLD_ADDED, ...USA_WORLD, ...BRA_WORLD, ...overseas.flatMap((n) => n.provinces)]) if (!EUROPE_ADDED.includes(pid)) o[pid] = { x: { vp: LOW_VP } };
  // the ruleset adds 10 VP to every capital: the overseas belligerents' capitals are compensated so they stay at LOW_VP
  for (const n of overseas) o[n.capital] = { x: { vp: LOW_VP - 10 } };
  // the Central Powers' pool is small: their overseas provinces need at least 2 VP so that an occupied colony never costs 0
  // in a peace deal (which would let Berlin end the whole war by handing over, say, German East Africa)
  for (const pid of [...GER_COLONIES, ...OTT_WORLD]) o[pid] = { x: { vp: 2 } };
  for (const [pid, e] of Object.entries(ECON)) o[pid] = { x: { ...(o[pid]?.x ?? {}), ...e } };
  for (const [pid, f] of Object.entries(FORTS)) o[pid] = { ...(o[pid] ?? {}), fort: f };
  return o;
}

const FACTIONS = {
  entente: { name: 'Entente', leader: 'FRA', color: '#3b6fb6' },
  central: { name: 'Potencias Centrales', leader: 'GER', color: '#4a4a4a' },
  rsfsr: { name: 'Rusia soviética', leader: 'RUS', color: '#b03a2e' },
};

// ------------------------------------------------------------------ el mundo de junio de 1914 (mapa mundial)
/*
 * Reparto de las provincias del mapa mundial según la soberanía de junio de 1914:
 *  - Las colonias, protectorados y concesiones son provincias de su metrópoli. Aportan poca industria y casi ningún punto de
 *    victoria (LOW_VP), igual que los dominios, la India, Japón y el interior americano: así la puntuación de guerra, el coste
 *    de la paz y las capitulaciones siguen dependiendo de los frentes europeos.
 *  - Los dominios autónomos (Canadá, Australia, Nueva Zelanda, Sudáfrica) y la India británica son naciones vasallas
 *    del Reino Unido: tienen ejército y economía propios y entran en la guerra con Londres. Egipto, ya vasallo, conserva
 *    su ficción de soberanía otomana hasta el protectorado de diciembre de 1914.
 *  - El Sudán anglo-egipcio, administrado de hecho por Londres, figura como británico; Darfur, independiente hasta 1916, aparte.
 *  - Bujará y Jiva, protectorados rusos, se integran en el Turquestán ruso por simplificación. Svalbard, tierra de nadie hasta
 *    1920, se asigna a Noruega. Las Nuevas Hébridas, condominio anglo-francés, figuran como francesas.
 *  - Japón entra en guerra con Alemania en una guerra propia (no en la de la Entente): su ejército se queda en Asia, como
 *    ocurrió, y las islas alemanas y Tsingtao se resuelven por eventos.
 *  - Mongolia (el kanato del Bogd Kan) y el Tíbet son independientes de hecho desde 1911-1913, aunque Pekín no lo reconozca.
 */
const RUS_WORLD = [
  'kharkiv', 'donbas', 'kherson', 'odesa', 'stavropol', 'north_caucasus', 'yerevan', 'karabakh', 'lapland', 'murmansk', 'komi', 'novaya_zemlya',
  'mangystau', 'kazakh_west', 'kyzylorda', 'kazakh_central', 'almaty', 'kazakh_east', 'karakalpakstan', 'turkmenistan', 'uzbekistan', 'tajikistan', 'kyrgyzstan',
  'tyumen', 'yamal', 'omsk', 'tomsk', 'turukhansk', 'taimyr', 'central_siberia', 'evenkia', 'angara', 'east_siberia', 'chita', 'mirny', 'yakutsk', 'olenek', 'verkhoyansk',
  'blagoveshchensk', 'khabarovsk', 'vladivostok', 'okhotsk', 'kolyma', 'magadan', 'koryakia', 'kamchatka', 'chukotka', 'chukotka_east', 'sakhalin',
];
const GER_COLONIES = ['togo', 'cameroon', 'namibia', 'karas', 'tanzania', 'dar_es_salaam', 'rwanda', 'burundi', 'png', 'palau'];
const FRA_COLONIES = [
  'ouargla', 'adrar', 'tamanrasset', 'mauritania', 'mali', 'timbuktu', 'burkina', 'ivory_coast', 'benin', 'niger', 'agadez', 'chad', 'tibesti', 'gabon', 'congo_brazzaville', 'car',
  'djibouti', 'antananarivo', 'toliara', 'comoros', 'vietnam', 'annam', 'saigon', 'laos', 'cambodia', 'french_guiana', 'new_caledonia', 'vanuatu',
];
const ENG_COLONIES = [
  'malta', 'kuwait', 'bahrain', 'emirates', 'aden', 'hadramaut', 'khartoum', 'nubia', 'south_sudan', 'gambia', 'sierra_leone', 'lagos', 'nigeria_delta', 'abuja', 'kano',
  'kenya', 'kenya_north', 'uganda', 'somaliland', 'malawi', 'zambia', 'zimbabwe', 'botswana', 'lesotho', 'eswatini', 'mauritius', 'seychelles', 'sri_lanka', 'maldives',
  'malaya', 'singapore', 'sarawak', 'brunei', 'sabah', 'solomon', 'fiji', 'labrador', 'belize', 'jamaica', 'bahamas', 'trinidad', 'barbados', 'guyana',
];
const BEL_COLONIES = ['kinshasa', 'equateur', 'kisangani', 'kivu', 'kasai', 'katanga'];
const POR_COLONIES = ['guinea_bissau', 'sao_tome', 'luanda', 'huambo', 'moxico', 'nampula', 'maputo', 'east_timor'];
const SPA_COLONIES = ['western_sahara', 'equatorial_guinea'];
const ITA_COLONIES = ['fezzan', 'kufra', 'eritrea', 'somalia', 'puntland'];
const HOL_COLONIES = ['sumatra', 'java', 'kalimantan', 'east_kalimantan', 'sulawesi', 'nusa_tenggara', 'west_papua', 'suriname'];
const DEN_COLONIES = ['greenland', 'greenland_east', 'greenland_north'];
const USA_WORLD = [
  'new_york', 'great_lakes', 'midwest', 'deep_south', 'southern_plains', 'texas', 'great_plains', 'rockies', 'montana', 'arizona', 'california', 'pacific_nw',
  'alaska', 'alaska_west', 'north_slope', 'hawaii', 'guam', 'puerto_rico', 'luzon', 'visayas', 'mindanao',
];
/** Mount Lebanon, Palestine, Transjordan, the Syrian desert, the Hejaz railway and Yemen; Qatar still had an Ottoman garrison in 1914 */
const OTT_WORLD = ['diyarbakir', 'beirut', 'latakia', 'deir_ez_zor', 'tel_aviv', 'west_bank', 'gaza', 'jordan', 'tabuk', 'hejaz', 'saada', 'sanaa', 'qatar'];
const CAN_WORLD = [
  'maritimes', 'northern_ontario', 'quebec_north', 'nunavik', 'manitoba', 'saskatchewan', 'alberta', 'british_columbia', 'athabasca', 'yukon', 'northwest_territories',
  'nunavut', 'kitikmeot', 'boothia', 'baffin', 'arctic_islands', 'parry', 'ellesmere',
];
const RAJ = [
  'delhi', 'punjab', 'kashmir', 'sindh', 'balochistan', 'rajasthan', 'gujarat', 'mumbai', 'central_india', 'uttar_pradesh', 'bihar', 'bengal', 'bangladesh', 'assam',
  'odisha', 'deccan', 'karnataka', 'tamil_nadu', 'myanmar', 'kachin', 'yangon', 'tenasserim',
];
/** provinces added to the 36 historical nations by the world map: low value in victory points */
const WORLD_ADDED = [
  ...RUS_WORLD, ...GER_COLONIES, ...FRA_COLONIES, ...ENG_COLONIES, ...BEL_COLONIES, ...POR_COLONIES, ...SPA_COLONIES, ...ITA_COLONIES, ...HOL_COLONIES,
  ...DEN_COLONIES, ...OTT_WORLD, ...CAN_WORLD, 'upper_egypt', 'western_desert', 'slovenia', 'kosovo', 'salonica', 'nordland', 'finnmark', 'svalbard',
];
const BRA_WORLD = ['sao_paulo', 'minas', 'ceara', 'maranhao', 'para', 'amapa', 'roraima', 'amazonas', 'acre_br', 'rondonia', 'mato_grosso', 'mato_grosso_sul', 'goias', 'tocantins', 'parana', 'rio_grande_sul'];
const LOW_VP = 0.1;
/** new provinces on the European and Caucasian fronts keep their normal value */
const EUROPE_ADDED = ['kharkiv', 'donbas', 'kherson', 'odesa', 'stavropol', 'north_caucasus', 'yerevan', 'karabakh', 'slovenia', 'kosovo', 'salonica'];
/** the dominions and India enter the war with London */
const DOMINIONS = ['CAN', 'AUS', 'NZL', 'SAF', 'RAJ'];
const DOMS: Effect[] = DOMINIONS.map((t) => JF('entente', t));

/** a far-away state that stays out of the European war unless an event says otherwise */
const CALM = { aggression: 0, neutral: 1 };

function worldNations(): NationDef[] {
  return [
    // dominios y la India británica
    W('AUS', 'Australia', '#d98c3a', ['victoria_au', 'nsw', 'brisbane', 'queensland', 'cape_york', 'mount_isa', 'australia', 'kimberley', 'pilbara', 'perth', 'nullarbor', 'red_centre', 'south_australia', 'darling', 'tasmania', 'port_moresby'], 'english', 'democracy', {
      liege: 'ENG', manpower: 300_000, x: { nu: 90, navy: 1, combat: 1.05, aggression: 0 },
      description: 'Una federación de seis antiguas colonias desde 1901, con su capital provisional en Melbourne. Su joven flota y sus voluntarios del ANZAC zarparán en cuanto Londres entre en guerra.',
      armies: [{ province: 'nsw', units: { infantry: 2 }, name: 'Fuerza Imperial Australiana' }],
    }),
    W('NZL', 'Nueva Zelanda', '#5b8c5a', ['nz_north', 'nz_south'], 'english', 'democracy', { liege: 'ENG', manpower: 100_000, x: { nu: 90, combat: 1.05, aggression: 0 }, armies: [{ province: 'nz_north', units: { infantry: 1 }, name: 'Fuerza Expedicionaria Neozelandesa' }] }),
    W('SAF', 'Unión Sudafricana', '#c8a24a', ['transvaal', 'cape', 'natal', 'eastern_cape', 'northern_cape'], 'english', 'democracy', {
      liege: 'ENG', manpower: 150_000, x: { nu: 70, combat: 0.95, aggression: 0, stock_supplies: 800 },
      description: 'Doce años después de la guerra anglo-bóer, los generales Botha y Smuts gobiernan un dominio donde muchos afrikáners no quieren combatir por Gran Bretaña. El oro del Witwatersrand financia el imperio.',
      armies: [{ province: 'cape', units: { infantry: 2 }, name: 'Fuerza de Defensa de la Unión' }],
    }),
    W('RAJ', 'India británica', '#e0a458', RAJ, 'indian', 'authoritarian', {
      liege: 'ENG', manpower: 600_000, x: { nu: 75, combat: 0.85, aggression: 0, stock_supplies: 1500 },
      description: 'El virreinato de lord Hardinge gobierna desde Delhi, capital desde 1911, a más de 300 millones de personas, incluida Birmania. Su ejército profesional será la reserva del imperio en Francia, Mesopotamia y África oriental.',
      armies: [{ province: 'punjab', units: { infantry: 3, cavalry: 1 }, name: 'Ejército de la India' }, { province: 'mumbai', units: { infantry: 2 }, name: 'Fuerza Expedicionaria D' }],
    }),
    // Asia
    W('JAP', 'Japón', '#c0504d', ['kanto', 'kansai', 'kyushu', 'hokkaido', 'taiwan', 'south_korea', 'pyongyang'], 'japanese', 'authoritarian', {
      manpower: 1_000_000, tech: { naval: 1 }, x: { nu: 90, navy: 8, subs: 1, combat: 1, aggression: 0, stubborn: HARD },
      description: 'La potencia que derrotó a Rusia en 1905 gobierna Corea y Taiwán. La alianza anglo-japonesa de 1902 le ofrece un pretexto para apoderarse de las posesiones alemanas en Asia y el Pacífico.',
      armies: [{ province: 'kyushu', units: { infantry: 3, artillery: 1 }, name: '18.ª División' }, { province: 'kanto', units: { infantry: 2 }, name: 'Guardia Imperial' }],
    }),
    W('CHN', 'República de China', '#d4a017', ['beijing', 'shandong', 'henan', 'shaanxi', 'gansu', 'qinghai', 'xinjiang', 'kashgar', 'inner_mongolia', 'manchuria', 'heilongjiang', 'shanghai', 'wuhan', 'hunan', 'sichuan', 'yunnan', 'guangxi', 'guangdong', 'fujian', 'hainan'], 'chinese', 'authoritarian', {
      manpower: 500_000, x: { nu: 40, navy: 1, combat: 0.55, ...CALM },
      description: 'Dos años después de la caída de los Qing, Yuan Shikai ha disuelto el Parlamento y gobierna como dictador. Las potencias se reparten concesiones y esferas de influencia en las costas.',
    }),
    W('MNG', 'Mongolia', '#4f8fbf', ['mongolia', 'mongolia_west', 'gobi', 'hulunbuir'], 'mongol', 'authoritarian', {
      x: { nu: 50, ...CALM }, description: 'El Bogd Kan proclamó la independencia en 1911 y gobierna desde Urga bajo protección rusa. China no la reconoce; el acuerdo de Kiajta de 1915 la reducirá a una autonomía.',
    }),
    W('TIB', 'Tíbet', '#a0522d', ['tibet', 'ngari'], 'tibetan', 'authoritarian', { x: { nu: 60, ...CALM }, description: 'El decimotercer dalái lama expulsó a las guarniciones chinas y proclamó en 1913 la independencia, que en la conferencia de Simla negocia con británicos y chinos.' }),
    W('NEP', 'Nepal', '#b03060', ['nepal'], 'nepali', 'authoritarian', { x: { nu: 80, ...CALM } }),
    W('BHU', 'Bután', '#e8a33d', ['bhutan'], 'tibetan', 'authoritarian', { x: { nu: 80, ...CALM } }),
    W('AFG', 'Afganistán', '#6b8e23', ['afghanistan'], 'pashtun', 'authoritarian', { x: { nu: 60, ...CALM }, description: 'El emir Habibulá Kan reina sobre un Estado tapón entre la India británica y el Turquestán ruso, con la política exterior en manos de Londres.' }),
    W('SIA', 'Siam', '#7b68ee', ['indochina', 'thai_south'], 'thai', 'authoritarian', { x: { nu: 70, ...CALM }, description: 'El único reino del sudeste asiático que ha conservado su independencia, a costa de ceder territorios a Francia y Gran Bretaña.' }),
    // Arabia
    W('NEJ', 'Nayd y Hasa', '#8fbc8f', ['najd', 'al_hasa', 'rub_al_khali'], 'arabic', 'authoritarian', { x: { nu: 70, ...CALM }, description: 'Abdelaziz ibn Saud ha recuperado Riad y arrebatado al-Hasa a los otomanos en 1913. Busca la protección británica frente a sus rivales del norte.' }),
    W('SHM', 'Yébel Shammar', '#a67b5b', ['hail'], 'arabic', 'authoritarian', { x: { nu: 60, ...CALM } }),
    W('OMA', 'Mascate y Omán', '#c04040', ['oman', 'dhofar'], 'arabic', 'authoritarian', { x: { nu: 50, ...CALM } }),
    // África
    W('ETH', 'Etiopía', '#3c9d4e', ['ethiopia', 'ogaden'], 'ethiopian', 'authoritarian', { manpower: 200_000, x: { nu: 50, ...CALM }, description: 'El imperio que derrotó a Italia en Adua (1896). Tras la muerte de Menelik II gobierna el joven Lij Iyasu, sospechoso de simpatías por el islam y por los otomanos.' }),
    W('LBR', 'Liberia', '#a83250', ['liberia'], 'african', 'authoritarian', { x: { nu: 60, ...CALM } }),
    W('DAR', 'Darfur', '#9c6644', ['darfur'], 'sudanese', 'authoritarian', { x: { nu: 70, ...CALM }, description: 'El sultán Ali Dinar gobierna Darfur con autonomía de hecho respecto del Sudán anglo-egipcio.' }),
    // Europa
    W('LUX', 'Luxemburgo', '#6fa8dc', ['luxembourg'], 'germanic', 'democracy', { x: { nu: 100, ...CALM }, description: 'Un gran ducado neutral y desarmado desde 1867, unido a Alemania por la aduana y el ferrocarril.' }),
    W('MNE', 'Montenegro', '#8e3b46', ['montenegro'], 'slavic', 'authoritarian', { manpower: 50_000, x: { nu: 95, combat: 1, aggression: 0, stock_supplies: 500 }, armies: [{ province: 'montenegro', units: { mountain: 1 } }] }),
    // América
    W('HON', 'Honduras', '#4a90c2', ['honduras'], 'latin', 'authoritarian', { x: CALM }),
    W('SAL', 'El Salvador', '#2f5fa7', ['el_salvador'], 'latin', 'authoritarian', { x: CALM }),
    W('NIC', 'Nicaragua', '#5c7cba', ['nicaragua'], 'latin', 'authoritarian', { x: CALM, description: 'Bajo ocupación de los marines estadounidenses desde 1912.' }),
    W('CRI', 'Costa Rica', '#9fc5e8', ['costa_rica'], 'latin', 'democracy', { x: CALM }),
    W('HTI', 'Haití', '#3d5a99', ['haiti'], 'creole', 'authoritarian', { x: CALM }),
    W('ECU', 'Ecuador', '#e6c229', ['ecuador'], 'latin', 'authoritarian', { x: CALM }),
    W('BOL', 'Bolivia', '#7fb069', ['la_paz', 'santa_cruz'], 'latin', 'authoritarian', { x: CALM }),
    W('CHL', 'Chile', '#d1495b', ['santiago', 'atacama', 'araucania', 'aysen'], 'latin', 'democracy', {
      x: { navy: 2, ...CALM }, description: 'La república parlamentaria vive del salitre de Atacama, del que dependen los explosivos y fertilizantes de medio mundo. El bloqueo británico lo cerrará a Alemania.',
    }),
    W('ARG', 'Argentina', '#74b9e8', ['buenos_aires', 'cordoba', 'tucuman', 'chaco_ar', 'mendoza', 'patagonia', 'santa_cruz_ar', 'tierra_del_fuego'], 'latin', 'democracy', {
      x: { navy: 2, ...CALM }, description: 'El granero y la despensa de Europa: trigo y carne congelada para los Aliados. Una de las economías más ricas del mundo por habitante.',
    }),
    W('PRY', 'Paraguay', '#c0392b', ['paraguay'], 'latin', 'authoritarian', { x: CALM }),
    W('URY', 'Uruguay', '#85c1e9', ['uruguay'], 'latin', 'democracy', { x: CALM }),
  ];
}

// ------------------------------------------------------------------ naciones
function nations(): NationDef[] {
  return [
    W('GER', 'Imperio alemán', '#5d6d7e', ['brandenburg', 'rhineland', 'westfalen', 'hannover', 'hesse', 'saxony', 'mecklenburg', 'pomerania', 'holstein', 'frisia', 'franconia', 'swabia', 'bavaria', 'silesia', 'prussia', 'danzig', 'wielkopolska', ...GER_COLONIES], 'germanic', 'authoritarian', {
      faction: 'central', allies: ['AUH'], manpower: 2_500_000, tech: { infantry: 1, industry: 1, doctrine: 1, naval: 1 },
      x: { nu: 95, navy: 13, subs: 3, fighters: 1, combat: 1.3, stubborn: HARD, aggression: 0.1 },
      description: 'La primera potencia industrial de Europa continental, con el ejército mejor preparado y una flota que desafía a la británica. Su plan de guerra exige vencer a Francia en seis semanas antes de volverse contra Rusia.',
      armies: [
        { province: 'rhineland', units: { infantry: 16, artillery: 4, cavalry: 1 }, name: 'Ala derecha (1.º y 2.º Ejércitos)' },
        { province: 'swabia', units: { infantry: 7, artillery: 2 }, name: '6.º y 7.º Ejércitos' },
        { province: 'prussia', units: { infantry: 6, cavalry: 1, artillery: 1 }, name: '8.º Ejército' },
        { province: 'silesia', units: { infantry: 3 }, name: 'Landwehr de Silesia' },
        { province: 'wielkopolska', units: { infantry: 2 }, name: 'Guarnición de Posen' },
        { province: 'brandenburg', units: { infantry: 3 }, name: 'Landsturm de Berlín' },
        { province: 'holstein', units: { infantry: 2 }, name: 'Defensa de costas del Báltico' },
        { province: 'frisia', units: { infantry: 1 }, name: 'Defensa de costas del mar del Norte' },
      ],
    }),
    W('AUH', 'Austria-Hungría', '#c9b458', ['austria', 'styria', 'tyrol', 'malopolska', 'red_ruthenia', 'bosnia', 'dalmatia', 'slovenia'], 'germanic', 'authoritarian', {
      allies: ['GER'], manpower: 1_300_000, tech: { infantry: 1 }, x: { nu: 90, navy: 4, subs: 1, combat: 0.9, stubborn: HARD, aggression: 0.1, factory: 5, stock_supplies: 3000 },
      description: 'Una monarquía dual de once pueblos bajo el anciano Francisco José. Viena teme que el nacionalismo eslavo que irradia Belgrado acabe desmembrando el imperio.',
      armies: [
        { province: 'malopolska', units: { infantry: 7, cavalry: 2, artillery: 1 }, name: '1.º y 4.º Ejércitos' },
        { province: 'red_ruthenia', units: { infantry: 5, cavalry: 1, artillery: 1 }, name: '3.er Ejército' },
        { province: 'bosnia', units: { infantry: 4, mountain: 1 }, name: '5.º y 6.º Ejércitos' },
        { province: 'austria', units: { infantry: 1 }, name: 'Guarnición de Viena' },
        { province: 'tyrol', units: { mountain: 1 }, name: 'Kaiserjäger' },
      ],
    }),
    W('HUN', 'Reino de Hungría', '#7d9a3c', ['hungary', 'pannonia', 'upper_hungary', 'transylvania', 'croatia'], 'magyar', 'authoritarian', {
      liege: 'AUH', manpower: 500_000, x: { nu: 100, combat: 0.9, stubborn: HARD, aggression: 0, factory: 2, stock_supplies: 1500 },
      description: 'La mitad húngara de la monarquía dual: gobierno, parlamento y ejército territorial (Honvéd) propios bajo la misma corona. En el juego figura como Estado asociado de Austria-Hungría.',
      armies: [{ province: 'croatia', units: { infantry: 2 }, name: '2.º Ejército' }, { province: 'hungary', units: { infantry: 4 }, name: 'Honvéd' }, { province: 'transylvania', units: { infantry: 1 }, name: 'Cuerpo de Transilvania' }],
    }),
    W('CZE', 'Corona de Bohemia', '#5dade2', ['bohemia', 'moravia'], 'slavic', 'authoritarian', {
      liege: 'AUH', manpower: 250_000, x: { nu: 100, combat: 0.85, aggression: 0, stock_supplies: 1000 },
      description: 'Simplificación de juego: las tierras checas no tenían gobierno propio, sino una dieta regional dentro de la mitad austríaca del imperio. Se representan aparte para poder recrear el nacimiento de Checoslovaquia en 1918.',
      armies: [{ province: 'bohemia', units: { infantry: 2 }, name: 'Cuerpos de Praga' }],
    }),
    W('FRA', 'Francia', '#2e86c1', ['ile_de_france', 'picardie', 'normandie', 'bretagne', 'champagne', 'lorraine', 'bourgogne', 'anjou', 'poitou', 'guyenne', 'gascogne', 'toulouse', 'languedoc', 'provence', 'lyonnais', 'auvergne', 'berry', 'dauphine', 'corsica', 'algiers', 'oran', 'tunis', 'fez', 'marrakesh', 'senegal', 'guinea', ...FRA_COLONIES], 'frankish', 'democracy', {
      faction: 'entente', manpower: 1_600_000, tech: { infantry: 1, industry: 1 }, x: { nu: 85, navy: 7, subs: 2, fighters: 1, combat: 0.95, stubborn: HARD, aggression: 0 },
      description: 'La Tercera República vive desde 1871 con la herida de Alsacia-Lorena. Su alianza con Rusia la obliga a combatir en cuanto Alemania mueva ficha; su doctrina confía todo a la ofensiva.',
      armies: [
        { province: 'lorraine', units: { infantry: 7, artillery: 2 }, name: '1.er y 2.º Ejércitos' },
        { province: 'champagne', units: { infantry: 6, cavalry: 1, artillery: 1 }, name: '3.er, 4.º y 5.º Ejércitos' },
        { province: 'ile_de_france', units: { infantry: 2 }, name: 'Gobierno militar de París' },
        { province: 'algiers', units: { infantry: 2 }, name: 'XIX Cuerpo de África' },
      ],
    }),
    W('ENG', 'Reino Unido', '#c0392b', ['london', 'wessex', 'cornwall', 'midlands', 'east_anglia', 'york', 'northumbria', 'wales', 'lowlands', 'highlands', 'ulster', 'leinster', 'munster', 'connacht', 'cyprus', 'gold_coast', 'newfoundland', ...ENG_COLONIES], 'english', 'democracy', {
      manpower: 1_000_000, tech: { naval: 2, industry: 1 }, x: { nu: 85, navy: 20, subs: 3, fighters: 1, combat: 1.05, stubborn: HARD, aggression: 0 },
      description: 'Dueño de los mares y de un imperio mundial, con un ejército profesional pequeño. Su entendimiento con Francia y Rusia no es una alianza formal: Londres aún no ha decidido si combatirá.',
      armies: [{ province: 'london', units: { infantry: 2 }, name: 'Fuerza Territorial' }],
    }),
    W('EGY', 'Egipto', '#d4ac0d', ['cairo', 'alexandria', 'sinai', 'upper_egypt', 'western_desert'], 'arabic', 'authoritarian', { liege: 'ENG', x: { nu: 100, aggression: 0, stock_supplies: 1500 }, armies: [{ province: 'cairo', units: { infantry: 3 }, name: 'Guarnición del canal' }] }),
    W('CAN', 'Canadá', '#cd6155', ['ontario', 'new_france', ...CAN_WORLD], 'english', 'democracy', { liege: 'ENG', x: { nu: 90, aggression: 0 }, armies: [{ province: 'new_france', units: { infantry: 1 }, name: 'Cuerpo Expedicionario Canadiense' }] }),
    W('RUS', 'Imperio ruso', '#3d7a3d', ['ingria', 'moscow', 'novgorod', 'pskov', 'tver', 'smolensk', 'ryazan', 'vladimir', 'yaroslavl', 'vologda', 'archangelsk', 'nizhny', 'kazan', 'samara', 'ural', 'kiev', 'chernigov', 'kursk', 'voronezh', 'poltava', 'podolia', 'volhynia', 'zaporozhye', 'crimea', 'don', 'kuban', 'tsaritsyn', 'astrakhan', 'belarus', 'lithuania', 'courland', 'livonia', 'estonia', 'mazovia', 'finland', 'osterbotten', 'karelia', 'georgia', 'azerbaijan', ...RUS_WORLD], 'slavic', 'authoritarian', {
      manpower: 3_500_000, x: { nu: 75, navy: 4, subs: 1, combat: 0.75, stubborn: HARD, aggression: 0.1 },
      description: 'El «rodillo ruso»: millones de reclutas, pocas fábricas y un Estado autocrático que se presenta como protector de los eslavos de los Balcanes.',
      armies: [
        { province: 'lithuania', units: { infantry: 5, cavalry: 2 }, name: '1.er Ejército' },
        { province: 'mazovia', units: { infantry: 5, cavalry: 1, artillery: 1 }, name: '2.º Ejército' },
        { province: 'volhynia', units: { infantry: 6, cavalry: 2, artillery: 1 }, name: 'Frente Suroccidental' },
        { province: 'podolia', units: { infantry: 3, cavalry: 1 }, name: '8.º Ejército' },
        { province: 'ingria', units: { infantry: 2 }, name: 'Guardia Imperial' },
        { province: 'georgia', units: { infantry: 3 }, name: 'Ejército del Cáucaso' },
      ],
    }),
    W('ITA', 'Italia', '#27ae60', ['roma', 'piemonte', 'lombardia', 'venezia', 'genova', 'toscana', 'romagna', 'abruzzo', 'napoli', 'puglia', 'calabria', 'sicilia', 'sardegna', 'tripoli', 'cyrenaica', ...ITA_COLONIES], 'latin', 'democracy', {
      manpower: 1_000_000, x: { nu: 70, navy: 6, subs: 1, combat: 0.85, stubborn: HARD, aggression: 0 },
      description: 'Miembro formal de la Triple Alianza, pero con reivindicaciones sobre el Trentino y Trieste que la enfrentan a Viena. Su neutralidad está en venta.',
      armies: [{ province: 'venezia', units: { infantry: 6, mountain: 2, artillery: 1 }, name: '2.º y 3.er Ejércitos' }, { province: 'lombardia', units: { mountain: 1 }, name: 'Alpini' }, { province: 'tripoli', units: { infantry: 2 }, name: 'Cuerpo de ocupación de Libia' }],
    }),
    W('SER', 'Serbia', '#9b2d30', ['serbia', 'macedonia', 'kosovo'], 'slavic', 'authoritarian', {
      manpower: 400_000, x: { nu: 95, combat: 1, stubborn: HARD, aggression: 0, factory: 1, stock_supplies: 2500 },
      description: 'Un reino pequeño y aguerrido, veterano de dos guerras balcánicas, que aspira a reunir a los eslavos del sur bajo la dinastía Karađorđević.',
      armies: [{ province: 'serbia', units: { infantry: 5, mountain: 1, artillery: 1 }, name: 'Ejército serbio (Putnik)' }, { province: 'macedonia', units: { infantry: 2 }, name: 'Tropas de Macedonia' }],
    }),
    W('OTT', 'Imperio otomano', '#117864', ['constantinople', 'thrace', 'bithynia', 'aydin', 'ankara', 'konya', 'trebizond', 'sivas', 'cilicia', 'armenia', 'antioch', 'aleppo', 'damascus', 'acre', 'jerusalem', 'mosul', 'baghdad', 'basra', ...OTT_WORLD], 'turkic', 'authoritarian', {
      manpower: 800_000, x: { nu: 85, navy: 1, combat: 0.85, stubborn: HARD, aggression: 0, factory: 4, stock_supplies: 2500 },
      description: 'El «enfermo de Europa» ha perdido casi todos sus Balcanes en 1912-1913. El triunvirato de los Jóvenes Turcos busca un aliado poderoso para sobrevivir.',
      armies: [
        { province: 'thrace', units: { infantry: 3 }, name: '1.er Ejército' }, { province: 'constantinople', units: { infantry: 2, artillery: 1 }, name: 'Defensa de los Estrechos' },
        { province: 'armenia', units: { infantry: 4 }, name: '3.er Ejército' }, { province: 'damascus', units: { infantry: 2 }, name: '4.º Ejército' }, { province: 'baghdad', units: { infantry: 1 }, name: '6.º Ejército' },
      ],
    }),
    W('BUL', 'Bulgaria', '#1e8449', ['bulgaria'], 'slavic', 'authoritarian', { manpower: 400_000, claims: ['macedonia', 'dobruja'], x: { nu: 85, combat: 0.95, aggression: 0, factory: 2, stock_supplies: 1500 }, armies: [{ province: 'bulgaria', units: { infantry: 5 } }] }),
    W('ROM', 'Rumanía', '#f7dc6f', ['wallachia', 'moldavia', 'dobruja'], 'latin', 'authoritarian', { manpower: 500_000, x: { nu: 80, combat: 0.8, aggression: 0, factory: 2, stock_supplies: 1500 }, armies: [{ province: 'wallachia', units: { infantry: 5, cavalry: 1 } }, { province: 'moldavia', units: { infantry: 2 } }] }),
    W('GRE', 'Grecia', '#85c1e9', ['thessaly', 'morea', 'crete', 'salonica'], 'greek', 'authoritarian', { manpower: 300_000, x: { nu: 80, navy: 1, aggression: 0, factory: 1, stock_supplies: 1000 }, armies: [{ province: 'thessaly', units: { infantry: 3, mountain: 1 } }] }),
    W('ALB', 'Albania', '#922b21', ['albania'], 'latin', 'authoritarian', { x: { nu: 40, aggression: 0, neutral: 1 } }),
    W('BEL', 'Bélgica', '#f4d03f', ['brabant', 'flandre', 'kongo', ...BEL_COLONIES], 'frankish', 'democracy', {
      manpower: 300_000, x: { nu: 100, combat: 1, stubborn: HARD, aggression: 0, stock_supplies: 2000 },
      description: 'Neutral por un tratado de 1839 que garantizan, entre otros, Prusia y Gran Bretaña. Sus fortalezas de Lieja y Amberes cierran el camino más corto entre Alemania y París.',
      armies: [{ province: 'brabant', units: { infantry: 3, artillery: 1 }, name: 'Ejército de campaña' }, { province: 'flandre', units: { infantry: 1 }, name: 'Posición fortificada de Amberes' }],
    }),
    W('HOL', 'Países Bajos', '#e59866', ['holland', ...HOL_COLONIES], 'germanic', 'democracy', { x: { nu: 90, navy: 2, neutral: 1, aggression: 0 }, armies: [{ province: 'holland', units: { infantry: 2 } }] }),
    W('SWI', 'Suiza', '#e74c3c', ['switzerland'], 'germanic', 'democracy', { x: { nu: 100, neutral: 1, aggression: 0 }, armies: [{ province: 'switzerland', units: { mountain: 3 } }] }),
    W('SPA', 'España', '#e67e22', ['castilla_nueva', 'castilla_vieja', 'galicia', 'asturias', 'leon', 'navarra', 'aragon', 'cataluna', 'valencia', 'murcia', 'andalucia', 'granada', 'extremadura', 'baleares', 'canarias', 'tangier', ...SPA_COLONIES], 'latin', 'authoritarian', {
      manpower: 400_000, x: { nu: 70, navy: 2, neutral: 1, aggression: 0 },
      description: 'La monarquía de Alfonso XIII proclama su neutralidad. La guerra traerá pedidos a la industria y la minería, inflación y una fuerte conflictividad social.',
      armies: [{ province: 'tangier', units: { infantry: 3 }, name: 'Ejército de África' }, { province: 'castilla_nueva', units: { infantry: 2 } }],
    }),
    W('POR', 'Portugal', '#16a085', ['lisboa', 'porto', 'algarve', 'azores', 'cape_verde', ...POR_COLONIES], 'latin', 'democracy', { x: { nu: 75, navy: 1, aggression: 0 }, armies: [{ province: 'lisboa', units: { infantry: 2 }, name: 'Cuerpo Expedicionario Portugués' }] }),
    W('DEN', 'Dinamarca', '#e74c3c', ['sjaelland', 'jylland', 'iceland', ...DEN_COLONIES], 'norse', 'democracy', { x: { neutral: 1, aggression: 0 } }),
    W('SWE', 'Suecia', '#2471a3', ['svealand', 'gotaland', 'norrland', 'skane'], 'norse', 'democracy', { x: { navy: 2, neutral: 1, aggression: 0 }, armies: [{ province: 'svealand', units: { infantry: 2 } }] }),
    W('NOR', 'Noruega', '#a93226', ['oslo', 'bergen', 'trondelag', 'nordland', 'finnmark', 'svalbard'], 'norse', 'democracy', { x: { neutral: 1, aggression: 0 } }),
    W('USA', 'Estados Unidos', '#1f618d', ['virginia', 'new_england', 'carolina', 'florida', ...USA_WORLD], 'english', 'democracy', {
      manpower: 2_500_000, tech: { industry: 2, naval: 1 }, x: { nu: 90, navy: 10, neutral: 1, aggression: 0 },
      description: 'La mayor economía del mundo, con un ejército diminuto y una opinión pública que no quiere saber nada de las guerras europeas.',
      armies: [{ province: 'new_england', units: { infantry: 2 } }],
    }),
    W('MEX', 'México', '#196f3d', ['mexico', 'veracruz', 'yucatan', 'monterrey', 'chihuahua', 'sonora', 'baja_california', 'baja_sur', 'jalisco', 'chiapas'], 'latin', 'authoritarian', { x: { aggression: 0, neutral: 1 } }),
    W('GUA', 'Guatemala', '#5dade2', ['guatemala'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('CUB', 'Cuba', '#2e86c1', ['cuba'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('HAI', 'República Dominicana', '#922b21', ['hispaniola'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('PAN', 'Panamá', '#f0b27a', ['panama'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('COL', 'Colombia', '#f4d03f', ['new_granada', 'caribe_col', 'llanos', 'amazonia_col'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('VNZ', 'Venezuela', '#b03a2e', ['venezuela', 'zulia', 'guayana_ve'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('PRU', 'Perú', '#e74c3c', ['peru', 'peru_north', 'loreto', 'peru_south'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('BRA', 'Brasil', '#27ae60', ['rio', 'bahia', 'pernambuco', ...BRA_WORLD], 'latin', 'democracy', { x: { aggression: 0, navy: 1 } }),
    W('PER', 'Persia', '#45b39d', ['tehran', 'tabriz', 'khorasan', 'isfahan', 'khuzestan', 'fars', 'hormozgan', 'sistan'], 'persian', 'authoritarian', { x: { aggression: 0, neutral: 1 } }),
    ...worldNations(),
  ].map((n) => ({ ...n, x: { ...(n.x ?? {}) } }));
}

// ------------------------------------------------------------------ la crisis de julio (cadena con fechas exactas)
const CRISIS: GameEvent[] = [
  E({ id: 'w14_sarajevo', tag: 'AUH', date: '1914-06-28', image: 'court', title: 'Los disparos de Sarajevo',
    text: 'El archiduque Francisco Fernando y su esposa, Sofía, han sido asesinados en Sarajevo por un joven nacionalista bosnio. Los conspiradores se armaron en Belgrado con ayuda de oficiales serbios. En Viena, el jefe del Estado Mayor reclama una guerra que ponga fin de una vez al problema serbio.',
    note: 'Gavrilo Princip, miembro de la Joven Bosnia, disparó el 28 de junio de 1914. La red que le proporcionó armas estaba vinculada a la sociedad secreta serbia Mano Negra; la implicación del gobierno de Belgrado sigue siendo objeto de debate.',
    options: [
      opt('Consultar a Berlín antes de castigar a Serbia', [FL('sarajevo'), REL('SER', -60), TR('w14_blank_check', 4, 'GER'), CH('Viena envía al conde Hoyos a Berlín para sondear el apoyo alemán.')], 1, 'Abre la crisis de julio.'),
      opt('Exigir una investigación y evitar la guerra', [REL('SER', -20), PR(-20), DIS(3), CH('Viena se limita a exigir a Belgrado que persiga a los conspiradores.')], 0, 'Puede evitar la guerra general, a costa del prestigio de la monarquía.'),
    ] }),
  T({ id: 'w14_blank_check', tag: 'GER', image: 'court', title: 'El cheque en blanco',
    text: 'El enviado austríaco trae una carta de Francisco José. El káiser y el canciller Bethmann-Hollweg deben decidir si respaldan sin condiciones una acción contra Serbia, aun a riesgo de que Rusia intervenga.',
    note: 'El 5 y 6 de julio de 1914 Guillermo II y Bethmann-Hollweg aseguraron a Viena el apoyo alemán, confiando en que la guerra quedaría localizada en los Balcanes.',
    options: [
      opt('Apoyo incondicional: que Viena actúe deprisa', [REL('AUH', 40), FL('blank_check'), TR('w14_ultimatum', 18, 'AUH'), CH('Berlín garantiza a Viena su apoyo incondicional contra Serbia.')], 1),
      opt('Aconsejar moderación', [REL('AUH', -30), PR(-10), TR('w14_ultimatum', 18, 'AUH')], 0, 'Viena decidirá igualmente, pero sin la confianza de su aliado.'),
    ] }),
  T({ id: 'w14_ultimatum', tag: 'AUH', image: 'court', title: 'El ultimátum a Serbia',
    text: 'El ministro Berchtold ha redactado una nota de diez puntos con 48 horas de plazo. Exige, entre otras cosas, que funcionarios austríacos participen en la investigación en suelo serbio: una condición que ningún Estado soberano aceptaría de buen grado.',
    options: [
      opt('Entregar el ultimátum', [FL('ultimatum'), REL('SER', -50), REL('RUS', -30), TR('w14_serbian_reply', 2, 'SER'), CH('Austria-Hungría entrega a Serbia un ultimátum de 48 horas.')], 1),
      opt('Suavizar las exigencias', [PR(-25), REL('SER', 20), CH('Viena rebaja sus exigencias y la crisis se enfría.')], 0, 'Probablemente evita la guerra.'),
    ] }),
  T({ id: 'w14_serbian_reply', tag: 'SER', image: 'court', title: 'La respuesta serbia',
    text: 'El gobierno de Pašić tiene 48 horas. San Petersburgo aconseja prudencia, pero deja entrever su respaldo. Aceptar todos los puntos supondría renunciar a la soberanía; rechazar alguno puede significar la guerra.',
    note: 'La respuesta del 25 de julio aceptó casi todos los puntos, salvo la participación austríaca en la investigación. El káiser la consideró satisfactoria, pero Viena rompió relaciones ese mismo día.',
    options: [
      opt('Aceptar casi todo, salvo la injerencia en la justicia serbia', [PR(10), NU(5), TR('w14_aus_dow', 3, 'AUH'), CH('Serbia responde con habilidad al ultimátum, pero rechaza la investigación austríaca en su territorio.')], 1),
      opt('Aceptar íntegramente el ultimátum', [PR(-40), NU(-10), DIS(10), REL('AUH', 40), CH('Serbia acepta íntegramente las exigencias de Viena.')], 0, 'Humillante, pero desarma a los partidarios de la guerra.'),
    ] }),
  T({ id: 'w14_aus_dow', tag: 'AUH', image: 'war', title: 'Guerra a Serbia', condition: [exists('SER')],
    text: 'Belgrado no ha aceptado todas las condiciones. Los cañones del Danubio esperan la orden de bombardear la capital serbia.',
    options: [
      opt('Declarar la guerra a Serbia', [DW('SER', 'serbia'), TR('w14_rus_mob', 2, 'RUS'), CH('Austria-Hungría declara la guerra a Serbia. Los monitores del Danubio bombardean Belgrado.')], 1),
      opt('Aceptar la mediación de las potencias', [PR(-30), DIS(5), CH('Viena acepta una conferencia de embajadores en Londres.')], 0),
    ] }),
  T({ id: 'w14_rus_mob', tag: 'RUS', image: 'war', title: 'La movilización rusa', condition: [war('SER', 'AUH')],
    text: 'Austria bombardea Belgrado. Los generales advierten que una movilización parcial contra Austria es técnicamente imposible: los planes ferroviarios solo prevén movilizarlo todo, también frente a Alemania.',
    note: 'El zar Nicolás II firmó la orden de movilización general el 30 de julio, tras dudar y revocar una primera orden. Para Berlín equivalía a una declaración de guerra.',
    options: [
      opt('Movilización general', [{ type: 'alliance', other: 'SER' }, FL('rus_mob'), MP(400000), DIS(3), TR('w14_ger_ultimatum', 1, 'GER'), CH('Rusia decreta la movilización general en apoyo de Serbia.')], 1),
      opt('Abandonar a Serbia a su suerte', [PR(-60), NU(-10), DIS(10), REL('SER', -100)], 0, 'Evita la guerra europea, pero el zar pierde la confianza de los eslavos y de sus propios generales.'),
    ] }),
  T({ id: 'w14_ger_ultimatum', tag: 'GER', image: 'court', title: 'Ultimátum a San Petersburgo y a París', condition: [flag('rus_mob', 'RUS')],
    text: 'Rusia moviliza. El plan de guerra no admite esperas: cada día que pasa los ejércitos rusos se acercan a la frontera. Moltke exige actuar ya; Bethmann aún sueña con la neutralidad británica.',
    options: [
      opt('Exigir a Rusia que desmovilice en doce horas', [FL('ger_ultimatum'), TR('w14_ger_dow_rus', 1, 'GER')], 1),
      opt('Aceptar la propuesta británica de mediación', [PR(-30), REL('ENG', 40), DIS(5), CH('Berlín acepta mediar entre Viena y San Petersburgo.')], 0, 'La guerra con Serbia continuaría, pero quizá sin incendio general.'),
    ] }),
  T({ id: 'w14_ger_dow_rus', tag: 'GER', image: 'war', title: 'Guerra a Rusia', condition: [exists('RUS')],
    text: 'San Petersburgo no ha respondido al ultimátum. El embajador Pourtalès entrega la declaración de guerra con lágrimas en los ojos.',
    options: [
      opt('Declarar la guerra a Rusia', [DW('RUS', 'mazovia'), TR('w14_franco_russe', 1, 'RUS'), TR('w14_schlieffen', 1, 'GER'), TR('w14_aus_joins', 5, 'AUH'), CH('Alemania declara la guerra a Rusia.')], 1),
    ] }),
  T({ id: 'w14_franco_russe', tag: 'RUS', image: 'peace', title: 'La alianza franco-rusa',
    text: 'París confirma que cumplirá la alianza de 1894. Francia movilizará contra Alemania.',
    options: [opt('Coordinar la ofensiva con el Estado Mayor francés', [JF('entente'), REL('FRA', 30), CH('Rusia y Francia activan su alianza militar.')], 1)] }),
  T({ id: 'w14_schlieffen', tag: 'GER', image: 'war', title: 'El plan Schlieffen',
    text: 'El plan exige derrotar a Francia en seis semanas antes de que Rusia complete su movilización. Para envolver al ejército francés, el ala derecha debe atravesar Bélgica, cuya neutralidad garantizó Prusia en 1839.',
    note: 'El plan, concebido por Alfred von Schlieffen y modificado por Helmuth von Moltke el Joven, subestimaba la velocidad de la movilización rusa y la reacción británica ante la invasión de Bélgica.',
    options: [
      opt('Ultimátum a Bélgica y guerra a Francia', [FL('schlieffen'), TR('w14_ger_dow_fra', 1, 'GER'), TR('w14_bel_ultimatum', 1, 'BEL')], 1, 'El camino más corto a París, a riesgo de provocar a Londres.'),
      opt('Respetar Bélgica: guerra a Francia por la frontera común', [TR('w14_ger_dow_fra', 1, 'GER'), CH('Alemania renuncia a atravesar Bélgica.')], 0, 'Un frente estrecho y fortificado, pero el Reino Unido quizá se quede al margen.'),
    ] }),
  T({ id: 'w14_ger_dow_fra', tag: 'GER', image: 'war', title: 'Guerra a Francia', condition: [exists('FRA')],
    text: 'Francia ha movilizado y no garantiza su neutralidad. El pretexto oficial es un supuesto bombardeo aéreo francés sobre Núremberg.',
    options: [opt('Declarar la guerra a Francia', [DW('FRA', 'champagne'), TR('w14_ser_entente', 3, 'SER'), CH('Alemania declara la guerra a Francia.')], 1)] }),
  T({ id: 'w14_bel_ultimatum', tag: 'BEL', image: 'court', title: 'El ultimátum alemán',
    text: 'Berlín exige paso libre para sus ejércitos en doce horas y promete respetar la integridad del país. El rey Alberto reúne al Consejo de la Corona.',
    note: 'La respuesta belga, del 3 de agosto de 1914, fue tajante: aceptar habría sido sacrificar el honor de la nación.',
    options: [
      opt('Rechazar: Bélgica es una nación, no un camino', [FL('bel_refused'), NU(10), TR('w14_ger_dow_bel', 1, 'GER'), CH('Bélgica rechaza el ultimátum alemán.')], 1),
      opt('Ceder bajo protesta', [PR(-50), NU(-20), CH('Bélgica protesta, pero no opone resistencia.')], 0, 'En el juego, sin guerra no hay paso: Alemania tendría que atacar por Lorena.'),
    ] }),
  T({ id: 'w14_ger_dow_bel', tag: 'GER', image: 'war', title: 'La invasión de Bélgica', condition: [exists('BEL')],
    text: 'Bruselas ha rechazado el ultimátum. Los cañones de asedio de 420 milímetros ya viajan hacia Lieja.',
    note: 'Durante el avance de agosto de 1914 las tropas alemanas fusilaron a unos 6 500 civiles belgas y franceses, e incendiaron la biblioteca universitaria de Lovaina. Aquellos hechos marcaron la imagen de Alemania durante toda la guerra.',
    options: [opt('Cruzar la frontera belga', [DW('BEL', 'brabant'), TR('w14_eng_decision', 1, 'ENG'), TR('w14_bel_resists', 1, 'BEL'), CH('El ejército alemán entra en Bélgica.')], 1)] }),
  T({ id: 'w14_eng_decision', tag: 'ENG', image: 'court', title: 'Un pedazo de papel', condition: [war('BEL', 'GER')],
    text: 'Alemania ha invadido Bélgica. El ministro Grey sostiene que el país no puede quedarse mirando; en el gabinete hay quien amenaza con dimitir. Bethmann-Hollweg habla con desdén del tratado de 1839 como de «un pedazo de papel».',
    options: [
      opt('Ultimátum y guerra a Alemania', [JF('entente'), ...DOMS, SPAWN('ENG', 'picardie', { infantry: 4, cavalry: 1 }), NU(5), FL('eng_war'), CH('El Reino Unido declara la guerra a Alemania. Los dominios le siguen.')], 1),
      opt('Neutralidad', [PR(-40), REL('FRA', -60), REL('BEL', -60)], 0, 'Conserva la flota intacta, pero Europa quedaría a merced de Berlín.'),
    ] }),
  T({ id: 'w14_bel_resists', tag: 'BEL', image: 'war', title: 'Lieja resiste', condition: [war('GER')],
    text: 'Los fuertes de Lieja detienen al ejército alemán varios días. El rey Alberto pide ayuda a los garantes de la neutralidad belga.',
    options: [opt('Unirse a la Entente', [JF('entente'), NU(5), CH('Bélgica combate junto a la Entente.')], 1)] }),
  T({ id: 'w14_aus_joins', tag: 'AUH', image: 'war', title: 'Guerra a Rusia', condition: [war('RUS', 'GER')],
    text: 'Viena había confiado en una guerra local contra Serbia. Ahora debe declarar la guerra a Rusia y desplazar al grueso de su ejército hacia Galitzia.',
    note: 'Conrad von Hötzendorf envió primero el 2.º Ejército contra Serbia y luego tuvo que devolverlo a Galitzia: perdió en el tren unas semanas decisivas.',
    options: [opt('Sellar la alianza de las Potencias Centrales', [JF('central'), JF('central', 'HUN'), JF('central', 'CZE'), CH('Austria-Hungría declara la guerra a Rusia.')], 1)] }),
  T({ id: 'w14_ser_entente', tag: 'SER', image: 'peace', title: 'Serbia y la Entente', condition: [war('AUH')],
    text: 'La guerra ya es europea. Belgrado coordina sus planes con París y San Petersburgo.',
    options: [opt('Combatir junto a la Entente', [JF('entente'), NU(5)], 1)] }),
  E({ id: 'w14_eng_fallback', tag: 'ENG', date: '1914-09-01', image: 'court', title: 'Francia lucha sola', condition: [atWar(false), war('FRA', 'GER'), until(1915)],
    text: 'Alemania y Francia están en guerra sin que se haya violado la neutralidad belga. En Londres crece el temor a una Europa dominada por Berlín.',
    options: [
      opt('Entrar en la guerra junto a Francia', [JF('entente'), ...DOMS, SPAWN('ENG', 'picardie', { infantry: 4, cavalry: 1 }), CH('El Reino Unido entra en la guerra.')], 6),
      opt('Mantener la neutralidad', [IC(2), REL('FRA', -40)], 4, 'La industria británica vendería a ambos bandos.'),
    ] }),
  E({ id: 'w14_ita_neutral', tag: 'ITA', date: '1914-08-01', image: 'court', title: 'La neutralidad italiana',
    text: 'Viena no consultó a Roma antes de atacar a Serbia. La Triple Alianza es defensiva y el gobierno de Salandra puede declararse neutral, a la espera de la mejor oferta.',
    options: [
      opt('Declarar la neutralidad', [FL('ita_neutral'), REL('AUH', -20), CH('Italia se declara neutral.')], 1),
      opt('Cumplir la Triple Alianza', [JF('central'), REL('FRA', -100), DIS(15)], 0, 'Impopular: la opinión pública es antiaustríaca.'),
    ] }),
];

// ------------------------------------------------------------------ 1914–1918: la guerra
const WAR: GameEvent[] = [
  // --- 1914
  E({ id: 'w14_tannenberg', tag: 'GER', date: '1914-08-20', image: 'war', title: 'Tannenberg', condition: [war('RUS')],
    text: 'Dos ejércitos rusos avanzan sobre Prusia Oriental sin coordinarse. Sus órdenes se transmiten por radio sin cifrar. El general Prittwitz propone retirarse tras el Vístula.',
    note: 'Entre el 26 y el 30 de agosto de 1914, Hindenburg y Ludendorff cercaron al 2.º Ejército ruso. El general Samsonov se quitó la vida; unos 90 000 rusos cayeron prisioneros.',
    options: [
      opt('Hindenburg y Ludendorff: cercar al 2.º Ejército', [CMB(0.05), PR(30), NU(5), MP(-150000, 'RUS'), TR('w14_tannenberg_rus', 2, 'RUS'), CH('Victoria alemana en Tannenberg.')], 1),
      opt('Retirarse tras el Vístula', [PR(-20), NU(-5)], 0),
    ] }),
  T({ id: 'w14_tannenberg_rus', tag: 'RUS', image: 'disaster', title: 'El desastre de Samsonov',
    text: 'El 2.º Ejército ha sido destruido en los bosques de Prusia Oriental. La ofensiva que debía aliviar a Francia termina en catástrofe.',
    options: [
      opt('Destituir a los generales responsables', [DIS(3), NU(-3)], 6),
      opt('Insistir en la ofensiva para salvar a París', [MP(-80000), REL('FRA', 30), PR(10)], 4, 'Francia lo agradecerá.'),
    ] }),
  E({ id: 'w14_lemberg', tag: 'RUS', date: '1914-09-01', image: 'war', title: 'La batalla de Galitzia', condition: [war('AUH')],
    text: 'En el sur, el ejército austríaco se ha lanzado a la ofensiva y se ha desangrado. Lemberg está al alcance del Frente Suroccidental.',
    options: [
      opt('Explotar la victoria y asediar Przemyśl', [PR(30), NU(5), MP(-250000, 'AUH'), DIS(5, 'AUH'), CH('Los rusos toman Lemberg; el ejército austro-húngaro pierde a buena parte de sus oficiales de carrera.')], 1),
      opt('Consolidar el frente', [CMB(0.03)], 0),
    ] }),
  E({ id: 'w14_marne', tag: 'FRA', date: '1914-09-01', image: 'war', title: 'El milagro del Marne', condition: [war('GER')],
    text: 'Los alemanes están a cuarenta kilómetros de París y el gobierno se ha trasladado a Burdeos. El general Gallieni ha descubierto que el ala derecha alemana ofrece su flanco al este de la capital.',
    note: 'Entre el 5 y el 12 de septiembre de 1914, los ejércitos francés y británico detuvieron el avance alemán. La leyenda recuerda a los taxis parisinos que llevaron refuerzos al frente, aunque su peso militar fue modesto.',
    options: [
      opt('Contraatacar en el Marne', [CMB(0.05), NU(10), MP(-150000), MP(-150000, 'GER'), TR('w14_marne_ger', 3, 'GER'), CH('Joffre detiene la invasión en el Marne.')], 1),
      opt('Retroceder y defender París desde sus fuertes', [NU(-5), DIS(5)], 0),
    ] }),
  T({ id: 'w14_marne_ger', tag: 'GER', image: 'war', title: 'Retirada al Aisne',
    text: 'Entre los ejércitos de Kluck y Bülow se ha abierto una brecha. El emisario de Moltke, el teniente coronel Hentsch, recomienda retroceder.',
    options: [
      opt('Retirarse y atrincherarse en el Aisne', [NU(-5), PR(-20), CH('El ejército alemán se retira al Aisne y cava trincheras. La guerra de movimientos termina.')], 1, 'Moltke será sustituido por Falkenhayn.'),
      opt('Mantener la presión cueste lo que cueste', [MP(-150000), DIS(4)], 0),
    ] }),
  E({ id: 'w14_race_sea', tag: 'GER', date: '1914-10-01', image: 'war', title: 'La carrera hacia el mar', condition: [war('FRA')],
    text: 'Cada ejército intenta rebasar el flanco del otro hacia el norte. Falkenhayn quiere una última ofensiva en Flandes antes del invierno, con cuerpos de reservistas recién formados.',
    note: 'En la primera batalla de Ypres (octubre-noviembre de 1914) murieron miles de jóvenes voluntarios alemanes, el episodio que la propaganda llamó «la matanza de los inocentes» de Langemarck.',
    options: [
      opt('Ofensiva en Ypres', [MP(-120000), MP(-60000, 'ENG'), PR(5)], 1),
      opt('Atrincherarse y mirar al este', [CMB(0.02), REL('AUH', 20)], 1),
    ] }),
  E({ id: 'w14_christmas', date: '1914-12-01', image: 'peace', title: 'La tregua de Navidad', condition: [atWar(), until(1914)],
    text: 'Se acerca la Navidad. En algunos sectores del frente los soldados cantan villancicos de trinchera a trinchera y hablan de un alto el fuego.',
    note: 'En la Nochebuena de 1914 hubo treguas espontáneas en varios sectores del frente occidental, con intercambio de regalos y entierro de muertos. Los mandos las prohibieron en años posteriores.',
    options: [
      opt('Tolerar la tregua', [DIS(-3), CMB(-0.01)], 5, 'Un respiro humano; los generales lo desaprueban.'),
      opt('Prohibir la confraternización', [DIS(2)], 5),
    ] }),
  E({ id: 'w14_ott_alliance', tag: 'OTT', date: '1914-08-02', image: 'court', title: 'El tratado secreto con Berlín', condition: [exists('GER')],
    text: 'Enver Pachá ha firmado en secreto una alianza con Alemania. En el Mediterráneo, los cruceros alemanes Goeben y Breslau huyen de la flota británica y piden refugio en los Dardanelos; Londres acaba de requisar dos acorazados que Estambul había pagado por suscripción popular.',
    options: [
      opt('Acoger los cruceros e integrarlos en nuestra flota', [FL('ott_alliance'), X('navy', 1), REL('GER', 50), REL('ENG', -40), CH('El Goeben y el Breslau izan la bandera otomana.')], 8),
      opt('Mantener una neutralidad real', [REL('ENG', 20), REL('GER', -30)], 2, 'Los Estrechos seguirían abiertos a Rusia.'),
    ] }),
  E({ id: 'w14_ott_war', tag: 'OTT', date: '1914-10-29', image: 'war', title: 'La flota bombardea Odesa', condition: [flag('ott_alliance'), war('RUS', 'GER')],
    text: 'Con el consentimiento de Enver, el almirante Souchon ha zarpado con el Goeben hacia el mar Negro para bombardear los puertos rusos. El gran visir aún cree posible evitar la guerra.',
    options: [
      opt('Entrar en la guerra junto a las Potencias Centrales', [JF('central'), PR(10), TR('w14_egypt', 20, 'ENG'), CH('El Imperio otomano entra en la guerra. El sultán proclama la yihad contra la Entente.')], 9),
      opt('Disculparse ante San Petersburgo', [REL('GER', -60), PR(-20)], 1),
    ] }),
  T({ id: 'w14_egypt', tag: 'ENG', image: 'war', title: 'El protectorado sobre Egipto', condition: [war('OTT')],
    text: 'Egipto sigue siendo nominalmente otomano. El canal de Suez, arteria del imperio, queda expuesto. En el golfo Pérsico, una fuerza india podría asegurar Basora y las refinerías de Abadán.',
    options: [
      opt('Proclamar el protectorado y desembarcar en Basora', [JF('entente', 'EGY'), SPAWN('ENG', 'sinai', { infantry: 3 }), SPAWN('ENG', 'basra', { infantry: 2 }), CLAIM(['basra', 'baghdad', 'jerusalem']), CH('Londres proclama el protectorado sobre Egipto y desembarca tropas indias en el golfo Pérsico.')], 1),
      opt('Defender solo el canal', [JF('entente', 'EGY'), SPAWN('ENG', 'sinai', { infantry: 4 })], 0),
    ] }),
  E({ id: 'w14_sarikamis', tag: 'OTT', date: '1914-12-01', image: 'disaster', title: 'Sarıkamış', condition: [war('RUS')],
    text: 'Enver quiere envolver al ejército ruso del Cáucaso en pleno invierno, a través de puertos de montaña a más de 2 500 metros, con tropas sin ropa de abrigo.',
    note: 'La ofensiva de Sarıkamış (diciembre de 1914-enero de 1915) costó al 3.er Ejército otomano la mayor parte de sus efectivos, muchos por congelación. En 1915 las autoridades otomanas deportaron a la población armenia de Anatolia; cientos de miles de personas murieron en matanzas y marchas forzadas, hechos que la mayoría de los historiadores califica de genocidio.',
    options: [
      opt('Lanzar la ofensiva de invierno', [MP(-70000), PR(-20), NU(-5), CH('El 3.er Ejército otomano se pierde en las nieves de Sarıkamış.')], 7, 'Lo que ocurrió.'),
      opt('Esperar a la primavera y fortificar Erzurum', [CMB(0.03)], 3),
    ] }),
  // --- 1915
  E({ id: 'w14_dardanelles', tag: 'ENG', date: '1915-02-01', image: 'war', title: 'Los Dardanelos', condition: [war('OTT')],
    text: 'Churchill propone forzar los Dardanelos con la flota, tomar Constantinopla y abrir una ruta de suministros hacia Rusia. Los almirantes dudan de que los barcos puedan con las minas y las baterías costeras.',
    options: [
      opt('Atacar los Estrechos con la flota', [X('navy', -2), FL('dardanelles'), TR('w14_gallipoli', 80, 'ENG'), CH('La flota anglo-francesa ataca los Dardanelos; varios acorazados se hunden en campos de minas.')], 1),
      opt('Concentrar todo en Francia', [CMB(0.02)], 0),
    ] }),
  T({ id: 'w14_gallipoli', tag: 'ENG', image: 'war', title: 'El desembarco de Galípoli', condition: [war('OTT')],
    text: 'La flota no ha podido pasar. El general Hamilton propone desembarcar en la península de Galípoli con tropas británicas, australianas y neozelandesas para silenciar las baterías.',
    note: 'El desembarco del 25 de abril de 1915 dio origen al día del ANZAC. La campaña costó más de 100 000 muertos entre ambos bandos y terminó con la evacuación aliada en enero de 1916.',
    options: [
      opt('Desembarcar en Galípoli', [SPAWN('ENG', 'thrace', { infantry: 4, marines: 1 }), FL('gallipoli'), TR('w14_kemal', 2, 'OTT'), CH('Tropas británicas y del ANZAC desembarcan en Galípoli.')], 1),
      opt('Renunciar a la operación', [PR(-20)], 0),
    ] }),
  T({ id: 'w14_kemal', tag: 'OTT', image: 'war', title: 'La defensa de Galípoli', condition: [war('ENG')],
    text: 'Un coronel poco conocido, Mustafa Kemal, ha lanzado a su regimiento contra las alturas antes de que el enemigo las alcance. El general alemán Liman von Sanders coordina la defensa.',
    options: [
      opt('Defender cada colina', [CMB(0.06), NU(10), MP(-60000), PR(30), CH('Las tropas otomanas contienen el desembarco en Galípoli.')], 1),
      opt('Retroceder hacia Constantinopla', [NU(-10)], 0),
    ] }),
  E({ id: 'w14_gallipoli_evac', tag: 'ENG', date: '1915-12-01', image: 'disaster', title: 'La evacuación de Galípoli', condition: [flag('gallipoli')],
    text: 'Ocho meses de trincheras en las laderas de Galípoli no han dado fruto. El general Monro recomienda evacuar la península.',
    options: [
      opt('Evacuar en silencio', [PR(-30), DIS(4), CH('Las tropas aliadas abandonan Galípoli sin ser detectadas.')], 7),
      opt('Mantener la cabeza de playa', [MP(-80000), DIS(6)], 3),
    ] }),
  E({ id: 'w14_shell_crisis', tag: 'ENG', date: '1915-05-01', image: 'prosperity', title: 'La crisis de los proyectiles', condition: [war('GER')],
    text: 'The Times denuncia que la ofensiva de Aubers fracasó por falta de munición de artillería. El gobierno liberal cae y nace una coalición.',
    options: [
      opt('Crear un Ministerio de Municiones (Lloyd George)', [IC(4), DIS(3), CH('Lloyd George asume el nuevo Ministerio de Municiones.')], 8),
      opt('Comprar munición en Estados Unidos', [SUP(1200), REL('USA', 20)], 2),
    ] }),
  E({ id: 'w14_lusitania', tag: 'USA', date: '1915-05-01', image: 'disaster', title: 'El hundimiento del Lusitania', condition: [war('ENG', 'GER')],
    text: 'Un submarino alemán ha torpedeado el transatlántico Lusitania frente a Irlanda. Han muerto casi 1 200 personas, entre ellas 128 estadounidenses.',
    note: 'El Lusitania se hundió el 7 de mayo de 1915. Las protestas de Washington llevaron a Berlín a restringir la guerra submarina durante casi dos años.',
    options: [
      opt('Exigir garantías a Berlín, sin romper la neutralidad', [REL('GER', -50), FL('lusitania'), DIS(-2)], 7, '«Demasiado orgullosos para luchar», dirá Wilson.'),
      opt('Preparar al país para la guerra', [REL('GER', -100), MP(200000), IC(2), DIS(5)], 3),
    ] }),
  E({ id: 'w14_london_pact', tag: 'ITA', date: '1915-04-01', image: 'court', title: 'El Pacto de Londres', condition: [exists('AUH'), war('FRA', 'GER')],
    text: 'Londres y París ofrecen el Trentino, el Tirol del Sur, Trieste, Istria y parte de Dalmacia a cambio de entrar en la guerra en el plazo de un mes. Viena, presionada por Berlín, solo ofrece parte del Trentino.',
    note: 'El Pacto de Londres se firmó en secreto el 26 de abril de 1915. Las «jornadas radiantes» de mayo, con manifestaciones intervencionistas, empujaron al Parlamento, mayoritariamente neutralista.',
    options: [
      opt('Firmar con la Entente', [CLAIM(['tyrol', 'dalmatia', 'styria']), FL('london_pact'), TR('w14_ita_war', 50, 'ITA'), CH('Italia firma en secreto el Pacto de Londres.')], 8),
      opt('Seguir neutrales y negociar con Viena', [REL('AUH', 20), DIS(4)], 2),
    ] }),
  T({ id: 'w14_ita_war', tag: 'ITA', image: 'war', title: 'Italia entra en la guerra', condition: [exists('AUH')],
    text: 'Ha llegado el plazo del Pacto de Londres. El rey Víctor Manuel III ha confirmado al gobierno de Salandra pese a la oposición de la mayoría parlamentaria.',
    options: [opt('Declarar la guerra a Austria-Hungría', [JF('entente'), NU(5), CH('Italia declara la guerra a Austria-Hungría.')], 1)] }),
  E({ id: 'w14_isonzo', tag: 'ITA', date: '1915-07-01', image: 'war', title: 'El Isonzo', condition: [war('AUH')],
    text: 'Cadorna quiere romper la línea austríaca del Isonzo con ataques frontales contra posiciones de montaña. Sus métodos disciplinarios son temidos por la tropa.',
    options: [
      opt('Ataques frontales sucesivos', [MP(-150000), MP(-100000, 'AUH'), DIS(5)], 7, 'Habrá once batallas del Isonzo antes de Caporetto.'),
      opt('Esperar a tener artillería pesada suficiente', [SUP(-400), CMB(0.03)], 3),
    ] }),
  E({ id: 'w14_gorlice', tag: 'GER', date: '1915-05-01', image: 'war', title: 'Gorlice-Tarnów', condition: [war('RUS')],
    text: 'Falkenhayn concentra artillería pesada en un sector estrecho de Galitzia para romper el frente ruso, escaso de proyectiles.',
    options: [
      opt('Romper el frente en Gorlice', [CMB(0.05), PR(40), MP(-400000, 'RUS'), TR('w14_great_retreat', 90, 'RUS'), CH('Las Potencias Centrales rompen el frente ruso en Gorlice-Tarnów.')], 1),
      opt('Priorizar el frente occidental', [MP(-60000)], 0),
    ] }),
  T({ id: 'w14_great_retreat', tag: 'RUS', image: 'disaster', title: 'La gran retirada', condition: [war('GER')],
    text: 'El ejército abandona Polonia y Lituania. Millones de refugiados llenan las carreteras. Nicolás II se plantea asumir en persona el mando supremo, contra el consejo de sus ministros.',
    options: [
      opt('El zar asume el mando supremo', [NU(5), DIS(6), FL('tsar_command'), CH('Nicolás II asume el mando supremo del ejército.')], 7, 'Cada derrota será, en adelante, del zar.'),
      opt('Mantener al gran duque Nicolás', [CMB(0.03), DIS(2)], 3),
    ] }),
  E({ id: 'w14_bul_war', tag: 'BUL', date: '1915-10-01', image: 'war', title: 'Bulgaria elige bando', condition: [exists('SER'), war('RUS', 'GER')],
    text: 'Las Potencias Centrales prometen toda la Macedonia serbia; la Entente no puede ofrecer lo que pertenece a su aliada. El zar Fernando ha decidido.',
    options: [
      opt('Unirse a las Potencias Centrales y atacar Serbia', [JF('central'), CLAIM(['macedonia', 'serbia']), PR(15), CH('Bulgaria entra en la guerra contra Serbia.')], 8),
      opt('Mantener la neutralidad', [DIS(3)], 2),
    ] }),
  E({ id: 'w14_ser_retreat', tag: 'SER', date: '1915-11-01', image: 'disaster', title: 'La retirada a través de Albania', condition: [war('BUL'), war('AUH')],
    text: 'Atacados por tres ejércitos, el gobierno y lo que queda del ejército se plantean cruzar las montañas de Albania en pleno invierno hasta la costa, donde la flota aliada podría recogerlos.',
    note: 'En la retirada del invierno de 1915-1916 murieron decenas de miles de soldados y civiles serbios. Los supervivientes fueron evacuados a Corfú y volvieron a combatir en el frente de Salónica.',
    options: [
      opt('Retirarse y salvar el ejército', [MP(-100000), NU(10), CMB(0.03), CH('El ejército serbio cruza las montañas de Albania hacia el mar.')], 7),
      opt('Resistir en cada valle', [MP(-60000), PR(20)], 3),
    ] }),
  E({ id: 'w14_greek_schism', tag: 'GRE', date: '1915-10-01', image: 'court', title: 'El Cisma Nacional', condition: [war('BUL')],
    text: 'El primer ministro Venizelos quiere entrar en la guerra junto a la Entente y ha permitido un desembarco aliado en Salónica. El rey Constantino, cuñado del káiser, prefiere la neutralidad.',
    options: [
      opt('Tolerar el desembarco aliado sin entrar en la guerra', [REL('ENG', 20), REL('FRA', 20), DIS(5), FL('salonika')], 7, 'El país se dividirá entre venizelistas y monárquicos.'),
      opt('Exigir la retirada de las tropas aliadas', [REL('ENG', -40), REL('GER', 30)], 3),
    ] }),
  // --- 1916
  E({ id: 'w14_verdun', tag: 'GER', date: '1916-02-01', image: 'war', title: 'Operación Gericht', condition: [war('FRA')],
    text: 'Falkenhayn propone atacar Verdún, un saliente que Francia no abandonará por orgullo, para obligar a su ejército a desangrarse bajo la artillería alemana.',
    note: 'La batalla de Verdún (21 de febrero-18 de diciembre de 1916) causó unas 700 000 bajas entre muertos, heridos y desaparecidos, en partes casi iguales.',
    options: [
      opt('Atacar Verdún', [FL('verdun'), MP(-300000), MP(-300000, 'FRA'), TR('w14_verdun_fra', 20, 'FRA'), CH('Comienza la batalla de Verdún.')], 1),
      opt('Buscar la decisión en otro frente', [CMB(0.02)], 0),
    ] }),
  T({ id: 'w14_verdun_fra', tag: 'FRA', image: 'war', title: '«No pasarán»', condition: [war('GER')],
    text: 'El fuerte de Douaumont ha caído. El general Pétain recibe el mando con una sola carretera de abastecimiento hacia Bar-le-Duc.',
    options: [
      opt('La Voie Sacrée y la rotación de divisiones', [NU(8), SUP(-600), DIS(3), CH('Por la «Vía Sagrada» circulan miles de camiones al día. Casi todo el ejército francés pasará por Verdún.')], 1),
      opt('Contraataques inmediatos para recuperar los fuertes', [MP(-150000), PR(20)], 0),
    ] }),
  E({ id: 'w14_jutland', tag: 'GER', date: '1916-05-01', image: 'war', title: 'Jutlandia', condition: [war('ENG')],
    text: 'El almirante Scheer quiere atraer a una parte de la Grand Fleet hacia una trampa en el mar del Norte. Si la batalla sale mal, la flota de alta mar no volverá a salir de puerto.',
    note: 'En Jutlandia (31 de mayo-1 de junio de 1916) los británicos perdieron más barcos y hombres, pero conservaron el dominio del mar. La flota alemana apenas volvió a salir a mar abierto.',
    options: [
      opt('Salir a buscar la batalla', [X('navy', -2), X('navy', -3, 'ENG'), PR(25), TR('w14_jutland_eng', 30, 'ENG'), CH('Las dos grandes flotas chocan frente a Jutlandia.')], 1),
      opt('Mantener la flota en puerto y apostar por los submarinos', [X('subs', 2)], 0),
    ] }),
  T({ id: 'w14_jutland_eng', tag: 'ENG', image: 'war', title: 'Algo va mal con nuestros barcos', condition: [war('GER')],
    text: 'Tres cruceros de batalla han estallado en minutos. Beatty comenta que algo va mal con los barcos británicos. Aun así, la flota alemana ha regresado a puerto.',
    options: [
      opt('Revisar el blindaje y el manejo de la munición', [TECH('naval', 1), SUP(-300)], 6),
      opt('Mantener el bloqueo a distancia', [X('navy', 1), DIS(2)], 4),
    ] }),
  E({ id: 'w14_sykes_picot', tag: 'ENG', date: '1916-05-01', image: 'court', title: 'El acuerdo Sykes-Picot', condition: [war('OTT'), exists('FRA')],
    text: 'Diplomáticos británicos y franceses trazan en secreto zonas de influencia sobre las provincias árabes del Imperio otomano, mientras Londres promete al jerife de La Meca un reino árabe.',
    note: 'El acuerdo Sykes-Picot (mayo de 1916) y las promesas contradictorias hechas a los árabes y, en 1917, al movimiento sionista (Declaración Balfour) marcaron el reparto de la región tras la guerra.',
    options: [
      opt('Firmar el reparto con Francia', [CLAIM(['baghdad', 'basra', 'mosul', 'jerusalem', 'acre']), CLAIM(['damascus', 'aleppo', 'antioch'], 'FRA'), REL('FRA', 20)], 7),
      opt('No comprometerse con París', [REL('FRA', -20), CLAIM(['baghdad', 'basra'])], 3),
    ] }),
  E({ id: 'w14_arab_revolt', tag: 'ENG', date: '1916-06-01', image: 'revolt', title: 'La revuelta árabe', condition: [war('OTT')],
    text: 'El jerife Husein de La Meca se ha alzado contra el sultán. Sus beduinos, mandados por su hijo Faisal y asesorados por oficiales británicos como T. E. Lawrence, pueden cortar el ferrocarril del Hiyaz.',
    options: [
      opt('Armar y financiar la revuelta', [{ type: 'unrest', province: 'damascus', amount: 15 }, { type: 'unrest', province: 'jerusalem', amount: 10 }, { type: 'unrest', province: 'aleppo', amount: 8 }, SPAWN('ENG', 'sinai', { cavalry: 2 }), SUP(-300), CH('Los árabes del Hiyaz se sublevan contra el Imperio otomano.')], 8),
      opt('Limitarse a defender Egipto', [], 2),
    ] }),
  E({ id: 'w14_brusilov', tag: 'RUS', date: '1916-06-01', image: 'war', title: 'La ofensiva de Brusílov', condition: [war('AUH')],
    text: 'El general Brusílov propone atacar a la vez en todo el frente suroccidental, tras una preparación breve y cuidadosa, sin revelar dónde caerá el golpe principal.',
    options: [
      opt('Lanzar la ofensiva', [CMB(0.05), PR(40), MP(-500000), MP(-600000, 'AUH'), DIS(8, 'AUH'), CH('La ofensiva de Brusílov hunde el frente austro-húngaro.')], 1),
      opt('Esperar a la ofensiva aliada del Somme', [], 0),
    ] }),
  E({ id: 'w14_somme', tag: 'ENG', date: '1916-07-01', image: 'war', title: 'El Somme', condition: [war('GER')],
    text: 'El nuevo ejército de voluntarios de Kitchener está listo. Una semana de bombardeo debería pulverizar las alambradas alemanas antes de que la infantería salga de las trincheras.',
    note: 'El 1 de julio de 1916, primer día del Somme, el ejército británico sufrió unas 57 000 bajas, casi 20 000 de ellas muertos: el día más sangriento de su historia.',
    options: [
      opt('Lanzar la ofensiva', [MP(-420000), MP(-300000, 'GER'), DIS(5), TR('w14_tanks', 75, 'ENG'), CH('Comienza la batalla del Somme.')], 1),
      opt('Aplazarla hasta disponer de más artillería', [REL('FRA', -30)], 0),
    ] }),
  T({ id: 'w14_tanks', tag: 'ENG', image: 'explore', title: 'Los primeros carros de combate', condition: [war('GER')],
    text: 'Unos cincuenta «tanques», nombre en clave para disimular su verdadero uso, han llegado al frente. Son lentos y poco fiables. Algunos piden esperar a tener cientos para sorprender al enemigo.',
    note: 'Los carros británicos Mark I entraron en combate en Flers-Courcelette el 15 de septiembre de 1916.',
    options: [
      opt('Emplearlos ya en Flers-Courcelette', [X('unlock_armor', 1), TECH('armor', 1), SPAWN('ENG', 'london', { armor: 1 }), CH('Los primeros carros de combate entran en acción en el Somme.')], 1),
      opt('Esperar y perfeccionarlos', [X('unlock_armor', 1), TECH('armor', 2)], 0, 'Más maduros, sin sorpresa táctica inmediata.'),
    ] }),
  E({ id: 'w14_romania', tag: 'ROM', date: '1916-08-01', image: 'war', title: 'Rumanía entra en la guerra', condition: [exists('AUH'), war('FRA', 'GER')],
    text: 'Animado por la ofensiva de Brusílov, Bucarest ha firmado con la Entente la promesa de Transilvania, Bucovina y el Banato. Pero el país está rodeado de enemigos y mal armado.',
    options: [
      opt('Atacar Transilvania', [JF('entente'), CLAIM(['transylvania', 'pannonia']), CH('Rumanía declara la guerra a Austria-Hungría y entra en Transilvania.')], 8),
      opt('Seguir neutral', [], 2),
    ] }),
  E({ id: 'w14_portugal', tag: 'POR', date: '1916-03-01', image: 'war', title: 'Portugal en guerra', condition: [war('FRA', 'GER')],
    text: 'A petición británica, Lisboa ha requisado los barcos mercantes alemanes refugiados en sus puertos. Berlín responde con una declaración de guerra.',
    options: [
      opt('Enviar un cuerpo expedicionario a Flandes', [JF('entente'), DIS(5), CH('Portugal entra en la guerra junto a la Entente.')], 9),
      opt('Limitarse a defender las colonias', [JF('entente')], 1),
    ] }),
  E({ id: 'w14_hindenburg_prog', tag: 'GER', date: '1916-09-01', image: 'prosperity', title: 'El programa Hindenburg', condition: [atWar()],
    text: 'Hindenburg y Ludendorff, ya al frente del Mando Supremo, exigen duplicar la producción de munición y triplicar la de artillería, movilizando a toda la población civil.',
    options: [
      opt('Movilización industrial total', [IC(6), DIS(8), SUP(800), CH('Comienza el programa Hindenburg.')], 7),
      opt('Objetivos realistas', [IC(2), DIS(2)], 3),
    ] }),
  // --- 1917
  E({ id: 'w14_turnip', tag: 'GER', date: '1917-01-01', image: 'disaster', title: 'El invierno de los nabos', condition: [war('ENG')],
    text: 'El bloqueo británico y una mala cosecha de patatas dejan a las ciudades alemanas con nabos forrajeros como alimento principal.',
    options: [
      opt('Racionamiento estricto', [DIS(6), SUP(300)], 6),
      opt('Priorizar a los obreros de las fábricas de armas', [DIS(8), IC(1)], 4),
    ] }),
  E({ id: 'w14_usw', tag: 'GER', date: '1917-01-01', image: 'war', title: 'Guerra submarina sin restricciones', condition: [war('ENG')],
    text: 'La Marina asegura que, hundiendo sin aviso todo barco que se acerque a las islas británicas, Inglaterra pedirá la paz en seis meses. El canciller advierte que Estados Unidos entrará en la guerra.',
    options: [
      opt('Reanudar la guerra submarina sin restricciones', [FL('usw'), X('subs', 4), REL('USA', -120), SUP(-1500, 'ENG'), TR('w14_zimmermann', 15, 'GER'), CH('Alemania reanuda la guerra submarina sin restricciones.')], 8),
      opt('Respetar las reglas de presa', [REL('USA', 20), DIS(3)], 2, 'Washington seguiría neutral.'),
    ] }),
  T({ id: 'w14_zimmermann', tag: 'GER', image: 'court', title: 'El telegrama a México', condition: [exists('MEX')],
    text: 'El secretario de Exteriores Zimmermann propone ofrecer a México una alianza si Estados Unidos entra en la guerra, con la promesa de recuperar Texas, Nuevo México y Arizona.',
    options: [
      opt('Enviar el telegrama cifrado', [FL('zimmermann'), TR('w14_room40', 39, 'ENG')], 8),
      opt('Descartar la idea', [], 2),
    ] }),
  T({ id: 'w14_room40', tag: 'ENG', image: 'explore', title: 'La Sala 40', condition: [exists('USA')],
    text: 'Los criptoanalistas del Almirantazgo han descifrado un telegrama alemán dirigido a México. Revelarlo podría convencer a los estadounidenses, pero también delataría que leemos las comunicaciones alemanas.',
    options: [
      opt('Entregarlo discretamente a Washington', [FL('zimm_public'), REL('GER', -80, 'USA'), REL('MEX', -40, 'USA'), TR('w14_mex_offer', 4, 'MEX'), CH('El telegrama Zimmermann se publica en la prensa estadounidense.')], 1),
      opt('Guardar el secreto', [CMB(0.02)], 0),
    ] }),
  T({ id: 'w14_mex_offer', tag: 'MEX', image: 'court', title: 'La oferta alemana', condition: [exists('USA')],
    text: 'El presidente Carranza estudia la propuesta alemana. Sus generales advierten que el país, desgarrado por la revolución, no puede enfrentarse a su vecino del norte.',
    options: [
      opt('Rechazarla con discreción', [REL('USA', 20), REL('GER', -10)], 9),
      opt('Negociar con Berlín', [REL('USA', -80), REL('GER', 40)], 1),
    ] }),
  E({ id: 'w14_usa_war', tag: 'USA', date: '1917-04-01', image: 'war', title: 'Un mundo seguro para la democracia', condition: [flag('usw', 'GER'), exists('GER'), atWar(false)],
    text: 'Los submarinos alemanes hunden barcos estadounidenses y el telegrama Zimmermann ha indignado al país. El presidente Wilson se dispone a pedir al Congreso la declaración de guerra.',
    note: 'Estados Unidos declaró la guerra a Alemania el 6 de abril de 1917, como «potencia asociada», no aliada, de la Entente.',
    options: [
      opt('Declarar la guerra a Alemania', [JF('entente'), FL('usa_in'), MP(800000), X('neutral', -1), TR('w14_aef', 75, 'USA'), CH('Estados Unidos entra en la guerra.')], 9),
      opt('Neutralidad armada', [X('navy', 2), DIS(3)], 1),
    ] }),
  E({ id: 'w14_usa_war_b', tag: 'USA', date: '1917-10-01', image: 'war', title: 'La presión del Atlántico', condition: [atWar(false), exists('GER'), war('ENG', 'GER'), flag('zimm_public', 'ENG')],
    text: 'Aunque Berlín respeta en teoría las reglas de presa, el telegrama Zimmermann ha puesto a la opinión pública en contra de Alemania y la banca teme por los préstamos a Londres y París.',
    options: [
      opt('Entrar en la guerra', [JF('entente'), FL('usa_in'), MP(600000), X('neutral', -1), TR('w14_aef', 90, 'USA')], 6),
      opt('Seguir neutrales', [IC(2)], 4),
    ] }),
  T({ id: 'w14_aef', tag: 'USA', image: 'war', title: 'La Fuerza Expedicionaria (AEF)', condition: [exists('FRA'), war('GER')],
    text: 'Las primeras divisiones del general Pershing desembarcan en Saint-Nazaire. Pershing se niega a dispersar a sus hombres entre las unidades francesas y británicas.',
    options: [
      opt('Un ejército estadounidense independiente', [SPAWN('USA', 'bretagne', { infantry: 4, artillery: 1 }), CH('Las tropas estadounidenses llegan a Francia.')], 7),
      opt('Integrarlas en las divisiones aliadas', [SPAWN('USA', 'bretagne', { infantry: 3 }), REL('FRA', 30), REL('ENG', 30)], 3),
    ] }),
  E({ id: 'w14_chemin_des_dames', tag: 'FRA', date: '1917-04-01', image: 'war', title: 'La ofensiva Nivelle', condition: [war('GER')],
    text: 'El general Nivelle promete romper el frente en el Chemin des Dames en 48 horas. Sus planes circulan por medio París y los alemanes se han replegado a la línea Hindenburg.',
    options: [
      opt('Lanzar la ofensiva', [MP(-200000), DIS(8), X('unlock_armor', 1), TECH('armor', 1), FL('nivelle'), TR('w14_mutinies', 35, 'FRA'), CH('La ofensiva Nivelle fracasa en el Chemin des Dames; debutan los carros franceses.')], 1, 'Los primeros carros Schneider entran en combate.'),
      opt('Esperar a los estadounidenses y a los nuevos carros', [X('unlock_armor', 1), TECH('armor', 1), DIS(2)], 0),
    ] }),
  T({ id: 'w14_mutinies', tag: 'FRA', image: 'revolt', title: 'Los motines de 1917', condition: [war('GER')],
    text: 'Decenas de regimientos se niegan a volver al ataque. No abandonan las trincheras, pero exigen permisos, mejor rancho y que cesen las ofensivas inútiles. Pétain sustituye a Nivelle.',
    note: 'Los motines afectaron a casi la mitad de las divisiones francesas en mayo y junio de 1917. Los consejos de guerra dictaron centenares de condenas a muerte; se ejecutó a varias decenas de soldados.',
    options: [
      opt('Pétain: permisos, rancho y defensa activa', [DIS(-8), NU(5), CMB(-0.03), CH('Pétain restablece la moral del ejército con permisos regulares y el fin de los ataques inútiles.')], 8),
      opt('Reanudar las ofensivas cuanto antes', [DIS(10), NU(-8), MP(-80000)], 2),
    ] }),
  E({ id: 'w14_passchendaele', tag: 'ENG', date: '1917-07-01', image: 'war', title: 'Passchendaele', condition: [war('GER')],
    text: 'Haig quiere avanzar desde Ypres hacia los puertos belgas desde los que operan los submarinos. Los meteorólogos anuncian lluvias en un terreno ya convertido en ciénaga por la artillería.',
    options: [
      opt('Lanzar la tercera batalla de Ypres', [MP(-250000), MP(-200000, 'GER'), DIS(6)], 6),
      opt('Esperar a la ofensiva de carros en Cambrai', [CMB(0.03), TECH('armor', 1)], 4),
    ] }),
  E({ id: 'w14_greece_war', tag: 'GRE', date: '1917-06-01', image: 'war', title: 'Grecia entra en la guerra', condition: [exists('BUL'), war('FRA', 'GER')],
    text: 'Bajo presión aliada, el rey Constantino abdica. Venizelos vuelve a Atenas y reunifica el país para la guerra.',
    options: [opt('Declarar la guerra a las Potencias Centrales', [JF('entente'), CLAIM(['thrace', 'macedonia']), DIS(4), CH('Grecia entra en la guerra junto a la Entente.')], 9), opt('Neutralidad', [DIS(8)], 1)] }),
  E({ id: 'w14_brazil', tag: 'BRA', date: '1917-10-01', image: 'war', title: 'Brasil declara la guerra', condition: [flag('usa_in', 'USA'), war('ENG', 'GER')],
    text: 'Los submarinos alemanes han hundido varios mercantes brasileños.',
    options: [opt('Declarar la guerra a Alemania', [JF('entente'), X('navy', 1)], 8), opt('Protestar sin más', [], 2)] }),
  E({ id: 'w14_caporetto', tag: 'ITA', date: '1917-10-01', image: 'disaster', title: 'Caporetto', condition: [war('AUH')],
    text: 'Divisiones alemanas y austro-húngaras, con nuevas tácticas de infiltración y gas, han roto el frente en el alto Isonzo. El ejército se retira en desorden.',
    note: 'En Caporetto (24 de octubre de 1917) Italia perdió unos 300 000 hombres, la mayoría prisioneros. El frente se estabilizó en el Piave y Cadorna fue sustituido por Armando Diaz.',
    options: [
      opt('Retirada al Piave y relevo de Cadorna', [MP(-300000), NU(-5), CMB(0.05), DIS(5), FL('caporetto'), CH('El frente italiano se rompe en Caporetto y se rehace en el Piave.')], 8),
      opt('Contraatacar en el Isonzo', [MP(-200000), CMB(-0.05)], 2),
    ] }),
  // --- Rusia: revoluciones y Brest-Litovsk
  E({ id: 'w14_feb_revolution', tag: 'RUS', date: '1917-03-01', image: 'revolt', title: 'La Revolución de Febrero', condition: [atWar(), war('GER')],
    text: 'En Petrogrado faltan pan y carbón. Las colas se convierten en huelgas, las huelgas en manifestaciones y los soldados de la guarnición se niegan a disparar. La Duma y el sóviet de obreros y soldados se disputan el poder.',
    note: 'Nicolás II abdicó el 15 de marzo de 1917 (2 de marzo según el calendario juliano). El Gobierno Provisional decidió continuar la guerra.',
    options: [
      opt('Abdicación del zar: Gobierno Provisional', [GOV('democracy'), FL('feb_rev'), DIS(15), NU(-10), TR('w14_kerensky', 120, 'RUS'), TR('w14_october', 250, 'RUS'), CH('Abdica Nicolás II. Un Gobierno Provisional asume el poder en Rusia.')], 1),
      opt('Una regencia constitucional bajo el gran duque Miguel', [FL('feb_rev'), DIS(20), NU(-12), TR('w14_october', 250, 'RUS')], 0, 'Un intento de salvar la monarquía que nadie en la calle parece desear.'),
    ] }),
  T({ id: 'w14_kerensky', tag: 'RUS', image: 'war', title: 'La ofensiva de Kerenski', condition: [war('GER')],
    text: 'El ministro de la Guerra, Kerenski, recorre el frente pronunciando discursos. Quiere una ofensiva en Galitzia que demuestre a los aliados que la Rusia revolucionaria sigue en pie.',
    options: [
      opt('Lanzar la ofensiva', [MP(-150000), DIS(12), NU(-8), CH('La ofensiva de Kerenski fracasa; el ejército ruso se descompone.')], 7),
      opt('Mantener el frente a la defensiva', [DIS(4), REL('FRA', -30), REL('ENG', -30)], 3),
    ] }),
  T({ id: 'w14_october', tag: 'RUS', image: 'revolt', title: 'Todo el poder a los sóviets', condition: [flag('feb_rev'), atWar()],
    text: 'Los bolcheviques de Lenin prometen paz, tierra y pan. El Comité Militar Revolucionario del sóviet de Petrogrado prepara la toma del Palacio de Invierno.',
    note: 'La toma del poder bolchevique se produjo la noche del 7 al 8 de noviembre de 1917 (25-26 de octubre en el calendario juliano). Su primer decreto proponía una paz inmediata sin anexiones.',
    options: [
      opt('El poder pasa a los bolcheviques', [GOV('communist'), FL('october'), DIS(10), NU(-15), TR('w14_brest', 115, 'RUS'), CH('Los bolcheviques toman el poder en Petrogrado.')], 1),
      opt('El Gobierno Provisional resiste', [DIS(20), NU(-10), MP(-200000)], 0),
    ] }),
  T({ id: 'w14_brest', tag: 'RUS', image: 'peace', title: 'Brest-Litovsk', condition: [war('GER')],
    text: 'Las conversaciones de paz llevan semanas. Trotski ha intentado la fórmula «ni guerra ni paz», pero los alemanes reanudan su avance casi sin resistencia. Lenin exige firmar a cualquier precio.',
    note: 'El tratado de Brest-Litovsk (3 de marzo de 1918) arrancó a Rusia Polonia, los países bálticos, Finlandia, Ucrania y parte de Bielorrusia: un tercio de su población y la mayor parte de su carbón.',
    options: [
      opt('Firmar la paz', [CEDE('RUS', 'GER', ['mazovia', 'lithuania', 'courland', 'livonia', 'estonia', 'belarus']), CEDE('RUS', 'AUH', ['podolia']), FL('brest'), SURRENDER, CH('Rusia firma la paz de Brest-Litovsk y sale de la guerra.')], 8, 'Rusia saldrá de la guerra en las próximas semanas.'),
      opt('Ni guerra ni paz', [MP(-100000), DIS(10), TR('w14_brest_final', 14, 'RUS')], 2, 'Los alemanes avanzarán y las condiciones empeorarán.'),
    ] }),
  T({ id: 'w14_brest_final', tag: 'RUS', image: 'peace', title: 'La paz impuesta', condition: [war('GER')],
    text: 'Los alemanes han avanzado cientos de kilómetros en dos semanas. Ya no hay ejército que oponerles.',
    options: [opt('Firmar unas condiciones aún más duras', [CEDE('RUS', 'GER', ['mazovia', 'lithuania', 'courland', 'livonia', 'estonia', 'belarus', 'kiev']), CEDE('RUS', 'AUH', ['podolia', 'volhynia']), FL('brest'), SURRENDER, CH('Rusia acepta las condiciones de Brest-Litovsk.')], 1)] }),
  E({ id: 'w14_brest_release', tag: 'RUS', date: '1918-03-01', image: 'revolt', title: 'La Rusia soviética', condition: [flag('brest'), { type: 'isVassal' }, until(1920)],
    text: 'La paz con las Potencias Centrales está firmada. El gobierno se ha trasladado a Moscú y el país se hunde en una guerra civil entre rojos y blancos.',
    options: [opt('Construir el Estado soviético', [...FREE('RUS'), GOV('communist'), JF('rsfsr'), ...ENTENTE_MEMBERS.map((o) => ({ type: 'breakAlliance', other: o }) as Effect), RESTORE(60), DIS(10), CH('Rusia sale de la guerra; comienza la guerra civil.')], 1)] }),
  E({ id: 'w14_rus_collapse', tag: 'RUS', date: '1915-01-01', image: 'revolt', title: 'El hundimiento del Imperio ruso', condition: [{ type: 'isVassal' }, flag('brest', undefined, false), until(1921)],
    text: 'La derrota militar ha precipitado lo que muchos temían: motines, huelgas generales y la caída de la autocracia. Los vencedores imponen sus condiciones a un país que ya no tiene gobierno capaz de discutirlas.',
    options: [opt('La revolución toma el poder', [...FREE('RUS'), GOV('communist'), FL('feb_rev'), FL('october'), FL('brest'), JF('rsfsr'), ...ENTENTE_MEMBERS.map((o) => ({ type: 'breakAlliance', other: o }) as Effect), NU(10), DIS(15), CH('El Imperio ruso se derrumba tras la derrota; los bolcheviques se hacen con el poder.')], 1)] }),
  E({ id: 'w14_brest_restore', tag: 'RUS', date: '1918-06-01', image: 'court', title: 'Un país en guerra civil', condition: [flag('brest'), maxX('nu', -100), { type: 'notVassal' }, until(1924)],
    text: 'La paz con Alemania ha llegado, pero el antiguo imperio se desintegra en frentes, ejércitos blancos y gobiernos locales.',
    options: [opt('Organizar el Ejército Rojo', [RESTORE(60), GOV('communist'), MP(200000)], 1)] }),
  // --- 1918
  E({ id: 'w14_bucharest', tag: 'ROM', date: '1918-03-01', image: 'peace', title: 'La paz de Bucarest', condition: [flag('brest', 'RUS'), atWar(), until(1918)],
    text: 'Con Rusia fuera de la guerra, Rumanía, reducida a Moldavia, está rodeada. Las Potencias Centrales exigen la Dobruja y el control de su petróleo.',
    options: [
      opt('Firmar la paz', [CEDE('ROM', 'BUL', ['dobruja']), FL('rom_bucharest'), SURRENDER, CH('Rumanía firma una paz por separado con las Potencias Centrales.')], 8),
      opt('Resistir en Moldavia', [DIS(10), MP(-60000)], 2),
    ] }),
  E({ id: 'w14_rom_release', tag: 'ROM', date: '1918-06-01', image: 'court', title: 'Una paz bajo tutela', condition: [flag('rom_bucharest'), maxX('nu', -100), until(1924)],
    text: 'El rey Fernando no ha ratificado el tratado. El país espera, desarmado a medias, el desenlace de la guerra en el oeste.',
    options: [opt('Esperar el momento oportuno', [...FREE('ROM'), RESTORE(80)], 1)] }),
  E({ id: 'w14_rom_return', tag: 'ROM', date: '1918-11-01', image: 'war', title: 'Rumanía vuelve a la guerra', condition: [flag('rom_bucharest'), exists('GER'), war('FRA', 'GER'), until(1918)],
    text: 'Bulgaria ha capitulado y el frente de los Balcanes se derrumba. Bucarest puede volver a tomar las armas a pocos días del fin.',
    options: [opt('Movilizar de nuevo', [JF('entente'), NU(5)], 8), opt('Esperar a la conferencia de paz', [], 2)] }),
  E({ id: 'w14_kaiserschlacht', tag: 'GER', date: '1918-03-01', image: 'war', title: 'La batalla del Káiser', condition: [war('FRA')],
    text: 'La paz en el este libera decenas de divisiones. Ludendorff quiere ganar la guerra en el oeste antes de que los estadounidenses lleguen en masa, con tropas de asalto entrenadas en la infiltración.',
    note: 'La ofensiva de primavera (Operación Michael, 21 de marzo de 1918) logró los mayores avances desde 1914, pero agotó al ejército alemán sin lograr la ruptura decisiva.',
    options: [
      opt('Operación Michael', [CMB(0.12), MP(-400000), MP(-250000, 'ENG'), MP(-200000, 'FRA'), X('unlock_armor', 1), TR('w14_black_day', 160, 'GER'), CH('Comienza la ofensiva alemana de primavera.')], 1, 'Una última oportunidad: el desgaste será enorme.'),
      opt('Defenderse y negociar desde la fuerza', [CMB(0.03), TR('w14_black_day', 160, 'GER')], 0),
    ] }),
  T({ id: 'w14_black_day', tag: 'GER', image: 'disaster', title: 'El día negro del ejército alemán',
    text: 'En Amiens, cientos de carros aliados han roto el frente. Por primera vez se rinden divisiones enteras. Ludendorff habla del «día negro» del ejército alemán.',
    note: 'La ofensiva de Amiens (8 de agosto de 1918) abrió los «cien días» de avances aliados que terminaron con el armisticio.',
    options: [opt('Retroceder a la línea Hindenburg', [CMB(-0.15), NU(-15), DIS(10), FL('black_day'), TR('w14_vittorio', 77, 'ITA'), TR('w14_bul_armistice', 52, 'BUL'), TR('w14_cze_indep', 81, 'CZE'), TR('w14_ott_armistice', 83, 'OTT'), TR('w14_hun_indep', 84, 'HUN'), TR('w14_aus_armistice', 87, 'AUH'), TR('w14_ger_revolution', 89, 'GER'), CH('El ejército alemán sufre su «día negro» en Amiens.')], 1)] }),
  T({ id: 'w14_vittorio', tag: 'ITA', image: 'war', title: 'Vittorio Veneto', condition: [war('AUH')],
    text: 'El ejército austro-húngaro se descompone por nacionalidades. Diaz prepara la ofensiva final a través del Piave.',
    options: [opt('Cruzar el Piave', [PR(50), NU(10), CMB(0.05), CH('Victoria italiana en Vittorio Veneto.')], 1)] }),
  T({ id: 'w14_bul_armistice', tag: 'BUL', image: 'peace', title: 'El armisticio de Salónica', condition: [atWar()],
    text: 'El frente de Macedonia se ha hundido en Dobro Pole. Los soldados vuelven a casa y algunos amenazan con marchar sobre Sofía.',
    options: [
      opt('Pedir el armisticio', [FL('bul_armistice'), SURRENDER, ...ACCEPT, CH('Bulgaria firma el armisticio y sale de la guerra.')], 9),
      opt('Seguir luchando', [DIS(20), NU(5)], 1),
    ] }),
  T({ id: 'w14_ott_armistice', tag: 'OTT', image: 'peace', title: 'El armisticio de Mudros', condition: [atWar()],
    text: 'Damasco y Beirut han caído; Bulgaria ha capitulado y el camino de Constantinopla está abierto. Los Jóvenes Turcos huyen del país.',
    options: [
      opt('Firmar el armisticio', [FL('ott_armistice'), SURRENDER, ...ACCEPT, CH('El Imperio otomano firma el armisticio de Mudros.')], 9),
      opt('Resistir en Anatolia', [DIS(20), NU(5)], 1),
    ] }),
  T({ id: 'w14_cze_indep', tag: 'CZE', image: 'revolt', title: 'Independencia checoslovaca', condition: [exists('AUH')],
    text: 'En Praga, el Consejo Nacional proclama la independencia. Los aliados ya han reconocido al Consejo Nacional Checoslovaco de Masaryk y Beneš, y las legiones checas combaten en Francia, Italia y Rusia.',
    options: [opt('Proclamar la república', [FL('cze_indep'), SURRENDER, ...ACCEPT, CH('Se proclama en Praga la independencia de Checoslovaquia.')], 1)] }),
  T({ id: 'w14_hun_indep', tag: 'HUN', image: 'revolt', title: 'La Revolución de los Crisantemos', condition: [exists('AUH')],
    text: 'Soldados con crisantemos en la gorra toman Budapest. El conde Károlyi forma gobierno y pone fin a la unión con Austria.',
    options: [opt('Romper con Viena', [FL('hun_indep'), SURRENDER, ...ACCEPT, GOV('democracy'), CH('Hungría rompe la unión con Austria.')], 1)] }),
  T({ id: 'w14_aus_armistice', tag: 'AUH', image: 'peace', title: 'El armisticio de Villa Giusti', condition: [atWar()],
    text: 'Checos, eslovacos, polacos y eslavos del sur proclaman sus propios Estados. El emperador Carlos ya no tiene un imperio que defender.',
    options: [
      opt('Firmar el armisticio con Italia', [FL('aus_armistice'), SURRENDER, ...ACCEPT, CH('Austria-Hungría firma el armisticio. La monarquía de los Habsburgo se disuelve.')], 9),
      opt('Seguir luchando', [DIS(25)], 1),
    ] }),
  T({ id: 'w14_ger_revolution', tag: 'GER', image: 'revolt', title: 'Los marineros de Kiel', condition: [atWar()],
    text: 'Los marineros de Kiel se niegan a zarpar para una última batalla. Se forman consejos de obreros y soldados en todo el país. Ludendorff ha dimitido y el Mando Supremo admite que la guerra está perdida.',
    options: [opt('Abdicación del káiser: proclamación de la república', [GOV('democracy'), DIS(15), FL('ger_revolution'), TR('w14_ger_armistice', 6, 'GER'), CH('Abdica Guillermo II. Se proclama la república en Berlín.')], 1)] }),
  T({ id: 'w14_ger_armistice', tag: 'GER', image: 'peace', title: 'Compiègne', condition: [atWar()],
    text: 'En un vagón de tren en el bosque de Compiègne, el mariscal Foch presenta las condiciones: evacuación de los territorios ocupados y de la orilla izquierda del Rin, entrega de la flota y de miles de cañones.',
    note: 'El armisticio entró en vigor a las 11 de la mañana del 11 de noviembre de 1918. La guerra había causado unos diez millones de muertos militares y millones de víctimas civiles.',
    options: [
      opt('Firmar el armisticio', [FL('armistice'), SURRENDER, ...ACCEPT, CH('Alemania firma el armisticio en Compiègne. Callan los cañones en el frente occidental.')], 9),
      opt('Una lucha desesperada', [DIS(30), MP(200000)], 1, 'Sin aliados ni reservas.'),
    ] }),
  E({ id: 'w14_flu', date: '1918-10-01', image: 'disaster', title: 'La gripe', condition: [year(1918), until(1918)],
    text: 'Una gripe de virulencia desconocida se extiende por campamentos, trenes y ciudades. Mata sobre todo a adultos jóvenes. En los países neutrales, donde la prensa no está censurada, se la conoce como «gripe española».',
    note: 'La pandemia de 1918-1920 mató a decenas de millones de personas en todo el mundo, más que la propia guerra.',
    options: [
      opt('Cerrar escuelas, teatros e iglesias', [DIS(3), MP(-40000)], 6),
      opt('Ocultar la epidemia para no hundir la moral', [MP(-90000), DIS(-1)], 4),
    ] }),
];

// ------------------------------------------------------------------ la paz y la desintegración de los imperios
// ------------------------------------------------------------------ la guerra fuera de Europa: Luxemburgo, Montenegro, Japón y las colonias alemanas
const COLONIAL: GameEvent[] = [
  E({ id: 'w14_luxembourg', tag: 'GER', date: '1914-08-02', image: 'war', title: 'La ocupación de Luxemburgo', condition: [exists('LUX'), war('RUS')],
    text: 'Los ferrocarriles luxemburgueses son imprescindibles para desplegar el ala derecha hacia Bélgica. El gran ducado es neutral y no tiene ejército: basta con un tren de soldados para controlar la estación de la capital.',
    note: 'Las tropas alemanas entraron en Luxemburgo el 2 de agosto de 1914. La gran duquesa María Adelaida protestó, pero el país quedó ocupado hasta el armisticio, con su gobierno en funciones.',
    options: [
      opt('Ocupar el gran ducado', [{ type: 'vassalize', target: 'LUX' }, REL('LUX', -60), PR(-5), CH('Las tropas alemanas ocupan Luxemburgo sin disparar un tiro.')], 1),
      opt('Respetar su neutralidad', [PR(5)], 0, 'El despliegue hacia Bélgica sería más lento.'),
    ] }),
  E({ id: 'w14_montenegro', tag: 'MNE', date: '1914-08-06', image: 'war', title: 'Montenegro junto a Serbia', condition: [war('SER', 'AUH')],
    text: 'El rey Nicolás no olvida que su yerno reina en Belgrado ni que Austria-Hungría bloquea la costa adriática. La Asamblea vota la guerra por aclamación.',
    note: 'Montenegro declaró la guerra a Austria-Hungría el 6 de agosto de 1914 y su ejército fue derrotado a comienzos de 1916.',
    options: [
      opt('Declarar la guerra a Austria-Hungría', [{ type: 'alliance', other: 'SER' }, JF('entente'), NU(5), CH('Montenegro entra en la guerra junto a Serbia.')], 9),
      opt('Neutralidad vigilante', [REL('SER', -50)], 1),
    ] }),
  E({ id: 'w14_jap_ultimatum', tag: 'JAP', date: '1914-08-15', image: 'court', title: 'El ultimátum a Alemania', condition: [war('GER', 'ENG')],
    text: 'Londres pide ayuda contra los cruceros alemanes del Pacífico. Para el gabinete de Ōkuma es una ocasión que no se repetirá: con las potencias europeas ocupadas, Japón puede quedarse con la base alemana de Tsingtao y con las islas del Pacífico Norte.',
    note: 'Japón exigió el 15 de agosto de 1914 que la flota alemana abandonara las aguas de Asia y que Kiaochow le fuera entregado. Sin respuesta, declaró la guerra el 23 de agosto, invocando la alianza anglo-japonesa de 1902. Su esfuerzo se limitó a Asia y el Pacífico, salvo una flotilla de destructores enviada al Mediterráneo en 1917.',
    options: [
      opt('Declarar la guerra a Alemania', [DW('GER'), FL('jap_war'), REL('ENG', 30), REL('FRA', 20), REL('RUS', 20), TR('w14_jap_islands', 50, 'JAP'), TR('w14_tsingtao', 80, 'JAP'), CH('Japón declara la guerra a Alemania.')], 9),
      opt('Limitarse a vigilar las rutas marítimas', [REL('ENG', -20)], 1, 'Japón seguiría neutral.'),
    ] }),
  T({ id: 'w14_jap_islands', tag: 'JAP', image: 'explore', title: 'Las islas de los Mares del Sur', condition: [war('GER'), owns('palau', 'GER')],
    text: 'La escuadra alemana de von Spee ha abandonado el Pacífico rumbo a Sudamérica. Las Marianas, las Carolinas, las Marshall y las Palaos solo tienen unos pocos funcionarios coloniales.',
    note: 'La Armada japonesa ocupó en octubre de 1914, sin combate, las posesiones alemanas al norte del ecuador, que la Sociedad de Naciones le confió después como mandato.',
    options: [opt('Desembarcar en las islas', [CEDE('GER', 'JAP', ['palau']), PR(20), X('navy', 1), CH('La Armada japonesa ocupa las islas alemanas del Pacífico Norte.')], 1)] }),
  T({ id: 'w14_tsingtao', tag: 'JAP', image: 'war', title: 'El asedio de Tsingtao', condition: [war('GER')],
    text: 'Más de 20 000 soldados japoneses, con un pequeño contingente británico, han cercado la base naval alemana de la bahía de Kiaochow, defendida por menos de 5 000 hombres.',
    note: 'Tsingtao capituló el 7 de noviembre de 1914 tras un asedio en el que Japón empleó artillería pesada y uno de los primeros ataques aéreos desde un buque. Japón ocupó también el ferrocarril de Shandong.',
    options: [
      opt('Tomar la base y el ferrocarril de Shandong', [FL('tsingtao'), PR(40), REL('CHN', -40), REL('GER', -30), CH('Tsingtao capitula ante el ejército japonés.')], 1),
      opt('Devolver la concesión a China', [PR(10), REL('CHN', 40)], 0),
    ] }),
  E({ id: 'w14_21_demands', tag: 'JAP', date: '1915-01-18', image: 'court', title: 'Las Veintiuna Exigencias', condition: [flag('tsingtao'), exists('CHN')],
    text: 'El ministro Katō prepara un pliego para Yuan Shikai: herencia de los derechos alemanes en Shandong, ampliación de las concesiones en Manchuria y, en un último grupo secreto, asesores japoneses en el gobierno chino.',
    note: 'Las exigencias se entregaron el 18 de enero de 1915. Ante las protestas de Washington y Londres, Japón renunció al quinto grupo, pero China aceptó el resto en mayo; aquel día se recordó en China como el Día de la Humillación Nacional.',
    options: [
      opt('Presentarlas, salvo el grupo secreto', [REL('CHN', -60), REL('USA', -20), PR(20), IC(1), CH('Japón arranca a China nuevas concesiones en Shandong y Manchuria.')], 8),
      opt('Exigirlo todo', [REL('CHN', -100), REL('USA', -50), REL('ENG', -30), PR(30), IC(2)], 2, 'Irrita a británicos y estadounidenses.'),
    ] }),
  E({ id: 'w14_togoland', tag: 'FRA', date: '1914-08-26', image: 'war', title: 'Togolandia', condition: [war('GER'), owns('togo', 'GER')],
    text: 'Columnas británicas desde la Costa de Oro y francesas desde Dahomey han rodeado la colonia alemana de Togo, cuya estación de radio de Kamina enlaza Berlín con todo el imperio colonial.',
    note: 'La guarnición alemana se rindió el 26 de agosto de 1914 tras volar la estación de Kamina. Fue la primera victoria aliada de la guerra; Togo se repartió después entre Francia y Gran Bretaña.',
    options: [opt('Ocupar Togo', [CEDE('GER', 'FRA', ['togo']), PR(10), CH('Togo se rinde a las tropas francobritánicas.')], 1)] }),
  E({ id: 'w14_rabaul', tag: 'AUS', date: '1914-09-11', image: 'war', title: 'Rabaul', condition: [war('GER'), owns('png', 'GER')],
    text: 'La Fuerza Naval y Militar Expedicionaria Australiana ha desembarcado en Nueva Bretaña para silenciar las estaciones de radio alemanas de la Nueva Guinea.',
    note: 'Tras el combate de Bita Paka (11 de septiembre de 1914), la Nueva Guinea alemana capituló en pocos días y quedó bajo administración australiana.',
    options: [opt('Ocupar la Nueva Guinea alemana', [CEDE('GER', 'AUS', ['png']), PR(15), CH('Australia ocupa la Nueva Guinea alemana.')], 1)] }),
  E({ id: 'w14_maritz', tag: 'SAF', date: '1914-10-12', image: 'revolt', title: 'La rebelión de Maritz', condition: [war('GER')],
    text: 'El teniente coronel Maritz se ha pasado a los alemanes con sus hombres, y los generales bóeres De Wet y Beyers llaman a sublevarse antes que invadir el África del Sudoeste por cuenta de Londres.',
    note: 'La rebelión (octubre de 1914-febrero de 1915) movilizó a unos 12 000 afrikáners. Botha la sofocó con tropas también afrikáners para no convertirla en una guerra entre comunidades.',
    options: [
      opt('Que Botha la sofoque con sus propios comandos', [DIS(4), NU(-5), REL('GER', -30), CH('El gobierno sudafricano sofoca la rebelión bóer.')], 8),
      opt('Pedir tropas británicas', [DIS(8), NU(-10), REL('ENG', 20)], 2),
    ] }),
  E({ id: 'w14_tanga', tag: 'ENG', date: '1914-11-02', image: 'disaster', title: 'Tanga', condition: [war('GER'), owns('tanzania', 'GER')],
    text: 'Una fuerza india desembarca en Tanga para tomar el puerto de la línea del Usambara, pero las tropas de Lettow-Vorbeck la esperan en la selva. Las abejas de los árboles cercanos desbandan a ambos bandos.',
    note: 'El desembarco de Tanga (2-5 de noviembre de 1914) fue un desastre británico. Paul von Lettow-Vorbeck mantuvo a sus askaris en campaña hasta el 25 de noviembre de 1918 sin ser derrotado.',
    options: [
      opt('Reembarcar y preparar una campaña mayor', [PR(-15), SUP(-300), CH('El desembarco británico en Tanga termina en desastre.')], 1),
    ] }),
  E({ id: 'w14_swa', tag: 'SAF', date: '1915-07-09', image: 'war', title: 'Khorab', condition: [war('GER'), owns('namibia', 'GER')],
    text: 'Las columnas sudafricanas de Botha han cruzado el desierto del Namib con camellos, ferrocarriles de campaña y automóviles. La Schutztruppe del África del Sudoeste está cercada en el norte.',
    note: 'Las fuerzas alemanas se rindieron en Khorab el 9 de julio de 1915. El territorio quedó como mandato sudafricano hasta la independencia de Namibia en 1990.',
    options: [opt('Aceptar la rendición', [CEDE('GER', 'SAF', ['namibia', 'karas']), PR(30), NU(5), CH('Sudáfrica ocupa el África del Sudoeste alemana.')], 1)] }),
  E({ id: 'w14_kamerun', tag: 'FRA', date: '1916-02-18', image: 'war', title: 'Camerún', condition: [war('GER'), owns('cameroon', 'GER')],
    text: 'Tras año y medio de campaña en la selva, los últimos defensores alemanes de Camerún se retiran hacia la Guinea española, neutral. Solo resiste la fortaleza de Mora, en el norte.',
    note: 'Varios miles de soldados alemanes y africanos se internaron en la Guinea española en febrero de 1916; Mora capituló el 18 de febrero. Francia y Gran Bretaña se repartieron la colonia.',
    options: [opt('Ocupar Camerún', [CEDE('GER', 'FRA', ['cameroon']), PR(20), CH('Camerún queda en manos francobritánicas.')], 1)] }),
  E({ id: 'w14_darfur', tag: 'ENG', date: '1916-05-22', image: 'war', title: 'La expedición de Darfur', condition: [exists('DAR'), war('OTT')],
    text: 'El sultán Ali Dinar ha respondido a la llamada otomana a la guerra santa y se niega a reconocer la autoridad de Jartum. Una columna anglo-egipcia, con aviones y ametralladoras, avanza hacia El Fasher.',
    note: 'El Fasher cayó el 23 de mayo de 1916 y Ali Dinar murió en noviembre. Darfur se incorporó al Sudán anglo-egipcio.',
    options: [opt('Anexionar Darfur', [{ type: 'annex', target: 'DAR' }, PR(10), CH('Darfur queda incorporado al Sudán anglo-egipcio.')], 1)] }),
];

const PEACE: GameEvent[] = [
  E({ id: 'w14_cze_free', tag: 'CZE', date: '1918-11-15', image: 'peace', title: 'La República Checoslovaca', condition: [flag('cze_indep'), maxX('nu', -100), until(1921)],
    text: 'Masaryk vuelve del exilio como presidente. Las tropas checas ocupan Eslovaquia.',
    options: [opt('Construir el nuevo Estado', [...FREE('CZE'), { type: 'release', tag: 'AUH', target: 'CZE' }, CEDE('HUN', 'CZE', ['upper_hungary']), GOV('democracy'), RESTORE(80), CH('Nace Checoslovaquia, con Bohemia, Moravia y Eslovaquia.')], 1)] }),
  E({ id: 'w14_hun_free', tag: 'HUN', date: '1918-11-15', image: 'peace', title: 'Una Hungría independiente', condition: [flag('hun_indep'), maxX('nu', -100), until(1921)],
    text: 'La unión con Austria ha terminado, pero las tropas rumanas, serbias y checas avanzan sobre territorios que Budapest considera suyos.',
    options: [opt('Aceptar la línea de armisticio', [...FREE('HUN'), { type: 'release', tag: 'AUH', target: 'HUN' }, RESTORE(80), DIS(10)], 1)] }),
  E({ id: 'w14_versailles', tag: 'GER', date: '1919-06-01', image: 'peace', title: 'El Tratado de Versalles', condition: [flag('armistice'), until(1921)],
    text: 'Los aliados presentan sus condiciones sin negociación: pérdida de Alsacia-Lorena y de los territorios polacos, desmilitarización de Renania, un ejército de cien mil hombres, reparaciones y un artículo que atribuye a Alemania la responsabilidad de la guerra.',
    note: 'El tratado se firmó el 28 de junio de 1919 en la Galería de los Espejos. Alemania tuvo que anular la paz de Brest-Litovsk; en el este nacieron Polonia y los Estados bálticos, que este mapa no puede representar por separado.',
    options: [
      opt('Firmar bajo protesta', [...FREE('GER'), CEDE('GER', 'RUS', ['mazovia', 'lithuania', 'courland', 'livonia', 'estonia', 'belarus', 'kiev']), ...MANDATES, X('navy', -8), X('subs', -3), X('fighters', -1), RESTORE(70), DIS(15), FL('versailles'), CH('Alemania firma el Tratado de Versalles.')], 9),
      opt('Rechazarlo y reanudar la guerra', [...FREE('GER'), RESTORE(40), DIS(30)], 1, 'Sin ejército ni flota, una apuesta suicida.'),
    ] }),
  E({ id: 'w14_st_germain', tag: 'AUH', date: '1919-09-01', image: 'peace', title: 'El Tratado de Saint-Germain', condition: [flag('aus_armistice'), until(1921)],
    text: 'Del imperio de cincuenta millones de habitantes queda una pequeña república alpina, a la que se prohíbe unirse a Alemania. Italia recibe el Tirol del Sur y el reino de los serbios, croatas y eslovenos, Bosnia y Dalmacia.',
    options: [opt('Aceptar las fronteras', [...FREE('AUH'), CEDE('AUH', 'ITA', ['tyrol']), CEDE('AUH', 'SER', ['bosnia', 'dalmatia']), GOV('democracy'), RESTORE(70), DIS(10), CH('El Tratado de Saint-Germain liquida el Imperio austro-húngaro.')], 1)] }),
  E({ id: 'w14_neuilly', tag: 'BUL', date: '1919-11-01', image: 'peace', title: 'El Tratado de Neuilly', condition: [flag('bul_armistice'), until(1921)],
    text: 'Bulgaria pierde su salida al Egeo y debe pagar reparaciones. El zar Fernando ha abdicado en su hijo Boris.',
    options: [opt('Aceptar el tratado', [...FREE('BUL'), GOV('authoritarian'), RESTORE(70), DIS(8)], 1)] }),
  E({ id: 'w14_trianon', tag: 'HUN', date: '1920-06-01', image: 'peace', title: 'El Tratado de Trianon', condition: [flag('hun_indep'), until(1922)],
    text: 'Hungría pierde dos tercios de su territorio y millones de húngaros quedan fuera de sus fronteras. El almirante Horthy gobierna como regente de un reino sin rey.',
    options: [opt('Firmar bajo protesta', [...FREE('HUN'), CEDE('HUN', 'ROM', ['transylvania']), CEDE('HUN', 'SER', ['croatia']), GOV('authoritarian'), RESTORE(70), DIS(10), CH('Hungría firma el Tratado de Trianon.')], 1)] }),
  E({ id: 'w14_san_remo', tag: 'OTT', date: '1920-04-01', image: 'peace', title: 'Los mandatos', condition: [flag('ott_armistice'), until(1922)],
    text: 'En San Remo, británicos y franceses se reparten las provincias árabes como mandatos de la Sociedad de Naciones. En Anatolia, Mustafa Kemal organiza la resistencia contra la ocupación aliada.',
    note: 'Las provincias árabes pasaron a ser mandatos británicos (Palestina, Transjordania, Irak) y franceses (Siria y Líbano). La guerra de independencia turca (1919-1923) anuló el Tratado de Sèvres y dio paso a la República de Turquía.',
    options: [opt('Resistir en Anatolia', [...FREE('OTT'), CEDE('OTT', 'ENG', ['jerusalem', 'acre', 'baghdad', 'basra', 'mosul']), CEDE('OTT', 'ENG', ['jordan', 'tel_aviv', 'west_bank', 'gaza']), CEDE('OTT', 'FRA', ['damascus', 'aleppo', 'antioch', 'beirut', 'latakia', 'deir_ez_zor']), GOV('authoritarian'), RESTORE(80), CH('Los mandatos británicos y franceses sustituyen al dominio otomano en Oriente Próximo.')], 1)] }),
];

// ------------------------------------------------------------------ eventos dinámicos
const POOL: GameEvent[] = [
  // si una paz blanca deja la guerra a medias, el Mando Supremo alemán (IA) vuelve a la carga: el escenario necesita un frente occidental
  P({ id: 'w14p_no_peace', tag: 'GER', mtthMonths: 4, image: 'war', title: 'No hay paz sin victoria', condition: [{ type: 'isPlayer', value: false }, flag('schlieffen'), flag('armistice', undefined, false), { type: 'notVassal' }, exists('FRA'), until(1918)],
    text: 'El Mando Supremo considera que una paz sin anexiones sería una derrota.',
    options: [opt('Mantener o reanudar la guerra en el oeste', [DW('FRA', 'champagne')], 1)] }),
  P({ id: 'w14p_mutiny', mtthMonths: 150, image: 'revolt', title: 'Motín en el frente', condition: [{ type: 'minWarMonths', value: 24 }, minX('dissent', 20), until(1919)],
    text: 'Un regimiento se niega a salir de las trincheras para un nuevo asalto. Los soldados no desertan: exigen permisos y que no se les envíe a morir en vano.',
    options: [opt('Atender sus quejas', [DIS(-3), CMB(-0.02)], 6, 'La disciplina se resiente, la moral mejora.'), opt('Disolver la unidad y repartir a los hombres', [DIS(4), NU(-2)], 4)] }),
  P({ id: 'w14p_war_loan', mtthMonths: 200, image: 'prosperity', title: 'Empréstito de guerra', condition: [atWar(), until(1919)],
    text: 'El ministerio de Hacienda lanza una nueva suscripción de bonos de guerra con carteles en todas las calles.',
    options: [opt('Campaña patriótica', [SUP(500), DIS(-1)], 6), opt('Pedir préstamos al extranjero', [SUP(800), PR(-10)], 4)] }),
  P({ id: 'w14p_munitions_strike', mtthMonths: 200, image: 'revolt', title: 'Huelga en las fábricas de munición', condition: [atWar(), minX('dissent', 15), until(1919)],
    text: 'Los obreros del metal paran contra la carestía de la vida y las jornadas de doce horas.',
    options: [opt('Subir salarios', [DIS(-4), SUP(-300)], 6), opt('Militarizar las fábricas', [DIS(4), IC(1)], 4)] }),
  P({ id: 'w14p_bread', mtthMonths: 220, image: 'disaster', title: 'Colas del pan', condition: [{ type: 'minWarMonths', value: 18 }, until(1919)],
    text: 'Faltan harina, carbón y grasas. Las mujeres hacen colas de horas que a menudo terminan en disturbios.',
    options: [opt('Cartillas de racionamiento', [DIS(2), SUP(300)], 6), opt('Requisar las cosechas en el campo', [DIS(5), SUP(600)], 4)] }),
  P({ id: 'w14p_shells', mtthMonths: 180, image: 'disaster', title: 'Falta de proyectiles', condition: [atWar(), maxX('stock_supplies', 400), until(1919)],
    text: 'Las baterías del frente reciben unos pocos disparos por cañón al día. Los generales culpan a la industria; la industria, a la falta de obreros cualificados.',
    options: [opt('Licenciar obreros especializados del ejército', [MP(-40000), SUP(700)], 6), opt('Racionar la artillería', [CMB(-0.02), SUP(300)], 4)] }),
  P({ id: 'w14p_flu_wave', mtthMonths: 40, image: 'disaster', title: 'Nueva oleada de gripe', condition: [year(1918), until(1919)],
    text: 'La epidemia vuelve con fuerza en los cuarteles y en los barrios obreros.',
    options: [opt('Cuarentenas y hospitales de campaña', [SUP(-300), MP(-20000)], 5), opt('Seguir como si nada', [MP(-60000), DIS(2)], 5)] }),
  P({ id: 'w14p_desertion', mtthMonths: 220, image: 'revolt', title: 'Deserciones', condition: [{ type: 'minWarMonths', value: 30 }, minX('dissent', 25), until(1919)],
    text: 'Cada noche desaparecen soldados de los trenes que van al frente. En el campo, los desertores se esconden con ayuda de sus familias.',
    options: [opt('Amnistía para quien regrese', [MP(30000), DIS(-2)], 6), opt('Patrullas de gendarmería', [MP(15000), DIS(3)], 4)] }),
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
  // Alemania
  M('m14_ger_west', 'GER', 0, 'war', 'Victoria en el oeste', 'Ocupar al menos dos de las provincias clave del norte de Francia.', [{ type: 'ownsCount', provinces: ['ile_de_france', 'champagne', 'picardie', 'lorraine'], count: 2 }], [PR(80), NU(10), CH('El norte de Francia queda en manos alemanas.')]),
  M('m14_ger_channel', 'GER', 0, 'war', 'Los puertos del canal', 'Controlar Flandes y su costa.', [owns('flandre')], [X('subs', 2), PR(20)], ['m14_ger_west']),
  M('m14_ger_prussia', 'GER', 1, 'war', 'Proteger Prusia Oriental', 'Conservar Prusia Oriental en 1915.', [year(1915), owns('prussia')], [CMB(0.03), PR(20)]),
  M('m14_ger_ostland', 'GER', 1, 'court', 'Mitteleuropa', 'Dominar al menos tres provincias del antiguo oeste ruso.', [{ type: 'ownsCount', provinces: ['mazovia', 'lithuania', 'courland', 'livonia', 'belarus'], count: 3 }], [MP(150000), SUP(1000)], ['m14_ger_prussia']),
  M('m14_ger_ukraine', 'GER', 1, 'prosperity', 'El granero de Ucrania', 'Hacerse con el trigo de Kiev para romper el bloqueo.', [owns('kiev')], [SUP(2000), DIS(-5)], ['m14_ger_ostland']),
  M('m14_ger_navy', 'GER', 2, 'explore', 'La flota de alta mar', 'Una flota capaz de desafiar a la Royal Navy.', [minX('navy', 16)], [TECH('naval', 1), PR(20)]),
  M('m14_ger_industry', 'GER', 3, 'prosperity', 'Economía de guerra', 'Llevar la industria al nivel que exige una guerra de desgaste.', [minX('ic', 80)], [IC(3), TECH('industry', 1)]),
  // Francia
  M('m14_fra_paris', 'FRA', 0, 'war', 'Defender París', 'Conservar París en 1915.', [year(1915), owns('ile_de_france')], [NU(5), PR(30)]),
  M('m14_fra_verdun', 'FRA', 0, 'war', 'Verdún no caerá', 'Conservar Lorena en 1917.', [year(1917), owns('lorraine')], [NU(8), PR(50), CH('Verdún resiste.')], ['m14_fra_paris']),
  M('m14_fra_rhine', 'FRA', 1, 'war', 'Hasta el Rin', 'Llevar la guerra al otro lado de la frontera: controlar Renania o Suabia.', [{ type: 'ownsCount', provinces: ['rhineland', 'swabia'], count: 1 }], [PR(100), CH('Las tropas francesas llegan al Rin.')]),
  M('m14_fra_industry', 'FRA', 2, 'prosperity', 'El arsenal de la República', 'Recuperar la capacidad industrial perdida en el norte ocupado.', [minX('ic', 38)], [IC(2), SUP(800)]),
  M('m14_fra_tanks', 'FRA', 2, 'explore', 'Carros de asalto', 'Disponer de carros de combate.', [minX('unlock_armor', 1)], [TECH('armor', 1)], ['m14_fra_industry']),
  M('m14_fra_victory', 'FRA', 3, 'peace', 'La revancha', 'Que Alemania firme el armisticio.', [flag('armistice', 'GER')], [PR(200), NU(10), CH('Francia sale victoriosa de la Gran Guerra.')]),
  // Reino Unido
  M('m14_eng_navy', 'ENG', 0, 'explore', 'Dominio de los mares', 'Mantener una flota superior a cualquier otra.', [minX('navy', 22)], [TECH('naval', 1), PR(20)]),
  M('m14_eng_channel', 'ENG', 0, 'war', 'Calais y Boulogne', 'Que los puertos del canal sigan siendo franceses en 1916.', [year(1916), owns('picardie', 'FRA')], [NU(5), SUP(800)], ['m14_eng_navy']),
  M('m14_eng_munitions', 'ENG', 1, 'prosperity', 'Municiones', 'Una industria de guerra capaz de alimentar un ejército de masas.', [minX('ic', 70)], [IC(3), SUP(1000)]),
  M('m14_eng_tanks', 'ENG', 1, 'explore', 'El carro de combate', 'Desarrollar un arma capaz de cruzar la tierra de nadie.', [minX('unlock_armor', 1)], [TECH('armor', 1), CMB(0.03)], ['m14_eng_munitions']),
  M('m14_eng_baghdad', 'ENG', 2, 'war', 'Bagdad', 'Tomar Bagdad.', [owns('baghdad')], [PR(40), X('stock_oil', 800)]),
  M('m14_eng_jerusalem', 'ENG', 2, 'war', 'Jerusalén', 'Entrar en Jerusalén.', [owns('jerusalem')], [PR(60), CH('Las tropas británicas entran en Jerusalén.')], ['m14_eng_baghdad']),
  M('m14_eng_victory', 'ENG', 3, 'peace', 'El fin de la guerra', 'Que Alemania firme el armisticio.', [flag('armistice', 'GER')], [PR(200), DIS(-10)]),
  // Rusia
  M('m14_rus_galicia', 'RUS', 0, 'war', 'Galitzia', 'Tomar Lemberg o Cracovia.', [{ type: 'ownsCount', provinces: ['red_ruthenia', 'malopolska'], count: 1 }], [PR(40), MP(150000)]),
  M('m14_rus_hungary', 'RUS', 0, 'war', 'Cruzar los Cárpatos', 'Llegar a la llanura húngara.', [{ type: 'ownsCount', provinces: ['hungary', 'upper_hungary', 'transylvania'], count: 1 }], [PR(60)], ['m14_rus_galicia']),
  M('m14_rus_prussia', 'RUS', 1, 'war', 'Prusia Oriental', 'Ocupar Prusia Oriental.', [owns('prussia')], [PR(60), NU(5)]),
  M('m14_rus_shells', 'RUS', 1, 'prosperity', 'Proyectiles para el frente', 'Acumular reservas suficientes para una ofensiva sostenida.', [minX('stock_supplies', 3000)], [CMB(0.05), IC(2)]),
  M('m14_rus_armenia', 'RUS', 2, 'war', 'Erzurum', 'Tomar la fortaleza de Erzurum en el frente del Cáucaso.', [owns('armenia')], [PR(40), MP(60000)]),
  M('m14_rus_straits', 'RUS', 2, 'war', 'Constantinopla', 'El viejo sueño de los zares: los Estrechos.', [owns('constantinople')], [PR(150), CH('Constantinopla cae en manos rusas.')], ['m14_rus_armenia']),
  M('m14_rus_hold', 'RUS', 3, 'court', 'Varsovia sigue siendo rusa', 'Conservar Varsovia en 1916.', [year(1916), owns('mazovia')], [NU(8), DIS(-5)]),
  // Austria-Hungría
  M('m14_auh_serbia', 'AUH', 0, 'war', 'Castigar a Serbia', 'Ocupar Serbia.', [owns('serbia')], [PR(60), MP(80000), CH('Belgrado cae en manos austro-húngaras.')]),
  M('m14_auh_galicia', 'AUH', 1, 'war', 'Defender Galitzia', 'Conservar Cracovia y Lemberg en 1915.', [year(1915), { type: 'ownsAll', provinces: ['malopolska', 'red_ruthenia'] }], [NU(5), CMB(0.03)]),
  M('m14_auh_piave', 'AUH', 2, 'war', 'Más allá del Isonzo', 'Ocupar el Véneto.', [owns('venezia')], [PR(60)]),
  M('m14_auh_romania', 'AUH', 2, 'war', 'El petróleo rumano', 'Ocupar Valaquia.', [owns('wallachia')], [X('stock_oil', 1000), PR(30)]),
  M('m14_auh_survive', 'AUH', 3, 'court', 'La monarquía sobrevive', 'Llegar a 1919 conservando Viena y la independencia.', [year(1919), { type: 'notVassal' }, owns('austria')], [PR(150), CH('La monarquía de los Habsburgo sobrevive a la guerra.')]),
  // Italia
  M('m14_ita_trentino', 'ITA', 0, 'war', 'Trento', 'Tomar el Tirol.', [owns('tyrol')], [PR(60), NU(5)]),
  M('m14_ita_dalmatia', 'ITA', 0, 'war', 'Dalmacia', 'Asegurar la otra orilla del Adriático.', [owns('dalmatia')], [PR(40), X('navy', 1)], ['m14_ita_trentino']),
  M('m14_ita_piave', 'ITA', 1, 'war', 'Resistir en el Piave', 'Conservar Venecia en 1918.', [year(1918), owns('venezia')], [NU(10), CMB(0.05)]),
  M('m14_ita_industry', 'ITA', 2, 'prosperity', 'La industria de guerra', 'Triplicar la producción de las fábricas del norte.', [minX('ic', 20)], [IC(2), SUP(600)]),
  M('m14_ita_navy', 'ITA', 3, 'explore', 'El Adriático', 'Una flota capaz de embotellar a la austríaca.', [minX('navy', 8)], [TECH('naval', 1)]),
  // Imperio otomano
  M('m14_ott_straits', 'OTT', 0, 'war', 'Defender los Estrechos', 'Conservar Constantinopla en 1916.', [year(1916), owns('constantinople')], [NU(8), PR(40)]),
  M('m14_ott_caucasus', 'OTT', 1, 'war', 'Kars y Batumi', 'Recuperar las provincias perdidas ante Rusia en 1878.', [owns('georgia')], [PR(60), MP(40000)]),
  M('m14_ott_suez', 'OTT', 2, 'war', 'Hacia el canal', 'Tomar el Sinaí.', [owns('sinai')], [PR(40)]),
  M('m14_ott_egypt', 'OTT', 2, 'war', 'Egipto', 'Recuperar El Cairo para el sultán.', [owns('cairo')], [PR(100), CH('Las tropas otomanas entran en El Cairo.')], ['m14_ott_suez']),
  M('m14_ott_baghdad', 'OTT', 3, 'war', 'Bagdad', 'Conservar Bagdad y Jerusalén en 1918.', [year(1918), owns('baghdad'), owns('jerusalem')], [NU(5), PR(40)]),
  // Serbia
  M('m14_ser_hold', 'SER', 0, 'war', 'Serbia resiste', 'Conservar Belgrado en 1915.', [year(1915), owns('serbia')], [NU(5), PR(40)]),
  M('m14_ser_bosnia', 'SER', 1, 'war', 'Bosnia', 'Liberar Bosnia del dominio austríaco.', [owns('bosnia')], [PR(60), MP(40000)]),
  M('m14_ser_yugo', 'SER', 1, 'court', 'Los eslavos del sur', 'Reunir Bosnia, Croacia y Dalmacia.', [{ type: 'ownsCount', provinces: ['bosnia', 'croatia', 'dalmatia'], count: 2 }], [PR(120), CH('Nace el reino de los serbios, croatas y eslovenos.')], ['m14_ser_bosnia']),
  M('m14_ser_macedonia', 'SER', 2, 'war', 'Macedonia', 'Conservar Macedonia en 1917.', [year(1917), owns('macedonia')], [NU(5)]),
  M('m14_ser_allies', 'SER', 3, 'peace', 'Amigos poderosos', 'Contar con al menos tres aliados.', [{ type: 'minAllies', value: 3 }], [SUP(600), PR(20)]),
];

export const ww1914: Scenario = {
  id: 'ww1914', era: 'ww2', menu: 'ww2', map: 'world', name: '1914 — La Gran Guerra',
  description: 'Sarajevo, 28 de junio de 1914. Un atentado en los Balcanes pone en marcha el mecanismo de alianzas y planes de movilización que arrastrará a Europa a una guerra industrial sin precedentes: trincheras, gas, submarinos, revoluciones y el fin de cuatro imperios.',
  start: '1914-06-28', end: '1925-01-01',
  options: { allowedUnits: ['militia', 'infantry', 'mountain', 'cavalry', 'artillery', 'marines'], artEra: 'ww1', fullWorld: true },
  nations: nations(), factions: FACTIONS, provinceOverrides: overrides(),
  events: timed([...CRISIS, ...WAR, ...COLONIAL, ...PEACE]).concat(POOL.flatMap((e) => (!e.mtthMonths || e.condition?.some((c) => c.type === 'isPlayer' && !c.value) ? [e] : capped(e, e.id === 'sp_p_foreign_credit' ? 2 : 3)))), missions: MISSIONS,
  relations: [
    ['GER', 'AUH', 150], ['FRA', 'RUS', 70], ['ENG', 'FRA', 70], ['ENG', 'RUS', 30], ['RUS', 'SER', 70], ['AUH', 'SER', -150], ['GER', 'FRA', -100], ['GER', 'ENG', -40],
    ['GER', 'RUS', -30], ['AUH', 'RUS', -80], ['ITA', 'AUH', -40], ['ITA', 'GER', 30], ['OTT', 'RUS', -100], ['OTT', 'GER', 40], ['BUL', 'SER', -100], ['BUL', 'GRE', -60], ['GRE', 'OTT', -80],
    ['ROM', 'HUN', -60], ['ENG', 'USA', 60], ['GER', 'USA', 0], ['FRA', 'BEL', 60], ['ENG', 'BEL', 60], ['AUH', 'HUN', 150], ['AUH', 'CZE', 100], ['ENG', 'EGY', 60], ['ENG', 'CAN', 150],
    ['ENG', 'AUS', 150], ['ENG', 'NZL', 150], ['ENG', 'SAF', 100], ['ENG', 'RAJ', 120], ['ENG', 'JAP', 60], ['GER', 'JAP', -20], ['RUS', 'JAP', 20], ['JAP', 'CHN', -60], ['USA', 'JAP', -10],
    ['USA', 'MEX', -60], ['SER', 'MNE', 120], ['AUH', 'MNE', -80], ['GER', 'LUX', 40], ['RUS', 'MNG', 60], ['CHN', 'MNG', -80], ['CHN', 'TIB', -80], ['ENG', 'TIB', 30],
    ['NEJ', 'SHM', -100], ['OTT', 'SHM', 60], ['OTT', 'NEJ', -20], ['ENG', 'NEJ', 30], ['ENG', 'OMA', 60], ['ENG', 'AFG', 20], ['ENG', 'NEP', 60], ['ENG', 'BHU', 40], ['RUS', 'PER', -20], ['ENG', 'PER', -10],
    ['CHL', 'PRU', -40], ['CHL', 'BOL', -40], ['PRY', 'BOL', -30], ['ARG', 'BRA', -10], ['ARG', 'CHL', -10], ['HAI', 'HTI', -30], ['ETH', 'ITA', -40],
  ],
  recommended: ['GER', 'FRA', 'ENG', 'RUS', 'AUH', 'ITA', 'OTT', 'SER'],
};
