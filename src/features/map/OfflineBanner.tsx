// Roman Guides Companion — OfflineBanner
// Stato 04 (Empty and Error States addendum): i dati dei luoghi sono nel
// bundle, quindi l'app NON è rotta offline — solo l'immagine della mappa lo
// è. Nessun bottone "riprova" (non serve, sparisce da sola quando la
// connessione torna — vedi useOnlineStatus), mai un dialogo bloccante.

export function OfflineBanner() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
        left: 20,
        right: 20,
        zIndex: 6,
        background: '#1A1614',
        borderRadius: 16,
        padding: '15px 18px',
        fontSize: '0.9375rem',
        lineHeight: 1.45,
        color: '#FFFFFF',
      }}
    >
      No connection. The map will fill in when you are back online.
    </div>
  );
}
