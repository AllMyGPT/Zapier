import { it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, armiesOf, createGame, livingNations, step } from '@/engine/core';
it.skipIf(!process.env.EC)('econ', () => {
  const s = createGame(SCENARIOS.find((x) => x.id === 'em1492')!, 'XXX_NONE', 7);
  for (let y = 0; y < 60; y++) {
    for (let i = 0; i < 365; i++) { step(s); while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 }); }
    if (y % 10 === 9) {
      const ns = livingNations(s).filter((n) => !n.x.pseudo);
      const neg = ns.filter((n) => Object.values(n.lastIncome).reduce((a, b) => a + b, 0) < 0).length;
      const loans = ns.reduce((t, n) => t + (n.x.loans ?? 0), 0) / ns.length;
      const units = ns.reduce((t, n) => t + armiesOf(s, n.tag).reduce((u, a) => u + a.units.length, 0), 0) / ns.length;
      const big = ns.slice().sort((a, b) => b.stability - a.stability).slice(-3).map((n) => `${n.tag}:${n.stability.toFixed(1)} t${Math.round(n.treasury)} net${Object.values(n.lastIncome).reduce((a, b) => a + b, 0).toFixed(1)} heresy${Object.values(s.provinces).filter((p) => p.owner === n.tag && p.religion !== n.religion).length}`);
      console.log(`año ${1492 + y}: déficit ${neg}/${ns.length} · préstamos medios ${loans.toFixed(1)} · unidades medias ${units.toFixed(1)} · peores ${big.join(' ')}`);
    }
  }
}, 600000);
