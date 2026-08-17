// Roman Guides Companion — SearchScreen
// Nuova schermata (redesign v1, Fase 3) — non esisteva prima. Full-screen,
// non un modale. Filtro in tempo reale su nome + categoria + area, nessun
// invio/spinner. Sostituisce la funzione di navigazione della vecchia tab
// Explore (rimossa in Fase 2).

import { useState } from 'react';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getCategoryMeta } from '../../config/categories.config';
import { distMeters } from '../../utils/distance';
import { levenshteinDistance, normalizeForMatch } from '../../utils/levenshtein';
import { AVERAGE_WALKING_SPEED_MPS } from '../../config/routing.config';
import { SearchIcon, ChevronLeftIcon, StarIcon } from '../../design-system/components/Icons';
import type { Place } from '../../data/types';

interface SearchScreenProps {
  onClose: () => void;
}

function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / AVERAGE_WALKING_SPEED_MPS / 60));
}

// Distanza massima di edit (nome normalizzato) perché una categoria valga
// come suggerimento — oltre, la query non "assomiglia" a nessun nome reale.
const CATEGORY_PILL_MAX_DISTANCE = 5;

interface Pill {
  label: string;
  value: string; // sostituisce la query al tap
}

// Stato 01 (Empty and Error States addendum): tre pill, ordine fisso, mai
// duplicate, mai vuote — calcolate solo dal bundle, mai una chiamata di rete.
function buildSuggestionPills(
  query: string,
  allPlaces: Place[],
  userLocation: { lat: number; lng: number } | null,
  mapBounds: [number, number, number, number] | null
): Pill[] {
  const pills: Pill[] = [];
  const normalizedQuery = normalizeForMatch(query);

  // 1) Categoria del luogo il cui nome è lessicalmente più vicino alla query.
  let nearestNamePlace: Place | null = null;
  let bestDistance = Infinity;
  for (const p of allPlaces) {
    const d = levenshteinDistance(normalizedQuery, normalizeForMatch(p.name));
    if (d < bestDistance) {
      bestDistance = d;
      nearestNamePlace = p;
    }
  }
  if (nearestNamePlace && bestDistance <= CATEGORY_PILL_MAX_DISTANCE) {
    pills.push({ label: getCategoryMeta(nearestNamePlace.category).label, value: getCategoryMeta(nearestNamePlace.category).label });
  }

  // 2) Area corrente — del luogo più vicino alla posizione utente, oppure
  // (senza posizione) l'area con più luoghi visibili nel viewport della mappa.
  let currentArea: string | null = null;
  if (userLocation) {
    const nearest = [...allPlaces].sort(
      (a, b) =>
        distMeters(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        distMeters(userLocation.lat, userLocation.lng, b.lat, b.lng)
    )[0];
    currentArea = nearest?.area ?? null;
  } else if (mapBounds) {
    const [west, south, east, north] = mapBounds;
    const inView = allPlaces.filter((p) => p.lng >= west && p.lng <= east && p.lat >= south && p.lat <= north);
    const counts = new Map<string, number>();
    for (const p of inView) {
      if (!p.area) continue;
      counts.set(p.area, (counts.get(p.area) ?? 0) + 1);
    }
    let topArea: string | null = null;
    let topCount = 0;
    for (const [area, count] of counts) {
      if (count > topCount) {
        topCount = count;
        topArea = area;
      }
    }
    currentArea = topArea;
  }
  if (currentArea) {
    pills.push({ label: currentArea, value: currentArea });
  }

  // 3) Area del match del punto 1, solo se diversa da quella del punto 2 —
  // mai una pill duplicata.
  const nearestNameArea = nearestNamePlace?.area ?? null;
  if (nearestNameArea && bestDistance <= CATEGORY_PILL_MAX_DISTANCE && nearestNameArea !== currentArea) {
    pills.push({ label: `In ${nearestNameArea}`, value: nearestNameArea });
  }

  return pills;
}

export function SearchScreen({ onClose }: SearchScreenProps) {
  const places = usePlacesStore((s) => s.places);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const mapBounds = usePlacesStore((s) => s.mapBounds);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered: Place[] = q
    ? places.filter((p) => {
        const meta = getCategoryMeta(p.category);
        return (
          p.name.toLowerCase().includes(q) ||
          meta.label.toLowerCase().includes(q) ||
          (p.area ?? '').toLowerCase().includes(q)
        );
      })
    : places;

  const results = userLocation
    ? [...filtered].sort(
        (a, b) =>
          distMeters(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          distMeters(userLocation.lat, userLocation.lng, b.lat, b.lng)
      )
    : filtered;

  const suggestionPills = q && results.length === 0 ? buildSuggestionPills(q, places, userLocation, mapBounds) : [];

  function handleSelect(p: Place) {
    selectPlace(p);
    onClose();
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', zIndex: 8, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          style={{ border: 'none', background: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex', padding: 4 }}
        >
          <ChevronLeftIcon width={22} height={22} />
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 48,
            borderRadius: 14,
            background: 'var(--bg-app)',
            border: q ? '1.5px solid var(--red)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
          }}
        >
          <SearchIcon width={19} height={19} color="var(--stone)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, categories, areas…"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', color: 'var(--red)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--stone)', padding: '0 20px 8px' }}>
        {q ? `${results.length} result${results.length === 1 ? '' : 's'}` : userLocation ? 'Nearest to you' : 'All places'}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {results.length === 0 && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ fontSize: '1.0625rem', lineHeight: 1.55, color: 'var(--ink)' }}>
              Nothing in our list matches <strong style={{ color: 'var(--ink)' }}>{query}</strong>. We only carry the eighty-nine places our guides stand behind.
            </div>
            {suggestionPills.length > 0 && (
              <div style={{ marginTop: 26 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--stone)', paddingBottom: 12 }}>
                  Try instead
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {suggestionPills.map((pill) => (
                    <button
                      key={pill.label}
                      onClick={() => setQuery(pill.value)}
                      style={{
                        height: 38,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--bg-app)',
                        border: 'none',
                        fontSize: '0.94rem',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {results.map((p) => {
          const meta = getCategoryMeta(p.category);
          const minutes = userLocation ? walkingMinutes(distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng)) : null;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid var(--line)',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : meta.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                {!p.imageUrl && meta.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1.05rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--stone)' }}>
                  {p.rating != null && (
                    <>
                      <StarIcon width={11} height={11} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{p.rating.toFixed(1)}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>
                    {meta.label}
                    {p.area ? ` · ${p.area}` : ''}
                    {minutes !== null ? ` · ${minutes} min walk` : ''}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
