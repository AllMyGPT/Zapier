import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { GameState } from '@/engine/types';
import { formatDate } from '@/engine/util';

export interface SaveMeta { id: string; name: string; era: string; scenario: string; gameDate: string; updatedAt: string; cloud: boolean }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!url || !key) return null;
  client ??= createClient(url, key);
  return client;
}
export const cloudEnabled = () => !!supabase();

const LS_INDEX = 'gse:index';
function readIndex(): SaveMeta[] { try { return JSON.parse(localStorage.getItem(LS_INDEX) ?? '[]'); } catch { return []; } }
function writeIndex(list: SaveMeta[]) { try { localStorage.setItem(LS_INDEX, JSON.stringify(list)); } catch { /* storage full or blocked */ } }

export async function listSaves(): Promise<SaveMeta[]> {
  const local = readIndex();
  const sb = supabase();
  if (!sb) return local;
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return local;
  const { data, error } = await sb.from('saves').select('id,name,era,scenario,game_date,updated_at').order('updated_at', { ascending: false });
  if (error || !data) return local;
  return [...data.map((r) => ({ id: r.id, name: r.name, era: r.era, scenario: r.scenario, gameDate: r.game_date, updatedAt: r.updated_at, cloud: true })), ...local];
}

export async function saveGame(s: GameState, name: string, cloud: boolean): Promise<string> {
  const meta = { name, era: s.era, scenario: s.scenarioName, gameDate: formatDate(s.day), updatedAt: new Date().toISOString() };
  const sb = supabase();
  if (cloud && sb) {
    const { data: user } = await sb.auth.getUser();
    if (!user.user) throw new Error('Inicia sesión para guardar en la nube');
    const { data, error } = await sb.from('saves').insert({ user_id: user.user.id, name, era: s.era, scenario: s.scenarioName, game_date: meta.gameDate, data: s }).select('id').single();
    if (error) throw new Error(error.message);
    return data.id as string;
  }
  const id = `local-${Date.now()}`;
  try { localStorage.setItem(`gse:save:${id}`, JSON.stringify(s)); } catch { throw new Error('Sin espacio en el almacenamiento local'); }
  writeIndex([{ id, ...meta, cloud: false }, ...readIndex()].slice(0, 20));
  return id;
}

export async function loadGame(meta: SaveMeta): Promise<GameState> {
  if (!meta.cloud) {
    const raw = localStorage.getItem(`gse:save:${meta.id}`);
    if (!raw) throw new Error('Partida no encontrada');
    return JSON.parse(raw);
  }
  const { data, error } = await supabase()!.from('saves').select('data').eq('id', meta.id).single();
  if (error) throw new Error(error.message);
  return data.data as GameState;
}

export async function deleteSave(meta: SaveMeta) {
  if (!meta.cloud) { localStorage.removeItem(`gse:save:${meta.id}`); writeIndex(readIndex().filter((m) => m.id !== meta.id)); return; }
  await supabase()!.from('saves').delete().eq('id', meta.id);
}

export async function signIn(email: string) {
  const sb = supabase();
  if (!sb) throw new Error('Supabase no está configurado');
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } });
  if (error) throw new Error(error.message);
}
export async function currentUser(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.email ?? null;
}
export async function signOut() { await supabase()?.auth.signOut(); }
