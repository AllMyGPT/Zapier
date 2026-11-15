import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { adjacency } from '@/engine/map';
import { applyCommand, createGame, deserialize, livingNations, makePeace, rules, serialize, step, transferProvince, warScore } from '@/engine/core';
import { dayFromISO, formatDate } from '@/engine/util';

describe('calendar', () => {
  it('round-trips dates', () => {
    expect(formatDate(dayFromISO('1066-01-06'))).toBe('6 de enero de 1066');
    expect(formatDate(dayFromISO('0300-03-01'))).toBe('1 de marzo de 300');
  });
});

describe('map', () => {
  it('connects mainland provinces', () => {
    const g = adjacency('earth');
    expect(g.ile_de_france.map((e) => e.to)).toContain('champagne');
    expect(g.london.some((e) => e.to === 'picardie')).toBe(true);
    for (const [id, edges] of Object.entries(g)) expect(edges.length, id).toBeGreaterThan(0);
    const f = adjacency('valdoria');
    for (const [id, edges] of Object.entries(f)) expect(edges.length, id).toBeGreaterThan(0);
  });
});

describe.each(SCENARIOS.map((s) => [s.id, s] as const))('scenario %s', (_id, sc) => {
  it('simulates 3 years without errors and stays serialisable', () => {
    const player = sc.recommended![0];
    let s = createGame(sc, player, 42);
    expect(s.nations[player].alive).toBe(true);
    for (let i = 0; i < 365 * 3; i++) {
      step(s);
      // the player never answers: auto-pick option 0 so events don't pile up
      while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
      for (const o of [...s.peaceOffers]) applyCommand(s, s.player, { type: 'answerPeace', offerId: o.id, accept: false });
    }
    s = deserialize(serialize(s));
    for (const w of s.wars) expect(Math.abs(warScore(s, w, w.attackers[0]))).toBeLessThanOrEqual(100);
    expect(livingNations(s).length).toBeGreaterThan(3);
    for (const a of Object.values(s.armies)) expect(s.provinces[a.location]).toBeDefined();
  }, 60000);
});

describe('peace & territory rules', () => {
  it('moves the capital of a surviving nation that cedes it', () => {
    const s = createGame(SCENARIOS.find((x) => x.id === 'med1066')!, 'ENG', 1);
    transferProvince(s, 'london', 'NRM');
    expect(s.nations.ENG.capital).not.toBe('london');
    expect(s.provinces[s.nations.ENG.capital].owner).toBe('ENG');
  });
  it('a secondary coalition member only makes a separate peace with the enemy leader', () => {
    const s = createGame(SCENARIOS.find((x) => x.id === 'ww1939')!, 'ENG', 1);
    for (let i = 0; i < 3; i++) step(s);
    const w = s.wars.find((x) => x.attackers[0] === 'GER' && x.defenders.includes('ENG'))!;
    expect(w.defenders[0]).toBe('POL');
    makePeace(s, { warId: w.id, from: 'ENG', to: 'GER', provinces: [], gold: 0, extra: null });
    const still = s.wars.find((x) => x.id === w.id)!;
    expect(still).toBeDefined();
    expect(still.defenders).not.toContain('ENG');
    expect(still.defenders).toContain('POL');
  });
  it('WW2 garrisons require an owned province', () => {
    const s = createGame(SCENARIOS.find((x) => x.id === 'ww1939')!, 'GER', 1);
    s.provinces.mazovia.controller = 'GER';
    const act = rules(s).actions.find((a) => a.id === 'garrison')!;
    expect(act.available!(s, 'GER', { province: 'mazovia' })).not.toBe(true);
    expect(act.available!(s, 'GER', { province: 'brandenburg' })).toBe(true);
  });
});
