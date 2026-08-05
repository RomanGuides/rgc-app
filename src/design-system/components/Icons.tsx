// Roman Guides Companion — Icons
// Sei icone introdotte dal redesign v1 (Icons Addendum), per Search/Filter/
// Person/Upload/TurnRight/ChevronLeft. Stessa BASE per tutte: 24×24,
// currentColor, stroke 2, round caps/joins, nessun fill — coerente con le
// icone già esistenti altrove nel design system.
//
// HeartIcon aggiunta in Fase 4 (Place): serve per il bottone salva, che la
// spec descrive come icona che si riempie di rosso quando salvato, non più
// l'emoji ❤️/🤍 usata prima.

import type { SVGProps } from 'react';

const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 24,
  height: 24,
};

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4 4" />
    </svg>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  );
}

export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

// Usata a 30px sul banner di navigazione — l'unica icona nell'app sopra i
// 24px. Per una svolta a sinistra: mirror con transform: scaleX(-1), non
// disegnare un secondo path.
export function TurnRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M8 20V9a4 4 0 0 1 4-4h5" />
      <path d="m14 2 4 3-4 3" />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

interface HeartIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function HeartIcon({ filled, ...props }: HeartIconProps) {
  return (
    <svg {...BASE} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.3 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}
