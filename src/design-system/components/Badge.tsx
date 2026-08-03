// Roman Guides Companion — Badge component
// Porting del pattern .badge-soon della landing: pillola, maiuscolo,
// piccolo, con varianti colore per contesti diversi (stato, categoria, prezzo).

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'red' | 'black' | 'neutral';
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, { bg: string; color: string; border: string }> = {
  red: { bg: 'rgba(255,0,51,0.08)', color: 'var(--red)', border: 'rgba(255,0,51,0.25)' },
  black: { bg: 'rgba(0,0,0,0.06)', color: 'var(--ink)', border: 'rgba(0,0,0,0.15)' },
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
