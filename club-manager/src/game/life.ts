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
export interface Person { id: number; name: string; gender: 'f' | 'm'; born: number; job: string; img: string; traits: string[]; likes: string[]; affinity: number; stage: Stage; met: number; lastDate: number; since?: number; lastFlirt?: number; exRole?: 'pareja' | 'mujer'; alimonyUntil?: number; look?: Look; bi?: boolean; trans?: boolean }
/** 0 = everyday portrait, 1 = night out (`-b`), 2 = lingerie (`-c`, only with intimacy). */
export type Look = 0 | 1 | 2;
export interface Child { id: number; name: string; gender: 'f' | 'm'; born: number; talent: number; studies: number; happiness: number; path?: 'fútbol' | 'estudios' | 'arte'; playerId?: number }
export interface LifeLog { day: number; season: number; text: string; kind: 'love' | 'family' | 'home' | 'money' | 'scandal' | 'health' }
export interface LifeState {
  enabled: true; interest: Interest; born: number;
  savings: number; happiness: number; stress: number; health: number;
  home: string; car: string; people: Person[]; children: Child[];
  pregnancyDue?: number; tryingForBaby?: boolean; nights?: number; wedding?: { personId: number; day: number }; nextId: number; log: LifeLog[]; lastPartnerAct?: number;
  cohabit?: number;        // id of the woman you live with
  suspicion?: number;      // 0-100: how much your partner suspects you are cheating
  lastReassure?: number;
  weddingPlan?: WeddingPlan;
  lastEscort?: number;
  openRelation?: boolean; // open relationship agreed with the partner: affairs are no secret
  lastTrio?: number;
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
export const lookImage = (p: Person) => (p.look === 2 && lingerieUnlocked(p) ? `${p.img}-c` : p.look === 1 && hasAltLook(p) ? `${p.img}-b` : p.img);
/** Portraits whose second outfit (`<portrait>-b.webp`) is already in public/art/life. */
export const ALT_LOOKS = new Set<string>(Array.from({ length: 21 }, (_, i) => `f${i + 1}`));
export const hasAltLook = (p: Person) => p.gender === 'f' && ALT_LOOKS.has(p.img);
/** Portraits whose lingerie look (`<portrait>-c.webp`) is in public/art/life. */
export const LINGERIE_LOOKS = new Set<string>(Array.from({ length: 21 }, (_, i) => `f${i + 1}`));
export const hasLingerie = (p: Person) => p.gender === 'f' && LINGERIE_LOOKS.has(p.img);
/** Lingerie is for those who share your intimacy: partner, wife, lover, or a very close bond. */
export const lingerieUnlocked = (p: Person) => hasLingerie(p) && (['pareja', 'prometida', 'casada', 'amante'].includes(p.stage) || p.affinity >= 70);
export const LOOK_LABEL: Record<Look, string> = { 0: 'Casual', 1: 'De noche', 2: 'Lencería' };
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
  const p: Person = { bi: img === VOLUPTUOUS || rng.chance(0.3), trans: rng.chance(0.1), id: l.nextId++, name, gender, born: gs.season - rng.int(26, 38), job: img === VOLUPTUOUS ? 'bailarina de salsa y guía de tango' : (gender === 'f' ? JOBS_F : JOBS_M)[idx % (gender === 'f' ? JOBS_F.length : JOBS_M.length)], img, traits, likes: rng.shuffle(VENUES.map(v => v.id)).slice(0, 2), affinity: rng.int(15, 35), stage: 'conocida', met: now(gs), lastDate: now(gs) - 7, look: 0 };
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
export function toggleLook(gs: GameState, personId: number, look?: Look): void {
  const p = L(gs)?.people.find(x => x.id === personId); if (!p || p.gender !== 'f') return;
  if (look != null) { if (look === 2 && !lingerieUnlocked(p)) return; p.look = look; return; }
  p.look = p.look ? 0 : 1;
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
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); const v = dateVenues(gs).find(x => x.id === venueId);
  if (!p || !v || p.stage === 'ex') return 'No es posible.';
  const first = p.name.split(' ')[0];
  if (now(gs) - p.lastDate < 5) return `${first} prefiere esperar unos días a la próxima cita.`;
  if (v.minAff && p.affinity < v.minAff) return `${first} sonríe, pero aún es pronto para ese plan (necesitas afinidad ${v.minAff}).`;
  if (!spend(gs, v.cost)) return 'No tienes ahorros suficientes para ese plan.';
  const rng = rngFor(gs, `date${p.id}:${p.lastDate}`);
  const home = HOMES.find(h => h.id === l.home)!, car = CARS.find(c => c.id === l.car)!;
  let gain = 6 + (p.likes.includes(v.id) ? 8 : 0) + rng.int(-4, 6) + (p.traits.includes('ardiente') && v.intimate ? 4 : 0) + (p.traits.includes('glamurosa') && (v.id === 'gala' || v.id === 'yate' || v.id === 'azotea' || car.happy >= 6) ? 4 : 0)
    + (p.traits.includes('romántica') && (v.id === 'playa' || v.id === 'viaje' || v.id === 'spa') ? 4 : 0) + (p.traits.includes('aventurera') && (v.id === 'salsa' || v.id === 'yate') ? 4 : 0)
    + (v.id === 'europa' ? 6 : 0) + (v.id === 'casa' ? Math.round(home.happy / 2) - 2 : 0) + Math.round((home.happy + car.happy) / 6) + (v.intimate ? 3 : 0);
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
  if (p.stage === 'amante' && sp) addSuspicion(gs, v.exposed ? 8 : 5);
  if (p.stage === 'amante' && v.exposed && sp && !l.openRelation && rng.chance((0.18 + gs.manager.reputation / 800) * (v.id === 'europa' ? 1.5 : 1))) {
    log(gs, 'love', `${v.name} con ${p.name}. ${v.flirt}`);
    return caught(gs, p, `Un paparazzi os fotografía en: ${v.name.toLowerCase()}.`);
  }
  const mood = gain >= 14 ? '¡Una cita perfecta!' : gain >= 8 ? 'Buena cita.' : 'Cita algo fría.';
  log(gs, 'love', `${v.name} con ${p.name}. ${gain >= 8 ? v.flirt : 'No termina de surgir la chispa.'}${night}`);
  return [mood, gain >= 8 ? v.flirt : '', night.trim(), `Afinidad con ${first}: ${Math.round(p.affinity)}.`].filter(Boolean).join(' ');
}

/** An affair comes out: it is a private matter. Your partner finds out (and may leave you), but the
 *  board and the fans judge you by results, not by the gossip pages. */
function caught(gs: GameState, lover: Person, how: string): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return how;
  sp.affinity = clamp(sp.affinity - 60, 0, 100); lover.stage = 'ex'; if (!lover.exRole) lover.exRole = 'pareja'; l.suspicion = 0;
  log(gs, 'scandal', `${sp.name} descubre tu aventura con ${lover.name}. ${how}`);
  news(gs, 'info', `Prensa rosa: el míster, cazado con ${lover.name}`, `${how} Las revistas del corazón no hablan de otra cosa; en el club, nadie comenta su vida privada.`);
  l.stress = clamp(l.stress + 25, 0, 100);
  const board = gs.manager.board, fans = gs.clubs[gs.manager.clubId].fans;
  if (sp.affinity < 30) breakUp(gs, sp.id);
  gs.manager.board = board; gs.clubs[gs.manager.clubId].fans = fans; // a scandal-driven break-up stays private too
  return `¡Pillados! ${how} ${sp.name.split(' ')[0]} se ha enterado.`;
}

/** Call an ex: old wounds heal slowly; the spark may come back. */
export function callEx(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p || p.stage !== 'ex') return '';
  const first = p.name.split(' ')[0];
  if (p.lastFlirt != null && now(gs) - p.lastFlirt < 3) return `${first} aún no te ha devuelto la última llamada.`;
  p.lastFlirt = now(gs);
  const rng = rngFor(gs, `exc${p.id}:${now(gs)}`);
  const g = rng.int(2, 7) + (p.traits.includes('ardiente') || p.traits.includes('romántica') ? 2 : 0) - (p.exRole === 'mujer' && (p.alimonyUntil ?? 0) >= gs.season ? 1 : 0);
  p.affinity = clamp(p.affinity + g, 0, 100);
  const lines = [`Hablas con ${first} de los viejos tiempos. Se ríe como antes.`, `${first} te cuelga al principio… y te llama ella diez minutos después.`, `Una conversación larga a medianoche. ${first} reconoce que a veces te echa de menos.`, `Le recuerdas aquella noche en la playa. Se hace un silencio cómplice.`];
  return `${rng.pick(lines)} Afinidad ${Math.round(p.affinity)}.`;
}

/** An affair with an ex: a secret meeting where the old chemistry takes over (always fades to black). */
export function exFling(gs: GameState, personId: number): string {
  const l = L(gs)!; const p = l.people.find(x => x.id === personId); if (!p || p.stage !== 'ex') return '';
  const first = p.name.split(' ')[0];
  if (p.affinity < 30) return `${first} no está preparada para volver a verte así (necesitas afinidad 30).`;
  if (now(gs) - p.lastDate < 5) return `${first} prefiere esperar unos días.`;
  if (!spend(gs, 600)) return 'No te llega para una noche en un hotel discreto (600 €).';
  const rng = rngFor(gs, `exf${p.id}:${now(gs)}`);
  p.lastDate = now(gs);
  if (!rng.chance(0.45 + p.affinity / 120 + (p.traits.includes('ardiente') ? 0.1 : 0))) {
    p.affinity = clamp(p.affinity + 2, 0, 100);
    return `Quedáis a tomar algo. Saltan chispas, pero ${first} se despide en la puerta del hotel: «Todavía no». Afinidad ${Math.round(p.affinity)}.`;
  }
  p.stage = 'amante'; p.since = now(gs); p.affinity = clamp(p.affinity + 10, 0, 100); if (partner(l)) addSuspicion(gs, 8);
  l.happiness = clamp(l.happiness + 6, 0, 100); l.stress = clamp(l.stress - 8, 0, 100);
  const who = p.exRole === 'mujer' ? 'tu ex-mujer' : 'tu ex';
  log(gs, 'love', `Una noche con ${p.name}, ${who}. Lo vuestro vuelve, en secreto.`);
  return `Un hotel discreto, su perfume de siempre y la ropa por el suelo antes de cerrar la puerta. Con ${first}, ${who}, todo vuelve a empezar… en secreto.`;
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
  if (sp && sp.id !== p.id) addSuspicion(gs, 3);
  if (sp && sp.id !== p.id && !l.openRelation && rng.chance(0.08 + (sp.traits.includes('celosa') ? 0.1 : 0) + (l.suspicion ?? 0) / 500)) {
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
    p.stage = 'amante'; p.since = now(gs); addSuspicion(gs, 6); log(gs, 'love', `Empiezas una relación secreta con ${p.name}.`);
    return l.openRelation ? `Empiezas algo con ${p.name.split(' ')[0]}. Sin secretos: tu pareja lo sabe y le parece bien.` : `Empiezas una aventura secreta con ${p.name.split(' ')[0]}. Cuidado con la prensa…`;
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
  if (p.affinity >= 75 && rng.chance(0.55 + p.affinity / 300 + (p.traits.includes('familiar') ? 0.15 : 0) + (l.cohabit === p.id ? 0.1 : 0))) {
    p.stage = 'prometida'; l.wedding = { personId: p.id, day: now(gs) + 45 }; l.weddingPlan = { venue: 'finca', guests: 'familia', honeymoon: 'none' };
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
  if (l.cohabit === p.id) { l.cohabit = undefined; log(gs, 'home', `${p.name.split(' ')[0]} recoge sus cosas y se va de casa.`); }
  if (l.wedding?.personId === p.id) { l.wedding = undefined; l.weddingPlan = undefined; }
  if (partner(l)?.id === p.id) { l.suspicion = 0; l.openRelation = false; }
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

// ---------------- living together ----------------
/** Move in together: she brings her things, pays her share and your home matters more to her. */
export function moveIn(gs: GameState): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return 'Necesitas una pareja.';
  const first = sp.name.split(' ')[0];
  if (l.cohabit === sp.id) return `Ya vivís juntos.`;
  if (sp.since != null && now(gs) - sp.since < 30) return `Es pronto: lleváis menos de un mes. ${first} quiere ir paso a paso.`;
  if (sp.affinity < 60) return `${first} aún no lo ve claro (necesitas afinidad 60).`;
  l.cohabit = sp.id; sp.affinity = clamp(sp.affinity + 5, 0, 100); l.happiness = clamp(l.happiness + 8, 0, 100);
  const home = HOMES.find(h => h.id === l.home)!;
  log(gs, 'home', `${sp.name} se muda contigo a: ${home.name.toLowerCase()}.`);
  return `${first} llega con tres maletas y una planta. Desde hoy vivís juntos.${home.happy < 4 ? ' El piso se le queda pequeño: una casa mejor la haría más feliz.' : ''}`;
}

// ---------------- suspicion ----------------
const CLUES = ['nota un perfume que no es el suyo en tu chaqueta.', 've que el móvil se ilumina a medianoche y lo pones boca abajo.', 'pregunta por qué llegaste tan tarde del «análisis de vídeo».', 'encuentra una factura de hotel que no le cuadra.', 'te mira en silencio durante la cena: algo no le encaja.', 'comenta que últimamente estás muy pendiente del móvil.'];
function addSuspicion(gs: GameState, n: number) { const l = L(gs)!; if (l.openRelation) return; if (partner(l)) l.suspicion = clamp((l.suspicion ?? 0) + n, 0, 100); }

/** Calm her doubts. Works better when the bond is strong and the doubts are still small. */
export function reassure(gs: GameState): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return '';
  const first = sp.name.split(' ')[0]; const su = l.suspicion ?? 0;
  if (su < 10) return `${first} está tranquila: no hay nada que explicar.`;
  if (l.lastReassure != null && now(gs) - l.lastReassure < 3) return `Ya hablasteis hace poco. Insistir ahora sonaría a excusa.`;
  l.lastReassure = now(gs);
  const rng = rngFor(gs, `reas${now(gs)}`);
  if (rng.chance(0.4 + sp.affinity / 200 - su / 300)) {
    l.suspicion = Math.max(0, su - 25); sp.affinity = clamp(sp.affinity + 2, 0, 100);
    return `Le hablas con calma y la abrazas. ${first} decide creerte. Sospecha ${Math.round(l.suspicion)}.`;
  }
  l.suspicion = clamp(su + 5, 0, 100); sp.affinity = clamp(sp.affinity - 4, 0, 100);
  return `Tus explicaciones no la convencen. ${first} se va a dormir sin darte las buenas noches. Sospecha ${Math.round(l.suspicion)}.`;
}

/** Tell the truth: every affair ends; she forgives you if the bond is strong enough. */
export function confess(gs: GameState): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return '';
  const lovers = l.people.filter(p => p.stage === 'amante');
  const first = sp.name.split(' ')[0];
  if (!lovers.length) { l.suspicion = 0; return `Le juras que no hay nadie más, y es verdad. ${first} te cree.`; }
  for (const lv of lovers) { lv.stage = 'ex'; if (!lv.exRole) lv.exRole = 'pareja'; }
  l.suspicion = 0;
  sp.affinity = clamp(sp.affinity - 35 + (sp.traits.includes('romántica') ? 5 : 0) - (sp.traits.includes('celosa') ? 10 : 0), 0, 100);
  l.stress = clamp(l.stress + 15, 0, 100);
  log(gs, 'love', `Confiesas a ${sp.name} tu aventura con ${lovers.map(x => x.name.split(' ')[0]).join(' y ')}.`);
  if (sp.affinity < 35) return `${first} escucha sin decir nada, coge las llaves y se va. ${breakUp(gs, sp.id)}`;
  return `Una noche larga, lágrimas y muchas preguntas. ${first} decide darte otra oportunidad. Tus aventuras se terminan aquí.`;
}

// ---------------- dates abroad ----------------
/** Your next European away match within ten days, if any: a chance for a date in that city. */
export function awayTrip(gs: GameState): { city: string; club: string; days: number } | undefined {
  const me = gs.manager.clubId;
  const f = gs.fixtures.filter(x => !x.played && x.away === me && ['euro', 'euro2', 'euro3', 'sud'].includes(x.comp) && x.date >= gs.day && x.date - gs.day <= 10).sort((a, b) => a.date - b.date)[0];
  if (!f) return undefined;
  const c = gs.clubs[f.home];
  return { city: c.city, club: c.name, days: f.date - gs.day };
}
/** Date plans available today: the usual ones plus a getaway to the city of a European away game. */
export function dateVenues(gs: GameState): Venue[] {
  const t = awayTrip(gs);
  if (!t) return VENUES;
  return [...VENUES, { id: 'europa', name: `Escapada a ${t.city} (partido europeo)`, cost: 4_000, img: 'venue-trip', fame: 0, minAff: 40, intimate: true, exposed: true, flirt: `Os escapáis a ${t.city} un día antes del partido: paseo por el casco antiguo, cena junto al río y un hotel con vistas donde nadie os conoce… o eso creéis.` }];
}

// ---------------- wedding ----------------
export interface WeddingPlan { venue: string; guests: string; honeymoon: string }
export const WEDDING_OPTS = {
  venue: [
    { id: 'intima', label: 'Ceremonia íntima en la playa', cost: 25_000, aff: 4, happy: 6, rep: 0, hint: 'Pocos invitados, pies descalzos y puesta de sol.' },
    { id: 'finca', label: 'Finca con jardines', cost: 70_000, aff: 8, happy: 10, rep: 0, hint: 'La boda clásica: banquete, baile y fiesta hasta tarde.' },
    { id: 'gran', label: 'Gran hotel, 400 invitados', cost: 180_000, aff: 12, happy: 14, rep: 2, hint: 'Exclusiva en revistas. La prensa te adora.' },
  ],
  guests: [
    { id: 'familia', label: 'Familia y amigos', cost: 0, morale: 0, board: 0, hint: 'Solo los tuyos.' },
    { id: 'vestuario', label: 'Con la plantilla', cost: 15_000, morale: 4, board: 0, hint: 'Los jugadores lo agradecen (+moral).' },
    { id: 'club', label: 'Plantilla y presidente', cost: 25_000, morale: 4, board: 3, hint: '+moral y un gesto con la directiva.' },
  ],
  honeymoon: [
    { id: 'none', label: 'Sin luna de miel', cost: 0, aff: -3, stress: 0, hint: 'La temporada manda. A ella no le hace gracia.' },
    { id: 'caribe', label: 'Una semana en el Caribe', cost: 18_000, aff: 6, stress: -15, hint: 'Playa, sol y desconexión.' },
    { id: 'asia', label: 'Japón y Maldivas, dos semanas', cost: 45_000, aff: 10, stress: -25, hint: 'El viaje de vuestra vida.' },
  ],
};
type WKey = keyof typeof WEDDING_OPTS;
const wopt = (k: WKey, id: string) => (WEDDING_OPTS[k] as { id: string; cost: number }[]).find(o => o.id === id) ?? WEDDING_OPTS[k][0];
export const weddingCost = (plan: WeddingPlan) => (['venue', 'guests', 'honeymoon'] as WKey[]).reduce((s, k) => s + wopt(k, plan[k]).cost, 0);
export function setWeddingPlan(gs: GameState, key: WKey, id: string) {
  const l = L(gs)!; if (!l.wedding) return;
  l.weddingPlan = { ...(l.weddingPlan ?? { venue: 'finca', guests: 'familia', honeymoon: 'none' }), [key]: id };
}
function celebrateWedding(gs: GameState, p: Person) {
  const l = L(gs)!; const plan = l.weddingPlan ?? { venue: 'finca', guests: 'familia', honeymoon: 'none' };
  const v = WEDDING_OPTS.venue.find(o => o.id === plan.venue) ?? WEDDING_OPTS.venue[1];
  const g = WEDDING_OPTS.guests.find(o => o.id === plan.guests) ?? WEDDING_OPTS.guests[0];
  const h = WEDDING_OPTS.honeymoon.find(o => o.id === plan.honeymoon) ?? WEDDING_OPTS.honeymoon[0];
  const cost = weddingCost(plan); l.savings -= cost;
  p.stage = 'casada'; l.cohabit = p.id;
  p.affinity = clamp(p.affinity + v.aff + h.aff, 0, 100);
  l.happiness = clamp(l.happiness + 10 + v.happy, 0, 100); l.stress = clamp(l.stress + h.stress, 0, 100);
  if (v.rep) gs.manager.reputation = Math.min(100, gs.manager.reputation + v.rep);
  if (g.board) gs.manager.board = clamp(gs.manager.board + g.board, 0, 100);
  if (g.morale) for (const id in gs.players) { const pl = gs.players[id]; if (pl.clubId === gs.manager.clubId) pl.morale = clamp(pl.morale + g.morale, 5, 100); }
  log(gs, 'family', `Te casas con ${p.name}: ${v.label.toLowerCase()}, ${g.label.toLowerCase()}${h.id !== 'none' ? `, luna de miel: ${h.label.toLowerCase()}` : ''}. Total ${fmtMoney(cost)}.`);
  news(gs, 'info', v.id === 'gran' ? '¡La boda del año!' : 'El míster se casa', `El entrenador y ${p.name} se dan el «sí, quiero»${g.id !== 'familia' ? ' rodeados de la plantilla' : ''}.`);
}

// ---------------- paid company ----------------
/** A discreet high-end escort agency: three adult profiles a week, a paid evening that fades to black. */
export interface EscortProfile { idx: number; name: string; age: number; style: string; price: number; img: string }
/** Escort portraits available in public/art/life (`eN.webp`). */
export const ESCORT_IMGS = new Set<string>(Array.from({ length: 10 }, (_, i) => `e${i + 1}`));
const ESCORT_STYLES = ['elegante y culta, ideal para una cena larga', 'risueña y espontánea, le encanta bailar', 'misteriosa, de pocas palabras y mirada intensa', 'sofisticada, habla cuatro idiomas', 'cariñosa y atenta, sabe escuchar', 'ardiente, de curvas generosas y risa contagiosa'];
export function escortProfiles(gs: GameState): EscortProfile[] {
  const week = Math.floor(now(gs) / 7);
  const rng = rngFor(gs, `escort${week}`);
  const imgs = rng.shuffle(Array.from({ length: 9 }, (_, i) => `e${i + 1}`)); // e10 is the curvy one
  return [0, 1, 2].map(i => ({ idx: i, img: imgs[i], name: rng.pick(['Bianca', 'Nadia', 'Alessia', 'Yasmin', 'Ingrid', 'Celeste', 'Mónica', 'Anaïs', 'Larissa', 'Vera', 'Zoe', 'Paloma']), age: rng.int(24, 35), style: rng.pick(ESCORT_STYLES), price: rng.pick([1_500, 2_500, 4_000, 6_000]) })).map(e => (e.style.includes('curvas') ? { ...e, img: 'e10' } : e));
}
export function escortDate(gs: GameState, idx: number, trio = false): string {
  const l = L(gs)!; const base = escortProfiles(gs)[idx]; if (!base) return '';
  const pr = trio ? { ...base, price: base.price * 2 } : base;
  if (l.lastEscort != null && now(gs) - l.lastEscort < 7) return 'La agencia solo trabaja con cita previa: vuelve la semana que viene.';
  if (!spend(gs, pr.price)) return `No te llega: ${pr.name} cobra ${fmtMoney(pr.price)} la velada.`;
  l.lastEscort = now(gs);
  const rng = rngFor(gs, `escd${now(gs)}`);
  l.stress = clamp(l.stress - (trio ? 20 : 15), 0, 100); l.happiness = clamp(l.happiness + (trio ? 5 : 3), 0, 100);
  const sp = partner(l);
  let tail = '';
  if (sp) {
    addSuspicion(gs, trio ? 16 : 12);
    if (!l.openRelation && rng.chance(0.05 + gs.manager.reputation / 1500 + (l.suspicion ?? 0) / 600)) {
      sp.affinity = clamp(sp.affinity - 45, 0, 100); l.suspicion = 0; l.stress = clamp(l.stress + 20, 0, 100);
      log(gs, 'scandal', `${sp.name} descubre tu cita con una acompañante de lujo.`);
      news(gs, 'info', 'Prensa rosa: el míster, con una acompañante', 'Las revistas publican la exclusiva; en el club nadie comenta su vida privada.');
      tail = ` Pero un fotógrafo os ve salir del hotel y ${sp.name.split(' ')[0]} se entera.`;
      if (sp.affinity < 30) tail += ` ${breakUp(gs, sp.id)}`;
    }
  }
  log(gs, 'love', `Velada pagada con ${pr.name}, ${pr.age} años${trio ? ', y una amiga suya' : ''}, de una agencia de lujo.`);
  if (trio) return `${pr.name} llega al hotel del brazo de una amiga, las dos riendo. Champán para tres, música baja, dos vestidos sobre la silla y la puerta que se cierra. Al amanecer ya se han ido.${tail}`;
  return `${pr.name} llega puntual al hotel, ${pr.style.split(',')[0]}. Una copa de champán, conversación, su vestido sobre la silla y la discreción que se paga. Al amanecer ya se ha ido.${tail}`;
}

// ---------------- open relationship & threesomes ----------------
/** How open-minded someone is: bisexual, fiery or adventurous people say yes more easily. */
const openness = (p: Person) => (p.bi ? 0.3 : 0) + (p.traits.includes('ardiente') ? 0.2 : 0) + (p.traits.includes('aventurera') ? 0.15 : 0) + (p.traits.includes('independiente') ? 0.15 : 0) - (p.traits.includes('celosa') ? 0.25 : 0) - (p.traits.includes('familiar') ? 0.1 : 0);

/** Ask your partner for an open relationship: other people are allowed, no more secrets. */
export function proposeOpen(gs: GameState): string {
  const l = L(gs)!; const sp = partner(l); if (!sp) return 'Necesitas una pareja.';
  const first = sp.name.split(' ')[0];
  if (l.openRelation) return 'Vuestra relación ya es abierta.';
  if (sp.affinity < 55) return `${first} no está para ese tipo de conversaciones ahora (necesitas afinidad 55).`;
  const rng = rngFor(gs, `open${now(gs)}`);
  if (rng.chance(0.15 + openness(sp) + sp.affinity / 400)) {
    l.openRelation = true; l.suspicion = 0; sp.affinity = clamp(sp.affinity + 2, 0, 100);
    const lovers = l.people.filter(p => p.stage === 'amante');
    log(gs, 'love', `${sp.name} y tú acordáis una relación abierta.${lovers.length ? ` Le hablas de ${lovers.map(x => x.name.split(' ')[0]).join(' y ')}.` : ''}`);
    return `${first} se lo piensa, sonríe y pone sus condiciones: sinceridad, nada de mentiras y ella también puede conocer a otras personas. Desde hoy vuestra relación es abierta.`;
  }
  sp.affinity = clamp(sp.affinity - 10, 0, 100); addSuspicion(gs, 8);
  return `${first} se queda helada: «¿Es que yo no te basto?». Mejor no volver a sacar el tema en un tiempo.`;
}
export function closeOpen(gs: GameState): string {
  const l = L(gs)!; const sp = partner(l); if (!sp || !l.openRelation) return '';
  l.openRelation = false; sp.affinity = clamp(sp.affinity + 3, 0, 100);
  log(gs, 'love', `${sp.name} y tú volvéis a ser una pareja cerrada.`);
  return `Volvéis a ser solo vosotros dos. ${sp.name.split(' ')[0]} parece aliviada.`;
}

/** A night for three with two people you know. Both must want it; it always fades to black. */
export function proposeTrio(gs: GameState, aId: number, bId: number): string {
  const l = L(gs)!;
  const a = l.people.find(x => x.id === aId), b = l.people.find(x => x.id === bId);
  if (!a || !b || a.id === b.id || a.stage === 'ex' || b.stage === 'ex') return 'Elige a dos personas distintas.';
  if (l.lastTrio != null && now(gs) - l.lastTrio < 7) return 'Demasiado pronto para repetir. Deja pasar una semana.';
  const fa = a.name.split(' ')[0], fb = b.name.split(' ')[0];
  for (const p of [a, b]) if (p.affinity < 60) return `${p.name.split(' ')[0]} aún no tiene tanta confianza contigo (necesitas afinidad 60).`;
  if (!spend(gs, 2_500)) return 'Necesitas 2.500 € para la suite.';
  l.lastTrio = now(gs);
  const rng = rngFor(gs, `trio${now(gs)}`);
  const no = [a, b].find(p => !rng.chance(0.1 + openness(p) + p.affinity / 300));
  const sp = partner(l);
  if (no) {
    no.affinity = clamp(no.affinity - 6, 0, 100);
    if (sp && no.id === sp.id) addSuspicion(gs, 6);
    return `${no.name.split(' ')[0]} se ríe, nerviosa: «Eso no es lo mío». La suite se queda en una cena para tres.`;
  }
  // a secret lover in a threesome with your partner is no longer a secret
  if (sp && (a.id === sp.id || b.id === sp.id)) { const other = a.id === sp.id ? b : a; if (other.stage === 'amante' && !l.openRelation) l.suspicion = 0; }
  else if (sp) addSuspicion(gs, 15);
  for (const p of [a, b]) p.affinity = clamp(p.affinity + 8, 0, 100), p.lastDate = now(gs);
  l.happiness = clamp(l.happiness + 6, 0, 100); l.stress = clamp(l.stress - 12, 0, 100);
  log(gs, 'love', `Una noche para tres con ${a.name} y ${b.name}.`);
  return `Champán en la suite, ${fa} elige la música y ${fb} apaga las luces. Lo que pasa después se queda entre los tres. Al despertar, desayuno en la cama y muchas risas.`;
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
    if (gap > 21 && l.cohabit !== p.id) p.affinity = clamp(p.affinity - decay, 0, 100);
    if ((p.stage === 'pareja' || p.stage === 'prometida') && p.affinity < 25 && rng.chance(0.2)) { p.stage = 'ex'; log(gs, 'love', `${p.name} te deja: dice que el fútbol siempre va primero.`); l.happiness = clamp(l.happiness - 12, 0, 100); }
  }
  // living together: she pays her share and the house makes her happier (or not)
  if (sp && l.cohabit === sp.id) {
    l.savings += 500;
    sp.affinity = clamp(sp.affinity + (home.happy - 4) / 4, 0, 100);
  }
  // suspicion grows with every secret and fades when there is nothing to hide
  const lovers = l.people.filter(p => p.stage === 'amante');
  if (sp) {
    if (l.openRelation && rng.chance(0.15)) { log(gs, 'love', `${sp.name.split(' ')[0]} ha tenido una cita con otra persona. Te lo cuenta con una sonrisa al volver: así lo acordasteis.`); l.stress = clamp(l.stress + 1, 0, 100); }
    if (lovers.length) addSuspicion(gs, 2 * lovers.length + (sp.traits.includes('celosa') ? 3 : 0));
    else l.suspicion = Math.max(0, (l.suspicion ?? 0) - 6);
    const su = l.suspicion ?? 0;
    if (su >= 25 && rng.chance(0.35)) {
      const clue = rng.pick(CLUES);
      sp.affinity = clamp(sp.affinity - (su >= 60 ? 4 : 2), 0, 100);
      log(gs, 'love', `${sp.name.split(' ')[0]} ${clue}`);
    }
  }
  // affairs can be discovered
  if (lovers.length && sp && !l.openRelation) {
    const risk = 0.02 * lovers.length + (l.suspicion ?? 0) / 400 + gs.manager.reputation / 2500 + (sp.traits.includes('celosa') ? 0.04 : 0);
    if (rng.chance(risk)) {
      caught(gs, rng.pick(lovers), 'Una revista del corazón publica las fotos.');
    } else if (rng.chance(0.3)) for (const lv of lovers) { lv.affinity = clamp(lv.affinity + 2, 0, 100); }
  }
  // meeting people now and then when single
  if (!sp && rng.chance(0.06 + gs.manager.reputation / 1500)) { const p = newPerson(gs, rng); if (p) log(gs, 'love', `En un evento del club conoces a ${p.name}, ${p.job}.`); }
  // wedding day
  if (l.wedding && now(gs) >= l.wedding.day) {
    const p = l.people.find(x => x.id === l.wedding!.personId);
    if (p && p.stage === 'prometida') celebrateWedding(gs, p);
    l.wedding = undefined; l.weddingPlan = undefined;
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
