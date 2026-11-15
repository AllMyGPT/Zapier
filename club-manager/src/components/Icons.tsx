import React from 'react';

/** Original line icons for the side rail (stroke = currentColor). */
const P: Record<string, React.ReactNode> = {
  office: <><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /><path d="M9 10h.01M15 10h.01" /></>,
  squad: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8" /></>,
  tactics: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7l2.5 2.5M9.5 7L7 9.5" /><circle cx="16" cy="16" r="1.8" /><path d="M8 16c3 0 6-3 7-8" strokeDasharray="1.5 2.5" /><path d="M13 7.5l2-.2.3 2" /></>,
  training: <><path d="M4 20l4-9 4 3 4-7 4 13" /><circle cx="16" cy="4" r="1.6" /><path d="M2 20h20" /></>,
  transfers: <><path d="M4 8h13l-3-3" /><path d="M20 16H7l3 3" /></>,
  finances: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /><circle cx="16.5" cy="14.5" r="1.5" /></>,
  club: <><ellipse cx="12" cy="13" rx="9" ry="5" /><path d="M3 13v3c0 2.8 4 5 9 5s9-2.2 9-5v-3" /><ellipse cx="12" cy="13" rx="4.5" ry="2.2" /><path d="M5 9V4M19 9V4" /></>,
  comps: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3" /><path d="M12 13v4M8 21h8M9.5 17h5l.5 4h-6z" /></>,
  save: <><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v5h7V3" /><rect x="8" y="13" width="8" height="5" rx="1" /></>,
};

export function Icon({ name }: { name: keyof typeof P | string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
