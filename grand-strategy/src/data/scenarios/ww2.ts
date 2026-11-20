import type { NationDef, Scenario } from '@/engine/core';
import type { GameEvent } from '@/engine/types';
import { ev, N } from './helpers';

const R = 'secular';
type Ex = Parameters<typeof N>[7];
const W = (tag: string, name: string, color: string, provs: string[], culture: string, gov: string, extra: Ex = {}) => N(tag, name, color, provs, R, culture, gov, extra);

/*
 * 1936 y 1939 sobre el mapa mundial completo: cada provincia tiene el dueño que tenía en la fecha de inicio.
 * - Imperios coloniales: las colonias, protectorados y mandatos son provincias de la metrópoli (Reino Unido, Francia,
 *   Bélgica, Países Bajos, Portugal, España, Italia, Japón, Estados Unidos).
 * - Dominios (Canadá, Australia, Nueva Zelanda, Sudáfrica), la India británica, Egipto, Irak y Omán son naciones con
 *   `liege: 'ENG'`: no declaran guerras por su cuenta y entran automáticamente en las del Reino Unido. Los dominios
 *   y la India, además, pertenecen al bloque aliado.
 * - Manchukuo (y, en 1939, el Mengjiang) son estados títere de Japón; Mongolia, satélite soviético; Filipinas,
 *   mancomunidad bajo soberanía estadounidense.
 * - Las naciones menores lejanas tienen aggression 0: solo combaten por eventos o si alguien las ataca.
 */

// industry (ic) and daily resources per province
const ECON: Record<string, Partial<Record<'ic' | 'energy' | 'metal' | 'rare' | 'oil' | 'vp', number>>> = {
  westfalen: { ic: 14, energy: 30, vp: 5 }, rhineland: { ic: 12, energy: 10, vp: 5 }, saxony: { ic: 8, energy: 8 }, brandenburg: { ic: 9, vp: 20 }, silesia: { ic: 5, energy: 15 },
  bavaria: { ic: 5, vp: 5 }, swabia: { ic: 5 }, hannover: { ic: 4, oil: 1 }, franconia: { ic: 3 }, hesse: { ic: 3 }, holstein: { ic: 3 }, prussia: { ic: 2 }, pomerania: { ic: 1 }, mecklenburg: { ic: 1 }, frisia: { ic: 1 },
  london: { ic: 14, vp: 25 }, midlands: { ic: 12, energy: 25, metal: 5 }, york: { ic: 8, energy: 20 }, northumbria: { ic: 5, energy: 8 }, lowlands: { ic: 6, energy: 6 }, wessex: { ic: 4 }, east_anglia: { ic: 3 }, wales: { ic: 3, energy: 15 }, ulster: { ic: 2 }, highlands: { ic: 1 }, cornwall: { ic: 1, rare: 1 },
  ile_de_france: { ic: 12, vp: 25 }, picardie: { ic: 5, energy: 10 }, lorraine: { ic: 6, metal: 20, energy: 5 }, lyonnais: { ic: 5 }, provence: { ic: 4 }, normandie: { ic: 3 }, champagne: { ic: 3 }, bourgogne: { ic: 2 }, guyenne: { ic: 2 }, languedoc: { ic: 1, rare: 2 },
  flandre: { ic: 6, energy: 10 }, brabant: { ic: 5, energy: 5 }, holland: { ic: 6 },
  lombardia: { ic: 10 }, piemonte: { ic: 8 }, genova: { ic: 5 }, venezia: { ic: 4 }, toscana: { ic: 3, metal: 3 }, roma: { ic: 3, vp: 15 }, napoli: { ic: 3 }, romagna: { ic: 2 }, sardegna: { metal: 2, energy: 2 }, sicilia: { ic: 1 },
  moscow: { ic: 14, vp: 25 }, ingria: { ic: 10, vp: 10 }, kiev: { ic: 5, vp: 5 }, poltava: { ic: 4 }, don: { ic: 5, energy: 8 }, zaporozhye: { ic: 6, metal: 20, energy: 15 }, ural: { ic: 8, metal: 20, rare: 5, energy: 10 },
  nizhny: { ic: 5 }, tsaritsyn: { ic: 4 }, kazan: { ic: 2 }, samara: { ic: 2, oil: 4 }, kursk: { ic: 2, metal: 5 }, azerbaijan: { oil: 30, ic: 2 }, kuban: { oil: 10, ic: 1 }, georgia: { rare: 2, ic: 1 }, crimea: { ic: 1 },
  new_england: { ic: 25, vp: 15 }, virginia: { ic: 15, energy: 30, metal: 20 }, carolina: { ic: 6, energy: 3 }, florida: { ic: 2 }, new_france: { ic: 6, metal: 10, energy: 5 },
  bohemia: { ic: 6, energy: 8 }, moravia: { ic: 3, energy: 4 }, upper_hungary: { ic: 1 }, austria: { ic: 4, vp: 5 }, styria: { ic: 2, metal: 5 }, hungary: { ic: 3 }, transylvania: { rare: 3 }, wallachia: { oil: 15, ic: 2 },
  malopolska: { ic: 3, energy: 15 }, mazovia: { ic: 3, vp: 10 }, wielkopolska: { ic: 2 }, svealand: { ic: 4, metal: 10 }, norrland: { metal: 25 }, gotaland: { ic: 2 }, oslo: { ic: 2 }, jylland: { ic: 1 }, sjaelland: { ic: 2 },
  castilla_nueva: { ic: 2, vp: 10 }, cataluna: { ic: 3 }, asturias: { ic: 2, metal: 10, energy: 5 }, andalucia: { rare: 5, ic: 1 }, lisboa: { ic: 1 }, basra: { oil: 2 }, mosul: { oil: 12 }, venezuela: { oil: 3 },
  constantinople: { ic: 2 }, cairo: { ic: 1 }, kongo: { rare: 2 }, gold_coast: { rare: 3 }, peru: { rare: 5, metal: 3 }, mexico: { rare: 5, ic: 2 }, new_granada: { rare: 3 }, finland: { ic: 2 }, serbia: { ic: 1, metal: 3 }, bosnia: { metal: 3 },
  // --- el resto del mundo (mapa mundial)
  // Estados Unidos: la primera potencia industrial del planeta (cerca de un tercio de la producción manufacturera mundial)
  new_york: { ic: 28, energy: 25, vp: 15 }, great_lakes: { ic: 30, metal: 25, vp: 5 }, midwest: { ic: 8 }, deep_south: { ic: 3 }, texas: { ic: 5, oil: 30 },
  southern_plains: { ic: 2, oil: 15 }, california: { ic: 10, oil: 12, vp: 5 }, pacific_nw: { ic: 4 }, rockies: { metal: 8, energy: 5 }, montana: { metal: 8 },
  arizona: { metal: 6, rare: 2 }, alaska: { rare: 1 }, hawaii: { vp: 5 },
  // dominios e India
  ontario: { ic: 8, metal: 6, rare: 4 }, maritimes: { ic: 1, energy: 4 }, british_columbia: { ic: 2, metal: 4 }, alberta: { oil: 2 }, manitoba: { ic: 1 }, northern_ontario: { metal: 5, rare: 2 },
  nsw: { ic: 5, energy: 10, metal: 2, vp: 5 }, victoria_au: { ic: 4 }, south_australia: { ic: 1, metal: 3 }, mount_isa: { metal: 4, rare: 2 }, perth: { ic: 1, rare: 3 }, queensland: { ic: 1 }, tasmania: { rare: 1 },
  nz_north: { ic: 1 }, transvaal: { ic: 4, energy: 10, rare: 8, vp: 5 }, cape: { ic: 2 }, natal: { ic: 1, energy: 3 },
  bengal: { ic: 5, vp: 5 }, mumbai: { ic: 5, vp: 3 }, bihar: { ic: 3, metal: 10, energy: 10 }, delhi: { ic: 1, vp: 10 }, uttar_pradesh: { ic: 1 }, tamil_nadu: { ic: 2 }, punjab: { ic: 1 },
  assam: { oil: 1 }, central_india: { metal: 2 }, odisha: { metal: 3 }, myanmar: { oil: 3, rare: 2 }, yangon: { ic: 1 }, tenasserim: { rare: 2 },
  // caucho, estaño y petróleo del Sudeste Asiático; cobre y cobalto africanos
  malaya: { rare: 15 }, singapore: { ic: 1, vp: 10 }, sri_lanka: { rare: 4 }, brunei: { oil: 3 }, sarawak: { oil: 2 },
  sumatra: { oil: 12, rare: 5 }, java: { ic: 2, rare: 3, vp: 5 }, east_kalimantan: { oil: 8 }, kalimantan: { rare: 2 }, sulawesi: { metal: 2 }, suriname: { rare: 4 },
  saigon: { rare: 4 }, vietnam: { ic: 1, energy: 4 }, thai_south: { rare: 2 }, new_caledonia: { metal: 4 },
  katanga: { metal: 15, rare: 6 }, kasai: { rare: 2 }, zambia: { metal: 10 }, zimbabwe: { metal: 2, rare: 2 }, kano: { rare: 2 }, nigeria_delta: { rare: 1 },
  guyana: { rare: 3 }, jamaica: { rare: 1 }, trinidad: { oil: 3 }, bahrain: { oil: 2 }, malta: { vp: 3 }, alexandria: { vp: 3 }, greenland: { rare: 2 },
  // Japón, Corea, Taiwán y Manchuria
  kanto: { ic: 14, vp: 20 }, kansai: { ic: 12, vp: 5 }, kyushu: { ic: 6, energy: 10, metal: 2 }, hokkaido: { ic: 2, energy: 8 }, pyongyang: { ic: 2, energy: 4, metal: 5 }, south_korea: { ic: 1 }, taiwan: { ic: 1, rare: 1 },
  manchuria: { ic: 6, energy: 10, metal: 10, vp: 5 }, heilongjiang: { ic: 1 },
  // China
  shanghai: { ic: 5, vp: 15 }, beijing: { ic: 2, vp: 10 }, wuhan: { ic: 2, metal: 3, vp: 5 }, guangdong: { ic: 2, vp: 3 }, shandong: { ic: 1, energy: 3 }, sichuan: { ic: 1, vp: 3 }, yunnan: { rare: 4 }, hunan: { rare: 3, metal: 2 }, henan: { energy: 2 },
  // Unión Soviética al este del Dniéper y en Asia
  kharkiv: { ic: 6 }, donbas: { ic: 5, energy: 25 }, odesa: { ic: 2 }, kherson: { ic: 1 }, north_caucasus: { oil: 8 }, central_siberia: { ic: 4, energy: 15 }, omsk: { ic: 2 },
  east_siberia: { ic: 1 }, khabarovsk: { ic: 2 }, vladivostok: { ic: 1, vp: 3 }, kazakh_central: { energy: 6, metal: 5 }, kazakh_east: { metal: 4, rare: 2 }, kazakh_west: { oil: 3 },
  magadan: { rare: 3 }, komi: { energy: 3, oil: 1 }, murmansk: { metal: 2, rare: 2 }, uzbekistan: { ic: 1 }, sakhalin: { oil: 2 },
  // Oriente Medio
  khuzestan: { oil: 25 }, tehran: { ic: 1 }, al_hasa: { oil: 2 },
  // América Latina
  buenos_aires: { ic: 5, vp: 5 }, cordoba: { ic: 1 }, patagonia: { oil: 1 }, sao_paulo: { ic: 4, vp: 3 }, rio: { ic: 2, vp: 5 }, minas: { metal: 10, rare: 2 }, amazonas: { rare: 2 },
  atacama: { metal: 10, rare: 5 }, santiago: { ic: 1 }, la_paz: { rare: 8 }, veracruz: { oil: 8 }, chihuahua: { metal: 3 }, caribe_col: { oil: 2 }, zulia: { oil: 25 }, peru_north: { oil: 2 }, ecuador: { oil: 1 },
  // Europa del norte
  lapland: { rare: 3 }, svalbard: { energy: 2 },
};

// el interior de China: montañas y distancias que el ejército japonés nunca llegó a dominar
const FORTS: Record<string, number> = { sichuan: 4, yunnan: 2, guangxi: 2, hunan: 2, shaanxi: 2 };

function econ(): Scenario['provinceOverrides'] {
  const o: NonNullable<Scenario['provinceOverrides']> = {};
  for (const [pid, e] of Object.entries(ECON)) o[pid] = { x: { ...e } };
  for (const [pid, f] of Object.entries(FORTS)) o[pid] = { ...o[pid], fort: f };
  return o;
}

const FACTIONS = {
  allies: { name: 'Aliados', leader: 'ENG', color: '#3b6fb6' },
  axis: { name: 'Eje', leader: 'GER', color: '#4a4a4a' },
  comintern: { name: 'Komintern', leader: 'SOV', color: '#b03a2e' },
};

/** relaciones fuera de Europa compartidas por 1936 y 1939 */
const WORLD_RELATIONS: [string, string, number][] = [
  ['ENG', 'CAN', 150], ['ENG', 'AST', 150], ['ENG', 'NZL', 150], ['ENG', 'SAF', 120], ['ENG', 'RAJ', 100], ['ENG', 'EGY', 60], ['ENG', 'IRQ', 60], ['ENG', 'OMA', 100],
  ['USA', 'PHI', 150], ['SOV', 'MON', 150], ['SOV', 'SIK', 50], ['JAP', 'MAN', 150], ['JAP', 'CHI', -120], ['SOV', 'JAP', -80], ['USA', 'JAP', -30], ['MON', 'JAP', -60],
  ['SIA', 'FRA', -20], ['SAU', 'YEM', -20], ['USA', 'MEX', 30],
];

function nations1936(): NationDef[] {
  return [
    W('GER', 'Alemania', '#5d6d7e', ['brandenburg', 'rhineland', 'westfalen', 'hannover', 'hesse', 'saxony', 'mecklenburg', 'pomerania', 'holstein', 'franconia', 'swabia', 'bavaria', 'silesia', 'prussia'], 'germanic', 'fascist', {
      faction: 'axis', manpower: 1_800_000, tech: { infantry: 1, armor: 1, air: 1, doctrine: 2, industry: 1 }, x: { nu: 80, fighters: 4, bombers: 3, navy: 3, subs: 4, aggression: 0.5, combat: 1.15 },
      claims: ['austria', 'bohemia', 'danzig', 'lorraine'],
      armies: [{ province: 'brandenburg', units: { infantry: 10, motorized: 2, armor: 2 }, name: 'Grupo de Ejércitos Norte' }, { province: 'bavaria', units: { infantry: 8, mountain: 2 }, name: 'Grupo de Ejércitos Sur' }, { province: 'rhineland', units: { infantry: 6 }, name: 'Grupo de Ejércitos Oeste' }],
    }),
    W('ENG', 'Reino Unido', '#c0392b', ['london', 'wessex', 'cornwall', 'midlands', 'east_anglia', 'york', 'northumbria', 'wales', 'lowlands', 'highlands', 'ulster', 'cyprus', 'jerusalem', 'acre', 'gold_coast', 'newfoundland',
      // Mediterráneo y Oriente Medio: Malta, mandatos de Palestina y Transjordania, Adén y los protectorados del Golfo
      'malta', 'tel_aviv', 'gaza', 'west_bank', 'jordan', 'aden', 'hadramaut', 'kuwait', 'bahrain', 'qatar', 'emirates',
      // África: el condominio anglo-egipcio del Sudán, África oriental, central, austral y occidental
      'khartoum', 'nubia', 'darfur', 'south_sudan', 'somaliland', 'kenya', 'kenya_north', 'uganda', 'tanzania', 'dar_es_salaam', 'zambia', 'malawi', 'zimbabwe',
      'botswana', 'lesotho', 'eswatini', 'sierra_leone', 'gambia', 'lagos', 'nigeria_delta', 'abuja', 'kano', 'mauritius', 'seychelles',
      // Asia y el Pacífico
      'sri_lanka', 'maldives', 'malaya', 'singapore', 'sarawak', 'sabah', 'brunei', 'fiji', 'solomon',
      // América: Labrador (de Terranova), las Antillas británicas, Honduras Británica y Guayana
      'labrador', 'jamaica', 'bahamas', 'barbados', 'trinidad', 'belize', 'guyana'], 'english', 'democracy', {
      faction: 'allies', manpower: 1_200_000, tech: { naval: 3, air: 1, industry: 1, infantry: 1 }, x: { nu: 85, fighters: 4, bombers: 2, navy: 15, subs: 3 },
      armies: [{ province: 'london', units: { infantry: 8, armor: 1 }, name: 'Fuerza Expedicionaria' }, { province: 'jerusalem', units: { infantry: 3, motorized: 1 }, name: 'Ejército de Oriente Medio' }, { province: 'singapore', units: { infantry: 2 }, name: 'Mando de Malaya' }, { province: 'kenya', units: { infantry: 1 }, name: 'Fusileros Africanos del Rey' }],
    }),
    W('FRA', 'Francia', '#2e86c1', ['ile_de_france', 'picardie', 'normandie', 'bretagne', 'champagne', 'lorraine', 'bourgogne', 'anjou', 'poitou', 'guyenne', 'gascogne', 'toulouse', 'languedoc', 'provence', 'lyonnais', 'auvergne', 'berry', 'dauphine', 'corsica', 'algiers', 'oran', 'tunis', 'fez', 'marrakesh', 'damascus', 'aleppo', 'antioch', 'senegal', 'guinea',
      // Argelia sahariana, África Occidental y Ecuatorial francesas, mandatos del Togo y el Camerún, Yibuti y Madagascar
      'ouargla', 'adrar', 'tamanrasset', 'mauritania', 'mali', 'timbuktu', 'niger', 'agadez', 'burkina', 'ivory_coast', 'benin', 'togo', 'cameroon',
      'chad', 'tibesti', 'car', 'gabon', 'congo_brazzaville', 'djibouti', 'antananarivo', 'toliara', 'comoros',
      // mandatos de Siria y del Líbano, Indochina, Guayana y el Pacífico (las Nuevas Hébridas eran un condominio franco-británico)
      'latakia', 'deir_ez_zor', 'beirut', 'vietnam', 'annam', 'saigon', 'laos', 'cambodia', 'french_guiana', 'new_caledonia', 'vanuatu'], 'frankish', 'democracy', {
      faction: 'allies', manpower: 1_500_000, tech: { infantry: 2, armor: 1, industry: 1 }, x: { nu: 70, fighters: 4, bombers: 2, navy: 8, subs: 3 },
      armies: [{ province: 'lorraine', units: { infantry: 14, armor: 1 }, name: 'Línea Maginot' }, { province: 'champagne', units: { infantry: 8 }, name: '1.er Grupo de Ejércitos' }, { province: 'algiers', units: { infantry: 4 }, name: 'Armée d\'Afrique' }, { province: 'damascus', units: { infantry: 2 }, name: 'Armée du Levant' }, { province: 'vietnam', units: { infantry: 2 }, name: 'Tropas de Indochina' }],
    }),
    W('ITA', 'Italia', '#27ae60', ['roma', 'piemonte', 'lombardia', 'venezia', 'genova', 'toscana', 'romagna', 'abruzzo', 'napoli', 'puglia', 'calabria', 'sicilia', 'sardegna', 'tripoli', 'cyrenaica', 'fezzan', 'kufra', 'eritrea', 'somalia', 'puntland'], 'latin', 'fascist', {
      manpower: 1_100_000, tech: { infantry: 1, air: 1, naval: 2 }, x: { nu: 60, fighters: 3, bombers: 3, navy: 8, subs: 4, aggression: 0.5 }, claims: ['albania', 'dalmatia', 'corsica', 'tunis', 'ethiopia', 'ogaden'],
      armies: [{ province: 'piemonte', units: { infantry: 8, mountain: 2 } }, { province: 'cyrenaica', units: { infantry: 6 }, name: 'Ejército de Libia' }, { province: 'eritrea', units: { infantry: 8, motorized: 1 }, name: 'Frente Norte (Badoglio)' }, { province: 'somalia', units: { infantry: 3 }, name: 'Frente Sur (Graziani)' }],
    }),
    W('SOV', 'Unión Soviética', '#a93226', ['moscow', 'ingria', 'novgorod', 'pskov', 'tver', 'smolensk', 'ryazan', 'vladimir', 'yaroslavl', 'vologda', 'archangelsk', 'nizhny', 'kazan', 'samara', 'ural', 'kiev', 'chernigov', 'kursk', 'voronezh', 'poltava', 'podolia', 'zaporozhye', 'crimea', 'don', 'kuban', 'tsaritsyn', 'astrakhan', 'belarus', 'karelia', 'georgia', 'azerbaijan',
      'kharkiv', 'donbas', 'kherson', 'odesa', 'stavropol', 'north_caucasus', 'yerevan', 'karabakh', 'murmansk', 'komi', 'novaya_zemlya',
      // Siberia y el Lejano Oriente (el norte de Sajalín es soviético; el sur, Karafuto, japonés)
      'tyumen', 'yamal', 'omsk', 'tomsk', 'central_siberia', 'turukhansk', 'taimyr', 'evenkia', 'angara', 'east_siberia', 'chita', 'mirny', 'yakutsk', 'olenek', 'verkhoyansk',
      'blagoveshchensk', 'khabarovsk', 'vladivostok', 'okhotsk', 'kolyma', 'magadan', 'koryakia', 'chukotka', 'chukotka_east', 'kamchatka', 'sakhalin',
      // repúblicas soviéticas de Asia Central
      'kazakh_west', 'kazakh_central', 'mangystau', 'kyzylorda', 'almaty', 'kazakh_east', 'uzbekistan', 'karakalpakstan', 'turkmenistan', 'tajikistan', 'kyrgyzstan'], 'slavic', 'communist', {
      faction: 'comintern', manpower: 4_000_000, tech: { infantry: 1, armor: 1, industry: 1 }, x: { nu: 90, fighters: 5, bombers: 3, navy: 4, subs: 5, combat: 0.65, aggression: 0.1 },
      claims: ['estonia', 'livonia', 'courland', 'volhynia', 'red_ruthenia', 'moldavia', 'finland'],
      armies: [{ province: 'belarus', units: { infantry: 14, armor: 2 }, name: 'Frente Occidental' }, { province: 'kiev', units: { infantry: 12, cavalry: 2 }, name: 'Frente de Kiev' }, { province: 'ingria', units: { infantry: 8 }, name: 'Frente de Leningrado' }, { province: 'vladivostok', units: { infantry: 8, armor: 1 }, name: 'Ejército Especial del Lejano Oriente' }],
    }),
    W('USA', 'Estados Unidos', '#1f618d', ['virginia', 'new_england', 'carolina', 'florida', 'new_york', 'great_lakes', 'deep_south', 'midwest', 'southern_plains', 'texas', 'great_plains', 'rockies', 'montana', 'arizona', 'california', 'pacific_nw',
      'alaska', 'alaska_west', 'north_slope', 'puerto_rico', 'hawaii', 'guam'], 'english', 'democracy', {
      manpower: 2_500_000, tech: { industry: 2, naval: 2, air: 1 }, x: { nu: 90, navy: 12, fighters: 2, neutral: 1, aggression: 0 },
      armies: [{ province: 'new_england', units: { infantry: 4 } }, { province: 'california', units: { infantry: 2 } }, { province: 'hawaii', units: { infantry: 1 }, name: 'Departamento de Hawái' }],
    }),
    W('PHI', 'Filipinas', '#5499c7', ['luzon', 'visayas', 'mindanao'], 'filipino', 'democracy', { liege: 'USA', x: { aggression: 0, nu: 100 }, armies: [{ province: 'luzon', units: { infantry: 2 }, name: 'Ejército Filipino' }],
      description: 'Mancomunidad bajo soberanía estadounidense desde noviembre de 1935, con la independencia prometida para 1946.' }),
    W('CAN', 'Canadá', '#cd6155', ['ontario', 'new_france', 'maritimes', 'northern_ontario', 'quebec_north', 'manitoba', 'saskatchewan', 'alberta', 'british_columbia', 'yukon', 'northwest_territories',
      'nunavut', 'kitikmeot', 'athabasca', 'nunavik', 'boothia', 'ellesmere', 'parry', 'baffin', 'arctic_islands'], 'english', 'democracy', {
      faction: 'allies', liege: 'ENG', manpower: 400_000, x: { nu: 100, navy: 2, aggression: 0 }, armies: [{ province: 'ontario', units: { infantry: 2 }, name: 'Milicia Permanente' }] }),
    W('AST', 'Australia', '#d98880', ['nsw', 'victoria_au', 'queensland', 'brisbane', 'south_australia', 'perth', 'tasmania', 'australia', 'mount_isa', 'darling', 'nullarbor', 'cape_york', 'red_centre', 'pilbara', 'kimberley',
      'png', 'port_moresby'], 'english', 'democracy', { faction: 'allies', liege: 'ENG', manpower: 300_000, x: { nu: 100, navy: 2, aggression: 0 }, armies: [{ province: 'nsw', units: { infantry: 2 } }],
      description: 'Dominio británico; administra el Territorio de Papúa y el mandato de Nueva Guinea.' }),
    W('NZL', 'Nueva Zelanda', '#f1948a', ['nz_north', 'nz_south'], 'english', 'democracy', { faction: 'allies', liege: 'ENG', x: { nu: 100, aggression: 0 } }),
    W('SAF', 'Unión Sudafricana', '#b9770e', ['transvaal', 'cape', 'natal', 'eastern_cape', 'northern_cape', 'namibia', 'karas'], 'english', 'democracy', {
      faction: 'allies', liege: 'ENG', manpower: 200_000, x: { nu: 100, aggression: 0 }, armies: [{ province: 'transvaal', units: { infantry: 2 } }],
      description: 'Dominio británico; administra como mandato el antiguo África del Sudoeste alemán.' }),
    W('RAJ', 'India británica', '#e59866', ['delhi', 'punjab', 'sindh', 'balochistan', 'kashmir', 'rajasthan', 'gujarat', 'mumbai', 'central_india', 'uttar_pradesh', 'bihar', 'bengal', 'bangladesh',
      'odisha', 'deccan', 'karnataka', 'tamil_nadu', 'assam', 'bhutan', 'myanmar', 'kachin', 'yangon', 'tenasserim'], 'indian', 'authoritarian', {
      faction: 'allies', liege: 'ENG', manpower: 800_000, x: { aggression: 0, combat: 0.85, nu: 100 },
      armies: [{ province: 'delhi', units: { infantry: 6 }, name: 'Ejército de la India' }, { province: 'punjab', units: { infantry: 4 }, name: 'Frontera del Noroeste' }],
      description: 'El virreinato incluye los estados principescos y, hasta abril de 1937, Birmania. Bután, aunque no era parte de la India, tenía su política exterior en manos británicas.' }),
    W('SPR', 'España', '#e67e22', ['castilla_nueva', 'castilla_vieja', 'galicia', 'asturias', 'leon', 'navarra', 'aragon', 'cataluna', 'valencia', 'murcia', 'andalucia', 'granada', 'extremadura', 'baleares', 'canarias', 'tangier', 'western_sahara', 'equatorial_guinea'], 'latin', 'democracy', { manpower: 500_000, x: { nu: 40, aggression: 0.2 }, armies: [{ province: 'castilla_nueva', units: { infantry: 6 } }] }),
    W('POR', 'Portugal', '#16a085', ['lisboa', 'porto', 'algarve', 'azores', 'cape_verde', 'guinea_bissau', 'sao_tome', 'luanda', 'huambo', 'moxico', 'nampula', 'maputo', 'east_timor'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('IRL', 'Irlanda', '#58d68d', ['leinster', 'munster', 'connacht'], 'english', 'democracy'),
    W('BEL', 'Bélgica', '#f4d03f', ['brabant', 'flandre', 'kongo', 'kinshasa', 'equateur', 'kisangani', 'kivu', 'kasai', 'katanga', 'rwanda', 'burundi'], 'frankish', 'democracy', { armies: [{ province: 'brabant', units: { infantry: 6 } }] }),
    W('HOL', 'Países Bajos', '#e59866', ['holland', 'frisia', 'java', 'sumatra', 'kalimantan', 'east_kalimantan', 'sulawesi', 'nusa_tenggara', 'west_papua', 'suriname'], 'germanic', 'democracy', { x: { navy: 3 }, armies: [{ province: 'java', units: { infantry: 3 }, name: 'KNIL' }] }),
    W('LUX', 'Luxemburgo', '#76d7c4', ['luxembourg'], 'germanic', 'democracy', { x: { aggression: 0 } }),
    W('SWI', 'Suiza', '#e74c3c', ['switzerland'], 'germanic', 'democracy', { x: { nu: 100 }, armies: [{ province: 'switzerland', units: { mountain: 4 } }] }),
    W('AUS', 'Austria', '#ecf0f1', ['austria', 'styria', 'tyrol'], 'germanic', 'authoritarian', { armies: [{ province: 'austria', units: { infantry: 3 } }] }),
    W('CZE', 'Checoslovaquia', '#5dade2', ['bohemia', 'moravia', 'upper_hungary'], 'slavic', 'democracy', { tech: { armor: 1 }, armies: [{ province: 'bohemia', units: { infantry: 8, armor: 1 } }] }),
    W('HUN', 'Hungría', '#196f3d', ['hungary', 'pannonia'], 'magyar', 'authoritarian', { claims: ['transylvania', 'upper_hungary'] }),
    W('ROM', 'Rumanía', '#f7dc6f', ['wallachia', 'transylvania', 'moldavia', 'dobruja'], 'latin', 'authoritarian', { armies: [{ province: 'wallachia', units: { infantry: 6 } }] }),
    W('YUG', 'Yugoslavia', '#aed6f1', ['serbia', 'croatia', 'dalmatia', 'bosnia', 'macedonia', 'slovenia', 'montenegro', 'kosovo'], 'slavic', 'authoritarian', { armies: [{ province: 'serbia', units: { infantry: 8 } }] }),
    W('BUL', 'Bulgaria', '#1e8449', ['bulgaria'], 'slavic', 'authoritarian'),
    W('GRE', 'Grecia', '#85c1e9', ['thessaly', 'morea', 'crete', 'salonica'], 'greek', 'authoritarian', { armies: [{ province: 'thessaly', units: { infantry: 4, mountain: 1 } }] }),
    W('ALB', 'Albania', '#922b21', ['albania'], 'latin', 'authoritarian'),
    W('TUR', 'Turquía', '#117864', ['ankara', 'constantinople', 'thrace', 'bithynia', 'aydin', 'konya', 'trebizond', 'sivas', 'cilicia', 'armenia', 'diyarbakir'], 'turkic', 'authoritarian', { x: { nu: 80 }, armies: [{ province: 'thrace', units: { infantry: 6 } }] }),
    W('POL', 'Polonia', '#ec7063', ['mazovia', 'wielkopolska', 'malopolska', 'danzig', 'red_ruthenia', 'volhynia'], 'slavic', 'authoritarian', {
      manpower: 900_000, x: { nu: 75, fighters: 2, aggression: 0 }, armies: [{ province: 'wielkopolska', units: { infantry: 10, cavalry: 3 }, name: 'Ejército Poznań' }, { province: 'mazovia', units: { infantry: 8 }, name: 'Ejército Varsovia' }],
    }),
    W('LIT', 'Lituania', '#16a085', ['lithuania'], 'slavic', 'authoritarian'),
    W('LAT', 'Letonia', '#a04000', ['livonia', 'courland'], 'slavic', 'authoritarian'),
    W('EST', 'Estonia', '#2874a6', ['estonia'], 'slavic', 'democracy'),
    W('FIN', 'Finlandia', '#d6eaf8', ['finland', 'osterbotten', 'lapland'], 'norse', 'democracy', { x: { nu: 95 }, armies: [{ province: 'finland', units: { infantry: 5 } }] }),
    W('SWE', 'Suecia', '#2471a3', ['svealand', 'gotaland', 'norrland', 'skane'], 'norse', 'democracy', { x: { navy: 2 } }),
    W('NOR', 'Noruega', '#c0392b', ['oslo', 'bergen', 'trondelag', 'nordland', 'finnmark', 'svalbard'], 'norse', 'democracy'),
    W('DEN', 'Dinamarca', '#e74c3c', ['sjaelland', 'jylland', 'iceland', 'greenland', 'greenland_east', 'greenland_north'], 'norse', 'democracy'),
    W('EGY', 'Egipto', '#d4ac0d', ['cairo', 'alexandria', 'sinai', 'upper_egypt', 'western_desert'], 'arabic', 'authoritarian', { liege: 'ENG', x: { nu: 100, aggression: 0 }, description: 'Reino formalmente independiente desde 1922; el tratado de agosto de 1936 mantuvo las tropas británicas en el canal de Suez.' }),
    W('IRQ', 'Irak', '#7dcea0', ['baghdad', 'mosul', 'basra'], 'arabic', 'authoritarian', { liege: 'ENG', x: { nu: 100, aggression: 0 }, description: 'Independiente desde 1932, ligado al Reino Unido por el tratado de 1930 y sus bases aéreas.' }),
    W('OMA', 'Mascate y Omán', '#c39bd3', ['oman', 'dhofar'], 'arabic', 'authoritarian', { liege: 'ENG', x: { nu: 100, aggression: 0 } }),
    W('PER', 'Irán', '#45b39d', ['tehran', 'tabriz', 'khuzestan', 'isfahan', 'fars', 'hormozgan', 'khorasan', 'sistan'], 'persian', 'authoritarian', { x: { aggression: 0 }, description: 'Persia pasó a llamarse oficialmente Irán en 1935. Reza Shah moderniza el país; la Anglo-Iranian Oil Company explota el petróleo del Juzestán.' }),
    W('AFG', 'Afganistán', '#8d6e63', ['afghanistan'], 'persian', 'authoritarian', { x: { aggression: 0 } }),
    W('SAU', 'Arabia Saudí', '#1d8348', ['najd', 'hejaz', 'al_hasa', 'hail', 'tabuk', 'rub_al_khali'], 'arabic', 'authoritarian', { x: { aggression: 0 } }),
    W('YEM', 'Yemen', '#a9cce3', ['sanaa', 'saada'], 'arabic', 'authoritarian', { x: { aggression: 0 } }),
    W('MEX', 'México', '#196f3d', ['mexico', 'veracruz', 'yucatan', 'baja_california', 'baja_sur', 'sonora', 'chihuahua', 'monterrey', 'jalisco', 'chiapas'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('GUA', 'Guatemala', '#5dade2', ['guatemala'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('HON', 'Honduras', '#7fb3d5', ['honduras'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('SAL', 'El Salvador', '#2874a6', ['el_salvador'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('NIC', 'Nicaragua', '#85c1e9', ['nicaragua'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('COS', 'Costa Rica', '#1a5276', ['costa_rica'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('CUB', 'Cuba', '#2e86c1', ['cuba'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('HAI', 'República Dominicana', '#922b21', ['hispaniola'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('HTI', 'Haití', '#283593', ['haiti'], 'creole', 'authoritarian', { x: { aggression: 0 } }),
    W('PAN', 'Panamá', '#f0b27a', ['panama'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('COL', 'Colombia', '#f4d03f', ['new_granada', 'caribe_col', 'llanos', 'amazonia_col'], 'latin', 'democracy', { x: { aggression: 0 } }),
    W('VNZ', 'Venezuela', '#b03a2e', ['venezuela', 'zulia', 'guayana_ve'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('ECU', 'Ecuador', '#f9e79f', ['ecuador'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('PRU', 'Perú', '#e74c3c', ['peru', 'peru_north', 'loreto', 'peru_south'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('BOL', 'Bolivia', '#58d68d', ['la_paz', 'santa_cruz'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('CHL', 'Chile', '#c0392b', ['santiago', 'atacama', 'araucania', 'aysen'], 'latin', 'democracy', { x: { aggression: 0, navy: 1 } }),
    W('ARG', 'Argentina', '#aed6f1', ['buenos_aires', 'cordoba', 'tucuman', 'chaco_ar', 'mendoza', 'patagonia', 'santa_cruz_ar', 'tierra_del_fuego'], 'latin', 'authoritarian', { x: { aggression: 0, navy: 1 } }),
    W('PAR', 'Paraguay', '#5d6d7e', ['paraguay'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('URU', 'Uruguay', '#5dade2', ['uruguay'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    W('BRA', 'Brasil', '#27ae60', ['rio', 'sao_paulo', 'minas', 'bahia', 'pernambuco', 'parana', 'rio_grande_sul', 'goias', 'mato_grosso', 'mato_grosso_sul', 'tocantins', 'maranhao', 'ceara', 'para', 'amapa',
      'amazonas', 'roraima', 'rondonia', 'acre_br'], 'latin', 'authoritarian', { x: { aggression: 0 } }),
    // ---------------------------------------------------------------- África independiente
    W('ETH', 'Etiopía', '#7d6608', ['ethiopia', 'ogaden'], 'ethiopian', 'authoritarian', {
      manpower: 300_000, x: { aggression: 0, nu: 90, combat: 0.5 }, armies: [{ province: 'ethiopia', units: { militia: 6, infantry: 2 }, name: 'Ejército imperial' }, { province: 'ogaden', units: { militia: 2 }, name: 'Ejército del Ogadén' }],
      description: 'El Imperio de Haile Selassie resiste desde octubre de 1935 la invasión italiana, con armas anticuadas y sin aviación. La Sociedad de Naciones solo ha decretado sanciones parciales.' }),
    W('LIB', 'Liberia', '#c0392b', ['liberia'], 'african', 'authoritarian', { x: { aggression: 0 } }),
    // ---------------------------------------------------------------- Asia
    W('JAP', 'Japón', '#e8daef', ['kanto', 'kansai', 'kyushu', 'hokkaido', 'pyongyang', 'south_korea', 'taiwan', 'palau'], 'japanese', 'authoritarian', {
      manpower: 1_200_000, tech: { naval: 3, air: 1, infantry: 1, industry: 1 }, x: { nu: 90, navy: 12, fighters: 4, bombers: 3, subs: 2, combat: 1.0, aggression: 0.2 },
      claims: ['beijing', 'shandong', 'inner_mongolia'],
      armies: [{ province: 'kanto', units: { infantry: 6 }, name: 'Ejército de la Metrópoli' }, { province: 'manchuria', units: { infantry: 6, armor: 1 }, name: 'Ejército de Kwantung' }, { province: 'pyongyang', units: { infantry: 2 }, name: 'Ejército de Corea' }],
      description: 'Corea, Taiwán, el sur de Sajalín y el mandato de los Mares del Sur son japoneses; Manchuria es un estado títere. En el gobierno de Tokio crece el peso de los militares.' }),
    W('MAN', 'Manchukuo', '#f5b041', ['manchuria', 'heilongjiang', 'hulunbuir'], 'chinese', 'authoritarian', {
      liege: 'JAP', manpower: 200_000, x: { nu: 100, aggression: 0, combat: 0.6 }, armies: [{ province: 'heilongjiang', units: { infantry: 2 }, name: 'Ejército Imperial de Manchukuo' }],
      description: 'Estado títere creado por el ejército japonés en 1932, con el último emperador Qing, Puyi, como figura decorativa.' }),
    W('CHI', 'República de China', '#2e4053', ['shanghai', 'beijing', 'inner_mongolia', 'wuhan', 'fujian', 'guangdong', 'sichuan', 'yunnan', 'gansu', 'qinghai', 'shandong', 'henan', 'hunan', 'guangxi', 'hainan'], 'chinese', 'authoritarian', {
      manpower: 2_500_000, x: { nu: 100, stubborn: 1000, combat: 0.85, aggression: 0, navy: 1, fighters: 1, factory: 6 }, claims: ['manchuria', 'heilongjiang', 'hulunbuir', 'taiwan'],
      armies: [{ province: 'shanghai', units: { infantry: 8 }, name: 'Ejército Central' }, { province: 'wuhan', units: { infantry: 6 } }, { province: 'beijing', units: { infantry: 4 }, name: '29.º Ejército' }, { province: 'guangdong', units: { infantry: 4 } }, { province: 'sichuan', units: { infantry: 3 } }, { province: 'henan', units: { infantry: 4 } }, { province: 'hunan', units: { infantry: 4 } }],
      description: 'El gobierno nacionalista de Chiang Kai-shek, con capital en Nankín, domina el valle del Yangtsé; buena parte del resto del país está en manos de caudillos que solo lo reconocen a medias. China cambiará espacio por tiempo: no capitula por perder sus ciudades.' }),
    W('CCP', 'China comunista', '#c0392b', ['shaanxi'], 'chinese', 'communist', {
      manpower: 100_000, x: { aggression: 0, neutral: 1, nu: 100, combat: 0.7 }, armies: [{ province: 'shaanxi', units: { militia: 3, infantry: 1 }, name: 'Ejército Rojo' }],
      description: 'Tras la Larga Marcha, los comunistas de Mao Zedong se han refugiado en el norte de Shaanxi.' }),
    W('SIK', 'Sinkiang', '#a3e4d7', ['xinjiang', 'kashgar'], 'turkestani', 'authoritarian', { x: { aggression: 0 }, description: 'Provincia china gobernada con autonomía por Sheng Shicai, que depende de las armas y los asesores soviéticos.' }),
    W('TIB', 'Tíbet', '#f8c471', ['tibet', 'ngari'], 'tibetan', 'authoritarian', { x: { aggression: 0 }, description: 'Independiente de hecho desde 1913, aunque China no lo reconoce.' }),
    W('MON', 'Mongolia', '#2980b9', ['mongolia', 'mongolia_west', 'gobi'], 'mongol', 'communist', { liege: 'SOV', x: { nu: 100, aggression: 0 }, armies: [{ province: 'mongolia', units: { cavalry: 2 }, name: 'Ejército Popular Revolucionario' }] }),
    W('SIA', 'Siam', '#d4ac0d', ['indochina', 'thai_south'], 'thai', 'authoritarian', { x: { aggression: 0 } }),
    W('NEP', 'Nepal', '#cb4335', ['nepal'], 'indian', 'authoritarian', { x: { aggression: 0 } }),
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
  // Londres y París no declararon la guerra a la URSS: la ocupación del este de Polonia se resuelve como cesión, no como una guerra
  // en la que las garantías a Polonia arrastrarían a todo el Imperio británico contra Moscú.
  ev({ id: 'soviet_poland', tag: 'SOV', date: '1939-09-17', title: 'La invasión del este de Polonia',
    condition: [{ type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }, { type: 'atWarWith', tag: 'GER', other: 'POL' }, { type: 'owns', tag: 'POL', province: 'volhynia' }],
    text: 'El Estado polaco se derrumba ante la ofensiva alemana. Según el protocolo secreto del pacto, el Ejército Rojo puede ocupar los territorios al este del Bug.',
    note: 'El Ejército Rojo cruzó la frontera el 17 de septiembre de 1939. Gran Bretaña y Francia protestaron, pero no declararon la guerra a la Unión Soviética.',
    options: [{ label: 'Ocupar el este de Polonia', effects: [{ type: 'cede', from: 'POL', to: 'SOV', provinces: ['volhynia', 'red_ruthenia'] }, { type: 'infamy', amount: 5 }, { type: 'relations', other: 'POL', amount: -150 }, { type: 'relations', other: 'ENG', amount: -40 }], aiWeight: 9 },
      { label: 'Mantenerse al margen', effects: [{ type: 'relations', other: 'GER', amount: -50 }], aiWeight: 1 }] }),
  DOW('winter_war', 'SOV', '1939-11-30', 'FIN', 'La Guerra de Invierno', 'Finlandia se niega a ceder Carelia.', 'finland'),
  DOW('weserubung', 'GER', '1940-04-09', 'NOR', 'Weserübung', 'Hay que asegurar el hierro sueco y las costas noruegas.', 'oslo', [{ type: 'atWar', value: true }]),
  DOW('fall_gelb', 'GER', '1940-05-10', 'BEL', 'Fall Gelb', 'La ofensiva a través de las Ardenas y los Países Bajos.', 'brabant', [{ type: 'atWarWith', other: 'FRA' }]),
  DOW('fall_gelb_nl', 'GER', '1940-05-10', 'HOL', 'Invasión de los Países Bajos', 'Rotterdam y Ámsterdam deben caer.', 'holland', [{ type: 'atWarWith', other: 'FRA' }]),
  DOW('italy_france', 'ITA', '1940-06-10', 'FRA', 'La puñalada por la espalda', 'Francia se tambalea. Es el momento de reclamar Niza y Córcega.', 'provence', [{ type: 'atWarWith', tag: 'GER', other: 'FRA' }]),
  DOW('greece', 'ITA', '1940-10-28', 'GRE', 'El ultimátum a Grecia', 'Atenas rechaza nuestras exigencias.', 'thessaly'),
  DOW('barbarossa', 'GER', '1941-06-22', 'SOV', 'Operación Barbarroja', 'El gran ajuste de cuentas con el bolchevismo.', 'moscow'),
  ev({ id: 'usa_war', tag: 'USA', date: '1941-12-11', title: 'Un día que vivirá en la infamia', text: 'Las potencias del Eje nos han declarado la guerra.', condition: [{ type: 'exists', tag: 'GER' }, { type: 'atWarWith', tag: 'GER', other: 'ENG' }],
    options: [{ label: 'Unirse a los Aliados', effects: [{ type: 'joinFaction', faction: 'allies' }, { type: 'declareWar', target: 'GER' }, { type: 'x', key: 'nu', amount: 10 }], aiWeight: 1 }] }),
  ev({ id: 'red_army_reform', tag: 'SOV', date: '1942-01-01', title: 'La reforma del Ejército Rojo', text: 'Tras las derrotas iniciales, los mandos purgados son reemplazados por oficiales probados en combate.',
    options: [{ label: 'Restaurar la autoridad de los generales', effects: [{ type: 'x', key: 'combat', amount: 0.3 }, { type: 'x', key: 'nu', amount: 5 }] }] }),
  ev({ id: 'ww2_strike', date: '1936-02-01', mtthMonths: 400, oneShot: false, title: 'Huelga industrial', text: 'Los obreros de las fábricas de armamento se declaran en huelga.', options: [{ label: 'Negociar', effects: [{ type: 'x', key: 'dissent', amount: 2 }] }, { label: 'Reprimir', effects: [{ type: 'x', key: 'dissent', amount: 5 }, { type: 'x', key: 'nu', amount: 2 }] }] }),
  // ---------------------------------------------------------------- el mundo fuera de Europa
  ev({ id: 'eth_addis', tag: 'ITA', date: '1936-05-05', title: 'La entrada en Adís Abeba', condition: [{ type: 'exists', tag: 'ETH' }],
    text: 'Las columnas del mariscal Badoglio han entrado en la capital etíope. El emperador ha partido hacia el exilio para defender su causa ante la Sociedad de Naciones.',
    note: 'Italia empleó gas mostaza contra tropas y civiles etíopes. El 9 de mayo de 1936 Mussolini proclamó el Imperio; la resistencia continuó en el interior hasta 1941.',
    options: [{ label: 'Proclamar el Imperio', effects: [{ type: 'annex', target: 'ETH' }, { type: 'infamy', amount: 6 }, { type: 'prestige', amount: 50 }, { type: 'relations', other: 'ENG', amount: -40 }, { type: 'relations', other: 'FRA', amount: -20 }], aiWeight: 9 },
      { label: 'Negociar una paz que deje un Estado etíope reducido', effects: [{ type: 'prestige', amount: -20 }], aiWeight: 1 }] }),
  ev({ id: 'xian_incident', tag: 'CHI', date: '1936-12-12', title: 'El incidente de Xi\'an', condition: [{ type: 'exists', tag: 'CCP' }],
    text: 'El mariscal Zhang Xueliang, cuyas tropas debían aplastar a los comunistas del norte de Shaanxi, ha arrestado a Chiang Kai-shek en Xi\'an. Exige el fin de la guerra civil y un frente común contra Japón.',
    note: 'Chiang fue liberado el 25 de diciembre. En 1937 nacionalistas y comunistas formaron el Segundo Frente Unido; el Ejército Rojo se integró nominalmente en el ejército nacional como 8.º Ejército de Ruta.',
    options: [{ label: 'Aceptar un frente unido contra Japón', effects: [{ type: 'alliance', other: 'CCP' }, { type: 'relations', other: 'CCP', amount: 150 }, { type: 'relations', other: 'JAP', amount: -50 }], aiWeight: 9 },
      { label: 'Continuar la campaña contra los comunistas', effects: [{ type: 'relations', other: 'CCP', amount: -50 }, { type: 'x', key: 'dissent', amount: 10 }], aiWeight: 1 }] }),
  ev({ id: 'burma_separation', tag: 'ENG', date: '1937-04-01', title: 'Birmania, colonia aparte', condition: [{ type: 'exists', tag: 'RAJ' }, { type: 'owns', tag: 'RAJ', province: 'yangon' }],
    text: 'La Ley del Gobierno de Birmania entra en vigor: el país deja de ser una provincia de la India británica y pasa a ser una colonia con gobierno propio, bajo un gobernador nombrado por Londres.',
    options: [{ label: 'Separar Birmania de la India', effects: [{ type: 'cede', from: 'RAJ', to: 'ENG', provinces: ['myanmar', 'kachin', 'yangon', 'tenasserim'] }], aiWeight: 1 }] }),
  ev({ id: 'marco_polo', tag: 'JAP', date: '1937-07-07', title: 'El puente de Marco Polo', condition: [{ type: 'exists', tag: 'CHI' }, { type: 'notVassal' }],
    text: 'Un tiroteo nocturno entre tropas japonesas de maniobras y la guarnición china del puente de Lugou, al sur de Pekín, se ha convertido en un enfrentamiento abierto. El Estado Mayor pide refuerzos para «castigar» a China.',
    note: 'El incidente del 7 de julio de 1937 desembocó en una guerra no declarada que duró hasta 1945. Pekín cayó a finales de julio; Shanghái, tras tres meses de combates, en noviembre; Nankín, en diciembre.',
    options: [{ label: 'Enviar refuerzos y lanzar la ofensiva', effects: [{ type: 'declareWar', target: 'CHI', goal: 'beijing' }, { type: 'x', key: 'nu', amount: 5 }], aiWeight: 1 }, { label: 'Negociar un alto el fuego local', effects: [{ type: 'x', key: 'dissent', amount: 8 }], aiWeight: 0 }] }),
  ev({ id: 'ger_war_footing', tag: 'GER', date: '1939-09-01', title: 'La guerra general', condition: [{ type: 'atWar', value: true }, { type: 'maxX', key: 'aggression', value: 1 }],
    text: 'Las potencias occidentales nos han declarado la guerra. Ya no hay razones para contenerse en ningún frente.',
    options: [{ label: 'Adelante', effects: [{ type: 'x', key: 'aggression', amount: 2.5 }], aiWeight: 1 }] }),
  ev({ id: 'ita_war_footing', tag: 'ITA', date: '1940-06-10', title: 'La guerra paralela', condition: [{ type: 'atWar', value: true }, { type: 'maxX', key: 'aggression', value: 1 }],
    text: 'Italia ha entrado en la guerra. El Duce quiere una «guerra paralela» propia en el Mediterráneo y los Balcanes.',
    options: [{ label: 'Adelante', effects: [{ type: 'x', key: 'aggression', amount: 1 }], aiWeight: 1 }] }),
  ev({ id: 'chi_interior', tag: 'CHI', date: '1938-01-01', title: 'Cambiar espacio por tiempo', condition: [{ type: 'atWarWith', other: 'JAP' }],
    text: 'Las fábricas de Shanghái y del bajo Yangtsé se desmontan y viajan río arriba hacia Sichuán. Moscú envía aviones, artillería y asesores; el gobierno se instalará en Chongqing.',
    note: 'Entre 1937 y 1940 se trasladaron al interior más de seiscientas fábricas. La URSS fue el principal proveedor de armas de China hasta 1941.',
    options: [{ label: 'Trasladar la industria al interior', effects: [{ type: 'x', key: 'factory', amount: 8 }, { type: 'x', key: 'stock_supplies', amount: 3000 }, { type: 'relations', other: 'SOV', amount: 30 }], aiWeight: 1 }] }),
  ev({ id: 'hatay', tag: 'FRA', date: '1939-06-29', title: 'El sancak de Alejandreta', condition: [{ type: 'owns', province: 'antioch' }, { type: 'exists', tag: 'TUR' }],
    text: 'Ankara reclama el sancak de Alejandreta, donde vive una gran población turca. Con la guerra en el horizonte, París necesita la neutralidad turca más que este rincón del mandato sirio.',
    options: [{ label: 'Ceder Hatay a Turquía', effects: [{ type: 'cede', from: 'FRA', to: 'TUR', provinces: ['antioch'] }, { type: 'relations', other: 'TUR', amount: 50 }], aiWeight: 9 },
      { label: 'Mantener la integridad del mandato', effects: [{ type: 'relations', other: 'TUR', amount: -60 }], aiWeight: 1 }] }),
  ev({ id: 'jap_tripartite', tag: 'JAP', date: '1940-09-27', title: 'El Pacto Tripartito', condition: [{ type: 'exists', tag: 'GER' }, { type: 'notVassal' }],
    text: 'Berlín y Roma proponen una alianza que reconozca a Japón el liderazgo de un «nuevo orden» en Asia oriental. El pacto está pensado para disuadir a Estados Unidos de intervenir.',
    note: 'El pacto era defensivo y no obligaba a Japón a entrar en la guerra europea: Tokio firmó un pacto de neutralidad con Moscú en abril de 1941 y no participó en la invasión de la URSS. Por eso Japón no entra aquí en el bloque del Eje.',
    options: [{ label: 'Firmar con Alemania e Italia', effects: [{ type: 'flag', flag: 'tripartite' }, { type: 'relations', other: 'GER', amount: 40 }, { type: 'relations', other: 'ITA', amount: 30 }, { type: 'relations', other: 'USA', amount: -50 }], aiWeight: 9 },
      { label: 'Mantener las manos libres', effects: [{ type: 'relations', other: 'GER', amount: -30 }], aiWeight: 1 }] }),
  ev({ id: 'vichy_indochina', tag: 'FRA', date: '1940-09-22', title: 'Las exigencias japonesas en Indochina', condition: [{ type: 'isVassal' }, { type: 'exists', tag: 'JAP' }, { type: 'owns', province: 'vietnam' }],
    text: 'Derrotada en Europa, Francia no puede defender Indochina. Tokio exige bases y el cierre de la ruta por la que llegan armas a China a través de Tonkín.',
    note: 'Las tropas japonesas entraron en el norte de Indochina en septiembre de 1940 y en el sur en julio de 1941. La administración francesa de Vichy siguió funcionando hasta marzo de 1945.',
    options: [{ label: 'Ceder el control de Tonkín', effects: [{ type: 'cede', from: 'FRA', to: 'JAP', provinces: ['vietnam'] }], aiWeight: 9 },
      { label: 'Rechazar las exigencias', effects: [{ type: 'relations', other: 'JAP', amount: -80 }], aiWeight: 1 }] }),
  ev({ id: 'jap_south_indochina', tag: 'JAP', date: '1941-07-28', title: 'El sur de Indochina', condition: [{ type: 'owns', province: 'vietnam' }, { type: 'exists', tag: 'FRA' }, { type: 'atWar', value: true }],
    text: 'Con bases en Saigón y Camboya, nuestra aviación alcanzaría Malasia, Singapur y las Indias Orientales. Washington ha advertido que respondería cortando el suministro de petróleo.',
    options: [{ label: 'Ocupar el sur de Indochina', effects: [{ type: 'cede', from: 'FRA', to: 'JAP', provinces: ['annam', 'saigon', 'laos', 'cambodia'] }, { type: 'x', key: 'stock_oil', amount: -800 }, { type: 'relations', other: 'USA', amount: -100 }, { type: 'relations', other: 'ENG', amount: -60 }], aiWeight: 9 },
      { label: 'No provocar a Estados Unidos', effects: [{ type: 'x', key: 'dissent', amount: 6 }], aiWeight: 1 }] }),
  ev({ id: 'jap_pearl', tag: 'JAP', date: '1941-12-07', title: 'Ataque hacia el sur', condition: [{ type: 'exists', tag: 'USA' }, { type: 'notVassal' }, { type: 'minX', key: 'navy', value: 5 }],
    text: 'El embargo de petróleo agota nuestras reservas. La Flota Combinada está lista para golpear Pearl Harbor mientras el ejército desembarca en Malasia y Filipinas. Si esperamos más, no habrá combustible para combatir.',
    note: 'El ataque a Pearl Harbor y los desembarcos en Malasia comenzaron casi simultáneamente el 7 y 8 de diciembre de 1941.',
    options: [{ label: 'Atacar Pearl Harbor y Malasia', effects: [{ type: 'declareWar', target: 'USA', goal: 'hawaii' }, { type: 'declareWar', target: 'ENG', goal: 'malaya' }, { type: 'x', key: 'nu', amount: 10 }], aiWeight: 9 },
      { label: 'Aceptar las condiciones de Washington', effects: [{ type: 'relations', other: 'USA', amount: 80 }, { type: 'x', key: 'dissent', amount: 25 }, { type: 'prestige', amount: -60 }], aiWeight: 1 }] }),
  ev({ id: 'hol_vs_japan', tag: 'HOL', date: '1941-12-08', title: 'Las Indias Orientales', condition: [{ type: 'notVassal' }, { type: 'atWarWith', tag: 'JAP', other: 'ENG' }],
    text: 'Japón ha atacado a británicos y estadounidenses. Nuestro petróleo de Sumatra y Borneo es su verdadero objetivo.',
    options: [{ label: 'Declarar la guerra a Japón', effects: [{ type: 'declareWar', target: 'JAP' }], aiWeight: 1 }, { label: 'Esperar el golpe', effects: [], aiWeight: 0 }] }),
];

export const ww1936: Scenario = {
  id: 'ww1936', era: 'ww2', map: 'world', name: '1936 — El camino a la guerra',
  description: 'Alemania ha remilitarizado Renania, Italia combate en Abisinia, Japón domina Manchuria y en España estalla la tensión. Tres bloques ideológicos se preparan para una guerra que decidirá el siglo, en un mundo repartido entre los imperios coloniales.',
  start: '1936-01-01', end: '1948-01-01', recommended: ['GER', 'ENG', 'FRA', 'SOV', 'ITA', 'USA', 'JAP', 'CHI', 'POL'],
  options: { fullWorld: true },
  nations: nations1936(), factions: FACTIONS, provinceOverrides: econ(), events: EVENTS,
  wars: [{ name: 'Segunda guerra ítalo-etíope', attackers: ['ITA'], defenders: ['ETH'], goal: 'ethiopia' }],
  relations: [['GER', 'FRA', -100], ['GER', 'SOV', -150], ['ENG', 'FRA', 150], ['GER', 'ITA', 50], ['SOV', 'POL', -80], ['HUN', 'ROM', -80], ['ENG', 'USA', 100], ['ITA', 'ETH', -200], ['ITA', 'ENG', -40], ...WORLD_RELATIONS, ['CHI', 'CCP', -120]],
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
  move('ETH', 'ITA', ['ethiopia', 'ogaden']);
  // Birmania, colonia separada desde 1937; Hatay, turco desde junio de 1939
  move('RAJ', 'ENG', ['myanmar', 'kachin', 'yangon', 'tenasserim']);
  move('FRA', 'TUR', ['antioch']);
  // dos años de guerra en China: Japón ocupa el norte, la costa, el bajo Yangtsé, Wuhan, Cantón y Hainan
  move('CHI', 'JAP', ['beijing', 'shandong', 'shanghai', 'wuhan', 'guangdong', 'hainan']);
  const out = ns.filter((n) => !['AUS', 'ALB', 'ETH'].includes(n.tag));
  const cze = out.find((n) => n.tag === 'CZE')!;
  Object.assign(cze, { name: 'Eslovaquia', capital: 'upper_hungary', liege: 'GER', government: 'fascist', armies: [] });
  const spr = out.find((n) => n.tag === 'SPR')!;
  spr.government = 'fascist'; spr.manpower = 300_000;
  const ita = out.find((n) => n.tag === 'ITA')!;
  ita.faction = 'axis';
  ita.armies = [{ province: 'piemonte', units: { infantry: 8, mountain: 2 } }, { province: 'cyrenaica', units: { infantry: 8 }, name: 'Ejército de Libia' }, { province: 'ethiopia', units: { infantry: 6 }, name: 'Ejército del África Oriental Italiana' }];
  const ger = get('GER');
  ger.tech = { infantry: 2, armor: 2, air: 2, doctrine: 3, industry: 2 };
  ger.x = { ...ger.x, fighters: 10, bombers: 8, navy: 5, subs: 8, aggression: 3 };
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
  // Japón en guerra con China; el Mengjiang, títere japonés en Mongolia Interior
  const jap = get('JAP');
  jap.tech = { naval: 3, air: 2, infantry: 1, industry: 2, doctrine: 1 };
  jap.manpower = 1_000_000;
  jap.claims = ['henan', 'hunan', 'fujian', 'guangxi', 'sichuan'];
  jap.armies = [
    { province: 'beijing', units: { infantry: 8, motorized: 1 }, name: 'Ejército del Área Norte de China' },
    { province: 'wuhan', units: { infantry: 8 }, name: '11.º Ejército' },
    { province: 'shanghai', units: { infantry: 4 }, name: 'Ejército del Área Central de China' },
    { province: 'guangdong', units: { infantry: 3 }, name: '21.º Ejército' },
    { province: 'manchuria', units: { infantry: 8, armor: 1 }, name: 'Ejército de Kwantung' },
    { province: 'kanto', units: { infantry: 3 }, name: 'Ejército de la Metrópoli' },
  ];
  out.push(W('MEN', 'Mengjiang', '#d7bde2', ['inner_mongolia'], 'mongol', 'authoritarian', { liege: 'JAP', x: { nu: 100, aggression: 0 }, description: 'Gobierno títere del príncipe Demchugdongrub, creado con el respaldo del ejército japonés en Kalgan.' }));
  get('CHI').provinces = get('CHI').provinces.filter((p) => p !== 'inner_mongolia');
  const chi = get('CHI');
  const chiBase = { x: { ...(chi.x ?? {}) } };
  Object.assign(chi, {
    capital: 'sichuan', allies: ['CCP'], manpower: 2_000_000, claims: ['beijing', 'shandong', 'shanghai', 'wuhan', 'guangdong', 'hainan', 'inner_mongolia', 'manchuria', 'heilongjiang', 'hulunbuir', 'taiwan'],
    description: 'Tras perder Nankín, Wuhan y Cantón, el gobierno nacionalista resiste desde Chongqing, en Sichuán, abastecido por la carretera de Birmania y la ayuda soviética.',
    // los arsenales trasladados al interior y la ayuda exterior (soviética hasta 1941, después estadounidense)
    x: { ...chiBase.x, factory: 14, stock_supplies: 4000 },
    armies: [{ province: 'sichuan', units: { infantry: 10 }, name: 'Ejército Central' }, { province: 'hunan', units: { infantry: 12 }, name: '9.ª Zona de Guerra' }, { province: 'henan', units: { infantry: 10 }, name: '1.ª Zona de Guerra' }, { province: 'guangxi', units: { infantry: 6 }, name: '4.ª Zona de Guerra' }, { province: 'fujian', units: { infantry: 3 } }, { province: 'gansu', units: { infantry: 3 }, name: '8.ª Zona de Guerra' }],
  });
  get('CCP').armies = [{ province: 'shaanxi', units: { militia: 4, infantry: 2 }, name: '8.º Ejército de Ruta' }];
  return out;
}

const SKIP_1939 = ['spanish_civil_war', 'axis_pact', 'anschluss', 'munich', 'prague', 'albania', 'guarantee_poland', 'eth_addis', 'xian_incident', 'burma_separation', 'marco_polo', 'chi_interior', 'hatay'];

export const ww1939: Scenario = {
  id: 'ww1939', era: 'ww2', map: 'world', name: '1939 — Fall Weiss',
  description: 'Austria y Bohemia ya son alemanas, el pacto con Moscú está firmado y la Wehrmacht cruza la frontera polaca. Gran Bretaña y Francia han dado su garantía; sus imperios y dominios las seguirán. En Asia, Japón lleva dos años de guerra en China.',
  start: '1939-08-31', end: '1948-01-01', recommended: ['GER', 'POL', 'ENG', 'FRA', 'SOV', 'ITA', 'JAP', 'CHI'],
  options: { fullWorld: true },
  nations: nations1939(), factions: FACTIONS, provinceOverrides: econ(),
  wars: [{ name: 'Segunda guerra sino-japonesa', attackers: ['JAP', 'MAN', 'MEN'], defenders: ['CHI', 'CCP'], goal: 'sichuan' }],
  events: EVENTS.filter((e) => !SKIP_1939.includes(e.id)).map((e) => (e.id === 'mr_pact' ? { ...e, date: '1939-08-31' } : e)),
  relations: [['GER', 'FRA', -150], ['GER', 'POL', -150], ['ENG', 'FRA', 150], ['GER', 'ITA', 120], ['GER', 'SOV', 0], ['ENG', 'POL', 100], ['FRA', 'POL', 100], ['ENG', 'USA', 100],
    ...WORLD_RELATIONS, ['CHI', 'CCP', 60], ['JAP', 'CHI', -200], ['GER', 'JAP', 20], ['TUR', 'FRA', 40], ['JAP', 'MEN', 150], ['SOV', 'JAP', -150]],
};
