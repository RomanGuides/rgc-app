// Roman Guides Companion — Chip component
// Porting del pattern visivo validato nello Spike (categoria/raggio).

import type { ReactNode } from 'react';

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  activeColor?: string;
}

export function Chip({ active, onClick, children, activeColor = 'var(--red)' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '6px 12px',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${active ? activeColor : 'var(--line)'}`,
        background: active ? activeColor : 'var(--surface-2)',
        color: active ? '#fff' : 'var(--stone)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'border-color var(--duration-fast) ease, background var(--duration-fast) ease, transform var(--duration-fast) ease',
      }}
      onMouseEnter={(e) => {
        if (active) return;
        e.currentTarget.style.borderColor = 'var(--black)';
      }}
      onMouseLeave={(e) => {
        if (active) return;
        e.currentTarget.style.borderColor = 'var(--line)';
      }}
    >
      {children}
    </button>
  );
}
