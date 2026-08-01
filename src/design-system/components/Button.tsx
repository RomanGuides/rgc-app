// Roman Guides Companion — Button component
// Porting del pattern .btn della landing: pillola, hover che scurisce e
// solleva con bagliore colorato, varianti ghost/gold, pressione che comprime
// leggermente. Sostituisce lo stile inline ripetuto in ogni componente.

import type { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'gold';
  fullWidth?: boolean;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({ children, variant = 'primary', fullWidth, onClick, href, target, rel }: ButtonProps) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 'var(--radius-pill)',
    padding: '10px 16px',
    fontSize: '0.82rem',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: fullWidth ? '100%' : undefined,
    transition: `background var(--duration-fast) ease, transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease`,
    boxSizing: 'border-box' as const,
  };

  const variantStyle =
    variant === 'ghost'
      ? { background: 'transparent', color: 'var(--red)', borderColor: 'var(--line)' }
      : variant === 'gold'
      ? { background: 'var(--black)', borderColor: 'var(--black)', color: 'var(--white)' }
      : { background: 'var(--red)', borderColor: 'var(--red)', color: 'var(--white)' };

  function handleEnter(e: MouseEvent<HTMLElement>) {
    e.currentTarget.style.transform = 'translateY(-1px)';
    if (variant === 'ghost') {
      e.currentTarget.style.background = 'rgba(255,0,51,0.06)';
    } else if (variant === 'gold') {
      e.currentTarget.style.background = '#262626';
    } else {
      e.currentTarget.style.background = 'var(--red-dk)';
      e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)';
    }
  }

  function handleLeave(e: MouseEvent<HTMLElement>) {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = variantStyle.background;
  }

  const style = { ...base, ...variantStyle };

  if (href) {
    return (
      <a href={href} target={target} rel={rel} style={style} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} style={style} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
    </button>
  );
}
