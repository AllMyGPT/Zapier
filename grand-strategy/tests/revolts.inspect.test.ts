import { it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, createGame, livingNations, step } from '@/engine/core';
import { dateOf } from '@/engine/util';

// RV=1 npx vitest run tests/revolts.inspect.test.ts — revolts and stability per decade in 1492
it.skipIf(!process.env.RV)('revolts', () => {
  const s = createGame(SCENARIOS.find((x) => x.id === 'em1492')!, 'XXX_NONE', 7);
  const rows: string[] = [];
  let rev = 0, held = 0;
  for (let i = 0; i < 365 * Number(process.env.Y ?? 100); i++) {
    const before = s.log[s.log.length - 1];
    step(s);
    const k = before ? s.log.lastIndexOf(before) : -1;
    for (const l of s.log.slice(k + 1)) { if (l.text.startsWith('¡Revuelta en')) rev++; if (l.text.includes('obtienen concesiones')) held++; }
    while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
    if (i % 3650 === 3649) {
      const ns = livingNations(s).filter((n) => !n.x.pseudo);
      const stab = ns.reduce((t, n) => t + n.stability, 0) / ns.length;
      const unrest = Object.values(s.provinces).filter((p) => p.owner).reduce((t, p) => t + p.unrest, 0) / Object.values(s.provinces).filter((p) => p.owner).length;
      const infl = ns.reduce((t, n) => t + (n.x.inflation ?? 0), 0) / ns.length;
      rows.push(`${dateOf(s.day).y}: revueltas ${rev} · concesiones ${held} · estabilidad media ${stab.toFixed(2)} · malestar medio ${unrest.toFixed(2)} · inflación ${infl.toFixed(1)} · guerras ${s.wars.length} · REB ${Object.values(s.provinces).filter((p) => p.controller === 'REB').length}`);
      rev = 0; held = 0;
    }
  }
  console.log(rows.join('\n'));
}, 600000);
