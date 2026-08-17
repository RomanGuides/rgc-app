// Roman Guides Companion — Badge component
// Porting del pattern .badge-soon della landing: pillola, maiuscolo,
// piccolo, con varianti colore per contesti diversi (stato, categoria, prezzo).

import type { ReactNode } from 'react';
import { StarIcon } from './Icons';

interface BadgeProps {
  children: ReactNode;
  variant?: 'red' | 'black' | 'neutral';
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, { bg: string; color: string; border: string }> = {
  // rgb(227,6,19) = --red (#e30613), aggiornato insieme al token nella Fase 2
  // del brand — era rgba(255,0,51,...), il vecchio rosso, rimasto un
  // letterale stonato dopo il cambio token.
  red: { bg: 'rgba(227,6,19,0.08)', color: 'var(--red)', border: 'rgba(227,6,19,0.25)' },
  black: { bg: 'rgba(0,0,0,0.06)', color: 'var(--ink)', border: 'rgba(0,0,0,0.15)' },
  // Mai usata oggi (verificato) — il suo sfondo puntava a --surface-2, che la
  // Fase 2 del brand ha spostato da beige neutro a Roman Blush (rosa). Non
  // toccata qui: quale colore renda davvero "neutral" post-rebrand è una
  // decisione della Fase 5 (sweep token più ampio), non da improvvisare qui.
  neutral: { bg: 'var(--surface-2)', color: 'var(--stone)', border: 'var(--line)' },
};

export function Badge({ children, variant = 'red' }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px',
      }}
    >
      {children}
    </span>
  );
}

// Consolidata qui (audit brand 2026-08-17): prima viveva come componente
// esportato da ExperiencesScreen.tsx, riusata correttamente da HomeScreen.tsx
// ma COPIATA A MANO (non importata) dentro TourDetailScreen.tsx, con un
// colore leggermente diverso (#1A1614 letterale invece di var(--ink)) —
// esattamente il tipo di drift che questo file di componenti condivisi deve
// evitare. Non è del tipo variant="..." di Badge sopra (serve un'icona +
// testo, Badge è solo testo), quindi resta un componente a parte ma vive
// nello stesso file invece che in una schermata feature.
export function BestSellerBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        background: 'rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px 4px 8px',
      }}
    >
      <StarIcon width={10} height={10} />
      Best Seller
    </div>
  );
}
