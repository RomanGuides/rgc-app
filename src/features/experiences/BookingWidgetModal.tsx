// Roman Guides Companion — BookingWidgetModal
// Checkout Bokun incorporato in-app (vedi docs/BokunIntegration.md, decisione
// 2026-08-05: Opzione 3 scelta al posto del checkout nativo REST v1+backend;
// corretta il 2026-08-05 dopo aver scoperto la causa reale del blocco su
// "Go to cart" — vedi nota tecnica sotto).
//
// STORIA DEL BUG "Go to cart" (verificato su device reale, non un'ipotesi):
// la prima versione di questo componente usava un <iframe src={bookingUrl}>
// nudo. Sfogliare l'esperienza e scegliere data/partecipanti funzionava
// (tutto contenuto dentro l'iframe), ma il bottone "Go to cart" non faceva
// letteralmente nulla — confermato passo per passo con Chrome DevTools da
// device reale: il tocco arrivava esattamente sul bottone giusto, un
// .click() diretto via JavaScript produceva comunque zero effetto (nessun
// cambio di DOM, nessuna richiesta di rete, nessun postMessage, nessun
// errore in console). La causa: l'embed "vero" di Bokun non è un iframe
// diretto. È uno script loader (BokunWidgetsLoader.js, parametrizzato con
// il bookingChannelUUID del canale) che a sua volta carica un bundle molto
// più grande (BokunWidgets.<hash>.js). Quel bundle installa un
// MutationObserver globale sul <body> che rileva da solo ogni elemento
// <div class="bokunWidget" data-src="..."> aggiunto al DOM e lo trasforma
// lui stesso nel widget interattivo (iframe interno, gestione carrello,
// ecc.). Il nostro iframe nudo saltava questo meccanismo: "Go to cart"
// probabilmente doveva aprire un carrello/lightbox gestito dal loro bundle,
// che senza il loro script non ha nulla con cui comunicare — da qui il
// blocco silenzioso. La correzione: caricare il loro script loader una
// sola volta per sessione app, poi limitarsi a montare/smontare il
// <div class="bokunWidget" data-src={bookingUrl}> — il loro stesso
// MutationObserver fa il resto, incluso il caso di riapertura per
// un'esperienza diversa (l'aggiunta di un nuovo div viene rilevata come
// qualunque altra mutazione del DOM).
//
// Il bundle marca l'elemento con l'attributo data-bokun-widget-loaded="true"
// non appena lo inizializza (verificato leggendo il loro codice sorgente
// pubblico) — è il segnale più affidabile che abbiamo per sapere che il
// widget ha preso in mano il proprio contenitore, quindi lo osserviamo
// insieme alla comparsa di un iframe reale al suo interno per capire quando
// mostrare lo stato "caricato" invece dello skeleton.
//
// Nessun backend, nessuna chiave API, nessuna gestione HMAC — resta comunque
// Bokun a gestire l'intero flusso di prenotazione e pagamento (zero PCI
// scope per noi). Il loro bundle crea il proprio iframe interno al div che
// gli affidiamo: l'intera app vive già dentro un'unica WebView Capacitor,
// quindi tutto questo è solo altro DOM nella stessa pagina.
//
// Il fix nativo Android (RomanGuidesWebChromeClient/RomanGuidesWebViewClient,
// scritti per il vecchio iframe nudo) resta comunque utile come rete di
// sicurezza: se il widget di Bokun (o una pagina di pagamento a cui
// reindirizza) prova ad aprire una nuova finestra — scenario reale per 3-D
// Secure/PayPal/Apple Pay, non solo teorico — quel codice intercetta l'URL
// e lo passa qui via l'evento romanguides:newwindow; questo componente lo
// mostra in un iframe di fallback a schermo intero, restando in-app invece
// di uscire al browser di sistema. Rischio noto, da verificare su device
// reale con una prenotazione vera: se la destinazione rifiuta di essere
// incorniciata (X-Frame-Options), quel fallback fallirà a sua volta, e
// "Open in browser" nello stato di errore resta la via d'uscita reale.

import { useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';
import { CloseIcon, LockIcon } from '../../design-system/components/Icons';
import { LINKS } from '../../config/links';

// Non tipizzato su Experience: questo modale sa incorporare QUALUNQUE
// prodotto Bokun sullo stesso canale (tour, ma anche una gift card, vedi
// ExperiencesScreen.tsx) — gli servono solo questi tre campi, mai gli altri
// (guideIds, imageUrl, ecc.) che appartengono solo al modello dati delle tour.
export interface BookableItem {
  id: string;
  name: string;
  bookingUrl: string;
}

interface BookingWidgetModalProps {
  item: BookableItem;
  onClose: () => void;
}

type Status = 'loading' | 'loaded' | 'error';

// Tempo massimo di attesa prima di considerare il widget "non caricato" e
// mostrare lo stato di errore — copre sia un caricamento lento sia un
// mancato aggancio del MutationObserver di Bokun (non dovrebbe succedere,
// ma non abbiamo modo di saperlo con certezza dall'esterno del loro bundle).
const LOAD_TIMEOUT_MS = 10000;

const LOADER_SCRIPT_SRC = 'https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js';

// Evento dispatchato da RomanGuidesWebChromeClient.java (Android) quando il
// contenuto incorporato tenta di aprire una nuova finestra — vedi la nota
// tecnica sopra. Non emesso su iOS/web: nessun listener nativo equivalente
// esiste ancora lì (vedi ROADMAP.md), quindi su quelle piattaforme un
// target="_blank"/window.open() dentro il widget resta silenziosamente
// senza effetto, non testato.
const NEW_WINDOW_EVENT = 'romanguides:newwindow';

function getHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Il canale di prenotazione è lo stesso per tutte le esperienze (un solo
// account Bokun) — lo ricaviamo dall'URL invece di duplicarlo come costante
// per non avere due fonti di verità che potrebbero disallinearsi.
function getBookingChannelUUID(bookingUrl: string): string | null {
  const match = bookingUrl.match(/\/online-sales\/([^/]+)\//);
  return match ? match[1] : null;
}

function ensureBokunLoaderScript(bookingChannelUUID: string) {
  const existing = document.querySelector(`script[src^="${LOADER_SCRIPT_SRC}"]`);
  if (existing) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `${LOADER_SCRIPT_SRC}?bookingChannelUUID=${bookingChannelUUID}`;
  document.body.appendChild(script);
}

export function BookingWidgetModal({ item, onClose }: BookingWidgetModalProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [displayHost, setDisplayHost] = useState<string | null>(getHostname(item.bookingUrl));
  // Solo per il fallback "nuova finestra" relayato dal nativo (vedi nota
  // tecnica sopra) — il widget principale di Bokun non passa da qui.
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const widgetHostRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearLoadTimeout() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function startLoading() {
    setStatus('loading');
    clearLoadTimeout();
    timeoutRef.current = setTimeout(() => setStatus('error'), LOAD_TIMEOUT_MS);
  }

  // Carica il loader di Bokun una sola volta per sessione app, poi monta il
  // div segnaposto per questa esperienza. Il MutationObserver del loro
  // bundle (non nostro) rileva il div da solo, sia al primo montaggio sia
  // ogni volta che l'utente riapre il modale per un'esperienza diversa.
  useEffect(() => {
    const bookingUrl = item.bookingUrl;
    const channelUUID = getBookingChannelUUID(bookingUrl);
    if (channelUUID) ensureBokunLoaderScript(channelUUID);

    setDisplayHost(getHostname(bookingUrl));
    setHasLoadedOnce(false);
    setFallbackSrc(null);
    startLoading();

    const host = widgetHostRef.current;
    if (!host) return clearLoadTimeout;

    // Osserviamo il contenitore che affidiamo a Bokun: il loro bundle ci
    // scrive dentro (tipicamente un iframe proprio) non appena lo
    // inizializza. Non abbiamo un evento "ready" ufficiale da loro, quindi
    // "è comparso un iframe qui dentro" è il segnale più concreto che
    // abbiamo per smettere di mostrare lo skeleton.
    const observer = new MutationObserver(() => {
      const innerFrame = host.querySelector('iframe');
      if (innerFrame) {
        clearLoadTimeout();
        setDisplayHost(getHostname(innerFrame.getAttribute('src')) ?? getHostname(bookingUrl));
        setHasLoadedOnce(true);
        setStatus('loaded');
      }
    });
    observer.observe(host, { childList: true, subtree: true, attributes: true });

    return () => {
      clearLoadTimeout();
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, attempt]);

  // Back hardware Android chiude il modale — non deve navigare la cronologia
  // interna del widget. Solo Android emette questo evento; su iOS/web il
  // listener non si attiva mai, innocuo.
  useEffect(() => {
    let handle: { remove: () => void } | undefined;
    App.addListener('backButton', onClose).then((h) => {
      handle = h;
    });
    return () => handle?.remove();
  }, [onClose]);

  // Vedi RomanGuidesWebChromeClient.java — relay di una richiesta di nuova
  // finestra dal WebView nativo (es. un popup di pagamento). Mostriamo un
  // iframe di fallback a schermo intero sopra al widget principale; qui
  // l'host è verificato (l'URL arriva da un canale nostro, non letto da un
  // iframe), quindi la riga di dominio può mostrarlo per davvero.
  useEffect(() => {
    function handleNewWindow(e: Event) {
      const url = (e as CustomEvent<string>).detail;
      if (typeof url !== 'string') return;
      setFallbackSrc(url);
      setDisplayHost(getHostname(url));
      startLoading();
    }
    window.addEventListener(NEW_WINDOW_EVENT, handleNewWindow);
    return () => window.removeEventListener(NEW_WINDOW_EVENT, handleNewWindow);
  }, []);

  function handleFallbackLoad() {
    clearLoadTimeout();
    setHasLoadedOnce(true);
    setStatus('loaded');
  }

  function handleFallbackError() {
    clearLoadTimeout();
    setStatus('error');
  }

  function handleRetry() {
    setAttempt((a) => a + 1);
  }

  function handleOpenInBrowser() {
    const url = fallbackSrc ?? item.bookingUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 9, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
          borderBottom: '1px solid rgba(26,22,20,.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, color: '#6E645F', fontSize: '0.75rem' }}>
            <LockIcon width={12} height={12} />
            <span>{displayHost ?? 'Secure payment page'}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ border: 'none', background: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex', padding: 4, flexShrink: 0 }}
        >
          <CloseIcon width={22} height={22} />
        </button>
      </div>

      {status === 'loading' && (
        <div style={{ height: 3, background: 'rgba(204,0,41,.15)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: '100%', background: '#CC0029', animation: 'bookingLoadingBar 1.2s ease-in-out infinite' }} />
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
        {status !== 'error' && !fallbackSrc && (
          <div
            key={`${item.id}-${attempt}`}
            ref={widgetHostRef}
            className="bokunWidget"
            data-src={item.bookingUrl}
            style={{ minHeight: '100%' }}
          />
        )}

        {status !== 'error' && fallbackSrc && (
          <iframe
            key={fallbackSrc}
            src={fallbackSrc}
            title={`Book ${item.name}`}
            allow="payment"
            onLoad={handleFallbackLoad}
            onError={handleFallbackError}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        )}

        {status === 'loading' && !hasLoadedOnce && (
          <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[220, 52, 44, 44, 150].map((h, i) => (
              <div
                key={i}
                style={{ height: h, borderRadius: 12, background: '#F3EFEB', animation: 'skeletonPulse 1.4s ease-in-out infinite' }}
              />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.0625rem', lineHeight: 1.55, color: '#443A33', marginBottom: 26 }}>
              The booking page could not load. Your connection dropped, or Bokun is briefly unavailable.
            </div>
            <button
              onClick={handleRetry}
              style={{
                height: 54,
                borderRadius: 16,
                background: '#CC0029',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: 20,
              }}
            >
              Try again
            </button>
            <button
              onClick={handleOpenInBrowser}
              style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', color: 'var(--red)', fontWeight: 600, fontSize: '1.0625rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}
            >
              Open in browser
            </button>
            <a
              href={LINKS.SUPPORT_CONTACT_URL}
              style={{ color: '#6E645F', fontWeight: 600, fontSize: '1.0625rem', textDecoration: 'none' }}
            >
              Contact us
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
