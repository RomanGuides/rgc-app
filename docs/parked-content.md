# Parked content

Real copy and UI that didn't fit the current screen layouts, kept here verbatim instead of deleted (per `CONTRIBUTING.md`'s spirit — nothing gets thrown away without a decision). If any of this should come back, it's a placement decision, not a rewrite.

## From the Experiences tab restructure (redesign v1, Empty and Error States addendum, state 03)

`ExperiencesScreen.tsx` was rebuilt around five sections (masthead, the seven tours, Meet the Guides, What guests say, Our Story) after `MyRomeScreen.tsx` was reduced to the Saved shortlist only. The following existing content didn't have a place in that five-section structure and was removed from the live screens without a replacement location decided:

### Discount banner (was in `ExperiencesScreen.tsx`, top of screen)

> Thank you for touring with **Roman Guides**. Enjoy **10% off** your next experience when booking directly with us.
>
> Code: `ROME10`
>
> Button: "Book Your Next Experience →" → `LINKS.TOURS`

### "Rome After Dark" — alternate night-angle copy for two tours already shown with day copy

These describe the same two experiences already featured in "the seven tours" (`fiat-500-vintage-tour`, `golf-cart-tour`) from a different marketing angle (evening instead of sunrise). Only one description per tour fits the new one-card-per-tour layout, so the day version was kept live and this alternate was parked:

- **Meet Rosie & Clementina** (Vintage Fiat 500 Experience, night angle) — "When the crowds disappear and Rome begins to sparkle, Rosie and Clementina come to life. Cruise through illuminated piazzas, silent cobbled streets and hidden corners of the Eternal City in two beautifully restored Fiat 500s, each with its own personality and story. Feel the warm summer breeze, admire Rome's monuments under the stars and experience the timeless charm of La Dolce Vita." — image: `.../Experiences/Rosie%20e%20clementina%20night.png`
- **Rome Under the Stars** (Golf Cart Experience, night angle) — "Escape the daytime heat and discover a quieter, more intimate Rome. Glide effortlessly between illuminated monuments, hidden streets and breathtaking viewpoints while the Eternal City reveals its most elegant side." — image: `.../Experiences/Golf%20night.png`

### "Watch Roman Guides in Action" (was in `ExperiencesScreen.tsx`, bottom of screen)

> 🎬 **Videos coming soon** — We're preparing real footage from our tours — check back soon.

### Per-guide WhatsApp contact button (was in `MyRomeScreen.tsx`'s Meet the Guides)

The new Meet the Guides section shows only name + one-line bio per guide (per spec — `guides.json`'s `bio` field was rewritten by the founder in August 2026 to be that one line, replacing the old multi-sentence paragraph version). What's dropped from the UI entirely is the direct contact path:

- Button: "💬 WhatsApp {guide name}" → `g.whatsappUrl` (a pre-filled `wa.me` link per guide), rendered for each of the 3 guides.

### TripAdvisor review link (was in `MyRomeScreen.tsx`'s "Leave a Review" section)

The new "What guests say" section links to one review destination (Google) per spec ("a single text link"). The second existing option was parked, not deleted:

- Button: "🏛️ Leave a TripAdvisor Review" → `https://www.tripadvisor.it/UserReviewEdit-g187791-d33021458-Roman_Guides-Rome_Lazio.html`

## Open question

None of the above was named in the five-section spec, so parking (rather than guessing a placement) was the safer default. Worth a deliberate decision on: whether the discount code and videos-coming-soon card belong back in Experiences (e.g. folded under the masthead or after the seven tours), whether the WhatsApp contact path should move to a per-guide detail view instead of disappearing, and whether TripAdvisor should be a second link alongside Google.
