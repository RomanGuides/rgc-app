// Roman Guides Companion — Data Model types
// Corrisponde 1:1 allo schema definito nel Data Model v2 (Google Drive, cartella 02).

export type PlaceCategory =
  | 'restaurant'
  | 'pasta'
  | 'pizza'
  | 'gelato'
  | 'rooftop_bar'
  | 'cocktail_bar'
  | 'gallery';

export type PlaceStatus = 'active' | 'coming_soon' | 'archived';

export interface PlaceContent {
  attribution?: string;
  body?: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  area: string | null;
  lat: number;
  lng: number;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  detailUrl?: string;
  content?: PlaceContent;
  status: PlaceStatus;
  source: string;
  rating: number | null;
  ratingCount: number | null;
  imageUrl?: string | null; // URL a un'immagine reale ospitata su romanguides.com — opzionale, Card mostra un placeholder a gradiente se assente
  visitDuration?: string | null; // es. "45–60 min" — solo per Premium Places, quando nota
  bookingUrl?: string | null; // link diretto alla prenotazione — solo per i pochi luoghi con un vero tour Roman Guides collegato
  // Articolo completo "Visit on Your Own" — tutti opzionali, popolati solo
  // per i luoghi Premium che hanno un articolo scritto (vedi Content Editing Guide).
  openingHours?: string | null;
  entranceFee?: string | null;
  officialSite?: string | null; // sito ufficiale del monumento stesso (diverso da detailUrl, che è il nostro articolo)
  whyWeLoveIt?: string | null;
  insiderTip?: string | null; // sostituisce/arricchisce content.attribution quando presente
  localSecret?: string | null;
  didYouKnow?: string | null;
  nearbyRecommendations?: string | null;
}

// Tipo di prodotto (2026-08-16, tab Home) — non ha nulla a che vedere con
// PlaceCategory: quella è la tassonomia dei 89 luoghi (ristoranti/bar/...),
// questa raggruppa le tour stesse. Introdotta insieme alla tab Home perché
// il founder sta per aggiungere 6 nuove tour, incluse le prime food-tour/
// cooking-class del catalogo — senza un campo per distinguerle, "le sette
// tour" sarebbe presto un elenco piatto di 13 prodotti molto diversi tra loro.
export type TourType = 'classic-tour' | 'experience' | 'food-tour' | 'cooking-class' | 'day-trip';

export interface Experience {
  id: string;
  name: string;
  tourType: TourType;
  videoUrl?: string | null; // opzionale — non tutte le esperienze hanno un video (es. biglietti/tour senza reel dedicato)
  videoDuration?: string | null;
  guideIds: string[];
  relatedPlaceIds: string[];
  imageUrl?: string | null;
  reviewUrl?: string | null; // link diretto per lasciare una recensione (TripAdvisor/Google/GYG)
  reviewEmoji?: string | null; // es. 🏛️ per Colosseo, 🚗 per Fiat 500 — coerenza visiva coi bottoni recensione
  bookingUrl?: string | null; // link diretto alla pagina di prenotazione Bokun per questa specifica esperienza

  // Campi per TourDetailScreen — dati operativi reali confermati dal founder
  // su Bokun (2026-08-09/10), non derivati/stimati. Tutti opzionali: un
  // campo assente non rende nulla nella schermata, non si inventa un valore.
  durationMinutes?: number | null;
  price?: number | null; // null quando il prezzo non è fisso (es. Private Tours) — vedi priceNote
  priceNote?: string | null; // es. "Custom pricing based on group size", mostrato al posto del prezzo quando price è null
  currency?: string | null;
  ageRequirement?: string | null; // testo breve, non un singolo numero — alcune tour hanno fasce età contrastanti nei dati sorgente, meglio riportarle che risolverle a caso
  meetingPoint?: string | null;
  description?: string | null; // breve, 2-3 frasi — il cliente deve capire l'offerta al volo, non leggere un racconto
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  cancellationPolicy?: string | null;

  // "Good to know" — restrizioni reali da product-facts.md (fonte Bokun,
  // confermate dal founder 2026-08-09), non dedotte. Ognuno collassa se assente.
  wheelchairAccessible?: boolean | null;
  idRequired?: boolean | null; // documento valido richiesto all'ingresso (es. Colosseo)
  healthAdvisories?: string[] | null; // es. "Not recommended for people with heart conditions"

  // Manuale, non calcolato da vendite reali (nessun dato di vendita nell'app) —
  // scelto dal founder in base a cosa vende meglio davvero (2026-08-16).
  bestSeller?: boolean;
}

// Testimonianza reale di un ospite — mostrata in My Guides ("What Guests Are Saying")
export interface Testimonial {
  id: string;
  quoteText: string;
  attribution: string; // es. "Kevin C. — Colosseum Underground & Arena"
  rating: number;
}

export interface Guide {
  id: string;
  name: string;
  displayTitle: string;
  quote?: string; // non tutte le guide hanno una citazione scritta — mai inventarne una quando manca
  bio: string;
  avatar: string; // stringa vuota se non c'è ancora una foto reale — GuidePhoto mostra un cerchio con l'iniziale
  whatsappUrl: string;
}

export interface Collection {
  id: string;
  title: string;
  placeIds: string[];
  curatedBy: string | null;
}

// Contenuto editoriale della Home (e di altre sezioni app-level in futuro).
// Deliberatamente NON un "Content" generico a chiave libera — sezioni
// esplicite e conosciute, così il modello dati resta leggibile e non
// diventa un contenitore fantasma nel tempo. Aggiungere una nuova sezione
// significa aggiungere un valore a AppContentSection, non inventare chiavi
// libere nel foglio Google.
export type AppContentSection = 'hero' | 'tip_of_the_day' | 'get_around' | 'emergency' | 'discount';

export interface AppContent {
  id: AppContentSection;
  title: string;
  subtitle: string | null; // es. titolo del reel per hero/tip_of_the_day
  body: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl?: string | null;
  videoDuration?: string | null;
}
