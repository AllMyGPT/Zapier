'use client';
import { useMemo, useState } from 'react';
import { missionStatus, missionsOf, nationScore, provincesOf } from '@/engine/core';
import type { Command, GameState, LogEntry, Mission } from '@/engine/types';
import { dateOf, formatDate } from '@/engine/util';
import { conditionState, describeEffect } from '@/lib/describe';
import Arms from './Arms';

interface P { s: GameState; version: number; cmd: (c: Command) => string | null; setProv?: (p: string | null) => void }

const ICON: Record<string, string> = { war: '⚔', peace: '🕊', court: '♛', disaster: '☠', prosperity: '⚖', faith: '✠', revolt: '🔥', explore: '🧭' };

export function readyMissions(s: GameState) {
  return missionsOf(s, s.player).filter((m) => missionStatus(s, s.player, m) === 'ready').length;
}

/** national objectives laid out as a tree of columns */
export function MissionsPanel({ s, cmd }: P) {
  const list = missionsOf(s, s.player);
  const cols = useMemo(() => {
    const c: Mission[][] = [];
    for (const m of list) (c[m.col ?? 0] ??= []).push(m);
    return c.filter(Boolean);
  }, [list]);
  const done = list.filter((m) => missionStatus(s, s.player, m) === 'done').length;
  if (!list.length) return <div className="muted">Tu nación no tiene objetivos propios.</div>;
  return (
    <div className="section">
      <h3>Objetivos nacionales · {done}/{list.length}</h3>
      <div className="bar" style={{ marginBottom: 12 }}><div style={{ width: `${(done / list.length) * 100}%` }} /></div>
      <div className="mtree">
        {cols.map((col, i) => (
          <div key={i} className="mcol">
            {col.map((m) => {
              const st = missionStatus(s, s.player, m);
              const req = (m.requires ?? []).map((r) => list.find((x) => x.id === r)?.title ?? r);
              return (
                <div key={m.id} className={`mcard ${st}`}>
                  <div className="mhead"><span className="micon">{ICON[m.icon ?? 'court'] ?? '✦'}</span><b>{m.title}</b>{st === 'done' && <span className="mdone">✓</span>}</div>
                  {st !== 'done' && <>
                    <p>{m.text}</p>
                    {st === 'locked' && <div className="mreq">Requiere: {req.join(', ')}</div>}
                    <ul className="mconds">
                      {m.conditions.map((c, k) => { const cs = conditionState(s, s.player, c); return cs.text ? <li key={k} className={cs.ok ? 'ok' : ''}>{cs.ok ? '✓' : '○'} {cs.text}</li> : null; })}
                    </ul>
                    <div className="mrew">{m.rewards.map((e, k) => { const d = describeEffect(s, s.player, e); return d ? <span key={k} className={d.good === false ? 'bad' : 'good'}>{d.text}</span> : null; })}</div>
                    {st === 'ready' && <button className="primary" onClick={() => cmd({ type: 'claimMission', id: m.id })}>Completar</button>}
                  </>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** ranking of the great powers */
export function LedgerPanel({ s }: P) {
  const rows = Object.values(s.nations).filter((n) => n.alive && !n.x.pseudo && !n.liege)
    .map((n) => ({ n, score: nationScore(s, n.tag), provs: provincesOf(s, n.tag).length, rec: s.record?.[n.tag], m: s.missionsDone?.[n.tag]?.length ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const max = Math.max(1, rows[0]?.score ?? 1);
  const myRank = rows.findIndex((r) => r.n.tag === s.player) + 1;
  return (
    <div className="section">
      <h3>Grandes potencias</h3>
      <p className="muted" style={{ marginTop: 0 }}>Tu posición: <b style={{ color: 'var(--gold-hi)' }}>{myRank ? `${myRank}.º` : '—'}</b> de {rows.length}. La puntuación suma riqueza, vasallos, prestigio, guerras ganadas y objetivos cumplidos.</p>
      <div className="ledger">
        {rows.slice(0, 20).map((r, i) => (
          <div key={r.n.tag} className={`lrow ${r.n.tag === s.player ? 'me' : ''}`}>
            <span className="lrank">{i + 1}</span>
            <Arms tag={r.n.tag} color={r.n.color} size={18} />
            <span className="lname">{r.n.name}</span>
            <span className="lbar"><span style={{ width: `${(r.score / max) * 100}%`, background: r.n.color }} /></span>
            <b>{r.score}</b>
            <span className="muted lmeta">{r.provs} prov · {r.rec?.won ?? 0} vict. · {r.m} obj.</span>
          </div>
        ))}
      </div>
      {(() => {
        const rec = s.record?.[s.player];
        return rec ? <p className="muted">Tu historial: {rec.won} guerras ganadas, {rec.lost} perdidas · {rec.battlesWon} batallas ganadas, {rec.battlesLost} perdidas · {rec.conquered} provincias conquistadas.</p> : null;
      })()}
    </div>
  );
}

const STORY_KINDS: LogEntry['kind'][] = ['story', 'mission', 'war', 'peace', 'character', 'event'];

/** the realm's chronicle, grouped by year; the raw log stays one click away */
export function ChroniclePanel({ s }: P) {
  const [mode, setMode] = useState<'chronicle' | 'world' | 'log'>('chronicle');
  const entries = useMemo(() => {
    if (mode === 'log') return s.log.filter((l) => l.tags.includes(s.player) || l.kind === 'info').slice(-200);
    if (mode === 'world') return s.log.filter((l) => ['war', 'peace', 'story', 'mission'].includes(l.kind)).slice(-250);
    return s.chronicle ?? s.log.filter((l) => l.kind === 'info' || (STORY_KINDS.includes(l.kind) && l.tags.includes(s.player)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.log.length, s.chronicle?.length, mode, s.player]);
  const byYear: [number, LogEntry[]][] = [];
  for (const l of entries) {
    const y = dateOf(l.day).y;
    if (!byYear.length || byYear[byYear.length - 1][0] !== y) byYear.push([y, []]);
    byYear[byYear.length - 1][1].push(l);
  }
  return (
    <div className="section">
      <div className="row" style={{ marginBottom: 10 }}>
        {([['chronicle', 'Crónica del reino'], ['world', 'El mundo'], ['log', 'Registro completo']] as const).map(([k, l]) => (
          <button key={k} className={mode === k ? 'primary' : ''} onClick={() => setMode(k)}>{l}</button>
        ))}
      </div>
      <div className="chronicle">
        {[...byYear].reverse().map(([y, list]) => (
          <div key={y} className="cyear">
            <div className="cy">Año {y}</div>
            {[...list].reverse().map((l, i) => (
              <div key={i} className={`centry ${l.kind}`}>
                <span className="cdate">{formatDate(l.day).replace(/ de \d+$/, '')}</span>
                <span className="ctext">{l.text}</span>
              </div>
            ))}
          </div>
        ))}
        {!byYear.length && <div className="muted">Aún no hay nada que contar.</div>}
      </div>
    </div>
  );
}
