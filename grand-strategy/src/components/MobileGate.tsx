'use client';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Temporary suspension of phone and tablet access: until this date the game only opens on desktop.
 * The block lifts on its own when the date passes; no redeploy needed. Set on 18-11-2026 for 30 days.
 */
export const MOBILE_SUSPENDED_UNTIL = new Date('2026-12-18T00:00:00+01:00');

function isMobileDevice(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile) return true;
  const ua = nav.userAgent || '';
  if (/iPhone|iPod|iPad|Android|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return true;
  // iPadOS reports itself as a Mac: tell it apart by its touch screen
  return /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
}

export default function MobileGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState<boolean | null>(null);
  useEffect(() => { setBlocked(Date.now() < MOBILE_SUSPENDED_UNTIL.getTime() && isMobileDevice()); }, []);
  if (blocked === null) return <div className="mobile-gate-blank" />;
  if (!blocked) return <>{children}</>;
  const until = MOBILE_SUSPENDED_UNTIL.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <main className="mobile-gate">
      <div className="mobile-gate-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/emblem.svg" alt="" width={72} height={72} />
        <h1>Gran Estrategia</h1>
        <p>El acceso desde móvil y tableta está en pausa temporalmente.</p>
        <p>Mientras tanto, puedes jugar desde un ordenador.</p>
        <p className="mobile-gate-date">Volverá a estar disponible el {until}.</p>
      </div>
    </main>
  );
}
