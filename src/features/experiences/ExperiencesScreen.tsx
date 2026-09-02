// Roman Guides Companion — ExperiencesScreen
//
// Ristrutturata (redesign v1): questo tab è anche "chi siamo e cosa puoi
// fare con noi" — assorbì What Guests Say / Our Story, spostati qui da
// MyRomeScreen (ora ridotta alla sola shortlist "Saved").
//
// Ordine (dall'alto): masthead breve → banner sconto → i tour raggruppati
// per tipo (subito, non più in basso del secondo scroll: chi apre per
// prenotare li trova immediatamente) → gift card → What guests say → Our
// Story (chi vuole conoscerci continua a scorrere).
//
// Meet the Guides stava qui, quinta di sette sezioni. Misurata a 5.657px
// dall'inizio su viewport 390x844 — 7,3 schermate di scorrimento, l'85% di
// profondità del tab, e nessun indizio sopra la piega che le guide
// esistessero. Promossa a tab propria il 2026-09-01 (features/guides/):
// contenuto identico, solo spostato. Da qui è quindi sparito anche il
// bersaglio di scroll "guides" — vedi il commento sull'effetto più sotto.
//
// Testi definitivi del founder (agosto 2026) per masthead/Our Story in
// config/story.ts — non più placeholder. Contenuto che non trovava posto
// nelle sezioni sopra (copy "notturna" delle stesse 2 tour, bottone
// WhatsApp/TripAdvisor per guida, card "video in arrivo") è stato spostato
// in docs/parked-content.md, non cancellato.

import { useEffect, useRef, useState } from 'react';
import type { Experience, TourType, Testimonial } from '../../data/types';
import { getExperiences, getExperienceImageUrl } from '../../services/experiencesService';
import { getTestimonials } from '../../services/testimonialsService';
import { Card } from '../../design-system/components/Card';
import { BrandMark } from '../../design-system/components/BrandMark';
import { Badge, BestSellerBadge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { OUR_STORY_MASTHEAD, OUR_STORY_PARAGRAPHS } from '../../config/story';
import { LINKS } from '../../config/links';
import { REPEAT_BOOKING_DISCOUNT_CODE } from '../../config/promotions';
import { BookingWidgetModal, type BookableItem } from './BookingWidgetModal';
import { TourDetailScreen } from './TourDetailScreen';
import { ClockIcon, TagIcon } from '../../design-system/components/Icons';
import { formatDuration } from '../../utils/formatDuration';

// Etichetta breve per la card — distinta dalla descrizione vera e propria,
// che ora vive in experiences.json (usata da TourDetailScreen).
// Solo 3 tour su 7 ne hanno una scritta; le altre non mostrano il badge.
const TOUR_CATEGORY: Record<string, string> = {
  'fiat-500-vintage-tour': 'Vintage Fiat 500 Experience',
  'golf-cart-tour': 'Golf Cart Experience',
  'drunken-history-rome': 'Drunken History Experience',
};

// Tab Home (2026-08-16): "le sette tour" diventa un elenco raggruppato per
// tourType — food-tour/cooking-class non hanno ancora prodotti reali (le 6
// nuove tour del founder non sono ancora arrivate), quindi quei gruppi
// semplicemente non compaiono finché experiences.json non ne contiene almeno
// una, stesso principio "mai una sezione vuota" già usato ovunque in questo file.
// Esportate: HomeScreen.tsx le riusa per la riga di tessere-categoria, stessa
// tassonomia, nessuna seconda lista di etichette da tenere sincronizzata.
export const TOUR_TYPE_LABELS: Record<TourType, string> = {
  'classic-tour': 'Classic Tours',
  experience: 'Experiences',
  'food-tour': 'Food Tours',
  'cooking-class': 'Cooking Classes',
  'day-trip': 'Day Trips',
};
export const TOUR_TYPE_ORDER: TourType[] = ['classic-tour', 'experience', 'food-tour', 'cooking-class', 'day-trip'];

function TourTypeHeading({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: 'var(--stone)',
        marginBottom: 'var(--space-3)',
      }}
    >
      {children}
    </div>
  );
}

// BestSellerBadge viveva qui, riusata da HomeScreen.tsx e copiata a mano (con
// drift di colore) in TourDetailScreen.tsx — consolidata in Badge.tsx
// (audit brand 2026-08-17), tutti e tre i punti ora importano da lì.

function TourCard({ exp, onSelect }: { exp: Experience; onSelect: (exp: Experience) => void }) {
  const category = TOUR_CATEGORY[exp.id];
  // Solo il primo paragrafo come anteprima — la descrizione intera (spesso
  // più paragrafi) vive in TourDetailScreen, non ha senso ripeterla qui.
  const teaser = exp.description?.split('\n\n')[0];
  const durationLabel = exp.durationMinutes ? formatDuration(exp.durationMinutes) : null;
  const priceLabel = exp.price != null ? `From €${exp.price.toFixed(0)}` : exp.priceNote ?? null;
  return (
    <Card
      showMedia
      imageUrl={getExperienceImageUrl(exp)}
      mediaHeight={140}
      style={{ marginBottom: 'var(--space-4)' }}
      onClick={exp.bookingUrl ? () => onSelect(exp) : undefined}
    >
      {(exp.bestSeller || category) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
          {exp.bestSeller && <BestSellerBadge />}
          {category && <Badge variant="red">{category}</Badge>}
        </div>
      )}
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 var(--space-2)' }}>
        {exp.name}
      </div>
      {(durationLabel || priceLabel) && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 'var(--space-2)' }}>
          {durationLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--stone)' }}>
              <ClockIcon width={14} height={14} />
              {durationLabel}
            </div>
          )}
          {priceLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--stone)' }}>
              <TagIcon width={14} height={14} />
              {priceLabel}
            </div>
          )}
        </div>
      )}
      {teaser && (
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--stone)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-3)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {teaser}
        </div>
      )}
      {exp.bookingUrl ? (
        <Button variant="ghost" onClick={() => onSelect(exp)}>
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

// Esportata: HomeScreen.tsx la riusa per la sua stessa scorciatoia Gift
// Cards — non una vera Experience (nessuna tour dietro), stesso canale
// Bokun, solo un prodotto diverso. Vedi BookableItem in BookingWidgetModal.tsx.
export const GIFT_CARD_ITEM: BookableItem = {
  id: 'gift-card',
  name: 'Roman Guides Gift Card',
  bookingUrl: LINKS.GIFT_CARD_BOOKING_URL,
};

interface ExperiencesScreenProps {
  // Tab Home (2026-08-16): le tessere-categoria (Classic Tours/Experiences/
  // ...) devono arrivare davvero alla propria sezione, non solo aprire il tab
  // e lasciare che l'utente scorra per trovarla. `undefined`/mancante =
  // nessuno scroll, comportamento invariato per l'accesso normale dalla tab
  // bar.
  //
  // La scorciatoia "Meet the Guides" della Home passava anche da qui, con
  // target 'guides'. Dal 2026-09-01 le guide sono una tab e la Home ci va
  // direttamente con setActiveTab: nessuno scroll da orchestrare.
  scrollTarget?: TourType | null;
  onScrollTargetHandled?: () => void;
}

export function ExperiencesScreen({ scrollTarget, onScrollTargetHandled }: ExperiencesScreenProps = {}) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tourTypeSectionRefs = useRef<Partial<Record<TourType, HTMLDivElement | null>>>({});

  useEffect(() => {
    setExperiences(getExperiences());
    setTestimonials(getTestimonials());
  }, []);

  // Guarded on experiences.length > 0, not just scrollTarget: on first mount
  // experiences is still [] (populated by the effect above, which only takes
  // effect on the NEXT commit) — scrolling before that landed on whatever
  // short, still-empty layout existed at that instant, well short of the
  // target section's real position once the tours actually render (found via
  // real-device testing: it only scrolled "a little").
  //
  // Il gate guardava anche guides.length finché le guide erano una sezione di
  // questa tab. Dal 2026-09-01 sono una tab propria (features/guides/) e non
  // sono più un bersaglio di scroll: qui resta solo il salto ai tipi di tour.
  //
  // Still undershot on-device after that gate AND two nested
  // requestAnimationFrame calls (landing around "Classic Tours", the first
  // tour-type heading) — scrollIntoView's automatic nearest-scrollable-
  // ancestor walk is unreliable in this Android WebView on a nested
  // overflow:auto container (this app's own root is position:fixed with an
  // overflow:hidden tab wrapper around it, an ancestor chain scrollIntoView
  // implementations are known to mishandle). Measuring the offset directly
  // and setting scrollTop ourselves bypasses that resolution entirely.
  useEffect(() => {
    if (!scrollTarget || experiences.length === 0) return;
    const target = tourTypeSectionRefs.current[scrollTarget];
    if (!target) return;
    let raf2 = 0;
    // onScrollTargetHandled fires from INSIDE the second rAF, once the scroll
    // has actually been kicked off — not synchronously up front. Calling it
    // eagerly cleared scrollTarget in the parent (App.tsx) immediately, which
    // re-ran this effect for its new value and fired this SAME effect's
    // cleanup — cancelling both rAFs before either ever got a chance to run.
    // The scroll never happened at all; this looked identical to "it doesn't
    // scroll" from the outside, with no error to point at the real cause.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container && target) {
          const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
          container.scrollTo({ top: container.scrollTop + offset, behavior: 'smooth' });
        }
        onScrollTargetHandled?.();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTarget, experiences]);

  return (
    <>
    <div ref={containerRef} style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <BrandMark />
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

      {/* ---------- Repeat-booking discount ---------- */}
      {/* Restored from docs/parked-content.md — parked (not deleted) during
          the five-section Experiences restructure since it didn't fit that
          spec. Same copy/code/link as before, placed at the top of the tab
          as it was originally. */}
      <Card showMedia={false} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
          10% off your next experience
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
          Thank you for touring with Roman Guides. Enjoy 10% off your next experience when booking directly with us.
        </div>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Badge variant="black">CODE: {REPEAT_BOOKING_DISCOUNT_CODE}</Badge>
        </div>
        <Button variant="ghost" href={LINKS.TOURS} target="_blank" rel="noopener noreferrer">
          Book Your Next Experience →
        </Button>
      </Card>

      {/* ---------- Tours, grouped by type ---------- */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        {TOUR_TYPE_ORDER.map((type) => {
          const group = experiences.filter((exp) => exp.tourType === type);
          if (group.length === 0) return null;
          return (
            <div key={type} ref={(el) => { tourTypeSectionRefs.current[type] = el; }} style={{ marginBottom: 'var(--space-5)' }}>
              <TourTypeHeading>{TOUR_TYPE_LABELS[type]}</TourTypeHeading>
              {group.map((exp) => (
                <TourCard key={exp.id} exp={exp} onSelect={setSelectedTour} />
              ))}
            </div>
          );
        })}
      </div>

      {/* ---------- Gift card ---------- */}
      <Card showMedia={false} style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
          Give the gift of Rome
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
          A Roman Guides gift card — for a friend visiting Rome, or your own next trip back.
        </div>
        <Button variant="ghost" onClick={() => setBookingItem(GIFT_CARD_ITEM)}>
          Buy a Gift Card →
        </Button>
      </Card>


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
            href={LINKS.GOOGLE_REVIEW_URL}
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
    {selectedTour && selectedTour.bookingUrl && (
      <TourDetailScreen
        experience={selectedTour}
        onClose={() => setSelectedTour(null)}
        onCheckDates={() => setBookingItem({ id: selectedTour.id, name: selectedTour.name, bookingUrl: selectedTour.bookingUrl! })}
      />
    )}
    {bookingItem && (
      <BookingWidgetModal item={bookingItem} onClose={() => setBookingItem(null)} />
    )}
    </>
  );
}
