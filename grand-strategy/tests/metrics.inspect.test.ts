import { it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { applyCommand, createGame, nationScore, provincesOf, step } from '@/engine/core';

// SC=med1066 Y=30 npx vitest run tests/metrics.inspect.test.ts — dynamics profile of an AI-only run
it.skipIf(!process.env.SC)('metrics', () => {
  for (const id of process.env.SC!.split(',')) {
    const sc = SCENARIOS.find((x) => x.id === id)!;
    const s = createGame(sc, 'XXX_NONE', Number(process.env.SEED ?? 11));
    const years = Number(process.env.Y ?? 30);
    const start = Object.fromEntries(Object.values(s.nations).map((n) => [n.tag, provincesOf(s, n.tag).length]));
    const per: Record<number, Record<string, number>> = {};
    const all: typeof s.log = [];
    for (let i = 0; i < 365 * years; i++) {
      const before = s.log[s.log.length - 1];
      step(s);
      const k = before ? s.log.lastIndexOf(before) : -1;
      all.push(...s.log.slice(k + 1));
      while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
    }
    const count = (re: RegExp, kind?: string) => all.filter((l) => (!kind || l.kind === kind) && re.test(l.text)).length;
    const decade = (re: RegExp) => { const d: Record<number, number> = {}; for (const l of all) if (re.test(l.text)) { const k = Math.floor((l.day - s.startDay) / 3650); d[k] = (d[k] ?? 0) + 1; } return Object.values(d).join('/'); };
    console.log(`== ${id} (${years} años)`);
    console.log(`guerras declaradas ${count(/declara la guerra|Guerra de sucesión|Revuelta de/)} [por década ${decade(/declara la guerra/)}] · paces ${count(/^Paz entre/)} · batallas ${count(/^Batalla de/)} · provincias caídas ${count(/ha caído en manos/)}`);
    console.log(`revueltas ${count(/Revuelta|rebeldes|rebelde/i)} · naciones extintas ${count(/ha dejado de existir/)} · objetivos ${count(/cumple el objetivo/)} · eventos históricos ${count(/.*/, 'event')}`);
    console.log(`sucesiones ${count(/sucede en el trono|nuevo monarca|hereda|crisis sucesoria|nueva casa/)} · bodas reales ${count(/Boda real/)} · alianzas matrimoniales ${count(/Alianza matrimonial/)} · uniones personales ${count(/unión personal/)} · pretendientes ${count(/pretendiente|derecho de sangre/)}`);
    const rows = Object.values(s.nations).filter((n) => n.alive && !n.x.pseudo && !n.liege).map((n) => ({ t: n.tag, sc: nationScore(s, n.tag), p: provincesOf(s, n.tag).length, d: provincesOf(s, n.tag).length - (start[n.tag] ?? 0) })).sort((a, b) => b.sc - a.sc);
    console.log('top ' + rows.slice(0, 8).map((r) => `${r.t}:${r.p}(${r.d >= 0 ? '+' : ''}${r.d})`).join(' '));
    console.log(`vivas ${rows.length} · guerras activas ${s.wars.length} · dinastías con renombre ${Object.keys(s.dynasties ?? {}).length}`);
    void per;
  }
});
