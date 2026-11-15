import type { Character, Era, GameState } from '@/engine/types';

/** Painted art shipped in public/art. Every lookup is deterministic so a save always shows the same faces and scenes. */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

const PORTRAITS: Record<Era, { m: string[]; f: string[] }> = {
  medieval: { m: ['medieval-m1', 'medieval-m2', 'medieval-m3', 'medieval-m4'], f: ['medieval-f1', 'medieval-f2'] },
  earlymodern: { m: ['earlymodern-m1', 'earlymodern-m2', 'earlymodern-m3'], f: ['earlymodern-f1'] },
  ww2: { m: ['ww2-m1', 'ww2-m2'], f: ['ww2-f1'] },
};

const CULT: Record<string, 'w' | 'e' | 'i'> = { greek: 'e', slavic: 'e', arabic: 'i', turkic: 'i' };
const band = (years: number) => (years < 16 ? 'c' : years < 33 ? 'y' : years < 56 ? 'a' : 'o');

/**
 * Portrait by era, culture group (west / east / islamic), sex and age band.
 * The detailed set lives in public/art/portraits/{era}-{w|e|i}-{m|f}-{c|y|a|o}.jpg;
 * if a file is missing, <Portrait> falls back to legacyPortrait().
 */
export function portraitFor(s: GameState, c: Character): string {
  if (c.portrait) return c.portrait;
  const years = Math.floor(((c.died ?? s.day) - c.born) / 365);
  const sex = c.female ? 'f' : 'm';
  if (artEra(s) === 'modern') {
    const a = band(years) === 'c' ? 'y' : band(years);
    return `/art/portraits/modern-${sex}-${a}-${hash(c.id) < 0.5 ? 1 : 2}.jpg`;
  }
  if (s.era === 'ww2') {
    const a = band(years) === 'c' ? 'y' : band(years);
    return `/art/portraits/ww2-${sex}-${a}-${hash(c.id) < 0.5 ? 1 : 2}.jpg`;
  }
  const cult = CULT[s.nations[c.tag]?.culture ?? ''] ?? 'w';
  return `/art/portraits/${s.era}-${cult}-${sex}-${band(years)}${hash(c.id) < 0.5 ? '-2' : ''}.jpg`;
}

/** the original 13-portrait set, used when a detailed portrait is not available */
export function legacyPortrait(src: string): string | null {
  if (/-2\.jpg$/.test(src)) return src.replace(/-2\.jpg$/, '.jpg');
  const m = src.match(/portraits\/(medieval|earlymodern|ww2)-(?:([wei])-)?([mf])-([cyao])/);
  if (!m) return null;
  const [, era, , sex, age] = m;
  if (era === 'ww2') return sex === 'f' ? '/art/portraits/ww2-f1.jpg' : age === 'o' ? '/art/portraits/ww2-m2.jpg' : '/art/portraits/ww2-m1.jpg';
  if (era === 'medieval') {
    if (sex === 'f') return age === 'y' || age === 'c' ? '/art/portraits/medieval-f2.jpg' : '/art/portraits/medieval-f1.jpg';
    return age === 'c' ? '/art/portraits/medieval-m4.jpg' : age === 'o' ? '/art/portraits/medieval-m1.jpg' : age === 'y' ? '/art/portraits/medieval-m2.jpg' : '/art/portraits/medieval-m3.jpg';
  }
  if (sex === 'f') return '/art/portraits/earlymodern-f1.jpg';
  return age === 'o' ? '/art/portraits/earlymodern-m3.jpg' : age === 'y' || age === 'c' ? '/art/portraits/earlymodern-m2.jpg' : '/art/portraits/earlymodern-m1.jpg';
}

/** leader portrait for nations without characters (WW2) */
export function leaderPortrait(era: string, tag: string): string {
  if (era === 'modern') { const h = hash(tag); return `/art/portraits/modern-m-${h < 0.5 ? 'a' : 'o'}-${h % 0.5 < 0.25 ? 1 : 2}.jpg`; }
  if (era === 'ww2' || era === 'ww1') { const h = hash(tag); return `/art/portraits/ww2-m-${h < 0.5 ? 'a' : 'o'}-${h % 0.5 < 0.25 ? 1 : 2}.jpg`; }
  const set = PORTRAITS[era as Era] ?? PORTRAITS.medieval;
  return `/art/portraits/${set.m[Math.floor(hash(tag) * set.m.length)]}.jpg`;
}

const EVENT_RULES: [RegExp, string][] = [
  [/peste|pestilencia|fiebre|epidemia|invierno|hambruna|volc[aá]n|desastre/i, 'disaster'],
  [/revuelta|huelga|alzamiento|rebel|saqueo/i, 'revolt'],
  [/cosecha|banquer|comercio|torneo|riqueza|oro/i, 'prosperity'],
  [/concilio|papa|tesis|investidura|cruzada|iglesia|estandarte/i, 'faith'],
  [/pacto|tratado|acuerdo|uni[oó]n|garant[ií]a|capitulaciones|alianza|paz|eje/i, 'peace'],
  [/conquista|expedici[oó]n|nuevo mundo|per[uú]|tenochtitlan|santa fe/i, 'explore'],
  [/herencia|corona|muerte|rey|reina|sucesi[oó]n|boda|matrimonio/i, 'court'],
  [/campa[ñn]a|invasi[oó]n|ocupaci[oó]n|cerco|guerra|infamia|dantzig|anschluss|ej[eé]rcito|saga/i, 'war'],
];

export function eventArt(era: string, title: string, text = ''): string {
  let cat = 'court';
  for (const [re, c] of EVENT_RULES) if (re.test(title) || re.test(text)) { cat = c; break; }
  return `/art/events/${era}-${cat}.jpg`;
}

export const peaceArt = (era: string) => `/art/events/${era}-peace.jpg`;
export const warArt = (era: string) => `/art/events/${era}-war.jpg`;

const LOADING: Record<string, string> = { med1066: 'med1066', valdoria: 'valdoria', em1492: 'em1492', ww1936: 'ww1936', ww1939: 'ww1939', ww1914: 'ww1914', spain1936: 'spain1936', mod2014: 'mod2014' };
/** art set of a game: scenarios can override the era (1914 → 'ww1', 2014 → 'modern') */
export const artEra = (s: { era: Era; options?: { artEra?: string } }) => (s.options?.artEra ?? s.era) as string;
export const loadingArt = (scenarioId: string, era: string) => (LOADING[scenarioId] ? `/art/loading/${LOADING[scenarioId]}.jpg` : `/art/era-${era}.jpg`);

export const TIPS: Record<string, string[]> = {
  ww1: [
    'Las trincheras devoran divisiones: la artillería pesada abre brecha antes del asalto.',
    'El bloqueo naval estrangula a las potencias centrales lentamente: cuida tus suministros.',
    'Un aliado que entra tarde en la guerra puede decidirla: cultiva a los neutrales.',
  ],
  modern: [
    'Los drones baratos cambian la guerra de desgaste: invierte en Aviación e IA.',
    'La carrera de la IA militar no la gana quien llega primero, sino quien la controla.',
    'Las sanciones y la energía pesan tanto como los tanques: vigila tus recursos.',
  ],
  medieval: [
    'Un buen matrimonio vale más que un ejército: las alianzas por sangre pueden darte un trono.',
    'Los vasallos descontentos conspiran. Vigila su opinión antes de exigir más levas.',
    'Los ingenios de asedio acortan mucho la toma de fortalezas.',
    'Un heredero menor de edad debilita el reino: protege la sucesión.',
  ],
  earlymodern: [
    'La estabilidad baja multiplica las revueltas. Gasta en ella antes de ir a la guerra.',
    'Los centros de comercio (★) concentran la riqueza: controlarlos llena las arcas.',
    'La agresividad alta une a tus vecinos contra ti.',
    'La artillería es lenta, pero decide los asedios.',
  ],
  ww2: [
    'Sin suministro, hasta las divisiones acorazadas se detienen. Vigila los cercos.',
    'El bloqueo naval corta el comercio de recursos: el petróleo es la sangre de la guerra.',
    'Reparte la industria civil y militar: sin fábricas no hay tanques mañana.',
    'Un frente ancho y fino se rompe; concentra tus blindados.',
  ],
};

/** portraits a player can choose for a founder, by art set and sex */
export function portraitChoices(art: string, female: boolean): string[] {
  const sex = female ? 'f' : 'm';
  if (art === 'modern') return ['y', 'a', 'o'].flatMap((a) => [1, 2].map((v) => `/art/portraits/modern-${sex}-${a}-${v}.jpg`));
  if (art === 'ww2' || art === 'ww1') return ['y', 'a', 'o'].flatMap((a) => [1, 2].map((v) => `/art/portraits/ww2-${sex}-${a}-${v}.jpg`));
  const era = art === 'earlymodern' ? 'earlymodern' : 'medieval';
  return ['w', 'e', 'i'].flatMap((c) => ['y', 'a', 'o'].flatMap((a) => ['', '-2'].map((v) => `/art/portraits/${era}-${c}-${sex}-${a}${v}.jpg`)));
}
