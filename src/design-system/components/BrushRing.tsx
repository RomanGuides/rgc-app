// Roman Guides Companion — BrushRing
// Il tratto di pennello che circonda il wordmark nel logo, riusato come
// firma visiva in punti selezionati dell'app (tab attiva, ritratto guida).
// Un solo path condiviso — se cambia il tratto del logo, cambia ovunque.

interface BrushRingProps {
  size?: number;
  active?: boolean;
  strokeWidth?: number;
}

export function BrushRing({ size = 36, active = true, strokeWidth = 2.6 }: BrushRingProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,0.9,0.32,1)',
        pointerEvents: 'none',
      }}
    >
      <path
        d="M20 2 C29 1, 37 8, 38 18 C39 28, 31 37, 20 38 C10 39, 2 31, 2 20 C1 10, 11 2, 20 2"
        fill="none"
        stroke="var(--red)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
