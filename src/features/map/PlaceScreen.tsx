// Roman Guides Companion — PlaceScreen (redesign v1, Fase 4)
// Sostituisce PlaceBottomSheet + PremiumPlaceCard + UtilityPlaceCard: non più
// un foglio modale sopra la mappa, ma una schermata a tutto schermo ("push"
// nello screen stack, con un solo bottone indietro) — così la descrive la
// spec ("This is the screen the product rests on").
//
// Un solo template per tutti i luoghi, non più diviso premium/utility: le
// sezioni editoriali (Why We Love It, Insider Tip, Local Secret, Did You
// Know, Nearby) semplicemente non compaiono se il dato manca — stesso
// principio già usato per i tour senza video in Experiences.
//
// Nota: la spec di questa schermata non menziona bottoni "Official Website"/
// "More Info"/"Book This Tour" (esistevano nelle vecchie card) — solo
// "Walk there" in fondo. Trattato come omissione intenzionale (la spec è
// molto dettagliata ed esplicita per questa schermata), non un dimenticato.

import { useEffect, useState } from 'react';
import type { Place, PlaceCategory } from '../../data/types';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getCategoryMeta } from '../../config/categories.config';
import { startWalkingDirections } from './startWalkingDirections';
import { ChevronLeftIcon, HeartIcon } from '../../design-system/components/Icons';
import restaurantPlaceholder from '../../assets/category/restaurant.jpg';
import pastaPlaceholder from '../../assets/category/pasta.jpg';
import pizzaPlaceholder from '../../assets/category/pizza.jpg';
import gelatoPlaceholder from '../../assets/category/gelato.jpg';
import rooftopBarPlaceholder from '../../assets/category/rooftop_bar.jpg';
import cocktailBarPlaceholder from '../../assets/category/cocktail_bar.jpg';

interface PlaceScreenProps {
  place: Place;
}

// Foto segnaposto per le categorie gastronomiche, una per categoria — usata
// solo quando il luogo non ha una imageUrl propria (o la sua fallisce a
// caricare). Import statico (non un percorso runtime): Vite garantisce che
// il file esista al momento della build, niente da precaricare o verificare
// per questo candidato. Le altre categorie (oggi solo `gallery`) restano su
// #F3EFEB piatto — una foto generica per un monumento sarebbe fuorviante.
const CATEGORY_PLACEHOLDER_IMAGES: Partial<Record<PlaceCategory, string>> = {
  restaurant: restaurantPlaceholder,
  pasta: pastaPlaceholder,
  pizza: pizzaPlaceholder,
  gelato: gelatoPlaceholder,
  rooftop_bar: rooftopBarPlaceholder,
  cocktail_bar: cocktailBarPlaceholder,
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.94rem', lineHeight: 1.3, color: '#1A1614' }}>{value}</div>
    </div>
  );
}

function EditorialBlock({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#443A33' }}>{text}</div>
    </div>
  );
}

export function PlaceScreen({ place: p }: PlaceScreenProps) {
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);
  const arrivalNotes = usePlacesStore((s) => s.arrivalNotes);
  const setArrivalNote = usePlacesStore((s) => s.setArrivalNote);

  const meta = getCategoryMeta(p.category);
  const isSaved = savedPlaceIds.includes(p.id);
  const [noteDraft, setNoteDraft] = useState(arrivalNotes[p.id] ?? '');

  // Catena di fallback per l'header: foto vera del luogo → foto segnaposto
  // di categoria (solo gastronomiche, import statico — sempre valido) →
  // #F3EFEB piatto. Mai meta.color: per pasta/restaurant è un rosso quasi
  // identico al rosso del brand, che a schermo intero legge come uno stato
  // di errore (bug corretto qui).
  //
  // Solo la imageUrl del luogo va verificata a runtime (è un URL esterno,
  // può fallire) — il segnaposto di categoria è garantito da Vite al build,
  // non serve precaricarlo. `background: url(...)` da solo non basta a
  // rilevare un fallimento — a differenza di un <img>, un CSS background
  // fallito non emette un evento leggibile — quindi la imageUrl viene
  // mostrata subito in modo ottimistico (nessun glyph di immagine rotta con
  // un CSS background, quindi nessun rischio) e sostituita solo se un
  // probe separato segnala l'errore.
  const [placeImageFailed, setPlaceImageFailed] = useState(false);
  useEffect(() => {
    setPlaceImageFailed(false);
    if (!p.imageUrl) return;
    const img = new Image();
    img.onerror = () => setPlaceImageFailed(true);
    img.src = p.imageUrl;
    return () => {
      img.onerror = null;
    };
  }, [p.imageUrl]);

  const resolvedImageUrl = p.imageUrl && !placeImageFailed ? p.imageUrl : (CATEGORY_PLACEHOLDER_IMAGES[p.category] ?? null);

  const whyWeLoveIt = p.whyWeLoveIt ?? p.content?.body;
  const insiderTip = p.insiderTip ?? p.content?.attribution;
  const facts = [
    p.openingHours ? { label: 'Open', value: p.openingHours } : null,
    p.entranceFee ? { label: 'Entry', value: p.entranceFee } : null,
    p.visitDuration ? { label: 'Allow', value: p.visitDuration } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', zIndex: 7, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            position: 'relative',
            height: 272,
            background: resolvedImageUrl
              ? `linear-gradient(rgba(16,12,10,.42) 0%, rgba(16,12,10,.06) 45%, rgba(16,12,10,.40) 100%), url(${resolvedImageUrl}) center/cover`
              : '#F3EFEB',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => selectPlace(null)}
            aria-label="Back"
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
              left: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(16,12,10,.42)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <button
            onClick={() => toggleSaved(p.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save'}
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
              right: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(16,12,10,.42)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              color: isSaved ? '#FF0033' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <HeartIcon width={20} height={20} filled={isSaved} />
          </button>
        </div>

        <div style={{ padding: '26px 28px 24px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: '#6E645F', marginBottom: 6 }}>
            {meta.label}
            {p.area ? ` · ${p.area}` : ''}
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.14, letterSpacing: '-0.01em', color: '#1A1614', marginBottom: 18 }}>
            {p.name}
          </div>

          {facts.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 14,
                borderTop: '1px solid rgba(26,22,20,.09)',
                borderBottom: '1px solid rgba(26,22,20,.09)',
                padding: '14px 0 16px',
                marginBottom: 18,
              }}
            >
              {facts.map((f) => (
                <Fact key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          )}

          {whyWeLoveIt && <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#443A33', marginBottom: 18 }}>{whyWeLoveIt}</div>}

          {insiderTip && (
            <div style={{ background: '#F3EFEB', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 6 }}>
                Insider tip
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1A1614' }}>{insiderTip}</div>
            </div>
          )}

          <EditorialBlock label="Local secret" text={p.localSecret} />
          <EditorialBlock label="Did you know" text={p.didYouKnow} />
          <EditorialBlock label="Nearby" text={p.nearbyRecommendations} />

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 6 }}>
              Arrival note
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => setArrivalNote(p.id, noteDraft)}
              placeholder="Ring the left bell, closed Mondays…"
              rows={2}
              style={{
                width: '100%',
                border: '1px solid rgba(26,22,20,.12)',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: '#1A1614',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: '#FAF8F6', padding: '16px 20px max(16px, env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={() => startWalkingDirections(p)}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            background: '#CC0029',
            color: '#fff',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Walk there
        </button>
      </div>
    </div>
  );
}
