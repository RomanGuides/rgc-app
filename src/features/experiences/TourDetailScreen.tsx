// Roman Guides Companion — TourDetailScreen
// Prima di questo, "Discover Experience" mandava dritti al checkout Bokun —
// funzionava, ma saltava il momento in cui si decide se prenotare, senza
// sapere durata, prezzo esatto, cosa è incluso, punto d'incontro o
// restrizioni d'età. Specificata da tempo, mai costruita perché i dati
// reali non esistevano ancora (solo tre tour su sette avevano una
// descrizione, nessuna aveva durata/prezzo/inclusioni strutturati).
// Sbloccata il 2026-08-16 con dati reali confermati dal founder su Bokun.
//
// Redesign v2 (2026-08-16): dalla versione a solo testo (funzionante ma
// giudicata poco "scannerizzabile" dal founder su device reale) verso lo
// stile icon-driven di un mockup di riferimento — riga fatti con icone,
// box "Who is it for?", griglia a spunta per gli inclusi, sezione "Good to
// know" per le restrizioni reali (accessibilità/documento/avvisi salute,
// da product-facts.md). Le vecchie "Highlights" a paragrafo lungo restano
// rimosse: la griglia inclusi copre lo stesso bisogno senza inventare nuovo
// copy marketing che i dati sorgente non hanno mai avuto.
//
// "Check dates", non "Book now": la schermata dopo (il checkout Bokun) è un
// calendario/carrello, non una prenotazione immediata — un bottone deve
// promettere quello che succede davvero.
//
// Stesso pattern di header-foto di PlaceScreen.tsx (272px, sfumatura,
// bottone indietro cerchio 40px semi-trasparente) — coerenza visiva tra le
// due "schede scheda intera" dell'app. Ogni riga di fatti e ogni sezione
// collassa se il dato manca — mai un campo vuoto o "N/A".

import type { ReactElement, SVGProps } from 'react';
import {
  ChevronLeftIcon,
  ClockIcon,
  TagIcon,
  PersonIcon,
  CheckCircleIcon,
  WheelchairIcon,
  IdCardIcon,
  AlertCircleIcon,
  CalendarIcon,
} from '../../design-system/components/Icons';
import { BestSellerBadge } from '../../design-system/components/Badge';
import type { Experience } from '../../data/types';
import { formatDuration } from '../../utils/formatDuration';
import { getExperienceImageUrl } from '../../services/experiencesService';

interface TourDetailScreenProps {
  experience: Experience;
  onClose: () => void;
  onCheckDates: () => void;
}

const LABEL_STYLE = {
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--stone)',
};

// Le sezioni sotto (BulletList/InclusionsGrid/GoodToKnow/meeting point)
// condividevano lo stesso wrapper a una proprietà, ripetuto a mano 4 volte
// (audit token Fase 5).
const SECTION_MARGIN = { marginBottom: 22 };

// Testo a corpo condiviso da "Who is it for?"/meeting point/cancellation
// policy — stesso identico oggetto copiato 3 volte (audit token Fase 5).
const BODY_TEXT_STYLE = { fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--ink)' };

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

function Fact({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Icon width={18} height={18} style={{ color: 'var(--stone)' }} />
      <div style={{ ...LABEL_STYLE, marginBottom: 0 }}>{label}</div>
      <div style={{ fontSize: '0.94rem', lineHeight: 1.3, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function BulletList({ label, items }: { label: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={SECTION_MARGIN}>
      <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>{label}</div>
      <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.6 }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function InclusionsGrid({ items }: { items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={SECTION_MARGIN}>
      <div style={{ ...LABEL_STYLE, marginBottom: 10 }}>What's included</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CheckCircleIcon width={16} height={16} style={{ flexShrink: 0, color: 'var(--red)', marginTop: 2 }} />
            <span style={{ fontSize: '0.875rem', lineHeight: 1.4, color: 'var(--ink)' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GoodToKnowItem {
  icon: IconComponent;
  text: string;
}

function GoodToKnow({ items }: { items: GoodToKnowItem[] }) {
  if (items.length === 0) return null;
  return (
    <div style={SECTION_MARGIN}>
      <div style={{ ...LABEL_STYLE, marginBottom: 10 }}>Good to know</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <item.icon width={18} height={18} style={{ flexShrink: 0, color: 'var(--stone)', marginTop: 1 }} />
            <span style={{ fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--ink)' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TourDetailScreen({ experience: exp, onClose, onCheckDates }: TourDetailScreenProps) {
  const imageUrl = getExperienceImageUrl(exp);
  const facts = [
    exp.durationMinutes ? { icon: ClockIcon, label: 'Duration', value: formatDuration(exp.durationMinutes) } : null,
    exp.price != null
      ? { icon: TagIcon, label: 'Price', value: `From €${exp.price.toFixed(0)}` }
      : exp.priceNote
        ? { icon: TagIcon, label: 'Price', value: exp.priceNote }
        : null,
  ].filter((f): f is { icon: IconComponent; label: string; value: string } => f !== null);

  const descriptionParagraphs = exp.description ? exp.description.split('\n\n') : [];

  const goodToKnow: GoodToKnowItem[] = [
    exp.wheelchairAccessible === true ? { icon: WheelchairIcon, text: 'Wheelchair accessible' } : null,
    exp.wheelchairAccessible === false ? { icon: WheelchairIcon, text: 'Not wheelchair accessible' } : null,
    exp.idRequired ? { icon: IdCardIcon, text: 'A valid photo ID or passport is required at entry' } : null,
    ...(exp.healthAdvisories ?? []).map((text) => ({ icon: AlertCircleIcon, text })),
  ].filter((g): g is GoodToKnowItem => g !== null);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', zIndex: 8, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            position: 'relative',
            height: 272,
            background: imageUrl
              ? `linear-gradient(rgba(16,12,10,.42) 0%, rgba(16,12,10,.06) 45%, rgba(16,12,10,.40) 100%), url(${imageUrl}) center/cover`
              : 'var(--bg-app)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
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
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeftIcon width={20} height={20} />
          </button>
        </div>

        <div style={{ padding: '26px 28px calc(110px + env(safe-area-inset-bottom, 0px))' }}>
          {exp.bestSeller && (
            <div style={{ marginBottom: 12 }}>
              <BestSellerBadge />
            </div>
          )}

          <div style={{ fontFamily: 'var(--display)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.14, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: 18 }}>
            {exp.name}
          </div>

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
                <Fact key={f.label} icon={f.icon} label={f.label} value={f.value} />
              ))}
            </div>
          )}

          {exp.ageRequirement && (
            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                marginBottom: 22,
              }}
            >
              <PersonIcon width={20} height={20} style={{ flexShrink: 0, color: 'var(--stone)', marginTop: 2 }} />
              <div>
                <div style={{ ...LABEL_STYLE, marginBottom: 4 }}>Who is it for?</div>
                <div style={BODY_TEXT_STYLE}>{exp.ageRequirement}</div>
              </div>
            </div>
          )}

          {descriptionParagraphs.map((p, i) => (
            <p key={i} style={{ fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 14px' }}>
              {p}
            </p>
          ))}

          <InclusionsGrid items={exp.inclusions} />
          <BulletList label="Not included" items={exp.exclusions} />
          <GoodToKnow items={goodToKnow} />

          {exp.meetingPoint && (
            <div style={SECTION_MARGIN}>
              <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Meeting point</div>
              <div style={BODY_TEXT_STYLE}>{exp.meetingPoint}</div>
            </div>
          )}

          {exp.cancellationPolicy && (
            <div>
              <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Cancellation policy</div>
              <div style={BODY_TEXT_STYLE}>{exp.cancellationPolicy}</div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '14px 28px calc(16px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--line)',
          flexShrink: 0,
          background: 'var(--surface)',
        }}
      >
        <button
          onClick={onCheckDates}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 'var(--radius-md)',
            background: 'var(--red)',
            color: 'var(--white)',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <CalendarIcon width={20} height={20} />
          Check dates
        </button>
      </div>
    </div>
  );
}
