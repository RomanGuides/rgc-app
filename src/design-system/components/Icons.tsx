// Roman Guides Companion — Icons
// Sei icone introdotte dal redesign v1 (Icons Addendum), per Search/Filter/
// Person/Upload/TurnRight/ChevronLeft. Stessa BASE per tutte: 24×24,
// currentColor, stroke 2, round caps/joins, nessun fill — coerente con le
// icone già esistenti altrove nel design system.
//
// HeartIcon aggiunta in Fase 4 (Place): serve per il bottone salva, che la
// spec descrive come icona che si riempie di rosso quando salvato, non più
// l'emoji ❤️/🤍 usata prima.

import type { ReactElement, SVGProps } from 'react';
import type { PlaceCategory } from '../../data/types';

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

// Congedo, non passo indietro nella navigazione — usata da BookingWidgetModal
// al posto di ChevronLeftIcon: chiudere il checkout non è "tornare indietro".
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// LocateButton (audit UX 2026-08-16): sostituiscono 🧭/📍, gli ultimi due
// glifi emoji rimasti nella UI della mappa vera e propria (i marker di
// categoria restano emoji di proposito, fuori scope per questa modifica).
export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-4.2 2.8L9 16l4.2-2.8L15 9Z" />
    </svg>
  );
}

export function LocationPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

// Riga di fiducia sotto il nome del tour in BookingWidgetModal — l'unico
// indizio visivo che la pagina sia autentica per chi sta per inserire la carta.
export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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

// Icone di categoria per il popover Filtro (RomeSheet.tsx) — sostituiscono
// le emoji, che restavano l'unico punto dell'app senza la coerenza
// stroke-2/24×24/round-caps del resto del design system. Non definite
// nell'Icons Addendum (che anzi dice esplicitamente di NON farlo — nota
// datata, superata su richiesta esplicita): disegnate qui seguendo la
// stessa BASE delle altre sei icone, nessuna fonte esterna da cui copiarle.

export function UtensilsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12M17 3c-1.5 2-2 4-2 6s.5 4 2 5v7" />
    </svg>
  );
}

export function PizzaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3 3 20h18L12 3Z" />
      <circle cx="10" cy="13" r="1" />
      <circle cx="14" cy="16" r="1" />
    </svg>
  );
}

export function GelatoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M8.5 10 12 21l3.5-11" />
    </svg>
  );
}

export function RooftopBarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 20h18" />
      <path d="M6 20V9l4-3 4 3v11" />
      <circle cx="17" cy="13" r="3" />
    </svg>
  );
}

export function CocktailBarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 4h16" />
      <path d="M4 4 12 13 20 4" />
      <path d="M12 13v6" />
      <path d="M9 20h6" />
    </svg>
  );
}

export function GalleryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 10 12 4l9 6" />
      <path d="M4 10v9M9 10v9M15 10v9M20 10v9" />
      <path d="M2 19h20" />
    </svg>
  );
}

// Introdotte nel redesign v1 di TourDetailScreen (2026-08-16) per la riga
// fatti/sezioni icon-driven — stessa BASE, nessuna eccezione al fill/colore.

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12.6 3H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .6 1.4l8.4 8.4a2 2 0 0 0 2.8 0l6-6a2 2 0 0 0 0-2.8L12.6 3Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}

export function WheelchairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M11 8v4l3 2.5M11 12h5M9.5 12A5.5 5.5 0 1 0 15 18.2" />
      <path d="M14.5 14.5 18 20" />
    </svg>
  );
}

export function IdCardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M6 15.5c.6-1.3 1.6-2 2.5-2s1.9.7 2.5 2M14 9.5h5M14 13h5" />
    </svg>
  );
}

export function AlertCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.2" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} fill="currentColor" stroke="none" {...props}>
      <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<PlaceCategory, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  restaurant: UtensilsIcon,
  pasta: UtensilsIcon,
  pizza: PizzaIcon,
  gelato: GelatoIcon,
  rooftop_bar: RooftopBarIcon,
  cocktail_bar: CocktailBarIcon,
  gallery: GalleryIcon,
};
