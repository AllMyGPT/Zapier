'use client';
import React, { useState } from 'react';
import { useGame } from '../GameApp';
import { fmtMoney } from '@/game/season';
import { ALIMONY_WEEKLY, CARS, HOMES, PARTNER_ACTS, VENUES, ageOf, askOut, breakUp, buy, childPath, date, familyTime, flirtMessage, gift, goOut, lifePartner, hasAltLook, lookImage, makePartner, managerWeekly, now, partnerAction, propose, reconcile, setTrying, toggleLook, type LifeState, type Person } from '@/game/life';

const STAGE_LABEL: Record<Person['stage'], string> = { conocida: 'Conocida', citas: 'Quedando', pareja: 'Pareja', prometida: 'Prometida', casada: 'Matrimonio', amante: 'Aventura secreta', ex: 'Ex' };
const img = (id: string) => `/art/life/${id}.webp`;

function Meter({ label, v, color }: { label: string; v: number; color: string }) {
  return <div className="life-meter"><span>{label}</span><div className="bar"><i style={{ width: `${v}%`, background: color }} /></div><b className="num">{Math.round(v)}</b></div>;
}

export default function LifeScreen() {
  const { gs, refresh, toast } = useGame();
  const l = gs.life as LifeState;
  const [tab, setTab] = useState<'hogar' | 'relaciones' | 'familia' | 'diario'>('relaciones');
  const [dating, setDating] = useState<Person | null>(null);
  const act = (msg: string) => { if (msg) toast(msg); refresh(); };
  const home = HOMES.find(h => h.id === l.home)!, car = CARS.find(c => c.id === l.car)!;
  const sp = lifePartner(gs);
  const people = l.people.filter(p => p.stage !== 'ex').sort((a, b) => b.affinity - a.affinity);
  const exes = l.people.filter(p => p.stage === 'ex');

  return (
    <div className="col">
      <div className="life-head panel">
        <div className="life-home" style={{ backgroundImage: `url(${img(home.img)})` }}><div><div className="kicker-sm">Tu casa</div><b>{home.name}</b></div></div>
        <div className="col" style={{ gap: 6 }}>
          <div className="row wrap" style={{ gap: 8 }}>
            <div className="statbox"><span>Ahorros</span><b>{fmtMoney(l.savings)}</b></div>
            <div className="statbox"><span>Sueldo</span><b>{fmtMoney(managerWeekly(gs))}/sem</b></div>
            <div className="statbox"><span>Edad</span><b>{ageOf(gs, l.born)} años</b></div>
            <div className="statbox"><span>Situación</span><b>{sp ? `${STAGE_LABEL[sp.stage]} con ${sp.name.split(' ')[0]}` : 'Soltero'}</b></div>
          </div>
          <Meter label="Felicidad" v={l.happiness} color="var(--good)" />
          <Meter label="Estrés" v={l.stress} color="var(--bad)" />
          <Meter label="Salud" v={l.health} color="var(--cyan)" />
          <div className="small muted">Tu estado de ánimo se nota en el vestuario: si estás feliz el grupo lo contagia, y con mucho estrés lo pagan los jugadores.</div>
        </div>
      </div>

      <div className="seg" style={{ alignSelf: 'flex-start' }}>
        {(['relaciones', 'hogar', 'familia', 'diario'] as const).map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{({ relaciones: 'Relaciones', hogar: 'Casa y coche', familia: 'Familia', diario: 'Diario' })[t]}</button>)}
      </div>

      {tab === 'relaciones' && (
        <>
          <div className="row wrap">
            <button className="btn primary" onClick={() => act(goOut(gs))}>Salir esta noche (500 €)</button>
            <span className="small muted">Conoces gente saliendo, en eventos del club y con la fama. Con pareja, coquetear con otra persona puede acabar en aventura… y en escándalo.</span>
          </div>
          {sp && (sp.stage === 'pareja' || sp.stage === 'prometida' || sp.stage === 'casada') && (
            <div className="panel col" style={{ gap: 6 }}>
              <h3 style={{ margin: 0 }}>Momentos con {sp.name.split(' ')[0]}</h3>
              <div className="row wrap" style={{ gap: 6 }}>{PARTNER_ACTS.map(a => <button key={a.id} className="btn sm" onClick={() => act(partnerAction(gs, a.id))}>{a.label}</button>)}</div>
              <span className="small muted">Un momento a solas sube la afinidad y baja el estrés. Uno por día.</span>
            </div>
          )}
          {!people.length && <div className="panel empty">Todavía no conoces a nadie especial. Sal por la ciudad.</div>}
          <div className="people">
            {people.map(p => (
              <div key={p.id} className={`person ${p.stage}`}>
                <div className="person-img" style={{ backgroundImage: `url(${img(lookImage(p))})` }}><span className="stage">{STAGE_LABEL[p.stage]}</span></div>
                <div className="person-body">
                  <b>{p.name}</b>
                  <div className="small muted">{ageOf(gs, p.born)} años · {p.job}</div>
                  <div className="small">{p.traits.join(' · ')}</div>
                  <div className="life-meter"><span>Afinidad</span><div className="bar"><i style={{ width: `${p.affinity}%`, background: 'linear-gradient(90deg,#ff5d8f,#ffb3c7)' }} /></div><b className="num">{Math.round(p.affinity)}</b></div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    <button className="btn sm primary" onClick={() => setDating(p)}>Proponer cita</button>
                    <button className="btn sm" onClick={() => act(flirtMessage(gs, p.id))}>Mensaje atrevido</button>
                    <button className="btn sm" onClick={() => act(gift(gs, p.id))}>Regalo (2.500 €)</button>
                    {(p.stage === 'conocida' || p.stage === 'citas') && <button className="btn sm" onClick={() => act(askOut(gs, p.id))}>{sp ? 'Coquetear' : 'Pedir salir'}</button>}
                    {p.stage === 'pareja' && <button className="btn sm" onClick={() => act(propose(gs, p.id))}>Pedir matrimonio (anillo 15.000 €)</button>}
                    {!['pareja', 'prometida', 'casada'].includes(p.stage) && p.affinity >= 60 && (
                      <button className="btn sm primary" onClick={() => { if (!sp || sp.id === p.id || confirm(`Dejarás a ${sp.name.split(' ')[0]} para estar con ${p.name.split(' ')[0]}. ¿Seguir?`)) act(makePartner(gs, p.id)); }}>{sp && sp.id !== p.id ? `Dejar a ${sp.name.split(' ')[0]} por ella` : 'Ser tu pareja oficial'}</button>
                    )}
                    {hasAltLook(p) && <button className="btn sm" onClick={() => { toggleLook(gs, p.id); refresh(); }}>👗 Cambiar look</button>}
                    {p.stage !== 'conocida' && p.stage !== 'citas' && <button className="btn sm danger" onClick={() => { if (confirm(p.stage === 'casada' ? '¿Divorciarte? Te costará el 40 % de tus ahorros.' : '¿Romper la relación?')) act(breakUp(gs, p.id)); }}>{p.stage === 'casada' ? 'Divorcio' : 'Romper'}</button>}
                  </div>
                  {p.stage === 'amante' && <div className="small" style={{ color: '#ff9aa6' }}>Si la prensa os pilla, escándalo: directiva, afición y tu pareja.</div>}
                </div>
              </div>
            ))}
          </div>
          {exes.length > 0 && (
            <div className="col" style={{ gap: 6 }}>
              <h3 style={{ margin: 0 }}>Ex</h3>
              <div className="people">{exes.map(p => {
                const wife = p.exRole === 'mujer';
                const pension = wife && (p.alimonyUntil ?? 0) >= gs.season;
                return (
                  <div key={p.id} className="person ex">
                    <div className="person-img" style={{ backgroundImage: `url(${img(lookImage(p))})` }}><span className="stage">{wife ? 'Ex-mujer' : 'Ex'}</span></div>
                    <div className="person-body">
                      <b>{p.name}</b>
                      <div className="small muted">{ageOf(gs, p.born)} años · {p.job}</div>
                      {pension && <div className="small" style={{ color: 'var(--warn)' }}>Pensión de {fmtMoney(ALIMONY_WEEKLY)}/sem hasta la temporada {p.alimonyUntil}/{((p.alimonyUntil ?? 0) + 1) % 100}.</div>}
                      <div className="life-meter"><span>Afinidad</span><div className="bar"><i style={{ width: `${p.affinity}%`, background: 'linear-gradient(90deg,#ff5d8f,#ffb3c7)' }} /></div><b className="num">{Math.round(p.affinity)}</b></div>
                      {p.affinity >= 60 && <div className="row wrap" style={{ gap: 6 }}><button className="btn sm primary" onClick={() => { if (!sp || sp.id === p.id || confirm(`Dejarás a ${sp.name.split(' ')[0]}. ¿Seguir?`)) act(reconcile(gs, p.id)); }}>{wife ? 'Volver con ella' : 'Volver a salir'}</button></div>}
                    </div>
                  </div>
                );
              })}</div>
            </div>
          )}
        </>
      )}

      {tab === 'hogar' && (
        <div className="grid g2">
          {([['home', 'Casa', HOMES, l.home], ['car', 'Coche', CARS, l.car]] as const).map(([kind, title, list, cur]) => (
            <div className="panel" key={kind}><h3>{title}</h3>
              <div className="shop">{list.map(it => (
                <div key={it.id} className={`shop-item ${cur === it.id ? 'on' : ''}`}>
                  <div className="shop-img" style={{ backgroundImage: `url(${img(it.img)})` }} />
                  <div className="grow"><b>{it.name}</b><div className="small muted">{it.desc}</div><div className="small">{it.price ? fmtMoney(it.price) : 'Incluido'} · gastos {fmtMoney(it.weekly)}/sem · felicidad +{it.happy}</div></div>
                  {cur === it.id ? <span className="pill good">Tuyo</span> : <button className="btn sm primary" onClick={() => act(buy(gs, kind, it.id))}>Comprar</button>}
                </div>
              ))}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'familia' && (
        <div className="col">
          <div className="panel row wrap">
            {sp ? <div className="person-mini" style={{ backgroundImage: `url(${img(sp.img)})` }} /> : null}
            <div className="grow"><h3 style={{ margin: 0 }}>{sp ? `${STAGE_LABEL[sp.stage]}: ${sp.name}` : 'Sin pareja'}</h3>
              {l.wedding && <div className="small">Boda prevista dentro de {Math.max(0, l.wedding.day - now(gs))} días.</div>}
              {l.pregnancyDue != null && <div className="small" style={{ color: 'var(--accent)' }}>¡Bebé en camino! Nacerá dentro de {Math.max(0, l.pregnancyDue - now(gs))} días.</div>}
            </div>
            <button className="btn" onClick={() => act(familyTime(gs))}>Día en familia</button>
            {sp?.stage === 'casada' && <button className={`btn ${l.tryingForBaby ? 'active' : ''}`} onClick={() => { setTrying(gs, !l.tryingForBaby); refresh(); }}>{l.tryingForBaby ? 'Buscando bebé ✓' : 'Buscar un bebé'}</button>}
          </div>
          <div className="life-scene" style={{ backgroundImage: `url(${img(l.children.length ? 'life-family' : sp?.stage === 'casada' ? 'life-wedding' : 'venue-beach')})` }} />
          {!l.children.length && <div className="panel empty">Todavía no hay niños en casa.</div>}
          <div className="grid g3">{l.children.map(c => {
            const a = ageOf(gs, c.born);
            return (
              <div className="panel" key={c.id}><h3>{c.name} · {a} años</h3>
                <div className="life-meter"><span>Talento futbolístico</span><div className="bar"><i style={{ width: `${c.talent}%`, background: 'var(--accent)' }} /></div><b>{c.talent}</b></div>
                <div className="life-meter"><span>Estudios</span><div className="bar"><i style={{ width: `${c.studies}%`, background: 'var(--blue)' }} /></div><b>{c.studies}</b></div>
                <div className="life-meter"><span>Felicidad</span><div className="bar"><i style={{ width: `${c.happiness}%`, background: 'var(--good)' }} /></div><b>{c.happiness}</b></div>
                {a >= 8 && <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>{(['fútbol', 'estudios', 'arte'] as const).map(pth => <button key={pth} className={`btn sm ${c.path === pth ? 'active' : ''}`} onClick={() => { childPath(gs, c.id, pth); refresh(); }}>{pth}</button>)}</div>}
                {c.playerId && <div className="small" style={{ color: 'var(--accent)', marginTop: 6 }}>Juega en tu cantera.</div>}
              </div>
            );
          })}</div>
        </div>
      )}

      {tab === 'diario' && (
        <div className="panel col" style={{ gap: 6 }}>{l.log.map((e, i) => <div key={i} className={`news-item lifelog ${e.kind}`} style={{ cursor: 'default' }}><span className="small muted">T{e.season % 100}/{(e.season + 1) % 100} · día {e.day}</span> {e.text}</div>)}</div>
      )}

      {dating && (
        <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setDating(null); }}>
          <div className="modal" style={{ width: 'min(900px,100%)' }}>
            <button className="btn sm ghost x" onClick={() => setDating(null)}>✕</button>
            <span className="matchday-kicker">Cita con {dating.name.split(' ')[0]}</span>
            <p className="muted">Le gustan especialmente: {dating.likes.map(v => VENUES.find(x => x.id === v)!.name.toLowerCase()).join(' y ')}. Tu coche y tu casa también cuentan. Los planes más íntimos piden más confianza y pueden acabar en una noche juntos.</p>
            <div className="venues">{VENUES.map(v => {
              const locked = !!v.minAff && dating.affinity < v.minAff;
              return (
                <button key={v.id} className={`venue ${locked ? 'locked' : ''}`} disabled={locked} onClick={() => { act(date(gs, dating.id, v.id)); setDating(null); }}>
                  <div className="venue-img" style={{ backgroundImage: `url(${img(v.img)})` }} />
                  <b>{v.intimate ? '🔥 ' : ''}{v.name}</b>
                  <span>{locked ? `🔒 Afinidad ${v.minAff}` : fmtMoney(v.cost)}{dating.likes.includes(v.id) ? ' · ♥ le encanta' : ''}{!locked && v.exposed && dating.stage === 'amante' ? ' · ⚠ paparazzi' : ''}</span>
                </button>
              );
            })}</div>
          </div>
        </div>
      )}
    </div>
  );
}
