// Roman Guides Companion — LegalScreen
// Privacy policy, termini, versione app, contatto — raggiungibile da una
// riga nel footer di RomeSheet (detent "full"), non un tab. Richiesto per
// la pubblicazione sugli store: entrambi esigono una privacy policy
// raggiungibile dentro l'app, non solo nella scheda dello store.
//
// Testo scorrevole e basta — niente illustrazioni, niente card, 17px,
// gutter 24px coerente col resto dell'app. È una schermata che quasi
// nessuno guarda e che deve solo esistere ed essere accurata.

import { ChevronLeftIcon } from '../../design-system/components/Icons';
import { LINKS } from '../../config/links';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, type LegalSection } from '../../config/legal';
import pkg from '../../../package.json';

interface LegalScreenProps {
  onClose: () => void;
}

// Titolo di sezione (Privacy Policy/Terms of Service/Contact) e paragrafo di
// corpo — stessi oggetti ripetuti più volte in questo file, solo il margine
// cambia (audit token Fase 5). I 5 letterali 'Vollkorn, serif' qui erano un
// bug reale: questo testo non ha mai reso nel font del brand, né il vecchio
// né il nuovo, dal cambio token della Fase 2.
const SECTION_HEADING_STYLE = { fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' } as const;
const PARAGRAPH_STYLE = { fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--ink)' } as const;

function Section({ section }: { section: LegalSection }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
        {section.title}
      </div>
      {section.paragraphs.map((p, i) => (
        <p key={i} style={{ ...PARAGRAPH_STYLE, margin: i === 0 ? 0 : '10px 0 0' }}>
          {p}
        </p>
      ))}
    </div>
  );
}

export function LegalScreen({ onClose }: LegalScreenProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', zIndex: 8, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 24px 14px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          style={{ border: 'none', background: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex', padding: 4, marginLeft: -4 }}
        >
          <ChevronLeftIcon width={22} height={22} />
        </button>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>Legal &amp; About</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px calc(40px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--stone)', marginBottom: 28 }}>Roman Guides Companion — version {pkg.version}</div>

        <div style={{ ...SECTION_HEADING_STYLE, marginBottom: 16 }}>Privacy Policy</div>
        {PRIVACY_POLICY.map((section) => (
          <Section key={section.title} section={section} />
        ))}

        <div style={{ ...SECTION_HEADING_STYLE, margin: '12px 0 16px' }}>Terms of Service</div>
        {TERMS_OF_SERVICE.map((section) => (
          <Section key={section.title} section={section} />
        ))}

        <div style={{ ...SECTION_HEADING_STYLE, marginBottom: 10 }}>Contact</div>
        <p style={{ ...PARAGRAPH_STYLE, margin: 0 }}>
          Questions about this policy or these terms:{' '}
          <a href={LINKS.SUPPORT_CONTACT_URL} style={{ color: 'var(--red-dk)', fontWeight: 600 }}>
            {LINKS.SUPPORT_CONTACT_URL.replace('mailto:', '')}
          </a>
        </p>
      </div>
    </div>
  );
}
