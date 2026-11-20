export default function PitchLines({ vertical = true }: { vertical?: boolean }) {
  // 68 x 100 vertical pitch
  const s = 'rgba(255,255,255,.55)';
  if (!vertical) return null;
  return (
    <svg className="lines" viewBox="0 0 68 100" preserveAspectRatio="none">
      <g fill="none" stroke={s} strokeWidth=".35">
        <rect x="2" y="2" width="64" height="96" />
        <line x1="2" y1="50" x2="66" y2="50" />
        <circle cx="34" cy="50" r="8" />
        <rect x="14" y="2" width="40" height="15" /><rect x="24" y="2" width="20" height="5.5" />
        <rect x="14" y="83" width="40" height="15" /><rect x="24" y="92.5" width="20" height="5.5" />
        <path d="M27 17 A8 8 0 0 0 41 17" /><path d="M27 83 A8 8 0 0 1 41 83" />
      </g>
      <circle cx="34" cy="50" r=".7" fill={s} /><circle cx="34" cy="12" r=".5" fill={s} /><circle cx="34" cy="88" r=".5" fill={s} />
    </svg>
  );
}
