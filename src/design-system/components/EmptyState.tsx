// Roman Guides Companion — EmptyState component
// Componente condiviso per stati vuoti (My Rome senza salvati, ricerca senza
// risultati, ecc.) — invitante, non un'area bianca silenziosa.

import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  action?: ReactNode; // bottone/link opzionale, es. "Esplora la mappa"
}

export function EmptyState({ emoji, title, message, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: 'var(--space-3)' }}>{emoji}</div>
      <div
        style={{
          fontFamily: 'var(--display)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: action ? 'var(--space-4)' : 0 }}>
        {message}
      </div>
      {action}
    </div>
  );
}
