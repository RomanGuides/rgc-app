// Roman Guides Companion — ExperiencesScreen
// Ricostruita fedele alla struttura della webapp originale (screenshot di
// riferimento): banner sconto, sezioni per momento della giornata
// (Start Your Day / Golden Hour), griglia "All Experiences", placeholder
// video. Stesso Design System, nessun link ai video (rimossi su richiesta).

import { useEffect, useState } from 'react';
import type { Experience } from '../../data/types';
import { getExperiences } from '../../services/experiencesService';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { LINKS } from '../../config/links';

// Testi editoriali reali, trascritti dagli screenshot della webapp esistente.
const SUNRISE_SPOTLIGHTS = [
  {
    id: 'fiat-500-vintage-tour',
    category: 'Vintage Fiat 500 Experience',
    title: 'Rosie & Clementina at Sunrise',
    description:
      "Before Rome wakes up, the Eternal City belongs to you. Glide through peaceful streets, breathe the fresh morning air and experience iconic landmarks without traffic, crowds or the summer heat. It's the calmest, most authentic side of Rome — one that very few visitors ever get to see.",
  },
  {
    id: 'golf-cart-tour',
    category: 'Golf Cart Experience',
    title: 'Golf Cart Morning Escape',
    description:
      'Explore Rome in total comfort while the city is still quiet. Beat the summer heat, discover more in less time and enjoy breathtaking viewpoints before the crowds arrive.',
  },
];

const GOLDEN_HOUR_SPOTLIGHT = {
  id: 'drunken-history-rome',
  category: 'Drunken History Experience',
  title: 'Golden Hour & Forbidden Rome',
  description:
    "As the golden light transforms Rome into a masterpiece, join our most entertaining walking experience. Sip authentic Italian drinks, enjoy delicious local bites and uncover the city's most scandalous, seductive and forbidden stories.",
  features: [
    'Welcome drink',
    'Local beverages',
    'Delicious Roman food',
    'Guided walking experience',
    'The most shocking stories of Ancient Rome',
  ],
};

const NIGHT_BASE = 'https://romanguides.com/wp-content/uploads-webpc/uploads/App%20Roman%20Guides/Experiences/';

const NIGHT_SPOTLIGHTS = [
  {
    id: 'fiat-500-vintage-tour-night',
    bookingId: 'fiat-500-vintage-tour',
    category: 'Vintage Fiat 500 Experience',
    title: 'Meet Rosie & Clementina',
    description:
      "When the crowds disappear and Rome begins to sparkle, Rosie and Clementina come to life. Cruise through illuminated piazzas, silent cobbled streets and hidden corners of the Eternal City in two beautifully restored Fiat 500s, each with its own personality and story. Feel the warm summer breeze, admire Rome's monuments under the stars and experience the timeless charm of La Dolce Vita.",
    imageUrl: NIGHT_BASE + 'Rosie%20e%20clementina%20night.png',
  },
  {
    id: 'golf-cart-tour-night',
    bookingId: 'golf-cart-tour',
    category: 'Golf Cart Experience',
    title: 'Rome Under the Stars',
    description:
      'Escape the daytime heat and discover a quieter, more intimate Rome. Glide effortlessly between illuminated monuments, hidden streets and breathtaking viewpoints while the Eternal City reveals its most elegant side.',
    imageUrl: NIGHT_BASE + 'Golf%20night.png',
  },
];

function SpotlightCard({
  category,
  title,
  description,
  bookingUrl,
  imageUrl,
}: {
  category: string;
  title: string;
  description: string;
  bookingUrl?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <Card
      showMedia
      imageUrl={imageUrl}
      mediaAccentColor="#1a1a1a"
      mediaAccentColorEnd="#3a3a3a"
      mediaHeight={140}
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <Badge variant="red">{category}</Badge>
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, margin: 'var(--space-2) 0 var(--space-2)' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>{description}</div>
      <Button variant="ghost" href={bookingUrl || LINKS.TOURS} target="_blank" rel="noopener noreferrer">
        Discover Experience →
      </Button>
    </Card>
  );
}

export function ExperiencesScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    setExperiences(getExperiences());
  }, []);

  return (
    <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SectionHeader eyebrow="Roman Guides Companion" title="Experiences" />

      {/* ---------- Discount banner ---------- */}
      <Card showMedia={false} style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: 'var(--space-2)' }}>
          Thank you for touring with <strong>Roman Guides</strong>. Enjoy <strong style={{ color: 'var(--red)' }}>10% off</strong> your
          next experience when booking directly with us.
        </div>
        <div
          style={{
            display: 'inline-block',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.08em',
            background: 'var(--surface-2)',
            border: '1px dashed var(--red)',
            color: 'var(--red)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
          }}
        >
          ROME10
        </div>
        <Button href={LINKS.TOURS} target="_blank" rel="noopener noreferrer" variant="primary" fullWidth>
          Book Your Next Experience →
        </Button>
      </Card>

      {/* ---------- Start Your Day ---------- */}
      <SectionHeader eyebrow="Sunrise" title="Start Your Day" subtitle="The coolest and quietest way to experience Rome." />
      <div style={{ marginTop: 'var(--space-3)' }}>
        {SUNRISE_SPOTLIGHTS.map((s) => {
          const exp = experiences.find((e) => e.id === s.id);
          return <SpotlightCard key={s.title} {...s} bookingUrl={exp?.bookingUrl} imageUrl={exp?.imageUrl} />;
        })}
      </div>

      {/* ---------- Golden Hour ---------- */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <SectionHeader eyebrow="Golden Hour" title="When Rome Glows" subtitle="Stories come alive." />
        <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <Card
            showMedia
            imageUrl={experiences.find((e) => e.id === GOLDEN_HOUR_SPOTLIGHT.id)?.imageUrl}
            mediaAccentColor="#8a5a2a"
            mediaAccentColorEnd="#3a2410"
            mediaHeight={140}
          >
            <Badge variant="red">{GOLDEN_HOUR_SPOTLIGHT.category}</Badge>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, margin: 'var(--space-2) 0' }}>
              {GOLDEN_HOUR_SPOTLIGHT.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
              {GOLDEN_HOUR_SPOTLIGHT.description}
            </div>
            <ul style={{ margin: '0 0 var(--space-3)', padding: '0 0 0 18px', fontSize: '0.78rem', color: 'var(--stone)' }}>
              {GOLDEN_HOUR_SPOTLIGHT.features.map((f) => (
                <li key={f} style={{ marginBottom: 4 }}>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              href={experiences.find((e) => e.id === GOLDEN_HOUR_SPOTLIGHT.id)?.bookingUrl || LINKS.TOURS}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discover Experience →
            </Button>
          </Card>
        </div>
      </div>

      {/* ---------- Rome After Dark ---------- */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <SectionHeader eyebrow="After Dark" title="Rome After Dark" subtitle="The Eternal City, illuminated and unforgettable." />
        <div style={{ marginTop: 'var(--space-3)' }}>
          {NIGHT_SPOTLIGHTS.map((s) => (
            <SpotlightCard
              key={s.id}
              category={s.category}
              title={s.title}
              description={s.description}
              imageUrl={s.imageUrl}
              bookingUrl={experiences.find((e) => e.id === s.bookingId)?.bookingUrl}
            />
          ))}
        </div>
      </div>

      {/* ---------- All Experiences ---------- */}
      <SectionHeader eyebrow="More ways to fall in love with Rome" title="All Experiences" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        {experiences.map((exp) => (
          <a
            key={exp.id}
            href={exp.bookingUrl || LINKS.TOURS}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                height: 90,
                borderRadius: 'var(--radius-md)',
                background: exp.imageUrl ? `url(${exp.imageUrl}) center/cover` : 'linear-gradient(160deg, #1a1a1a, #3a3a3a)',
                boxShadow: 'var(--shadow-card)',
                marginBottom: 6,
              }}
            />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3 }}>{exp.name}</div>
          </a>
        ))}
      </div>

      {/* ---------- Watch Roman Guides in Action (coming soon) ---------- */}
      <SectionHeader eyebrow="See it before you book" title="Watch Roman Guides in Action" />
      <Card showMedia={false} style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
        <div style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)' }}>🎬</div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>Videos coming soon</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--stone)' }}>
          We're preparing real footage from our tours — check back soon.
        </div>
      </Card>
    </div>
  );
}
