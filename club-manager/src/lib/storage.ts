import type { GameState } from '@/game/types';
import { supabase } from './supabase';
import { seasonLabel } from '@/game/calendar';

export interface SaveMeta { slot: number; name: string; club: string; season: string; updated_at: string; where: 'local' | 'cloud' }

async function gzip(text: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') return 'raw:' + text;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = ''; const CH = 0x8000;
  for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode(...buf.subarray(i, i + CH));
  return 'gz:' + btoa(bin);
}
async function gunzip(data: string): Promise<string> {
  if (data.startsWith('raw:')) return data.slice(4);
  const bin = atob(data.slice(3));
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

function meta(gs: GameState, slot: number, where: 'local' | 'cloud'): SaveMeta {
  return { slot, name: gs.manager.name, club: gs.clubs[gs.manager.clubId]?.name ?? '', season: seasonLabel(gs.season), updated_at: new Date().toISOString(), where };
}

const LKEY = (slot: number) => `pizarra-save-${slot}`;
const MKEY = 'pizarra-saves-meta';

export function localList(): SaveMeta[] {
  try { return JSON.parse(localStorage.getItem(MKEY) || '[]'); } catch { return []; }
}
export async function saveLocal(gs: GameState, slot: number) {
  const data = await gzip(JSON.stringify(gs));
  try {
    localStorage.setItem(LKEY(slot), data);
    const list = localList().filter(m => m.slot !== slot); list.push(meta(gs, slot, 'local'));
    localStorage.setItem(MKEY, JSON.stringify(list));
    return true;
  } catch { return false; }
}
export async function loadLocal(slot: number): Promise<GameState | null> {
  try { const d = localStorage.getItem(LKEY(slot)); return d ? JSON.parse(await gunzip(d)) : null; } catch { return null; }
}
export function deleteLocal(slot: number) {
  try { localStorage.removeItem(LKEY(slot)); localStorage.setItem(MKEY, JSON.stringify(localList().filter(m => m.slot !== slot))); } catch { /* ignore */ }
}

export async function cloudList(): Promise<SaveMeta[]> {
  const sb = supabase(); if (!sb) return [];
  const { data, error } = await sb.from('saves').select('slot,name,club,season,updated_at').order('slot');
  if (error || !data) return [];
  return data.map(d => ({ ...d, where: 'cloud' as const }));
}
export async function saveCloud(gs: GameState, slot: number): Promise<string | null> {
  const sb = supabase(); if (!sb) return 'Supabase no está configurado';
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return 'Inicia sesión para guardar en la nube';
  const m = meta(gs, slot, 'cloud');
  const data = await gzip(JSON.stringify(gs));
  const { error } = await sb.from('saves').upsert({ user_id: u.user.id, slot, name: m.name, club: m.club, season: m.season, data, updated_at: m.updated_at }, { onConflict: 'user_id,slot' });
  return error ? error.message : null;
}
export async function loadCloud(slot: number): Promise<GameState | null> {
  const sb = supabase(); if (!sb) return null;
  const { data, error } = await sb.from('saves').select('data').eq('slot', slot).single();
  if (error || !data) return null;
  return JSON.parse(await gunzip(data.data));
}
export async function deleteCloud(slot: number) { const sb = supabase(); if (sb) await sb.from('saves').delete().eq('slot', slot); }
