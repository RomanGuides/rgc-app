// Roman Guides Companion — BookingWidgetModal
// Checkout Bokun incorporato in-app (vedi docs/BokunIntegration.md, decisione
// 2026-08-05: Opzione 3 scelta al posto del checkout nativo REST v1+backend).
// Il widget Bokun — pensato da Bokun stesso per essere incorporato via
// iframe sui siti dei clienti — viene renderizzato dentro una vista
// dell'app: niente barra indirizzi, niente browser separato, nessun plugin
// Capacitor necessario (a differenza di @capacitor/browser, che apre sempre
// una sua toolbar). L'intera app vive già dentro un'unica WebView Capacitor,
// quindi un <iframe> è solo un elemento in più nella stessa pagina.
// Bokun resta l'unico responsabile di prenotazione e pagamento — zero PCI
// scope per noi.

import { ChevronLeftIcon } from '../../design-system/components/Icons';
import type { Experience } from '../../data/types';

interface BookingWidgetModalProps {
  experience: Experience;
  onClose: () => void;
}

export function BookingWidgetModal({ experience, onClose }: BookingWidgetModalProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 9, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
          borderBottom: '1px solid rgba(26,22,20,.08)',
          flexShrink: 0,
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
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {experience.name}
        </div>
      </div>
      {/* allow="payment" — senza, la Permissions Policy di default di alcuni
          browser/WebView blocca silenziosamente la Payment Request API
          (Apple Pay/Google Pay, e spesso Stripe.js) dentro un iframe cross-origin. */}
      <iframe
        key={experience.id}
        src={experience.bookingUrl ?? undefined}
        title={`Book ${experience.name}`}
        allow="payment"
        style={{ flex: 1, width: '100%', border: 'none' }}
      />
    </div>
  );
}
