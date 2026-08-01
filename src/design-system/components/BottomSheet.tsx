// Roman Guides Companion — BottomSheet component
// Porting del pattern validato nello Spike (animazione, backdrop, maniglia).
// Generico: il contenuto (dettaglio luogo, lista My Rome, ecc.) è children.

import type { ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,10,8,0.35)',
          zIndex: 9,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.25)',
          padding: '10px 20px max(24px, env(safe-area-inset-bottom)) 20px',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
          maxHeight: 'min(60vh, calc(100vh - 90px))',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--surface-2)',
            border: 'none',
            color: 'var(--stone)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
        <div
          style={{
            width: 36,
            height: 4,
            background: 'var(--line)',
            borderRadius: 2,
            margin: '2px auto 14px auto',
          }}
        />
        {children}
      </div>
    </>
  );
}
