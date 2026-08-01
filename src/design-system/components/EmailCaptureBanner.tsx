// Roman Guides Companion — EmailCaptureBanner
// Banner "Enjoy 10% off" nella Home: il codice sconto viene mostrato solo
// dopo aver lasciato l'email con consenso esplicito. Le email finiscono in
// un foglio Google dedicato tramite un piccolo Apps Script (nessun server
// nuovo da gestire — vedi apps-script-email-leads.gs).
//
// IMPORTANTE: il testo di consenso qui sotto è una bozza ragionevole, non
// una consulenza legale — se avete una pagina privacy policy reale, va
// linkata qui al posto del testo semplice.

import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { LINKS } from '../../config/links';

const STORAGE_KEY = 'rgc-email-submitted';
// Sostituire con l'URL "/exec" ottenuto dopo aver distribuito
// apps-script-email-leads.gs come App web (vedi istruzioni nel file stesso).
const LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxS5Or3GtDGPcYG3dy4AaMJjZidQOx1o3_lh5G2JanHVpK6G9ChSNbDvfglV1VlI0HE/exec';

export function EmailCaptureBanner() {
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  async function handleSubmit() {
    if (!firstName.trim() || !email.trim() || !consent) return;
    setStatus('sending');
    try {
      await fetch(LEADS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // Apps Script Web App non risponde con header CORS espliciti
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          consent: true,
          source: 'home_discount_banner',
        }),
      });
      localStorage.setItem(STORAGE_KEY, 'true');
      setSubmitted(true);
    } catch {
      setStatus('error');
    }
  }

  if (submitted) {
    return (
      <Card showMedia={false} style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>Enjoy 10% off</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--stone)', marginBottom: 'var(--space-3)' }}>your next tour, booked direct</div>
        <a
          href={LINKS.TOURS}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '.1em',
            background: 'var(--surface-2)',
            border: '1px dashed var(--red)',
            color: 'var(--red)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            marginBottom: 'var(--space-3)',
          }}
        >
          ROME10
        </a>
        <div>
          <Button href={LINKS.TOURS} target="_blank" rel="noopener noreferrer" variant="primary">
            Book Your Next Experience →
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card showMedia={false} style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, marginBottom: 2, textAlign: 'center' }}>
        Enjoy 10% off
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--stone)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
        Leave your email and we'll unlock your code — plus the occasional Rome tip and offer.
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          style={{
            flex: 1,
            boxSizing: 'border-box',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            fontSize: '0.85rem',
          }}
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name (optional)"
          style={{
            flex: 1,
            boxSizing: 'border-box',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            fontSize: '0.85rem',
          }}
        />
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-2)',
        }}
      />
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.7rem', color: 'var(--stone)', marginBottom: 'var(--space-3)', cursor: 'pointer' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
        <span>
          I agree to receive occasional offers and Rome tips from Roman Guides by email. I can unsubscribe at any time.
        </span>
      </label>
      <Button variant="primary" onClick={handleSubmit} fullWidth>
        {status === 'sending' ? 'Sending…' : 'Unlock My Code'}
      </Button>
      {status === 'error' && (
        <div style={{ fontSize: '0.72rem', color: 'var(--red)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
          Something went wrong — please try again.
        </div>
      )}
    </Card>
  );
}
