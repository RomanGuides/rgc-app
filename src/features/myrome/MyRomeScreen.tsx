// Roman Guides Companion — MyRomeScreen
// Arricchita su richiesta esplicita: "Meet the Guides" con foto reale dove
// disponibile, e sezione "Our Story" (testo approvato dal founder — fonte
// unica in config/story.ts, riusata anche come pull-quote in Home).

import { useEffect, useState } from 'react';
import type { Guide, Testimonial } from '../../data/types';
import { getGuides } from '../../services/guidesService';
import { getTestimonials } from '../../services/testimonialsService';
import { SavedPlacesList } from './SavedPlacesList';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import type { TabKey } from '../../design-system/components/TabBar';
import { OUR_STORY_PARAGRAPHS } from '../../config/story';

function GuidePhoto({ avatar, name }: { avatar: string; name: string }) {
  const isRealUrl = avatar.startsWith('http');
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        flexShrink: 0,
        background: isRealUrl ? `url(${avatar}) center/cover` : 'linear-gradient(160deg, var(--red), var(--red-dk))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: '1.3rem',
      }}
    >
      {!isRealUrl && name.charAt(0)}
    </div>
  );
}

interface MyRomeScreenProps {
  onNavigate: (tab: TabKey) => void;
}

export function MyRomeScreen({ onNavigate }: MyRomeScreenProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setGuides(getGuides());
    setTestimonials(getTestimonials());
  }, []);

  return (
    <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SectionHeader eyebrow="Roman Guides Companion" title="My Rome" subtitle="Your saved places, your guides, and the community." />

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SavedPlacesList onSelect={() => onNavigate('rome')} />
      </div>

      <SectionHeader eyebrow="Your local experts" title="Meet the Guides" />
      <div style={{ marginTop: 'var(--space-3)' }}>
        {guides.map((g) => (
          <Card key={g.id} showMedia={false} style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <GuidePhoto avatar={g.avatar} name={g.name} />
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{g.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>{g.displayTitle}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.55, marginBottom: 'var(--space-3)' }}>{g.bio}</div>
            <Button href={g.whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
              💬 WhatsApp {g.name}
            </Button>
          </Card>
        ))}
      </div>

      {/* ---------- Our Story ---------- */}
      <div style={{ marginTop: 'var(--space-6)' }}>
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

      {testimonials.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <SectionHeader eyebrow="Guest Reviews" title="What Guests Are Saying" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            {testimonials.map((t) => (
              <Card key={t.id} showMedia={false} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ color: '#e8a93b', fontSize: '0.85rem', marginBottom: 'var(--space-2)' }}>
                  {'★'.repeat(Math.round(t.rating))}
                </div>
                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 'var(--space-2)' }}>
                  "{t.quoteText}"
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--stone)', fontWeight: 700 }}>{t.attribution}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-6)' }}>
        <SectionHeader eyebrow="Leave a Review" title="Say Thank You With a Review" subtitle="Once on TripAdvisor, you can pick the specific tour you took." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <Button href="https://g.page/r/CeVG3u7HbgowEBM/review" target="_blank" rel="noopener noreferrer" variant="ghost" fullWidth>
            ⭐ Leave a Google Review
          </Button>
          <Button
            href="https://www.tripadvisor.it/UserReviewEdit-g187791-d33021458-Roman_Guides-Rome_Lazio.html"
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            fullWidth
          >
            🏛️ Leave a TripAdvisor Review
          </Button>
        </div>
      </div>
    </div>
  );
}
