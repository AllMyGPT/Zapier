'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { GameState } from '@/game/types';
import { createWorld, RAW_LEAGUES } from '@/game/data';
import { startCareer, expectationLabel, fmtMoney, strengthOf } from '@/game/season';
import { Crest, Stars } from './ui';
import { localList, loadLocal, cloudList, loadCloud, type SaveMeta } from '@/lib/storage';
import AuthBox from './AuthBox';
import { initLife, type Interest } from '@/game/life';

export default function TitleScreen({ onStart }: { onStart: (g: GameState) => void }) {
  const [step, setStep] = useState<'menu' | 'new'>('menu');
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [cloud, setCloud] = useState<SaveMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const reloadCloud = () => cloudList().then(setCloud);
  useEffect(() => { setSaves(localList().sort((a, b) => b.updated_at.localeCompare(a.updated_at))); reloadCloud(); }, []);

  if (step === 'new') return <NewGame onBack={() => setStep('menu')} onStart={onStart} />;
  const load = async (s: SaveMeta) => {
    setLoading(true);
    const g = s.where === 'local' ? await loadLocal(s.slot) : await loadCloud(s.slot);
    setLoading(false);
    if (g) onStart(g); else alert('No se pudo cargar la partida.');
  };
  return (
    <div className="title-screen">
      <video className="bgvideo" autoPlay muted loop playsInline poster="/art/stadium.webp">
        <source src="/art/stadium-loop.webm" type="video/webm" />
        <source src="/art/stadium-loop.mp4" type="video/mp4" />
      </video>
      <div className="shade" />
      <div className="hero grid" style={{ gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', alignItems: 'center', gap: 40 }}>
        <div>
          <div className="logo-lockup">
            <img src="/art/emblem.svg" alt="" />
            <div className="logo"><span className="chrome">Pizarra</span><em>Club Manager</em></div>
          </div>
          <div className="tagline">Dirige a tu club favorito: tácticas, fichajes, cantera, finanzas y partidos en directo con las plantillas actuales de las 5 grandes ligas.</div>
          <div className="menu-stack">
            <button className="menu-btn primary" onClick={() => setStep('new')}>Nueva carrera<small>Elige club entre 5 ligas y sus segundas divisiones</small></button>
            {saves[0] && <button className="menu-btn" onClick={() => load(saves[0])} disabled={loading}>Continuar<small>{saves[0].club} · {saves[0].season}</small></button>}
          </div>
        </div>
        <div className="col">
          <div className="panel">
            <h3>Partidas guardadas</h3>
            {!saves.length && !cloud.length && <div className="muted small">Todavía no hay partidas.</div>}
            <div className="col" style={{ gap: 6 }}>
              {[...cloud, ...saves].map(s => (
                <button key={s.where + s.slot} className="club-card" onClick={() => load(s)} disabled={loading}>
                  <span style={{ fontSize: 20 }}>{s.where === 'cloud' ? '☁️' : s.slot === 0 ? '⏱️' : '💾'}</span>
                  <div className="grow"><b>{s.club}</b> · {s.season}<div className="small muted">{s.name} · {s.slot === 0 ? 'Autoguardado' : `Ranura ${s.slot}`} · {new Date(s.updated_at).toLocaleString('es-ES')}</div></div>
                </button>
              ))}
            </div>
          </div>
          <AuthBox onChange={reloadCloud} />
        </div>
      </div>
      <p className="legal">Juego independiente sin afiliación con clubes, ligas ni editores. Escudos y fotos de Wikipedia/Wikimedia Commons, propiedad de sus titulares (se pueden desactivar en Partida); arte de escenarios generado; datos de jugadores aproximados (temporada 2025/26).</p>
    </div>
  );
}

function NewGame({ onBack, onStart }: { onBack: () => void; onStart: (g: GameState) => void }) {
  const [name, setName] = useState('');
  const [league, setLeague] = useState('esp');
  const [club, setClub] = useState<string | null>(null);
  const [life, setLife] = useState(true);
  const [interest, setInterest] = useState<Interest>('mujeres');
  const [mAge, setMAge] = useState(38);
  const world = useMemo(() => createWorld('preview', 777), []);
  const clubs = Object.values(world.clubs).filter(c => c.country === league).sort((a, b) => (world.leagues[a.leagueId].tier - world.leagues[b.leagueId].tier) || b.reputation - a.reputation);
  const sel = club ? world.clubs[club] : null;
  const start = () => {
    const g = createWorld(name.trim() || 'Mister', (Date.now() % 1_000_000_007) >>> 0);
    startCareer(g, club!);
    if (life) initLife(g, interest, mAge);
    onStart(g);
  };
  return (
    <div className="title-screen" style={{ alignItems: 'flex-start' }}>
      <div className="bgvideo" style={{ background: 'url(/art/exterior.webp) center / cover' }} />
      <div className="shade" />
      <div className="hero col" style={{ width: 'min(1200px, 100%)' }}>
        <div className="row"><button className="btn ghost" onClick={onBack}>← Volver</button><img src="/art/emblem.svg" alt="" style={{ width: 44 }} /><h1 style={{ margin: 0, fontSize: 42 }}>Nueva carrera</h1></div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
          <div className="panel">
            <div className="row wrap" style={{ marginBottom: 12 }}>
              <input type="text" placeholder="Tu nombre de mánager" value={name} onChange={e => setName(e.target.value)} style={{ width: 240 }} maxLength={30} />
              <div className="seg">{RAW_LEAGUES.map(l => <button key={l.id} className={league === l.id ? 'on' : ''} onClick={() => { setLeague(l.id); setClub(null); }}>{l.country}</button>)}</div>
            </div>
            {Object.values(world.leagues).filter(l => l.country === league).sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id)).map(l => (
              <div key={l.id} style={{ marginBottom: 12 }}>
                <h3>{l.name}</h3>
                <div className="club-pick" style={{ maxHeight: l.tier === 1 ? '40vh' : '22vh' }}>
                  {clubs.filter(c => c.leagueId === l.id).map(c => (
                    <button key={c.id} className={`club-card ${club === c.id ? 'on' : ''}`} onClick={() => setClub(c.id)}>
                      <Crest club={c} size={34} />
                      <div className="grow" style={{ minWidth: 0 }}><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</b><Stars v={(strengthOf(world, c.id) - 60) / 5} /></div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="panel contract">
            <h3>Contrato</h3>
            {sel ? (
              <div className="col" style={{ gap: 4 }}>
                <div className="crest-big"><Crest club={sel} size={110} /></div>
                <h2 style={{ textAlign: 'center', fontStyle: 'italic', textTransform: 'uppercase', margin: '4px 0 0' }}>{sel.name}</h2>
                <div className="muted" style={{ textAlign: 'center', marginBottom: 8 }}>{sel.city}</div>
                <div className="kv"><span>Estadio</span><b>{sel.stadium} ({sel.capacity.toLocaleString('es-ES')})</b></div>
                <div className="kv"><span>Nivel del equipo</span><Stars v={(strengthOf(world, sel.id) - 60) / 5} /></div>
                <div className="kv"><span>Presupuesto fichajes</span><b>{fmtMoney(sel.transferBudget)}</b></div>
                <div className="kv"><span>Objetivo de la directiva</span><b>{expectationLabel(world, sel.id)}</b></div>
                <div className="life-opt">
                  <label className="row" style={{ gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={life} onChange={e => setLife(e.target.checked)} /><b>Modo vida personal</b></label>
                  <div className="small muted">Casa, coche, citas, pareja, boda, aventuras e hijos. Tu vida influye en el vestuario.</div>
                  {life && <div className="row wrap" style={{ gap: 8, marginTop: 6 }}>
                    <span className="small">Te interesan:</span>
                    <div className="seg">{(['mujeres', 'hombres', 'ambos'] as Interest[]).map(x => <button key={x} className={interest === x ? 'on' : ''} onClick={() => setInterest(x)}>{x}</button>)}</div>
                    <span className="small">Edad:</span><input type="number" min={28} max={65} value={mAge} onChange={e => setMAge(Math.max(28, Math.min(65, +e.target.value)))} style={{ width: 64 }} />
                  </div>}
                </div>
                <button className="btn primary big" style={{ marginTop: 12 }} onClick={start}>Firmar contrato</button>
              </div>
            ) : <div className="empty">Elige un club para ver los detalles.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
