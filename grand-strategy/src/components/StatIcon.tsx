'use client';

/** Small engraved icons for the top-bar resources (original drawings). */
const ICONS: Record<string, string> = {
  coin: 'M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2Zm0 2.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm-.9 1.6v1.1c-1.2.3-1.9 1.1-1.9 2 0 1.2 1 1.7 2.2 2 .9.2 1.2.4 1.2.8s-.4.7-1 .7c-.7 0-1.2-.3-1.6-.8l-.9.8c.4.6 1.1 1 1.9 1.1v1.1h1.4v-1.1c1.2-.3 1.9-1.1 1.9-2.1 0-1.2-.9-1.7-2.2-2-.9-.2-1.2-.4-1.2-.8 0-.3.4-.6.9-.6.6 0 1 .2 1.4.6l.9-.8c-.4-.5-1-.9-1.7-1v-1Z',
  helmet: 'M9 2.5C5.1 2.5 2.5 5.6 2.5 9.4V12h2v3.5h3.2V12h2.6v3.5h3.2V12h2V9.4c0-3.8-2.6-6.9-6.5-6.9Zm-1 2.1h2v5.5H8Z',
  crown: 'M2 5.5l3.4 3L9 3l3.6 5.5 3.4-3-1.4 8H3.4ZM3.4 14.6h11.2V16H3.4Z',
  halo: 'M9 1.5l1 3.2 3.1-1.3-1.3 3.1 3.2 1L11.8 9l3.2 1.5-3.2 1 1.3 3.1-3.1-1.3-1 3.2-1-3.2-3.1 1.3 1.3-3.1-3.2-1L6.2 9 3 7.5l3.2-1-1.3-3.1 3.1 1.3ZM9 6.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Z',
  scales: 'M8.3 2h1.4v1.6l4.8 1.2-.3 1.2-.6-.2 2 4.7c0 1.2-1.1 2-2.4 2s-2.4-.8-2.4-2l2-4.9-3.1-.8V14h3v1.6H5.3V14h3V4.6l-3.1.8 2 4.9c0 1.2-1.1 2-2.4 2s-2.4-.8-2.4-2l2-4.7-.6.2-.3-1.2 4.8-1.2Z',
  sword: 'M14.8 1.5l1.7 1.7-7.6 8.4 1 1-1.2 1.2-1.1-1.1-2.4 2.4.6.6-1 1-2.7-2.7 1-1 .6.6 2.4-2.4-1.1-1.1 1.2-1.2 1 1Z',
  inflation: 'M3 15.5V13l4-4 3 3 4.2-4.2-1.7-1.7H17v4.5l-1.6-1.6L10 14.4l-3-3-2.2 2.2v1.9Z',
  ship: 'M8.4 1.5h1.2v1.8l5 6.2H9.6V3.8L5 9.5h3.4v1.4H2.3l1.9 4.6h9.6l1.9-4.6H9.6v-1.4h-1.2Z',
  gear: 'M7.8 1.5h2.4l.4 2a5.4 5.4 0 0 1 1.5.9l1.9-.7 1.2 2.1-1.5 1.3c.1.6.1 1.2 0 1.8l1.5 1.3-1.2 2.1-1.9-.7a5.4 5.4 0 0 1-1.5.9l-.4 2H7.8l-.4-2a5.4 5.4 0 0 1-1.5-.9l-1.9.7-1.2-2.1 1.5-1.3a5.6 5.6 0 0 1 0-1.8L2.8 5.8 4 3.7l1.9.7a5.4 5.4 0 0 1 1.5-.9ZM9 6.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z',
  bolt: 'M10.4 1.5 3.6 10.2h4.3l-1.3 6.3 6.8-8.7H9.1Z',
  ingot: 'M4.5 6h9l2.5 6H2Zm-2.5 7h14v2H2Z',
  gem: 'M5 2.5h8l3 4-7 9.5-7-9.5Zm-.6 4.3L9 13l-2-6.2Zm9.2 0H11L9 13Z',
  drop: 'M9 1.8C9 1.8 3.8 8 3.8 11.2a5.2 5.2 0 0 0 10.4 0C14.2 8 9 1.8 9 1.8Zm-2.6 9.1c.2 1.4 1.1 2.4 2.4 2.6l-.2 1.3c-1.9-.3-3.3-1.8-3.6-3.7Z',
  anchor: 'M9 1.5a2 2 0 0 1 .7 3.9V6.5h2.6v1.4H9.7v6.4c1.9-.3 3.4-1.6 3.9-3.4l-1.4-.4 2.6-2.2.8 3.2-1.3-.3C13.6 13.9 11.5 15.9 9 15.9s-4.6-2-5.3-4.7l-1.3.3.8-3.2 2.6 2.2-1.4.4c.5 1.8 2 3.1 3.9 3.4V7.9H5.7V6.5h2.6V5.4A2 2 0 0 1 9 1.5Zm0 1.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Z',
  crate: 'M2 4.5 9 2l7 2.5v9L9 16l-7-2.5Zm1.6 1.3v6.6l4.6 1.7V7.4Zm10.8 0L9.8 7.4v6.7l4.6-1.7ZM9 3.5 4.6 5 9 6.6 13.4 5Z',
  warn: 'M9 1.8 1.5 15.5h15Zm-.8 4.7h1.6l-.2 5H8.4Zm.8 6.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
};

const BY_LABEL: Record<string, string> = {
  oro: 'coin', ducados: 'coin', levas: 'helmet', 'mano de obra': 'helmet', prestigio: 'crown', piedad: 'halo', estabilidad: 'scales',
  agresividad: 'sword', inflación: 'inflation', colonos: 'ship', ci: 'gear', energía: 'bolt', metal: 'ingot', raros: 'gem', petróleo: 'drop',
  comercio: 'anchor', suministros: 'crate', disidencia: 'warn',
};

export default function StatIcon({ label, size = 18 }: { label: string; size?: number }) {
  const d = ICONS[BY_LABEL[label.toLowerCase()] ?? 'coin'];
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <defs>
        <linearGradient id="statGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0c0" /><stop offset=".5" stopColor="#d8b46a" /><stop offset="1" stopColor="#8a6a30" /></linearGradient>
      </defs>
      <path d={d} fill="url(#statGold)" stroke="#1a1208" strokeWidth=".5" fillRule="evenodd" />
    </svg>
  );
}
