import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, armyStrength, createGame, provincesOf, step } from '@/engine/core';
import { formatDate } from '@/engine/util';
import { it } from 'vitest';
it('debug', () => {
  const s = createGame(SCENARIOS.find((x) => x.id === (process.env.SC ?? 'ww1939'))!, 'XXX', 7);
  const T = process.env.T ?? 'GER';
  for (let i = 0; i < 365 * Number(process.env.Y ?? 1); i++) {
    step(s); while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
    if (i % 30 === 0) {
      const lost = provincesOf(s, T).filter((p) => p.controller !== T).map((p) => `${p.id}@${p.controller}`);
      const pow = (t: string) => Object.values(s.armies).filter((a) => a.owner === t).reduce((x, a) => x + armyStrength(s, a), 0).toFixed(0);
      console.log(formatDate(s.day), 'lost:', lost.join(' '), '| pow', T, pow(T), 'POL', pow('POL'), 'FRA', pow('FRA'), 'ENG', pow('ENG'), 'SOV', pow('SOV'), '| wars', s.wars.map((w) => w.attackers.join('/') + ' v ' + w.defenders.join('/')).join(' ; '));
    }
  }
});
