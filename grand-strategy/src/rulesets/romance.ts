import { addRelation, age, fireEvent, killCharacter, livingNations, log } from '@/engine/core';
import type { ActionDef } from '@/engine/ruleset';
import type { Character, Effect, GameEvent, GameState } from '@/engine/types';
import { chance, pick, rand } from '@/engine/util';
import { randomCharacter, stat } from './common';
import { canMarry, closeKin, rulerOf } from './dynasty';

/**
 * Love, seduction and scandal at court. Suggestive, never explicit: glances, perfumed letters,
 * midnight meetings, children "of uncertain resemblance", jealous spouses and secrets worth a kingdom.
 */

const has = (c: Character | undefined | null, t: string) => !!c?.traits.includes(t);
const married = (s: GameState, c: Character) => !!c.spouse && !!s.characters[c.spouse]?.alive;
const ella = (c: Character) => (c.female ? 'ella' : 'él');
const o_a = (c: Character) => (c.female ? 'a' : 'o');

export function seductionChance(s: GameState, a: Character, b: Character): number {
  if (!a.alive || !b.alive || a.female === b.female || age(s, a) < 18 || age(s, b) < 18 || closeKin(a, b)) return 0;
  // every pair has its own chemistry
  const key = a.id < b.id ? a.id + b.id : b.id + a.id;
  let h = 7; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  let p = 0.1 + (h % 1000) / 1000 * 0.3 + (stat(a, 'intrigue') + stat(a, 'diplomacy') - 10) * 0.03;
  if (has(a, 'seductor')) p += 0.2;
  if (has(a, 'bello')) p += 0.1;
  if (has(b, 'lujurioso')) p += 0.2;
  if (has(b, 'casto') || has(b, 'piadoso')) p -= 0.25;
  if (b.inLove) p -= 0.2;
  if (b.lover && s.characters[b.lover]?.alive) p -= 0.15;
  const gap = Math.abs(age(s, a) - age(s, b));
  if (gap > 15) p -= (gap - 15) * 0.015;
  const ra = s.nations[a.tag], rb = s.nations[b.tag];
  if (ra && rb && ra !== rb) p += Math.max(-0.15, Math.min(0.1, ((rb.relations[ra.tag] ?? 0) / 100) * 0.15));
  return Math.max(0.03, Math.min(0.9, p));
}

/** who the player's character could try to seduce: notable people of other courts, best odds first */
export function seductionTargets(s: GameState, a: Character, limit = 8) {
  const out: { b: Character; p: number; why: string }[] = [];
  if (age(s, a) < 18) return out;
  for (const n of livingNations(s)) {
    if (n.x.pseudo) continue;
    const r = rulerOf(s, n);
    for (const b of Object.values(s.characters)) {
      if (b.tag !== n.tag || !b.alive || b.id === a.id || b.id === a.spouse || b.female === a.female || age(s, b) < 18) continue;
      const notable = b.id === n.rulerId || b.id === n.heirId || (r && b.id === r.spouse);
      if (!notable && n.tag !== a.tag) continue;
      const p = seductionChance(s, a, b);
      if (p <= 0) continue;
      const why = n.tag === a.tag ? 'un romance en tu propia corte' : b.id === n.rulerId ? `influencia sobre ${n.name}` : b.id === n.heirId ? `el corazón del heredero de ${n.name}` : `un secreto en la alcoba real de ${n.name}`;
      out.push({ b, p, why });
    }
  }
  return out.sort((x, y) => y.p - x.p).slice(0, limit);
}

function scandal(s: GameState, a: Character, b: Character, discovered: boolean) {
  const ra = s.nations[a.tag], rb = s.nations[b.tag];
  if (ra) { ra.prestige -= 15; if (s.era === 'medieval') ra.x.piety = (ra.x.piety ?? 0) - 25; }
  const sa = a.spouse ? s.characters[a.spouse] : null, sb = b.spouse ? s.characters[b.spouse] : null;
  for (const [sp, other] of [[sa, b], [sb, a]] as const) {
    if (!sp?.alive) continue;
    const realmSp = s.nations[sp.tag], realmOther = s.nations[other.tag];
    if (realmSp && realmOther && realmSp !== realmOther) addRelation(s, realmSp.tag, realmOther.tag, -30);
  }
  if (discovered && ra && rb && ra !== rb) addRelation(s, rb.tag, ra.tag, -20);
}

function tryEvent(s: GameState, tag: string, ev: Omit<GameEvent, 'id' | 'triggeredOnly' | 'oneShot'>) {
  const full: GameEvent = { ...ev, id: `rom_${s.nextId++}`, triggeredOnly: true, oneShot: true };
  s.events.push(full);
  fireEvent(s, full, tag);
}

/** monthly: lovers' children, jealous discoveries, break-ups and letters from foreign admirers */
export function monthlyRomance(s: GameState) {
  const me = s.nations[s.player];
  // trim resolved romance events so saves stay small
  if (s.events.length > 400) s.events = s.events.filter((e) => !e.id.startsWith('rom_') || s.pendingEvents.some((p) => p.eventId === e.id));
  const seen = new Set<string>();
  for (const a of Object.values(s.characters)) {
    if (!a.alive || !a.lover || seen.has(a.id)) continue;
    const b = s.characters[a.lover];
    if (!b?.alive) { a.lover = null; continue; }
    seen.add(a.id); seen.add(b.id);
    const woman = a.female ? a : b, man = a.female ? b : a;
    // a child "of uncertain resemblance"
    if (age(s, woman) >= 18 && age(s, woman) <= 44 && chance(s, 0.012)) {
      const child = randomCharacter(s, woman.tag, { dynasty: man.dynasty, female: chance(s, 0.48), ageYears: 0 });
      child.father = man.id; child.mother = woman.id; child.bastard = true;
      const tags = [man.tag, woman.tag].filter((t, i, arr) => arr.indexOf(t) === i);
      log(s, `En la corte se murmura: ${woman.name} ha dado a luz a un${child.female ? 'a niña' : ' niño'} con un parecido sospechoso a ${man.name}.`, tags, 'story');
    }
    // discovery by a jealous spouse
    const spouses = [a, b].map((x) => (x.spouse ? s.characters[x.spouse] : null)).filter((x): x is Character => !!x?.alive);
    if (spouses.length && chance(s, spouses.some((x) => has(x, 'celoso')) ? 0.04 : 0.015)) {
      const jealous = spouses[0];
      const cheater = jealous.spouse === a.id ? a : b, other = cheater === a ? b : a;
      if (jealous.tag === s.player || cheater.tag === s.player) {
        const playerIsCheater = cheater.tag === s.player && (s.nations[s.player].rulerId === cheater.id || s.nations[s.player].heirId === cheater.id || jealous.tag !== s.player);
        if (playerIsCheater) {
          tryEvent(s, s.player, {
            title: 'Un pañuelo que no es tuyo', image: 'court',
            text: `${jealous.name} ha encontrado cartas perfumadas y un pañuelo bordado con las iniciales de ${other.name}. La corte entera contiene la respiración.`,
            options: [
              { label: 'Negarlo todo con aplomo', hint: 'Puede funcionar… o empeorar las cosas.', effects: chance(s, 0.5) ? [{ type: 'prestige', amount: -10 }] : [{ type: 'prestige', amount: -40 }, { type: 'char', op: 'trait', a: jealous.id, value: 'celoso' }] },
              { label: 'Romper con la amante y pedir perdón', effects: [{ type: 'char', op: 'breakup', a: cheater.id }, { type: 'prestige', amount: -15 }] },
              { label: 'Que la corte murmure: el corazón no obedece', effects: [{ type: 'prestige', amount: -35 }, { type: 'stability', amount: -1 }] },
            ],
          });
        } else {
          tryEvent(s, s.player, {
            title: 'Traición en la alcoba', image: 'court',
            text: `Tus espías no dejan lugar a dudas: ${cheater.name} se ve a escondidas con ${other.name}${s.nations[other.tag] && other.tag !== s.player ? `, de la corte de ${s.nations[other.tag].name}` : ''}. ¿Qué hará ${jealous.name}?`,
            options: [
              { label: 'Fingir que no sabes nada', hint: 'La información es poder.', effects: [{ type: 'prestige', amount: -5 }] },
              { label: `Desterrar a ${other.name}`, effects: [{ type: 'char', op: 'banish', a: other.id }, { type: 'prestige', amount: 10 }] },
              { label: 'Un accidente de caza…', hint: 'Si se descubre, el escándalo será enorme.', effects: [{ type: 'char', op: 'kill', a: other.id, value: 'un desafortunado accidente de caza' }, ...(chance(s, 0.4) ? [{ type: 'prestige', amount: -60 } as Effect, { type: 'stability', amount: -1 } as Effect] : [])] },
            ],
          });
        }
      } else {
        scandal(s, cheater, other, true);
        if (has(jealous, 'celoso') && has(jealous, 'cruel') && chance(s, 0.3)) {
          log(s, `${other.name} aparece muerto en circunstancias que nadie se atreve a investigar. Dicen que ${jealous.name} sonreía en el funeral.`, [other.tag, jealous.tag], 'story');
          cheater.lover = null; killCharacter(s, other.id, 'circunstancias que nadie investigó');
        } else {
          log(s, `Escándalo: ${jealous.name} descubre los amores de ${cheater.name} con ${other.name}.`, [cheater.tag, other.tag], 'story');
          cheater.lover = null; other.lover = null;
        }
      }
      continue;
    }
    if (chance(s, 0.015)) { a.lover = null; b.lover = null; }
  }

  // AI courts: some rulers take lovers among their courtiers
  for (const n of livingNations(s)) {
    if (n.tag === s.player || n.x.pseudo) continue;
    const r = rulerOf(s, n);
    if (!r || !r.alive || r.lover || age(s, r) < 18 || age(s, r) > 60) continue;
    const base = has(r, 'lujurioso') ? 0.02 : has(r, 'seductor') ? 0.012 : has(r, 'casto') || has(r, 'piadoso') ? 0.001 : 0.004;
    if (!chance(s, base)) continue;
    const lover = randomCharacter(s, n.tag, { female: !r.female, ageYears: Math.max(18, age(s, r) - Math.round(rand(s) * 15)) });
    if (chance(s, 0.5)) lover.traits.push(pick(s, ['bello', 'seductor']));
    r.lover = lover.id; lover.lover = r.id;
    if (chance(s, 0.25)) log(s, `Se dice que ${r.name} de ${n.name} pasa las noches lejos del lecho conyugal.`, [n.tag], 'story');
  }

  // a court that holds one of the player's bedroom secrets may try to cash it
  if (me) for (const n of livingNations(s)) {
    if (n.tag === s.player || !n.x[`secret_${s.player}`] || !chance(s, 0.04)) continue;
    delete n.x[`secret_${s.player}`];
    const g = Math.max(25, Math.round(me.treasury * 0.2));
    tryEvent(s, s.player, {
      title: 'Una visita del embajador', image: 'court',
      text: `El embajador de ${n.name} pide audiencia privada. Con una sonrisa, deja sobre la mesa una carta que conoces muy bien: la letra es de tu puño, y el perfume, de otra persona.`,
      options: [
        { label: `Pagar su silencio (${g})`, effects: [{ type: 'treasury', amount: -g }] },
        { label: 'Que la publiquen si se atreven', hint: 'Escándalo seguro.', effects: [{ type: 'prestige', amount: -50 }, { type: 'stability', amount: -1 }, { type: 'relations', other: n.tag, amount: -40 }] },
        { label: 'Firmar una alianza a cambio', effects: [{ type: 'alliance', other: n.tag }, { type: 'prestige', amount: -10 }] },
      ],
    });
  }

  if (me) playerIntrigues(s);

  // a perfumed letter from abroad for the player's monarch or heir
  if (me && chance(s, 0.022)) {
    const target = [me.rulerId, me.heirId].map((id) => (id ? s.characters[id] : null)).find((c) => c?.alive && age(s, c) >= 18 && !c.lover);
    const realms = livingNations(s).filter((x) => x.tag !== s.player && !x.x.pseudo && rulerOf(s, x));
    if (target && realms.length) {
      const from = pick(s, realms);
      const admirer = randomCharacter(s, from.tag, { female: !target.female, ageYears: Math.max(18, age(s, target) - Math.round(rand(s) * 12)) });
      admirer.traits.push('bello');
      if (chance(s, 0.5)) admirer.traits.push('seductor');
      const spy = chance(s, 0.35);
      tryEvent(s, s.player, {
        title: 'Una carta perfumada', image: 'court',
        text: `Un paje deja en manos de ${target.name} una carta sellada con lacre rojo. ${admirer.name}, ${admirer.female ? 'dama' : 'caballero'} de la corte de ${from.name}, escribe con una audacia que hace sonrojar: le espera esta noche en el jardín de los naranjos.`,
        note: spy ? undefined : 'Los amores de corte eran también diplomacia: un secreto compartido podía valer más que un tratado.',
        options: [
          { label: 'Acudir a la cita', hint: married(s, target) ? 'Peligroso para un matrimonio… y emocionante.' : 'El corazón manda.', effects: [{ type: 'char', op: 'lovers', a: target.id, b: admirer.id }, ...(spy ? [{ type: 'relations', other: from.tag, amount: 10 } as Effect, { type: 'x', tag: from.tag, key: `secret_${s.player}`, amount: 1 } as Effect] : [{ type: 'relations', other: from.tag, amount: 25 } as Effect, { type: 'prestige', amount: 5 } as Effect])] },
          { label: 'Responder con una galantería… y nada más', effects: [{ type: 'relations', other: from.tag, amount: 10 }] },
          { label: 'Entregar la carta a tu canciller', hint: 'Por si fuera una trampa.', effects: spy ? [{ type: 'relations', other: from.tag, amount: -25 }, { type: 'prestige', amount: 15 }] : [{ type: 'relations', other: from.tag, amount: -10 }] },
        ],
      });
    }
  }
}

/** a royal wedding for the player gets its first-night moment (tasteful) */
export function weddingNight(s: GameState, c: Character, k: Character) {
  const mine = c.tag === s.player ? c : k.tag === s.player ? k : null;
  if (!mine) return;
  const other = mine === c ? k : c;
  tryEvent(s, s.player, {
    title: 'Los esposos, a solas', image: 'court',
    text: `Se apagan las antorchas del banquete y las puertas de la cámara nupcial se cierran tras ${mine.name} y ${other.name}. Hasta hoy eran casi dos extraños.`,
    options: [
      { label: 'Galantería, vino y poesía hasta el alba', hint: 'Un matrimonio enamorado da más hijos.', effects: [{ type: 'char', op: 'inLove', a: mine.id }, { type: 'char', op: 'inLove', a: other.id }, { type: 'prestige', amount: 5 }] },
      { label: 'Cumplir con el deber y dormir', effects: [] },
      { label: 'Frialdad: es un pacto, no un idilio', hint: 'Las relaciones con su familia se resienten.', effects: [{ type: 'relations', other: other.tag === s.player ? mine.tag : other.tag, amount: -15 }] },
    ],
  });
}

const isFav = (c: Character | null | undefined) => !!c && (c.traits.includes('favorito') || c.traits.includes('favorita'));
const NAMES_F = ['Leonor', 'Beatriz', 'Isabela', 'Catalina', 'Violante', 'Mencía', 'Brianda', 'Aldonza', 'Inés', 'Juliana'];
const NAMES_M = ['Rodrigo', 'Gonzalo', 'Íñigo', 'Lope', 'Beltrán', 'Diego', 'Garcilaso', 'Hernando', 'Álvaro', 'Gastón'];
const pickName = (s: GameState, female: boolean) => pick(s, female ? NAMES_F : NAMES_M);

/** the player's court: favourites, duels, impossible loves and other temptations */
function playerIntrigues(s: GameState) {
  const me = s.nations[s.player];
  const r = rulerOf(s, me);
  if (!r?.alive) return;
  const lover = r.lover ? s.characters[r.lover] : null;
  // an official favourite: glamour and expense, envy at court
  if (lover?.alive && isFav(lover)) {
    me.prestige += 0.4;
    me.treasury -= 1.2;
    if (s.era === 'medieval') me.x.piety = (me.x.piety ?? 0) - 0.4;
    const sp = r.spouse ? s.characters[r.spouse] : null;
    if (sp?.alive && sp.tag !== me.tag && s.nations[sp.tag]) addRelation(s, sp.tag, me.tag, -1);
    if (chance(s, 0.025)) {
      tryEvent(s, s.player, {
        title: `${lover.female ? 'La favorita' : 'El favorito'} pide más`, image: 'romance',
        text: `Entre sedas y susurros, ${lover.name} enreda los dedos en tu pelo y pide, con una sonrisa que no admite un no, un regalo digno de su posición.`,
        options: [
          { label: 'Un collar de esmeraldas', hint: 'Su gratitud será… memorable.', effects: [{ type: 'treasury', amount: -60 }, { type: 'prestige', amount: 15 }, { type: 'char', op: 'inLove', a: lover.id }] },
          { label: 'Un título y tierras para su familia', hint: 'La nobleza murmurará.', effects: [{ type: 'treasury', amount: -20 }, { type: 'stability', amount: -1 }, { type: 'prestige', amount: 25 }] },
          { label: 'Un beso en la mano y una negativa', hint: 'Quizá se enfríe la alcoba.', effects: chance(s, 0.4) ? [{ type: 'char', op: 'breakup', a: r.id }, { type: 'prestige', amount: -10 }] : [{ type: 'prestige', amount: -5 }] },
        ],
      });
    }
  }
  // a jealous spouse throws down the glove
  if (lover?.alive && lover.spouse && s.characters[lover.spouse]?.alive && chance(s, 0.012)) {
    const rival = s.characters[lover.spouse];
    const win = Math.min(0.85, Math.max(0.15, 0.5 + (stat(r, 'martial') - stat(rival, 'martial')) * 0.06));
    tryEvent(s, s.player, {
      title: 'Un guante en el suelo', image: 'romance',
      text: `${rival.name}, ${rival.female ? 'esposa' : 'marido'} de ${lover.name}, irrumpe en la sala y arroja un guante a tus pies. Toda la corte calla: exige satisfacción al amanecer.`,
      note: `Tus probabilidades en el campo del honor: ${Math.round(win * 100)} %.`,
      options: [
        { label: 'Aceptar el duelo', hint: 'El honor o la tumba.', effects: rand(s) < win ? [{ type: 'prestige', amount: 60 }, { type: 'char', op: 'kill', a: rival.id, value: 'en duelo' }, { type: 'chronicle', text: `${r.name} se bate en duelo al amanecer y vuelve sin un rasguño. ${rival.name} no.` }] : [{ type: 'prestige', amount: -40 }, { type: 'char', op: 'trait', a: r.id, value: 'enfermizo' }, { type: 'chronicle', text: `${r.name} cae herido en un duelo por amor; la herida nunca curará del todo.` }] },
        { label: 'Enviar a un campeón', hint: 'Cuesta oro y algo de orgullo.', effects: [{ type: 'treasury', amount: -40 }, { type: 'prestige', amount: -10 }] },
        { label: 'Romper con tu amante y pedir disculpas', effects: [{ type: 'char', op: 'breakup', a: r.id }, { type: 'prestige', amount: -25 }] },
      ],
    });
  }
  // the heir falls for someone of low birth
  const heir = me.heirId ? s.characters[me.heirId] : null;
  if (heir?.alive && age(s, heir) >= 18 && age(s, heir) <= 30 && !(heir.spouse && s.characters[heir.spouse]?.alive) && chance(s, 0.008)) {
    const beloved = randomCharacter(s, me.tag, { female: !heir.female, ageYears: Math.max(18, age(s, heir) - 2), dynasty: heir.female ? 'de baja cuna' : 'de baja cuna' });
    beloved.name = pickName(s, beloved.female);
    beloved.traits = ['bello'];
    tryEvent(s, s.player, {
      title: 'Un amor imposible', image: 'romance',
      text: `${heir.name} ha perdido la cabeza por ${beloved.name}, ${beloved.female ? 'una joven' : 'un joven'} sin linaje que trabaja en las cocinas de palacio. Les han visto paseando a medianoche por las murallas.`,
      options: [
        { label: 'Que se casen: el amor también es política', hint: 'Escándalo en las cortes, pero un heredero feliz.', effects: [{ type: 'prestige', amount: -50 }, { type: 'char', op: 'marry', a: heir.id, b: beloved.id }, { type: 'chronicle', text: `${heir.name} desafía a la corte y declara su amor por ${beloved.name}.` }] },
        { label: 'Que sea su amante en secreto', hint: 'Nadie tiene por qué enterarse… todavía.', effects: [{ type: 'char', op: 'lovers', a: heir.id, b: beloved.id }] },
        { label: 'Alejar a esa persona de la corte', hint: 'El heredero no lo olvidará.', effects: [{ type: 'char', op: 'banish', a: beloved.id }, { type: 'char', op: 'trait', a: heir.id, value: 'cínico' }] },
      ],
    });
  }
}

export const romanceActions: ActionDef[] = [
  {
    id: 'make_favorite', label: 'Nombrar favorito/a', group: 'Corte', hidden: true,
    description: 'Tu amante pasa a la luz: título, aposentos junto a los tuyos y joyas. Prestigio y glamour… a cambio de oro, envidias y un cónyuge herido.',
    args: [{ key: 'character', label: 'Soberano', kind: 'character' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const c = s.characters[a.character as string];
      const l = c?.lover ? s.characters[c.lover] : null;
      if (!c || c.id !== s.nations[tag].rulerId) return 'Solo el soberano puede tener favorito/a';
      if (!l?.alive) return 'No hay amante a quien nombrar';
      return isFav(l) ? 'Ya es favorito/a oficial' : true;
    },
    run: (s, tag, a) => {
      const c = s.characters[a.character as string];
      const l = s.characters[c.lover!];
      l.traits.push(l.female ? 'favorita' : 'favorito');
      const sp = c.spouse ? s.characters[c.spouse] : null;
      if (sp?.alive) sp.inLove = false;
      s.nations[tag].prestige += 20;
      log(s, `${l.name} es proclamad${l.female ? 'a favorita' : 'o favorito'} de ${c.name}. La corte entera sabe ya dónde pasa las noches.`, [tag], 'story');
    },
  },
  {
    id: 'masked_ball', label: 'Baile de máscaras', group: 'Corte', hidden: true,
    description: 'Una noche de música, antifaces y jardines en penumbra. Puede salir un romance, una alianza… o un escándalo.',
    cost: () => '40 de oro · una vez al año',
    available: (s, tag) => {
      const n = s.nations[tag];
      if (n.treasury < 40) return 'Hacen falta 40 de oro';
      if (s.day - (n.flags.masked_ball ?? -9999) < 365) return 'La corte aún habla del último baile';
      return rulerOf(s, n) ? true : 'No hay soberano';
    },
    run: (s, tag) => {
      const n = s.nations[tag];
      const r = rulerOf(s, n)!;
      n.treasury -= 40; n.flags.masked_ball = s.day;
      const realms = livingNations(s).filter((x) => x.tag !== tag && !x.x.pseudo);
      const used = new Set<string>([r.name, ...(r.spouse && s.characters[r.spouse] ? [s.characters[r.spouse].name] : [])]);
      const mk = () => {
        const from = realms.length ? pick(s, realms) : n;
        const g = randomCharacter(s, from.tag, { female: !r.female, ageYears: Math.max(20, age(s, r) - 4 - Math.round(rand(s) * 10)) });
        const pool = (g.female ? NAMES_F : NAMES_M).filter((x) => !used.has(x));
        g.name = pool.length ? pick(s, pool) : pickName(s, g.female);
        used.add(g.name);
        g.traits = [pick(s, ['bello', 'seductor', 'lujurioso', 'ambicioso'])];
        return { g, from };
      };
      const [a1, a2, a3] = [mk(), mk(), mk()];
      const sp = r.spouse ? s.characters[r.spouse] : null;
      tryEvent(s, tag, {
        title: 'Baile de máscaras', image: 'romance',
        text: `Antorchas, violines y antifaces de seda. Tres miradas te buscan entre la multitud: ${a1.g.name}, de la corte de ${a1.from.name}; ${a2.g.name}, que no deja de sonreír desde la galería; y ${a3.g.name}, que te roza la mano al pasar y desaparece hacia los jardines.`,
        options: [
          { label: `Seguir a ${a3.g.name} a los jardines`, hint: 'Lo que pasa en el laberinto de setos…', effects: [{ type: 'char', op: 'lovers', a: r.id, b: a3.g.id }, { type: 'relations', other: a3.from.tag, amount: 15 }] },
          { label: `Bailar toda la noche con ${a1.g.name}`, hint: 'Un flirteo diplomático: relaciones sin compromisos.', effects: [{ type: 'relations', other: a1.from.tag, amount: 35 }, { type: 'prestige', amount: 10 }] },
          ...(sp?.alive ? [{ label: `Quitarle el antifaz a ${sp.name} y bailar solo con ${sp.female ? 'ella' : 'él'}`, hint: 'El amor conyugal también puede ser escandaloso.', effects: [{ type: 'char', op: 'inLove', a: r.id }, { type: 'char', op: 'inLove', a: sp.id }] as Effect[] }] : []),
          { label: `Una copa de más con ${a2.g.name}`, hint: 'A la mañana siguiente, todo el reino lo sabrá.', effects: [{ type: 'char', op: 'lovers', a: r.id, b: a2.g.id }, { type: 'prestige', amount: -15 }, ...(sp?.alive ? [{ type: 'char', op: 'trait', a: sp.id, value: 'celoso' } as Effect] : [])] },
        ],
      });
    },
  },
  {
    id: 'love_potion', label: 'Filtro de amor', group: 'Corte', hidden: true,
    description: 'El boticario jura que su elixir vuelve irresistible a quien lo bebe. Mejora mucho la próxima seducción… si no es veneno.',
    cost: () => '25 de oro',
    available: (s, tag) => (s.nations[tag].treasury >= 25 ? true : 'Hacen falta 25 de oro'),
    run: (s, tag) => {
      const n = s.nations[tag];
      n.treasury -= 25;
      if (rand(s) < 0.12) { const r = rulerOf(s, n); if (r) { r.traits.push('enfermizo'); log(s, `El «filtro de amor» del boticario sienta fatal a ${r.name}. El boticario ha huido.`, [tag], 'story'); } }
      else { n.x.potion = 1; log(s, 'Un frasquito de cristal azul espera en tu tocador. Huele a jazmín y a promesas.', [tag], 'story'); }
    },
  },
  {
    id: 'seduce', label: 'Seducir', group: 'Corte', hidden: true,
    description: 'Un juego de miradas, cartas y encuentros discretos. Si sale bien, nace una relación secreta; si sale mal, un escándalo.',
    args: [{ key: 'character', label: 'Seductor', kind: 'character' }, { key: 'target', label: 'Objetivo', kind: 'character' }],
    available: (s, tag, a) => {
      if (!a) return true;
      const c = s.characters[a.character as string], b = s.characters[a.target as string];
      if (!c || !b || c.tag !== tag) return 'Elige a alguien de tu corte';
      if (c.lover && s.characters[c.lover]?.alive) return `${c.name} ya tiene un amor secreto`;
      return seductionChance(s, c, b) > 0 ? true : 'Imposible';
    },
    run: (s, tag, a) => {
      const c = s.characters[a.character as string], b = s.characters[a.target as string];
      const n0 = s.nations[tag];
      const p = Math.min(0.95, seductionChance(s, c, b) + (n0.x.potion ? 0.3 : 0));
      if (n0.x.potion) delete n0.x.potion;
      const rb = s.nations[b.tag];
      if (rand(s) < p) {
        c.lover = b.id; b.lover = c.id;
        if (rb && rb.tag !== tag) {
          addRelation(s, b.tag, tag, 20);
          if (rb.rulerId === b.id || rb.heirId === b.id || rulerOf(s, rb)?.spouse === b.id) s.nations[tag].x[`secret_${rb.tag}`] = 1;
        }
        log(s, `Tras semanas de miradas y billetes escondidos, ${c.name} y ${b.name} se entregan a un amor secreto.`, [tag], 'story');
      } else {
        scandal(s, c, b, false);
        log(s, `${b.name} rechaza con un desaire público los avances de ${c.name}. La corte no habla de otra cosa.`, [tag, b.tag], 'story');
      }
    },
  },
  {
    id: 'end_affair', label: 'Poner fin al romance', group: 'Corte', hidden: true, description: 'Una última carta y adiós.',
    args: [{ key: 'character', label: 'Personaje', kind: 'character' }],
    run: (s, _tag, a) => { const c = s.characters[a.character as string]; if (c?.lover && s.characters[c.lover]) s.characters[c.lover].lover = null; if (c) c.lover = null; },
  },
  {
    id: 'legitimize', label: 'Legitimar', group: 'Corte', hidden: true, description: 'Reconocer a un hijo ilegítimo: podrá heredar.',
    args: [{ key: 'character', label: 'Hijo', kind: 'character' }],
    available: (s, tag) => (s.nations[tag].prestige >= 60 ? true : 'Requiere 60 de prestigio'),
    cost: () => '60 de prestigio',
    run: (s, tag, a) => { const c = s.characters[a.character as string]; if (!c) return; c.bastard = false; s.nations[tag].prestige -= 60; log(s, `${c.name} es legitimad${o_a(c)} por decreto real.`, [tag], 'story'); },
  },
  {
    id: 'blackmail', label: 'Chantaje de alcoba', group: 'Corte', hidden: true,
    description: 'Conoces un secreto íntimo de otra corte. Puedes cobrarlo en oro o en una alianza… a riesgo de ganarte un enemigo.',
    args: [{ key: 'target', label: 'Reino', kind: 'nation' }, { key: 'demand', label: 'Exigencia', kind: 'choice', options: [{ value: 'gold', label: 'Oro' }, { value: 'alliance', label: 'Alianza' }] }],
    available: (s, tag, a) => (!a ? true : s.nations[tag].x[`secret_${a.target}`] || s.nations[tag].x[`leak_${a.target}`] ? true : 'No conoces ningún secreto de esa corte'),
    run: (s, tag, a) => {
      const t = a.target as string, n = s.nations[tag], o = s.nations[t];
      delete n.x[`secret_${t}`]; delete n.x[`leak_${t}`];
      if (!o?.alive) return;
      if (a.demand === 'alliance' && !n.allies.includes(t)) {
        n.allies.push(t); o.allies.push(tag);
        addRelation(s, t, tag, -40);
        log(s, `Con un secreto de alcoba como argumento, ${n.name} arranca una alianza a ${o.name}.`, [tag, t], 'story');
      } else {
        const g = Math.max(30, Math.round(o.treasury * 0.25));
        o.treasury -= g; n.treasury += g;
        addRelation(s, t, tag, -50);
        log(s, `${o.name} paga ${g} para que cierto secreto no salga de palacio.`, [tag, t], 'story');
      }
    },
  },
];

export { canMarry, ella };
