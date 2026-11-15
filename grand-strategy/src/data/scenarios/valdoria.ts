import type { Scenario } from '@/engine/core';
import { ev, N } from './helpers';

// Original setting: a feudal continent with rival great houses, a dying king and a contested throne.
const SOL = 'sol', VIE = 'viejos', LUN = 'luna';

export const valdoria: Scenario = {
  id: 'valdoria', era: 'medieval', map: 'valdoria', name: 'Valdoria — La Corona de Ámbar',
  description: 'El viejo rey Aldric III de Valcrest agoniza en Altacorona y su heredera es una niña. Siete grandes casas juraron fidelidad a la Corona de Ámbar, pero ninguna confía en las demás. Escenario de fantasía original.',
  start: '0300-03-01', end: '0420-01-01',
  recommended: ['VAL', 'THR', 'EMB', 'SOL', 'HIE'],
  nations: [
    N('VAL', 'Corona de Ámbar', '#d4a017', ['f_corona', 'f_trigal', 'f_rio', 'f_bosqueviejo'], SOL, 'fantasy', 'feudal', {
      treasury: 300, x: { crown: 2, law: 0 },
      characters: [
        { name: 'Aldric III', dynasty: 'Valcrest', born: '0236-01-01', dip: 6, mar: 4, ste: 7, int: 5, traits: ['enfermizo', 'justo'], role: 'ruler' },
        { name: 'Ysolde', dynasty: 'Valcrest', born: '0291-04-01', female: true, dip: 7, int: 6, role: 'heir' },
        { name: 'Lucan', dynasty: 'Valcrest', born: '0268-01-01', mar: 7, int: 8, traits: ['ambicioso', 'cínico'], role: 'leader' },
      ],
      armies: [{ province: 'f_corona', units: { knights: 4, pikemen: 4, archers: 3, levy: 4 }, name: 'Guardia de Ámbar', leader: 'Lucan' }],
    }),
    N('THR', 'Casa Thornwall', '#5d6d7e', ['f_escarcha', 'f_lobos', 'f_pinar', 'f_glaciar', 'f_cumbre', 'f_muralla'], VIE, 'fantasy', 'feudal', {
      liege: 'VAL', x: { aggression: 1.5 },
      characters: [{ name: 'Edric', dynasty: 'Thornwall', born: '0260-01-01', mar: 9, dip: 5, ste: 5, int: 4, traits: ['valiente', 'justo'], role: 'ruler' }, { name: 'Wren', dynasty: 'Thornwall', born: '0284-01-01', female: true, mar: 8, role: 'heir' }],
      armies: [{ province: 'f_muralla', units: { levy: 6, archers: 3, light_cav: 2 }, name: 'Guardianes del Muro' }],
    }),
    N('ASH', 'Casa Ashmoor', '#6e2c00', ['f_ashmoor', 'f_brezal', 'f_turba'], VIE, 'fantasy', 'feudal', { liege: 'VAL', characters: [{ name: 'Osric', dynasty: 'Ashmoor', born: '0255-01-01', int: 8, traits: ['cruel'], role: 'ruler' }] }),
    N('STO', 'Casa Stormvale', '#2471a3', ['f_stormvale', 'f_trueno', 'f_estepa', 'f_vado'], SOL, 'fantasy', 'feudal', {
      liege: 'VAL', x: { aggression: 2 }, claims: ['f_corona'],
      characters: [{ name: 'Varian', dynasty: 'Stormvale', born: '0270-01-01', mar: 8, dip: 6, int: 6, traits: ['ambicioso', 'valiente'], role: 'ruler' }],
    }),
    N('DUS', 'Casa Duskhaven', '#7d3c98', ['f_duskhaven', 'f_acantilado', 'f_bahia', 'f_viñedos'], LUN, 'fantasy', 'feudal', {
      liege: 'VAL', treasury: 250,
      characters: [{ name: 'Selene', dynasty: 'Duskhaven', born: '0266-01-01', female: true, dip: 9, int: 9, ste: 7, traits: ['cínico'], role: 'ruler' }],
    }),
    N('GRE', 'Casa Greyspire', '#839192', ['f_greyspire', 'f_minas', 'f_paso'], SOL, 'fantasy', 'feudal', { liege: 'VAL', treasury: 300, characters: [{ name: 'Hadrien', dynasty: 'Greyspire', born: '0250-01-01', ste: 9, traits: ['codicioso'], role: 'ruler' }] }),
    N('EMB', 'Casa Embermoor', '#cb4335', ['f_embermoor', 'f_forja', 'f_azafran', 'f_canal'], SOL, 'fantasy', 'feudal', {
      liege: 'VAL', treasury: 350, x: { aggression: 2 }, claims: ['f_rio', 'f_lagos'],
      characters: [{ name: 'Corvin', dynasty: 'Embermoor', born: '0262-01-01', mar: 7, ste: 8, int: 7, traits: ['ambicioso'], role: 'ruler' }, { name: 'Talia', dynasty: 'Embermoor', born: '0286-01-01', female: true, role: 'child' }],
    }),
    N('IRO', 'Casa Ironmere', '#1e8449', ['f_ironmere', 'f_juncal', 'f_herreria', 'f_lagos'], SOL, 'fantasy', 'feudal', { liege: 'VAL', characters: [{ name: 'Gareth', dynasty: 'Ironmere', born: '0272-01-01', mar: 6, role: 'ruler' }] }),
    N('SOL', 'Principado del Sol', '#f39c12', ['f_solaria', 'f_dunas', 'f_olivar', 'f_oasis', 'f_naranjos'], SOL, 'fantasy', 'feudal', {
      treasury: 250, x: { aggression: 2 }, claims: ['f_herreria', 'f_ironmere'],
      characters: [{ name: 'Florian', dynasty: 'Solmaris', born: '0265-01-01', dip: 8, mar: 6, ste: 7, role: 'ruler' }],
      armies: [{ province: 'f_solaria', units: { light_cav: 4, archers: 4, levy: 4 } }],
    }),
    N('SAL', 'Hermandad de la Sal', '#aab7b8', ['f_isla_sal'], LUN, 'fantasy', 'republic'),
    N('MAR', 'Señorío de las Mareas', '#48c9b0', ['f_mareas'], LUN, 'fantasy', 'feudal'),
    N('HIE', 'Saqueadores de Hierro', '#17202a', ['f_islas_hierro'], VIE, 'fantasy', 'tribal', {
      x: { aggression: 4 }, claims: ['f_glaciar', 'f_trueno', 'f_estepa'],
      characters: [{ name: 'Ivo', dynasty: 'Ironmere', born: '0275-01-01', mar: 9, traits: ['cruel', 'valiente'], role: 'ruler' }],
      armies: [{ province: 'f_islas_hierro', units: { levy: 5, light_cav: 1 }, name: 'Flota negra' }],
    }),
    N('PER', 'República de Perla', '#f7dc6f', ['f_perla'], LUN, 'fantasy', 'republic', { treasury: 400 }),
    N('VOL', 'Culto de la Llama', '#922b21', ['f_volcan'], VIE, 'fantasy', 'theocracy', { x: { piety: 300 } }),
  ],
  provinceOverrides: { f_corona: { fort: 4 }, f_muralla: { fort: 3 }, f_greyspire: { fort: 3 }, f_solaria: { fort: 2 } },
  relations: [['STO', 'EMB', -60], ['THR', 'HIE', -150], ['SOL', 'VAL', -60], ['DUS', 'ASH', -40], ['GRE', 'VAL', 80], ['THR', 'VAL', 70]],
  events: [
    ev({ id: 'king_dies', tag: 'VAL', date: '0300-06-01', title: 'La muerte del Rey de Ámbar', text: 'Aldric III exhala su último aliento. La princesa Ysolde, de nueve años, hereda la Corona bajo la regencia de su tío Lucan. Las casas observan.',
      options: [{ label: 'Lucan será regente', effects: [{ type: 'stability', amount: -1 }, { type: 'relations', other: 'STO', amount: -50 }, { type: 'relations', other: 'EMB', amount: -40 }], aiWeight: 1 }, { label: 'Un consejo de las casas gobernará', effects: [{ type: 'x', key: 'crown', amount: -1 }, { type: 'relations', other: 'THR', amount: 30 }, { type: 'relations', other: 'GRE', amount: 30 }, { type: 'relations', other: 'DUS', amount: 30 }], aiWeight: 1 }] }),
    ev({ id: 'storm_claim', tag: 'STO', date: '0300-09-01', title: 'Una corona para Stormvale', text: 'Varian sostiene que su abuela era hija del rey Aldric II y que una niña no puede ceñir la Corona de Ámbar.',
      condition: [{ type: 'exists', tag: 'VAL' }], options: [{ label: 'Alzar el estandarte de la tormenta', effects: [{ type: 'declareWar', target: 'VAL', goal: 'f_corona' }], aiWeight: 6 }, { label: 'Esperar el momento', effects: [{ type: 'relations', other: 'VAL', amount: 20 }], aiWeight: 4 }] }),
    ev({ id: 'long_winter', tag: 'THR', date: '0302-11-01', title: 'El Invierno Largo', text: 'Los pasos del norte quedan sepultados por la nieve. Algo se mueve más allá del Muro de Ceniza.',
      options: [{ label: 'Reforzar el Muro', effects: [{ type: 'treasury', amount: -60 }, { type: 'spawnArmy', province: 'f_muralla', units: { pikemen: 3 } }] }, { label: 'Abandonar las aldeas', effects: [{ type: 'manpower', amount: -4000 }, { type: 'prestige', amount: -40 }] }] }),
    ev({ id: 'iron_raid', tag: 'HIE', date: '0301-04-01', mtthMonths: 30, oneShot: false, title: 'La temporada de saqueo', text: 'Los barcos negros están listos.',
      condition: [{ type: 'atWar', value: false }], options: [{ label: 'Saquear la costa de Thornwall', effects: [{ type: 'declareWar', target: 'THR', goal: 'f_glaciar' }], aiWeight: 3 }, { label: 'Saquear Stormvale', effects: [{ type: 'declareWar', target: 'STO', goal: 'f_estepa' }], aiWeight: 2 }, { label: 'Comerciar este año', effects: [{ type: 'treasury', amount: 40 }], aiWeight: 2 }] }),
    ev({ id: 'pearl_loan', tag: 'VAL', date: '0301-01-01', title: 'Los banqueros de Perla', text: 'La República de Perla ofrece oro a la Corona... a cambio de privilegios.',
      options: [{ label: 'Aceptar (+300 oro)', effects: [{ type: 'treasury', amount: 300 }, { type: 'relations', other: 'PER', amount: 50 }, { type: 'stability', amount: -1 }], aiWeight: 1 }, { label: 'Rechazar', effects: [{ type: 'prestige', amount: 20 }], aiWeight: 1 }] }),
    ev({ id: 'flame_cult', tag: 'VOL', date: '0305-01-01', title: 'El despertar del Volcán', text: 'El culto proclama que la montaña exige ofrendas del continente.',
      options: [{ label: 'Predicar en Solaria', effects: [{ type: 'unrest', province: 'f_solaria', amount: 5 }, { type: 'relations', other: 'SOL', amount: -80 }] }] }),
    ev({ id: 'valdoria_plague', date: '0300-04-01', mtthMonths: 400, oneShot: false, title: 'Fiebre gris', text: 'Una fiebre arrasa las ciudades.', options: [{ label: 'Cerrar las puertas', effects: [{ type: 'manpower', amount: -2000 }, { type: 'treasury', amount: -15 }] }] }),
  ],
};
