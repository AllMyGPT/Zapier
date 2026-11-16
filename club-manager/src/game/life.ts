import type { GameState } from './types';
import { Rng } from './rng';
import { fmtMoney, news, rngFor } from './season';
import { makePlayer } from './data';
import { genName } from './names';

/* ============================================================================
   Personal life: an optional life-sim layer on top of the manager career.
   Home, car, dating, partner, marriage, affairs, children growing up.
   Everything here is fictional and non-explicit.
   ========================================================================== */

export type Interest = 'mujeres' | 'hombres' | 'ambos';
export type Stage = 'conocida' | 'citas' | 'pareja' | 'prometida' | 'casada' | 'amante' | 'ex';
export interface Person { id: number; name: string; gender: 'f' | 'm'; born: number; job: string; img: string; traits: string[]; likes: string[]; affinity: number; stage: Stage; met: number; lastDate: number; since?: number; lastFlirt?: number; exRole?: 'pareja' | 'mujer'; alimonyUntil?: number; look?: 0 | 1 }
export interface Child { id: number; name: string; gender: 'f' | 'm'; born: number; talent: number; studies: number; happiness: number; path?: 'fútbol' | 'estudios' | 'arte'; playerId?: number }
export interface LifeLog { day: number; season: number; text: string; kind: 'love' | 'family' | 'home' | 'money' | 'scandal' | 'health' }
export interface LifeState {
  enabled: true; interest: Interest; born: number;
  savings: number; happiness: number; stress: number; health: number;
  home: string; car: string; people: Person[]; children: Child[];
  pregnancyDue?: number; tryingForBaby?: boolean; nights?: number; wedding?: { personId: number; day: number }; nextId: number; log: LifeLog[]; lastPartnerAct?: number;
}

export const HOMES = [
  { id: 'piso', name: 'Piso de alquiler', price: 0, weekly: 450, happy: 0, img: 'home-flat', desc: 'Dos habitaciones cerca del estadio. Funcional, sin lujos.' },
  { id: 'atico', name: 'Ático en el centro', price: 650_000, weekly: 300, happy: 6, img: 'home-penthouse', desc: 'Terraza con vistas a la ciudad. Perfecto para impresionar.' },
  { id: 'chalet', name: 'Chalet con piscina', price: 1_400_000, weekly: 600, happy: 10, img: 'home-villa', desc: 'Jardín, piscina y sitio para una familia.' },
  { id: 'mansion', name: 'Mansión de lujo', price: 4_500_000, weekly: 2_000, happy: 16, img: 'home-mansion', desc: 'Urbanización exclusiva, gimnasio y cine privado.' },
];
export const CARS = [
  { id: 'compacto', name: 'Compacto urbano', price: 0, weekly: 60, happy: 0, img: 'car-compact', desc: 'Te lleva y te trae.' },
  { id: 'berlina', name: 'Berlina premium', price: 70_000, weekly: 150, happy: 3, img: 'car-sedan', desc: 'Elegante y cómoda.' },
  { id: 'deportivo', name: 'Deportivo', price: 180_000, weekly: 300, happy: 6, img: 'car-sports', desc: 'Se gira la gente a mirarlo.' },
  { id: 'super', name: 'Superdeportivo', price: 420_000, weekly: 600, happy: 9, img: 'car-super', desc: 'Una bestia. La prensa rosa lo adora.' },
];
/** Date plans. minAff: affinity needed before she accepts; intimate: the night may end at one of your places;
 *  exposed: paparazzi territory (an affair there can be photographed). */
export interface Venue { id: string; name: string; cost: number; img: string; fame: number; minAff?: number; intimate?: boolean; exposed?: boolean; flirt: string }
export const VENUES: Venue[] = [
  { id: 'cine', name: 'Cine y cena informal', cost: 120, img: 'venue-cinema', fame: 0, flirt: 'Compartís palomitas y alguna mirada cómplice en la oscuridad.' },
  { id: 'salsa', name: 'Noche de salsa', cost: 150, img: 'venue-salsa', fame: 0, exposed: true, flirt: 'Bailáis muy pegados; la canción termina y ninguno quiere soltarse.' },
  { id: 'playa', name: 'Paseo al atardecer por la playa', cost: 200, img: 'venue-beach', fame: 0, flirt: 'Descalzos en la orilla, el primer beso llega con el último rayo de sol.' },
  { id: 'casa', name: 'Cena íntima en tu casa', cost: 300, img: 'venue-home', fame: 0, minAff: 30, intimate: true, flirt: 'Cocinas tú, ella elige la música y la sobremesa se alarga.' },
  { id: 'azotea', name: 'Cócteles en una azotea', cost: 400, img: 'venue-rooftop', fame: 0, exposed: true, flirt: 'Brindáis con la ciudad a vuestros pies; las indirectas suben de tono.' },
  { id: 'restaurante', name: 'Restaurante con estrella', cost: 600, img: 'venue-restaurant', fame: 0, exposed: true, flirt: 'Velas, vino y una conversación que se vuelve cada vez más personal.' },
  { id: 'spa', name: 'Spa privado para dos', cost: 1_500, img: 'venue-spa', fame: 0, minAff: 40, intimate: true, flirt: 'Masajes, vapor y una piscina iluminada con velas solo para vosotros.' },
  { id: 'suite', name: 'Noche en una suite de hotel', cost: 2_500, img: 'venue-suite', fame: 0, minAff: 55, intimate: true, flirt: 'Champán, pétalos en la cama y el cartel de «No molestar» en la puerta.' },
  { id: 'gala', name: 'Gala benéfica de alfombra roja', cost: 3_000, img: 'venue-gala', fame: 1, exposed: true, flirt: 'Todos los flashes son para vosotros; ella no se separa de tu brazo.' },
  { id: 'viaje', name: 'Escapada romántica de fin de semana', cost: 8_000, img: 'venue-trip', fame: 0, minAff: 45, intimate: true, flirt: 'Un fin de semana lejos del fútbol y del móvil.' },
  { id: 'yate', name: 'Paseo en yate al atardecer', cost: 12_000, img: 'venue-yacht', fame: 0, minAff: 35, intimate: true, exposed: true, flirt: 'Champán en cubierta, baño en una cala y el atardecer solo para dos.' },
];
const TRAITS = ['romántica', 'ambiciosa', 'aventurera', 'familiar', 'celosa', 'divertida', 'independiente', 'glamurosa'];
const JOBS_F = ['abogada', 'presentadora de televisión', 'galerista', 'bailarina', 'arquitecta', 'modelo', 'periodista deportiva', 'cirujana', 'chef', 'diseñadora de moda',
  'pianista', 'instructora de surf', 'modelo internacional', 'profesora de baile', 'empresaria del arte', 'creadora de viajes', 'sumiller', 'diseñadora de joyas', 'tenista profesional', 'enóloga'];
const JOBS_M = ['arquitecto', 'piloto', 'médico', 'fotógrafo'];
/** Portrait pool: generated fictional adults. f* women, m* men. */
export const PORTRAITS: Record<'f' | 'm', string[]> = { f: Array.from({ length: 21 }, (_, i) => `f${i + 1}`), m: ['m1', 'm2', 'm3', 'm4'] };
/** Women have a second look (other outfit): the file is `<portrait>-b`. The last portrait is the voluptuous one. */
export const VOLUPTUOUS = 'f21';
export const ALIMONY_WEEKLY = 1_800;
/** The picture shown for a person, following the outfit they are wearing today. */
export const lookImage = (p: Person) => (p.look && hasAltLook(p) ? `${p.img}-b` : p.img);
/** Portraits whose second outfit (`<portrait>-b.webp`) is already in public/art/life. */
export const ALT_LOOKS = new Set<string>(Array.from({ length: 21 }, (_, i) => `f${i + 1}`));
export const hasAltLook = (p: Person) => p.gender === 'f' && ALT_LOOKS.has(p.img);
const NAMES_F = ['Lucía', 'Valentina', 'Irene', 'Daniela', 'Mei', 'Carla', 'Sofía', 'Elena', 'Marta', 'Chloé',
  'Valeria', 'Larissa', 'Freya', 'Camila', 'Amara', 'Gisela', 'Yuna', 'Giulia', 'Maeve', 'Carmen', 'Candela'];
const NAMES_M = ['Álex', 'Marco', 'Hugo', 'Leo', 'Daniel', 'Iker'];
const SURN = ['Ferrer', 'Navarro', 'Ríos', 'Montero', 'Vidal', 'Serrano', 'Castell', 'Lozano', 'Duarte', 'Ibáñez', 'Rey', 'Molina'];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Absolute day across seasons (the game's day counter restarts every July). */
export const now = (gs: GameState) => gs.season * 365 + gs.day;
const L = (gs: GameState) => gs.life as LifeState | undefined;
export const lifeOn = (gs: GameState) => !!gs.life?.enabled;
const log = (gs: GameState, kind: LifeLog['kind'], text: string) => { const l = L(gs)!; l.log.unshift({ day: gs.day, season: gs.season, text, kind }); if (l.log.length > 80) l.log.length = 80; };
export const ageOf = (gs: GameState, born: number) => gs.season - born;
export const managerWeekly = (gs: GameState) => Math.round((3_000 + Math.pow(gs.clubs[gs.manager.clubId].reputation / 10, 3.6) * 28) / 100) * 100;

export function initLife(gs: GameState, interest: Interest, managerAge = 38) {
  gs.life = { enabled: true, interest, born: gs.season - managerAge, savings: 250_000, happiness: 60, stress: 30, health: 85, home: 'piso', car: 'compacto', people: [], children: [], nextId: 1, log: [] } satisfies LifeState;
  log(gs, 'home', 'Llegas a la ciudad con dos maletas y un piso de alquiler cerca del estadio.');
}

function newPerson(gs: GameState, rng: Rng): Person | null {
  const l = L(gs)!;
  const gender: 'f' | 'm' = l.interest === 'mujeres' ? 'f' : l.interest === 'hombres' ? 'm' : rng.chance(0.75) ? 'f' : 'm';
  const used = new Set(l.people.map(p => p.img));
  const free = PORTRAITS[gender].filter(x => !used.has(x));
  if (!free.length) return null;
  const img = rng.pick(free);
  const idx = PORTRAITS[gender].indexOf(img);
  const name = `${(gender === 'f' ? NAMES_F : NAMES_M)[idx % (gender === 'f' ? NAMES_F.length : NAMES_M.length)]} ${rng.pick(SURN)}`;
  const traits = img === VOLUPTUOUS ? ['voluptuosa', 'ardiente'] : rng.shuffle(TRAITS.slice()).slice(0, 2);
  const p: Person = { id: l.nextId++, name, gender, born: gs.season - rng.int(26, 38), job: img === VOLUPTUOUS ? 'bailarina de salsa y guía de tango' : (gender === 'f' ? JOBS_F : JOBS_M)[idx % (gender === 'f' ? JOBS_F.length : JOBS_M.length)], img, traits, likes: rng.shuffle(VENUES.map(v => v.id)).slice(0, 2), affinity: rng.int(15, 35), stage: 'conocida', met: now(gs), lastDate: now(gs) - 7, look: 0 };
  l.people.push(p);
  return p;
}

const partner = (l: LifeState) => l.people.find(p => p.stage === 'pareja' || p.stage === 'prometida' || p.stage === 'casada');
export const lifePartner = (gs: GameState) => (L(gs) ? partner(L(gs)!) : undefined);

function spend(gs: GameState, amount: number): boolean {
  const l = L(gs)!; if (l.savings < amount) return false; l.savings -= amount; return true;
}

/** The affair, the girl you are dating or an ex becomes your official partner. If you already have one, you leave her first. */
export function makePartner(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId);
  if (!p || p.stage === 'pareja' || p.stage === 'prometida' || p.stage === 'casada') return '';
  const first = p.name.split(' ')[0];
  if (p.affinity < 60) return `${first} quiere estar segura antes de dar ese paso (necesitas afinidad 60).`;
  const sp = partner(l);
  const leaving = sp && sp.id !== p.id;
  const left = leaving ? ` ${breakUp(gs, sp!.id)}` : '';
  p.stage = 'pareja'; p.since = now(gs); p.exRole = undefined; p.alimonyUntil = undefined;
  l.happiness = clamp(l.happiness + 10, 0, 100);
  log(gs, 'love', `${p.name} es ahora tu pareja oficial.${leaving ? ` Dejas a ${sp!.name}.` : ''}`);
  news(gs, 'info', `El míster y ${first}, pareja oficial`, leaving ? `Tras separarse de ${sp!.name.split(' ')[0]}.` : 'Nueva pareja del entrenador.');
  return `${first} es ahora tu pareja oficial.${left}`;
}

/** Ex-wife or ex: a second chance if the bond is still strong. */
export const reconcile = (gs: GameState, personId: number) => makePartner(gs, personId);

export const PARTNER_ACTS: { id: 'mensaje' | 'masaje' | 'flores' | 'cena' | 'velada' | 'escapada'; label: string; cost: number }[] = [
  { id: 'mensaje', label: 'Mensaje cariñoso', cost: 0 },
  { id: 'masaje', label: 'Masaje en casa', cost: 0 },
  { id: 'flores', label: 'Flores y una nota (1.500 €)', cost: 1_500 },
  { id: 'cena', label: 'Cena a la luz de las velas (400 €)', cost: 400 },
  { id: 'velada', label: 'Velada romántica en casa (800 €)', cost: 800 },
  { id: 'escapada', label: 'Escapada de dos días (6.000 €)', cost: 6_000 },
];
/** Time together with the partner: romantic and sensual, always fading before anything explicit. */
export function partnerAction(gs: GameState, kind: (typeof PARTNER_ACTS)[number]['id']): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return 'Ahora mismo no tienes pareja.';
  if (l.lastPartnerAct != null && now(gs) - l.lastPartnerAct < 1) return 'Ya habéis compartido un momento hoy. Mañana más.';
  const act = PARTNER_ACTS.find(a => a.id === kind)!;
  if (act.cost && !spend(gs, act.cost)) return 'No te llega para ese plan.';
  l.lastPartnerAct = now(gs);
  const first = sp.name.split(' ')[0];
  const T: Record<typeof kind, { text: string; aff: number; happy: number; stress: number }> = {
    mensaje: { text: `Le escribes un mensaje cariñoso al despertar. ${first} responde con un corazón y ganas de verte esta noche.`, aff: 3, happy: 1, stress: 0 },
    masaje: { text: `Masaje lento con aceite de almendra en el salón. ${first} se relaja, cierra los ojos y acaba riendo entre tus manos.`, aff: 4, happy: 2, stress: -8 },
    flores: { text: `Un ramo de flores y una nota: «Me encanta cómo me miras». ${first} sonríe toda la tarde.`, aff: 6, happy: 3, stress: -2 },
    cena: { text: `Cena a la luz de las velas en un sitio tranquilo. Se inclina hacia ti para decirte algo que solo tú escuchas.`, aff: 5, happy: 4, stress: -3 },
    velada: { text: `Velada en casa: música suave, velas y una conversación que se alarga hasta la madrugada. Os quedáis abrazados hasta que amanece.`, aff: 8, happy: 6, stress: -6 },
    escapada: { text: `Dos días lejos de todo: hotel con vistas al mar y la promesa de no mirar el móvil. Volvéis como si tuvierais veinte años.`, aff: 10, happy: 8, stress: -10 },
  };
  const t = T[kind];
  sp.affinity = clamp(sp.affinity + t.aff, 0, 100); sp.lastDate = now(gs);
  l.happiness = clamp(l.happiness + t.happy, 0, 100); l.stress = clamp(l.stress + t.stress, 0, 100);
  log(gs, 'love', `${act.label} con ${sp.name}. ${t.text}`);
  return t.text;
}

/** Choose the outfit a woman wears in the next scene. */
export function toggleLook(gs: GameState, personId: number): void {
  const p = L(gs)?.people.find(x => x.id === personId); if (p && p.gender === 'f') p.look = p.look ? 0 : 1;
}

// ---------------- actions ----------------
export function goOut(gs: GameState): string {
  const l = L(gs)!; if (!spend(gs, 500)) return 'No te llega para salir esta noche.';
  l.nights = (l.nights ?? 0) + 1;
  const rng = rngFor(gs, `night${l.nights}`);
  l.stress = clamp(l.stress - 6, 0, 100); l.happiness = clamp(l.happiness + 2, 0, 100);
  const fame = gs.manager.reputation;
  if (rng.chance(0.45 + fame / 300)) { const p = newPerson(gs, rng); if (p) { log(gs, 'love', `Conoces a ${p.name} (${p.job}) en una noche por la ciudad.`); return `Conoces a ${p.name}, ${p.job}. Hay química: guárdate su número.`; } }
  return 'Una noche agradable con amigos. Desconectas del fútbol.';
}

export function date(gs: GameState, personId: number, venueId: string): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); const v = VENUES.find(x => x.id === venueId);
  if (!p || !v || p.stage === 'ex') return 'No es posible.';
  const first = p.name.split(' ')[0];
  if (now(gs) - p.lastDate < 5) return `${first} prefiere esperar unos días a la próxima cita.`;
  if (v.minAff && p.affinity < v.minAff) return `${first} sonríe, pero aún es pronto para ese plan (necesitas afinidad ${v.minAff}).`;
  if (!spend(gs, v.cost)) return 'No tienes ahorros suficientes para ese plan.';
  const rng = rngFor(gs, `date${p.id}:${p.lastDate}`);
  const home = HOMES.find(h => h.id === l.home)!, car = CARS.find(c => c.id === l.car)!;
  let gain = 6 + (p.likes.includes(v.id) ? 8 : 0) + rng.int(-4, 6) + (p.traits.includes('ardiente') && v.intimate ? 4 : 0) + (p.traits.includes('glamurosa') && (v.id === 'gala' || v.id === 'yate' || v.id === 'azotea' || car.happy >= 6) ? 4 : 0)
    + (p.traits.includes('romántica') && (v.id === 'playa' || v.id === 'viaje' || v.id === 'spa') ? 4 : 0) + (p.traits.includes('aventurera') && (v.id === 'salsa' || v.id === 'yate') ? 4 : 0)
    + (v.id === 'casa' ? Math.round(home.happy / 2) - 2 : 0) + Math.round((home.happy + car.happy) / 6) + (v.intimate ? 3 : 0);
  if (p.traits.includes('ambiciosa') && gs.manager.reputation > 70) gain += 3;
  p.affinity = clamp(p.affinity + gain, 0, 100); p.lastDate = now(gs);
  if (p.stage === 'conocida') p.stage = 'citas';
  l.happiness = clamp(l.happiness + 4, 0, 100); l.stress = clamp(l.stress - 5, 0, 100);
  if (v.fame) { gs.manager.reputation = Math.min(100, gs.manager.reputation + 0.5); news(gs, 'info', `El míster, en la alfombra roja con ${p.name}`, 'La prensa rosa se hace eco de la pareja de moda.'); }
  const sp = partner(l);
  // a night together: fade to black, but it changes things
  let night = '';
  if (v.intimate && gain >= 10 && p.affinity >= (v.minAff ?? 40) + 10) {
    night = ` Pasáis la noche juntos.`;
    l.happiness = clamp(l.happiness + 5, 0, 100); l.stress = clamp(l.stress - 6, 0, 100);
    if (sp && sp.id !== p.id && p.stage !== 'amante') { p.stage = 'amante'; p.since = now(gs); log(gs, 'love', `Lo que empezó como una cita con ${p.name} se convierte en una aventura secreta.`); }
  }
  // a lover in a public place is a photo waiting to happen
  if (p.stage === 'amante' && v.exposed && sp && rng.chance(0.18 + gs.manager.reputation / 800)) {
    log(gs, 'love', `${v.name} con ${p.name}. ${v.flirt}`);
    return caught(gs, p, `Un paparazzi os fotografía en: ${v.name.toLowerCase()}.`);
  }
  const mood = gain >= 14 ? '¡Una cita perfecta!' : gain >= 8 ? 'Buena cita.' : 'Cita algo fría.';
  log(gs, 'love', `${v.name} con ${p.name}. ${gain >= 8 ? v.flirt : 'No termina de surgir la chispa.'}${night}`);
  return [mood, gain >= 8 ? v.flirt : '', night.trim(), `Afinidad con ${first}: ${Math.round(p.affinity)}.`].filter(Boolean).join(' ');
}

/** An affair comes out: the partner finds out, the board and the fans are not amused. */
function caught(gs: GameState, lover: Person, how: string): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return how;
  sp.affinity = clamp(sp.affinity - 60, 0, 100); lover.stage = 'ex';
  log(gs, 'scandal', `${sp.name} descubre tu aventura con ${lover.name}. ${how}`);
  news(gs, 'board', `Escándalo: el míster, cazado con ${lover.name}`, `${how} Las fotos incendian la ciudad. La directiva no está contenta.`);
  gs.manager.board = clamp(gs.manager.board - 8, 0, 100); gs.clubs[gs.manager.clubId].fans = clamp(gs.clubs[gs.manager.clubId].fans - 5, 5, 100);
  l.stress = clamp(l.stress + 25, 0, 100);
  if (sp.affinity < 30) breakUp(gs, sp.id);
  return `¡Escándalo! ${how} ${sp.name.split(' ')[0]} se ha enterado.`;
}

const FLIRTS = ['Le mandas un mensaje a medianoche: «No dejo de pensar en la cena del otro día».', 'Le escribes que el vestido de anoche debería estar prohibido.', 'Un audio con voz ronca después del partido: «¿Celebramos la victoria a solas?».', 'Le propones repetir, «pero esta vez sin prisas».', 'Le dices que tienes una sorpresa y que solo le darás una pista: champán.'];
/** Late-night messages: cheap affinity, but a partner may see the phone. */
export function flirtMessage(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p || p.stage === 'ex') return '';
  const first = p.name.split(' ')[0];
  if (p.lastFlirt != null && now(gs) - p.lastFlirt < 3) return `${first} aún no ha contestado al último mensaje. Dale un respiro.`;
  p.lastFlirt = now(gs);
  const rng = rngFor(gs, `flirt${p.id}:${now(gs)}`);
  const line = rng.pick(FLIRTS);
  const sp = partner(l);
  if (sp && sp.id !== p.id && rng.chance(0.08 + (sp.traits.includes('celosa') ? 0.1 : 0))) {
    sp.affinity = clamp(sp.affinity - 15, 0, 100); l.stress = clamp(l.stress + 8, 0, 100);
    log(gs, 'love', `${sp.name} ve en tu móvil los mensajes a ${p.name}. Bronca monumental.`);
    return `${sp.name.split(' ')[0]} ha visto tus mensajes con ${first}. Afinidad con ella −15.`;
  }
  const g = p.affinity < 25 ? rng.int(-2, 2) : p.affinity > 70 ? rng.int(0, 2) : rng.int(1, 4) + (p.traits.includes('divertida') || p.traits.includes('aventurera') || p.traits.includes('ardiente') ? 1 : 0);
  p.affinity = clamp(p.affinity + g, 0, 100);
  return g > 0 ? `${line} ${first} responde con un emoji de fuego. Afinidad ${Math.round(p.affinity)}.` : g === 0 ? `${line} ${first} contesta con un «jaja» y poco más.` : `${line} ${first} te deja en visto… quizá fue demasiado pronto.`;
}

export function gift(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p) return '';
  if (!spend(gs, 2_500)) return 'No te llega para un buen regalo.';
  p.affinity = clamp(p.affinity + (p.traits.includes('glamurosa') ? 9 : 5), 0, 100);
  return `A ${p.name.split(' ')[0]} le encanta el regalo.`;
}

export function askOut(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p) return '';
  const current = partner(l);
  const rng = rngFor(gs, `ask${p.id}${now(gs)}`);
  if (current && current.id !== p.id) {
    // already committed: this becomes an affair
    if (p.affinity < 45) return `${p.name.split(' ')[0]} sabe que tienes pareja y te para los pies.`;
    p.stage = 'amante'; p.since = now(gs); log(gs, 'love', `Empiezas una relación secreta con ${p.name}.`);
    return `Empiezas una aventura secreta con ${p.name.split(' ')[0]}. Cuidado con la prensa…`;
  }
  if (p.stage === 'conocida' || p.stage === 'citas') {
    if (p.affinity >= 55 && rng.chance(0.4 + p.affinity / 200)) { p.stage = 'pareja'; p.since = now(gs); log(gs, 'love', `Empiezas a salir oficialmente con ${p.name}.`); l.happiness = clamp(l.happiness + 10, 0, 100); return `¡${p.name.split(' ')[0]} dice que sí! Sois pareja.`; }
    p.stage = 'citas'; p.affinity = clamp(p.affinity - 4, 0, 100); return `${p.name.split(' ')[0]} quiere ir más despacio. Seguid quedando.`;
  }
  return '';
}

export function propose(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p || p.stage !== 'pareja') return '';
  if (p.since != null && now(gs) - p.since < 60) return 'Es pronto: lleváis poco tiempo juntos.';
  if (!spend(gs, 15_000)) return 'Necesitas 15.000 € para el anillo.';
  const rng = rngFor(gs, `prop${p.id}${now(gs)}`);
  if (p.affinity >= 75 && rng.chance(0.55 + p.affinity / 300 + (p.traits.includes('familiar') ? 0.15 : 0))) {
    p.stage = 'prometida'; l.wedding = { personId: p.id, day: now(gs) + 45 };
    log(gs, 'love', `Pides matrimonio a ${p.name}… ¡y dice que sí!`); l.happiness = clamp(l.happiness + 15, 0, 100);
    news(gs, 'info', `¡El míster se casa!`, `${p.name} y el entrenador anuncian su compromiso.`);
    return `¡${p.name.split(' ')[0]} acepta! La boda será en unas semanas.`;
  }
  p.affinity = clamp(p.affinity - 15, 0, 100); log(gs, 'love', `${p.name} te pide tiempo antes de dar el paso.`);
  return `${p.name.split(' ')[0]} no está preparada todavía. Golpe duro.`;
}

export function breakUp(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p) return '';
  const wasMarried = p.stage === 'casada';
  p.stage = 'ex'; p.affinity = 10;
  if (wasMarried) {
    const cost = Math.round(l.savings * 0.4); l.savings -= cost;
    p.exRole = 'mujer'; p.alimonyUntil = gs.season + 3; // ex-mujer: pensión durante tres temporadas
    log(gs, 'family', `Divorcio de ${p.name}. Te cuesta ${fmtMoney(cost)} y una pensión de ${fmtMoney(ALIMONY_WEEKLY)}/sem.`); news(gs, 'info', 'El míster se divorcia', 'La separación acapara portadas.'); gs.manager.board = clamp(gs.manager.board - 3, 0, 100);
  } else { p.exRole = 'pareja'; log(gs, 'love', `Lo dejas con ${p.name}.`); }
  l.happiness = clamp(l.happiness - (wasMarried ? 18 : 8), 0, 100); l.stress = clamp(l.stress + 10, 0, 100); l.tryingForBaby = false;
  return wasMarried ? 'Divorcio firmado. Toca rehacerse.' : 'Ruptura. Duele, pero sigues adelante.';
}

export function buy(gs: GameState, kind: 'home' | 'car', id: string): string {
  const l = L(gs)!; const list = kind === 'home' ? HOMES : CARS; const item = list.find(x => x.id === id)!;
  const cur = list.find(x => x.id === (kind === 'home' ? l.home : l.car))!;
  if (cur.id === item.id) return 'Ya es tuyo.';
  const refund = Math.round(cur.price * 0.8);
  if (l.savings + refund < item.price) return `Te faltan ${fmtMoney(item.price - l.savings - refund)}.`;
  l.savings += refund - item.price;
  if (kind === 'home') l.home = item.id; else l.car = item.id;
  l.happiness = clamp(l.happiness + 5, 0, 100);
  log(gs, 'home', `${kind === 'home' ? 'Te mudas a' : 'Estrenas'}: ${item.name}.`);
  return `${item.name}: ¡estreno!${refund ? ` (vendes lo anterior por ${fmtMoney(refund)})` : ''}`;
}

export function familyTime(gs: GameState): string {
  const l = L(gs)!; l.stress = clamp(l.stress - 10, 0, 100); l.happiness = clamp(l.happiness + 4, 0, 100);
  const sp = partner(l); if (sp) sp.affinity = clamp(sp.affinity + 4, 0, 100);
  for (const c of l.children) c.happiness = clamp(c.happiness + 6, 0, 100);
  return 'Un día entero en familia. Recargas pilas.';
}

export function setTrying(gs: GameState, on: boolean) { const l = L(gs)!; l.tryingForBaby = on; }

export function childPath(gs: GameState, childId: number, path: Child['path']) {
  const c = L(gs)!.children.find(x => x.id === childId); if (c) c.path = path;
}

// ---------------- simulation ----------------
/** Weekly life tick: income, costs, moods, relationships, family, scandals. Returns team-morale delta from the manager's mood. */
export function lifeWeekly(gs: GameState): number {
  const l = L(gs); if (!l?.enabled || !gs.manager.clubId) return 0;
  const rng = rngFor(gs, 'life');
  const home = HOMES.find(h => h.id === l.home)!, car = CARS.find(c => c.id === l.car)!;
  const sp = partner(l);
  const kidsCost = l.children.length * 1_200 + (sp ? 600 : 0);
  const alimony = l.people.filter(p => p.exRole === 'mujer' && (p.alimonyUntil ?? 0) >= gs.season).length * ALIMONY_WEEKLY;
  l.savings += managerWeekly(gs) - home.weekly - car.weekly - kidsCost - alimony;
  // moods from work and life
  const lr = gs.lastResults ?? [];
  const losing = lr.slice(-3).filter(x => x < 0).length;
  l.stress = clamp(l.stress + losing * 2 - 2 + (gs.manager.board < 30 ? 3 : 0) - (sp ? 1 : 0), 0, 100);
  const base = 45 + home.happy + car.happy + (sp ? 12 : -4) + l.children.length * 4 - l.stress * 0.25;
  l.happiness = clamp(l.happiness + (base - l.happiness) * 0.15, 0, 100);
  l.health = clamp(l.health + (l.stress > 70 ? -1.2 : 0.3) - (ageOf(gs, l.born) > 55 ? 0.2 : 0), 10, 100);
  if (l.health < 35 && rng.chance(0.1)) { log(gs, 'health', 'El médico te obliga a bajar el ritmo: estrés y poco descanso.'); news(gs, 'info', 'El míster, de baja unos días', 'Problemas de salud por estrés.'); l.stress = clamp(l.stress - 20, 0, 100); }
  // relationships drift
  for (const p of l.people) {
    if (p.stage === 'ex') continue;
    const gap = now(gs) - p.lastDate;
    const decay = p.stage === 'casada' ? 0.6 : 1.2;
    if (gap > 21) p.affinity = clamp(p.affinity - decay, 0, 100);
    if ((p.stage === 'pareja' || p.stage === 'prometida') && p.affinity < 25 && rng.chance(0.2)) { p.stage = 'ex'; log(gs, 'love', `${p.name} te deja: dice que el fútbol siempre va primero.`); l.happiness = clamp(l.happiness - 12, 0, 100); }
  }
  // affairs can be discovered
  const lovers = l.people.filter(p => p.stage === 'amante');
  if (lovers.length && sp) {
    const risk = 0.04 * lovers.length + gs.manager.reputation / 2500 + (sp.traits.includes('celosa') ? 0.04 : 0);
    if (rng.chance(risk)) {
      caught(gs, rng.pick(lovers), 'Una revista del corazón publica las fotos.');
    } else if (rng.chance(0.3)) for (const lv of lovers) { lv.affinity = clamp(lv.affinity + 2, 0, 100); }
  }
  // meeting people now and then when single
  if (!sp && rng.chance(0.06 + gs.manager.reputation / 1500)) { const p = newPerson(gs, rng); if (p) log(gs, 'love', `En un evento del club conoces a ${p.name}, ${p.job}.`); }
  // wedding day
  if (l.wedding && now(gs) >= l.wedding.day) {
    const p = l.people.find(x => x.id === l.wedding!.personId);
    const cost = 60_000 + (HOMES.findIndex(h => h.id === l.home)) * 60_000;
    l.savings -= cost;
    if (p && p.stage === 'prometida') { p.stage = 'casada'; log(gs, 'family', `Te casas con ${p.name}. Boda de ${fmtMoney(cost)}.`); news(gs, 'info', '¡Boda del año!', `El entrenador y ${p.name} se dan el «sí, quiero».`); l.happiness = clamp(l.happiness + 20, 0, 100); }
    l.wedding = undefined;
  }
  // children
  if (sp?.stage === 'casada' && l.tryingForBaby && !l.pregnancyDue && rng.chance(0.06)) { l.pregnancyDue = now(gs) + 270; log(gs, 'family', `¡${sp.name} y tú vais a ser padres!`); news(gs, 'info', 'El míster será padre', '¡Enhorabuena!'); }
  if (l.pregnancyDue != null && now(gs) >= l.pregnancyDue) birth(gs, rng);
  return l.happiness > 72 ? 0.6 : l.stress > 75 ? -0.8 : 0;
}

function birth(gs: GameState, rng: Rng) {
  const l = L(gs)!; l.pregnancyDue = undefined;
  const gender: 'f' | 'm' = rng.chance(0.5) ? 'f' : 'm';
  const name = rng.pick(gender === 'f' ? ['Martina', 'Lola', 'Vega', 'Olivia', 'Jimena'] : ['Mateo', 'Leo', 'Hugo', 'Marco', 'Bruno']);
  const c: Child = { id: l.nextId++, name, gender, born: gs.season, talent: rng.int(20, 95), studies: rng.int(20, 95), happiness: 80 };
  l.children.push(c);
  log(gs, 'family', `Nace ${name}. La vida ya no será igual.`);
  news(gs, 'info', `¡Ha nacido ${name}!`, 'El vestuario felicita al míster.');
  l.happiness = clamp(l.happiness + 15, 0, 100);
}

/** End of season: children grow; a talented footballer child joins the academy at 16. */
export function lifeSeasonEnd(gs: GameState) {
  const l = L(gs); if (!l?.enabled) return;
  const rng = rngFor(gs, 'lifeseason');
  for (const c of l.children) {
    const a = gs.season + 1 - c.born;
    c.talent = clamp(c.talent + (c.path === 'fútbol' ? rng.int(1, 5) : rng.int(-1, 2)), 0, 100);
    c.studies = clamp(c.studies + (c.path === 'estudios' ? rng.int(1, 5) : rng.int(-1, 2)), 0, 100);
    if (a === 6) log(gs, 'family', `${c.name} empieza el colegio.`);
    if (a === 12 && !c.path) log(gs, 'family', `${c.name} tiene 12 años: es hora de elegir su camino.`);
    if (a === 16 && c.path === 'fútbol' && !c.playerId && c.talent >= 60) {
      const club = gs.clubs[gs.manager.clubId];
      const p = makePlayer(gs, new Rng(c.id + gs.season), { name: `${c.name} ${(gs.manager.name.split(' ')[1] ?? gs.manager.name)}`, pos: rng.pick(['CM', 'ST', 'LW', 'CB'] as const), born: gs.season + 1 - 16, nat: 'ESP', ovr: 42 + Math.round(c.talent / 6), pot: Math.min(94, 60 + Math.round(c.talent / 3)), clubId: club.id, rep: 40, generated: true, youth: true });
      c.playerId = p.id;
      log(gs, 'family', `${c.name} entra en la cantera del ${club.name}. ¿Será el futuro del club?`);
      news(gs, 'youth', `${c.name}, el hijo del míster, a la cantera`, 'El juvenil incorpora a un apellido conocido.');
    }
  }
  void genName;
}
