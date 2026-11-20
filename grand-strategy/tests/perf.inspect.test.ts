import { it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { createGame, rules, step } from '@/engine/core';
// PF=1 SC=x npx vitest run tests/perf.inspect.test.ts — where does a simulated day go?
it.skipIf(!process.env.PF)('perf', () => {
  const s = createGame(SCENARIOS.find((x) => x.id === (process.env.ID ?? 'mod2014'))!, 'XXX_NONE', 7);
  const r = rules(s) as unknown as Record<string, (...a: unknown[]) => unknown>;
  const acc: Record<string, number> = {};
  for (const k of ['daily', 'monthly', 'ai']) {
    const f = r[k].bind(r);
    r[k] = (...a: unknown[]) => { const t = performance.now(); const v = f(...a); acc[k] = (acc[k] ?? 0) + performance.now() - t; return v; };
  }
  const t0 = performance.now();
  for (let i = 0; i < 365; i++) { step(s); s.pendingEvents = []; }
  const total = performance.now() - t0;
  console.log(`total ${total.toFixed(0)} ms/año · ${(total / 365).toFixed(1)} ms/día · ` + Object.entries(acc).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(' · '));
}, 600000);
