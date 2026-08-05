// Roman Guides Companion — EmptyState component
// Regole dall'addendum "Empty and Error States" (redesign v1): sinistra, mai
// centrato; l'unica grafica ammessa è un'icona outline 40px in `#D8CFC7`,
// non un'emoji; il copy è testo di corpo (17px), non fine print; una o due
// azioni testuali al massimo, mai un bottone pieno — se non c'è un'azione
// che aiuta davvero, non c'è azione.

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode; // svg 40x40, stroke #D8CFC7 — vedi design-system/components/Icons.tsx. Non tutti gli stati ne hanno uno (es. "filtri, nessun risultato")
  message: string;
  action?: ReactNode; // una o due azioni testuali (es. <a>/<button> in var(--red)), opzionale
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'left', padding: '20px 0' }}>
      {icon && <div style={{ display: 'flex', width: 40, height: 40, marginBottom: 22 }}>{icon}</div>}
      <div style={{ fontSize: '1.0625rem', lineHeight: 1.6, color: '#443A33', marginBottom: action ? 22 : 0 }}>
        {message}
      </div>
      {action}
    </div>
  );
}
