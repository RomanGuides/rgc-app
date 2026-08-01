// Roman Guides Companion — SectionHeader component
// Porting esatto del pattern .eyebrow / .section-title / .section-sub
// della landing — l'etichetta piccola maiuscola in Vollkorn è la firma
// visiva "editoriale" che ricorre in tutta la landing.

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            marginBottom: 2,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(1.4rem, 4.6vw, 1.7rem)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          lineHeight: 1.18,
          color: 'var(--ink)',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--stone)',
            margin: '6px 0 0 0',
            lineHeight: 1.5,
            maxWidth: '46ch',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
