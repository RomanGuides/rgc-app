// Roman Guides Companion — Link esterni centralizzati
// Nessun URL scritto direttamente nei componenti — tutto qui, un solo posto
// da aggiornare quando cambia un indirizzo.

export const LINKS = {
  INSTAGRAM: 'https://www.instagram.com/romanguides/',
  FACEBOOK: 'https://www.facebook.com/romanguides',
  TIKTOK: 'https://www.tiktok.com/@romanguides',
  YOUTUBE: 'https://www.youtube.com/@RomanGuides13',
  TOURS: 'https://romanguides.com/our-tours/',
  // Video di presentazione del team — costante facile da aggiornare quando
  // sarà pronto il link definitivo (YouTube o Instagram).
  TEAM_VIDEO_URL: 'https://www.instagram.com/romanguides/',
  // Indirizzo di supporto reale, confermato dal founder (2026-08-06). Usato
  // dalla terza azione ("Contact us") dello stato di errore di
  // BookingWidgetModal, e dalla schermata Legale/About.
  SUPPORT_CONTACT_URL: 'mailto:info@romanguides.com',
  // Widget Bokun "Gift Card" (stesso meccanismo embed delle tour — vedi
  // BookingWidgetModal.tsx — solo un prodotto diverso sullo stesso canale).
  GIFT_CARD_BOOKING_URL: 'https://widgets.bokun.io/online-sales/e84e743d-24a5-432e-bd4e-5dff09c6fb34/gift-card/4806',
  // Prima viveva solo come stringa inline in ExperiencesScreen.tsx — centralizzato
  // qui (tab Home, 2026-08-16) perché ora lo stesso link serve in due schermate.
  GOOGLE_REVIEW_URL: 'https://g.page/r/CeVG3u7HbgowEBM/review',
  // Pagina TripAdvisor dell'attività (non un link di recensione per singola
  // tour come i reviewUrl in experiences.json) — confermato dal founder, 2026-08-16.
  TRIPADVISOR_REVIEW_URL: 'https://www.tripadvisor.it/Attraction_Review-g187791-d33021458-Reviews-Roman_Guides-Rome_Lazio.html',
} as const;
