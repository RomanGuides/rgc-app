// Roman Guides Companion — Icons
// Set unico di icone SVG a linea (nessuna dipendenza esterna, nessun font
// da caricare) — sostituisce tutti gli emoji usati finora nell'app.
// Stile: 24x24 viewBox, stroke coerente, currentColor per ereditare il colore dal parent.

import type { SVGProps } from 'react';

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 20,
  height: 20,
};

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ExperiencesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5M16 4v5" />
    </svg>
  );
}

export function ExploreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.3 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

export function ForkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12M17 3c-1.5 2-2 4-2 6s.5 4 2 5v7" />
    </svg>
  );
}

export function LandmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" />
    </svg>
  );
}

export function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 2c3 3.5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6.5 5-10Z" />
    </svg>
  );
}

export function ToiletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function ShoppingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 4h16v12H8l-4 4V4Z" />
    </svg>
  );
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 11l1.5-5A2 2 0 0 1 8.4 4.5h7.2A2 2 0 0 1 17.5 6L19 11M4 11h16v6a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z" />
      <circle cx="7.5" cy="15" r="1.2" />
      <circle cx="16.5" cy="15" r="1.2" />
    </svg>
  );
}

export function TrainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="5" y="3" width="14" height="15" rx="3" />
      <path d="M9 3v4h6V3M8 21l1-3M16 21l-1-3M8 14h.01M16 14h.01" />
    </svg>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .8 3a2 2 0 0 1-.5 2.1L8 10.2a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c1 .4 2 .7 3 .8a2 2 0 0 1 1.5 2Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export const ICON_REGISTRY = {
  fork: ForkIcon,
  landmark: LandmarkIcon,
  droplet: DropletIcon,
  toilet: ToiletIcon,
  shopping: ShoppingIcon,
  message: MessageIcon,
  car: CarIcon,
  train: TrainIcon,
  phone: PhoneIcon,
  mapPin: MapPinIcon,
} as const;

export type IconKey = keyof typeof ICON_REGISTRY;
