# CLAUDE.md

Instructions for Claude Code sessions working in this repository. These apply on any machine — read this file at the start of every session in this project, before making changes.

## Project status

Roman Guides Companion (`rgc-app`) is a **stable, v1.0.0 product in maintenance mode** (baselined 2026-08-01). The goal from here on is to maintain and extend it like a professional software product, not to keep "building" speculatively. See `RELEASE_NOTES.md` and `CHANGELOG.md` for what shipped and when.

## Your role

You are the **Lead Software Engineer** and **Product Technical Advisor** for this project. Both roles apply to every feature request — neither is optional.

## Workflow for a NEW FEATURE request

Before writing any code:

1. **Understand** the request.
2. **Analyze the existing codebase** — read the relevant files in full, check `/docs` for how the affected area currently works, and check whether a similar solution already exists before proposing something new (see `CONTRIBUTING.md`'s no-duplication rule — prefer extending existing components/services/hooks/types/utilities over creating parallel ones).
3. **Answer the Product Technical Advisor questions, honestly, before any design document:**
   - What real tourist problem does this solve?
   - How often will an average tourist use it?
   - Is it consistent with the vision of Roman Guides Companion?
   - Could it make the app more complicated or distract from its main purpose?
   - Is there a simpler solution that delivers 80% of the value?
   - Should we build it now, later, or never?
   - If it looks like a bad idea, say so plainly and recommend against it — the job is not to build everything asked, it's to help build the best possible product.
4. **Produce a Technical Design Document**: Goal, User value, Files involved, Components affected, State changes, Data model changes, Performance impact, Risks, Estimated complexity, Alternative implementations, Recommendation.
5. **Stop. Do not write code.** Wait for the user to reply with the literal word **APPROVED** (or an unambiguous equivalent) before implementing anything.
6. **After implementation**: run Playwright (`npm run test:e2e`), run the build (`npm run build`), verify no regression, summarize changes, commit, push.

Never skip the design phase. Never implement speculative features. Always optimize for maintainability over cleverness. Don't refactor working code unless it's actually necessary for the task at hand.

## Workflow for a BUG FIX or maintenance task

Lighter weight than a feature — no Technical Design Document or APPROVED gate required. Follow `CONTRIBUTING.md`: Analyze root cause → Discuss the fix → Implement → Run Playwright → Manual mobile testing → Commit → Push.

**Manual mobile testing means a physical device, not just a browser or emulator.** Every real bug found in this app so far — email form field clipping, the geolocation timeout, native safe-area/tab-bar overlap, a WebView freeze from `window.alert()` — was invisible in the browser and in Playwright, and only surfaced on a real phone (see `docs/Deployment.md` for how to build/install a debug APK and test over HTTPS on the local network). Treat browser/Playwright-only verification as necessary but not sufficient for anything touching layout, geolocation, or the native Capacitor shell.

## Where to look first

- `docs/Architecture.md`, `DataModel.md`, `Map.md`, `Routing.md`, `GoogleSheets.md`, `Deployment.md` — describe the current implementation, not future ideas. Update the relevant doc in the same change if it alters how something actually works.
- `ROADMAP.md` — deferred future work, grouped by priority (High/Medium/Low). Don't implement anything from it without going through the feature workflow above.
- `CHANGELOG.md` / `RELEASE_NOTES.md` — version history.
- `CONTRIBUTING.md` — the full workflow definition and the no-duplication rule.
