'use client';
import { useEffect, useState } from 'react';

const STEPS: { t: string; d: string }[] = [
  { t: 'Bienvenida', d: 'El tiempo está en pausa. Tómate tu tiempo: nada ocurre hasta que pulses una velocidad (o la barra espaciadora).' },
  { t: 'El mapa', d: 'Arrastra para moverte y usa la rueda, el pellizco o los botones + / − para el zoom. Pasa el ratón por una provincia o ejército para ver sus datos.' },
  { t: 'Tus ejércitos', d: 'Toca un ejército y después una provincia para enviarlo allí (en ordenador también vale el clic derecho). El resumen de la derecha lista tus ejércitos, guerras y asedios.' },
  { t: 'Objetivos', d: 'La pestaña Objetivos guía tu reinado. Cuando uno brille, complétalo para cobrar la recompensa.' },
  { t: 'Tu casa', d: 'En Dinastía o Corte verás tu familia: concierta bodas, reclama tronos y, si te atreves, juega a las intrigas de alcoba.' },
  { t: 'La crónica', d: 'Cada decisión queda escrita. Al final, los cronistas juzgarán tu legado frente a las demás potencias.' },
];
const KEY = 'ge_guide_done';

/** first-game walkthrough; dismissed forever once finished or skipped */
export default function Guide() {
  const [i, setI] = useState<number | null>(null);
  useEffect(() => { try { if (!localStorage.getItem(KEY)) setI(0); } catch { setI(0); } }, []);
  if (i === null) return null;
  const done = () => { try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ } setI(null); };
  const st = STEPS[i];
  return (
    <div className="guide">
      <div className="guide-kicker">Consejero · {i + 1}/{STEPS.length}</div>
      <b>{st.t}</b>
      <p>{st.d}</p>
      <div className="row">
        <button className="ghost" onClick={done}>Saltar</button>
        <span className="grow" />
        {i > 0 && <button onClick={() => setI(i - 1)}>Atrás</button>}
        <button className="primary" onClick={() => (i + 1 < STEPS.length ? setI(i + 1) : done())}>{i + 1 < STEPS.length ? 'Siguiente' : 'Entendido'}</button>
      </div>
    </div>
  );
}
