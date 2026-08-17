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
// Nota: la spec originale di questa schermata non menzionava bottoni
// "Official Website"/"More Info"/"Book This Tour" (esistevano nelle vecchie
// card) — solo "Walk there" in fondo, trattato come omissione intenzionale.
//
// Rivisto nell'audit UX del 2026-08-16: Place.bookingUrl esiste nel modello
// dati proprio per "i pochi luoghi con un vero tour Roman Guides collegato"
// ma non veniva mai letto qui — un solo luogo lo popola (Colosseo, stesso
// prodotto Bokun del tour Colosseum Underground), lasciando quel percorso di
// prenotazione morto nonostante il dato esistesse già. "Book this tour" ora
// compare SOLO quando bookingUrl è presente (riusa BookingWidgetModal, stesso
// meccanismo di ExperiencesScreen — nessuna seconda implementazione), primario
// sopra "Walk there" che diventa secondario in quel caso; per tutti gli altri
// luoghi (senza bookingUrl) il comportamento resta identico a prima.

import { useEffect, useState } from 'react';
import type { Place, PlaceCategory } from '../../data/types';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getCategoryMeta } from '../../config/categories.config';
import { startWalkingDirections } from './startWalkingDirections';
import { ChevronLeftIcon, HeartIcon, StarIcon } from '../../design-system/components/Icons';
import { BookingWidgetModal, type BookableItem } from '../experiences/BookingWidgetModal';
import restaurantPlaceholder from '../../assets/category/restaurant.jpg';
import pastaPlaceholder from '../../assets/category/pasta.jpg';
import pizzaPlaceholder from '../../assets/category/pizza.jpg';
import gelatoPlaceholder from '../../assets/category/gelato.jpg';
import rooftopBarPlaceholder from '../../assets/category/rooftop_bar.jpg';
import cocktailBarPlaceholder from '../../assets/category/cocktail_bar.jpg';

interface PlaceScreenProps {
  place: Place;
  // Vero durante l'animazione di chiusura — vedi MapScreen.tsx: lo store
  // azzera selectedPlace (dal bottone indietro QUI, ma anche da
  // startWalkingDirections.ts quando un percorso parte con successo) prima
  // che l'uscita possa animarsi, quindi MapScreen tiene questo componente
  // montato per altri PLACE_SCREEN_TRANSITION_MS passando closing=true,
  // invece di smontarlo di scatto.
  closing?: boolean;
}

// Condivisa con MapScreen.tsx (che smonta questo componente dopo lo stesso
// intervallo) — un'unica fonte di verità così le due durate non divergono
// mai, cosa che lascerebbe un fotogramma statico o tagliato a metà.
export const PLACE_SCREEN_TRANSITION_MS = 200;

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
      <div style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.94rem', lineHeight: 1.3, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

// Stile condiviso dei due pulsanti circolari sopra la foto (indietro/salva) —
// identici salvo lato e colore, prima due oggetti di stile copiati a mano
// (audit token Fase 5).
function circleIconButtonStyle(side: 'left' | 'right', color: string) {
  return {
    position: 'absolute' as const,
    top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
    [side]: 16,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(16,12,10,.42)',
    backdropFilter: 'blur(8px)',
    border: 'none',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };
}

// Stile condiviso dei due CTA in fondo (Book this tour/Walk there) — prima
// tre oggetti quasi identici copiati a mano (audit token Fase 5).
const CTA_BUTTON_BASE = {
  width: '100%',
  height: 54,
  borderRadius: 'var(--radius-md)',
  fontSize: '1.05rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
} as const;

function primaryCtaStyle() {
  return { ...CTA_BUTTON_BASE, background: 'var(--red)', color: 'var(--white)', border: 'none' };
}

function secondaryCtaStyle() {
  return { ...CTA_BUTTON_BASE, background: 'transparent', color: 'var(--red)', border: '1.5px solid var(--red)' };
}

// Bordo sinistro sottile (audit UX 2026-08-16): Local secret/Did you know/
// Nearby condividevano lo stesso trattamento tipografico senza alcuna
// separazione visiva, così quando più di uno era presente si fondevano in
// un unico blocco di testo. Un accento discreto, non un box pieno come
// "Insider tip" — resta un dettaglio di testo, non diventa una card.
function EditorialBlock({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: 18, paddingLeft: 'var(--space-3)', borderLeft: '2px solid var(--line)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--ink)' }}>{text}</div>
    </div>
  );
}

export function PlaceScreen({ place: p, closing }: PlaceScreenProps) {
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);
  const arrivalNotes = usePlacesStore((s) => s.arrivalNotes);
  const setArrivalNote = usePlacesStore((s) => s.setArrivalNote);

  const meta = getCategoryMeta(p.category);
  const isSaved = savedPlaceIds.includes(p.id);
  const [noteDraft, setNoteDraft] = useState(arrivalNotes[p.id] ?? '');
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);

  // Push-in dal bordo destro, non un fade/scale da modale (spec: "This is
  // the screen the product rests on", non un dialogo). Lo stato iniziale e
  // quello finale non possono coincidere nello stesso render — il browser
  // deve dipingere `translateX(100%)` almeno una volta prima che passare a
  // `0%` produca una transizione invece di comparire già a posto.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const translateX = closing || !entered ? '100%' : '0%';

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
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--surface)',
        zIndex: 7,
        display: 'flex',
        flexDirection: 'column',
        transform: `translateX(${translateX})`,
        transition: `transform ${PLACE_SCREEN_TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        willChange: 'transform',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            position: 'relative',
            height: 272,
            background: resolvedImageUrl
              ? `linear-gradient(rgba(16,12,10,.42) 0%, rgba(16,12,10,.06) 45%, rgba(16,12,10,.40) 100%), url(${resolvedImageUrl}) center/cover`
              : 'var(--bg-app)',
            flexShrink: 0,
          }}
        >
          <button onClick={() => selectPlace(null)} aria-label="Back" style={circleIconButtonStyle('left', 'var(--white)')}>
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <button
            onClick={() => toggleSaved(p.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save'}
            style={circleIconButtonStyle('right', isSaved ? 'var(--red)' : 'var(--white)')}
          >
            <HeartIcon width={20} height={20} filled={isSaved} />
          </button>
        </div>

        <div style={{ padding: '26px 28px 24px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 6 }}>
            {meta.label}
            {p.area ? ` · ${p.area}` : ''}
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.14, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: p.rating != null ? 8 : 18 }}>
            {p.name}
          </div>

          {p.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18, fontSize: '0.92rem' }}>
              <StarIcon width={14} height={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{p.rating.toFixed(1)}</span>
              {p.ratingCount != null && <span style={{ color: 'var(--stone)' }}>({p.ratingCount.toLocaleString()})</span>}
            </div>
          )}

          {facts.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 14,
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                padding: '14px 0 16px',
                marginBottom: 18,
              }}
            >
              {facts.map((f) => (
                <Fact key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          )}

          {whyWeLoveIt && <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 18 }}>{whyWeLoveIt}</div>}

          {insiderTip && (
            <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 6 }}>
                Insider tip
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--ink)' }}>{insiderTip}</div>
            </div>
          )}

          <EditorialBlock label="Local secret" text={p.localSecret} />
          <EditorialBlock label="Did you know" text={p.didYouKnow} />
          <EditorialBlock label="Nearby" text={p.nearbyRecommendations} />

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 6 }}>
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
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: 'var(--ink)',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-app)',
          padding: '16px 20px max(16px, env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: p.bookingUrl ? 10 : 0,
        }}
      >
        {p.bookingUrl && (
          <button onClick={() => setBookingItem({ id: p.id, name: p.name, bookingUrl: p.bookingUrl! })} style={primaryCtaStyle()}>
            Book this tour
          </button>
        )}
        <button onClick={() => startWalkingDirections(p)} style={p.bookingUrl ? secondaryCtaStyle() : primaryCtaStyle()}>
          Walk there
        </button>
      </div>

      {bookingItem && <BookingWidgetModal item={bookingItem} onClose={() => setBookingItem(null)} />}
    </div>
  );
}
