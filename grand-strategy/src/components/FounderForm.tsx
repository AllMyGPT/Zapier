'use client';
import { useEffect, useMemo, useState } from 'react';
import type { FounderDef } from '@/engine/core';
import { portraitChoices } from '@/lib/art';
import { TRAIT_EFFECTS, TRAITS } from '@/rulesets/common';
import Arms from './Arms';
import Portrait from './Portrait';

const POINTS = 24;
/** traits that are pure power cost points; pure weakness gives them back */
const TRAIT_COST: Record<string, number> = { genio: 6, torpe: -6 };
const cost = (f: FounderDef) => f.dip + f.mar + f.ste + f.int + f.traits.reduce((t, x) => t + (TRAIT_COST[x] ?? 0), 0);
const STATS: [keyof Pick<FounderDef, 'dip' | 'mar' | 'ste' | 'int'>, string, string][] = [
  ['dip', 'Diplomacia', 'Relaciones, alianzas, matrimonios y vasallos'],
  ['mar', 'Marcial', 'Mando en batalla y levas'],
  ['ste', 'Administración', 'Ingresos, dominio y estabilidad'],
  ['int', 'Intriga', 'Conjuras, seducción y secretos'],
];
const TRAIT_HINT: Record<string, string> = {
  valiente: 'Lidera desde la vanguardia', cobarde: 'Prudente hasta el exceso', justo: 'Respetado por sus súbditos', codicioso: 'Llena las arcas… y vacía los afectos',
  cruel: 'Temido, nunca querido', amable: 'Gana amigos con facilidad', genio: 'Brillante en todo', torpe: 'Un reto para valientes', piadoso: 'Grato a la Iglesia; difícil de seducir',
  cínico: 'Nada le sorprende', ambicioso: 'Quiere más, siempre', perezoso: 'Los papeles esperan', enfermizo: 'Vida frágil', fuerte: 'Salud de hierro',
  seductor: 'Las cartas perfumadas son su arma', bello: 'Su presencia ilumina la corte', casto: 'Inmune a las tentaciones', lujurioso: 'Amores secretos y bastardos', celoso: 'Vigila cada mirada a su cónyuge',
};

/** design your own founder: the start of a new dynastic line */
export default function FounderForm({ art, era, color, onChange }: { art: string; era: string; color: string; onChange: (f: FounderDef | null) => void }) {
  const modern = era === 'ww2';
  const [f, setF] = useState<FounderDef>({ name: '', dynasty: '', female: false, age: 28, dip: 6, mar: 6, ste: 6, int: 6, traits: [], spouse: true, children: 1, bio: '' });
  const choices = useMemo(() => portraitChoices(art, f.female), [art, f.female]);
  const portrait = f.portrait && choices.includes(f.portrait) ? f.portrait : choices[0];
  const used = cost(f);
  const left = POINTS - used;
  // empty fields fall back to the example values, so the start button always works
  const defName = (x: FounderDef) => (modern ? (x.female ? 'Elena' : 'Julián') : x.female ? 'Urraca' : 'Rodrigo');
  const defHouse = modern ? 'Valcárcel' : 'Altamira';
  const normalize = (x: FounderDef): FounderDef | null => {
    if (cost(x) > POINTS) return null;
    const choices2 = portraitChoices(art, x.female);
    return {
      ...x,
      name: x.name.trim().length >= 2 ? x.name.trim() : defName(x),
      dynasty: x.dynasty.trim().length >= 2 ? x.dynasty.trim() : defHouse,
      portrait: x.portrait && choices2.includes(x.portrait) ? x.portrait : choices2[0],
    };
  };
  const valid = left >= 0;
  const set = (p: Partial<FounderDef>) => {
    const next = { ...f, ...p };
    setF(next);
    onChange(normalize(next));
  };
  // the form is usable from the first render: announce the default founder right away
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange(normalize(f)); }, []);
  return (
    <div className="founder">
      <div className="founder-top">
        <div className="founder-preview">
          <Portrait src={portrait} color={color} size={110} />
          <div className="founder-arms"><Arms tag={f.dynasty || '?'} color={color} size={40} /></div>
        </div>
        <div className="founder-fields">
          <label>Nombre<input value={f.name} maxLength={28} placeholder={f.female ? 'p. ej. Urraca' : 'p. ej. Rodrigo'} onChange={(e) => set({ name: e.target.value })} /></label>
          <label>{modern ? 'Familia / apellido' : 'Casa (dinastía)'}<input value={f.dynasty} maxLength={28} placeholder={modern ? 'p. ej. Valcárcel' : 'p. ej. Altamira'} onChange={(e) => set({ dynasty: e.target.value })} /></label>
          <div className="row">
            <button className={!f.female ? 'primary' : ''} onClick={() => set({ female: false, portrait: undefined })}>Varón</button>
            <button className={f.female ? 'primary' : ''} onClick={() => set({ female: true, portrait: undefined })}>Mujer</button>
            <label className="age">Edad {f.age}<input type="range" min={16} max={65} value={f.age} onChange={(e) => set({ age: Number(e.target.value) })} /></label>
          </div>
        </div>
      </div>

      <div className="founder-sec">Retrato</div>
      <div className="founder-portraits">
        {choices.map((src) => (
          <button key={src} className={src === portrait ? 'sel' : ''} onClick={() => set({ portrait: src })}><Portrait src={src} color={color} size={52} /></button>
        ))}
      </div>

      <div className="founder-sec">Aptitudes <span className={left < 0 ? 'bad' : 'muted'}>· {left} puntos libres</span></div>
      {STATS.map(([k, label, hint]) => (
        <div key={k} className="founder-stat">
          <span><b>{label}</b><small>{hint}</small></span>
          <button onClick={() => f[k] > 2 && set({ [k]: f[k] - 1 } as Partial<FounderDef>)}>−</button>
          <b className="val">{f[k]}</b>
          <button disabled={left <= 0 || f[k] >= 12} onClick={() => set({ [k]: f[k] + 1 } as Partial<FounderDef>)}>+</button>
        </div>
      ))}

      <div className="founder-sec">Rasgos <span className="muted">· hasta 3</span></div>
      <div className="founder-traits">
        {TRAITS.map((t) => {
          const on = f.traits.includes(t);
          const fx = Object.entries(TRAIT_EFFECTS[t] ?? {}).map(([k, v]) => `${v! > 0 ? '+' : ''}${v} ${({ diplomacy: 'dip', martial: 'mar', stewardship: 'adm', intrigue: 'int' } as Record<string, string>)[k]}`).join(' ');
          return (
            <button key={t} className={on ? 'primary' : ''} disabled={!on && (f.traits.length >= 3 || (TRAIT_COST[t] ?? 0) > left)} title={TRAIT_HINT[t]} onClick={() => set({ traits: on ? f.traits.filter((x) => x !== t) : [...f.traits, t] })}>
              {t}{fx && <small> {fx}</small>}{TRAIT_COST[t] ? <small> ({TRAIT_COST[t] > 0 ? '−' : '+'}{Math.abs(TRAIT_COST[t])} pts)</small> : null}
            </button>
          );
        })}
      </div>

      <div className="founder-sec">Familia</div>
      <div className="row">
        <label className="chk"><input type="checkbox" checked={!!f.spouse} onChange={(e) => set({ spouse: e.target.checked })} /> Con cónyuge</label>
        {f.spouse && <label className="age">Hijos {f.children}<input type="range" min={0} max={4} value={f.children} onChange={(e) => set({ children: Number(e.target.value) })} /></label>}
      </div>
      <label className="founder-bio">Leyenda (opcional)<textarea maxLength={240} rows={2} value={f.bio} placeholder="Cómo llegó al trono, qué juró, qué teme…" onChange={(e) => set({ bio: e.target.value })} /></label>
      {!valid && <p className="bad" style={{ fontSize: 13 }}>Has repartido más puntos de los disponibles: quita alguno para poder empezar.</p>}
      {(f.name.trim().length < 2 || f.dynasty.trim().length < 2) && <p className="muted" style={{ fontSize: 12 }}>Si dejas el nombre o la casa vacíos, empezarás como {f.name.trim().length >= 2 ? f.name.trim() : defName(f)} de la casa de {f.dynasty.trim().length >= 2 ? f.dynasty.trim() : defHouse}.</p>}
      <p className="muted" style={{ fontSize: 12 }}>Tu personaje sustituye al soberano histórico. El linaje depuesto conserva su derecho de sangre: tendrás pretendientes en tu propia corte.</p>
    </div>
  );
}
