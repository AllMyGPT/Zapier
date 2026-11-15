'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { GameState } from '@/game/types';
import { createWorld, RAW_LEAGUES } from '@/game/data';
import { startCareer, expectationLabel, fmtMoney, strengthOf } from '@/game/season';
import { Crest, Stars } from './ui';
import { localList, loadLocal, cloudList, loadCloud, type SaveMeta } from '@/lib/storage';
import AuthBox from './AuthBox';

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
      <div className="pitch-bg" />
      <div className="hero grid g2" style={{ alignItems: 'center' }}>
        <div>
          <div className="logo">Pizarra<br /><em>Club</em> Manager</div>
          <div className="tagline">Dirige a tu club favorito: tácticas, fichajes, cantera, finanzas y partidos en directo con las plantillas actuales de las 5 grandes ligas.</div>
          <div className="row wrap">
            <button className="btn primary big" onClick={() => setStep('new')}>Nueva partida</button>
            {saves[0] && <button className="btn big" onClick={() => load(saves[0])} disabled={loading}>Continuar ({saves[0].club})</button>}
          </div>
          <p className="small muted" style={{ marginTop: 26, maxWidth: 520 }}>Juego independiente sin afiliación con clubes, ligas ni editores. Escudos generados; datos de jugadores aproximados (temporada 2025/26).</p>
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
    </div>
  );
}

function NewGame({ onBack, onStart }: { onBack: () => void; onStart: (g: GameState) => void }) {
  const [name, setName] = useState('');
  const [league, setLeague] = useState('esp');
  const [club, setClub] = useState<string | null>(null);
  const world = useMemo(() => createWorld('preview', 777), []);
  const clubs = Object.values(world.clubs).filter(c => c.country === league).sort((a, b) => (world.leagues[a.leagueId].tier - world.leagues[b.leagueId].tier) || b.reputation - a.reputation);
  const sel = club ? world.clubs[club] : null;
  const start = () => {
    const g = createWorld(name.trim() || 'Mister', (Date.now() % 1_000_000_007) >>> 0);
    startCareer(g, club!);
    onStart(g);
  };
  return (
    <div className="title-screen" style={{ alignItems: 'flex-start' }}>
      <div className="hero col" style={{ width: 'min(1200px, 100%)' }}>
        <div className="row"><button className="btn ghost" onClick={onBack}>← Volver</button><h1 style={{ margin: 0 }}>Nueva carrera</h1></div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
          <div className="panel">
            <div className="row wrap" style={{ marginBottom: 12 }}>
              <input type="text" placeholder="Tu nombre de mánager" value={name} onChange={e => setName(e.target.value)} style={{ width: 240 }} maxLength={30} />
              <div className="seg">{RAW_LEAGUES.map(l => <button key={l.id} className={league === l.id ? 'on' : ''} onClick={() => { setLeague(l.id); setClub(null); }}>{l.country}</button>)}</div>
            </div>
            {[1, 2].map(tier => (
              <div key={tier} style={{ marginBottom: 12 }}>
                <h3>{world.leagues[league + tier].name}</h3>
                <div className="club-pick" style={{ maxHeight: tier === 1 ? '40vh' : '22vh' }}>
                  {clubs.filter(c => world.leagues[c.leagueId].tier === tier).map(c => (
                    <button key={c.id} className={`club-card ${club === c.id ? 'on' : ''}`} onClick={() => setClub(c.id)}>
                      <Crest club={c} size={34} />
                      <div className="grow" style={{ minWidth: 0 }}><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</b><Stars v={(strengthOf(world, c.id) - 60) / 5} /></div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="panel">
            {sel ? (
              <div className="col">
                <div className="row"><Crest club={sel} size={64} /><div><h2>{sel.name}</h2><div className="muted">{sel.city}</div></div></div>
                <div><span className="muted">Estadio:</span> {sel.stadium} ({sel.capacity.toLocaleString('es-ES')})</div>
                <div><span className="muted">Nivel del equipo:</span> <Stars v={(strengthOf(world, sel.id) - 60) / 5} /></div>
                <div><span className="muted">Presupuesto fichajes:</span> <b>{fmtMoney(sel.transferBudget)}</b></div>
                <div><span className="muted">Objetivo de la directiva:</span> <b>{expectationLabel(world, sel.id)}</b></div>
                <button className="btn primary big" onClick={start}>Firmar contrato</button>
              </div>
            ) : <div className="empty">Elige un club para ver los detalles.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
