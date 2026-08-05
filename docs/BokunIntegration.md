# Bokun API Integration — Proposed Architecture

> **Status (2026-08-05): DECIDED for now.** After comparing embedded-widget vs. full-native checkout (see Decision below), the team chose the embedded widget. §1–§9 below remain as a fully-researched reference for the native path, kept intentionally rather than deleted — it's the natural next step if/when the business case for it changes. `BookingWidgetModal.tsx` (§Decision) is the implemented piece; everything else in this document is still just a design for later.

## Decision (2026-08-05): embedded Bokun widget, native checkout deferred

**Chosen: Option 3 — Bokun's hosted widget, rendered inside the app via a plain `<iframe>`, no browser chrome.** Implemented in `BookingWidgetModal.tsx`, replacing the external-browser link in `ExperiencesScreen.tsx`.

Why this over the full native build in §1–§9: the entire justification for going native was UI/branding control over the checkout screen — but Bokun's widget is explicitly designed for iframe embedding on a vendor's own site/app (that's its actual product), so embedding it costs **zero backend, zero HMAC/API-key handling, and zero PCI scope for Roman Guides** — Bokun remains fully responsible for booking and payment, exactly as today, just without the customer visually leaving the app. Weighed against that, a full native REST v1 + backend + Stripe Connect build buys additional graphic control that isn't worth taking on permanent backend/PCI/payment operational responsibility for at current booking volume. If that calculus changes (e.g., real demand for a fully bespoke checkout UX, or a decision to move to Roman Guides' own independent Stripe settlement — see §2.1 Option B), §1–§9 is the starting point, not a rewrite.

Technical notes from implementing this:
- **No Capacitor plugin needed.** This is different from `@capacitor/browser` (a separate native browser view with its own, unavoidable chrome/toolbar) — the whole app already runs inside one Capacitor WebView, so a plain HTML `<iframe>` just renders inside the page that's already there. No new dependency.
- Bokun's widget URLs (`widgets.bokun.io/online-sales/...`, already stored per-experience in `experiences.json`'s `bookingUrl`) are designed to be embedded via iframe on customer websites — this is Bokun's own embed product, so there's no `X-Frame-Options`/CSP block to work around on their end. Confirm this in practice on a real device per `CLAUDE.md`'s manual-testing requirement (WebView cross-origin iframe behavior is exactly the kind of thing that's only fully proven on-device).
- The iframe sets `allow="payment"` — without it, the Permissions Policy some browsers/WebViews apply by default can silently block the Payment Request API (used by Apple Pay/Google Pay and often by Stripe.js) inside a cross-origin iframe.

## 0. Product Technical Advisor assessment

Before the architecture: is this the right thing to build, and how much of it?

**What real tourist problem does this solve?** Today, tapping "Discover Experience" opens Bokun's hosted checkout in the *system* browser (`target="_blank"`, no in-app browser plugin installed) — the user fully leaves the app to pay. A native flow keeps them inside Roman Guides' own trusted UI through payment. That's a real, legitimate conversion/trust improvement, not a cosmetic one.

**How often would it be used?** Booking is low-frequency per user (once or twice a trip) but it is *the* revenue-generating action of the app — Roman Guides is a tour company. Low frequency, high business criticality.

**Consistent with the vision?** Yes — arguably more so than today's external handoff, which undercuts the "personal, boutique, never scripted" positioning `Our Story` already claims.

**Could it complicate the app?** Significantly, and this needs to be said plainly: this is the single largest architectural change available to this codebase. Today there is **no backend at all** — the app is a static bundle (`docs/Architecture.md`). This proposal requires standing one up, handling payment data (PCI scope) and customer PII (GDPR, serving EU tourists) for the first time, and taking on permanent operational responsibility (uptime, secret rotation, security patching) that doesn't exist today.

**Is there a simpler solution for most of the value?** Yes, and it should be seriously considered before the full build below: swap the current plain external-browser link for **`@capacitor/browser`'s in-app browser**, still pointed at Bokun's own hosted checkout. Zero backend, zero PCI scope, a few hours of work, and it already fixes the worst part of today's experience — fully leaving the app. Section 8 lays out a phased path from here to full native.

**Recommendation:** don't jump straight to the full native build this document specifies. Ship the in-app-browser fix now; treat native *browsing* (read-only: list/detail/availability/pricing) as the next real win, since it has no payment/PCI exposure; treat native *checkout* as a later, deliberately-resourced decision once there's real signal (e.g., analytics showing drop-off at the external handoff) that justifies taking on a backend and PCI scope permanently. The rest of this document designs the full picture regardless, since that's what was asked for — but the recommendation is to build it in that order, not all at once.

---

## 1. Current state (baseline)

- `src/data/experiences.json` — 7 bookable tours, each with a `bookingUrl` pointing at a Bokun-hosted widget page (`widgets.bokun.io/online-sales/...`).
- `ExperiencesScreen.tsx` — renders each tour as a card with a `<Button href={exp.bookingUrl} target="_blank">` — a plain anchor tag, no in-app browser. In the Capacitor WebView this hands off to the system browser.
- No backend, no server-side secrets, no payment handling anywhere in this app today.
- A structurally identical problem already exists and is tracked in `ROADMAP.md`: the OpenRouteService API key lives client-side (`src/config/routing.config.ts`), flagged as needing a server-side proxy "before any public store launch" because a compiled app binary can be unzipped and any embedded secret extracted. Bokun's secret key is the same problem, several orders of magnitude higher stakes (it can create/cancel real bookings and touch customer payment data, not just consume a routing quota).

---

## 2. Bokun's API surface — what's actually available

Bokun exposes three distinct API families. Picking the right one matters:

| Family | What it is | Verdict for this use case |
|---|---|---|
| **REST v1** (`bokun.dev/booking-api-rest`, spec at `api-docs.bokun.dev/rest-v1.yaml`) | Bokun's original, most feature-complete RESTful API — products, availability, pricing, shopping cart, checkout, bookings. | **Selected.** Covers every one of the 9 requested capabilities directly; this document is built against it. |
| **OCTO API** (`bokun.dev/octo-api`, `api.bokun.io/octo/v1`) | Bokun's implementation of [OCTO](https://octo.travel/), an open standard shared across many tour/activity platforms. | Considered and rejected for now — Bokun's own docs note OCTO doesn't expose the granular cancellation-policy detail the REST API does, and since this integration is Bokun-only (not multi-supplier), there's no portability benefit to standardizing on OCTO. Worth revisiting only if Roman Guides ever integrates a second booking platform. |
| **GraphQL / REST v2** (`api-docs.bokun.dev`) | Newer, still growing API generation; v1 and v2 keys are interchangeable. | Not selected — REST v1 is the mature, fully-documented path for exactly this workflow (booking-api-rest is written around it). A future migration to v2/GraphQL is plausible but not necessary to start. |

### Endpoints mapped to the 9 required capabilities (REST v1)

| # | Capability | Endpoint | Method |
|---|---|---|---|
| 1 | Retrieve all experiences | `/activity.json/search` (or `/activity.json/list-by-id` for a known set) | POST |
| 2 | Retrieve a single experience | `/activity.json/{id}` or `/activity.json/slug/{slug}` | GET |
| 3 | Availability by date | `/activity.json/{id}/availabilities?start=...&end=...` | GET |
| 4 | Available start times | Same `availabilities` response — each availability entry carries its own start time(s) for `DATE_AND_TIME` products | GET |
| 5 | Live pricing | `/activity.json/{id}/price-list` (list pricing categories/rates); authoritative per-booking price comes back from the checkout-options step below, since pricing can depend on promo codes, group size, and add-ons | GET |
| 6 | Create a booking | Either the shopping-cart flow (`POST /shopping-cart.json/session/{sessionId}/activity`) or the direct single-product flow (`POST /booking.json/activity-booking/reserve-and-confirm`) | POST |
| 7 | Complete checkout | `POST /checkout.json/submit` (see §2.1 for the payment-method decision this hinges on) | POST |
| 8 | Retrieve an existing booking | `GET /booking.json/booking/{confirmationCode}` | GET |
| 9 | Booking confirmation / voucher | `GET /booking.json/activity-booking/{confirmationCode}/ticket`, and the `booking`/`travelDocuments` objects already returned inline from the checkout response | GET |

Two more endpoints matter specifically for the external-payment flow in §2.1 (Option B):

| Capability | Endpoint | Method |
|---|---|---|
| Confirm a reserved (externally-paid) booking | `POST /booking.json/{confirmationCode}/confirm` — body includes `amount`, `currency`, optional `externalBookingReference` | POST |
| Release an unconfirmed reservation | `GET /booking.json/{confirmationCode}/abort-reserved` | GET |

A note on #8: Bokun's documented lookup is **by confirmation code**, not a bare email search — I found no endpoint that lets you list bookings by email alone. That's the correct security posture (an open email search would let anyone enumerate a stranger's booking), and the design in §6 treats it that way: the app always requires the confirmation code, with email as a second factor to confirm identity, not as a standalone search key.

### 2.1 The checkout/payment decision

This is the fork in the road that determines almost everything else about scope and risk. Bokun supports two fundamentally different payment architectures — both confirmed against Bokun's own docs, not assumed — and the right choice for Roman Guides depends on a business question, not just a technical one.

#### Option A — Bokun-processed checkout (`paymentMethod: CARD`, `providerType: TOKEN`)

A client-side payment SDK (Stripe.js or equivalent) tokenizes the card; only the token reaches Bokun in the `checkout.json/submit` call. Raw card data never touches Roman Guides' own code, app, or backend — this keeps PCI-DSS scope minimal (roughly SAQ A territory).

The underlying settlement can be either of two Bokun-supported configurations:
- **Bokun Pay** — Bokun's built-in payment solution, powered by Trust My Travel, who is the merchant of record and handles payouts. Simplest to set up; Roman Guides doesn't hold the direct merchant/payment relationship.
- **Stripe Connect** — Bokun explicitly supports connecting a vendor's *own* Stripe account via Stripe Connect. Bokun still orchestrates the checkout and tokenization through its own API; settlement lands directly in Roman Guides' own Stripe balance.

Either way, **Bokun remains the single system of record for both the booking and the payment.** This is very likely already how the existing `bookingUrl` widget processes payment today — a native checkout built this way is a UI change, not an operational one.

#### Option B — External payment first, then tell Bokun (`paymentMethod: RESERVE_FOR_EXTERNAL_PAYMENT`)

A genuinely different architecture, and real: confirmed via Bokun's own docs and the OpenAPI spec, not inferred.

1. `POST checkout.json/submit` with `paymentMethod: RESERVE_FOR_EXTERNAL_PAYMENT` — holds the booked availability for a maximum of 30 minutes. **No payment is processed by Bokun at all** at this step.
2. Roman Guides' backend charges the customer directly through its own, fully independent Stripe integration (its own account, its own PaymentIntent).
3. On success: `POST /booking.json/{confirmationCode}/confirm` — the request body includes `amount` and `currency` fields (confirmed in the OpenAPI spec) specifying what was actually collected, plus optional `externalBookingReference`/`externalBookingEntityName`/`externalBookingEntityCode` fields — a natural place to stash the Stripe payment/charge ID for audit trail.
4. On failure (or if the customer abandons checkout): `GET /booking.json/{confirmationCode}/abort-reserved` releases the hold immediately rather than waiting out the 30-minute expiry.

This gives Roman Guides its own independent, direct Stripe merchant relationship — but at a real cost: **two separate systems of record.** Money moves through Stripe straight to Roman Guides' bank account; Bokun only records that "amount X was paid," with no actual knowledge of the card transaction. Two consequences follow directly:
- **Refunds require custom sync logic.** Refunding in Stripe does not automatically cancel or update the Bokun booking — Roman Guides would need to build and maintain that link.
- **A real reliability gap exists** between "Stripe charge succeeded" and "Bokun confirm call succeeded." If the confirm call fails or the app/backend crashes in between, the customer has been charged but Bokun doesn't know it. This needs a durable fix: treat Stripe's own webhook (not the client's request) as the source of truth, carry the Bokun reservation's `confirmationCode` in the PaymentIntent's metadata, and have the backend retry `confirm` from the webhook handler independent of whether the original request ever completed.

#### Option C — `providerType: REDIRECT` / `SERVER_TO_SERVER` (for completeness, not recommended)

`REDIRECT` sends the customer to an external secure payment page — simpler, but reintroduces exactly the "leaves the app" problem this whole project exists to fix, just at the payment provider instead of Bokun. `SERVER_TO_SERVER` sends raw card details through Roman Guides' own backend — pushes PCI-DSS scope to SAQ D (the strict, audited tier) for no real benefit over TOKEN. Avoid both.

#### Comparison

| | A. Bokun-processed (TOKEN) | B. External payment + reserve/confirm | C. Redirect / server-to-server |
|---|---|---|---|
| PCI scope | Minimal (token only) | Minimal (token only, via RG's own Stripe integration) | Redirect: none, but exits the app; server-to-server: full SAQ D — avoid |
| Settlement | Bokun Pay, or RG's own Stripe via Stripe Connect | Directly to RG's own Stripe account | N/A |
| Systems of record | One (Bokun) | Two (Stripe + Bokun) — must be kept in sync | One, for redirect |
| Refunds | Single place (Bokun) | Custom two-system sync required | Single place, for redirect |
| Reliability risk | Low — atomic within one call | Real gap between charge success and Bokun confirm — needs webhook-driven reconciliation | Low |
| Matches current setup | Yes — same payment config the widget likely already uses | No — a new, independent settlement relationship | Partial |
| Engineering effort | Lower | Higher (reconciliation, refund sync, webhook handling) | Lowest |

#### Recommendation

**Option A — Bokun-processed checkout (`TOKEN`)** — using whichever payment configuration Bokun already has connected for today's hosted-widget flow. It's the smallest real change to Roman Guides' actual operations: one system of record for bookings and payments, no new refund-sync or reconciliation engineering, and it doesn't disturb whatever reporting/guide-payout workflow already exists around the current setup. "Native UI" and "Bokun-processed payment" aren't in tension — `TOKEN` is specifically designed so the card form is fully custom while Bokun still owns settlement.

Option B is a legitimate, well-supported capability, and the right call for a business that specifically wants its own independent Stripe merchant relationship (rate negotiation, payout timing, combining tour revenue with other revenue in one account) — but that's a decision about who Roman Guides' money flows through, not a checkout-technology preference. It shouldn't be defaulted into.

**Worth verifying directly with Bokun before committing to Option A:** whether Stripe Connect / "Stripe Token" works through the REST API for a fully custom/headless checkout, not only Bokun's own hosted widget. The relevant Bokun help-center pages weren't fully retrievable in this research pass (JS-rendered/gated content), so this is a confirmed-open question, not an assumption baked into the recommendation.

---

## 3. Authentication

Bokun has two authentication schemes, and they solve different problems:

- **OAuth 2.0** — for apps published in Bokun's app marketplace, installed by *multiple, independent* vendors who each grant consent. Not applicable here: Roman Guides isn't building a marketplace app, it's building a private app against its own single Bokun account.
- **Legacy REST API keys (Access Key + Secret Key)** — a static credential pair issued directly from Roman Guides' own Bokun account settings ("Old REST API Credentials"). **This is the correct scheme for this project.**

### How it works

Every request needs three headers:

```
X-Bokun-Date: 2026-08-05 14:33:46          (UTC, "yyyy-MM-dd HH:mm:ss")
X-Bokun-AccessKey: <access key>
X-Bokun-Signature: <HMAC-SHA1, base64>
```

The signature is computed by concatenating, with no separators: the date string, the access key, the HTTP method in uppercase, and the request path *with query string* (no domain) — then HMAC-SHA1-signing that string with the secret key and base64-encoding the result.

```
stringToSign = date + accessKey + METHOD + pathWithQuery
signature = base64(HMAC_SHA1(secretKey, stringToSign))
```

**The decisive fact for this whole architecture:** the secret key is required to sign *every* request, including plain reads like "list experiences." Bokun has no separate publishable/read-only key the way Stripe does. That means there is no safe way to call Bokun directly from the compiled app — not even for the read-only endpoints — because any secret embedded in a mobile binary is extractable (APKs/IPAs are trivially unzipped). **All Bokun calls, without exception, must be proxied through a backend that holds the secret.**

One more concept: all actions happen "in the context of a booking channel," which is created before API keys are issued and controls the transaction currency. This needs to be set up once in Bokun's dashboard and doesn't otherwise affect the architecture.

---

## 4. Backend requirements

**Yes, mandatory** — not just for checkout, for everything, per §3. Roman Guides needs a small backend sitting between the app and Bokun.

### Responsibilities

- Hold `BOKUN_ACCESS_KEY` / `BOKUN_SECRET_KEY` in a real secrets manager (not a committed `.env` — the exact lesson `ROADMAP.md` already flags for the OpenRouteService key).
- Sign and forward every Bokun request; the app never talks to `api.bokun.io` directly.
- Trim/reshape Bokun's responses to only what the app needs — don't leak Bokun-internal fields (internal IDs, vendor commission data, etc.) to the client.
- Cache read-only responses (experience list/detail, availability, price lists) briefly — a short TTL (e.g. 30-60s) meaningfully cuts latency and protects against Bokun rate limits, and this data doesn't change second-to-second.
- Own the payment-token handoff for checkout (receive the Stripe-style token from the app, pass it to `checkout.json/submit`, never touch raw card data).
- Receive and verify Bokun webhooks for asynchronous confirmations (relevant for `ON_REQUEST` products, if Roman Guides ever adds any — today's 7 tours all appear to be instantly confirmable).
- Apply rate-limiting and abuse protection, particularly on the booking-lookup endpoint (§6, §7).
- Be a **stateless proxy, not a second database of bookings** — Bokun remains the system of record. Keeping the backend stateless minimizes what there is to secure, back up, or leak.

### Infra recommendation

There is currently no hosting or CI/CD for anything in this repo (`ROADMAP.md`, High priority: both are already-flagged gaps). Rather than standing up a traditional always-on server, a small serverless function set (Cloudflare Workers, AWS Lambda + API Gateway, or a lightweight Node service on a PaaS like Render/Fly.io) matches this app's otherwise static, low-ops footprint and keeps fixed cost near zero at low booking volume. This is an infrastructure/ops decision the team should make explicitly — it's flagged here as a recommendation, not dictated.

---

## 5. Frontend flow

Mapping each capability to where it lives in the app (new screens under a proposed `src/features/booking/`, following the existing one-folder-per-feature convention):

| Capability | Screen | Notes |
|---|---|---|
| List experiences | `ExperiencesScreen.tsx` (existing) | Swap bundled `experiences.json` copy for live data from the backend's `/experiences` proxy endpoint, or keep bundled editorial copy and only fetch live price/availability per card — see §0's phased recommendation. |
| Single experience | New `ExperienceDetailScreen.tsx` | Replaces the current direct-to-Bokun-checkout link. |
| Availability + start times | New `AvailabilityPicker` component inside detail screen | Calendar/date grid, then time-slot list once a date is picked. |
| Live pricing | Same detail/picker flow | Price updates as party size/date/time selections change. |
| Create booking | New `BookingDetailsScreen.tsx` | Guest count, booking-question answers (Bokun's dynamic question set). |
| Checkout | New `CheckoutScreen.tsx` | Payment SDK UI (Stripe Elements/PaymentSheet or equivalent), submits token to backend. |
| Retrieve booking | New `MyBookingScreen.tsx` | Confirmation code + email/last-name form, matching the security posture in §7. |
| Confirmation / voucher | New `BookingConfirmationScreen.tsx` | Rendered from the checkout response directly (no extra round-trip needed) or fetched via the ticket endpoint when revisited later from "My Booking." |

New state: a `useBookingStore` (or an extension of the existing `usePlacesStore`, though a separate store is probably cleaner given this is a distinct domain — an open decision) holding the in-progress booking selection (experience, date, time, party size, answers) — following the existing convention that **the store holds state, not logic**; a new `bookingService.ts` under `src/services/` would own the actual `fetch` calls to the backend, mirroring `routingService.ts`'s existing pattern.

---

## 6. Booking retrieval — security-specific design

Since this app has no user accounts (no login exists anywhere today — `savedPlaceIds` etc. are plain local device storage), "retrieve my booking" is necessarily an unauthenticated lookup, same as the universal airline/hotel "manage my booking" pattern. That's an acceptable, well-established pattern *if* done carefully:

- Require **both** the confirmation code and a matching contact field (email or last name) — never allow lookup by either alone. Confirmation code alone is guessable-at-scale in theory (though Bokun's codes are reasonably high-entropy); email alone would let anyone enumerate a stranger's booking.
- Rate-limit this endpoint aggressively and specifically (it's the one part of this API surface an anonymous attacker would target).
- Return only what's needed for display — never the full Bokun booking object.

---

## 7. Security considerations (summary — see inline notes above for detail)

- **Secret key**: only ever server-side, in a real secrets manager, never in git, never in the app bundle (per §3, this isn't optional for any endpoint).
- **PCI-DSS scope**: keep it minimal by using `providerType: TOKEN` with a compliant SDK — raw card data should never reach Roman Guides' own backend (§2.1).
- **PII / GDPR**: booking questions and guest details are personal data for EU tourists. Minimize logging of request/response bodies containing PII; keep the backend stateless (§4) so there's no second copy of customer data to secure or eventually delete under a GDPR request.
- **Booking lookup abuse**: code + contact match required, rate-limited (§6).
- **Webhook authenticity**: verify Bokun's webhook signature/secret before trusting any async confirmation — don't confirm a booking's state in the app based on an unverified callback.
- **Sandbox first**: Bokun provides a test environment (the OCTO API's is `api.bokuntest.com`; REST v1 almost certainly has an equivalent — confirm the exact host when credentials are issued). Build and test entirely against sandbox before ever pointing at production Bokun, especially for anything that moves money.
- **Booking channel / currency correctness**: the booking channel set up in §3 controls transaction currency — verify this matches Roman Guides' actual pricing currency before going live; a misconfiguration here is a pricing bug, not just a display bug.

---

## 8. Recommended implementation path (phased)

Given §0's assessment, here's the concrete staged plan rather than one big build:

**Stage 1 — now, ~hours of work, no backend needed.** Add `@capacitor/browser`, swap the current `<a target="_blank">` for `Browser.open({ url: exp.bookingUrl })`. This alone fixes the worst part of today's flow (fully exiting the app) while changing nothing else — no new risk, no new infra.

**Stage 2 — next, read-only, low risk.** Stand up the minimal backend proxy (§4) for the read-only endpoints only: list/detail/availability/pricing. Replace the bundled `experiences.json` display data with live Bokun data (or blend: keep bundled editorial copy, overlay live price/availability). This is where most of the "feels native" perception gain actually comes from, and it carries none of the payment/PCI exposure — worth doing on its own merits even if native checkout never happens.

**Stage 3 — later, deliberate decision.** Full native checkout per this document (§2.1, §5, §6, §7) — gated on real signal that the Stage 1/2 experience isn't converting well enough to justify taking on permanent PCI/payment operational responsibility.

### Capacitor-specific notes for whenever Stage 3 is built

- Reuse the existing `fetch`-based pattern from `routingService.ts` for the backend calls — no new HTTP client dependency needed, per `CONTRIBUTING.md`'s no-duplication rule.
- The payment SDK needs to work inside a Capacitor WebView specifically — confirm the chosen provider's Capacitor/Cordova compatibility (Stripe's web SDK is commonly used this way) before committing.
- The booking flow needs its own offline/error states, consistent with the "Empty and Error States" design language already established elsewhere in this app: no spinner-only states, no silent failures, one clear action per failure (e.g., "Could not check availability — try again" rather than a hang).
- Everything here should go through the same manual real-device testing bar as the rest of this app (`CLAUDE.md`) — payment flows in particular have a track record of behaving differently in a native WebView than in a desktop browser.

---

## 9. Open decisions

These need a human answer before implementation, not an assumption baked into the design above:

1. Does the backend live in this repo (e.g. a `server/` folder) or a separate service/repo?
2. Separate `useBookingStore` vs. extending `usePlacesStore`?
3. **Option A vs. Option B payment architecture (§2.1)** — this is a business decision (whose Stripe/merchant relationship processes the money), not a technical one. Recommendation is Option A (Bokun-processed, matching current operations) unless there's an independent reason to want Roman Guides' own direct settlement relationship.
4. If Option A: confirm with Bokun directly whether Stripe Connect/"Stripe Token" supports a fully custom/headless (non-widget) checkout through the REST API — the relevant help-center pages weren't fully retrievable in this research pass.
5. Confirm the exact REST v1 sandbox host with Bokun when credentials are requested (this document infers the `api.bokuntest.com`-style pattern from the OCTO API docs, but didn't find it stated explicitly for REST v1).
6. Should `experiences.json` be fully replaced by live Bokun data, or kept as editorial copy with live data overlaid (price/availability only)? Affects how much of the current hand-written Experiences copy (Sunrise/Golden Hour framing, etc.) survives.
