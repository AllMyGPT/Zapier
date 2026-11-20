import '@/rulesets';
import type { Scenario } from '@/engine/core';
import { s1066 } from './medieval1066';
import { valdoria } from './valdoria';
import { s1492 } from './em1492';
import { ww1936, ww1939 } from './ww2';
import { ww1914 } from './ww1';
import { spain1936 } from './spain';
import { mod2014 } from './modern';
import { storyFor } from '@/data/story';

/** merge the story layer (historical chains, missions, dynamic events) into each scenario */
const withStory = (sc: Scenario): Scenario => {
  const st = storyFor(sc.id, sc.era, sc.options?.artEra);
  return { ...sc, events: [...(sc.events ?? []), ...st.events], missions: [...(sc.missions ?? []), ...st.missions] };
};

/** placeholder scenarios (one 'XXA' nation) stay hidden until their content exists */
export const SCENARIOS: Scenario[] = [s1066, valdoria, s1492, ww1914, spain1936, ww1936, ww1939, mod2014].filter((sc) => !sc.nations.some((n) => n.tag === 'XXA')).map(withStory);

export const ERAS: { id: string; title: string; subtitle: string; blurb: string }[] = [
  { id: 'medieval', title: 'Coronas y Dinastías', subtitle: 'Edad Media', blurb: 'Personajes, linajes, vasallos, matrimonios, intrigas, piedad y guerras santas.' },
  { id: 'earlymodern', title: 'Imperios de Ultramar', subtitle: 'Edad Moderna', blurb: 'Estabilidad, presupuesto, tecnología, comercio, colonización, religión y políticas de Estado.' },
  { id: 'ww2', title: 'Guerra Total', subtitle: '1914 – 1945', blurb: 'La Gran Guerra, la Guerra Civil Española y la Segunda Guerra Mundial: industria, recursos, frentes, aviación y bloques.' },
  { id: 'modern', title: 'Siglo XXI', subtitle: '2014 – 2050', blurb: 'Ucrania, Oriente Medio, Taiwán y la carrera de la inteligencia artificial militar. Del presente a un futuro por escribir.' },
];

export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id);
