# Contributing

Roman Guides Companion is in **maintenance mode**: no new features are added without deliberate discussion first. This document describes the workflow every change — bug fix, doc update, dependency bump, anything — should follow.

## Workflow

1. **Analyze first.** Before writing any code, understand the current behavior and root cause. Read the relevant files in full rather than guessing from filenames or partial context. Check `/docs` for how the affected area currently works, and check whether a similar solution already exists elsewhere in the codebase — do not duplicate a component, hook, service, type, or utility that already covers the need; extend existing code instead of creating parallel structures.
2. **Discuss the solution.** State the root cause and the proposed fix before implementing it, especially for anything beyond a trivial one-line change. Prefer the smallest change that actually fixes the root cause over a broader rewrite.
3. **Implement.** Make the change. Do not refactor unrelated code, add abstractions the task doesn't need, or add error handling/validation for cases that can't occur. Match the existing code style (see `docs/Architecture.md`).
4. **Run Playwright.** `npm run test:e2e` must pass in full (all 8 scenarios in `e2e/smoke.spec.ts`) before the change is considered done. A change that requires a new test (new UI, a regression being fixed) should add that test.
5. **Manual mobile testing.** For anything touching the Map, geolocation, or layout, verify on a real phone, not just desktop/devtools emulation — see `docs/Deployment.md` for how to expose the dev/preview server over HTTPS on the local network. Emulated viewports have already missed real bugs in this project (e.g. the email-form field-clipping bug and the geolocation timeout bug were only visible on a physical device). For a change that also needs verifying in the native iOS/Android builds, run `npm run cap:sync` and test in Xcode/Android Studio (simulator/emulator, then a real device where possible) — see `docs/Deployment.md`'s "Native builds (Capacitor)" section.
6. **Commit.** Once tests pass and manual testing (where applicable) confirms the fix, commit with a message describing why the change was made, not just what changed.
7. **Push.** Push after the commit is made — do not batch unrelated changes into one commit.

## Documentation

If a change alters how something in `/docs` actually works, update that doc in the same change — `/docs` must always describe the current implementation, never fall behind it. If a change is a fix rather than new behavior, add an entry to `CHANGELOG.md`.

## Things to avoid

- Do not add new features without first discussing them — check `ROADMAP.md` for what's already been considered and deliberately deferred, and why.
- Do not upgrade dependencies without a specific reason and without re-running the full test suite afterward.
- Do not commit secrets, API keys, or credential files — see `.gitignore` and `docs/Deployment.md`.
