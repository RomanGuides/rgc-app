// Roman Guides Companion — PremiumPlaceCard
// Popup per luoghi "premium": hero image, titolo, descrizione, Roman
// Guides Tip, durata visita. Ora espandibile ("Leggi tutto") per mostrare
// l'articolo completo (orari, costo, Why We Love It, Local Secret, Did You
// Know, Nearby Recommendations) — tutto dentro l'app, mai un sito esterno
// per il contenuto editoriale. "More Info" porta al sito ufficiale del
// monumento stesso (non più al nostro articolo, che ora vive qui).

import { useState } from 'react';
import type { Place } from '../../data/types';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { getCategoryMeta } from '../../config/categories.config';
import { distMeters, formatDistance } from '../../utils/distance';
import { startWalkingDirections } from './startWalkingDirections';
import type { UserLocation } from '../../store/usePlacesStore';

interface PremiumPlaceCardProps {
  place: Place;
  userLocation: UserLocation | null;
  isSaved: boolean;
  onToggleSaved: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: '0.8rem', marginBottom: 6 }}>
      <span style={{ flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--stone)' }}>{value}</span>
    </div>
  );
}

function ArticleSection({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--red)', marginBottom: 3, letterSpacing: '.02em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export function PremiumPlaceCard({ place: p, userLocation, isSaved, onToggleSaved }: PremiumPlaceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(p.category);
  const tip = p.insiderTip || p.content?.attribution;
  const description = p.content?.body;
  const hasFullArticle = !!(p.whyWeLoveIt || p.localSecret || p.didYouKnow || p.nearbyRecommendations || p.openingHours);
  const moreInfoUrl = p.officialSite || p.detailUrl || p.googleMapsUrl;

  return (
    <>
      {p.imageUrl && (
        <div style={{ width: '100%', height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <Badge variant="red">
        {meta.emoji} {meta.label}
      </Badge>
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', fontWeight: 700, margin: 'var(--space-2) 0 2px' }}>{p.name}</div>
      {p.area && <div style={{ fontSize: '0.72rem', color: 'var(--stone)', marginBottom: 'var(--space-2)' }}>{p.area}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', fontSize: '0.76rem', flexWrap: 'wrap' }}>
        {p.rating && (
          <span>
            <span style={{ color: '#e8a93b' }}>★ {p.rating}</span>{' '}
            <span style={{ color: 'var(--stone)' }}>({p.ratingCount?.toLocaleString() || '—'})</span>
          </span>
        )}
        {p.visitDuration && <Badge variant="neutral">⏱ {p.visitDuration}</Badge>}
        {userLocation && <Badge variant="neutral">{formatDistance(distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng))} away</Badge>}
      </div>

      {description && <div style={{ fontSize: '0.84rem', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>{description}</div>}

      {tip && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--red)', marginBottom: 3, letterSpacing: '.02em' }}>ROMAN GUIDES TIP</div>
          <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{tip}</div>
        </div>
      )}

      {expanded && hasFullArticle && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          {(p.openingHours || p.entranceFee) && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              {p.openingHours && <DetailRow label="🕐" value={p.openingHours} />}
              {p.entranceFee && <DetailRow label="💶" value={p.entranceFee} />}
            </div>
          )}
          <ArticleSection label="Why We Love It" text={p.whyWeLoveIt} />
          <ArticleSection label="Local Secret" text={p.localSecret} />
          <ArticleSection label="Did You Know?" text={p.didYouKnow} />
          <ArticleSection label="Nearby Recommendations" text={p.nearbyRecommendations} />
        </div>
      )}

      {hasFullArticle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--red)',
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: 0,
            marginBottom: 'var(--space-4)',
            cursor: 'pointer',
          }}
        >
          {expanded ? '← Show less' : 'Read more →'}
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Button variant={isSaved ? 'primary' : 'ghost'} onClick={onToggleSaved} fullWidth>
          {isSaved ? '❤️ Saved to My Rome' : '🤍 Save to My Rome'}
        </Button>
        <Button variant="ghost" onClick={() => startWalkingDirections(p)} fullWidth>
          🧭 Get Directions
        </Button>
        {moreInfoUrl && (
          <Button variant="ghost" href={moreInfoUrl} target="_blank" rel="noopener noreferrer" fullWidth>
            {p.officialSite ? 'Official Website →' : p.detailUrl ? 'More Info →' : '📍 Open in Google Maps'}
          </Button>
        )}
        {p.bookingUrl && (
          <Button variant="primary" href={p.bookingUrl} target="_blank" rel="noopener noreferrer" fullWidth>
            🎟 Book This Tour
          </Button>
        )}
      </div>
    </>
  );
}
