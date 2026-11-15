import { it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, createGame, missionStatus, missionsOf, nationScore, provincesOf, step } from '@/engine/core';

// PT=1 SC=x npx vitest run tests/playtest.inspect.test.ts — a passive player in each scenario: what does the game throw at them?
it.skipIf(!process.env.PT)('playtest', () => {
  const years = Number(process.env.Y ?? 10);
  for (const sc of SCENARIOS) {
    for (const tag of (sc.recommended ?? []).slice(0, Number(process.env.NN ?? 2))) {
      const s = createGame(sc, tag, 21);
      const p0 = provincesOf(s, tag).length;
      let popups = 0, romance = 0, peace = 0, claimed = 0, dispatches = 0, firstWar = -1, maxQueue = 0;
      const titles: Record<string, number> = {};
      for (let i = 0; i < 365 * years; i++) {
        const before = s.log[s.log.length - 1];
        step(s);
        const k = before ? s.log.lastIndexOf(before) : -1;
        for (const l of s.log.slice(k + 1)) if (l.tags.includes(tag) && ['war', 'peace', 'character', 'battle', 'mission', 'story'].includes(l.kind)) { dispatches++; if (l.kind === 'war' && firstWar < 0) firstWar = i; }
        maxQueue = Math.max(maxQueue, s.pendingEvents.length);
        while (s.pendingEvents.length) {
          const ev = s.events.find((e) => e.id === s.pendingEvents[0].eventId);
          popups++; if (ev?.id.startsWith('rom_')) romance++;
          if (ev) titles[ev.title] = (titles[ev.title] ?? 0) + 1;
          applyCommand(s, tag, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
        }
        for (const o of s.peaceOffers.filter((x) => x.to === tag)) { peace++; applyCommand(s, tag, { type: 'answerPeace', offerId: o.id, accept: false }); }
        if (i % 30 === 0) for (const m of missionsOf(s, tag)) if (missionStatus(s, tag, m) === 'ready') { applyCommand(s, tag, { type: 'claimMission', id: m.id }); claimed++; }
        if (s.gameOver) break;
      }
      const rep = Object.entries(titles).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t, v]) => `${t}×${v}`).join(', ');
      console.log(`${sc.id}/${tag}: ventanas ${(popups / years).toFixed(1)}/año (romance ${romance}) · cola máx ${maxQueue} · ofertas de paz ${peace} · objetivos ${claimed}/${missionsOf(s, tag).length} · avisos ${(dispatches / years).toFixed(0)}/año · 1.ª guerra ${firstWar < 0 ? 'nunca' : `día ${firstWar}`} · provincias ${p0}→${provincesOf(s, tag).length} · puntuación ${nationScore(s, tag)}${s.gameOver ? ` · FIN: ${s.gameOver}` : ''}${rep ? ` · repetidos: ${rep}` : ''}`);
    }
  }
}, 1800000);
