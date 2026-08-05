// Roman Guides Companion — ExperiencesScreen
//
// Ristrutturata (redesign v1): questo tab ora è anche "chi siamo e cosa puoi
// fare con noi" — assorbe Meet the Guides / What Guests Say / Our Story,
// spostati qui da MyRomeScreen (ora ridotta alla sola shortlist "Saved").
// Restano 3 tab, nessun quarto tab.
//
// Ordine (dall'alto): masthead breve → le sette tour (subito, non più in
// basso del secondo scroll: chi apre per prenotare le trova immediatamente)
// → Meet the Guides → What guests say → Our Story (chi vuole conoscerci
// continua a scorrere). Nessuno dei due percorsi paga per l'altro.
//
// Testi definitivi del founder (agosto 2026) per masthead/Our Story/bio guide
// in config/story.ts e data/guides.json — non più placeholder. Contenuto che
// non trovava posto nelle 5 sezioni sopra (banner sconto, copy "notturna"
// delle stesse 2 tour, bottone WhatsApp/TripAdvisor per guida, card "video in
// arrivo") è stato spostato in docs/parked-content.md, non cancellato.

import { useEffect, useState } from 'react';
import type { Experience, Guide, Testimonial } from '../../data/types';
import { getExperiences } from '../../services/experiencesService';
import { getGuides } from '../../services/guidesService';
import { getTestimonials } from '../../services/testimonialsService';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { OUR_STORY_MASTHEAD, OUR_STORY_PARAGRAPHS } from '../../config/story';
import { LINKS } from '../../config/links';
import { BookingWidgetModal } from './BookingWidgetModal';

// Copy editoriale esistente, riassociata per id — non più raggruppata per
// momento della giornata (Sunrise/Golden Hour/After Dark), ora è un
// attributo per tour dentro l'unica sezione "le sette tour".
const TOUR_COPY: Record<string, { category?: string; description?: string; features?: string[] }> = {
  'fiat-500-vintage-tour': {
    category: 'Vintage Fiat 500 Experience',
    description:
      "Before Rome wakes up, the Eternal City belongs to you. Glide through peaceful streets, breathe the fresh morning air and experience iconic landmarks without traffic, crowds or the summer heat. It's the calmest, most authentic side of Rome — one that very few visitors ever get to see.",
  },
  'golf-cart-tour': {
    category: 'Golf Cart Experience',
    description:
      'Explore Rome in total comfort while the city is still quiet. Beat the summer heat, discover more in less time and enjoy breathtaking viewpoints before the crowds arrive.',
  },
  'drunken-history-rome': {
    category: 'Drunken History Experience',
    description:
      "As the golden light transforms Rome into a masterpiece, join our most entertaining walking experience. Sip authentic Italian drinks, enjoy delicious local bites and uncover the city's most scandalous, seductive and forbidden stories.",
    features: [
      'Welcome drink',
      'Local beverages',
      'Delicious Roman food',
      'Guided walking experience',
      'The most shocking stories of Ancient Rome',
    ],
  },
};

function GuidePhoto({ avatar, name }: { avatar: string; name: string }) {
  const isRealUrl = avatar.startsWith('http');
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        flexShrink: 0,
        background: isRealUrl ? `url(${avatar}) center/cover` : 'linear-gradient(160deg, var(--red), var(--red-dk))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: '1.1rem',
      }}
    >
      {!isRealUrl && name.charAt(0)}
    </div>
  );
}

function TourCard({ exp, onBook }: { exp: Experience; onBook: (exp: Experience) => void }) {
  const copy = TOUR_COPY[exp.id];
  return (
    <Card showMedia imageUrl={exp.imageUrl} mediaHeight={140} style={{ marginBottom: 'var(--space-4)' }}>
      {copy?.category && <Badge variant="red">{copy.category}</Badge>}
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, margin: 'var(--space-2) 0 var(--space-2)' }}>
        {exp.name}
      </div>
      {copy?.description && (
        <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>{copy.description}</div>
      )}
      {copy?.features && (
        <ul style={{ margin: '0 0 var(--space-3)', padding: '0 0 0 18px', fontSize: '0.78rem', color: 'var(--stone)' }}>
          {copy.features.map((f) => (
            <li key={f} style={{ marginBottom: 4 }}>
              {f}
            </li>
          ))}
        </ul>
      )}
      {exp.bookingUrl ? (
        <Button variant="ghost" onClick={() => onBook(exp)}>
          Discover Experience →
        </Button>
      ) : (
        <Button variant="ghost" href={LINKS.TOURS} target="_blank" rel="noopener noreferrer">
          Discover Experience →
        </Button>
      )}
    </Card>
  );
}

export function ExperiencesScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookingExperience, setBookingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    setExperiences(getExperiences());
    setGuides(getGuides());
    setTestimonials(getTestimonials());
  }, []);

  return (
    <>
    <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {/* ---------- Masthead ---------- */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            marginBottom: 8,
          }}
        >
          Roman Guides
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.95rem', fontWeight: 700, lineHeight: 1.18, color: 'var(--ink)' }}>
          {OUR_STORY_MASTHEAD}
        </div>
      </div>

      {/* ---------- The seven tours ---------- */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        {experiences.map((exp) => (
          <TourCard key={exp.id} exp={exp} onBook={setBookingExperience} />
        ))}
      </div>

      {/* ---------- Meet the Guides ---------- */}
      <SectionHeader eyebrow="Your local experts" title="Meet the Guides" />
      <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        {guides.map((g) => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <GuidePhoto avatar={g.avatar} name={g.name} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>{g.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.4 }}>{g.bio}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- What guests say ---------- */}
      {testimonials.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <SectionHeader eyebrow="Guest Reviews" title="What Guests Are Saying" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.5, color: 'var(--ink)' }}>"{t.quoteText}"</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--stone)', fontWeight: 700, marginTop: 4 }}>{t.attribution}</div>
              </div>
            ))}
          </div>
          <a
            href="https://g.page/r/CeVG3u7HbgowEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}
          >
            Leave a review →
          </a>
        </div>
      )}

      {/* ---------- Our Story ---------- */}
      <div>
        <SectionHeader eyebrow="Our Story" title="Rome, told by the people who live it" />
        <Card showMedia={false} style={{ marginTop: 'var(--space-3)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.65 }}>
            {OUR_STORY_PARAGRAPHS.map((paragraph, i) => (
              <p key={i} style={{ margin: i === OUR_STORY_PARAGRAPHS.length - 1 ? 0 : '0 0 var(--space-3)' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
    {bookingExperience && (
      <BookingWidgetModal experience={bookingExperience} onClose={() => setBookingExperience(null)} />
    )}
    </>
  );
}
