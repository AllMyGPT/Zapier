import type { Era, GameEvent, Mission } from '@/engine/types';
import * as medieval from './medieval';
import * as earlymodern from './earlymodern';
import * as ww2 from './ww2';

const ERA = { medieval, earlymodern, ww2 } as const;

/** Extra story content merged into a scenario: its own chains + the era's dynamic pool. */
export function storyFor(scenarioId: string, era: Era, artEra?: string): { events: GameEvent[]; missions: Mission[] } {
  // contemporary scenarios carry their own pool; the Great War shares the industrial-war pool
  if (artEra === 'modern') return { events: [], missions: [] };
  const e = ERA[era];
  const own = e.STORY[scenarioId] ?? { events: [], missions: [] };
  return { events: [...own.events, ...e.POOL], missions: own.missions };
}
