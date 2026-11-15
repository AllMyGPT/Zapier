import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '@/data/scenarios';
import { MAPS } from '@/data/maps';
import { applyCommand, createGame, step } from '@/engine/core';
import type { Condition, Effect } from '@/engine/types';

// Story content must only reference things that exist, or chains silently break.
describe('story content', () => {
  for (const sc of SCENARIOS) {
    it(`${sc.id}: references are valid`, () => {
      const provs = new Set(MAPS[sc.map ?? 'earth'].rows.map((r) => r[0]));
      const tags = new Set(sc.nations.map((n) => n.tag));
      const events = new Set((sc.events ?? []).map((e) => e.id));
      const missions = new Set((sc.missions ?? []).map((m) => m.id));
      const errs: string[] = [];
      const ids = [...(sc.events ?? []).map((e) => e.id), ...(sc.missions ?? []).map((m) => m.id)];
      const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
      if (dup.length) errs.push(`duplicate ids: ${dup.join(',')}`);
      const tag = (t: string | undefined, where: string) => { if (t && !tags.has(t)) errs.push(`${where}: unknown tag ${t}`); };
      const prov = (p: string, where: string) => { if (!provs.has(p)) errs.push(`${where}: unknown province ${p}`); };
      const cond = (c: Condition, where: string) => {
        if ('tag' in c) tag(c.tag, where);
        if ('other' in c) tag(c.other, where);
        if ('province' in c) prov(c.province, where);
        if ('provinces' in c) c.provinces.forEach((p) => prov(p, where));
        if (c.type === 'missionDone' && !missions.has(c.mission)) errs.push(`${where}: unknown mission ${c.mission}`);
      };
      const eff = (e: Effect, where: string) => {
        if ('tag' in e) tag(e.tag, where);
        if ('other' in e) tag(e.other, where);
        if ('target' in e) tag(e.target, where);
        if (e.type === 'cede') { tag(e.from, where); tag(e.to, where); }
        if ('province' in e) prov(e.province, where);
        if ('provinces' in e) e.provinces.forEach((p) => prov(p, where));
        if (e.type === 'declareWar' && e.goal) prov(e.goal, where);
        if (e.type === 'release') tag(e.target, where);
        if (e.type === 'trigger' && !events.has(e.event)) errs.push(`${where}: trigger to unknown event ${e.event}`);
      };
      for (const e of sc.events ?? []) {
        tag(e.tag, e.id);
        e.condition?.forEach((c) => cond(c, e.id));
        e.options.forEach((o) => o.effects.forEach((x) => eff(x, e.id)));
        if (!e.options.length) errs.push(`${e.id}: no options`);
      }
      for (const m of sc.missions ?? []) {
        tag(m.tag, m.id);
        m.requires?.forEach((r) => { if (!missions.has(r)) errs.push(`${m.id}: requires unknown ${r}`); });
        m.conditions.forEach((c) => cond(c, m.id));
        m.rewards.forEach((x) => eff(x, m.id));
      }
      expect(errs).toEqual([]);
    });
    it.skipIf(!sc.options?.fullWorld)(`${sc.id}: the whole world is owned`, () => {
      const s = createGame(sc, sc.recommended?.[0] ?? sc.nations[0].tag, 1);
      const empty = Object.values(s.provinces).filter((p) => !p.owner).map((p) => p.id);
      expect(empty).toEqual([]);
    });
    it(`${sc.id}: 2 years run with the story layer`, () => {
      const s = createGame(sc, sc.recommended?.[0] ?? sc.nations[0].tag, 3);
      for (let i = 0; i < 365 * 2; i++) {
        step(s);
        while (s.pendingEvents.length) applyCommand(s, s.player, { type: 'eventChoice', eventId: s.pendingEvents[0].eventId, option: 0 });
      }
      expect(s.day).toBeGreaterThan(s.startDay);
    });
  }
});
