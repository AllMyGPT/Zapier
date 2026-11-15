import type { NationDef } from '@/engine/core';
import type { GameEvent } from '@/engine/types';

type Extra = Partial<Omit<NationDef, 'tag' | 'name' | 'color' | 'capital' | 'provinces' | 'religion' | 'culture' | 'government'>>;
export function N(tag: string, name: string, color: string, provinces: string[], religion: string, culture: string, government: string, extra: Extra = {}): NationDef {
  return { tag, name, color, capital: provinces[0], provinces, religion, culture, government, ...extra };
}
export const yes = 'Adelante';
export function ev(e: GameEvent): GameEvent { return { oneShot: true, ...e }; }
