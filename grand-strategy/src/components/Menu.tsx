'use client';
import { useEffect, useMemo, useState } from 'react';
import { ERAS, SCENARIOS } from '@/data/scenarios';
import { createGame } from '@/engine/core';
import type { Era, GameState } from '@/engine/types';
import { cloudEnabled, currentUser, deleteSave, listSaves, loadGame, signIn, signOut, type SaveMeta } from '@/lib/saves';

export default function Menu({ onStart }: { onStart: (s: GameState) => void }) {
  const [era, setEra] = useState<Era | null>(null);
  const [scId, setScId] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { listSaves().then(setSaves).catch(() => {}); currentUser().then(setUser); }, []);
  const scenarios = SCENARIOS.filter((s) => s.era === era);
  const sc = SCENARIOS.find((s) => s.id === scId) ?? null;
  const nations = useMemo(() => {
    if (!sc) return [];
    const rec = sc.recommended ?? [];
    return [...sc.nations].filter((n) => !n.liege || rec.includes(n.tag)).sort((a, b) => (rec.includes(b.tag) ? 1 : 0) - (rec.includes(a.tag) ? 1 : 0) || b.provinces.length - a.provinces.length);
  }, [sc]);

  return (
    <div className="menu">
      <div className="menu-inner">
        <h1 className="title">Gran Estrategia<small>Un motor, tres épocas: coronas feudales, imperios de ultramar y guerra total.</small></h1>

        <h2>1 · Elige una época</h2>
        <div className="cards">
          {ERAS.map((e) => (
            <button key={e.id} className={`card ${era === e.id ? 'sel' : ''}`} onClick={() => { setEra(e.id); setScId(null); setTag(null); }}>
              <div className="era">{e.subtitle}</div>
              <h3>{e.title}</h3>
              <div className="muted">{e.blurb}</div>
            </button>
          ))}
        </div>

        {era && (<>
          <h2>2 · Escenario</h2>
          <div className="cards">
            {scenarios.map((s) => (
              <button key={s.id} className={`card ${scId === s.id ? 'sel' : ''}`} onClick={() => { setScId(s.id); setTag(s.recommended?.[0] ?? null); }}>
                <h3>{s.name}</h3>
                <div className="muted">{s.description}</div>
              </button>
            ))}
          </div>
        </>)}

        {sc && (<>
          <h2>3 · Nación</h2>
          <div className="nations">
            {nations.map((n) => (
              <button key={n.tag} className={tag === n.tag ? 'sel' : ''} onClick={() => setTag(n.tag)}>
                <span className="swatch" style={{ background: n.color }} />
                <span className="grow">{n.name}</span>
                <span className="muted">{n.provinces.length}</span>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="primary" disabled={!tag} onClick={() => tag && onStart(createGame(sc, tag, Math.floor(Math.random() * 1e9)))}>
              Comenzar como {nations.find((n) => n.tag === tag)?.name ?? '…'}
            </button>
          </div>
        </>)}

        <h2 style={{ marginTop: 28 }}>Partidas guardadas</h2>
        {cloudEnabled() && (
          <div className="row" style={{ marginBottom: 8 }}>
            {user ? (<><span className="muted">Conectado como {user}</span><button onClick={() => signOut().then(() => setUser(null))}>Cerrar sesión</button></>) : (<>
              <input placeholder="correo para guardar en la nube" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button onClick={() => signIn(email).then(() => setMsg('Revisa tu correo para entrar.')).catch((e) => setMsg(e.message))}>Enviar enlace</button>
            </>)}
            {msg && <span className="muted">{msg}</span>}
          </div>
        )}
        <div className="list">
          {saves.length === 0 && <div className="muted">No hay partidas guardadas.</div>}
          {saves.map((m) => (
            <div key={m.id} className="item row">
              <div className="grow"><b>{m.name}</b> <span className="muted">· {m.scenario} · {m.gameDate} · {m.cloud ? 'nube' : 'local'}</span></div>
              <button onClick={() => loadGame(m).then(onStart).catch((e) => alert(e.message))}>Cargar</button>
              <button className="danger" onClick={() => deleteSave(m).then(() => listSaves().then(setSaves))}>Borrar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
