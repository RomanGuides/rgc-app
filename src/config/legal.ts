// Roman Guides Companion — Legal/About copy
//
// BOZZA, non testo legale definitivo. Scritta per riflettere accuratamente
// cosa fa davvero l'app oggi (nessun account, salvataggi solo locali,
// posizione mai inviata a un server nostro, OpenRouteService per gli
// indicazioni, Bokun per prenotazione/pagamento, nessuna analytics/tracking)
// — ma non sostituisce una revisione legale vera prima della pubblicazione
// sugli store. Vedi ROADMAP.md.

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: 'What we collect',
    paragraphs: [
      "Roman Guides Companion doesn't have accounts or sign-in — there's no profile of you on any server we run.",
      'If you allow location access, your device\'s GPS position is used only on your device, to sort places by distance and to draw walking directions. We never send it to a server we control, and we never store it.',
      'Places you save are stored only on your device (local app storage). Uninstalling the app, or clearing its data, deletes them — we never see this list.',
    ],
  },
  {
    title: 'Third-party services we use',
    paragraphs: [
      'Walking directions are calculated by OpenRouteService, a third-party routing service: your current position and chosen destination are sent to them to compute a route. See their own privacy policy for how they handle that.',
      "Booking a tour opens Bokun's own secure checkout inside the app. Bokun handles your booking and payment details entirely — we never see or store payment information. See Bokun's own privacy policy for how they handle your data during checkout.",
    ],
  },
  {
    title: 'What we don\'t do',
    paragraphs: [
      'No advertising, no ad tracking, no analytics, no cookies, no third-party trackers of any kind.',
      'No push notifications.',
    ],
  },
  {
    title: 'Children',
    paragraphs: ['This app is not directed at children and we do not knowingly collect information from children.'],
  },
  {
    title: 'Changes to this policy',
    paragraphs: ['If this policy changes, the update will ship with a new version of the app.'],
  },
];

export const TERMS_OF_SERVICE: LegalSection[] = [
  {
    title: 'Using this app',
    paragraphs: [
      'Roman Guides Companion is a free companion app: place recommendations, walking directions, and a way to book Roman Guides tours. Using it means you accept these terms.',
      "We curate every place in this app ourselves, but places change — opening hours, prices, and availability can be out of date. We do our best to keep things accurate, but we can't guarantee it.",
    ],
  },
  {
    title: 'Bookings and payment',
    paragraphs: [
      "Tour bookings and all payment processing happen through Bokun, our booking partner, inside this app. Roman Guides is responsible for the tour itself; Bokun's own terms govern the booking and payment transaction.",
    ],
  },
  {
    title: 'Content ownership',
    paragraphs: [
      'The text, photos, and guide content in this app belong to Roman Guides. Please don\'t reuse them without asking.',
    ],
  },
  {
    title: 'Liability',
    paragraphs: [
      'This app is provided as-is. We work to keep it accurate and working well, but we can\'t be held liable for issues arising from third-party services (maps, directions, booking/payment) that we don\'t control.',
    ],
  },
  {
    title: 'Governing law',
    paragraphs: ['These terms are governed by Italian law.'],
  },
];
