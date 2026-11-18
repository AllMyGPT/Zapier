import { NextResponse, type NextRequest } from 'next/server';

/** Temporary block: phones cannot open the game for 30 days (from 18 Nov 2026). Desktop and tablets are unaffected.
 *  It lifts by itself at the end date; delete this file to lift it earlier. */
const MOBILE_BLOCK_UNTIL = Date.parse('2026-12-18T00:00:00+01:00'); // midnight, Madrid time
const PHONE_UA = /iPhone|iPod|Android.+Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile Safari(?!.*iPad)/i;

const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pizarra · Club Manager</title><meta name="robots" content="noindex">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070d1c;color:#e8eefc;font-family:system-ui,-apple-system,sans-serif;padding:24px;box-sizing:border-box;text-align:center}
.c{max-width:420px}h1{font-size:22px;letter-spacing:.04em;text-transform:uppercase;margin:12px 0}p{color:#9fb0d0;line-height:1.5}.i{font-size:44px}</style></head>
<body><div class="c"><div class="i">💻</div><h1>Solo desde ordenador</h1>
<p>El acceso desde el móvil está suspendido temporalmente hasta el 18 de diciembre de 2026.</p>
<p>Mientras tanto, puedes jugar desde un ordenador. Tus partidas guardadas no se borran.</p></div></body></html>`;

export function middleware(req: NextRequest) {
  if (Date.now() >= MOBILE_BLOCK_UNTIL) return NextResponse.next();
  const ua = req.headers.get('user-agent') ?? '';
  if (!PHONE_UA.test(ua)) return NextResponse.next();
  return new NextResponse(page, { status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', vary: 'User-Agent' } });
}

// only pages: static files, images and Next assets load normally
export const config = { matcher: ['/((?!_next/|art/|api/|favicon|.*\\.(?:webp|png|jpg|svg|ico|js|css|json|txt)$).*)'] };
