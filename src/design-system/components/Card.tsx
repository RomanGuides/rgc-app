// Roman Guides Companion — Card component
//
// Progettata per un campo immagine che OGGI non esiste ancora nel Data
// Model (decisione esplicita: non estenderlo in questa fase). Quando verrà
// aggiunto, basterà passare `imageUrl` — nessun ridisegno necessario.
// Senza immagine, mostra un placeholder a gradiente coerente col brand
// (stesso pattern già usato nella landing per "Meet the Guides", dove non
// c'è una foto stock ma un gradiente diagonale nei colori del brand).
//
// Il layout NON dipende obbligatoriamente dalla foto: showMedia=false
// permette righe compatte (liste) senza area immagine, per lo stesso
// componente riutilizzato in contesti diversi (Card prodotto vs riga lista).

import type { ReactNode, CSSProperties, MouseEvent } from 'react';

interface CardProps {
  imageUrl?: string | null;
  imageAlt?: string;
  showMedia?: boolean; // false = nessuna area immagine, per righe compatte
  mediaAccentColor?: string; // colore iniziale del gradiente placeholder, default rosso brand
  mediaAccentColorEnd?: string; // colore finale del gradiente, default rosso scuro brand
  mediaHeight?: number;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  style?: CSSProperties;
}

export function Card({
  imageUrl,
  imageAlt = '',
  showMedia = true,
  mediaAccentColor = 'var(--red)',
  mediaAccentColorEnd = 'var(--red-dk)',
  mediaHeight = 140,
  children,
  onClick,
  href,
  target,
  rel,
  style,
}: CardProps) {
  const content = (
    <>
      {showMedia && (
        <div
          style={{
            width: '100%',
            height: mediaHeight,
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            background: imageUrl
              ? undefined
              : `linear-gradient(160deg, ${mediaAccentColor}, ${mediaAccentColorEnd})`,
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt={imageAlt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      )}
      <div style={{ padding: 'var(--space-4)' }}>{children}</div>
    </>
  );

  const sharedStyle: CSSProperties = {
    display: 'block',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    textDecoration: 'none',
    color: 'inherit',
    overflow: 'hidden',
    transition: `transform ${'var(--duration-normal)'} var(--ease-hover), box-shadow var(--duration-normal) ease`,
    cursor: onClick || href ? 'pointer' : 'default',
    ...style,
  };

  const interactiveHandlers = {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      if (!onClick && !href) return;
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    },
  };

  if (href) {
    return (
      <a href={href} target={target} rel={rel} style={sharedStyle} {...interactiveHandlers}>
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} style={sharedStyle} {...interactiveHandlers}>
      {content}
    </div>
  );
}
