import './globals.css';
import type { Metadata, Viewport } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Pizarra · Club Manager',
  description: 'Mánager de fútbol en el navegador: tácticas, fichajes, finanzas y partidos en directo con las plantillas actuales.',
  icons: { icon: '/art/emblem.svg' },
  openGraph: { title: 'Pizarra · Club Manager', description: 'Dirige a tu club. Tácticas, fichajes y partidos en directo.', images: [{ url: '/art/og.jpg', width: 1200, height: 630 }] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#050b1a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
