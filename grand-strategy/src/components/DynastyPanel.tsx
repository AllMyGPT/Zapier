'use client';
import { useState } from 'react';
import { age, livingNations } from '@/engine/core';
import type { Character, Command, GameState } from '@/engine/types';
import { formatDate } from '@/engine/util';
import { portraitFor } from '@/lib/art';
import { stat } from '@/rulesets/common';
import { canMarry, childrenOf, marriageCandidates, RANK_NAME, realmRank, realmsOfDynasty, rulerOf } from '@/rulesets/dynasty';
import { seductionTargets } from '@/rulesets/romance';
import Arms from './Arms';
import Portrait from './Portrait';

interface P { s: GameState; version: number; cmd: (c: Command) => string | null }

function Node({ s, c, sel, onSel, small, badge }: { s: GameState; c: Character; sel: string | null; onSel: (id: string) => void; small?: boolean; badge?: string }) {
  const realm = s.nations[c.tag];
  return (
    <button className={`fnode ${sel === c.id ? 'sel' : ''} ${c.alive ? '' : 'dead'} ${small ? 'small' : ''}`} onClick={() => onSel(c.id)} title={`${c.name} de ${c.dynasty}`}>
      <Portrait seed={c.id} src={portraitFor(s, c)} color={realm?.color} size={small ? 40 : 54} dead={!c.alive} badge={badge} />
      <span className="fname">{c.name}</span>
      <span className="fage">{c.alive ? `${age(s, c)} años` : `† ${formatDate(c.died!).slice(-4)}`}{c.claims?.length ? ' · ⚜' : ''}{c.lover && s.characters[c.lover]?.alive ? ' · ♥' : ''}{c.bastard ? ' · ilegítim' + (c.female ? 'a' : 'o') : ''}</span>
    </button>
  );
}

export default function DynastyPanel({ s, cmd }: P) {
  const n = s.nations[s.player];
  const r = rulerOf(s, n);
  const [sel, setSel] = useState<string | null>(r?.id ?? null);
  const [match, setMatch] = useState(false);
  const [seduce, setSeduce] = useState(false);
  if (!r) return <div className="muted">Tu reino no tiene una casa reinante.</div>;
  const badge = (c: Character) => (c.id === n.rulerId ? '♛' : c.id === n.heirId ? '★' : undefined);
  const father = r.father ? s.characters[r.father] : null;
  const mother = r.mother ? s.characters[r.mother] : null;
  const spouse = r.spouse ? s.characters[r.spouse] : null;
  const siblings = r.father ? childrenOf(s, r.father).filter((c) => c.id !== r.id) : [];
  const kids = childrenOf(s, r.id);
  const renown = Math.round(s.dynasties?.[r.dynasty]?.renown ?? 0);
  const realms = realmsOfDynasty(s, r.dynasty);
  const c = sel ? s.characters[sel] : null;
  const houses = Object.entries(s.dynasties ?? {}).sort((a, b) => b[1].renown - a[1].renown).slice(0, 8);
  const heir = n.heirId ? s.characters[n.heirId] : null;

  return (
    <>
      <div className="house-head">
        <Arms tag={r.dynasty} color={n.color} size={46} />
        <div>
          <h2>Casa de {r.dynasty}</h2>
          <div className="muted">Renombre {renown} · {realms.length === 1 ? 'reina en 1 Estado' : `reina en ${realms.length} Estados`}{heir ? ` · heredero: ${heir.name}` : ' · ¡sin heredero!'}</div>
          <div className="house-realms">{realms.map((x) => <span key={x.tag} title={x.name}><Arms tag={x.tag} color={x.color} size={18} /> {x.name}</span>)}</div>
        </div>
      </div>

      <div className="section">
        <h3>Árbol familiar</h3>
        <div className="ftree">
          {(father || mother) && <div className="frow">{father && <Node s={s} c={father} sel={sel} onSel={setSel} small />}{mother && <Node s={s} c={mother} sel={sel} onSel={setSel} small />}</div>}
          <div className="frow main">
            <Node s={s} c={r} sel={sel} onSel={setSel} badge="♛" />
            {spouse && <><span className="fring">⚭</span><Node s={s} c={spouse} sel={sel} onSel={setSel} /></>}
          </div>
          {siblings.length > 0 && <div className="frow sibs"><span className="flabel">Hermanos</span>{siblings.map((k) => <Node key={k.id} s={s} c={k} sel={sel} onSel={setSel} small badge={badge(k)} />)}</div>}
          {kids.length > 0 && <div className="frow kids"><span className="flabel">Hijos</span>{kids.map((k) => (
            <div key={k.id} className="fkid">
              <Node s={s} c={k} sel={sel} onSel={setSel} small badge={badge(k)} />
              {childrenOf(s, k.id).length > 0 && <span className="fgrand">{childrenOf(s, k.id).filter((g) => g.alive).length} nietos</span>}
            </div>
          ))}</div>}
          {!kids.length && <p className="muted" style={{ textAlign: 'center' }}>Aún no hay descendencia. Un matrimonio asegura la sucesión.</p>}
        </div>
      </div>

      {c && (
        <div className="section ccard">
          <div className="ccard-head">
            <Portrait seed={c.id} src={portraitFor(s, c)} color={s.nations[c.tag]?.color} size={84} dead={!c.alive} badge={badge(c)} />
            <div>
              <h3 style={{ border: 0, margin: 0 }}>{c.name} de {c.dynasty}</h3>
              <div className="muted">{c.alive ? `${age(s, c)} años` : `Murió en ${formatDate(c.died!)}`} · {c.female ? 'mujer' : 'varón'} · en {s.nations[c.tag]?.name ?? '—'}</div>
              {c.bio && <p className="cbio">{c.bio}</p>}
              <div className="cstats">
                <span title="Diplomacia">🗣 {stat(c, 'diplomacy')}</span><span title="Marcial">⚔ {stat(c, 'martial')}</span><span title="Administración">⚖ {stat(c, 'stewardship')}</span><span title="Intriga">🗝 {stat(c, 'intrigue')}</span>
              </div>
              {c.traits.length > 0 && <div className="ctraits">{c.traits.map((t) => <span key={t}>{t}</span>)}</div>}
              {c.spouse && s.characters[c.spouse] && <div className="muted">Casad{c.female ? 'a' : 'o'} con {s.characters[c.spouse].name} de {s.characters[c.spouse].dynasty}{c.inLove ? ' · enamorad' + (c.female ? 'a' : 'o') : ''}</div>}
              {c.lover && s.characters[c.lover]?.alive && <div className="lover">♥ Amor secreto: {s.characters[c.lover].name} de {s.characters[c.lover].dynasty}{s.nations[s.characters[c.lover].tag] ? ` (${s.nations[s.characters[c.lover].tag].name})` : ''}</div>}
              {c.bastard && <div className="muted" style={{ color: '#e0a080' }}>Hij{c.female ? 'a' : 'o'} ilegítim{c.female ? 'a' : 'o'}: no puede heredar.</div>}
            </div>
          </div>
          {c.claims?.length ? (
            <div className="cclaims">
              <b>Derechos de sangre:</b>
              {c.claims.filter((t) => s.nations[t]?.alive).map((t) => (
                <span key={t} className="cclaim">
                  <Arms tag={t} color={s.nations[t].color} size={16} /> {s.nations[t].name}
                  {c.tag === s.player && c.alive && <button className="danger" onClick={() => { if (confirm(`¿Declarar la guerra a ${s.nations[t].name} para coronar a ${c.name}? Al ganar, exige «Coronar al pretendiente» en la paz.`)) cmd({ type: 'action', id: 'press_claim', args: { target: t } }); }}>Reclamar el trono</button>}
                </span>
              ))}
            </div>
          ) : null}
          {c.alive && c.tag === s.player && (
            <div className="romance">
              {c.bastard && <button onClick={() => cmd({ type: 'action', id: 'legitimize', args: { character: c.id } })}>Legitimar (60 prestigio)</button>}
              {c.lover && s.characters[c.lover]?.alive && <button onClick={() => cmd({ type: 'action', id: 'end_affair', args: { character: c.id } })}>Poner fin al romance</button>}
              {c.id === n.rulerId && c.lover && s.characters[c.lover]?.alive && !s.characters[c.lover].traits.some((t) => t.startsWith('favorit')) && <button className="rose" onClick={() => cmd({ type: 'action', id: 'make_favorite', args: { character: c.id } })}>👑 Nombrar {s.characters[c.lover].female ? 'favorita' : 'favorito'} oficial</button>}
              {c.id === n.rulerId && <button className="rose" onClick={() => cmd({ type: 'action', id: 'masked_ball', args: {} })}>🎭 Baile de máscaras (40)</button>}
              {c.id === n.rulerId && !n.x.potion && <button className="rose" onClick={() => cmd({ type: 'action', id: 'love_potion', args: {} })}>🧪 Filtro de amor (25)</button>}
              {n.x.potion ? <span className="lover">🧪 Tienes un filtro de amor: tu próxima seducción será mucho más fácil.</span> : null}
              {age(s, c) >= 16 && !(c.lover && s.characters[c.lover]?.alive) && <button className="rose" onClick={() => setSeduce((v) => !v)}>{seduce ? 'Dejarlo estar' : '♥ Intrigas de alcoba'}</button>}
              {seduce && (
                <div className="cands">
                  <p className="muted" style={{ margin: '2px 0' }}>Miradas, billetes escondidos y citas a medianoche. Un éxito da influencia y, con suerte, un secreto que usar; un fracaso, escándalo.</p>
                  {seductionTargets(s, c, 8).map(({ b, p, why }) => (
                    <div key={b.id} className="cand">
                      <Portrait seed={b.id} src={portraitFor(s, b)} color={s.nations[b.tag]?.color} size={44} />
                      <div className="cand-body">
                        <b>{b.name} de {b.dynasty}</b>
                        <span className="muted">{age(s, b)} años{b.spouse && s.characters[b.spouse]?.alive ? ` · casad${b.female ? 'a' : 'o'}` : ''}{b.traits.length ? ` · ${b.traits.join(', ')}` : ''}</span>
                        <span className="cand-why">{why}</span>
                      </div>
                      <div className="cand-act">
                        <span className={p > 0.5 ? 'good' : p > 0.25 ? 'neutral' : 'bad'}>{Math.round(p * 100)} %</span>
                        <button onClick={() => { cmd({ type: 'action', id: 'seduce', args: { character: c.id, target: b.id } }); setSeduce(false); }}>Seducir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {c.alive && c.tag === s.player && !(c.spouse && s.characters[c.spouse]?.alive) && age(s, c) >= 15 && (
            <div className="match">
              <button className="primary" onClick={() => setMatch((v) => !v)}>{match ? 'Ocultar candidatos' : 'Buscar cónyuge'}</button>
              {match && (() => {
                const list = marriageCandidates(s, s.player, c, 8);
                if (!list.length) return <p className="muted">No hay candidatos adecuados en las cortes vecinas (edad, religión o enemistad).</p>;
                return (
                  <div className="cands">
                    {list.map(({ spouse: k, realm, accept }) => (
                      <div key={k.id} className="cand">
                        <Portrait seed={k.id} src={portraitFor(s, k)} color={realm.color} size={44} />
                        <div className="cand-body">
                          <b>{k.name} de {k.dynasty}</b>
                          <span className="muted">{age(s, k)} años · {k.id === realm.rulerId ? `soberan${k.female ? 'a' : 'o'}` : k.id === realm.heirId ? `herede${k.female ? 'ra' : 'ro'}` : 'de la familia real'} de <Arms tag={realm.tag} color={realm.color} size={14} /> {realm.name} ({RANK_NAME[realmRank(s, realm)]})</span>
                          <span className="cand-why">+45 relaciones{realmRank(s, realm) >= 1 ? ' · posible alianza' : ''}{k.id === realm.rulerId || k.id === realm.heirId ? ' · tus nietos tendrían derechos al trono' : ' · derechos para la descendencia'}</span>
                        </div>
                        <div className="cand-act">
                          <span className={accept > 0.6 ? 'good' : accept > 0.3 ? 'neutral' : 'bad'}>{Math.round(accept * 100)} %</span>
                          <button disabled={canMarry(s, c, k) !== true} onClick={() => { cmd({ type: 'action', id: 'royal_marriage', args: { character: c.id, spouse: k.id } }); setMatch(false); }}>Proponer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {(() => {
        const secrets = Object.keys(n.x).filter((k) => k.startsWith('secret_') && n.x[k] && s.nations[k.slice(7)]?.alive).map((k) => s.nations[k.slice(7)]);
        return secrets.length ? (
          <div className="section">
            <h3>Secretos de alcoba</h3>
            {secrets.map((o) => (
              <div key={o.tag} className="cclaim">
                <Arms tag={o.tag} color={o.color} size={16} /> Sabes algo íntimo de la corte de {o.name}.
                <button onClick={() => cmd({ type: 'action', id: 'blackmail', args: { target: o.tag, demand: 'gold' } })}>Exigir oro</button>
                <button onClick={() => cmd({ type: 'action', id: 'blackmail', args: { target: o.tag, demand: 'alliance' } })}>Exigir alianza</button>
              </div>
            ))}
          </div>
        ) : null;
      })()}

      <div className="section">
        <h3>Casas más ilustres</h3>
        <div className="ledger">
          {houses.map(([d, h], i) => {
            const rs = realmsOfDynasty(s, d);
            return (
              <div key={d} className={`lrow ${d === r.dynasty ? 'me' : ''}`}>
                <span className="lrank">{i + 1}</span>
                <Arms tag={d} color={rs[0]?.color ?? '#776'} size={18} />
                <span className="lname">{d}</span>
                <span className="muted" style={{ gridColumn: 'span 1', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rs.map((x) => x.name).join(', ') || 'sin trono'}</span>
                <b>{Math.round(h.renown)}</b>
              </div>
            );
          })}
          {!houses.length && <div className="muted">El renombre se acumula mes a mes.</div>}
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>⚜ indica derechos de sangre sobre otro reino. Los hijos heredan los derechos de sus padres y, por vía materna, sobre el reino de la casa de su madre. Si una casa se extingue, el pretendiente más cercano hereda: si ya reina en otro lugar, se forma una unión personal. {livingNations(s).length} Estados en el mundo.</p>
    </>
  );
}
