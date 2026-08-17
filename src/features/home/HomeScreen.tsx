// Roman Guides Companion — HomeScreen (tab "Home", added 2026-08-16)
//
// NOT the OTA-storefront moodboard this started from (notification bell,
// second search bar, carousel with dot pagination, fabricated tour names/
// categories) — that version was reviewed and explicitly turned down. This
// is the scoped-down version the founder actually asked for: a "business
// card" first screen plus quick navigation shortcuts, built entirely from
// real, already-existing data and components:
// - Masthead reuses appContent.json's 'hero' entry (photo + trust stat),
//   previously shown only once ever, by WelcomeScreen.
// - "Top Experiences" pushes every real tour (Best Sellers first), reusing
//   TourDetailScreen — no second booking flow.
// - Category tiles reuse the same TourType taxonomy Experiences groups by
//   (see ExperiencesScreen.tsx) — Food Tours/Cooking Classes simply won't
//   appear until the founder's incoming 6 new tours populate them.
// - Navigation shortcuts (Map/Gift Cards/Guides) just switch tabs or open
//   the existing gift-card booking widget — no new screens.
// - Two review buttons (Google + TripAdvisor), same external-link pattern
//   already used elsewhere in Experiences.
// No notifications, no second search — deliberately out of scope.

import { useEffect, useState } from 'react';
import type { Experience, TourType } from '../../data/types';
import { getExperiences } from '../../services/experiencesService';
import { getAppContentSection } from '../../services/appContentService';
import { Card } from '../../design-system/components/Card';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import logoUrl from '../../assets/brand/roman-guides-logo.png';
import { LINKS } from '../../config/links';
import {
  ClockIcon,
  TagIcon,
  LocationPinIcon,
  GiftIcon,
  PersonIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
} from '../../design-system/components/Icons';
import { formatDuration } from '../../utils/formatDuration';
import { BestSellerBadge, TOUR_TYPE_LABELS, TOUR_TYPE_ORDER, GIFT_CARD_ITEM } from '../experiences/ExperiencesScreen';
import { BookingWidgetModal, type BookableItem } from '../experiences/BookingWidgetModal';
import { TourDetailScreen } from '../experiences/TourDetailScreen';
import type { TabKey } from '../../design-system/components/TabBar';

interface HomeScreenProps {
  onNavigate: (tab: TabKey) => void;
  // Separate from onNavigate: "Meet the Guides" and each category pill need
  // to land ON their own section in Experiences, not just switch to the tab
  // and leave the user to scroll past whatever renders above it (real
  // feedback from device testing).
  onNavigateToSection: (target: TourType | 'guides') => void;
}

function TopExperienceCard({ exp, onSelect }: { exp: Experience; onSelect: (exp: Experience) => void }) {
  const durationLabel = exp.durationMinutes ? formatDuration(exp.durationMinutes) : null;
  const priceLabel = exp.price != null ? `From €${exp.price.toFixed(0)}` : (exp.priceNote ?? null);
  return (
    <button
      onClick={() => onSelect(exp)}
      style={{
        flexShrink: 0,
        width: 200,
        textAlign: 'left',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        cursor: 'pointer',
        fontFamily: 'inherit',
        padding: 0,
      }}
    >
      <div
        style={{
          height: 110,
          background: exp.imageUrl ? `url(${exp.imageUrl}) center/cover` : 'linear-gradient(160deg, var(--red), var(--red-dk))',
        }}
      />
      <div style={{ padding: 'var(--space-3)' }}>
        {exp.bestSeller && (
          <div style={{ marginBottom: 6 }}>
            <BestSellerBadge />
          </div>
        )}
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: 4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {exp.name}
        </div>
        {(durationLabel || priceLabel) && (
          <div style={{ display: 'flex', gap: 10, fontSize: '0.74rem', color: 'var(--stone)' }}>
            {durationLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <ClockIcon width={12} height={12} />
                {durationLabel}
              </div>
            )}
            {priceLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <TagIcon width={12} height={12} />
                {priceLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function ShortcutTile({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 'var(--space-3) var(--space-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface)',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ color: 'var(--red)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }}>{label}</span>
    </button>
  );
}

function CategoryPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '10px 18px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        color: 'var(--ink)',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

const TRUST_POINTS = [
  { icon: PersonIcon, label: 'Local guides', caption: 'Passionate, certified and expert' },
  { icon: HeartIcon, label: 'Handpicked', caption: 'Only the places and tours we love' },
  { icon: ShieldCheckIcon, label: 'Trusted', caption: 'A real, licensed local agency' },
  { icon: StarIcon, label: 'Memorable', caption: 'Experiences that stay with you' },
];

export function HomeScreen({ onNavigate, onNavigateToSection }: HomeScreenProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);

  useEffect(() => {
    setExperiences(getExperiences());
  }, []);

  const hero = getAppContentSection('hero');

  // Best Seller in testa, non un ordine casuale — questa sezione esiste
  // apposta per spingere le tour, non per elencarle in ordine di catalogo.
  const topExperiences = [...experiences].sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));

  const availableTourTypes = TOUR_TYPE_ORDER.filter((type) => experiences.some((exp) => exp.tourType === type));

  return (
    <>
      <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
        {/* ---------- Hero masthead — riusa appContent.json's 'hero', prima visibile solo su WelcomeScreen ---------- */}
        <div
          style={{
            position: 'relative',
            height: 300,
            background: hero?.imageUrl
              ? `linear-gradient(rgba(16,12,10,.15) 0%, rgba(16,12,10,.75) 100%), url(${hero.imageUrl}) center/cover`
              : 'linear-gradient(160deg, var(--red), var(--red-dk))',
          }}
        >
          {/* Logo direttamente sulla foto, nessuno sfondo dietro — richiesto
              esplicitamente al posto della barra usata su Experiences/Saved. */}
          <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <img src={logoUrl} alt="Roman Guides" style={{ height: 96, width: 'auto' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 22px' }}>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.85)',
                marginBottom: 8,
              }}
            >
              Roman Guides
            </div>
            {hero?.title && (
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF', marginBottom: 6 }}>
                {hero.title}
              </div>
            )}
            {hero?.body && <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.88)' }}>{hero.body}</div>}
          </div>
        </div>

        <div style={{ padding: 'var(--space-5) var(--space-4)' }}>
          {/* ---------- Top Experiences ---------- */}
          <SectionHeader eyebrow="Don't miss" title="Top Experiences" />
          <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--space-6)' }}>
            {topExperiences.map((exp) => (
              <TopExperienceCard key={exp.id} exp={exp} onSelect={setSelectedTour} />
            ))}
          </div>

          {/* ---------- Tour categories ---------- */}
          {availableTourTypes.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 4 }}>
                {availableTourTypes.map((type) => (
                  <CategoryPill key={type} label={TOUR_TYPE_LABELS[type]} onClick={() => onNavigateToSection(type)} />
                ))}
              </div>
            </div>
          )}

          {/* ---------- Navigation shortcuts ---------- */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <ShortcutTile icon={<LocationPinIcon width={22} height={22} />} label="Browse the Map" onClick={() => onNavigate('rome')} />
            <ShortcutTile icon={<GiftIcon width={22} height={22} />} label="Gift Cards" onClick={() => setBookingItem(GIFT_CARD_ITEM)} />
            <ShortcutTile icon={<PersonIcon width={22} height={22} />} label="Meet the Guides" onClick={() => onNavigateToSection('guides')} />
          </div>

          {/* ---------- Why travel with us ---------- */}
          <Card showMedia={false} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
              Why travel with us?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {TRUST_POINTS.map((t) => (
                <div key={t.label}>
                  <t.icon width={22} height={22} style={{ color: 'var(--red)', marginBottom: 6 }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--stone)', lineHeight: 1.4 }}>{t.caption}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* ---------- Reviews ---------- */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <a
              href={LINKS.GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '12px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Review us on Google
            </a>
            <a
              href={LINKS.TRIPADVISOR_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '12px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Review us on TripAdvisor
            </a>
          </div>
        </div>
      </div>

      {selectedTour && selectedTour.bookingUrl && (
        <TourDetailScreen
          experience={selectedTour}
          onClose={() => setSelectedTour(null)}
          onCheckDates={() => setBookingItem({ id: selectedTour.id, name: selectedTour.name, bookingUrl: selectedTour.bookingUrl! })}
        />
      )}
      {bookingItem && <BookingWidgetModal item={bookingItem} onClose={() => setBookingItem(null)} />}
    </>
  );
}
