'use client';
import { useEffect, useState } from 'react';
import { loadingArt, TIPS } from '@/lib/art';

/** Full-screen painted loading card shown while a campaign starts. */
export default function LoadingScreen({ scenarioId, era, title, text, onDone }: { scenarioId: string; era: string; title: string; text: string; onDone: () => void }) {
  const [p, setP] = useState(0);
  const [tip] = useState(() => { const l = TIPS[era] ?? TIPS.ww2; return l[Math.floor(Math.random() * l.length)]; });
  useEffect(() => {
    // timer-based (not rAF) so it also finishes in a background tab
    const t0 = Date.now();
    let done = false;
    const id = window.setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / 2600);
      setP(1 - Math.pow(1 - k, 2.2));
      if (k >= 1 && !done) { done = true; window.clearInterval(id); window.setTimeout(onDone, 250); }
    }, 40);
    return () => window.clearInterval(id);
  }, [onDone]);
  return (
    <div className="loading" onClick={() => p > 0.3 && onDone()}>
      <div className="loading-art" style={{ backgroundImage: `url(${loadingArt(scenarioId, era)}), url(/art/era-${era}.jpg), url(/art/era-ww2.jpg)` }} />
      <div className="loading-shade" />
      <div className="loading-body">
        <div className="loading-kicker">{({ medieval: 'Edad Media', earlymodern: 'Edad Moderna', ww1: 'La Gran Guerra', ww2: 'Guerra Total', modern: 'Siglo XXI' } as Record<string, string>)[era] ?? ''}</div>
        <h1>{title}</h1>
        <p className="loading-text">{text}</p>
        <div className="loading-bar"><div style={{ width: `${p * 100}%` }} /></div>
        <p className="loading-tip"><b>Consejo · </b>{tip}</p>
      </div>
    </div>
  );
}
