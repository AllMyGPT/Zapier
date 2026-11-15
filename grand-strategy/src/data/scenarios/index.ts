import '@/rulesets';
import type { Scenario } from '@/engine/core';
import type { Era } from '@/engine/types';
import { s1066 } from './medieval1066';
import { valdoria } from './valdoria';
import { s1492 } from './em1492';
import { ww1936, ww1939 } from './ww2';

export const SCENARIOS: Scenario[] = [s1066, valdoria, s1492, ww1936, ww1939];

export const ERAS: { id: Era; title: string; subtitle: string; blurb: string }[] = [
  { id: 'medieval', title: 'Coronas y Dinastías', subtitle: 'Edad Media', blurb: 'Personajes, linajes, vasallos, matrimonios, intrigas, piedad y guerras santas.' },
  { id: 'earlymodern', title: 'Imperios de Ultramar', subtitle: 'Edad Moderna', blurb: 'Estabilidad, presupuesto, tecnología, comercio, colonización, religión y políticas de Estado.' },
  { id: 'ww2', title: 'Guerra Total', subtitle: 'Segunda Guerra Mundial', blurb: 'Industria, recursos, producción, investigación, suministro, aviación, bloques y capitulaciones.' },
];

export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id);
