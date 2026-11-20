import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, createGame, provincesOf, step } from '@/engine/core';
import { formatDate } from '@/engine/util';
import { it } from 'vitest';
it('inspect', () => {
  for (const id of (process.env.SC ?? 'med1066').split(',')) {
    const sc = SCENARIOS.find((s) => s.id === id)!;
    const s = createGame(sc, 'XXX_NONE', 7);
    const years = Number(process.env.Y ?? 5);
    for (let i = 0; i < 365 * years; i++) { step(s); while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 }); }
    const unowned = Object.values(s.provinces).filter((p) => !p.owner).map((p) => p.id);
    console.log(`== ${id} unowned: ${unowned.join(',')}`);
    console.log(s.log.filter((l) => ['war', 'peace', 'event', 'diplo'].includes(l.kind)).slice(0, Number(process.env.N ?? 70)).map((l) => `${formatDate(l.day)}: ${l.text}`).join('\n'));
    const top = Object.values(s.nations).filter((n) => n.alive && !n.x.pseudo).sort((a, b) => provincesOf(s, b.tag).length - provincesOf(s, a.tag).length).slice(0, 8);
    console.log(top.map((n) => `${n.tag}:${provincesOf(s, n.tag).length}`).join(' '));
  }
});
