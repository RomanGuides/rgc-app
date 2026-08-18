# Roman Guides — Content Strategy

Documento master del motore contenuti di Roman Guides (Instagram, Facebook, YouTube, TikTok). Sostituisce ogni calendario ad-hoc precedente (incluso il primo tentativo "Gladiator Week", da considerare superato — vedi Sezione B).

Missione: **"Tell the best stories about Rome in a way people cannot ignore" — con integrità storica.** Non "pubblicare di più". L'obiettivo di lungo periodo è rendere Roman Guides una voce digitale riconosciuta e affidabile sulla storia romana, non un'altra pagina generica di curiosità turistiche.

Ordine di priorità: **ATTENTION → VALUE → TRUST → AUTHORITY → COMMUNITY → BRAND RECOGNITION → TOUR INTEREST → BOOKING.** La conversione è un effetto a valle, non un requisito per-post.

> **Nota di provenienza (2026-08-18):** questo documento è stato inizialmente scritto per errore in una copia abbandonata del progetto (`C:\Users\endri\RomanGuides`, ultimo commit 1 agosto). È stato spostato qui, nel repository realmente attivo, dopo aver verificato le date dei commit. I dati di business qui sotto sono presi da **questo** repo (il vivo), non dalla copia vecchia.

---

## A. Current Content System (audit, 2026-08-18)

Cosa esiste già, verificato leggendo questo repository invece di assumerlo:

- **Account Instagram reale e attivo:** `@romanguides` — **4.9★ su TripAdvisor (250 recensioni), 10.000+ viaggiatori/anno** (dato corretto: una versione precedente del contenuto app riportava un placeholder "5.0★/10.000+" non verificato — vedi il case study in Sezione H).
- **Posizionamento attuale del brand:** "Meet your trusted Rome travel agency" — Roman Guides è un vero tour operator con booking reale (integrazione Bokun), non solo un'app di contenuti. Il pillar storico è una parte dell'ecosistema, non l'intero brand.
- **Catalogo esperienze reali prenotabili** (`src/data/experiences.json`), con bestseller segnalati:
  - **Colosseum Underground** ⭐bestseller — 99€, 92 min — tunnel sotto il Colosseo dove gladiatori e animali attendevano prima dei combattimenti. **Match diretto e naturale con il nostro topic di ricerca già verificato (Efeso/teschi di gladiatori, Sezione L)** — non serve forzare la vendita, è letteralmente lo stesso soggetto.
  - **Drunken History Rome** ⭐bestseller — 89€, 180 min, 18+ — tour serale con drink e "storie scandalose e proibite" di Roma. Format già esistente che unisce storia + intrattenimento, seme naturale di serie ricorrente.
  - **Colosseum Arena** ⭐bestseller — 119€, 150 min — accesso al piano dell'Arena.
  - Golf Cart Tour (79€), Fiat 500 Vintage Tour (119€), St. Peter's Basilica (25€), Private Tours (prezzo custom), Pasta & Tiramisù Cooking Class (39€), Monti Food Tour (69€), Catacombs Tour (59€), Pompeii day trips (79-109€).
- **5 video/reel già girati e pubblicati:** hero reel del concierge, *Colosseum Underground*, *Drunken History Rome*, *Golf Cart Tour* (tutti Instagram Reel), *Fiat 500 Vintage Tour* (YouTube Shorts).
- **5 guide reali con bio e voce già scritte** (`src/data/guides.json`): Eni (storyteller), Arjan ("local friend"), **Giovanni** ("Roman History Enthusiast" — fit naturale per contenuti storici), **Realda** (specialista arte/storia, guida licenziata dal 2024 — secondo fit naturale per contenuti storici/artistici), Said (tour famiglie).
- **Sessione di lavoro in corso:** 2 post di prova, un calendario "Gladiator Week" a 7 giorni (materiale di ricerca, non da pubblicare as-is), e una ricerca verificata in profondità sul cimitero dei gladiatori di Efeso (Kanz & Grossschmidt 2006) con hook selezionato — vedi Sezione L, Settimana 1.

Cosa **non** esisteva prima di questa conversazione: nessuna strategia contenuti, nessun calendario editoriale, nessun sistema di verifica delle fonti, nessuno script pronto per le guide, nessuna strategia YouTube/TikTok separata.

---

## B. Current Gaps

1. **Nessun sistema di verifica fonti** — i contenuti prodotti finora (incluso "Gladiator Week") si basavano su un solo sito amatoriale (romanoimpero.com) senza incrocio con fonti accademiche. Va trattato come pista di ricerca (Tier 5), non come fonte finale — vedi Sezione H.
2. **Nessuna presenza YouTube** — zero contenuto long-form nonostante ci sia già un video su YouTube Shorts. Nessuna libreria evergreen che costruisca autorità nel tempo.
3. **Nessuna presenza TikTok** confermata.
4. **Asset esistenti sotto-sfruttati** — 5 Reel reali e un intero catalogo di esperienze bestseller (incl. "Drunken History Rome" e "Colosseum Underground") non risultano collegati a nessuna narrativa/serie riconoscibile nei contenuti social.
5. **Nessun sistema di ripetizione del lavoro** — ogni contenuto finora è stato pensato come pezzo isolato, non come derivato di una ricerca master.
6. **Nessun processo di filming/editing documentato** — Endrin non ha oggi un brief standard da consegnare al team di editing.
7. **Nessun sistema di performance/learning loop.**
8. **Guide con specializzazioni non ancora sfruttate nel contenuto** — Realda (arte/storia) e Giovanni (storia antica) sono asset ideali per video storici on-camera e risultano invisibili sui social oggi.

---

## C. Strategic Priorities (in ordine)

1. Istituire il **sistema di verifica storica** (Sezione H) prima di produrre qualunque nuovo contenuto — è un prerequisito, non un task parallelo.
2. Lanciare **1 argomento master a settimana** (o ogni due settimane) e derivarne più formati (Sezione D), invece di produrre calendari settimanali generici.
3. Aprire **YouTube** come casa dei contenuti long-form/evergreen — è il gap più grande rispetto all'obiettivo "authority".
4. Recuperare e valorizzare gli asset già esistenti (i 5 Reel, il catalogo bestseller, le bio delle guide — specialmente Giovanni e Realda) dentro la nuova narrativa, invece di ripartire da zero.
5. Costruire **1-2 serie riconoscibili** (Sezione D) per dare struttura riconoscibile al feed nel tempo.
6. Solo dopo che il motore gira in modo sostenibile, considerare TikTok come canale a sé con adattamenti dedicati.

---

## D. Content Engine — da un argomento a più contenuti

Un solo argomento "master" ben ricercato deve poter generare, quando lo merita (non sempre tutto):

```
1 ricerca approfondita e verificata
        │
        ├─► 1 video YouTube (autorità, long-form, evergreen)
        │
        ├─► 2-5 Reel Instagram (hook diversi dalla stessa ricerca)
        │
        ├─► 2-5 TikTok (adattamento dei hook più forti, non nuova ricerca)
        │
        ├─► contenuto Facebook (Reel adattato o post con caption più estesa)
        │
        ├─► Stories (quiz, dietro le quinte, sondaggio)
        │
        └─► eventuale carousel o YouTube Short (miglior "revelation" del video lungo)
```

Non forzare ogni argomento in ogni formato. Un argomento debole resta piccolo; uno fortissimo (come il caso Efeso, Sezione L) merita l'albero completo.

### Pillar di contenuto (varietà, non ripetizione dello stesso pillar)

Colosseo · Gladiatori · Antica Roma · Vita quotidiana romana · Foro Romano · Archeologia · Miti vs realtà · Roma nascosta · Personaggi romani · Roma oggi · Domande frequenti dei turisti · Storie di Roman Guides · Conoscenza delle guide · Dietro le quinte · Luoghi che i turisti si perdono.

### Serie ricorrenti (da validare con i dati, non imposte a priori)

- **"Drunken History Rome"** — esiste già come esperienza bestseller; potenziale seme di una serie riconoscibile invece di un pezzo isolato.
- "What Hollywood Got Wrong"
- "History Happened Here" (POV su un luogo preciso)
- "Ask a Roman Guide" (con Giovanni e Realda come volti storici)

---

## E. YouTube Strategy — Authority + Depth

**Ruolo:** casa dei contenuti long-form ed evergreen. Costruisce autorità nel tempo, non vendita diretta.

- Cadenza realistica iniziale: **1-2 video long-form al mese** — qualità sopra volume.
- Durata: quella che la storia richiede davvero. Un video di 7 minuti fatto bene batte un video di 20 minuti riempito.
- Nessuna intro standard ("Hi guys, welcome back..."): si entra subito nella storia.
- Per ogni episodio, prima della produzione, preparare: 5 opzioni di titolo, 3 concept di thumbnail, keyword primaria/secondarie, search intent, hook di apertura, outline completo, script, capitoli, B-roll, location, CTA, contenuti Roman Guides correlati.
- Titolo: equilibrio tra ricerca (SEO), curiosità e accuratezza. Thumbnail: un'idea sola, comunicata velocemente, senza sovraccarico di testo.
- Esempi di titoli plausibili (da validare argomento per argomento, non usare a prescindere): "Who Were the Roman Gladiators? The Truth Behind the Arena", "What Actually Happened Inside the Colosseum?", "The Roman Forum Explained".

## F. TikTok Strategy — Discovery + Viral Reach

**Ruolo:** scoperta pura e portata virale via personalità, non ricerca separata.

- Non produrre ricerca dedicata per TikTok: riadattare gli hook più forti già validati per Instagram/YouTube.
- Priorità: primi secondi fortissimi, parlato diretto in camera, miti sfatati, affermazioni "controverse" ma storicamente difendibili, POV, "this happened right here", ritmo veloce.
- Endrin/Giovanni/Realda davanti alla camera, non voce fuori campo generica.

## G. Instagram / Facebook Strategy — Reach + Community

**Instagram — Discovery + Brand + Community.** Reel, Stories, carousel, storytelling visivo forte, hook, domande, miti, location reali, personalità delle guide. Deve far scoprire Roman Guides a chi non lo conosce.

**Facebook — Reach + Shareability + pubblico più ampio/maturo.** Non è un semplice repost di Instagram: stessa ricerca, presentazione adattata (didascalie più lunghe quando utile, taglio più discorsivo/educational, buon fit per il pubblico Facebook più adulto).

Entrambi i canali attingono allo stesso Content Engine (Sezione D) — mai calendari indipendenti.

---

## H. Historical Research System — regola assoluta

Nessuna informazione storica viene pubblicata senza verifica. Mai scrivere qualcosa perché "lo dicono tutti", "l'ho visto su TikTok", "lo dice un sito turistico", "Wikipedia dice", "suona giusto" o "rende la storia migliore".

### Gerarchia delle fonti

| Tier | Tipo | Uso |
|---|---|---|
| 1 | Fonti primarie, evidenza archeologica, pubblicazioni accademiche peer-reviewed | Autorità finale |
| 2 | Musei, università, parchi archeologici, istituzioni scientifiche | Autorità finale |
| 3 | Libri storici affidabili, storici riconosciuti | Autorità finale |
| 4 | Fonti secondarie di alta qualità (giornalismo scientifico che cita direttamente i ricercatori) | Corroborazione, non prova unica |
| 5 | Blog, social media, siti turistici (incl. romanoimpero.com) | Solo per trovare piste di ricerca — mai autorità finale |

### Scheda fonte per ogni contenuto storico rilevante

```
TOPIC:
CLAIM:
SOURCE:
SOURCE TYPE (Tier 1-5):
DATE / PERIOD:
CONFIDENCE:
NOTES:
DISPUTED? YES/NO
```

### Regole pratiche
- Distinguere sempre fatto documentato, interpretazione, teoria e leggenda — dirlo esplicitamente nel contenuto quando rilevante.
- Se gli storici sono in disaccordo, dirlo.
- Se qualcosa è leggenda, chiamarlo leggenda.
- Se un mito popolare è falso, spiegare perché — non limitarsi a smentirlo.
- **Case study interno #1 (ricerca storica):** un primo fetch automatico di un PDF accademico sui gladiatori ha riportato un dato sbagliato (sito "Carnuntum" invece di "Efeso"). È stato scartato solo incrociando 3 fonti indipendenti che citavano direttamente i ricercatori.
- **Case study interno #2 (dati di business):** questo stesso documento, nella sua prima stesura, riportava "5.0★/10.000+ recensioni" per l'account Instagram — un placeholder mai verificato letto dalla copia sbagliata (e più vecchia) del progetto. Il dato reale, corretto nel repository attivo, è 4.9★/250 recensioni TripAdvisor. La regola "verifica, non assumere" vale anche per i dati di business, non solo per la storia romana.

---

## I. Filming Workflow (per Endrin)

Il tempo di Endrin = **filmare**, non fare ricerca, scripting o editing. Per ogni video approvato, brief semplice:

```
VIDEO TITLE
OBJECTIVE
HOOK
LOCATION
CAMERA POSITION
WHAT ENDRIN SAYS (conversazionale, non uno script accademico da memorizzare a memoria)
B-ROLL NEEDED
CUTAWAY IDEAS
IMPORTANT VISUAL DETAILS
ENDING
CTA
```

## J. Editing Workflow (per il team video)

L'editor deve poter capire l'intenzione creativa senza dover fare ricerca autonoma:

```
VIDEO TYPE
TARGET LENGTH
HOOK
PACING
CUT POINTS
B-ROLL
ON-SCREEN TEXT
GRAPHICS
MAPS
ARCHIVAL MATERIAL / HISTORICAL IMAGES (etichettati come ricostruzione se non reali)
MUSIC DIRECTION
SUBTITLE REQUIREMENTS
THUMBNAIL FRAME
IMPORTANT HISTORICAL DISCLAIMERS
```

## K. Performance System

Metriche per piattaforma (non giudicare mai solo sui like):

- **Instagram:** reach, views, watch time medio, completion, share, save, commenti, nuovi follower.
- **Facebook:** reach, video views, watch time, share, commenti.
- **TikTok:** views, watch time medio, completion, share, save, nuovi follower.
- **YouTube:** impressions, CTR, durata media di visione, retention, spettatori di ritorno, iscritti, fonti di traffico, traffico da ricerca.

Domande guida: la persona si è fermata? Ha guardato? Ha finito? Ha condiviso? Ha salvato? Ha commentato? Ha seguito? Ha guardato un altro video? Ha scoperto Roman Guides?

**Loop mensile:** Top 5 hook, Top 5 argomenti, Top 5 video, formato più performante, tipo di storia più performante, location più performante, CTA più performante, range di durata più performante → adattare la strategia capendo *perché* ha funzionato, non ripetendo ciecamente.

### Content Opportunity Score (prima di ogni argomento importante)

Historical strength · Hook strength · Curiosity · Visual potential · Shareability · Saveability · Comment potential · YouTube potential · TikTok potential · Instagram potential · Evergreen potential · Roman Guides relevance · Production effort — tutti su /10. Un punteggio alto non significa pubblicare automaticamente: va spiegato perché l'argomento merita il tempo di produzione.

### Libreria CTA (variare, non ripetere sempre la vendita)

- Comment: "Would you have done it?"
- Share: "Send this to someone who loves Roman history."
- Save: "Save this for your next visit to Rome."
- Follow: "Follow Roman Guides for more stories from Rome."
- Discussion: "What do you think actually happened?"
- Conversion (solo quando calza naturalmente con un'esperienza reale): "We go beneath the Colosseum on our Underground tour — this is where they waited." (Colosseum Underground, bestseller, match diretto col topic gladiatori)

---

## L. First 30-Day Plan (realistico, tempo limitato di Endrin)

Modello sostenibile: **1 argomento master ogni 1-2 settimane**, non produzione quotidiana.

**Settimana 1 — Argomento master: "The Skulls That Rewrote Gladiator History"**
Già ricercato e verificato in questa sessione (Sezione H, cimitero di Efeso, Kanz & Grossschmidt 2006). Hook scelto: *"There's a hole in this skull that only one weapon in the ancient world could make."* Prossimo passo concordato col cliente: Step 6 (formato) → Step 7 (struttura) → filming brief per Endrin/Giovanni.
Derivati previsti: 1 Reel principale (hook scelto) + 1-2 Reel secondari dagli angoli scartati (es. "mercy blow" rituale documentato da Tertulliano) + eventuale prima base per un episodio YouTube più ampio su "chi erano davvero i gladiatori", se l'argomento regge un long-form. CTA di conversione naturale disponibile: **Colosseum Underground** (bestseller, stesso soggetto).

**Settimana 2 — Consolidamento + primo YouTube**
Nessun nuovo argomento master: si trasforma la ricerca della Settimana 1 in un video YouTube completo (se giustificato) e si recupera "Drunken History Rome" come possibile seed di serie, valutandone il potenziale con lo stesso scoring (Sezione K).

**Settimana 3 — Secondo argomento master**
Da scegliere insieme con lo stesso processo a 17 step (Sezione M) — non pre-assegnato ora, per rispettare "un argomento alla volta".

**Settimana 4 — Prima analisi**
Primo learning loop reale (Sezione K) sui contenuti pubblicati nelle settimane 1-3, per correggere la strategia con dati veri invece che assunzioni.

Nessun obbligo di pubblicazione quotidiana in nessuna delle 4 settimane.

---

## M. Content Workflow (17 step, un argomento alla volta)

1. Identificare un potenziale argomento
2. Punteggio di opportunità (Sezione K)
3. Ricerca approfondita
4. Verifica di ogni claim importante (Sezione H)
5. Trovare la storia umana più forte
6. Generare 3-5 angolazioni diverse
7. Generare 5-10 hook
8. Scegliere l'angolazione più forte
9. Decidere il/i formato/i (YouTube / Reel / TikTok / carousel / Story / più formati)
10. Creare lo script master
11. Creare il filming brief per Endrin (Sezione I)
12. Creare il brief di editing per il team (Sezione J)
13. Creare gli adattamenti per piattaforma
14. Preparare titoli / caption / descrizioni
15. Pubblicare
16. Analizzare le performance (Sezione K)
17. Usare i dati per migliorare il prossimo ciclo

**Regola fissa:** non generare mai un mese o una settimana intera di contenuti in automatico. Si lavora un argomento alla volta, e si passa allo step successivo solo dopo conferma esplicita.
