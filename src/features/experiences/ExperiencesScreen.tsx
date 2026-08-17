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

import { useEffect, useRef, useState } from 'react';
import type { Experience, Guide, TourType, Testimonial } from '../../data/types';
import { getExperiences } from '../../services/experiencesService';
import { getGuides } from '../../services/guidesService';
import { getTestimonials } from '../../services/testimonialsService';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { OUR_STORY_MASTHEAD, OUR_STORY_PARAGRAPHS } from '../../config/story';
import { LINKS } from '../../config/links';
import { BookingWidgetModal, type BookableItem } from './BookingWidgetModal';
import { GuideDetailScreen } from './GuideDetailScreen';
import { TourDetailScreen } from './TourDetailScreen';
import { ClockIcon, TagIcon, StarIcon } from '../../design-system/components/Icons';
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
};
export const TOUR_TYPE_ORDER: TourType[] = ['classic-tour', 'experience', 'food-tour', 'cooking-class'];

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

export function GuidePhoto({ avatar, name, size = 52 }: { avatar: string; name: string; size?: number }) {
  const isRealUrl = avatar.startsWith('http');
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: isRealUrl ? `url(${avatar}) center/cover` : 'linear-gradient(160deg, var(--red), var(--red-dk))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {!isRealUrl && name.charAt(0)}
    </div>
  );
}

// Esportata: riusata anche da HomeScreen.tsx per il carosello Top Experiences
// — stessa pillola "Best Seller" usata in TourDetailScreen, riflette una
// scelta manuale del founder (bestSeller in experiences.json), non dati di
// vendita reali che l'app non ha.
export function BestSellerBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color: 'var(--ink)',
        background: 'rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px 4px 8px',
      }}
    >
      <StarIcon width={10} height={10} />
      Best Seller
    </div>
  );
}

function TourCard({ exp, onSelect }: { exp: Experience; onSelect: (exp: Experience) => void }) {
  const category = TOUR_CATEGORY[exp.id];
  // Solo il primo paragrafo come anteprima — la descrizione intera (spesso
  // più paragrafi) vive in TourDetailScreen, non ha senso ripeterla qui.
  const teaser = exp.description?.split('\n\n')[0];
  const durationLabel = exp.durationMinutes ? formatDuration(exp.durationMinutes) : null;
  const priceLabel = exp.price != null ? `From €${exp.price.toFixed(0)}` : exp.priceNote ?? null;
  return (
    <Card showMedia imageUrl={exp.imageUrl} mediaHeight={140} style={{ marginBottom: 'var(--space-4)' }}>
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
  // Tab Home (2026-08-16): sia "Meet the Guides" che le tessere-categoria
  // (Classic Tours/Experiences/...) devono arrivare davvero alla propria
  // sezione, non solo aprire il tab e lasciare che l'utente scorra per
  // trovarla. `undefined`/mancante = nessuno scroll, comportamento invariato
  // per l'accesso normale dalla tab bar.
  scrollTarget?: TourType | 'guides' | null;
  onScrollTargetHandled?: () => void;
}

export function ExperiencesScreen({ scrollTarget, onScrollTargetHandled }: ExperiencesScreenProps = {}) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const guidesSectionRef = useRef<HTMLDivElement>(null);
  const tourTypeSectionRefs = useRef<Partial<Record<TourType, HTMLDivElement | null>>>({});

  useEffect(() => {
    setExperiences(getExperiences());
    setGuides(getGuides());
    setTestimonials(getTestimonials());
  }, []);

  // Guarded on guides.length > 0, not just scrollTarget: on first mount,
  // experiences/guides are still [] (populated by the effect above, which
  // only takes effect on the NEXT commit) — scrolling before that landed on
  // whatever short, still-empty layout existed at that instant, well short
  // of the guides section's real position once tours/guides actually
  // render (found via real-device testing: it only scrolled "a little").
  //
  // Still undershot on-device after the guides.length>0 gate AND two nested
  // requestAnimationFrame calls (landing around "Classic Tours", the first
  // tour-type heading) — scrollIntoView's automatic nearest-scrollable-
  // ancestor walk is unreliable in this Android WebView on a nested
  // overflow:auto container (this app's own root is position:fixed with an
  // overflow:hidden tab wrapper around it, an ancestor chain scrollIntoView
  // implementations are known to mishandle). Measuring the offset directly
  // and setting scrollTop ourselves bypasses that resolution entirely.
  useEffect(() => {
    if (!scrollTarget || experiences.length === 0 || guides.length === 0) return;
    const target = scrollTarget === 'guides' ? guidesSectionRef.current : tourTypeSectionRefs.current[scrollTarget];
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
  }, [scrollTarget, experiences, guides]);

  return (
    <>
    <div ref={containerRef} style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
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

      {/* ---------- Meet the Guides ---------- */}
      <div ref={guidesSectionRef}>
        <SectionHeader eyebrow="Your local experts" title="Meet the Guides" />
      </div>
      <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        {guides.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGuide(g)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              width: '100%',
              marginBottom: 'var(--space-4)',
              border: 'none',
              background: 'none',
              padding: 0,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <GuidePhoto avatar={g.avatar} name={g.name} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>{g.name}</div>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--stone)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {g.bio}
              </div>
            </div>
          </button>
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
    {selectedGuide && (
      <GuideDetailScreen guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
    )}
    </>
  );
}
