'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Fixture } from '@/game/types';
import { type Match, type Tick, stepMatch, substitute, setTactics, minuteOf, possessionPct, runToEnd } from '@/game/engine';
import { useGame } from './GameApp';
import { Crest } from './ui';
import { compName } from '@/game/calendar';
import { FORMATION_KEYS, MENTALITY_LABEL } from '@/game/tactics';
import { POS_LABEL } from '@/game/player';
import { shortName, textOn } from './screens/Tactics';

const W = 1050, H = 680, M = 34; // canvas size and margin
const PW = W - M * 2, PH = H - M * 2;
type Pt = { x: number; y: number };

function hexToRgb(h: string) { const n = parseInt(h.replace('#', '').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function colorDist(a: string, b: string) { const x = hexToRgb(a), y = hexToRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }

/** Player positions (absolute pitch coords 0..1) derived from ball and formation. */
function positions(m: Match, tk: Tick, t: number): Map<number, Pt> {
  const out = new Map<number, Pt>();
  for (const si of [0, 1] as const) {
    const s = m.sides[si];
    const bx = si === 0 ? tk.bx : 1 - tk.bx, by = si === 0 ? tk.by : 1 - tk.by;
    const att = tk.poss === si;
    let nearest = -1, nd = 9;
    const local: [number, number, number][] = [];
    s.onPitch.forEach((id, i) => {
      if (id == null) return;
      const sl = s.slots[i];
      let x: number, y: number;
      if (sl.pos === 'GK') { x = 0.025 + Math.max(0, Math.min(0.5, bx)) * 0.07; y = 0.5 + (by - 0.5) * 0.25; }
      else {
        const shift = (bx - 0.5) * 0.55 + (att ? 0.07 : -0.05) + s.tactics.mentality * 0.015;
        x = Math.max(0.04, Math.min(0.95, sl.x * 0.78 + 0.07 + shift));
        y = sl.y + (by - sl.y) * (att ? 0.16 : 0.3);
        x += Math.sin(t * 0.0011 + i * 1.7 + si) * 0.006; y += Math.cos(t * 0.0013 + i * 2.3) * 0.008;
        if (!att) { const d = Math.hypot(x - bx, (y - by) * 0.65); if (d < nd) { nd = d; nearest = local.length; } }
      }
      local.push([id, x, y]);
    });
    if (nearest >= 0) { const l = local[nearest]; l[1] += (bx - 0.015 - l[1]) * 0.65; l[2] += (by - l[2]) * 0.65; }
    for (const [id, x0, y0] of local) {
      let x = x0, y = y0;
      if (att && id === tk.holder) { x = bx - 0.012; y = by; }
      out.set(id, si === 0 ? { x, y } : { x: 1 - x, y: 1 - y });
    }
  }
  return out;
}

function drawPitch(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b8a4b'); g.addColorStop(1, '#23783f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { if (i % 2) continue; ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.fillRect(M + (PW / 14) * i, M, PW / 14, PH); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.82)'; ctx.lineWidth = 2.2;
  ctx.strokeRect(M, M, PW, PH);
  ctx.beginPath(); ctx.moveTo(W / 2, M); ctx.lineTo(W / 2, H - M); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, PH * 0.135, 0, Math.PI * 2); ctx.stroke();
  const sx = PW / 105, sy = PH / 68;
  for (const side of [0, 1]) {
    const x0 = side === 0 ? M : W - M, dir = side === 0 ? 1 : -1;
    ctx.strokeRect(side === 0 ? x0 : x0 - 16.5 * sx, H / 2 - 20.16 * sy, 16.5 * sx, 40.32 * sy);
    ctx.strokeRect(side === 0 ? x0 : x0 - 5.5 * sx, H / 2 - 9.16 * sy, 5.5 * sx, 18.32 * sy);
    ctx.beginPath(); ctx.arc(x0 + dir * 11 * sx, H / 2, 9.15 * sx, side === 0 ? -0.93 : Math.PI - 0.93, side === 0 ? 0.93 : Math.PI + 0.93); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x0 + dir * 11 * sx, H / 2, 2.5, 0, Math.PI * 2); ctx.fill();
    // goal + net
    const gw = 7.32 * sy, gd = 2.2 * sx;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(side === 0 ? x0 - gd : x0, H / 2 - gw / 2, gd, gw);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    for (let k = 0; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(side === 0 ? x0 - gd : x0, H / 2 - gw / 2 + (gw / 6) * k); ctx.lineTo(side === 0 ? x0 : x0 + gd, H / 2 - gw / 2 + (gw / 6) * k); ctx.stroke(); }
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(side === 0 ? x0 - gd : x0, H / 2 - gw / 2, gd, gw);
    ctx.strokeStyle = 'rgba(255,255,255,0.82)'; ctx.lineWidth = 2.2;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2); ctx.fill();
}

export default function MatchView({ m, f, onFinish }: { m: Match; f: Fixture; onFinish: () => void }) {
  const { gs } = useGame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const bg = useRef<HTMLCanvasElement | null>(null);
  const us = (m.userSide ?? 0) as 0 | 1;
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [feed, setFeed] = useState<(Tick & { min: number })[]>([]);
  const [, setUi] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  const [subOut, setSubOut] = useState<number | null>(null);
  const st = useRef({ ti: 0, from: new Map<number, Pt>(), to: new Map<number, Pt>(), ballFrom: { x: .5, y: .5 }, ballTo: { x: .5, y: .5 }, t0: 0, dur: 600, arc: 0, hold: 0 });
  const playingRef = useRef(playing); playingRef.current = playing;
  const speedRef = useRef(speed); speedRef.current = speed;

  const home = m.sides[0].club, away = m.sides[1].club;
  const homeKit = home.colors[0];
  const awayKit = colorDist(home.colors[0], away.colors[0]) < 120 ? away.colors[1] : away.colors[0];
  const awayTrim = awayKit === away.colors[0] ? away.colors[1] : away.colors[0];
  const kits = [{ fill: homeKit, trim: home.colors[1], gk: '#f5c84b' }, { fill: awayKit, trim: awayTrim, gk: colorDist(awayKit, '#22c55e') < 100 ? '#111827' : '#22c55e' }];

  const nextTick = useCallback(() => {
    const s = st.current;
    if (s.ti >= m.ticks.length) { if (m.finished) return false; stepMatch(m); }
    if (s.ti >= m.ticks.length) return false;
    const tk = m.ticks[s.ti++];
    const now = performance.now();
    // freeze current interpolated positions as start
    const prog = Math.min(1, (now - s.t0) / s.dur);
    const cur = new Map<number, Pt>();
    s.to.forEach((p, id) => { const a = s.from.get(id) ?? p; cur.set(id, { x: a.x + (p.x - a.x) * prog, y: a.y + (p.y - a.y) * prog }); });
    s.from = cur;
    s.ballFrom = { x: s.ballFrom.x + (s.ballTo.x - s.ballFrom.x) * prog, y: s.ballFrom.y + (s.ballTo.y - s.ballFrom.y) * prog };
    s.to = positions(m, tk, now);
    s.ballTo = { x: tk.bx, y: tk.by };
    const dist = Math.hypot(s.ballTo.x - s.ballFrom.x, (s.ballTo.y - s.ballFrom.y) * 0.65);
    s.arc = dist > 0.18 ? Math.min(1, dist * 2) : 0;
    s.t0 = now;
    const base = [0, 760, 380, 170, 60][speedRef.current];
    s.dur = base;
    s.hold = 0;
    if (tk.text) {
      setFeed(fd => [{ ...tk, min: Math.min(m.half >= 3 ? 120 : 90, Math.floor(tk.t / 60) + 1) }, ...fd].slice(0, 120));
      if (tk.kind === 'goal') { setFlash('¡GOL!'); setTimeout(() => setFlash(null), 2200); s.hold = speedRef.current < 4 ? 2200 : 600; }
      else if (tk.kind === 'save' || tk.kind === 'miss' || tk.kind === 'red' || tk.kind === 'pen') s.hold = speedRef.current < 3 ? 700 : 150;
      if (tk.kind === 'half' && m.userSide != null) { setPlaying(false); setPanel(true); }
      if (tk.kind === 'injury' && m.userSide != null && gs.players[tk.holder]?.clubId === gs.manager.clubId) { /* auto sub happened */ }
    }
    setUi(x => x + 1);
    return true;
  }, [m, gs]);

  useEffect(() => {
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    drawPitch(off.getContext('2d')!); bg.current = off;
    const c = canvas.current!; const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr; c.height = H * dpr;
    const ctx = c.getContext('2d')!; ctx.scale(dpr, dpr);
    st.current.to = positions(m, m.ticks[0], 0); st.current.from = st.current.to;
    let raf = 0;
    const loop = () => {
      const s = st.current; const now = performance.now();
      if (playingRef.current && now - s.t0 >= s.dur + s.hold) { if (!nextTick() && m.finished) { setPlaying(false); setUi(x => x + 1); } }
      const p = Math.min(1, (now - s.t0) / s.dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      ctx.drawImage(bg.current!, 0, 0);
      const X = (x: number) => M + x * PW, Y = (y: number) => M + y * PH;
      // players
      const items: { id: number; x: number; y: number; si: 0 | 1; gk: boolean }[] = [];
      for (const si of [0, 1] as const) m.sides[si].onPitch.forEach((id, i) => {
        if (id == null) return;
        const to = s.to.get(id); if (!to) return; const fr = s.from.get(id) ?? to;
        items.push({ id, x: fr.x + (to.x - fr.x) * e, y: fr.y + (to.y - fr.y) * e, si, gk: m.sides[si].slots[i].pos === 'GK' });
      });
      items.sort((a, b) => a.y - b.y);
      const tk = m.ticks[Math.max(0, s.ti - 1)];
      for (const it of items) {
        const px = X(it.x), py = Y(it.y); const k = kits[it.si];
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(px + 3, py + 9, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
        const r = 12;
        const grd = ctx.createRadialGradient(px - 4, py - 5, 2, px, py, r);
        const fill = it.gk ? k.gk : k.fill;
        grd.addColorStop(0, '#ffffff55'); grd.addColorStop(0.35, fill); grd.addColorStop(1, fill);
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = it.gk ? '#111' : k.trim; ctx.stroke();
        if (tk && tk.holder === it.id) { ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, r + 4, 0, Math.PI * 2); ctx.stroke(); }
        const pl = gs.players[it.id];
        ctx.fillStyle = textOn(fill); ctx.font = '700 12px Barlow Condensed, Arial Narrow, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(pl?.num ?? ''), px, py + 0.5);
        if (tk && tk.holder === it.id && pl) {
          const label = shortName(pl.name); ctx.font = '600 12px Inter, sans-serif'; const w = ctx.measureText(label).width + 10;
          ctx.fillStyle = 'rgba(6,12,24,.78)'; ctx.beginPath(); ctx.roundRect(px - w / 2, py - r - 22, w, 17, 5); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillText(label, px, py - r - 13);
        }
      }
      // ball
      const bx = s.ballFrom.x + (s.ballTo.x - s.ballFrom.x) * e, by = s.ballFrom.y + (s.ballTo.y - s.ballFrom.y) * e;
      const h = s.arc * Math.sin(Math.PI * e) * 26;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(X(bx) + 2 + h * 0.3, Y(by) + 4, 6 - h * 0.08, 3, 0, 0, Math.PI * 2); ctx.fill();
      const bgr = ctx.createRadialGradient(X(bx) - 2, Y(by) - h - 2, 1, X(bx), Y(by) - h, 6 + h * 0.06);
      bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(1, '#cfd6e0');
      ctx.fillStyle = bgr; ctx.beginPath(); ctx.arc(X(bx), Y(by) - h, 5.5 + h * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const min = minuteOf(m);
  const poss = possessionPct(m);
  const S = m.sides;
  const mine = S[us];
  const doneAll = m.finished && st.current.ti >= m.ticks.length;
  const statRows: [string, number, number][] = [['Posesión %', poss[0], poss[1]], ['Tiros', S[0].shots, S[1].shots], ['A puerta', S[0].onTarget, S[1].onTarget], ['Córners', S[0].corners, S[1].corners], ['Faltas', S[0].fouls, S[1].fouls], ['Pases %', Math.round(S[0].passOk / Math.max(1, S[0].passes) * 100), Math.round(S[1].passOk / Math.max(1, S[1].passes) * 100)]];
  const scorers = (si: number) => m.events.filter(e => e.kind === 'goal' && e.side === si).map(e => `${shortName(gs.players[e.pid!]?.name ?? '')} ${e.min}'`).join(', ');

  return (
    <div className="match-wrap">
      <div className="match">
        <div className="scoreboard">
          <div className="team"><Crest club={home} size={48} /><div style={{ minWidth: 0 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home.name}</div><div className="small muted" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>{scorers(0)}</div></div></div>
          <div><div className="score num">{S[0].goals} - {S[1].goals}</div><div className="clock">{m.finished ? 'FINAL' : `${min}'`}{m.pens ? ` · PEN ${m.pens[0]}-${m.pens[1]}` : ''} · {compName(gs, f.comp)}</div></div>
          <div className="team away"><div style={{ minWidth: 0, textAlign: 'right' }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away.name}</div><div className="small muted" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>{scorers(1)}</div></div><Crest club={away} size={48} /></div>
        </div>
        <div className="mgrid">
          <div className="col">
            <div className="canvas-box"><canvas ref={canvas} style={{ aspectRatio: `${W} / ${H}` }} />{flash && <div className="goal-flash">{flash}</div>}</div>
            <div className="row wrap">
              {!doneAll && <button className="btn" onClick={() => setPlaying(p => !p)}>{playing ? '⏸ Pausa' : '▶ Reanudar'}</button>}
              <div className="seg">{[1, 2, 3, 4].map(sp => <button key={sp} className={speed === sp ? 'on' : ''} onClick={() => setSpeed(sp)}>{['', 'x1', 'x2', 'x4', 'x12'][sp]}</button>)}</div>
              {m.userSide != null && !m.finished && <button className="btn" onClick={() => { setPanel(p => !p); setPlaying(false); }}>🔁 Cambios y táctica ({5 - mine.subsUsed})</button>}
              {!doneAll && <button className="btn ghost" onClick={() => { runToEnd(m); st.current.ti = m.ticks.length; setFeed(fd => [...m.ticks.filter(t => t.text && t.kind && t.kind !== 'kickoff').slice(-20).reverse().map(t => ({ ...t, min: Math.floor(t.t / 60) + 1 })), ...fd]); setPlaying(false); setUi(x => x + 1); }}>⏭ Simular resto</button>}
              {doneAll && <button className="btn primary big right" onClick={onFinish}>Ver resumen →</button>}
            </div>
            {panel && m.userSide != null && (
              <div className="panel">
                <div className="row wrap" style={{ marginBottom: 10 }}>
                  <h3 style={{ margin: 0 }}>Banquillo · {5 - mine.subsUsed} cambios disponibles</h3>
                  <select value={mine.tactics.formation} onChange={e => { setTactics(m, us, { ...mine.tactics, formation: e.target.value }); setUi(x => x + 1); }}>{FORMATION_KEYS.map(k => <option key={k}>{k}</option>)}</select>
                  <div className="seg">{([-2, -1, 0, 1, 2] as const).map(v => <button key={v} className={mine.tactics.mentality === v ? 'on' : ''} onClick={() => { setTactics(m, us, { ...mine.tactics, mentality: v }); setUi(x => x + 1); }}>{MENTALITY_LABEL[v]}</button>)}</div>
                  <div className="seg">{([1, 2, 3] as const).map(v => <button key={v} className={mine.tactics.pressing === v ? 'on' : ''} onClick={() => { setTactics(m, us, { ...mine.tactics, pressing: v }); setUi(x => x + 1); }}>Presión {['baja', 'media', 'alta'][v - 1]}</button>)}</div>
                  <button className="btn primary right" onClick={() => { setPanel(false); setPlaying(true); }}>Volver al partido ▶</button>
                </div>
                <div className="grid g2">
                  <table className="t"><thead><tr><th>En el campo (elige quién sale)</th><th>Pos</th><th>Energía</th><th>Nota</th></tr></thead><tbody>
                    {mine.onPitch.map((id, i) => id == null ? null : (
                      <tr key={id} className={`click ${subOut === id ? 'me' : ''}`} onClick={() => setSubOut(id)}>
                        <td>{gs.players[id].name}</td><td className="small">{POS_LABEL[mine.slots[i].pos]}</td>
                        <td><span className="energy"><i style={{ width: `${mine.energy[id]}%`, background: mine.energy[id] > 70 ? 'var(--good)' : mine.energy[id] > 50 ? 'var(--warn)' : 'var(--bad)' }} /></span></td>
                        <td>{(mine.rating[id] ?? 6).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody></table>
                  <table className="t"><thead><tr><th>Suplentes (elige quién entra)</th><th>Pos</th><th>Físico</th></tr></thead><tbody>
                    {mine.bench.filter(id => !mine.played.has(id)).map(id => (
                      <tr key={id} className="click" onClick={() => { if (subOut != null && substitute(m, us, subOut, id)) { setSubOut(null); setUi(x => x + 1); } }}>
                        <td>{gs.players[id].name}</td><td className="small">{POS_LABEL[gs.players[id].pos]}</td><td>{Math.round(gs.players[id].fitness)}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            )}
          </div>
          <div className="col">
            <div className="panel tight">
              {statRows.map(([l, a, b]) => (
                <div key={l}>
                  <div className="statrow"><b className="num">{a}</b><span className="lbl">{l}</span><b className="num" style={{ textAlign: 'right' }}>{b}</b></div>
                  <div className="dualbar"><i style={{ width: `${(a / Math.max(1, a + b)) * 100}%`, background: kits[0].fill === '#FFFFFF' || kits[0].fill.toLowerCase() === '#ffffff' ? '#dfe6f2' : kits[0].fill }} /><i style={{ flex: 1, background: kits[1].fill }} /></div>
                </div>
              ))}
            </div>
            <div className="panel tight">
              <h3>Comentarios</h3>
              <div className="feed">{feed.map((it, i) => <div key={i} className={`it ${it.kind ?? ''}`}><b>{it.min}&apos;</b>{it.text}</div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
