/**
 * Looks up real club crests and player photos on Wikipedia and writes their
 * image URLs (hosted on upload.wikimedia.org) to public/media.json.
 *
 *   npx tsx scripts/fetch-media.ts
 *
 * Polite by design: requests are sequential, spaced out and batched 50 titles
 * at a time (Wikipedia rate-limits bursts). Each hit is checked against the
 * article's short description so a footballer lookup cannot return a namesake.
 * Misses keep the procedurally generated crest / silhouette in game.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { LEAGUE as ESP } from '../src/data/leagues/esp';
import { LEAGUE as ENG } from '../src/data/leagues/eng';
import { LEAGUE as ITA } from '../src/data/leagues/ita';
import { LEAGUE as GER } from '../src/data/leagues/ger';
import { LEAGUE as FRA } from '../src/data/leagues/fra';

const OUT = 'public/media.json';
const UA = 'PizarraClubManager/0.1 (personal fan project; low-volume batched lookups)';
const LEAGUES = [ESP, ENG, ITA, GER, FRA];
const GAP = 1100; // ms between requests

type Hit = { url: string; page: string };
type Media = { generated: string; source: string; clubs: Record<string, Hit>; players: Record<string, Hit> };
const media: Media = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { generated: '', source: '', clubs: {}, players: {} };
media.source = 'Wikipedia / Wikimedia Commons. Each image keeps its own licence: see the file page on Wikipedia.';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

async function api(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(GAP);
    const r = await fetch(`https://en.wikipedia.org/w/api.php?${qs}`, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status >= 500 || !(r.headers.get('content-type') ?? '').includes('json')) {
      const wait = 20_000 * (attempt + 1);
      console.log(`  límite de Wikipedia (${r.status}), espero ${wait / 1000}s`);
      await sleep(wait); continue;
    }
    return r.json();
  }
  throw new Error('Wikipedia keeps rate-limiting; try again later.');
}

type Page = { title: string; desc: string; thumb?: string };
/** Resolves up to 50 titles (following redirects) to page description + thumbnail. */
async function lookup(titles: string[], size: number): Promise<Map<string, Page>> {
  const out = new Map<string, Page>();
  for (let i = 0; i < titles.length; i += 50) {
    const chunk = titles.slice(i, i + 50);
    const j = await api({ action: 'query', titles: chunk.join('|'), redirects: '1', prop: 'pageimages|description', piprop: 'thumbnail', pithumbsize: String(size), pilicense: 'any' });
    const alias = new Map<string, string>();
    for (const n of j?.query?.normalized ?? []) alias.set(n.from, n.to);
    for (const r of j?.query?.redirects ?? []) alias.set(r.from, r.to);
    const pages = new Map<string, Page>();
    for (const p of j?.query?.pages ?? []) if (!p.missing) pages.set(p.title, { title: p.title, desc: p.description ?? '', thumb: p.thumbnail?.source });
    for (const t of chunk) {
      let k = t; for (let hop = 0; hop < 3 && alias.has(k); hop++) k = alias.get(k)!;
      const p = pages.get(k); if (p) out.set(t, p);
    }
  }
  return out;
}

const isClub = (p?: Page) => !!p?.thumb && /football|soccer/i.test(p.desc) && /club|team/i.test(p.desc) && !/women|season|stadium|reserve/i.test(p.desc + p.title);
const isPlayer = (p: Page | undefined, name: string, born: string) => {
  if (!p?.thumb || !/football|soccer/i.test(p.desc) || /manager|coach|club|team|season/i.test(p.desc) && !/player|footballer/i.test(p.desc)) return false;
  const want = norm(name).split(' ').filter(w => w.length > 2);
  const t = norm(p.title.replace(/\(.*\)/, ''));
  if (want.length && !want.some(w => t.includes(w))) return false;
  const by = p.desc.match(/(19|20)\d\d/);
  return !by || Math.abs(+by[0] - +born) <= 1;
};
const ok = (p: Page): Hit => ({ url: p.thumb!, page: p.title });

function save() { media.generated = new Date().toISOString(); writeFileSync(OUT, JSON.stringify(media)); }

async function main() {
  // ---- crests
  const allLower = (L: typeof ESP) => [...L.tier2, ...(L.tier3?.groups.flatMap(g => g.clubs) ?? [])];
  const clubs = LEAGUES.flatMap(L => [...L.clubs, ...allLower(L)]).filter(c => !media.clubs[c.id]);
  const variants = (n: string) => [n, `${n} F.C.`, `${n} FC`, `${n} CF`];
  for (let v = 0; v < 4; v++) {
    const todo = clubs.filter(c => !media.clubs[c.id]);
    if (!todo.length) break;
    const res = await lookup(todo.map(c => variants(c.name)[v]), 256);
    for (const c of todo) { const p = res.get(variants(c.name)[v]); if (isClub(p)) media.clubs[c.id] = ok(p!); }
    save();
  }
  // exact article titles for clubs whose plain name is ambiguous or whose description is unusual
  const ALIAS: Record<string, string> = { ath: 'Athletic Bilbao', rso: 'Real Sociedad', i_int: 'Inter Milan', i_ata: 'Atalanta BC', i_gen: 'Genoa CFC', i_lec: 'US Lecce', i_sas: 'US Sassuolo Calcio', i_mon: 'AC Monza', i_spe: 'Spezia Calcio', i_bar: 'SSC Bari', i_cat: 'US Catanzaro 1929', g_stp: 'FC St. Pauli', g_hsv: 'Hamburger SV',
    rsb: 'Real Sociedad B', cul: 'Cultural y Deportiva Leonesa', e3_bil: 'Bilbao Athletic', e3_clf: 'RC Celta Fortuna', e3_osb: 'CA Osasuna B', e3_rmc: 'Real Madrid Castilla', e3_atm: 'Atlético Madrileño', e3_btd: 'Betis Deportivo Balompié', e3_sva: 'Sevilla Atlético', e3_vlb: 'Villarreal CF B', e3_gua: 'CD Guadalajara (Spain)', e3_avi: 'Real Avilés Industrial CF' };
  const miss = Object.keys(ALIAS).filter(id => !media.clubs[id]);
  if (miss.length) {
    const res = await lookup(miss.map(id => ALIAS[id]), 256);
    for (const id of miss) { const p = res.get(ALIAS[id]); if (p?.thumb) media.clubs[id] = ok(p); }
    save();
  }
  // reserve teams whose article has no image of their own wear the first team's crest
  const PARENT: Record<string, string> = { rsb: 'rso', e3_osb: 'osa', e3_rmc: 'rma', e3_atm: 'atm', e3_btd: 'bet', e3_bil: 'ath', e3_clf: 'cel', e3_sva: 'sev', e3_vlb: 'vil' };
  for (const [id, parent] of Object.entries(PARENT)) if (!media.clubs[id] && media.clubs[parent]) media.clubs[id] = media.clubs[parent];
  save();
  const allClubs = LEAGUES.flatMap(L => [...L.clubs, ...allLower(L)]);
  console.log(`Escudos: ${Object.keys(media.clubs).length}/${allClubs.length}`);
  console.log('  sin escudo:', allClubs.filter(c => !media.clubs[c.id]).map(c => c.name).join(', ') || '—');

  // ---- player photos
  const players = LEAGUES.flatMap(L => L.clubs.flatMap(c => c.players.split('\n').map(l => l.trim().split('|')).filter(p => p.length >= 6).map(p => ({ key: `${p[0]}|${p[2]}`, name: p[0], born: p[2] }))));
  const pv = (p: { name: string; born: string }) => [p.name, `${p.name} (footballer)`, `${p.name} (footballer, born ${p.born})`, `${p.name} (soccer)`];
  for (let v = 0; v < 4; v++) {
    const todo = players.filter(p => !media.players[p.key]);
    if (!todo.length) break;
    const res = await lookup(todo.map(p => pv(p)[v]), 240);
    for (const p of todo) { const pg = res.get(pv(p)[v]); if (isPlayer(pg, p.name, p.born)) media.players[p.key] = ok(pg!); }
    save();
    console.log(`  variante ${v + 1}: ${Object.keys(media.players).length}/${players.length}`);
  }
  console.log(`Fotos: ${Object.keys(media.players).length}/${players.length}`);
}
main();
