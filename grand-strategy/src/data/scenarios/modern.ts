import type { NationDef, Scenario } from '@/engine/core';
import type { Condition, Effect, EventOption, GameEvent, Mission } from '@/engine/types';
import { WORLD_COUNTRY_2014 } from '@/data/world_index';
import { N } from './helpers';

/*
 * 2014 — El mundo en tensión.
 * Del Euromaidán y Crimea (febrero de 2014) a 2050. Hasta noviembre de 2026 los eventos siguen
 * hechos documentados; a partir de ahí, todo lo que ocurre está marcado como escenario hipotético.
 * Reglas de contenido: tono sobrio, sin opciones de juego que consistan en atacar a civiles,
 * sin mecánica de ataque nuclear (la disuasión solo aparece como contexto que frena escaladas).
 * Órdenes de magnitud del ruleset ww2: CI nacional 1–120, mano de obra en hombres,
 * reservas (stock_*) 500–20 000, disidencia 0–100, unidad nacional (nu) en %, combat ≈ 1.
 */

// ------------------------------------------------------------------ helpers
const R = 'secular';
type Ex = Parameters<typeof N>[7];
const W = (tag: string, name: string, color: string, provs: string[], culture: string, gov: string, extra: Ex = {}) => N(tag, name, color, provs, R, culture, gov, extra);

const E = (e: GameEvent): GameEvent => ({ oneShot: true, ...e });
const T = (e: GameEvent): GameEvent => ({ oneShot: true, triggeredOnly: true, ...e });
const HYP = 'Escenario hipotético.';
const yr = (from: number, to: number): Condition[] => [{ type: 'minYear', value: from }, { type: 'maxYear', value: to }];
/** hypothetical event: always flagged in the note and bounded in time */
const H = (e: GameEvent, from: number, to: number): GameEvent => ({ oneShot: true, ...e, note: e.note ? `${HYP} ${e.note}` : HYP, condition: [...(e.condition ?? []), ...yr(from, to)] });
const HT = (e: GameEvent, from: number, to: number): GameEvent => ({ ...H(e, from, to), triggeredOnly: true });
const P = (e: Omit<GameEvent, 'oneShot'>): GameEvent => ({ ...e, oneShot: false });

const opt = (label: string, effects: Effect[], aiWeight?: number, hint?: string): EventOption => ({ label, effects, aiWeight, hint });
const X = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'x', tag, key, amount } : { type: 'x', key, amount });
const MP = (amount: number, tag?: string): Effect => (tag ? { type: 'manpower', tag, amount } : { type: 'manpower', amount });
const PR = (amount: number, tag?: string): Effect => (tag ? { type: 'prestige', tag, amount } : { type: 'prestige', amount });
const ST = (amount: number, tag?: string): Effect => (tag ? { type: 'stability', tag, amount } : { type: 'stability', amount });
const TRS = (amount: number, tag?: string): Effect => (tag ? { type: 'treasury', tag, amount } : { type: 'treasury', amount });
const INF = (amount: number): Effect => ({ type: 'infamy', amount });
const REL = (other: string, amount: number, tag?: string): Effect => (tag ? { type: 'relations', tag, other, amount } : { type: 'relations', other, amount });
const RELS = (others: string[], amount: number, tag?: string): Effect[] => others.map((o) => REL(o, amount, tag));
const ALL = (amount: number): Effect => ({ type: 'relationsWith', religion: R, amount });
const TECH = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'tech', tag, key, amount } : { type: 'tech', key, amount });
const FL = (flag: string, tag?: string): Effect => (tag ? { type: 'flag', tag, flag } : { type: 'flag', flag });
const TR = (event: string, days: number, tag?: string): Effect => (tag ? { type: 'trigger', tag, event, days } : { type: 'trigger', event, days });
const CH = (text: string, tag?: string): Effect => (tag ? { type: 'chronicle', tag, text } : { type: 'chronicle', text });
const UNREST = (province: string, amount: number): Effect => ({ type: 'unrest', province, amount });
const ARMY = (province: string, units: Record<string, number>, tag?: string): Effect => (tag ? { type: 'spawnArmy', tag, province, units } : { type: 'spawnArmy', province, units });
const IC = (amount: number, tag?: string): Effect => X('factory', amount, tag);
const DIS = (amount: number, tag?: string): Effect => X('dissent', amount, tag);
const NU = (amount: number, tag?: string): Effect => X('nu', amount, tag);
const CMB = (amount: number, tag?: string): Effect => X('combat', amount, tag);
const OIL = (amount: number, tag?: string): Effect => X('stock_oil', amount, tag);
const NRG = (amount: number, tag?: string): Effect => X('stock_energy', amount, tag);
const RARE = (amount: number, tag?: string): Effect => X('stock_rare', amount, tag);
const RP = (amount: number, tag?: string): Effect => X('rp', amount, tag);
const BOMBED = (amount: number, tag?: string): Effect => X('bombed', amount, tag);

const war = (other: string, tag?: string): Condition => (tag ? { type: 'atWarWith', tag, other } : { type: 'atWarWith', other });
const peace: Condition = { type: 'atWar', value: false };
const exists = (tag: string): Condition => ({ type: 'exists', tag });
const owns = (province: string, tag?: string): Condition => (tag ? { type: 'owns', province, tag } : { type: 'owns', province });
const flag = (f: string, tag?: string): Condition => (tag ? { type: 'flag', flag: f, tag, value: true } : { type: 'flag', flag: f, value: true });
const noFlag = (f: string, tag?: string): Condition => (tag ? { type: 'flag', flag: f, tag, value: false } : { type: 'flag', flag: f, value: false });
const minX = (key: string, value: number): Condition => ({ type: 'minX', key, value });
const maxX = (key: string, value: number): Condition => ({ type: 'maxX', key, value });
const year = (value: number): Condition => ({ type: 'minYear', value });

// blocs, for relation effects
const NATO_EU = ['GBR', 'FRA', 'GER', 'ITA', 'ESP', 'POL', 'NLD', 'BEL'];
const WEST = ['USA', ...NATO_EU, 'CAN', 'JAP', 'AUS'];
const GULF = ['SAU', 'UAE', 'QAT', 'KUW', 'OMA'];
const IMPORTERS = ['JAP', 'KOR', 'IND', 'CHN', 'GER', 'ITA', 'TAI'];

// ------------------------------------------------------------------ economy (CI, puntos de victoria y recursos diarios)
const ECON: Record<string, Partial<Record<'ic' | 'energy' | 'metal' | 'rare' | 'oil' | 'vp', number>>> = {
  // América
  virginia: { ic: 30, vp: 30, energy: 30, metal: 15 }, new_england: { ic: 35, vp: 20 }, carolina: { ic: 15, oil: 25, energy: 10 }, florida: { ic: 12, vp: 5 }, guam: { vp: 3 },
  new_france: { ic: 8, oil: 20, metal: 10 }, newfoundland: { oil: 3 }, mexico: { ic: 6, vp: 10 }, veracruz: { oil: 12, ic: 1 }, yucatan: { ic: 1 },
  bahia: { ic: 5, oil: 8 }, pernambuco: { ic: 3, metal: 5 }, venezuela: { oil: 20 }, new_granada: { ic: 2, oil: 5 }, peru: { metal: 8, rare: 3 },
  // Europa
  london: { ic: 10, vp: 25 }, midlands: { ic: 4 }, lowlands: { ic: 2, oil: 8 }, york: { ic: 2 }, wessex: { ic: 2 }, east_anglia: { ic: 1 },
  ile_de_france: { ic: 10, vp: 25 }, lyonnais: { ic: 3 }, provence: { ic: 2 }, toulouse: { ic: 3 }, normandie: { ic: 1, energy: 10 }, lorraine: { ic: 1 },
  westfalen: { ic: 7 }, swabia: { ic: 7 }, bavaria: { ic: 7 }, brandenburg: { ic: 3, vp: 20 }, hesse: { ic: 3 }, hannover: { ic: 3 }, saxony: { ic: 2 }, rhineland: { ic: 3 },
  lombardia: { ic: 6 }, piemonte: { ic: 3 }, venezia: { ic: 2 }, roma: { ic: 2, vp: 15 }, toscana: { ic: 1 }, napoli: { ic: 1 },
  castilla_nueva: { ic: 4, vp: 15 }, cataluna: { ic: 3 }, valencia: { ic: 1 }, andalucia: { ic: 1 }, holland: { ic: 5, vp: 5 }, frisia: { energy: 10 }, brabant: { ic: 3, vp: 10 },
  silesia: { ic: 2, energy: 15 }, mazovia: { ic: 2, vp: 10 }, wielkopolska: { ic: 1 }, bohemia: { ic: 2 }, svealand: { ic: 3 }, norrland: { metal: 15 }, bergen: { oil: 20 }, oslo: { ic: 2 },
  sjaelland: { ic: 2 }, finland: { ic: 2 }, austria: { ic: 2 }, switzerland: { ic: 4 }, wallachia: { oil: 3, ic: 1 }, hungary: { ic: 1 }, thessaly: { ic: 1 }, lisboa: { ic: 1 }, leinster: { ic: 2 },
  // Ucrania y Rusia
  kiev: { ic: 2, vp: 15 }, kharkiv: { ic: 2, vp: 10 }, donbas: { ic: 2, energy: 15, metal: 5, vp: 12 }, zaporozhye: { ic: 1, metal: 10, energy: 8, vp: 8 }, kherson: { vp: 6 }, poltava: { ic: 1, vp: 4 }, odesa: { ic: 1, vp: 8 }, crimea: { vp: 10 }, red_ruthenia: { ic: 1, vp: 4 }, chernigov: { vp: 4 }, podolia: { vp: 4 }, volhynia: { vp: 3 },
  moscow: { ic: 8, vp: 40 }, smolensk: { vp: 6 }, pskov: { vp: 4 }, ingria: { ic: 4, vp: 10 }, ural: { ic: 4, metal: 20, rare: 3 }, nizhny: { ic: 2 }, kazan: { ic: 1, oil: 10 }, samara: { ic: 1, oil: 8 }, tsaritsyn: { ic: 1, vp: 8 }, don: { ic: 1, vp: 10 },
  kuban: { oil: 3, vp: 8 }, central_siberia: { ic: 2, oil: 20, metal: 10, rare: 2 }, omsk: { ic: 1, oil: 15 }, east_siberia: { metal: 8, energy: 10 }, khabarovsk: { oil: 5 }, vladivostok: { ic: 1 }, astrakhan: { oil: 4 }, archangelsk: { ic: 1 }, voronezh: { ic: 1, vp: 6 }, kursk: { metal: 8, vp: 8 },
  // Oriente Medio y Norte de África
  constantinople: { ic: 5, vp: 15 }, ankara: { ic: 2, vp: 10 }, bithynia: { ic: 2 }, aydin: { ic: 1 }, cilicia: { ic: 1 },
  tel_aviv: { ic: 5, vp: 10 }, jerusalem: { vp: 20 }, acre: { ic: 1 }, gaza: { vp: 5 }, west_bank: { vp: 5 },
  tehran: { ic: 4, vp: 20 }, isfahan: { ic: 2, vp: 5 }, khuzestan: { oil: 30 }, fars: { oil: 8 }, hormozgan: { oil: 5, vp: 10 }, tabriz: { ic: 1 }, khorasan: { ic: 1 },
  al_hasa: { oil: 50, ic: 2 }, najd: { ic: 2, vp: 15 }, hejaz: { vp: 10, ic: 1 }, basra: { oil: 30 }, mosul: { oil: 8 }, baghdad: { ic: 1, vp: 10 }, kuwait: { oil: 20 }, qatar: { oil: 15, energy: 20 },
  emirates: { oil: 20, ic: 2 }, oman: { oil: 5 }, azerbaijan: { oil: 15 }, kazakh_west: { oil: 20 }, kazakh_central: { metal: 10, rare: 2 }, cyrenaica: { oil: 10 }, tripoli: { oil: 5 }, algiers: { oil: 5, energy: 15 },
  cairo: { ic: 2, vp: 15 }, sinai: { energy: 3, vp: 5 }, alexandria: { ic: 1 }, deir_ez_zor: { oil: 3 }, damascus: { vp: 10 }, sanaa: { vp: 5 }, aden: { vp: 5 },
  // Asia y Pacífico
  shanghai: { ic: 16, vp: 20 }, guangdong: { ic: 18, vp: 10 }, beijing: { ic: 10, vp: 30 }, wuhan: { ic: 6 }, fujian: { ic: 5, vp: 5 }, sichuan: { ic: 5 }, manchuria: { ic: 5, oil: 8 },
  inner_mongolia: { rare: 40, energy: 20, ic: 2 }, xinjiang: { oil: 8, energy: 10 }, gansu: { rare: 5, metal: 5 }, yunnan: { metal: 5 }, qinghai: { metal: 3 },
  taiwan: { ic: 14, vp: 40 }, kanto: { ic: 16, vp: 25 }, kansai: { ic: 8 }, kyushu: { ic: 3 }, hokkaido: { ic: 1 }, south_korea: { ic: 14, vp: 15 }, pyongyang: { ic: 1, metal: 3 },
  delhi: { ic: 5, vp: 20 }, mumbai: { ic: 5, vp: 5 }, deccan: { ic: 4 }, bengal: { ic: 2 }, central_india: { ic: 1, energy: 15, metal: 8 }, kashmir: { vp: 3 }, punjab: { ic: 2, vp: 10 }, sindh: { ic: 1 },
  java: { ic: 4, vp: 5 }, sumatra: { oil: 8 }, australia: { ic: 6, metal: 30, rare: 8, energy: 20 }, vietnam: { ic: 3 }, indochina: { ic: 3 }, luzon: { ic: 2 }, myanmar: { rare: 5 },
  kongo: { rare: 10, metal: 5 }, gold_coast: { metal: 3 }, mongolia: { metal: 5, energy: 8 },
  // ---- mapa mundial ampliado: provincias nuevas de los Estados ya presentes (valores moderados para no alterar el equilibrio)
  new_york: { ic: 6, vp: 15 }, great_lakes: { ic: 6, vp: 5 }, california: { ic: 8, vp: 10 }, texas: { ic: 4, oil: 25, energy: 10, vp: 5 }, pacific_nw: { ic: 2 },
  north_slope: { oil: 6 }, great_plains: { oil: 5 }, rockies: { metal: 5, energy: 5 }, hawaii: { vp: 5 }, puerto_rico: { vp: 2 },
  ontario: { ic: 5, vp: 8 }, alberta: { oil: 25, ic: 1 }, british_columbia: { ic: 1, metal: 5 }, athabasca: { oil: 5 }, northern_ontario: { metal: 5 },
  monterrey: { ic: 3, vp: 4 }, jalisco: { ic: 2 }, chihuahua: { ic: 1 }, baja_california: { ic: 1 },
  sao_paulo: { ic: 9, vp: 12 }, rio: { ic: 3, oil: 15, vp: 6 }, minas: { ic: 2, metal: 15 }, para: { metal: 8 }, parana: { ic: 1 }, rio_grande_sul: { ic: 1 }, goias: { vp: 5 },
  zulia: { oil: 12 }, guayana_ve: { metal: 5 }, llanos: { oil: 8 }, peru_south: { metal: 8 },
  tyumen: { oil: 25, ic: 1 }, yamal: { energy: 25 }, tomsk: { oil: 3 }, mirny: { metal: 4, rare: 2 }, yakutsk: { metal: 3 }, sakhalin: { oil: 5, energy: 5 }, murmansk: { ic: 1 }, komi: { oil: 3 },
  mangystau: { oil: 10 }, kazakh_east: { metal: 8, rare: 2 }, almaty: { ic: 1, vp: 5 },
  hail: { vp: 2 }, rub_al_khali: { oil: 5 }, hadramaut: { oil: 2 }, dhofar: { oil: 2 },
  gujarat: { ic: 3, oil: 3 }, tamil_nadu: { ic: 2 }, karnataka: { ic: 2, vp: 4 }, odisha: { metal: 8, energy: 5 }, bihar: { energy: 4 }, assam: { oil: 2 }, uttar_pradesh: { ic: 1 },
  balochistan: { energy: 3, metal: 2 },
  shandong: { ic: 6, oil: 4 }, henan: { ic: 3 }, hunan: { ic: 2 }, shaanxi: { ic: 1, energy: 10 }, guangxi: { ic: 1, rare: 3 }, heilongjiang: { oil: 8 }, hainan: { vp: 3 },
  gobi: { metal: 8 }, saigon: { ic: 3, oil: 3 }, annam: { ic: 1 }, yangon: { ic: 1, vp: 5 }, kachin: { rare: 3 }, mindanao: { metal: 2 }, visayas: { ic: 1 },
  east_kalimantan: { energy: 15, oil: 4 }, kalimantan: { energy: 5 }, west_papua: { metal: 10 }, sulawesi: { metal: 4 },
  upper_egypt: { vp: 3 }, western_desert: { oil: 4 }, fezzan: { oil: 4 }, ouargla: { oil: 15, energy: 10 },
  kinshasa: { ic: 1, vp: 8 }, katanga: { metal: 12, rare: 8 }, kivu: { rare: 4 },
  pilbara: { metal: 20 }, nsw: { ic: 3, energy: 10, vp: 8 }, victoria_au: { ic: 2, vp: 5 }, mount_isa: { metal: 5, rare: 4 }, queensland: { energy: 8 },
  greenland: { rare: 2 }, french_guiana: { vp: 3 }, new_caledonia: { metal: 6 },
  // ---- Estados que se incorporan con el mapa mundial
  bahrain: { oil: 2, ic: 1 }, turkmenistan: { energy: 20, oil: 3 }, tajikistan: { metal: 2 }, kyrgyzstan: { metal: 3 },
  bangladesh: { ic: 2, energy: 4 }, sri_lanka: { ic: 1 }, nepal: { ic: 0 }, malaya: { ic: 4, oil: 3, vp: 6 }, sarawak: { oil: 5, energy: 8 }, sabah: { oil: 3 },
  singapore: { ic: 5, vp: 10 }, brunei: { oil: 4 }, east_timor: { oil: 1 }, laos: { metal: 2 }, cambodia: { ic: 1 },
  mauritania: { metal: 4 }, khartoum: { ic: 1 }, nubia: { metal: 2 }, darfur: { oil: 1 }, south_sudan: { oil: 6 },
  ivory_coast: { ic: 1 }, mali: { metal: 3 }, niger: { energy: 3 }, agadez: { energy: 6, rare: 2 },
  lagos: { ic: 3, vp: 10 }, nigeria_delta: { oil: 25, energy: 10 }, abuja: { ic: 1 }, kano: { vp: 4 }, chad: { oil: 2 }, cameroon: { oil: 2, ic: 1 },
  equatorial_guinea: { oil: 5 }, gabon: { oil: 4, metal: 3 }, congo_brazzaville: { oil: 5 },
  ethiopia: { ic: 1, vp: 6 }, kenya: { ic: 1, vp: 5 }, tanzania: { metal: 2 }, dar_es_salaam: { ic: 1, energy: 3 },
  luanda: { oil: 20, ic: 1 }, huambo: { metal: 2 }, zambia: { metal: 12 }, zimbabwe: { metal: 4, rare: 2 }, botswana: { metal: 4 }, namibia: { metal: 3, rare: 2 }, maputo: { energy: 6 },
  transvaal: { ic: 5, metal: 15, rare: 3, energy: 15, vp: 10 }, cape: { ic: 2, vp: 5 }, natal: { ic: 1 }, antananarivo: { metal: 2 },
  trinidad: { oil: 3, energy: 5 }, ecuador: { oil: 8 }, la_paz: { metal: 4 }, santa_cruz: { energy: 8 },
  atacama: { metal: 20, rare: 2 }, santiago: { ic: 2, vp: 4 }, buenos_aires: { ic: 6, vp: 5 }, cordoba: { ic: 1 }, patagonia: { oil: 6, energy: 6 }, mendoza: { oil: 2 },
  uruguay: { ic: 1 }, paraguay: { energy: 4 },
  nz_north: { ic: 1 }, nz_south: { energy: 2 }, port_moresby: { energy: 4, metal: 3 },
};

function econ(): Scenario['provinceOverrides'] {
  const o: NonNullable<Scenario['provinceOverrides']> = {};
  for (const [pid, e] of Object.entries(ECON)) o[pid] = { x: { ...e } };
  // fortified capitals and front lines
  for (const pid of ['kiev', 'taiwan', 'jerusalem', 'moscow', 'beijing']) o[pid] = { ...(o[pid] ?? {}), fort: 3 };
  o.donbas = { ...o.donbas, fort: 2 };
  o.kharkiv = { ...o.kharkiv, fort: 2 };
  return o;
}

const FACTIONS = {
  nato: { name: 'OTAN', leader: 'USA', color: '#2f5fa8' },
  /** hypothetical: only formed if the bloc-against-bloc path is taken */
  eurasia: { name: 'Pacto Euroasiático', leader: 'CHN', color: '#a33a2c' },
};

// ------------------------------------------------------------------ nations (2014)
function nations(): NationDef[] {
  const nato = { faction: 'nato' };
  return [
    // América
    W('USA', 'Estados Unidos', '#3c5a9a', ['virginia', 'new_england', 'carolina', 'florida', 'guam'], 'american', 'democracy', {
      ...nato, manpower: 1_400_000, tech: { infantry: 3, armor: 3, air: 4, naval: 4, industry: 3, doctrine: 3, ai: 1 }, x: { nu: 90, fighters: 30, bombers: 12, navy: 40, subs: 12, combat: 1.3 },
      armies: [{ province: 'virginia', units: { infantry: 6, armor: 3, marines: 3, artillery: 2 }, name: 'Mando Norte' }, { province: 'guam', units: { marines: 2 }, name: 'Mando del Indo-Pacífico' }],
    }),
    W('CAN', 'Canadá', '#c0392b', ['new_france', 'newfoundland'], 'american', 'democracy', { ...nato, x: { navy: 3, fighters: 3 } }),
    W('MEX', 'México', '#1e8449', ['mexico', 'veracruz', 'yucatan'], 'latin', 'democracy'),
    W('GUA', 'Guatemala', '#5dade2', ['guatemala'], 'latin', 'democracy'),
    W('CUB', 'Cuba', '#2874a6', ['cuba'], 'latin', 'authoritarian'),
    W('DOM', 'República Dominicana', '#922b21', ['hispaniola'], 'latin', 'democracy'),
    W('PAN', 'Panamá', '#f0b27a', ['panama'], 'latin', 'democracy'),
    W('COL', 'Colombia', '#f4d03f', ['new_granada'], 'latin', 'democracy'),
    W('VEN', 'Venezuela', '#b03a2e', ['venezuela'], 'latin', 'authoritarian'),
    W('PER', 'Perú', '#e74c3c', ['peru'], 'latin', 'democracy'),
    W('BRA', 'Brasil', '#27ae60', ['bahia', 'pernambuco'], 'latin', 'democracy', { manpower: 400_000 }),
    // Europa occidental
    W('GBR', 'Reino Unido', '#b03a2e', ['london', 'wessex', 'cornwall', 'midlands', 'east_anglia', 'york', 'northumbria', 'wales', 'lowlands', 'highlands', 'ulster'], 'english', 'democracy', {
      ...nato, tech: { infantry: 3, armor: 2, air: 3, naval: 3, industry: 2, doctrine: 3 }, x: { nu: 85, fighters: 8, bombers: 3, navy: 10, subs: 4, combat: 1.2 }, armies: [{ province: 'london', units: { infantry: 3, armor: 1, marines: 1 } }],
    }),
    W('FRA', 'Francia', '#2e86c1', ['ile_de_france', 'picardie', 'normandie', 'bretagne', 'champagne', 'lorraine', 'bourgogne', 'anjou', 'poitou', 'guyenne', 'gascogne', 'toulouse', 'languedoc', 'provence', 'lyonnais', 'auvergne', 'berry', 'dauphine', 'corsica'], 'french', 'democracy', {
      ...nato, tech: { infantry: 3, armor: 2, air: 3, naval: 3, industry: 2, doctrine: 3 }, x: { nu: 85, fighters: 9, bombers: 3, navy: 9, subs: 4, combat: 1.2 }, armies: [{ province: 'ile_de_france', units: { infantry: 4, armor: 1, marines: 1 } }],
    }),
    W('GER', 'Alemania', '#5d6d7e', ['brandenburg', 'rhineland', 'westfalen', 'hannover', 'hesse', 'saxony', 'mecklenburg', 'pomerania', 'holstein', 'franconia', 'swabia', 'bavaria'], 'german', 'democracy', {
      ...nato, tech: { infantry: 2, armor: 3, air: 2, naval: 2, industry: 3, doctrine: 2 }, x: { nu: 80, fighters: 6, bombers: 1, navy: 4, subs: 3, combat: 1.1 }, armies: [{ province: 'brandenburg', units: { infantry: 3, armor: 2 } }],
    }),
    W('ITA', 'Italia', '#229954', ['roma', 'piemonte', 'lombardia', 'venezia', 'genova', 'toscana', 'romagna', 'abruzzo', 'napoli', 'puglia', 'calabria', 'sicilia', 'sardegna'], 'italian', 'democracy', { ...nato, tech: { infantry: 2, armor: 2, air: 2, naval: 2, industry: 2 }, x: { fighters: 5, navy: 6, subs: 2 } }),
    W('ESP', 'España', '#e6a23c', ['castilla_nueva', 'castilla_vieja', 'galicia', 'asturias', 'leon', 'navarra', 'aragon', 'cataluna', 'valencia', 'murcia', 'andalucia', 'granada', 'extremadura', 'baleares', 'canarias'], 'spanish', 'democracy', {
      ...nato, tech: { infantry: 2, armor: 2, air: 2, naval: 2, industry: 2 }, x: { fighters: 5, navy: 5, subs: 1 }, armies: [{ province: 'castilla_nueva', units: { infantry: 3, armor: 1 } }],
    }),
    W('POR', 'Portugal', '#16a085', ['lisboa', 'porto', 'algarve', 'azores'], 'latin', 'democracy', { ...nato, x: { navy: 2 } }),
    W('IRL', 'Irlanda', '#58d68d', ['leinster', 'munster', 'connacht'], 'english', 'democracy', { x: { nu: 70 } }),
    W('ISL', 'Islandia', '#85c1e9', ['iceland'], 'nordic', 'democracy', { ...nato }),
    W('BEL', 'Bélgica', '#f4d03f', ['brabant', 'flandre'], 'french', 'democracy', { ...nato }),
    W('NLD', 'Países Bajos', '#e67e22', ['holland', 'frisia'], 'german', 'democracy', { ...nato, x: { navy: 3, fighters: 2 } }),
    W('SWI', 'Suiza', '#e74c3c', ['switzerland'], 'german', 'democracy', { x: { nu: 100, neutral: 1 } }),
    W('AUT', 'Austria', '#ecf0f1', ['austria', 'styria', 'tyrol'], 'german', 'democracy', { x: { neutral: 1 } }),
    W('DEN', 'Dinamarca', '#cd6155', ['sjaelland', 'jylland'], 'nordic', 'democracy', { ...nato, x: { navy: 2 } }),
    W('NOR', 'Noruega', '#a93226', ['oslo', 'bergen', 'trondelag'], 'nordic', 'democracy', { ...nato, x: { navy: 3, fighters: 2 } }),
    W('SWE', 'Suecia', '#2471a3', ['svealand', 'gotaland', 'norrland', 'skane'], 'nordic', 'democracy', { x: { navy: 3, fighters: 4, subs: 2 }, tech: { air: 2, industry: 2 } }),
    W('FIN', 'Finlandia', '#d6eaf8', ['finland', 'osterbotten'], 'nordic', 'democracy', { x: { nu: 95, fighters: 3 }, tech: { infantry: 2, doctrine: 2 }, armies: [{ province: 'finland', units: { infantry: 4, artillery: 2 } }] }),
    // Europa central y oriental
    W('POL', 'Polonia', '#ec7063', ['mazovia', 'wielkopolska', 'malopolska', 'silesia', 'danzig'], 'polish', 'democracy', { ...nato, tech: { infantry: 2, armor: 2 }, x: { fighters: 3 }, armies: [{ province: 'mazovia', units: { infantry: 3, armor: 1 } }] }),
    W('CZE', 'Chequia', '#5dade2', ['bohemia', 'moravia'], 'czech', 'democracy', { ...nato }),
    W('SVK', 'Eslovaquia', '#3498db', ['upper_hungary'], 'czech', 'democracy', { ...nato }),
    W('HUN', 'Hungría', '#196f3d', ['hungary', 'pannonia'], 'magyar', 'democracy', { ...nato }),
    W('ROU', 'Rumanía', '#f7dc6f', ['wallachia', 'transylvania', 'dobruja'], 'romanian', 'democracy', { ...nato }),
    W('BUL', 'Bulgaria', '#1e8449', ['bulgaria'], 'balkan', 'democracy', { ...nato }),
    W('GRE', 'Grecia', '#85c1e9', ['thessaly', 'morea', 'crete'], 'greek', 'democracy', { ...nato, x: { navy: 3, fighters: 3 } }),
    W('CYP', 'Chipre', '#f5cba7', ['cyprus'], 'greek', 'democracy'),
    W('CRO', 'Croacia', '#aed6f1', ['croatia', 'dalmatia'], 'balkan', 'democracy', { ...nato }),
    W('BIH', 'Bosnia y Herzegovina', '#2e4053', ['bosnia'], 'balkan', 'democracy'),
    W('SRB', 'Serbia', '#a04000', ['serbia'], 'balkan', 'democracy', { x: { neutral: 1 } }),
    W('ALB', 'Albania', '#922b21', ['albania'], 'balkan', 'democracy', { ...nato }),
    W('MKD', 'Macedonia del Norte', '#d35400', ['macedonia'], 'balkan', 'democracy'),
    W('MDA', 'Moldavia', '#f39c12', ['moldavia'], 'romanian', 'democracy'),
    W('EST', 'Estonia', '#2874a6', ['estonia'], 'baltic', 'democracy', { ...nato }),
    W('LAT', 'Letonia', '#943126', ['livonia', 'courland'], 'baltic', 'democracy', { ...nato }),
    W('LIT', 'Lituania', '#b7950b', ['lithuania'], 'baltic', 'democracy', { ...nato }),
    W('UKR', 'Ucrania', '#f1c40f', ['kiev', 'chernigov', 'poltava', 'kharkiv', 'donbas', 'zaporozhye', 'kherson', 'odesa', 'podolia', 'volhynia', 'red_ruthenia', 'crimea'], 'ukrainian', 'democracy', {
      manpower: 600_000, tech: { infantry: 1, armor: 1, air: 1, industry: 1 }, x: { nu: 95, fighters: 3, navy: 1, combat: 0.95, stubborn: 200 },
      armies: [{ province: 'kiev', units: { infantry: 3, armor: 1 }, name: 'Mando Norte' }, { province: 'kharkiv', units: { infantry: 2, artillery: 1 }, name: 'Mando Oriental' }],
    }),
    W('BLR', 'Bielorrusia', '#8e7a6b', ['belarus'], 'belarusian', 'authoritarian', { armies: [{ province: 'belarus', units: { infantry: 2 } }] }),
    W('RUS', 'Rusia', '#8e2b2b', ['moscow', 'ingria', 'novgorod', 'pskov', 'tver', 'smolensk', 'ryazan', 'vladimir', 'yaroslavl', 'vologda', 'archangelsk', 'nizhny', 'kazan', 'kursk', 'voronezh', 'don', 'kuban', 'tsaritsyn', 'astrakhan', 'samara', 'ural', 'karelia', 'prussia', 'stavropol', 'north_caucasus', 'omsk', 'central_siberia', 'east_siberia', 'khabarovsk', 'vladivostok'], 'russian', 'authoritarian', {
      manpower: 1_000_000, tech: { infantry: 2, armor: 3, air: 2, naval: 2, industry: 2, doctrine: 1 }, x: { nu: 95, fighters: 14, bombers: 8, navy: 10, subs: 8, combat: 0.85, stubborn: 200 },
      armies: [{ province: 'moscow', units: { infantry: 5, armor: 2, artillery: 2 }, name: 'Distrito Militar Occidental' }, { province: 'don', units: { infantry: 4, armor: 2, artillery: 2 }, name: 'Distrito Militar Sur' }, { province: 'vladivostok', units: { infantry: 2 }, name: 'Distrito Militar Oriental' }],
    }),
    // Cáucaso, Turquía y Asia central
    W('TUR', 'Turquía', '#117864', ['ankara', 'constantinople', 'thrace', 'bithynia', 'aydin', 'konya', 'trebizond', 'sivas', 'cilicia', 'antioch', 'armenia', 'diyarbakir'], 'turkish', 'democracy', {
      ...nato, manpower: 600_000, tech: { infantry: 2, armor: 2, air: 2, naval: 2, industry: 1 }, x: { nu: 85, fighters: 8, navy: 5, subs: 3 }, armies: [{ province: 'ankara', units: { infantry: 4, armor: 1 } }, { province: 'diyarbakir', units: { infantry: 2, mountain: 1 } }],
    }),
    W('GEO', 'Georgia', '#e74c3c', ['georgia'], 'georgian', 'democracy'),
    W('ARM', 'Armenia', '#d68910', ['yerevan', 'karabakh'], 'armenian', 'democracy', { armies: [{ province: 'karabakh', units: { infantry: 2, mountain: 1 } }] }),
    W('AZE', 'Azerbaiyán', '#3498db', ['azerbaijan'], 'turkish', 'authoritarian', { armies: [{ province: 'azerbaijan', units: { infantry: 3 } }] }),
    W('KAZ', 'Kazajistán', '#5dade2', ['kazakh_central', 'kazakh_west'], 'turkestani', 'authoritarian'),
    W('UZB', 'Uzbekistán', '#48c9b0', ['uzbekistan'], 'turkestani', 'authoritarian'),
    W('AFG', 'Afganistán', '#7b7d7d', ['afghanistan'], 'afghan', 'democracy'),
    // Oriente Medio
    W('ISR', 'Israel', '#2e86c1', ['jerusalem', 'tel_aviv', 'acre'], 'hebrew', 'democracy', {
      manpower: 300_000, tech: { infantry: 3, armor: 3, air: 4, naval: 2, industry: 2, doctrine: 3, ai: 1 }, x: { nu: 95, fighters: 10, bombers: 3, navy: 2, subs: 2, combat: 1.35 },
      armies: [{ province: 'tel_aviv', units: { infantry: 3, armor: 2 } }, { province: 'acre', units: { infantry: 2 } }],
    }),
    W('PAL', 'Palestina', '#229954', ['west_bank', 'gaza'], 'arab', 'authoritarian', { manpower: 50_000 }),
    W('LEB', 'Líbano', '#d5f5e3', ['beirut'], 'arab', 'democracy'),
    W('JOR', 'Jordania', '#a9cce3', ['jordan'], 'arab', 'authoritarian'),
    W('SYR', 'Siria', '#7b241c', ['damascus', 'aleppo', 'latakia', 'deir_ez_zor'], 'arab', 'authoritarian', { x: { dissent: 40, nu: 80 }, armies: [{ province: 'damascus', units: { infantry: 3 } }] }),
    W('IRQ', 'Irak', '#7dcea0', ['baghdad', 'mosul', 'basra'], 'arab', 'democracy', { x: { dissent: 20 }, armies: [{ province: 'baghdad', units: { infantry: 3 } }] }),
    W('IRN', 'Irán', '#45b39d', ['tehran', 'tabriz', 'isfahan', 'khuzestan', 'fars', 'hormozgan', 'khorasan', 'sistan'], 'persian', 'authoritarian', {
      manpower: 700_000, tech: { infantry: 2, armor: 1, air: 1, naval: 1, industry: 1 }, x: { nu: 85, fighters: 4, navy: 4, subs: 2 },
      armies: [{ province: 'tehran', units: { infantry: 5, armor: 1 } }, { province: 'khuzestan', units: { infantry: 3 } }],
    }),
    W('SAU', 'Arabia Saudí', '#1d8348', ['najd', 'hejaz', 'al_hasa', 'tabuk'], 'arab', 'authoritarian', { treasury: 400, tech: { air: 3, armor: 2 }, x: { fighters: 8, navy: 2 }, armies: [{ province: 'najd', units: { infantry: 3, armor: 1 } }] }),
    W('KUW', 'Kuwait', '#a2d9ce', ['kuwait'], 'arab', 'authoritarian'),
    W('QAT', 'Catar', '#76448a', ['qatar'], 'arab', 'authoritarian', { treasury: 300 }),
    W('UAE', 'Emiratos Árabes Unidos', '#117a65', ['emirates'], 'arab', 'authoritarian', { treasury: 300, tech: { air: 2 }, x: { fighters: 3 } }),
    W('OMA', 'Omán', '#cb4335', ['oman'], 'arab', 'authoritarian'),
    W('YEM', 'Yemen', '#c39bd3', ['aden', 'sanaa'], 'arab', 'authoritarian'),
    W('HOU', 'Ansar Alá (hutíes)', '#4a235a', ['saada'], 'arab', 'authoritarian', { armies: [{ province: 'saada', units: { infantry: 2, mountain: 1 } }] }),
    // Norte de África y África
    W('EGY', 'Egipto', '#d4ac0d', ['cairo', 'alexandria', 'sinai'], 'arab', 'authoritarian', { manpower: 500_000, armies: [{ province: 'cairo', units: { infantry: 4, armor: 1 } }] }),
    W('LBY', 'Libia', '#1c2833', ['tripoli', 'cyrenaica'], 'arab', 'authoritarian', { x: { dissent: 40 } }),
    W('TUN', 'Túnez', '#e6b0aa', ['tunis'], 'arab', 'democracy'),
    W('ALG', 'Argelia', '#0e6655', ['algiers', 'oran'], 'arab', 'authoritarian'),
    W('MAR', 'Marruecos', '#a93226', ['fez', 'tangier', 'marrakesh'], 'arab', 'authoritarian'),
    W('SEN', 'Senegal', '#52be80', ['senegal'], 'african', 'democracy'),
    W('CPV', 'Cabo Verde', '#2e86c1', ['cape_verde'], 'african', 'democracy'),
    W('GIN', 'Guinea', '#f5b041', ['guinea'], 'african', 'authoritarian'),
    W('GHA', 'Ghana', '#d4ac0d', ['gold_coast'], 'african', 'democracy'),
    W('COD', 'R. D. del Congo', '#5499c7', ['kongo'], 'african', 'authoritarian'),
    // Asia meridional
    W('IND', 'India', '#ff9933', ['delhi', 'kashmir', 'central_india', 'mumbai', 'deccan', 'bengal'], 'indian', 'democracy', {
      manpower: 1_500_000, tech: { infantry: 2, armor: 2, air: 2, naval: 2, industry: 2 }, x: { nu: 85, fighters: 10, navy: 8, subs: 3 },
      armies: [{ province: 'kashmir', units: { infantry: 4, mountain: 2 }, name: 'Mando Norte' }, { province: 'delhi', units: { infantry: 3, armor: 2 } }],
    }),
    W('PAK', 'Pakistán', '#145a32', ['punjab', 'sindh'], 'pakistani', 'democracy', { manpower: 700_000, tech: { infantry: 2, armor: 1, air: 2 }, x: { nu: 85, fighters: 6, navy: 2 }, armies: [{ province: 'punjab', units: { infantry: 4, armor: 1 } }] }),
    W('MMR', 'Birmania', '#b9770e', ['myanmar'], 'burmese', 'authoritarian'),
    // Asia oriental y Pacífico
    W('CHN', 'China', '#c0392b', ['beijing', 'shanghai', 'guangdong', 'fujian', 'wuhan', 'sichuan', 'yunnan', 'gansu', 'qinghai', 'xinjiang', 'tibet', 'inner_mongolia', 'manchuria'], 'chinese', 'authoritarian', {
      manpower: 2_500_000, tech: { infantry: 2, armor: 2, air: 3, naval: 3, industry: 3, doctrine: 1, ai: 1 }, x: { nu: 90, fighters: 20, bombers: 6, navy: 25, subs: 8 },
      armies: [{ province: 'beijing', units: { infantry: 5, armor: 2 }, name: 'Teatro Norte' }, { province: 'fujian', units: { infantry: 4, marines: 2, artillery: 2 }, name: 'Teatro Oriental' }, { province: 'guangdong', units: { infantry: 3 }, name: 'Teatro Sur' }],
    }),
    W('TAI', 'Taiwán', '#1a5276', ['taiwan'], 'chinese', 'democracy', {
      manpower: 250_000, tech: { infantry: 2, armor: 1, air: 3, naval: 2, industry: 3 }, x: { nu: 95, fighters: 6, navy: 4, subs: 1 }, armies: [{ province: 'taiwan', units: { infantry: 4, artillery: 2, marines: 1 } }],
    }),
    W('JAP', 'Japón', '#f5b7b1', ['kanto', 'kansai', 'kyushu', 'hokkaido'], 'japanese', 'democracy', {
      allies: ['USA'], tech: { infantry: 2, armor: 2, air: 3, naval: 3, industry: 3 }, x: { nu: 80, fighters: 8, navy: 10, subs: 4 }, armies: [{ province: 'kanto', units: { infantry: 3, armor: 1 } }],
    }),
    W('KOR', 'Corea del Sur', '#2980b9', ['south_korea'], 'korean', 'democracy', {
      allies: ['USA'], manpower: 500_000, tech: { infantry: 2, armor: 2, air: 3, naval: 2, industry: 3 }, x: { nu: 90, fighters: 6, navy: 4 }, armies: [{ province: 'south_korea', units: { infantry: 5, armor: 2, artillery: 2 } }],
    }),
    W('PRK', 'Corea del Norte', '#7f8c8d', ['pyongyang'], 'korean', 'authoritarian', { manpower: 800_000, x: { nu: 100 }, armies: [{ province: 'pyongyang', units: { infantry: 6, artillery: 3 } }] }),
    W('MNG', 'Mongolia', '#2e86c1', ['mongolia'], 'mongol', 'democracy'),
    W('VIE', 'Vietnam', '#e74c3c', ['vietnam'], 'vietnamese', 'authoritarian', { armies: [{ province: 'vietnam', units: { infantry: 3 } }] }),
    W('THA', 'Tailandia', '#a569bd', ['indochina'], 'thai', 'authoritarian'),
    W('PHI', 'Filipinas', '#5dade2', ['luzon'], 'filipino', 'democracy', { allies: ['USA'] }),
    W('IDN', 'Indonesia', '#cb4335', ['java', 'sumatra'], 'malay', 'democracy', { manpower: 500_000 }),
    W('AUS', 'Australia', '#1abc9c', ['australia'], 'english', 'democracy', { allies: ['USA'], tech: { air: 3, naval: 2, industry: 2 }, x: { fighters: 4, navy: 4, subs: 2 } }),
    // ---- Estados que se incorporan con el mapa mundial (capital real primero; el resto lo completa worldFill)
    // Europa
    W('LUX', 'Luxemburgo', '#7fb3d5', ['luxembourg'], 'german', 'democracy', { ...nato }),
    W('SVN', 'Eslovenia', '#45b39d', ['slovenia'], 'balkan', 'democracy', { ...nato }),
    W('MNE', 'Montenegro', '#b9770e', ['montenegro'], 'balkan', 'democracy'),
    W('XKX', 'Kosovo', '#5b7bd5', ['kosovo'], 'albanian', 'democracy'),
    W('MLT', 'Malta', '#e59866', ['malta'], 'maltese', 'democracy', { x: { neutral: 1 } }),
    // Golfo, Asia central y meridional
    W('BHR', 'Baréin', '#d98880', ['bahrain'], 'arab', 'authoritarian', { treasury: 150 }),
    W('TKM', 'Turkmenistán', '#239b56', ['turkmenistan'], 'turkestani', 'authoritarian', { x: { neutral: 1 } }),
    W('TJK', 'Tayikistán', '#d4a017', ['tajikistan'], 'persian', 'authoritarian'),
    W('KGZ', 'Kirguistán', '#cd5c5c', ['kyrgyzstan'], 'turkestani', 'democracy'),
    W('NPL', 'Nepal', '#c2185b', ['nepal'], 'nepali', 'democracy'),
    W('BTN', 'Bután', '#f39c12', ['bhutan'], 'tibetan', 'democracy'),
    W('BGD', 'Bangladés', '#006a4e', ['bangladesh'], 'bengali', 'democracy', { manpower: 300_000 }),
    W('LKA', 'Sri Lanka', '#8d6e63', ['sri_lanka'], 'sinhala', 'democracy'),
    W('MDV', 'Maldivas', '#00897b', ['maldives'], 'maldivian', 'democracy'),
    // Sudeste asiático
    W('LAO', 'Laos', '#5e35b1', ['laos'], 'lao', 'authoritarian'),
    W('KHM', 'Camboya', '#1565c0', ['cambodia'], 'khmer', 'authoritarian'),
    W('MYS', 'Malasia', '#f9a825', ['malaya', 'sarawak', 'sabah'], 'malay', 'democracy', { tech: { industry: 1, naval: 1 }, x: { navy: 2, fighters: 1 } }),
    W('SGP', 'Singapur', '#ef5350', ['singapore'], 'chinese', 'democracy', { treasury: 300, tech: { air: 2, naval: 2, industry: 2 }, x: { fighters: 2, navy: 2 } }),
    W('BRN', 'Brunéi', '#fdd835', ['brunei'], 'malay', 'authoritarian', { treasury: 200 }),
    W('TLS', 'Timor Oriental', '#d84315', ['east_timor'], 'timorese', 'democracy'),
    // África
    W('MRT', 'Mauritania', '#558b2f', ['mauritania'], 'arab', 'authoritarian'),
    W('SDN', 'Sudán', '#795548', ['khartoum', 'nubia', 'darfur'], 'arab', 'authoritarian', { x: { dissent: 30 } }),
    W('SSD', 'Sudán del Sur', '#5d4037', ['south_sudan'], 'african', 'authoritarian', { x: { dissent: 50 } }),
    W('GMB', 'Gambia', '#26a69a', ['gambia'], 'african', 'authoritarian'),
    W('GNB', 'Guinea-Bisáu', '#ab47bc', ['guinea_bissau'], 'african', 'democracy'),
    W('SLE', 'Sierra Leona', '#66bb6a', ['sierra_leone'], 'african', 'democracy'),
    W('LBR', 'Liberia', '#3949ab', ['liberia'], 'african', 'democracy'),
    W('CIV', 'Costa de Marfil', '#ff8f00', ['ivory_coast'], 'african', 'democracy'),
    W('MLI', 'Malí', '#9ccc65', ['mali', 'timbuktu'], 'african', 'democracy', { x: { dissent: 30 } }),
    W('BFA', 'Burkina Faso', '#e57373', ['burkina'], 'african', 'authoritarian'),
    W('TGO', 'Togo', '#43a047', ['togo'], 'african', 'authoritarian'),
    W('BEN', 'Benín', '#fbc02d', ['benin'], 'african', 'democracy'),
    W('NER', 'Níger', '#ffb74d', ['niger', 'agadez'], 'african', 'democracy'),
    W('NGA', 'Nigeria', '#388e3c', ['abuja', 'lagos', 'nigeria_delta', 'kano'], 'african', 'democracy', { manpower: 300_000, tech: { infantry: 1 }, x: { dissent: 20, fighters: 1 } }),
    W('TCD', 'Chad', '#3f51b5', ['chad', 'tibesti'], 'african', 'authoritarian'),
    W('CMR', 'Camerún', '#2e7d32', ['cameroon'], 'african', 'authoritarian'),
    W('GNQ', 'Guinea Ecuatorial', '#00acc1', ['equatorial_guinea'], 'african', 'authoritarian'),
    W('STP', 'Santo Tomé y Príncipe', '#aed581', ['sao_tome'], 'african', 'democracy'),
    W('GAB', 'Gabón', '#4db6ac', ['gabon'], 'african', 'authoritarian'),
    W('COG', 'Congo', '#81c784', ['congo_brazzaville'], 'african', 'authoritarian'),
    W('CAF', 'República Centroafricana', '#7986cb', ['car'], 'african', 'authoritarian', { x: { dissent: 50 } }),
    W('ERI', 'Eritrea', '#0097a7', ['eritrea'], 'african', 'authoritarian'),
    W('DJI', 'Yibuti', '#4fc3f7', ['djibouti'], 'african', 'authoritarian'),
    W('ETH', 'Etiopía', '#c0ca33', ['ethiopia', 'ogaden'], 'ethiopian', 'authoritarian', { manpower: 300_000, tech: { infantry: 1 } }),
    W('SOM', 'Somalia', '#64b5f6', ['somalia', 'somaliland', 'puntland'], 'somali', 'democracy', { x: { dissent: 50 } }),
    W('KEN', 'Kenia', '#b71c1c', ['kenya', 'kenya_north'], 'african', 'democracy'),
    W('UGA', 'Uganda', '#ffca28', ['uganda'], 'african', 'authoritarian'),
    W('RWA', 'Ruanda', '#29b6f6', ['rwanda'], 'african', 'authoritarian'),
    W('BDI', 'Burundi', '#e53935', ['burundi'], 'african', 'authoritarian'),
    W('TZA', 'Tanzania', '#00796b', ['tanzania', 'dar_es_salaam'], 'african', 'democracy'),
    W('AGO', 'Angola', '#c62828', ['luanda', 'huambo', 'moxico'], 'african', 'authoritarian', { treasury: 200, x: { fighters: 1 } }),
    W('ZMB', 'Zambia', '#689f38', ['zambia'], 'african', 'democracy'),
    W('MWI', 'Malaui', '#d32f2f', ['malawi'], 'african', 'democracy'),
    W('MOZ', 'Mozambique', '#ef6c00', ['maputo', 'nampula'], 'african', 'democracy'),
    W('ZWE', 'Zimbabue', '#e8c547', ['zimbabwe'], 'african', 'authoritarian'),
    W('BWA', 'Botsuana', '#81d4fa', ['botswana'], 'african', 'democracy'),
    W('NAM', 'Namibia', '#1e88e5', ['namibia', 'karas'], 'african', 'democracy'),
    W('ZAF', 'Sudáfrica', '#00897b', ['transvaal', 'natal', 'eastern_cape', 'cape', 'northern_cape'], 'african', 'democracy', { tech: { infantry: 1, armor: 1, air: 1, industry: 1 }, x: { fighters: 2, navy: 1 } }),
    W('LSO', 'Lesoto', '#4527a0', ['lesotho'], 'african', 'democracy'),
    W('SWZ', 'Suazilandia', '#6d4c41', ['eswatini'], 'african', 'authoritarian'),
    W('MDG', 'Madagascar', '#e64a19', ['antananarivo', 'toliara'], 'malagasy', 'democracy'),
    W('COM', 'Comoras', '#8bc34a', ['comoros'], 'african', 'democracy'),
    W('MUS', 'Mauricio', '#ec407a', ['mauritius'], 'african', 'democracy'),
    W('SYC', 'Seychelles', '#26c6da', ['seychelles'], 'african', 'democracy'),
    // Centroamérica y Caribe
    W('BLZ', 'Belice', '#1976d2', ['belize'], 'english', 'democracy'),
    W('HND', 'Honduras', '#4fc3f7', ['honduras'], 'latin', 'democracy'),
    W('SLV', 'El Salvador', '#1565c0', ['el_salvador'], 'latin', 'democracy'),
    W('NIC', 'Nicaragua', '#90caf9', ['nicaragua'], 'latin', 'authoritarian'),
    W('CRI', 'Costa Rica', '#7e57c2', ['costa_rica'], 'latin', 'democracy', { x: { neutral: 1 } }),
    W('HTI', 'Haití', '#3f51b5', ['haiti'], 'creole', 'democracy'),
    W('JAM', 'Jamaica', '#fbc02d', ['jamaica'], 'english', 'democracy'),
    W('BHS', 'Bahamas', '#00bcd4', ['bahamas'], 'english', 'democracy'),
    W('TTO', 'Trinidad y Tobago', '#d81b60', ['trinidad'], 'english', 'democracy'),
    W('BRB', 'Barbados', '#ffb300', ['barbados'], 'english', 'democracy'),
    // América del Sur
    W('GUY', 'Guyana', '#43a047', ['guyana'], 'english', 'democracy'),
    W('SUR', 'Surinam', '#827717', ['suriname'], 'creole', 'democracy'),
    W('ECU', 'Ecuador', '#ffd54f', ['ecuador'], 'latin', 'democracy'),
    W('BOL', 'Bolivia', '#66bb6a', ['la_paz', 'santa_cruz'], 'latin', 'democracy'),
    W('CHL', 'Chile', '#d50000', ['santiago', 'atacama', 'araucania', 'aysen'], 'latin', 'democracy', { tech: { infantry: 1, armor: 1, air: 1, naval: 1, industry: 1 }, x: { fighters: 2, navy: 2 } }),
    W('PRY', 'Paraguay', '#ef9a9a', ['paraguay'], 'latin', 'democracy'),
    W('URY', 'Uruguay', '#90caf9', ['uruguay'], 'latin', 'democracy'),
    W('ARG', 'Argentina', '#74acdf', ['buenos_aires'], 'latin', 'democracy', { manpower: 250_000, tech: { infantry: 1, industry: 1 }, x: { fighters: 2, navy: 2 } }),
    // Oceanía
    W('NZL', 'Nueva Zelanda', '#37474f', ['nz_north', 'nz_south'], 'english', 'democracy', { tech: { infantry: 2, naval: 1, industry: 1 }, x: { navy: 1 } }),
    W('PNG', 'Papúa Nueva Guinea', '#bf360c', ['port_moresby', 'png'], 'melanesian', 'democracy'),
    W('SLB', 'Islas Salomón', '#0277bd', ['solomon'], 'melanesian', 'democracy'),
    W('VUT', 'Vanuatu', '#558b2f', ['vanuatu'], 'melanesian', 'democracy'),
    W('FJI', 'Fiyi', '#4dd0e1', ['fiji'], 'melanesian', 'authoritarian'),
    W('PLW', 'Palaos', '#29b6f6', ['palau'], 'micronesian', 'democracy'),
  ].map((n) => ({ ...n, x: { aggression: 0, combat: 1, ...(n.x ?? {}) } }));
}

/*
 * Mapa mundial completo: cada provincia que ninguna nación lista a mano pasa al Estado que la gobernaba en
 * febrero de 2014 según WORLD_COUNTRY_2014 (ISO alfa-3). Los territorios de ultramar ya figuran allí con su
 * Estado soberano (Groenlandia → DEN, Guayana Francesa y Nueva Caledonia → FRA, Hawái, Puerto Rico y Guam → USA).
 * Crimea empieza ucraniana, como en el índice: la anexión llega por el evento m14_crimea.
 */
/** códigos ISO cuyo tag en este escenario es distinto */
const ISO_TAG: Record<string, string> = {
  GTM: 'GUA', DEU: 'GER', PRT: 'POR', CHE: 'SWI', DNK: 'DEN', BGR: 'BUL', GRC: 'GRE', HRV: 'CRO', LVA: 'LAT', LTU: 'LIT',
  PSE: 'PAL', LBN: 'LEB', KWT: 'KUW', ARE: 'UAE', OMN: 'OMA', DZA: 'ALG', TWN: 'TAI', JPN: 'JAP', VNM: 'VIE', PHL: 'PHI',
  // Sáhara Occidental: territorio no autónomo; en 2014 Marruecos administraba de facto la mayor parte, y el
  // escenario no tiene eventos sobre él, así que no merece una nación propia sin capacidad de juego.
  ESH: 'MAR',
};
/**
 * Excepciones de facto que el escenario necesita para sus eventos (el índice sigue el derecho internacional):
 * - karabakh: Armenia y la república de Artsaj lo controlaban en 2014; la guerra de los 44 días (m14_karabakh20,
 *   2020) exige que ARM lo posea, y ARM despliega allí su ejército inicial.
 * - saada: feudo de Ansar Alá desde las guerras de 2004–2010; el evento m14_sanaa hace avanzar a HOU desde allí.
 */
const DE_FACTO: Record<string, string> = { karabakh: 'ARM', saada: 'HOU' };

function worldFill(list: NationDef[]): NationDef[] {
  const byTag = new Map(list.map((n) => [n.tag, n]));
  const placed = new Map<string, string>();
  for (const n of list) for (const pid of n.provinces) {
    if (placed.has(pid)) throw new Error(`mod2014: ${pid} listed by ${placed.get(pid)} and ${n.tag}`);
    placed.set(pid, n.tag);
  }
  for (const [pid, iso] of Object.entries(WORLD_COUNTRY_2014)) {
    const tag = DE_FACTO[pid] ?? ISO_TAG[iso] ?? iso;
    const n = byTag.get(tag);
    if (!n) throw new Error(`mod2014: no nation for ${pid} (${iso})`);
    const cur = placed.get(pid);
    if (cur && cur !== tag) throw new Error(`mod2014: ${pid} is listed by ${cur}, the index says ${tag}`);
    if (!cur) { n.provinces.push(pid); placed.set(pid, tag); }
  }
  return list;
}

const NATIONS = worldFill(nations());
/** every tag of the scenario */
const ALL_TAGS: string[] = NATIONS.map((n) => n.tag);
/** keep a war bilateral: AI-made alliances would otherwise drag whole blocs into it */
const isolate = (tag: string): Effect[] => ALL_TAGS.filter((t) => t !== tag).map((o) => ({ type: 'breakAlliance', tag, other: o }));

// ------------------------------------------------------------------ 2014–2016: Crimea, Donbás, Siria, Yemen
const Y2014: GameEvent[] = [
  E({ id: 'm14_maidan', tag: 'UKR', date: '2014-02-21', image: 'revolt',
    title: 'Después del Maidán',
    text: 'Tras tres meses de protestas en la plaza de la Independencia y las jornadas más sangrientas del 18 al 20 de febrero, el presidente abandona Kiev. La Rada asume el poder y nombra un Gobierno interino. Moscú habla de golpe; Bruselas, de una oportunidad.',
    note: 'Las protestas del Euromaidán comenzaron en noviembre de 2013, cuando el Gobierno suspendió la firma del acuerdo de asociación con la UE. Entre el 18 y el 20 de febrero de 2014 murieron más de un centenar de personas en Kiev. El 22 de febrero la Rada destituyó a Víktor Yanukóvich, que había huido de la capital.',
    options: [
      opt('Elecciones anticipadas y acuerdo de asociación con la UE', [...RELS(['GER', 'FRA', 'POL', 'USA'], 30), REL('RUS', -40), DIS(8), NU(3), FL('maidan'), TR('m14_crimea', 17, 'RUS'), CH('La Rada forma un Gobierno interino y convoca elecciones presidenciales para mayo.')], 9),
      opt('Gobierno de concentración con concesiones a Moscú', [REL('RUS', 20), DIS(15), ST(-1), TR('m14_crimea', 17, 'RUS')], 1, 'Calma las provincias del este, pero la plaza no se vacía.'),
    ] }),
  T({ id: 'm14_crimea', tag: 'RUS', image: 'war', title: 'Crimea',
    text: 'Hombres armados sin distintivos controlan el Parlamento crimeo y los accesos a la península. Un referéndum organizado en dos semanas arroja un resultado abrumador a favor de la incorporación a Rusia. Kiev, la UE y Washington lo consideran ilegal.',
    note: 'El referéndum del 16 de marzo de 2014 se celebró bajo presencia militar rusa y sin observadores reconocidos. Rusia firmó la anexión el 18 de marzo. La Asamblea General de la ONU (resolución 68/262, 27 de marzo) afirmó la integridad territorial de Ucrania.',
    condition: [exists('UKR'), owns('crimea', 'UKR')],
    options: [
      opt('Firmar la incorporación de Crimea', [{ type: 'cede', from: 'UKR', to: 'RUS', provinces: ['crimea'] }, INF(8), NU(5), PR(30), ...RELS(WEST, -50), REL('UKR', -100), FL('crimea_annexed'), TR('m14_crimea_ukr', 1, 'UKR'), TR('m14_sanctions_2014', 10, 'USA'), CH('Moscú anexiona Crimea tras un referéndum que la mayoría de la comunidad internacional no reconoce.')], 9),
      opt('Garantizar la base de Sebastopol sin anexionar', [REL('UKR', 20), PR(-20), ...RELS(WEST, 10)], 1, 'La flota del mar Negro queda asegurada por tratado y la crisis se enfría.'),
    ] }),
  T({ id: 'm14_crimea_ukr', tag: 'UKR', image: 'court', title: 'La pérdida de Crimea',
    text: 'Las unidades ucranianas de la península, bloqueadas en sus cuarteles, reciben la orden de replegarse. El Gobierno interino carece de un ejército capaz de responder y la prioridad es que la crisis no se extienda.',
    options: [
      opt('No reconocer la anexión y llevarla a la ONU', [PR(10), NU(5), ...RELS(['USA', 'GER', 'FRA', 'GBR'], 20), CH('Ucrania declara Crimea territorio ocupado temporalmente.')], 8),
      opt('Movilización parcial de reservistas', [MP(80_000), DIS(6), ARMY('kharkiv', { infantry: 2 })], 2, 'Más tropas en el este, más tensión en casa.'),
    ] }),
  T({ id: 'm14_sanctions_2014', tag: 'USA', image: 'court', title: 'Sanciones por Crimea',
    text: 'Washington y Bruselas preparan congelaciones de activos y prohibiciones de viaje contra responsables rusos. Rusia queda suspendida del G8.',
    options: [
      opt('Sanciones coordinadas con la UE', [REL('RUS', -40), X('factory', -1, 'RUS'), ...RELS(NATO_EU, 10), CH('EE. UU. y la UE aprueban las primeras sanciones contra Rusia; el G8 vuelve a ser G7.')], 9),
      opt('Medidas simbólicas', [REL('RUS', -10), REL('UKR', -20)], 1),
    ] }),
  E({ id: 'm14_donbas', tag: 'RUS', date: '2014-04-07', image: 'revolt', title: 'Insurrección en el Donbás',
    text: 'Grupos armados prorrusos toman edificios oficiales en Donetsk, Lugansk y Sloviansk y proclaman «repúblicas populares». Por la frontera llegan voluntarios, armas y, según Kiev y la OTAN, unidades regulares.',
    note: 'En abril de 2014 los separatistas tomaron varias ciudades del Donbás. Moscú negó durante años la participación de sus fuerzas regulares, documentada por periodistas y, más tarde, por el Tribunal Europeo de Derechos Humanos.',
    condition: [exists('UKR'), owns('donbas', 'UKR')],
    options: [
      opt('Apoyar a los separatistas', [{ type: 'claim', provinces: ['donbas'] }, UNREST('donbas', 20), DIS(10, 'UKR'), REL('UKR', -60), INF(4), FL('donbas_war'), TR('m14_ato', 5, 'UKR'), CH('Comienza la guerra en el Donbás.')], 9),
      opt('No implicarse', [REL('UKR', 20), ...RELS(WEST, 10)], 1),
    ] }),
  T({ id: 'm14_ato', tag: 'UKR', image: 'war', title: 'La «operación antiterrorista»',
    text: 'Kiev lanza una ofensiva para recuperar las ciudades tomadas. El ejército, desatendido durante años, depende de batallones de voluntarios y de colectas ciudadanas para comprar chalecos y radios.',
    options: [
      opt('Ofensiva con el ejército y los voluntarios', [MP(-20_000), NU(5), ARMY('donbas', { infantry: 2 }), UNREST('donbas', -5), CH('Las fuerzas ucranianas recuperan Sloviansk en julio.')], 8),
      opt('Contener la línea y negociar', [DIS(5), UNREST('donbas', 5)], 2),
    ] }),
  E({ id: 'm14_mh17', tag: 'NLD', date: '2014-07-17', image: 'disaster', title: 'El vuelo MH17',
    text: 'Un Boeing de Malaysia Airlines que volaba de Ámsterdam a Kuala Lumpur cae sobre el este de Ucrania. Mueren las 298 personas a bordo, 196 de ellas neerlandesas.',
    note: 'El Equipo Conjunto de Investigación concluyó que fue derribado por un misil Buk procedente de una brigada rusa. En 2022 un tribunal neerlandés condenó en ausencia a tres hombres.',
    condition: [flag('donbas_war', 'RUS')],
    options: [opt('Exigir una investigación internacional', [REL('RUS', -60), PR(5), TR('m14_sectoral', 10, 'GER'), CH('Los Países Bajos encabezan la investigación del derribo del MH17.')])] }),
  T({ id: 'm14_sectoral', tag: 'GER', image: 'court', title: 'Sanciones sectoriales',
    text: 'Tras el derribo del MH17, la UE estudia restringir el acceso ruso a la financiación, la tecnología petrolera y el material de doble uso. Alemania es el mayor cliente del gas ruso.',
    options: [
      opt('Sanciones sectoriales europeas', [REL('RUS', -40), X('factory', -1, 'RUS'), X('stock_oil', -300, 'RUS'), NRG(-300), FL('eu_sanctions'), CH('La UE aprueba sanciones sectoriales contra Rusia.')], 9),
      opt('Priorizar el suministro de gas', [REL('RUS', 10), ...RELS(['POL', 'UKR', 'USA'], -20)], 1, 'El Nord Stream sigue siendo un proyecto en pie.'),
    ] }),
  E({ id: 'm14_minsk', tag: 'UKR', date: '2014-09-05', image: 'peace', title: 'El Protocolo de Minsk',
    text: 'Tras la derrota de Ilovaisk, Kiev acepta en Minsk un alto el fuego con mediación de la OSCE. El texto promete un estatus especial para las zonas separatistas, que Moscú interpreta a su manera.',
    note: 'Minsk I (5 de septiembre de 2014) no detuvo los combates. Minsk II (12 de febrero de 2015), negociado con Alemania y Francia, congeló el frente tras la batalla de Debáltseve, aunque nunca se cumplió por completo.',
    condition: [flag('donbas_war', 'RUS')],
    options: [
      opt('Firmar y ganar tiempo para reconstruir el ejército', [DIS(5), UNREST('donbas', -10), FL('minsk'), TECH('infantry', 1), CH('Ucrania firma el alto el fuego de Minsk. El frente se congela.')], 8),
      opt('Rechazarlo y seguir combatiendo', [MP(-30_000), NU(3), DIS(4)], 2),
    ] }),
  E({ id: 'm14_ukr_reform', tag: 'UKR', date: '2016-01-01', image: 'war', title: 'Reconstruir el ejército',
    text: 'En 2014 el ejército apenas podía desplegar unos miles de soldados listos para el combate. Con instructores de la OTAN, nuevas brigadas y una reserva operativa, el Ministerio de Defensa propone una reforma de fondo.',
    note: 'Entre 2015 y 2021 Ucrania amplió sus fuerzas armadas, rotó por el Donbás a cientos de miles de soldados y adoptó procedimientos de mando más descentralizados con apoyo de instructores occidentales.',
    condition: [flag('donbas_war', 'RUS')],
    options: [
      opt('Reforma con instructores de la OTAN', [CMB(0.05), TECH('doctrine', 1), ARMY('kharkiv', { infantry: 2, artillery: 1 }), ...RELS(['USA', 'GBR', 'CAN', 'POL'], 15), TRS(-40), CH('Ucrania reforma sus fuerzas armadas con ayuda occidental.')], 9),
      opt('Reformas mínimas', [TRS(20)], 1),
    ] }),
  E({ id: 'm14_mosul', tag: 'IRQ', date: '2014-06-10', image: 'disaster', title: 'La caída de Mosul',
    text: 'El autodenominado Estado Islámico toma Mosul, la segunda ciudad del país, y avanza hacia Bagdad. Unidades enteras del ejército se disuelven; cientos de miles de personas huyen.',
    note: 'El grupo yihadista ocupó buena parte del norte y el oeste de Irak y el este de Siria. Sus crímenes contra yazidíes, cristianos, chiíes y suníes disidentes están documentados por la ONU.',
    options: [
      opt('Pedir ayuda a una coalición internacional', [UNREST('mosul', 30), MP(-40_000), DIS(15), REL('USA', 40), TR('m14_coalition', 30, 'USA'), CH('Bagdad pide ayuda internacional frente al Estado Islámico.')], 6),
      opt('Apoyarse en Irán y las milicias movilizadas', [UNREST('mosul', 30), MP(-40_000), DIS(10), REL('IRN', 50), ARMY('baghdad', { infantry: 2 }), TR('m14_coalition', 30, 'USA')], 4),
    ] }),
  T({ id: 'm14_coalition', tag: 'USA', image: 'war', title: 'Coalición contra el Estado Islámico',
    text: 'El asedio de los yazidíes en el monte Sinjar y la amenaza sobre Erbil empujan a Washington a volver a Irak, esta vez desde el aire y con asesores.',
    note: 'La coalición internacional inició bombardeos en Irak en agosto de 2014 y en Siria en septiembre. Mosul fue liberada en julio de 2017 y Raqa en octubre de 2017.',
    options: [
      opt('Campaña aérea y asesores sobre el terreno', [REL('IRQ', 40), UNREST('mosul', -15), UNREST('deir_ez_zor', -5), FL('coalition'), DIS(2), CH('Comienza la campaña de la coalición contra el Estado Islámico.')], 9),
      opt('Limitarse a la ayuda humanitaria', [REL('IRQ', -20), PR(-10)], 1),
    ] }),
  E({ id: 'm14_sanaa', tag: 'HOU', date: '2014-09-21', image: 'revolt', title: 'Los hutíes entran en Saná',
    text: 'El movimiento Ansar Alá, nacido en las montañas de Saada, aprovecha el descontento por la subida del combustible y entra en la capital casi sin resistencia.',
    condition: [exists('YEM'), owns('sanaa', 'YEM')],
    options: [
      opt('Tomar el control de Saná', [{ type: 'cede', from: 'YEM', to: 'HOU', provinces: ['sanaa'] }, REL('YEM', -80), REL('IRN', 40), REL('SAU', -60), TR('m14_storm', 186, 'SAU'), CH('Los hutíes controlan la capital yemení.')], 9),
      opt('Negociar un reparto de poder', [REL('YEM', 30), PR(-10)], 1),
    ] }),
  T({ id: 'm14_storm', tag: 'SAU', image: 'war', title: 'La guerra de Yemen',
    text: 'El presidente yemení ha huido a Adén y pide ayuda. Riad ve la mano de Teherán detrás de los hutíes y prepara una coalición árabe.',
    note: 'La intervención saudí comenzó el 26 de marzo de 2015. La guerra y el bloqueo provocaron una de las peores crisis humanitarias del mundo, con cientos de miles de muertos por la violencia, el hambre y las enfermedades, según estimaciones de la ONU. La tregua de abril de 2022 redujo los combates.',
    options: [
      opt('Intervenir con una coalición árabe', [MP(-30_000), TRS(-150), REL('HOU', -100), REL('IRN', -40), REL('YEM', 60), ...RELS(['UAE'], 30), FL('yemen_war'), DIS(3), CH('Arabia Saudí encabeza una coalición militar en Yemen.')], 9),
      opt('Apoyar la mediación de Omán', [REL('OMA', 30), REL('HOU', 20), PR(-10)], 1),
    ] }),
  E({ id: 'm14_jcpoa', tag: 'IRN', date: '2015-07-14', image: 'peace', title: 'El acuerdo nuclear',
    text: 'Tras años de negociación con el grupo 5+1, Teherán puede aceptar límites estrictos a su enriquecimiento de uranio e inspecciones del OIEA a cambio del levantamiento de sanciones.',
    note: 'El Plan de Acción Integral Conjunto se firmó en Viena el 14 de julio de 2015 y entró en vigor en enero de 2016.',
    options: [
      opt('Firmar el acuerdo', [...RELS(['USA', 'GER', 'FRA', 'GBR'], 40), OIL(1500), TRS(200), DIS(-8), FL('jcpoa'), CH('Irán firma el acuerdo nuclear en Viena.')], 9),
      opt('Rechazar las inspecciones', [...RELS(['USA', 'GER', 'FRA', 'GBR'], -30), DIS(8)], 1),
    ] }),
  E({ id: 'm14_syria', tag: 'RUS', date: '2015-09-30', image: 'war', title: 'Intervención en Siria',
    text: 'El Gobierno sirio pierde terreno frente a los rebeldes y los yihadistas. Damasco pide apoyo aéreo; Moscú puede convertir la base de Hmeimim en su escaparate militar.',
    note: 'La intervención rusa, iniciada el 30 de septiembre de 2015, cambió el curso de la guerra civil. Organizaciones de derechos humanos documentaron ataques contra hospitales y zonas residenciales.',
    condition: [exists('SYR')],
    options: [
      opt('Desplegar la aviación en Latakia', [REL('SYR', 100), REL('IRN', 30), ...RELS(['USA', 'TUR'], -30), ARMY('latakia', { infantry: 1 }), X('fighters', -1), FL('syria_rus'), X('dissent', -10, 'SYR'), CH('Rusia interviene militarmente en Siria.')], 8),
      opt('Limitarse al apoyo diplomático', [REL('SYR', 20)], 2),
    ] }),
  E({ id: 'm14_su24', tag: 'TUR', date: '2015-11-24', image: 'war', title: 'El derribo del Su-24',
    text: 'Un caza turco derriba un bombardero ruso que, según Ankara, violó su espacio aéreo durante diecisiete segundos. Moscú responde con sanciones comerciales y turísticas.',
    condition: [flag('syria_rus', 'RUS')],
    options: [
      opt('Defender la decisión y pedir consultas a la OTAN', [REL('RUS', -60), PR(5), TRS(-50)], 6),
      opt('Expresar pesar y buscar la desescalada', [REL('RUS', -20), PR(-5)], 4, 'La reconciliación llegó en junio de 2016.'),
    ] }),
  E({ id: 'm14_brexit', tag: 'GBR', date: '2016-06-23', image: 'court', title: 'El referéndum europeo',
    text: 'Los británicos votan si permanecen en la Unión Europea. Las encuestas dan un resultado ajustado.',
    note: 'El 51,9 % votó a favor de salir. El Reino Unido abandonó la UE el 31 de enero de 2020; sigue siendo miembro de la OTAN.',
    options: [
      opt('Salir de la Unión Europea', [...RELS(['GER', 'FRA', 'IRL', 'ESP'], -20), DIS(10), ST(-1), FL('brexit'), CH('El Reino Unido vota abandonar la Unión Europea.')], 8),
      opt('Permanecer', [...RELS(['GER', 'FRA'], 10), DIS(4)], 2),
    ] }),
  E({ id: 'm14_coup', tag: 'TUR', date: '2016-07-15', image: 'revolt', title: 'El intento de golpe',
    text: 'Una facción del ejército bloquea los puentes del Bósforo y bombardea el Parlamento. Miles de ciudadanos salen a la calle y el golpe fracasa en una noche.',
    note: 'Murieron más de 250 personas. El Gobierno declaró el estado de emergencia y destituyó o detuvo a decenas de miles de militares, jueces, funcionarios y docentes.',
    options: [
      opt('Estado de emergencia y depuración masiva', [ST(1), DIS(8), CMB(-0.05), NU(5), ...RELS(['USA', 'GER'], -20), CH('Turquía declara el estado de emergencia tras el golpe fallido.')], 7),
      opt('Juicios con garantías y reforma del mando', [ST(-1), DIS(2), ...RELS(['GER', 'FRA'], 10)], 3),
    ] }),
];

// ------------------------------------------------------------------ 2017–2021
const Y2017: GameEvent[] = [
  E({ id: 'm14_mic2025', tag: 'CHN', date: '2015-05-19', image: 'prosperity', title: 'Hecho en China 2025',
    text: 'El Consejo de Estado presenta un plan para dominar en diez años los semiconductores, la robótica, los vehículos eléctricos y la aviación.',
    options: [
      opt('Subvenciones masivas a la alta tecnología', [IC(3), TECH('industry', 1), RP(80), ...RELS(['USA', 'GER'], -10), FL('mic2025')], 9),
      opt('Dejar actuar al mercado', [TRS(100)], 1),
    ] }),
  E({ id: 'm14_arbitration', tag: 'CHN', date: '2016-07-12', image: 'court', title: 'El laudo del mar de China Meridional',
    text: 'El tribunal arbitral de La Haya da la razón a Filipinas: la «línea de nueve trazos» no tiene base en el derecho del mar.',
    options: [
      opt('Rechazar el laudo y seguir construyendo islas', [REL('PHI', -40), REL('USA', -20), REL('VIE', -20), X('navy', 2), PR(5)], 8),
      opt('Negociar un código de conducta', [REL('PHI', 20), REL('VIE', 20), PR(-10)], 2),
    ] }),
  E({ id: 'm14_singapore', tag: 'PRK', date: '2018-06-12', image: 'peace', title: 'La cumbre de Singapur',
    text: 'Por primera vez, los máximos dirigentes de Corea del Norte y Estados Unidos se reúnen. La declaración final habla de «desnuclearización» sin calendario ni verificación.',
    note: 'Tras la sexta prueba nuclear (septiembre de 2017), la cumbre abrió un periodo de distensión que terminó sin acuerdo en Hanói en 2019.',
    options: [
      opt('Moratoria de pruebas a cambio de diálogo', [REL('USA', 30), REL('KOR', 30), TRS(30)], 7),
      opt('Promesas sin compromisos', [REL('USA', 5), PR(10)], 3),
    ] }),
  E({ id: 'm14_jcpoa_exit', tag: 'USA', date: '2018-05-08', image: 'court', title: 'Salir del acuerdo nuclear',
    text: 'La Casa Blanca considera el acuerdo con Irán demasiado débil. Los aliados europeos piden mantenerlo; el OIEA certifica que Teherán lo cumple.',
    condition: [flag('jcpoa', 'IRN')],
    options: [
      opt('Retirarse y aplicar «máxima presión»', [REL('IRN', -60), ...RELS(['GER', 'FRA', 'GBR'], -15), X('stock_oil', -1500, 'IRN'), X('dissent', 10, 'IRN'), FL('jcpoa_exit'), CH('EE. UU. abandona el acuerdo nuclear con Irán.')], 8),
      opt('Mantener el acuerdo', [REL('IRN', 10), ...RELS(['GER', 'FRA'], 10)], 2),
    ] }),
  E({ id: 'm14_balakot', tag: 'IND', date: '2019-02-26', image: 'war', title: 'Pulwama y Balakot',
    text: 'Un atentado suicida contra un convoy policial en Cachemira mata a cuarenta agentes. Un grupo armado con base en Pakistán lo reivindica. Nueva Delhi debe responder sin desatar una guerra entre potencias nucleares.',
    note: 'La India atacó Balakot el 26 de febrero de 2019; al día siguiente un piloto indio fue derribado y capturado en Pakistán, que lo devolvió el 1 de marzo como gesto de desescalada.',
    condition: [exists('PAK')],
    options: [
      opt('Ataque aéreo limitado contra campamentos', [REL('PAK', -50), PR(15), NU(3), TR('m14_balakot_pak', 1, 'PAK')], 7),
      opt('Ofensiva diplomática para aislar a Pakistán', [REL('PAK', -30), ...RELS(['USA', 'FRA'], 15)], 3),
    ] }),
  T({ id: 'm14_balakot_pak', tag: 'PAK', image: 'war', title: 'Respuesta y desescalada',
    text: 'La aviación paquistaní responde al día siguiente y derriba un caza indio; el piloto es capturado. Las dos capitales saben que la disuasión nuclear deja muy poco margen de error.',
    options: [
      opt('Devolver al piloto como gesto de paz', [REL('IND', 20), PR(10), CH('Pakistán devuelve al piloto indio y la crisis se enfría.')], 8),
      opt('Retenerlo como baza', [REL('IND', -30), REL('USA', -20)], 2),
    ] }),
  E({ id: 'm14_art370', tag: 'IND', date: '2019-08-05', image: 'court', title: 'El estatuto de Cachemira',
    text: 'El Gobierno puede revocar la autonomía especial de Jammu y Cachemira e integrarla plenamente en la Unión, con un despliegue de seguridad y un apagón de comunicaciones prolongado.',
    options: [
      opt('Revocar el artículo 370', [UNREST('kashmir', 20), REL('PAK', -30), NU(3), DIS(3), CH('La India revoca el estatuto especial de Jammu y Cachemira.')], 8),
      opt('Mantener el estatuto', [UNREST('kashmir', -5), PR(-5)], 2),
    ] }),
  E({ id: 'm14_soleimani', tag: 'IRN', date: '2020-01-03', image: 'war', title: 'La muerte de Soleimani',
    text: 'Un dron estadounidense mata en Bagdad al jefe de la Fuerza Quds. Teherán promete venganza; el Parlamento iraquí vota la salida de las tropas extranjeras.',
    note: 'El 8 de enero Irán lanzó misiles contra bases con tropas estadounidenses en Irak, sin víctimas mortales. Esa misma noche, la defensa antiaérea iraní derribó por error el vuelo PS752 de Ukraine International Airlines: murieron sus 176 ocupantes.',
    condition: [flag('jcpoa_exit', 'USA')],
    options: [
      opt('Represalia limitada contra bases en Irak', [REL('USA', -40), PR(10), NU(3), DIS(6), REL('UKR', -30), REL('CAN', -30), CH('Irán ataca bases estadounidenses en Irak; esa noche su defensa aérea derriba por error un avión civil.')], 8),
      opt('Paciencia estratégica', [PR(-10), DIS(4)], 2),
    ] }),
  E({ id: 'm14_covid', date: '2020-03-11', image: 'disaster', title: 'La pandemia',
    text: 'La OMS declara pandemia el brote de un nuevo coronavirus detectado en Wuhan. Los hospitales se saturan, las fronteras se cierran y las cadenas de suministro se rompen.',
    note: 'La COVID-19 causó millones de muertos en todo el mundo. Las vacunas llegaron en tiempo récord, a finales de 2020.',
    options: [
      opt('Confinamiento estricto y protección del empleo', [DIS(4), TRS(-40), MP(-5000), CH('El país se confina para frenar la pandemia.')], 7),
      opt('Medidas mínimas para salvar la economía', [DIS(8), MP(-15_000), TRS(-10)], 3),
    ] }),
  E({ id: 'm14_galwan', tag: 'IND', date: '2020-06-15', image: 'war', title: 'El valle de Galwan',
    text: 'Soldados indios y chinos se enfrentan cuerpo a cuerpo en la frontera del Himalaya. Mueren veinte militares indios y al menos cuatro chinos: el primer choque mortal en décadas.',
    condition: [exists('CHN')],
    options: [
      opt('Reforzar la frontera y vetar aplicaciones chinas', [REL('CHN', -50), ARMY('kashmir', { mountain: 2 }), NU(3), ...RELS(['USA', 'JAP', 'AUS'], 15)], 8),
      opt('Desescalada negociada', [REL('CHN', -10), PR(-5)], 2),
    ] }),
  E({ id: 'm14_abraham', tag: 'UAE', date: '2020-09-15', image: 'peace', title: 'Los Acuerdos de Abraham',
    text: 'Con mediación estadounidense, Emiratos y Baréin pueden establecer relaciones diplomáticas plenas con Israel; Marruecos y Sudán seguirán.',
    options: [
      opt('Normalizar relaciones con Israel', [REL('ISR', 80), REL('USA', 30), REL('PAL', -30), REL('IRN', -20), FL('abraham', 'ISR'), FL('abraham'), CH('Emiratos firma los Acuerdos de Abraham.')], 9),
      opt('Esperar a un Estado palestino', [REL('PAL', 20), REL('USA', -10)], 1),
    ] }),
  E({ id: 'm14_karabakh20', tag: 'AZE', date: '2020-09-27', image: 'war', title: 'La guerra de los 44 días',
    text: 'Bakú lanza una ofensiva para recuperar el Alto Karabaj y los distritos que lo rodean, bajo control armenio desde los noventa. Los drones turcos e israelíes cambian el campo de batalla.',
    note: 'Unos siete mil militares murieron en seis semanas. El alto el fuego del 10 de noviembre de 2020, mediado por Moscú, devolvió a Azerbaiyán los distritos circundantes y Shusha, y desplegó fuerzas de paz rusas.',
    condition: [exists('ARM'), owns('karabakh', 'ARM')],
    options: [
      opt('Ofensiva con drones y artillería', [TECH('air', 1), CMB(0.1), REL('ARM', -80), REL('TUR', 40), MP(-15_000, 'ARM'), DIS(15, 'ARM'), FL('karabakh20'), TR('m14_karabakh_truce', 44, 'ARM'), CH('Azerbaiyán lanza una ofensiva sobre el Alto Karabaj.')], 9),
      opt('Seguir en la mesa del Grupo de Minsk', [PR(-10)], 1),
    ] }),
  T({ id: 'm14_karabakh_truce', tag: 'ARM', image: 'peace', title: 'El alto el fuego del 10 de noviembre',
    text: 'Con Shusha perdida, el Gobierno armenio firma de madrugada un alto el fuego mediado por Moscú. Miles de manifestantes asaltan el Parlamento en Ereván.',
    options: [
      opt('Firmar para salvar lo que queda', [DIS(15), ST(-1), REL('RUS', -10), CH('Armenia firma el alto el fuego; fuerzas de paz rusas se despliegan en el Karabaj.')], 9),
      opt('Seguir combatiendo', [MP(-20_000), NU(-5)], 1),
    ] }),
  E({ id: 'm14_kabul', tag: 'AFG', date: '2021-08-15', image: 'revolt', title: 'La caída de Kabul',
    text: 'Con la retirada estadounidense en marcha, las capitales de provincia caen una tras otra y los talibanes entran en Kabul. El presidente huye; miles de personas se agolpan en el aeropuerto.',
    note: 'Los talibanes restablecieron el Emirato Islámico y excluyeron a las mujeres de la enseñanza secundaria y universitaria y de la mayoría de los empleos.',
    options: [opt('El Gobierno se desmorona', [{ type: 'government', value: 'authoritarian' }, REL('USA', -60), REL('PAK', 20), DIS(20), TR('m14_airlift', 1, 'USA'), CH('Los talibanes toman el poder en Afganistán.')])] }),
  T({ id: 'm14_airlift', tag: 'USA', image: 'disaster', title: 'El puente aéreo de Kabul',
    text: 'En dos semanas hay que evacuar a ciudadanos propios y a decenas de miles de afganos que colaboraron con la coalición. Un atentado en las puertas del aeropuerto mata a 13 militares estadounidenses y a unos 170 civiles afganos.',
    options: [
      opt('Evacuar al máximo hasta el 31 de agosto', [DIS(4), PR(-15), MP(-1000), CH('Termina la evacuación de Kabul: más de 120 000 personas salen del país.')], 9),
      opt('Retirada inmediata', [DIS(8), PR(-30), REL('GBR', -20)], 1),
    ] }),
  E({ id: 'm14_aukus', tag: 'AUS', date: '2021-09-15', image: 'court', title: 'AUKUS',
    text: 'Washington y Londres ofrecen a Canberra submarinos de propulsión nuclear y cooperación en IA y tecnologías cuánticas. París pierde un contrato de submarinos convencionales.',
    options: [
      opt('Firmar AUKUS', [TECH('naval', 1), TECH('ai', 1), REL('USA', 30), REL('GBR', 30), REL('FRA', -40), REL('CHN', -30), FL('aukus')], 9),
      opt('Mantener el contrato francés', [REL('FRA', 20), X('subs', 1)], 1),
    ] }),
  E({ id: 'm14_tsmc', tag: 'TAI', date: '2020-05-15', image: 'prosperity', title: 'El escudo de silicio',
    text: 'Taiwán fabrica la gran mayoría de los chips más avanzados del mundo. Washington pide fábricas en suelo estadounidense; en Taipéi hay quien teme perder su mejor seguro.',
    options: [
      opt('Construir fábricas en Arizona', [REL('USA', 40), IC(1, 'USA'), PR(10), FL('silicon_shield')], 7),
      opt('Mantener la producción puntera en la isla', [REL('USA', -5), IC(1), FL('silicon_shield')], 3, 'La isla conserva su ventaja, y su vulnerabilidad.'),
    ] }),
];

// ------------------------------------------------------------------ 2021–2026: la invasión de Ucrania
const UKRWAR: GameEvent[] = [
  E({ id: 'm14_buildup', tag: 'RUS', date: '2021-11-01', image: 'war', title: 'Concentración en la frontera',
    text: 'Más de cien mil soldados rusos se acumulan cerca de Ucrania y en Bielorrusia. El Kremlin exige garantías por escrito de que la OTAN no se ampliará más.',
    condition: [exists('UKR')],
    options: [
      opt('Mantener la presión y preparar la ofensiva', [INF(3), ...RELS(WEST, -20), REL('UKR', -40), FL('buildup'), TR('m14_invasion', 115)], 9),
      opt('Retirar las tropas y negociar', [REL('UKR', 20), ...RELS(WEST, 10)], 1),
    ] }),
  T({ id: 'm14_invasion', tag: 'RUS', image: 'war', title: '24 de febrero de 2022',
    text: 'Las fuerzas rusas están desplegadas en tres ejes: Kiev desde Bielorrusia, Járkov desde el norte y el sur desde Crimea. El Kremlin lo llamará «operación militar especial».',
    note: 'La invasión a gran escala comenzó el 24 de febrero de 2022. Es la mayor guerra en Europa desde 1945, con cientos de miles de bajas militares, decenas de miles de víctimas civiles documentadas por la ONU y millones de desplazados.',
    condition: [exists('UKR')],
    options: [
      opt('Ordenar la invasión', [...isolate('UKR'), ...isolate('RUS'), { type: 'declareWar', target: 'UKR', goal: 'donbas' }, CMB(-0.05), { type: 'claim', provinces: ['donbas', 'kharkiv', 'zaporozhye', 'kherson', 'kiev'] }, INF(15), ...RELS(WEST, -60), FL('invasion'), TR('m14_resist', 1, 'UKR'), TR('m14_sanctions22', 3, 'USA'), TR('m14_zeitenwende', 3, 'GER'), CH('Rusia invade Ucrania.')], 9),
      opt('Detenerse en el último momento', [PR(-40), REL('UKR', 30), DIS(5)], 1, 'Un camino que la historia no tomó.'),
    ] }),
  T({ id: 'm14_resist', tag: 'UKR', image: 'war', title: 'El país resiste',
    text: 'Columnas blindadas avanzan hacia Kiev, Járkov y Jersón. El Gobierno decide quedarse en la capital. En las colas de los centros de reclutamiento hay profesores, informáticos y jubilados.',
    options: [
      opt('Movilización general y defensa de Kiev', [MP(300_000), NU(5), CMB(0.15), X('fighters', 3), X('stubborn', 5), ARMY('kiev', { infantry: 5, artillery: 2 }), ARMY('kharkiv', { infantry: 3 }), ARMY('odesa', { infantry: 2 }), DIS(-10), CH('Ucrania decreta la ley marcial y la movilización general.')], 9),
      opt('Buscar un alto el fuego inmediato', [ST(-1), DIS(10)], 1),
    ] }),
  T({ id: 'm14_sanctions22', tag: 'USA', image: 'court', title: 'Sanciones y armas para Kiev',
    text: 'Washington y sus aliados congelan las reservas del banco central ruso, desconectan bancos del sistema SWIFT y aceleran el envío de misiles antitanque y antiaéreos.',
    condition: [war('UKR', 'RUS')],
    options: [
      opt('Sanciones máximas y ayuda militar', [X('factory', -3, 'RUS'), X('dissent', 5, 'RUS'), ARMY('kiev', { infantry: 2, artillery: 2 }, 'UKR'), TECH('infantry', 1, 'UKR'), TECH('air', 1, 'UKR'), REL('RUS', -60), REL('UKR', 60), FL('aid_ukr'), TR('m14_aid_wave', 120), CH('EE. UU. y sus aliados imponen sanciones sin precedentes a Rusia.')], 9),
      opt('Solo sanciones financieras', [X('factory', -2, 'RUS'), REL('RUS', -40), REL('UKR', 10)], 1),
    ] }),
  T({ id: 'm14_aid_wave', tag: 'USA', image: 'war', title: 'Artillería y lanzacohetes',
    text: 'Kiev pide sistemas de largo alcance para golpear depósitos y puestos de mando. Cada nueva entrega se debate por miedo a la escalada.',
    condition: [war('UKR', 'RUS')],
    options: [
      opt('Enviar HIMARS y artillería', [ARMY('kharkiv', { artillery: 2, motorized: 2 }, 'UKR'), X('fighters', 2, 'UKR'), X('combat', 0.1, 'UKR'), X('stock_supplies', 1500, 'UKR'), DIS(2)], 9),
      opt('Entregas graduales', [ARMY('kiev', { infantry: 1 }, 'UKR')], 1),
    ] }),
  T({ id: 'm14_zeitenwende', tag: 'GER', image: 'court', title: 'Zeitenwende',
    text: 'El canciller anuncia un fondo especial de 100 000 millones para la Bundeswehr y el fin de la dependencia del gas ruso. El Nord Stream 2 queda suspendido.',
    options: [
      opt('Rearme y ruptura energética con Moscú', [IC(1), NRG(-1500), REL('RUS', -60), REL('UKR', 40), X('stock_supplies', 600, 'UKR'), FL('zeitenwende'), CH('Alemania anuncia el «cambio de época».')], 9),
      opt('Prudencia: no romper con el gas', [REL('RUS', 10), REL('UKR', -30), REL('POL', -30)], 1),
    ] }),
  E({ id: 'm14_moskva', tag: 'UKR', date: '2022-04-14', image: 'war', title: 'El hundimiento del Moskvá',
    text: 'Dos misiles antibuque de fabricación ucraniana alcanzan el buque insignia de la flota rusa del mar Negro. Semanas después, la retirada rusa del norte deja al descubierto los crímenes cometidos contra civiles en Bucha.',
    note: 'Las fuerzas rusas se retiraron de la región de Kiev a finales de marzo de 2022. Las investigaciones de la ONU y de la fiscalía ucraniana documentaron ejecuciones de civiles en Bucha y otras localidades.',
    condition: [war('RUS')],
    options: [opt('Contarlo al mundo', [X('navy', -2, 'RUS'), NU(5), ...RELS(NATO_EU, 20), CH('El crucero Moskvá se hunde; el mundo conoce lo ocurrido en Bucha.')])] }),
  E({ id: 'm14_grain', tag: 'TUR', date: '2022-07-22', image: 'peace', title: 'La Iniciativa del Grano',
    text: 'Con la ONU, Ankara puede mediar para reabrir los puertos ucranianos al trigo y el maíz que necesitan África y Oriente Medio.',
    condition: [war('UKR', 'RUS')],
    options: [
      opt('Mediar el corredor del grano', [PR(20), REL('UKR', 20), REL('RUS', 10), REL('EGY', 20), FL('grain_deal'), X('stock_supplies', 300, 'UKR'), CH('Turquía y la ONU median el acuerdo del grano del mar Negro.')], 9),
      opt('No implicarse', [], 1),
    ] }),
  E({ id: 'm14_annex4', tag: 'RUS', date: '2022-09-21', image: 'war', title: 'Movilización y anexiones',
    text: 'La contraofensiva ucraniana ha liberado casi toda la región de Járkov. El Kremlin decreta una movilización parcial y organiza «referendos» en cuatro regiones que no controla por completo.',
    note: 'Rusia proclamó el 30 de septiembre de 2022 la anexión de Donetsk, Lugansk, Zaporiyia y Jersón. La Asamblea General de la ONU la rechazó por amplia mayoría. Kiev recuperó la ciudad de Jersón el 11 de noviembre.',
    condition: [war('UKR')],
    options: [
      opt('Movilización parcial y anexión', [MP(300_000), DIS(12), CMB(0.05), { type: 'claim', provinces: ['donbas', 'zaporozhye', 'kherson'] }, INF(5), ...RELS(WEST, -30), CH('Rusia moviliza a 300 000 reservistas y proclama la anexión de cuatro regiones ucranianas.')], 9),
      opt('Pasar a una defensa estática', [DIS(4), PR(-20)], 1),
    ] }),
  E({ id: 'm14_drones_ukr', tag: 'UKR', date: '2023-01-01', image: 'war', title: 'La guerra de los drones',
    text: 'En el frente, drones baratos de visión en primera persona destruyen blindados que valen millones. Talleres de toda Ucrania los montan por miles; la guerra electrónica se vuelve tan importante como la artillería.',
    condition: [war('RUS')],
    options: [
      opt('Fábricas de drones en todo el país', [IC(1), TECH('air', 1), TECH('ai', 1), ARMY('donbas', { drones: 2 }), FL('drone_industry'), CH('Ucrania convierte los drones en el eje de su defensa.')], 9),
      opt('Comprarlos a los aliados', [TECH('air', 1), TRS(-50)], 1),
    ] }),
  E({ id: 'm14_drones_rus', tag: 'RUS', date: '2023-06-01', image: 'war', title: 'Shahed y planeadoras',
    text: 'Con diseños iraníes fabricados ya en Tatarstán y bombas planeadoras soviéticas modernizadas, el ejército ruso multiplica los ataques a distancia contra posiciones e infraestructuras.',
    condition: [war('UKR')],
    options: [
      opt('Producción masiva de drones', [TECH('air', 1), TECH('ai', 1), REL('IRN', 40), IC(1)], 9),
      opt('Insistir en la artillería', [X('stock_supplies', 800)], 1),
    ] }),
  E({ id: 'm14_wagner', tag: 'RUS', date: '2023-06-24', image: 'revolt', title: 'El motín de Wagner',
    text: 'La compañía militar privada Wagner toma el cuartel general del distrito sur en Rostov y avanza hacia Moscú. En menos de un día, un acuerdo mediado por Minsk detiene la columna.',
    options: [
      opt('Absorber a los combatientes en el ejército', [DIS(6), ST(-1), CMB(-0.03), CH('El motín de Wagner termina con un acuerdo; su líder muere dos meses después en un accidente aéreo.')], 9),
      opt('Disolver la compañía por completo', [DIS(10), MP(-20_000)], 1),
    ] }),
  E({ id: 'm14_fin_nato', tag: 'FIN', date: '2023-04-04', image: 'court', title: 'Finlandia en la OTAN',
    text: 'La invasión de Ucrania ha acabado con setenta años de no alineamiento. La adhesión, solicitada en mayo de 2022, ya está ratificada por todos los aliados.',
    options: [
      opt('Ingresar en la Alianza', [{ type: 'joinFaction', faction: 'nato' }, REL('RUS', -40), NU(5), CH('Finlandia se convierte en el miembro 31 de la OTAN.')], 9),
      opt('Seguir siendo neutral', [REL('RUS', 10)], 1),
    ] }),
  E({ id: 'm14_swe_nato', tag: 'SWE', date: '2024-03-07', image: 'court', title: 'Suecia en la OTAN',
    text: 'Tras casi dos años de espera por las ratificaciones turca y húngara, Estocolmo puede depositar su instrumento de adhesión en Washington.',
    options: [
      opt('Ingresar en la Alianza', [{ type: 'joinFaction', faction: 'nato' }, REL('RUS', -40), CH('Suecia se convierte en el miembro 32 de la OTAN.')], 9),
      opt('Mantener dos siglos de neutralidad', [REL('RUS', 10)], 1),
    ] }),
  E({ id: 'm14_mkd_nato', tag: 'MKD', date: '2020-03-27', image: 'court', title: 'Macedonia del Norte en la OTAN',
    text: 'El acuerdo de Prespa con Grecia, que cambió el nombre del país, ha desbloqueado la adhesión.',
    options: [opt('Ingresar en la Alianza', [{ type: 'joinFaction', faction: 'nato' }, REL('GRE', 20)], 9), opt('Esperar', [], 1)] }),
  E({ id: 'm14_kursk', tag: 'UKR', date: '2024-08-06', image: 'war', title: 'La incursión en Kursk',
    text: 'El Estado Mayor propone algo impensable: cruzar la frontera y ocupar territorio ruso para obligar a Moscú a desviar tropas del Donbás.',
    condition: [war('RUS')],
    options: [
      opt('Lanzar la incursión', [ARMY('kursk', { motorized: 2, infantry: 2 }), PR(15), NU(3), TR('m14_nk_troops', 70, 'RUS'), CH('Fuerzas ucranianas entran en la región rusa de Kursk.')], 7),
      opt('Reforzar el frente del Donbás', [ARMY('donbas', { infantry: 2 })], 3),
    ] }),
  T({ id: 'm14_nk_troops', tag: 'RUS', image: 'war', title: 'Tropas norcoreanas',
    text: 'Pionyang envía miles de soldados para recuperar Kursk, a cambio de tecnología y alimentos. Seúl y Tokio siguen con alarma el acercamiento.',
    note: 'Unos once mil militares norcoreanos fueron desplegados en Kursk a finales de 2024, según los servicios de inteligencia surcoreanos y ucranianos.',
    options: [opt('Aceptar la ayuda de Pionyang', [ARMY('kursk', { infantry: 3 }), REL('PRK', 60), REL('KOR', -40), REL('JAP', -20), TECH('air', 1, 'PRK')], 9), opt('Rechazarla', [], 1)] }),
  E({ id: 'm14_spiderweb', tag: 'UKR', date: '2025-06-01', image: 'war', title: 'Operación Telaraña',
    text: 'Drones ocultos en camiones dentro de Rusia despegan a la vez contra cuatro bases de bombarderos estratégicos, a miles de kilómetros del frente.',
    condition: [war('RUS')],
    options: [opt('Ejecutar el plan', [X('bombers', -3, 'RUS'), TECH('ai', 1), PR(20), CH('Ucrania ataca con drones la aviación estratégica rusa en sus propias bases.')], 9), opt('Cancelarlo por riesgo de escalada', [PR(-5)], 1)] }),
  E({ id: 'm14_istanbul', tag: 'UKR', date: '2025-05-16', image: 'peace', title: 'Conversaciones en Estambul',
    text: 'Por primera vez desde 2022, delegaciones de Kiev y Moscú se sientan frente a frente. No hay alto el fuego, pero sí el mayor intercambio de prisioneros de la guerra.',
    condition: [war('RUS')],
    options: [
      opt('Canjear prisioneros y seguir hablando', [MP(1000), DIS(-3), REL('RUS', 10), REL('TUR', 20), CH('Ucrania y Rusia acuerdan en Estambul un canje de mil prisioneros por bando.')], 9),
      opt('Abandonar la mesa', [REL('USA', -20)], 1),
    ] }),
  E({ id: 'm14_alaska', tag: 'USA', date: '2025-08-15', image: 'peace', title: 'La cumbre de Alaska',
    text: 'Los presidentes estadounidense y ruso se reúnen en Anchorage para hablar de un acuerdo sobre Ucrania, sin presencia ucraniana. Termina sin acuerdo ni alto el fuego.',
    condition: [war('UKR', 'RUS')],
    options: [
      opt('Insistir en un acuerdo marco', [REL('RUS', 20), REL('UKR', -10), ...RELS(NATO_EU, -10)], 6),
      opt('Condicionar todo a un alto el fuego', [REL('RUS', -10), REL('UKR', 10)], 4),
    ] }),
  E({ id: 'm14_hague', tag: 'GER', date: '2025-06-25', image: 'court', title: 'El 5 % de La Haya',
    text: 'La cumbre de la OTAN acuerda elevar el gasto en defensa y seguridad al 5 % del PIB en 2035. Berlín reforma su freno de deuda para financiarlo.',
    options: [
      opt('Comprometer el 5 %', [IC(2), DIS(4), REL('USA', 20), CH('Alemania se compromete a gastar el 5 % del PIB en defensa y seguridad.')], 8),
      opt('Pedir más flexibilidad, como España', [REL('USA', -20), DIS(-2)], 2),
    ] }),
  E({ id: 'm14_geneva', tag: 'UKR', date: '2026-02-17', image: 'peace', title: 'Las rondas de Ginebra',
    text: 'Nuevas conversaciones con mediación estadounidense terminan sin avances: Moscú insiste en que Ucrania renuncie a la OTAN y entregue todo el Donbás; Kiev pide primero un alto el fuego en la línea de contacto.',
    condition: [war('RUS')],
    options: [
      opt('Seguir negociando sin ceder territorio', [DIS(2), REL('USA', 10), FL('geneva')], 7),
      opt('Priorizar la defensa y la producción propia', [IC(1), DIS(4)], 3),
    ] }),
];

// ------------------------------------------------------------------ Oriente Medio 2023–2026
const MIDEAST: GameEvent[] = [
  E({ id: 'm14_oct7', tag: 'ISR', date: '2023-10-07', image: 'war', title: '7 de octubre',
    text: 'Milicianos de Hamás atraviesan la valla de Gaza y atacan localidades, bases y un festival de música del sur de Israel. Unas 1200 personas mueren, en su mayoría civiles, y unas 250 son llevadas a Gaza como rehenes. Es el día más letal de la historia del país.',
    note: 'El ataque de Hamás desencadenó la guerra de Gaza. La ofensiva israelí causó decenas de miles de muertos en la Franja según su Ministerio de Sanidad, la destrucción de la mayor parte de sus edificios y el desplazamiento de casi toda su población; en agosto de 2025 la IPC confirmó una situación de hambruna en la gobernación de Gaza.',
    condition: [exists('PAL')],
    options: [
      opt('Ofensiva para desmantelar a Hamás y recuperar a los rehenes', [MP(300_000), NU(5), DIS(5), UNREST('gaza', 40), ...RELS(['EGY', 'JOR', 'TUR', 'QAT', 'IRN'], -40), REL('USA', 20), FL('gaza_war'), TR('m14_north', 1, 'LEB'), TR('m14_rafah', 20, 'EGY'), TR('m14_redsea', 43, 'USA'), CH('Hamás ataca Israel desde Gaza; Israel declara el estado de guerra.')], 8),
      opt('Operación limitada y prioridad a la negociación de los rehenes', [MP(150_000), DIS(10), UNREST('gaza', 15), FL('gaza_war'), TR('m14_north', 1, 'LEB'), TR('m14_rafah', 20, 'EGY'), TR('m14_redsea', 43, 'USA')], 2),
    ] }),
  T({ id: 'm14_north', tag: 'LEB', image: 'war', title: 'El frente norte',
    text: 'Hezbolá abre fuego sobre el norte de Israel «en solidaridad con Gaza». Decenas de miles de personas son evacuadas a ambos lados de la frontera.',
    options: [
      opt('El Gobierno no puede impedirlo', [DIS(10), REL('ISR', -40), CH('Comienza el intercambio de fuego en la frontera libanesa.')], 8),
      opt('Pedir a la FINUL y a Francia que medien', [REL('FRA', 20), DIS(5)], 2),
    ] }),
  T({ id: 'm14_rafah', tag: 'EGY', image: 'disaster', title: 'El paso de Rafah',
    text: 'Gaza está bajo un asedio casi total. Cientos de camiones de ayuda esperan en el Sinaí mientras se negocian inspecciones y garantías.',
    options: [
      opt('Abrir el paso a la ayuda humanitaria', [REL('PAL', 30), REL('ISR', -10), PR(10), UNREST('gaza', -5), CH('Entran los primeros convoyes de ayuda por Rafah.')], 8),
      opt('Mantener la frontera cerrada por seguridad', [REL('PAL', -20)], 2),
    ] }),
  E({ id: 'm14_truce23', tag: 'ISR', date: '2023-11-24', image: 'peace', title: 'La tregua de noviembre',
    text: 'Con mediación de Catar, Egipto y Estados Unidos, una pausa de una semana permite canjear rehenes por presos palestinos y aumentar la ayuda.',
    condition: [flag('gaza_war')],
    options: [
      opt('Aceptar la pausa', [DIS(-4), REL('QAT', 20), UNREST('gaza', -5), CH('Una tregua de siete días libera a un centenar de rehenes.')], 8),
      opt('Rechazarla', [DIS(8)], 2),
    ] }),
  T({ id: 'm14_redsea', tag: 'USA', image: 'war', title: 'Ataques en el mar Rojo',
    text: 'Los hutíes atacan buques mercantes en Bab el-Mandeb «en apoyo a Gaza». Las navieras desvían sus barcos por el cabo de Buena Esperanza; los ingresos del canal de Suez se hunden.',
    note: 'Los ataques comenzaron con el secuestro del Galaxy Leader el 19 de noviembre de 2023. EE. UU. y el Reino Unido bombardearon objetivos militares hutíes desde enero de 2024; en mayo de 2025 Washington y los hutíes acordaron, con mediación omaní, un cese de los ataques mutuos.',
    options: [
      opt('Escoltas navales y ataques contra objetivos militares hutíes', [REL('HOU', -80), X('navy', -1), X('stock_supplies', -300), FL('red_sea'), TRS(-50, 'EGY'), CH('Comienza la operación naval en el mar Rojo.')], 8),
      opt('Solo escoltas defensivas', [REL('HOU', -30), TRS(-50, 'EGY'), PR(-5)], 2),
    ] }),
  E({ id: 'm14_icj', tag: 'ISR', date: '2024-01-26', image: 'court', title: 'La Corte de La Haya',
    text: 'La Corte Internacional de Justicia, en el caso presentado por Sudáfrica, ordena a Israel medidas provisionales para prevenir actos prohibidos por la Convención sobre el Genocidio y permitir la ayuda humanitaria. El fondo del caso tardará años.',
    condition: [flag('gaza_war')],
    options: [
      opt('Rechazar la acusación y ampliar la ayuda', [UNREST('gaza', -5), PR(-5), ...RELS(['GER', 'FRA', 'ESP'], -10)], 6),
      opt('Rechazar la acusación sin cambios', [PR(-15), ...RELS(['GER', 'FRA', 'ESP', 'IRL'], -25)], 4),
    ] }),
  E({ id: 'm14_iran_april', tag: 'IRN', date: '2024-04-13', image: 'war', title: 'Ataque directo contra Israel',
    text: 'Un bombardeo atribuido a Israel ha destruido el edificio consular iraní en Damasco. Por primera vez, la República Islámica puede responder desde su propio territorio, no a través de aliados.',
    note: 'El 13-14 de abril de 2024 Irán lanzó más de 300 drones y misiles; casi todos fueron interceptados por Israel, EE. UU., el Reino Unido, Francia y Jordania. El 1 de octubre lanzó unos 180 misiles balísticos; Israel respondió el 26 de octubre contra defensas aéreas y plantas de misiles.',
    condition: [exists('ISR')],
    options: [
      opt('Represalia directa con drones y misiles', [REL('ISR', -60), REL('USA', -20), REL('JOR', -20), PR(10), BOMBED(5), FL('iran_direct'), CH('Irán ataca directamente a Israel por primera vez.')], 8),
      opt('Responder solo a través de aliados', [PR(-10)], 2),
    ] }),
  E({ id: 'm14_hezb24', tag: 'ISR', date: '2024-09-23', image: 'war', title: 'Escalada en el Líbano',
    text: 'Tras un año de fuego cruzado, el Gobierno decide golpear a fondo a Hezbolá para que los evacuados del norte puedan volver. Más de un millón de libaneses huye hacia el norte.',
    note: 'Entre septiembre y noviembre de 2024 Israel mató a buena parte de la cúpula de Hezbolá, incluido su secretario general, y entró por tierra en el sur del Líbano. El alto el fuego entró en vigor el 27 de noviembre de 2024.',
    condition: [flag('gaza_war')],
    options: [
      opt('Campaña contra Hezbolá y alto el fuego en noviembre', [X('dissent', 15, 'LEB'), REL('LEB', -30), PR(10), CH('Israel y el Líbano acuerdan un alto el fuego tras dos meses de guerra abierta.')], 8),
      opt('Contener el frente', [DIS(5)], 2),
    ] }),
  E({ id: 'm14_assad', tag: 'SYR', date: '2024-12-08', image: 'revolt', title: 'La caída de Damasco',
    text: 'En apenas doce días, una ofensiva rebelde lanzada desde Idlib toma Alepo, Hama y Homs. Sin el apoyo de una Rusia volcada en Ucrania ni de un Hezbolá diezmado, el régimen se derrumba y su presidente huye a Moscú.',
    note: 'Bashar al Asad cayó el 8 de diciembre de 2024, tras más de cincuenta años de gobierno de su familia y una guerra civil con cientos de miles de muertos. Una administración de transición encabezada por Hayat Tahrir al Sham asumió el poder.',
    options: [
      opt('Transición bajo la nueva administración', [DIS(-20), ST(1), REL('RUS', -80), REL('IRN', -80), REL('TUR', 60), ...RELS(GULF, 30), FL('assad_fall'), CH('Cae el régimen sirio; comienza una transición incierta.')], 9),
      opt('Fragmentación entre facciones', [DIS(20), ST(-2), UNREST('deir_ez_zor', 20), FL('assad_fall')], 1),
    ] }),
  E({ id: 'm14_gaza_jan25', tag: 'ISR', date: '2025-01-19', image: 'peace', title: 'El alto el fuego de enero',
    text: 'Un acuerdo en tres fases prevé liberar rehenes a cambio de presos palestinos y la entrada masiva de ayuda. La segunda fase, con retirada completa, aún no está negociada.',
    note: 'La primera fase duró hasta marzo de 2025; el 18 de marzo Israel reanudó los ataques. Un nuevo alto el fuego, basado en un plan estadounidense de veinte puntos, entró en vigor el 10 de octubre de 2025.',
    condition: [flag('gaza_war')],
    options: [
      opt('Aplicar la primera fase', [DIS(-5), UNREST('gaza', -10), REL('QAT', 20), REL('EGY', 20), TR('m14_gaza_oct25', 264)], 8),
      opt('Rechazarlo y mantener la presión militar', [DIS(8), UNREST('gaza', 10), TR('m14_gaza_oct25', 264)], 2),
    ] }),
  T({ id: 'm14_gaza_oct25', tag: 'ISR', image: 'peace', title: 'El plan de veinte puntos',
    text: 'Tras dos años de guerra, Washington, Egipto, Catar y Turquía presentan un plan: alto el fuego, liberación de todos los rehenes vivos, retirada por fases, desarme de Hamás, un comité tecnocrático palestino y una fuerza internacional de estabilización.',
    options: [
      opt('Aceptar el alto el fuego', [DIS(-10), NU(3), UNREST('gaza', -20), ...RELS(['QAT', 'EGY', 'TUR', 'USA'], 20), FL('gaza_ceasefire'), TR('m14_gaza_phase2', 96, 'USA'), CH('Entra en vigor el alto el fuego en Gaza; vuelven los rehenes vivos.')], 9),
      opt('Seguir la ofensiva', [DIS(15), ...RELS(['USA', 'GER', 'FRA'], -30)], 1),
    ] }),
  T({ id: 'm14_gaza_phase2', tag: 'USA', image: 'peace', title: 'La «fase dos» de Gaza',
    text: 'Washington anuncia el paso a la segunda fase: desmilitarización, gobierno tecnocrático y reconstrucción. El desarme de Hamás, la retirada israelí y la composición de la fuerza internacional siguen sin resolver; la ayuda sigue llegando con cuentagotas.',
    note: 'La fase dos se anunció el 14 de enero de 2026. Las muertes en Gaza continuaron después del alto el fuego, según las autoridades sanitarias locales.',
    options: [
      opt('Impulsar la fuerza de estabilización y la ayuda', [PR(10), REL('PAL', 20), UNREST('gaza', -10), FL('gaza_phase2', 'PAL')], 7),
      opt('Dejarlo en manos de las partes', [PR(-5)], 3),
    ] }),
  E({ id: 'm14_twelve_days', tag: 'ISR', date: '2025-06-13', image: 'war', title: 'La guerra de los doce días',
    text: 'Los servicios de inteligencia creen que Irán acumula uranio enriquecido al 60 %. El Gobierno estudia una campaña aérea contra instalaciones nucleares, defensas y mandos militares.',
    note: 'Del 13 al 24 de junio de 2025, Israel atacó Irán y este respondió con misiles balísticos. Murieron cientos de personas en Irán y decenas en Israel. El 22 de junio EE. UU. bombardeó Fordo, Natanz e Isfahán. Un alto el fuego entró en vigor el 24 de junio.',
    condition: [exists('IRN')],
    options: [
      opt('Lanzar la campaña aérea', [BOMBED(25, 'IRN'), X('fighters', -2, 'IRN'), REL('IRN', -80), DIS(4), FL('twelve_days'), TR('m14_hammer', 9, 'USA'), TR('m14_june_ceasefire', 11, 'IRN'), CH('Israel ataca el programa nuclear y militar iraní.')], 8),
      opt('Presión diplomática y sanciones', [REL('IRN', -20), PR(-5)], 2),
    ] }),
  T({ id: 'm14_hammer', tag: 'USA', image: 'war', title: 'Fordo',
    text: 'Solo los bombarderos estadounidenses pueden alcanzar la planta de enriquecimiento enterrada bajo una montaña cerca de Qom.',
    options: [
      opt('Bombardear Fordo, Natanz e Isfahán', [BOMBED(15, 'IRN'), REL('IRN', -60), REL('ISR', 20), DIS(3), FL('hammer'), CH('Bombarderos estadounidenses atacan las instalaciones nucleares iraníes.')], 8),
      opt('No intervenir directamente', [REL('ISR', -20)], 2),
    ] }),
  T({ id: 'm14_june_ceasefire', tag: 'IRN', image: 'peace', title: 'Alto el fuego',
    text: 'Tras un ataque simbólico contra la base de Al Udeid, avisado con antelación, Washington anuncia un alto el fuego entre Irán e Israel.',
    options: [
      opt('Aceptar el alto el fuego', [DIS(5), ST(-1), REL('QAT', -10), CH('Termina la guerra de los doce días.')], 9),
      opt('Seguir lanzando misiles', [REL('ISR', -40), BOMBED(10), DIS(8)], 1),
    ] }),
  E({ id: 'm14_snapback', tag: 'FRA', date: '2025-09-28', image: 'court', title: 'Vuelven las sanciones de la ONU',
    text: 'Francia, Alemania y el Reino Unido activan el mecanismo previsto en el acuerdo de 2015: las sanciones del Consejo de Seguridad contra Irán vuelven a estar en vigor.',
    condition: [flag('jcpoa', 'IRN')],
    options: [opt('Restablecer las sanciones', [REL('IRN', -40), X('stock_oil', -1000, 'IRN'), X('dissent', 5, 'IRN')], 9), opt('Dar otra oportunidad a la diplomacia', [REL('IRN', 10), REL('USA', -20)], 1)] }),
  E({ id: 'm14_iran26', tag: 'USA', date: '2026-02-28', image: 'war', title: 'La guerra con Irán',
    text: 'Las negociaciones sobre el programa nuclear y los misiles han fracasado. Washington y Jerusalén preparan una campaña conjunta mucho más amplia que la de junio de 2025.',
    note: 'El 28 de febrero de 2026 EE. UU. e Israel iniciaron una campaña aérea contra Irán. El líder supremo murió en los primeros ataques y le sucedió su hijo. Irán atacó Israel y países del Golfo y restringió el paso por Ormuz. Organizaciones de derechos humanos cifraron en más de 1600 los civiles muertos en Irán durante el primer mes. Un alto el fuego mediado por Pakistán llegó en abril.',
    condition: [exists('IRN'), flag('twelve_days', 'ISR')],
    options: [
      opt('Lanzar la campaña junto a Israel', [BOMBED(40, 'IRN'), ST(-2, 'IRN'), X('dissent', 15, 'IRN'), X('navy', -3, 'IRN'), REL('IRN', -100), DIS(6), FL('iran_war26'), FL('iran_war26', 'IRN'), TR('m14_hormuz', 4, 'IRN'), TR('m14_pak_mediation', 38, 'PAK'), CH('EE. UU. e Israel lanzan una campaña militar contra Irán.')], 8),
      opt('Mantener la presión sin atacar', [REL('ISR', -20), PR(-5)], 2),
    ] }),
  T({ id: 'm14_hormuz', tag: 'IRN', image: 'war', title: 'Ormuz',
    text: 'Por el estrecho pasa una quinta parte del petróleo del mundo. La Guardia Revolucionaria propone someter el tráfico a su autorización como respuesta a los ataques.',
    options: [
      opt('Restringir el paso por el estrecho', [...IMPORTERS.map((t) => OIL(-1500, t)), ...RELS(GULF, -60), REL('USA', -40), REL('IND', -20), FL('hormuz_closed'), CH('Irán restringe el tráfico marítimo por el estrecho de Ormuz; el crudo supera los 100 dólares.')], 8),
      opt('Mantenerlo abierto para ganarse a los mediadores', [...RELS(['OMA', 'QAT', 'IND', 'CHN'], 20), PR(-10)], 2),
    ] }),
  T({ id: 'm14_pak_mediation', tag: 'PAK', image: 'peace', title: 'Mediación de Islamabad',
    text: 'Pakistán, con canales abiertos en Washington y Teherán, propone un alto el fuego de dos semanas que dé paso a negociaciones técnicas.',
    options: [
      opt('Mediar el alto el fuego', [PR(25), REL('USA', 20), REL('IRN', 20), TR('m14_hormuz_talks', 140, 'OMA'), CH('Pakistán media un alto el fuego entre EE. UU. e Irán.')], 9),
      opt('Mantenerse al margen', [], 1),
    ] }),
  T({ id: 'm14_hormuz_talks', tag: 'OMA', image: 'peace', title: 'Un corredor en Ormuz',
    text: 'Tras un memorando preliminar entre Washington y Teherán, el tráfico sigue muy por debajo de lo normal. Omán negocia con Irán un corredor temporal y el desminado del estrecho; Teherán exige compensaciones y el fin de las sanciones para reabrirlo del todo.',
    note: 'Las negociaciones entre Irán y Omán sobre el corredor seguían abiertas a finales de agosto de 2026.',
    options: [
      opt('Proponer una administración compartida del corredor', [PR(20), REL('IRN', 20), ...RELS(['USA', 'IND', 'JAP'], 15), FL('hormuz_corridor')], 8),
      opt('Esperar a un acuerdo entre las grandes potencias', [], 2),
    ] }),
];

// ------------------------------------------------------------------ Asia: Taiwán, chips e IA (2022–2026)
const ASIA: GameEvent[] = [
  E({ id: 'm14_hk', tag: 'CHN', date: '2020-06-30', image: 'court', title: 'Hong Kong',
    text: 'Tras un año de protestas masivas, Pekín aprueba una ley de seguridad nacional para Hong Kong que castiga la secesión, la subversión y la «colusión con fuerzas extranjeras».',
    options: [
      opt('Aplicar la ley de seguridad nacional', [ST(1), REL('GBR', -40), REL('USA', -30), REL('TAI', -40), CH('China aprueba la ley de seguridad nacional para Hong Kong.')], 9),
      opt('Negociar con el campo prodemocrático', [ST(-1), DIS(5), REL('GBR', 10)], 1),
    ] }),
  E({ id: 'm14_pelosi', tag: 'CHN', date: '2022-08-04', image: 'war', title: 'Maniobras tras la visita a Taipéi',
    text: 'La presidenta de la Cámara de Representantes estadounidense ha visitado Taiwán. El Ejército Popular de Liberación puede rodear la isla con ejercicios de fuego real sin precedentes.',
    condition: [exists('TAI')],
    options: [
      opt('Ejercicios de fuego real alrededor de la isla', [REL('TAI', -40), REL('USA', -40), REL('JAP', -20), X('navy', 1), FL('tw_drills'), TR('m14_porcupine', 30, 'TAI'), CH('China rodea Taiwán con maniobras militares a gran escala.')], 9),
      opt('Protesta formal', [PR(-10)], 1),
    ] }),
  T({ id: 'm14_porcupine', tag: 'TAI', image: 'war', title: 'La estrategia del puercoespín',
    text: 'Los ensayos de bloqueo dejan clara la amenaza. Los asesores proponen menos grandes plataformas y más misiles móviles, minas, drones y defensa civil.',
    options: [
      opt('Ampliar la mili y apostar por armas asimétricas', [TECH('ai', 1), TECH('naval', 1), MP(60_000), IC(1), DIS(3), FL('porcupine'), CH('Taiwán amplía el servicio militar obligatorio a un año.')], 8),
      opt('Comprar cazas y buques de superficie', [X('fighters', 3), X('navy', 2), TRS(-80)], 2),
    ] }),
  E({ id: 'm14_chatgpt', tag: 'USA', date: '2022-11-30', image: 'prosperity', title: 'La explosión de la IA generativa',
    text: 'Un asistente conversacional alcanza cien millones de usuarios en dos meses. Los laboratorios estadounidenses compiten por chips, energía y talento; el Pentágono quiere saber qué significa todo esto para la guerra.',
    options: [
      opt('Programa nacional de IA para defensa', [TECH('ai', 1), RP(60), NRG(-500), FL('usa_ai'), CH('La IA generativa desata una carrera tecnológica global.')], 8),
      opt('Dejar que lidere el sector privado', [TECH('ai', 1), TRS(50)], 2),
    ] }),
  E({ id: 'm14_chips', tag: 'USA', date: '2022-10-07', image: 'court', title: 'Controles a la exportación de chips',
    text: 'El Departamento de Comercio prepara reglas que impedirían a China comprar los chips de IA más avanzados y la maquinaria para fabricarlos. Los Países Bajos y Japón tendrían que sumarse.',
    condition: [exists('CHN')],
    options: [
      opt('Imponer los controles', [RP(-150, 'CHN'), REL('CHN', -40), REL('NLD', 10), REL('JAP', 10), X('dissent', 2, 'TAI'), FL('chip_controls'), TR('m14_gallium', 270, 'CHN'), CH('EE. UU. restringe la exportación de chips avanzados a China.')], 9),
      opt('Controles limitados a usos militares', [RP(-40, 'CHN'), REL('CHN', -10)], 1),
    ] }),
  T({ id: 'm14_gallium', tag: 'CHN', image: 'court', title: 'Galio, germanio y tierras raras',
    text: 'China refina casi todo el galio del mundo y la mayor parte de las tierras raras. Restringir su exportación sería una respuesta proporcional a los controles de chips.',
    note: 'Pekín restringió el galio y el germanio en agosto de 2023 y siete tierras raras en abril de 2025. Tras la cumbre de Busan (30 de octubre de 2025), ambas partes suspendieron durante un año parte de sus medidas.',
    options: [
      opt('Licencias de exportación para minerales críticos', [RARE(-600, 'USA'), RARE(-600, 'JAP'), RARE(-400, 'GER'), REL('USA', -20), PR(10), FL('rare_controls'), TR('m14_busan', 820, 'USA')], 8),
      opt('No mezclar comercio y tecnología', [REL('USA', 10)], 2),
    ] }),
  T({ id: 'm14_busan', tag: 'USA', image: 'peace', title: 'La tregua de Busan',
    text: 'Tras una escalada de aranceles y nuevas restricciones chinas sobre tierras raras, los presidentes de ambos países se reúnen en Corea del Sur.',
    options: [
      opt('Tregua comercial de un año', [RARE(800), REL('CHN', 30), DIS(-2), FL('busan')], 7),
      opt('Mantener aranceles y controles', [REL('CHN', -20), RARE(-300)], 3),
    ] }),
  E({ id: 'm14_laws_un', tag: 'AUT', date: '2023-12-22', image: 'court', title: 'Armas autónomas en la ONU',
    text: 'Viena impulsa la primera resolución de la Asamblea General sobre sistemas de armas autónomos letales. Una gran mayoría la apoya; las potencias militares prefieren no comprometerse.',
    options: [
      opt('Encabezar la campaña por un tratado', [PR(20), FL('laws_un'), CH('La Asamblea General de la ONU aprueba su primera resolución sobre armas autónomas.')], 9),
      opt('Dejarlo en manos de Ginebra', [], 1),
    ] }),
  E({ id: 'm14_ai_act', tag: 'GER', date: '2024-08-01', image: 'court', title: 'El Reglamento europeo de IA',
    text: 'Entra en vigor la primera ley general sobre inteligencia artificial del mundo. Excluye los usos militares, pero obliga a las empresas europeas a documentar los riesgos de sus modelos.',
    options: [
      opt('Aplicarlo con rigor', [DIS(-2), RP(-30), PR(10), FL('ai_act')], 6),
      opt('Pedir una aplicación flexible para no quedarse atrás', [RP(20), PR(-5)], 4),
    ] }),
  E({ id: 'm14_deepseek', tag: 'CHN', date: '2025-01-20', image: 'prosperity', title: 'Un modelo barato y abierto',
    text: 'Un laboratorio chino publica un modelo de razonamiento comparable a los mejores estadounidenses, entrenado con una fracción del coste. Las bolsas tiemblan en Nueva York.',
    options: [
      opt('Apostar por modelos abiertos', [TECH('ai', 1), PR(15), TR('m14_stargate', 2, 'USA')], 7),
      opt('Integrarlo en el aparato militar y de seguridad', [TECH('ai', 1), CMB(0.03), REL('USA', -10), TR('m14_stargate', 2, 'USA')], 3),
    ] }),
  T({ id: 'm14_stargate', tag: 'USA', image: 'prosperity', title: 'La carrera de los centros de datos',
    text: 'Grandes empresas anuncian inversiones de cientos de miles de millones en centros de datos. La demanda eléctrica se dispara.',
    options: [
      opt('Acelerar: energía y permisos para la IA', [TECH('ai', 1), NRG(-1500), IC(1), FL('ai_buildout')], 7),
      opt('Crecer con criterios de seguridad y eficiencia', [RP(40), DIS(-1)], 3),
    ] }),
  E({ id: 'm14_sindoor', tag: 'IND', date: '2025-05-07', image: 'war', title: 'Operación Sindur',
    text: 'Un atentado en Pahalgam, en Cachemira, mata a 26 civiles, casi todos turistas. Nueva Delhi suspende el Tratado de las Aguas del Indo y prepara una respuesta.',
    note: 'Del 7 al 10 de mayo de 2025, la India y Pakistán intercambiaron ataques con misiles, drones y artillería, la escalada más grave en décadas entre dos potencias nucleares. El alto el fuego llegó el 10 de mayo.',
    condition: [exists('PAK')],
    options: [
      opt('Ataques contra infraestructuras de grupos armados', [REL('PAK', -60), TECH('air', 1), NU(3), FL('sindoor'), TR('m14_may_ceasefire', 3, 'PAK')], 8),
      opt('Presión diplomática y hídrica', [REL('PAK', -40)], 2),
    ] }),
  T({ id: 'm14_may_ceasefire', tag: 'PAK', image: 'peace', title: 'Cuatro días de mayo',
    text: 'Tras varios días de ataques cruzados con drones y misiles sobre bases aéreas, las presiones internacionales se multiplican.',
    options: [
      opt('Aceptar el alto el fuego', [REL('IND', 10), PR(5), CH('La India y Pakistán acuerdan un alto el fuego el 10 de mayo.')], 9),
      opt('Seguir respondiendo', [REL('IND', -30), DIS(5)], 1),
    ] }),
  E({ id: 'm14_justice', tag: 'TAI', date: '2025-12-29', image: 'war', title: 'Misión Justicia',
    text: 'Fuerzas de los cuatro ejércitos chinos y de la guardia costera simulan un bloqueo total de la isla y sus puertos. Es la séptima gran maniobra desde 2022.',
    note: 'Las maniobras continuaron en 2026, incluidas unas en septiembre que por primera vez se presentaron como destinadas a disuadir una intervención exterior.',
    condition: [exists('CHN')],
    options: [
      opt('Presupuesto especial de defensa', [IC(1), TECH('ai', 1), DIS(2), REL('CHN', -20), FL('tw_budget')], 7),
      opt('Bajar el tono y buscar canales con Pekín', [REL('CHN', 10), REL('USA', -10)], 3),
    ] }),
];

// ------------------------------------------------------------------ 2027–2050: escenario hipotético
const FUTURE: GameEvent[] = [
  // --- Taiwán
  H({ id: 'm14h_tw_pressure', tag: 'CHN', date: '2027-10-01', image: 'war', title: 'Presión sobre Taiwán',
    text: 'El centenario del Ejército Popular de Liberación se acerca. En Pekín se discute si ha llegado el momento de pasar de las maniobras a una presión que cambie los hechos sobre el terreno.',
    condition: [exists('TAI'), peace],
    options: [
      opt('Cuarentena aduanera de la isla', [REL('TAI', -80), REL('USA', -50), REL('JAP', -30), X('stock_energy', -2000, 'TAI'), FL('tw_quarantine'), TR('m14h_tw_quarantine', 4, 'TAI'), TR('m14h_tw_escort', 7, 'USA'), CH('China impone una cuarentena aduanera alrededor de Taiwán.')], 4, 'Sin disparar, pero cada barco necesitará permiso chino.'),
      opt('Ofensiva de seducción: comercio y diálogo', [REL('TAI', 40), PR(-5), FL('tw_dialogue'), TR('m14h_tw_talks', 60, 'TAI')], 4),
      opt('Mantener las maniobras periódicas', [X('navy', 2), REL('TAI', -10)], 3),
    ] }, 2027, 2035),
  HT({ id: 'm14h_tw_quarantine', tag: 'TAI', image: 'disaster', title: 'La cuarentena',
    text: 'Los buques de la guardia costera china exigen inspeccionar los cargueros que se dirigen a Kaohsiung. Las reservas de gas natural licuado dan para pocas semanas.',
    options: [
      opt('Racionar la energía y resistir', [DIS(8), NU(5), NRG(800), CH('Taiwán raciona la energía y se niega a aceptar las inspecciones.')], 6),
      opt('Negociar con Pekín una salida', [REL('CHN', 30), DIS(12), FL('tw_talks_forced')], 3),
      opt('Pedir escoltas internacionales', [REL('USA', 20), REL('JAP', 20)], 1),
    ] }, 2027, 2036),
  HT({ id: 'm14h_tw_escort', tag: 'USA', image: 'war', title: 'Convoyes hacia Taiwán',
    text: 'Romper la cuarentena exige escoltar mercantes con buques de guerra a pocas millas de la flota china. Nadie quiere disparar primero entre potencias nucleares.',
    options: [
      opt('Convoyes escoltados con Japón y Australia', [X('navy', 8, 'TAI'), REL('CHN', -60), REL('TAI', 40), FL('us_escort'), TR('m14h_tw_brink', 20, 'CHN')], 5),
      opt('Sanciones económicas, sin escoltas', [X('factory', -3, 'CHN'), REL('CHN', -40), DIS(3), TR('m14h_tw_brink', 30, 'CHN')], 3),
      opt('Mediación y desescalada', [REL('CHN', 20), REL('TAI', -20), FL('tw_deescalate'), TR('m14h_tw_brink', 30, 'CHN')], 2),
    ] }, 2027, 2036),
  HT({ id: 'm14h_tw_brink', tag: 'CHN', image: 'war', title: 'Al borde del abismo',
    text: 'La cuarentena no ha doblegado a la isla y la economía mundial se resiente. El Comité Militar Central presenta dos caminos. La disuasión nuclear de ambas partes pesa sobre cualquier cálculo de escalada.',
    options: [
      opt('Levantar la cuarentena a cambio de garantías', [REL('TAI', 20), REL('USA', 30), PR(-10), FL('tw_status_quo'), CH('China levanta la cuarentena; ambas orillas vuelven al statu quo.')], 7),
      opt('Ordenar el desembarco', [...isolate('TAI'), ...isolate('CHN'), { type: 'declareWar', target: 'TAI', goal: 'taiwan' }, { type: 'claim', provinces: ['taiwan'] }, INF(20), X('aggression', 0.5), FL('tw_war'), TR('m14h_tw_war_usa', 3, 'USA'), CH('China lanza una operación anfibia contra Taiwán.')], 1, 'La guerra que todos temían.'),
    ] }, 2027, 2036),
  HT({ id: 'm14h_tw_war_usa', tag: 'USA', image: 'war', title: 'Guerra en el estrecho',
    text: 'Columnas de lanchas de desembarco cruzan el estrecho. Taipéi pide ayuda; Tokio, Seúl y Canberra esperan la decisión de Washington.',
    condition: [war('TAI', 'CHN')],
    options: [
      opt('Apoyo material masivo sin entrar en combate', [ARMY('taiwan', { infantry: 3, drones: 2 }, 'TAI'), X('navy', 6, 'TAI'), X('factory', -5, 'CHN'), REL('CHN', -100), DIS(6)], 6),
      opt('Entrar en la guerra', [{ type: 'declareWar', target: 'CHN' }, DIS(15), FL('pacific_war')], 3, 'Bloque contra bloque.'),
      opt('Limitarse a sanciones', [X('factory', -2, 'CHN'), PR(-30), REL('TAI', -50)], 1),
    ] }, 2027, 2036),
  HT({ id: 'm14h_tw_talks', tag: 'TAI', image: 'peace', title: 'Conversaciones a través del estrecho',
    text: 'Por primera vez en años, delegaciones de ambas orillas se reúnen en Singapur. Pekín ofrece comercio y turismo; Taipéi exige que no haya amenaza militar.',
    options: [
      opt('Acuerdo provisional: estatus quo verificado', [REL('CHN', 50), DIS(-4), FL('tw_modus'), FL('tw_status_quo', 'CHN'), CH('Taipéi y Pekín acuerdan un marco provisional de convivencia.')], 6),
      opt('Rechazar sin garantías de seguridad', [REL('CHN', -20), NU(3)], 4),
    ] }, 2027, 2036),
  // --- IA militar: tratado o carrera
  H({ id: 'm14h_laws_treaty', tag: 'USA', date: '2028-03-01', image: 'court', title: '¿Un tratado sobre armas autónomas?',
    text: 'Tras años de debates en Ginebra, un grupo amplio de Estados propone un tratado: control humano significativo sobre el uso de la fuerza, prohibición de sistemas imprevisibles y verificación de los modelos militares.',
    options: [
      opt('Firmar y presionar a Pekín y Moscú', [ALL(10), RP(-60), FL('laws_treaty'), TR('m14h_laws_china', 30, 'CHN'), CH('Washington firma el tratado sobre armas autónomas.')], 5),
      opt('Carrera sin control: no podemos quedarnos atrás', [TECH('ai', 1), FL('ai_arms_race'), REL('CHN', -20), TR('m14h_race_china', 30, 'CHN')], 5),
    ] }, 2028, 2040),
  HT({ id: 'm14h_laws_china', tag: 'CHN', image: 'court', title: 'Pekín ante el tratado',
    text: 'Washington ha firmado. Si China se suma, los dos grandes desarrolladores de IA militar aceptarían inspecciones mutuas por primera vez.',
    options: [
      opt('Firmar con verificación recíproca', [ALL(10), FL('laws_treaty'), REL('USA', 40), CH('China se adhiere al tratado sobre armas autónomas.')], 6),
      opt('Rechazar el «tratado de los ricos»', [TECH('ai', 1), FL('ai_arms_race'), REL('USA', -30)], 4),
    ] }, 2028, 2040),
  HT({ id: 'm14h_race_china', tag: 'CHN', image: 'war', title: 'La carrera de los enjambres',
    text: 'Washington ha rechazado cualquier límite. Los ingenieros proponen enjambres autónomos capaces de saturar defensas aéreas y flotas enteras.',
    options: [
      opt('Programa acelerado de sistemas autónomos', [TECH('ai', 2), IC(2), FL('ai_arms_race'), REL('USA', -30)], 7),
      opt('Ofrecer conversaciones bilaterales', [REL('USA', 20), FL('ai_talks')], 3),
    ] }, 2028, 2040),
  H({ id: 'm14h_ai_incident', date: '2030-05-01', image: 'disaster', title: 'Error de un sistema autónomo',
    text: 'Un sistema de defensa autónomo clasifica como amenaza un avión de patrulla aliado y lo derriba sin intervención humana. La investigación apunta a datos de entrenamiento contaminados.',
    condition: [flag('ai_arms_race')],
    options: [
      opt('Pausa operativa y revisión independiente', [RP(-60), DIS(-2), PR(5), FL('ai_review')], 6),
      opt('Ocultar el informe y seguir adelante', [DIS(6), TECH('ai', 1), PR(-10)], 4),
    ] }, 2030, 2045),
  H({ id: 'm14h_cyber_grid', tag: 'GER', date: '2031-01-01', image: 'disaster', title: 'El gran apagón',
    text: 'Un ciberataque con herramientas de IA deja sin luz a millones de europeos durante tres días de invierno. La atribución es probable pero no concluyente.',
    options: [
      opt('Responder con sanciones coordinadas', [REL('RUS', -30), DIS(5), NRG(-1000), FL('cyber_grid')], 5),
      opt('Invertir en resiliencia y defensa activa', [IC(-1), TECH('ai', 1), DIS(2)], 5),
    ] }, 2031, 2045),
  H({ id: 'm14h_hotline', tag: 'USA', date: '2032-01-01', image: 'peace', title: 'Línea directa para la IA militar',
    text: 'Con ambos firmantes del tratado, Washington y Pekín pueden instalar un canal permanente para notificar incidentes de sistemas autónomos antes de que escalen.',
    condition: [flag('laws_treaty'), flag('laws_treaty', 'CHN')],
    options: [
      opt('Crear la línea directa y una agencia de verificación', [REL('CHN', 40), ALL(10), FL('ai_agency'), CH('Nace la Agencia Internacional de Verificación de IA.')], 8),
      opt('Mantener solo contactos discretos', [REL('CHN', 10)], 2),
    ] }, 2032, 2045),
  // --- bloque contra bloque
  H({ id: 'm14h_eurasia', tag: 'CHN', date: '2031-06-01', image: 'court', title: 'Un pacto euroasiático',
    text: 'Sin tratado y con la carrera de la IA desatada, Moscú y Teherán proponen convertir la asociación estratégica en una alianza militar formal.',
    condition: [flag('ai_arms_race')],
    options: [
      opt('Formar el Pacto Euroasiático', [{ type: 'joinFaction', faction: 'eurasia' }, { type: 'joinFaction', tag: 'RUS', faction: 'eurasia' }, { type: 'joinFaction', tag: 'IRN', faction: 'eurasia' }, { type: 'joinFaction', tag: 'PRK', faction: 'eurasia' }, ...RELS(WEST, -40), FL('blocs'), CH('China, Rusia, Irán y Corea del Norte forman una alianza militar.')], 4),
      opt('Mantener la autonomía estratégica', [REL('USA', 10), PR(5)], 6),
    ] }, 2031, 2045),
  H({ id: 'm14h_blocs_response', tag: 'USA', date: '2032-01-01', image: 'court', title: 'Dos bloques',
    text: 'Con un pacto militar euroasiático en marcha, la OTAN debate ampliar su cooperación con Japón, Corea del Sur, Australia y Filipinas.',
    condition: [flag('blocs', 'CHN')],
    options: [
      opt('Integrar a los aliados del Pacífico en la OTAN', [{ type: 'joinFaction', tag: 'JAP', faction: 'nato' }, { type: 'joinFaction', tag: 'KOR', faction: 'nato' }, { type: 'joinFaction', tag: 'AUS', faction: 'nato' }, IC(2), REL('CHN', -40)], 5),
      opt('Abrir un canal de distensión', [REL('CHN', 30), REL('RUS', 20), FL('detente')], 5, 'Como en los años setenta.'),
    ] }, 2032, 2046),
  // --- recursos, energía y clima
  H({ id: 'm14h_rare_shortage', tag: 'USA', date: '2029-01-01', image: 'disaster', title: 'Escasez de tierras raras',
    text: 'Imanes para motores eléctricos, misiles y drones: la demanda se ha multiplicado y la oferta sigue concentrada en China.',
    options: [
      opt('Minas y refinerías propias con Australia y Canadá', [TRS(-100), RARE(1500), REL('AUS', 20), REL('CAN', 20), DIS(2)], 5),
      opt('Acuerdo de suministro con Pekín', [RARE(2000), REL('CHN', 30), PR(-5)], 3),
      opt('Reciclaje y sustitución', [RP(-40), RARE(800)], 2),
    ] }, 2029, 2040),
  H({ id: 'm14h_arctic', tag: 'RUS', date: '2030-07-01', image: 'explore', title: 'El Ártico se abre',
    text: 'Por primera vez la ruta del mar del Norte es navegable todo el verano. Petróleo, gas y minerales quedan al alcance; también nuevas fricciones con Noruega y EE. UU.',
    options: [
      opt('Militarizar la ruta del Norte', [X('navy', 3), OIL(1500), ...RELS(['NOR', 'USA', 'FIN'], -20)], 5),
      opt('Gestión compartida en el Consejo Ártico', [OIL(800), ...RELS(['NOR', 'USA', 'FIN', 'CAN'], 20), FL('arctic_coop')], 5),
    ] }, 2030, 2045),
  H({ id: 'm14h_indus', tag: 'IND', date: '2033-04-01', image: 'disaster', title: 'Sequía en el Indo',
    text: 'Una ola de calor extrema y el retroceso de los glaciares del Himalaya reducen el caudal del Indo. En Pakistán, el agua escasea en el Punyab.',
    condition: [exists('PAK')],
    options: [
      opt('Comisión conjunta del Indo con Pakistán', [REL('PAK', 40), PR(10), FL('indus_coop'), CH('La India y Pakistán crean una comisión conjunta del Indo.')], 6),
      opt('Gestión nacional de las presas', [REL('PAK', -40), UNREST('kashmir', 10), DIS(-2)], 4),
    ] }, 2033, 2046),
  H({ id: 'm14h_migration', tag: 'GER', date: '2035-06-01', image: 'disaster', title: 'Migraciones climáticas',
    text: 'Sequías en el Sahel y Oriente Medio empujan a millones de personas hacia el norte. La UE debate cuotas, vías legales y cooperación con los países de origen.',
    options: [
      opt('Vías legales y fondo de adaptación', [MP(150_000), DIS(5), TRS(-100), PR(10)], 5),
      opt('Cerrar fronteras y externalizar el control', [DIS(-2), PR(-15), ...RELS(['MAR', 'EGY', 'TUN'], -10)], 5),
    ] }, 2035, 2048),
  // --- reconstrucción y paz
  H({ id: 'm14h_ukr_ceasefire', tag: 'UKR', date: '2027-03-01', image: 'peace', title: 'Alto el fuego en la línea de contacto',
    text: 'Agotados ambos ejércitos, una propuesta europea y estadounidense ofrece congelar el frente con una misión internacional de vigilancia y garantías de seguridad para Ucrania, sin reconocer anexiones.',
    condition: [war('RUS')],
    options: [
      opt('Aceptar con garantías europeas', [X('stubborn', -180), X('stubborn', -180, 'RUS'), DIS(-5), ...RELS(NATO_EU, 20), FL('ukr_ceasefire'), CH('Ucrania acepta un alto el fuego vigilado internacionalmente.')], 6),
      opt('Seguir luchando hasta recuperar las fronteras de 1991', [NU(3), DIS(6)], 4),
    ] }, 2027, 2034),
  H({ id: 'm14h_ukr_rebuild', tag: 'UKR', date: '2028-06-01', image: 'prosperity', title: 'La reconstrucción de Ucrania',
    text: 'Con las armas en silencio, una conferencia internacional reúne fondos, incluidos activos rusos inmovilizados, para reconstruir redes eléctricas, viviendas y fábricas.',
    condition: [peace, exists('RUS')],
    options: [
      opt('Plan de reconstrucción con la UE', [IC(3), DIS(-8), REL('GER', 30), FL('ukr_rebuild'), FL('eu_path'), CH('Comienza la reconstrucción de Ucrania.')], 7),
      opt('Neutralidad y comercio con todos', [IC(1), REL('RUS', 20), REL('CHN', 20), FL('ukr_rebuild')], 3),
    ] }, 2028, 2040),
  H({ id: 'm14h_ukr_eu', tag: 'UKR', date: '2032-01-01', image: 'peace', title: 'Ucrania en la Unión Europea',
    text: 'Tras años de reformas, el Consejo Europeo vota la adhesión de Ucrania.',
    condition: [flag('eu_path'), peace],
    options: [
      opt('Ratificar la adhesión', [IC(2), ST(1), ...RELS(NATO_EU, 30), REL('RUS', -20), FL('eu_member'), CH('Ucrania ingresa en la Unión Europea.')], 9),
      opt('Aplazarla', [DIS(4)], 1),
    ] }, 2032, 2045),
  H({ id: 'm14h_gaza_rebuild', tag: 'PAL', date: '2027-06-01', image: 'prosperity', title: 'Reconstruir Gaza',
    text: 'La Franja necesita retirar decenas de millones de toneladas de escombros, restablecer el agua y la electricidad y volver a abrir escuelas y hospitales. La financiación depende de la seguridad y de quién gobierne.',
    condition: [flag('gaza_ceasefire', 'ISR')],
    options: [
      opt('Comité tecnocrático con fondos del Golfo y la UE', [UNREST('gaza', -20), ...RELS(GULF, 20), REL('GER', 20), FL('gaza_rebuilt'), CH('Comienza la reconstrucción de Gaza.')], 7),
      opt('Esperar un acuerdo político completo', [UNREST('gaza', 10)], 3),
    ] }, 2027, 2040),
  H({ id: 'm14h_regional_peace', tag: 'ISR', date: '2031-01-01', image: 'peace', title: 'Una conferencia de paz regional',
    text: 'Riad ofrece normalizar relaciones a cambio de un camino creíble hacia un Estado palestino. En Israel, la propuesta divide al Gobierno y a la calle.',
    condition: [flag('gaza_rebuilt', 'PAL')],
    options: [
      opt('Aceptar una hoja de ruta hacia dos Estados', [REL('SAU', 80), REL('PAL', 60), DIS(6), FL('peace_track'), CH('Israel acepta una hoja de ruta hacia dos Estados con normalización saudí.')], 5),
      opt('Normalización sin compromisos territoriales', [REL('SAU', 10), REL('PAL', -20)], 5),
    ] }, 2031, 2045),
  H({ id: 'm14h_iran_deal', tag: 'IRN', date: '2028-01-01', image: 'peace', title: 'Un nuevo acuerdo',
    text: 'Tras dos guerras y años de sanciones, la economía iraní está exhausta. Mediadores omaníes y catarís proponen un acuerdo con inspecciones reforzadas, reapertura plena de Ormuz y fin de sanciones.',
    condition: [exists('USA')],
    options: [
      opt('Aceptar inspecciones y reabrir Ormuz', [REL('USA', 50), ...RELS(GULF, 30), OIL(2000), TRS(150), DIS(-10), FL('iran_rebuild'), CH('Irán firma un nuevo acuerdo y reabre por completo el estrecho de Ormuz.')], 5),
      opt('Resistencia: más misiles y más drones', [TECH('air', 1), IC(1), REL('USA', -30), DIS(6)], 5),
    ] }, 2028, 2040),
  // --- la IA general
  H({ id: 'm14h_agi', date: '2036-01-01', image: 'prosperity', title: 'Inteligencia artificial general',
    text: 'Un laboratorio anuncia un sistema capaz de igualar a expertos humanos en casi cualquier tarea intelectual, incluida la investigación científica. Las bolsas se disparan; los sindicatos, los militares y los teólogos se ponen nerviosos.',
    condition: [minX('ic', 70)],
    options: [
      opt('Desplegarla bajo supervisión internacional', [TECH('ai', 2), IC(4), DIS(8), ALL(15), FL('agi_shared'), TR('m14h_agi_jobs', 180), CH('Se anuncia la primera IA general; su despliegue queda bajo supervisión internacional.')], 5),
      opt('Monopolio nacional y uso estratégico', [TECH('ai', 3), IC(5), CMB(0.1), DIS(12), INF(5), ALL(-15), FL('agi_monopoly'), TR('m14h_agi_jobs', 180), CH('La primera IA general queda bajo control exclusivo del Estado.')], 4),
      opt('Moratoria hasta comprender sus riesgos', [ST(1), DIS(-2), PR(10)], 1),
    ] }, 2036, 2048),
  HT({ id: 'm14h_agi_jobs', image: 'revolt', title: 'Desempleo tecnológico',
    text: 'En un año, la automatización ha eliminado millones de empleos administrativos y técnicos. La productividad crece; la desigualdad, también.',
    options: [
      opt('Renta básica financiada con impuestos a la automatización', [DIS(-10), IC(-1), ST(1)], 5),
      opt('Reconversión laboral y dejar actuar al mercado', [DIS(6), IC(1)], 5),
    ] }, 2036, 2050),
  H({ id: 'm14h_2050', date: '2050-06-01', image: 'peace', title: 'El mundo en 2050',
    text: 'Treinta y seis años después de Crimea, los historiadores debaten si la primera mitad del siglo XXI fue una larga guerra fría o una transición que, contra pronóstico, evitó lo peor.',
    options: [opt('Mirar atrás', [CH('Balance de medio siglo: el mundo llega a 2050.')])] }, 2050, 2051),
];

// ------------------------------------------------------------------ dynamic pool (this scenario does not use the 1936 pool)
const RUS_CORE = ['moscow', 'ingria', 'novgorod', 'pskov', 'tver', 'smolensk', 'ryazan', 'vladimir', 'yaroslavl', 'vologda', 'nizhny', 'kazan', 'kursk', 'voronezh', 'don', 'kuban', 'tsaritsyn', 'astrakhan', 'samara', 'stavropol', 'north_caucasus'];
const UKR_WEST = ['kiev', 'chernigov', 'poltava', 'odesa', 'podolia', 'volhynia', 'red_ruthenia'];
const POOL: GameEvent[] = [
  // post-war guard rails: neither side keeps what its own stated war aims never included
  P({ id: 'm14_restore_rus', tag: 'UKR', mtthMonths: 2, image: 'peace', title: 'Volver a la frontera internacional', condition: [peace, exists('RUS'), year(2022), { type: 'ownsCount', provinces: RUS_CORE, count: 1 }],
    text: 'Las tropas ucranianas controlan territorio ruso reconocido internacionalmente. Kiev siempre ha dicho que su objetivo son las fronteras de 1991, no conquistar Rusia; los aliados piden devolverlo.',
    options: [opt('Retirarse a cambio de garantías', [{ type: 'cede', from: 'UKR', to: 'RUS', provinces: RUS_CORE }, PR(10), ...RELS(NATO_EU, 10), REL('RUS', 20)], 9), opt('Mantenerlo como baza negociadora', [INF(5), ...RELS(NATO_EU, -15)], 1)] }),
  P({ id: 'm14_restore_ukr', tag: 'RUS', mtthMonths: 3, image: 'peace', title: 'Una ocupación insostenible', condition: [peace, exists('UKR'), year(2022), { type: 'ownsCount', provinces: UKR_WEST, count: 1 }],
    text: 'Mantener provincias del centro y el oeste de Ucrania exige cientos de miles de soldados frente a una población hostil y sanciones cada vez más duras. El Estado Mayor propone replegarse a las regiones que el Kremlin declaró anexionadas.',
    options: [opt('Replegarse a las regiones anexionadas', [{ type: 'cede', from: 'RUS', to: 'UKR', provinces: UKR_WEST }, DIS(-5), REL('UKR', 20)], 8), opt('Mantener la ocupación', [INF(8), DIS(8), ...UKR_WEST.map((p) => UNREST(p, 10))], 2)] }),
  P({ id: 'm14p_aid', tag: 'UKR', mtthMonths: 6, image: 'war', title: 'Un nuevo paquete de ayuda', condition: [war('RUS'), { type: 'maxYear', value: 2028 }],
    text: 'Los aliados aprueban otro paquete de ayuda militar: munición de artillería, blindados usados, sistemas antiaéreos y fondos para la industria local.',
    options: [opt('Reforzar el frente', [ARMY('kiev', { infantry: 2, artillery: 1 }), X('stock_supplies', 600)], 6), opt('Priorizar la defensa antiaérea', [X('fighters', 2), ARMY('kiev', { infantry: 1 })], 4)] }),
  P({ id: 'm14p_cyber', mtthMonths: 300, image: 'disaster', title: 'Ciberataque contra infraestructuras', condition: [year(2015)],
    text: 'Un programa malicioso cifra los sistemas de hospitales, puertos y operadores eléctricos. Los atacantes piden un rescate en criptomonedas.',
    options: [opt('Invertir en ciberdefensa', [TRS(-30), RP(-20), DIS(1)], 6), opt('Pagar en silencio', [TRS(-15), PR(-5)], 4)] }),
  P({ id: 'm14p_disinfo', mtthMonths: 300, image: 'revolt', title: 'Campaña de desinformación', condition: [{ type: 'minYear', value: 2016 }],
    text: 'Redes de cuentas falsas amplifican bulos sobre vacunas, inmigración y fraude electoral. Los verificadores no dan abasto.',
    options: [opt('Exigir transparencia a las plataformas', [DIS(-2), PR(5)], 6), opt('Ignorarlo', [DIS(4)], 4)] }),
  P({ id: 'm14p_energy', mtthMonths: 320, image: 'disaster', title: 'Crisis energética', condition: [maxX('stock_energy', 2000)],
    text: 'Los precios del gas y la electricidad se disparan. Industrias intensivas detienen la producción y las facturas de los hogares se duplican.',
    options: [opt('Topes de precio y ayudas', [TRS(-40), DIS(-3), NRG(400)], 6), opt('Dejar que el mercado se ajuste', [DIS(6), NRG(200)], 4)] }),
  P({ id: 'm14p_ai_lab', mtthMonths: 280, image: 'prosperity', title: 'Avance en un laboratorio de IA', condition: [year(2023), minX('ic', 10)],
    text: 'Investigadores nacionales publican un modelo que supera las pruebas de referencia en matemáticas y programación.',
    options: [opt('Clasificarlo para uso militar', [TECH('ai', 1), PR(-5)], 5), opt('Publicarlo en abierto', [RP(60), PR(10), ALL(2)], 5)] }),
  P({ id: 'm14p_sanctions', mtthMonths: 360, image: 'court', title: 'Sanciones secundarias', condition: [year(2014), { type: 'minX', key: 'dissent', value: 10 }],
    text: 'Bancos y navieras propios aparecen en una lista de sancionados por comerciar con un país bajo embargo.',
    options: [opt('Cumplir y cortar los negocios', [TRS(-30)], 6), opt('Buscar vías alternativas de pago', [TRS(10), PR(-5), DIS(2)], 4)] }),
  P({ id: 'm14p_protests', mtthMonths: 220, image: 'revolt', title: 'Protestas masivas', condition: [minX('dissent', 25)],
    text: 'Decenas de miles de personas toman las calles por el coste de la vida y la corrupción.',
    options: [opt('Escuchar y negociar', [DIS(-6), TRS(-30)], 6), opt('Despliegue policial', [DIS(3), ST(-1)], 4)] }),
  P({ id: 'm14p_drone_strike_depot', mtthMonths: 120, image: 'war', title: 'Ataque con drones a un depósito', condition: [{ type: 'atWar', value: true }, year(2015)],
    text: 'Drones de largo alcance enemigos alcanzan un depósito de munición en la retaguardia. Las defensas antiaéreas no bastan.',
    options: [opt('Dispersar los depósitos', [X('stock_supplies', -300), DIS(1)], 6), opt('Más defensa antiaérea', [TRS(-30), X('fighters', 1)], 4)] }),
  P({ id: 'm14p_heat', mtthMonths: 300, image: 'disaster', title: 'Ola de calor extrema', condition: [year(2018)],
    text: 'Semanas por encima de 45 grados colapsan hospitales y la red eléctrica; las cosechas se pierden.',
    options: [opt('Plan de adaptación climática', [TRS(-40), DIS(-1)], 6), opt('Medidas de emergencia', [DIS(3), MP(-3000)], 4)] }),
  P({ id: 'm14p_floods', mtthMonths: 340, image: 'disaster', title: 'Inundaciones catastróficas', condition: [year(2014)],
    text: 'Lluvias torrenciales arrasan pueblos e infraestructuras. Miles de personas pierden su casa.',
    options: [opt('Reconstrucción pública inmediata', [TRS(-50), DIS(-2)], 6), opt('Ayudas limitadas', [DIS(4)], 4)] }),
  P({ id: 'm14p_chips', mtthMonths: 300, image: 'disaster', title: 'Escasez de chips', condition: [year(2020), minX('ic', 8)],
    text: 'Las fábricas de coches y de material militar se paran por falta de semiconductores.',
    options: [opt('Subvencionar una fábrica nacional', [TRS(-60), RP(20)], 5), opt('Pagar sobreprecios a Asia', [TRS(-25)], 5)] }),
  P({ id: 'm14p_refugees', mtthMonths: 320, image: 'disaster', title: 'Llegada de refugiados', condition: [year(2014)],
    text: 'Miles de personas que huyen de una guerra cercana llegan a la frontera.',
    options: [opt('Acogerlas con un plan de integración', [MP(20_000), TRS(-30), PR(5), DIS(2)], 6), opt('Cerrar la frontera', [PR(-10), DIS(-1)], 4)] }),
  P({ id: 'm14p_polarization', mtthMonths: 300, image: 'court', title: 'Polarización política', condition: [year(2015), minX('dissent', 10)],
    text: 'El Parlamento queda bloqueado: no hay presupuestos y se repiten las elecciones.',
    options: [opt('Gran coalición', [DIS(-4), ST(-1)], 5), opt('Gobernar por decreto', [DIS(4)], 5)] }),
  P({ id: 'm14p_deepfake', mtthMonths: 300, image: 'revolt', title: 'Un vídeo falso', condition: [year(2024)],
    text: 'Un vídeo generado por IA muestra a un ministro anunciando una movilización. Se comparte millones de veces antes de ser desmentido.',
    options: [opt('Ley de marcado de contenidos sintéticos', [DIS(-2), RP(-10)], 6), opt('Desmentido y nada más', [DIS(3)], 4)] }),
  P({ id: 'm14p_datacenter', mtthMonths: 300, image: 'prosperity', title: 'Un gran centro de datos', condition: [year(2024), minX('ic', 6)],
    text: 'Una gran tecnológica quiere construir un centro de datos para IA que consumirá tanta electricidad como una ciudad.',
    options: [opt('Aceptar con energía renovable propia', [RP(40), NRG(-300), TRS(20)], 6), opt('Rechazarlo por el agua y la red', [DIS(-1)], 4)] }),
  P({ id: 'm14p_cable', mtthMonths: 360, image: 'disaster', title: 'Cable submarino cortado', condition: [year(2022)],
    text: 'Un cable de datos y un gasoducto submarinos aparecen dañados. Un mercante arrastró el ancla durante cientos de kilómetros.',
    options: [opt('Patrullas navales permanentes', [X('navy', 1), TRS(-30)], 5), opt('Reparar y protestar', [TRS(-10)], 5)] }),
  P({ id: 'm14p_corruption', mtthMonths: 360, image: 'court', title: 'Escándalo de corrupción', condition: [year(2014)],
    text: 'Una investigación periodística revela comisiones millonarias en contratos de defensa.',
    options: [opt('Fiscalía independiente', [DIS(-2), ST(-1), PR(5)], 6), opt('Cerrar filas', [DIS(5)], 4)] }),
  P({ id: 'm14p_satellites', mtthMonths: 360, image: 'explore', title: 'Constelación de satélites', condition: [year(2020), minX('ic', 15)],
    text: 'La guerra de Ucrania ha mostrado el valor de las comunicaciones por satélite. ¿Constelación propia o dependencia de empresas extranjeras?',
    options: [opt('Constelación soberana', [TRS(-60), RP(30)], 5), opt('Contratar a un proveedor privado', [TRS(-15)], 5)] }),
  P({ id: 'm14p_pandemic_alert', mtthMonths: 600, image: 'disaster', title: 'Alerta sanitaria', condition: [year(2022)],
    text: 'Un nuevo patógeno respiratorio se extiende en varios países. La OMS pide preparación.',
    options: [opt('Reservas estratégicas y vigilancia', [TRS(-30)], 6), opt('Esperar', [MP(-5000), DIS(2)], 4)] }),
];

// ------------------------------------------------------------------ missions
const M = (id: string, tag: string, col: number, icon: string, title: string, text: string, conditions: Condition[], rewards: Effect[], requires?: string[]): Mission =>
  ({ id, tag, col, icon, title, text, conditions, rewards, ...(requires ? { requires } : {}) });

const MISSIONS: Mission[] = [
  // Estados Unidos
  M('m14_usa_arsenal', 'USA', 0, 'prosperity', 'Arsenal de las democracias', 'Recuperar la capacidad de producir munición, misiles y drones al ritmo que exige una guerra larga.', [minX('ic', 120)], [IC(2), DIS(-2)]),
  M('m14_usa_navy', 'USA', 0, 'war', 'Dominio del Pacífico', 'Una flota capaz de mantener abiertas las rutas del Indo-Pacífico.', [minX('navy', 50)], [TECH('naval', 1), PR(20)], ['m14_usa_arsenal']),
  M('m14_usa_ai', 'USA', 1, 'prosperity', 'Liderazgo en IA', 'Mantener la delantera en modelos, chips y centros de datos.', [flag('usa_ai'), year(2025)], [TECH('ai', 1), RP(80)]),
  M('m14_usa_nato', 'USA', 2, 'court', 'Una OTAN más amplia', 'Finlandia y Suecia dentro de la Alianza.', [{ type: 'allied', other: 'FIN' }, { type: 'allied', other: 'SWE' }], [PR(30), ...RELS(NATO_EU, 10)]),
  M('m14_usa_strait', 'USA', 3, 'peace', 'Paz en el estrecho', 'Llegar a 2035 con Taiwán intacto y sin guerra en el Pacífico.', [year(2035), exists('TAI'), peace], [PR(50), DIS(-5)]),
  // Rusia
  M('m14_rus_crimea', 'RUS', 0, 'war', 'Crimea', 'Asegurar la península y la base de la flota del mar Negro.', [owns('crimea')], [NU(5), PR(20)]),
  M('m14_rus_fortress', 'RUS', 0, 'prosperity', 'Economía fortaleza', 'Resistir las sanciones con producción propia.', [minX('ic', 30), year(2016)], [IC(1), DIS(-3)], ['m14_rus_crimea']),
  M('m14_rus_corridor', 'RUS', 1, 'war', 'El corredor terrestre', 'El objetivo del Kremlin: controlar el Donbás y el sur hasta Crimea.', [{ type: 'ownsAll', provinces: ['donbas', 'zaporozhye'] }], [MP(100_000), PR(30)], ['m14_rus_crimea']),
  M('m14_rus_arctic', 'RUS', 2, 'explore', 'La ruta del Norte', 'Una flota capaz de controlar el Ártico.', [year(2030), minX('navy', 15)], [OIL(2000), PR(15)]),
  M('m14_rus_peace', 'RUS', 3, 'peace', 'Salir de la guerra', 'Un alto el fuego que permita reconstruir la economía.', [year(2025), peace], [DIS(-10), ST(1)]),
  // Ucrania
  M('m14_ukr_kyiv', 'UKR', 0, 'war', 'Kiev resiste', 'Que la capital siga en pie en 2023.', [year(2023), owns('kiev')], [NU(5), CMB(0.05)]),
  M('m14_ukr_drones', 'UKR', 0, 'prosperity', 'Industria de defensa propia', 'Producir en casa drones, munición y misiles.', [minX('factory', 2)], [TECH('air', 1), TECH('ai', 1)], ['m14_ukr_kyiv']),
  M('m14_ukr_donbas', 'UKR', 1, 'war', 'El Donbás', 'Mantener o recuperar el control del Donbás.', [owns('donbas'), year(2016)], [PR(30), NU(3)]),
  M('m14_ukr_rebuild', 'UKR', 2, 'prosperity', 'Reconstrucción', 'Reconstruir el país cuando callen las armas.', [flag('ukr_rebuild'), peace], [IC(2), DIS(-5)]),
  M('m14_ukr_europe', 'UKR', 3, 'peace', 'Camino a Europa', 'Ingresar en la Unión Europea.', [flag('eu_member')], [ST(1), PR(40)], ['m14_ukr_rebuild']),
  // China
  M('m14_chn_mic', 'CHN', 0, 'prosperity', 'Hecho en China', 'La mayor potencia industrial del planeta.', [minX('ic', 90)], [IC(2), TECH('industry', 1)]),
  M('m14_chn_navy', 'CHN', 1, 'war', 'Marina de aguas azules', 'La mayor flota del mundo por número de buques.', [minX('navy', 40)], [TECH('naval', 1), PR(20)]),
  M('m14_chn_chips', 'CHN', 0, 'prosperity', 'Autosuficiencia en chips', 'Sustituir la tecnología extranjera bajo control de exportación.', [minX('factory', 4), year(2027)], [TECH('ai', 1), RP(100)], ['m14_chn_mic']),
  M('m14_chn_status', 'CHN', 2, 'peace', 'Estabilidad en el estrecho', 'Un acuerdo con Taipéi que aleje la guerra.', [flag('tw_status_quo')], [PR(30), ALL(5)]),
  M('m14_chn_taiwan', 'CHN', 3, 'war', 'Reunificación', 'La meta declarada de Pekín: controlar Taiwán.', [owns('taiwan')], [PR(60), NU(10)]),
  // Taiwán
  M('m14_tai_silicon', 'TAI', 0, 'prosperity', 'Escudo de silicio', 'Seguir siendo imprescindible para la economía mundial.', [flag('silicon_shield'), minX('ic', 14)], [REL('USA', 20), PR(15)]),
  M('m14_tai_porcupine', 'TAI', 1, 'war', 'Puercoespín', 'Una defensa asimétrica que haga inviable una invasión.', [minX('factory', 2)], [TECH('ai', 1), NU(3)]),
  M('m14_tai_energy', 'TAI', 2, 'disaster', 'Reserva energética', 'Resistir semanas de bloqueo.', [minX('stock_energy', 3000), year(2025)], [DIS(-3), NU(2)]),
  M('m14_tai_survive', 'TAI', 3, 'peace', 'Sin guerra en 2036', 'Superar la década de máximo peligro sin guerra ni rendición.', [year(2036), owns('taiwan'), peace], [PR(50), NU(5)], ['m14_tai_porcupine']),
  // Israel
  M('m14_isr_dome', 'ISR', 0, 'war', 'Cúpula de Hierro', 'Defensa aérea en capas frente a cohetes, drones y misiles.', [minX('fighters', 15)], [TECH('air', 1), NU(2)]),
  M('m14_isr_abraham', 'ISR', 1, 'court', 'Normalización regional', 'Relaciones con los países del Golfo.', [flag('abraham')], [REL('SAU', 20), PR(15)]),
  M('m14_isr_hostages', 'ISR', 2, 'peace', 'Que vuelvan los rehenes', 'Un alto el fuego que traiga a casa a los rehenes.', [flag('gaza_ceasefire')], [DIS(-8), NU(3)]),
  M('m14_isr_peace', 'ISR', 3, 'peace', 'Paz con seguridad', 'Un acuerdo regional duradero.', [flag('peace_track')], [PR(50), ST(1)], ['m14_isr_hostages']),
  // Irán
  M('m14_irn_deal', 'IRN', 0, 'court', 'Romper el aislamiento', 'Un acuerdo que levante las sanciones.', [flag('jcpoa')], [TRS(100), DIS(-3)]),
  M('m14_irn_missiles', 'IRN', 1, 'war', 'Misiles y drones', 'Una capacidad de disuasión convencional propia.', [minX('factory', 2)], [TECH('air', 1)]),
  M('m14_irn_hormuz', 'IRN', 2, 'war', 'Vigilar Ormuz', 'Una armada capaz de controlar el estrecho.', [owns('hormozgan'), minX('navy', 6)], [X('navy', 2), PR(10)]),
  M('m14_irn_rebuild', 'IRN', 3, 'prosperity', 'Reconstrucción nacional', 'Recuperar la economía tras las guerras.', [flag('iran_rebuild')], [IC(2), DIS(-8)]),
  // Alemania y la UE
  M('m14_ger_zeitenwende', 'GER', 0, 'war', 'Zeitenwende', 'Un ejército preparado para defender Europa.', [flag('zeitenwende')], [IC(1), NU(3)]),
  M('m14_ger_energy', 'GER', 1, 'prosperity', 'Independencia energética', 'Sin depender del gas ruso.', [minX('stock_energy', 4000), year(2024)], [DIS(-3), PR(10)]),
  M('m14_ger_air', 'GER', 0, 'war', 'Escudo aéreo europeo', 'Defensa antiaérea y aviación de combate suficientes.', [minX('fighters', 15)], [TECH('air', 1)], ['m14_ger_zeitenwende']),
  M('m14_ger_tech', 'GER', 2, 'prosperity', 'Soberanía tecnológica europea', 'Chips, nube e IA propios.', [minX('factory', 3), year(2030)], [TECH('ai', 1), RP(60)]),
  // India
  M('m14_ind_make', 'IND', 0, 'prosperity', 'Hecho en la India', 'Una base industrial a la altura de su población.', [minX('ic', 25)], [IC(1), TECH('industry', 1)]),
  M('m14_ind_himalaya', 'IND', 1, 'war', 'La frontera del Himalaya', 'Mantener Cachemira y la Línea de Control Real.', [owns('kashmir'), year(2021)], [MP(100_000), NU(3)]),
  M('m14_ind_navy', 'IND', 2, 'war', 'Potencia del Índico', 'Una flota que proteja las rutas del océano Índico.', [minX('navy', 15)], [TECH('naval', 1)]),
  M('m14_ind_bridge', 'IND', 3, 'peace', 'Puente entre bloques', 'Llegar a 2035 en paz y con buenas relaciones con todos.', [year(2035), peace], [PR(40), ALL(5)], ['m14_ind_make']),
  // Turquía
  M('m14_tur_grain', 'TUR', 0, 'peace', 'Puente del mar Negro', 'Mediar entre Kiev y Moscú.', [flag('grain_deal')], [PR(20), REL('UKR', 10)]),
  M('m14_tur_drones', 'TUR', 1, 'war', 'Industria de drones', 'Exportar drones a medio mundo.', [minX('factory', 1), year(2019)], [TECH('air', 1), TRS(50)]),
  M('m14_tur_syria', 'TUR', 2, 'court', 'Una frontera sur estable', 'Una Siria posterior a la guerra con la que convivir.', [flag('assad_fall', 'SYR')], [REL('SYR', 30), PR(15)]),
  M('m14_tur_power', 'TUR', 3, 'prosperity', 'Potencia regional', 'Una economía y un ejército de primer orden.', [minX('ic', 18), year(2030)], [IC(1), PR(20)], ['m14_tur_drones']),
];

// ------------------------------------------------------------------ scenario
export const mod2014: Scenario = {
  id: 'mod2014', era: 'ww2', menu: 'modern', map: 'world', name: '2014 — El mundo en tensión',
  description: 'Febrero de 2014: el Maidán ha derribado al Gobierno de Kiev y Moscú mira a Crimea. Por delante, la guerra en Ucrania, Siria y Yemen, el 7 de octubre y la guerra de Gaza, los choques entre Irán e Israel, la presión sobre Taiwán y la carrera por la inteligencia artificial militar. Hasta noviembre de 2026 la historia sigue los hechos documentados; después, el futuro hasta 2050 es hipotético y lo escriben tus decisiones: cooperación o bloque contra bloque.',
  start: '2014-02-20', end: '2051-01-01',
  options: { allowedUnits: ['infantry', 'motorized', 'armor', 'marines', 'artillery', 'drones', 'ai_swarm', 'mountain'], aiRace: true, artEra: 'modern', fullWorld: true },
  recommended: ['UKR', 'RUS', 'USA', 'CHN', 'TAI', 'ISR', 'IRN', 'GER', 'IND', 'TUR'],
  nations: NATIONS, factions: FACTIONS, provinceOverrides: econ(),
  events: [...Y2014, ...Y2017, ...UKRWAR, ...MIDEAST, ...ASIA, ...FUTURE, ...POOL],
  missions: MISSIONS,
  relations: [
    ['USA', 'RUS', -40], ['RUS', 'UKR', -20], ['USA', 'GBR', 150], ['USA', 'ISR', 120], ['USA', 'TAI', 60], ['USA', 'JAP', 120], ['USA', 'KOR', 120], ['USA', 'IRN', -150],
    ['ISR', 'IRN', -150], ['SAU', 'IRN', -100], ['CHN', 'TAI', -60], ['CHN', 'JAP', -40], ['IND', 'PAK', -100], ['IND', 'CHN', -20], ['ARM', 'AZE', -150], ['KOR', 'PRK', -150],
    ['RUS', 'BLR', 50], ['RUS', 'SYR', 80], ['IRN', 'SYR', 100], ['TUR', 'SYR', -80], ['RUS', 'CHN', 60], ['CHN', 'PRK', 60], ['SAU', 'HOU', -100], ['YEM', 'HOU', -100],
    ['ISR', 'PAL', -60], ['USA', 'CUB', -60], ['USA', 'VEN', -50], ['GER', 'FRA', 150], ['TUR', 'AZE', 120], ['TUR', 'GRE', -30], ['RUS', 'GEO', -80], ['CHN', 'PAK', 80], ['USA', 'IND', 40],
    ['EGY', 'ISR', 20], ['JOR', 'ISR', 20], ['SAU', 'UAE', 100], ['IRN', 'HOU', 80], ['RUS', 'IRN', 40], ['RUS', 'ARM', 60], ['CHN', 'VIE', -20], ['CHN', 'PHI', -30],
  ],
};
