// Roman Guides Companion — App Content data service
// Stesso pattern degli altri servizi. Espone anche un helper per sezione
// singola, dato che l'uso tipico è "dammi la sezione hero", non l'elenco intero.

import type { AppContent, AppContentSection } from '../data/types';
import appContentData from '../data/appContent.json';
import heroImage from '../assets/appContent/hero.jpg';

// Bundled replacement for the hero's CMS-hosted stock photo — a real
// customer photo (2026-08-18), same "bundle it into the app" choice made
// for the 3 Colosseum tour photos, see experienceImageOverrides.ts.
const APP_CONTENT_IMAGE_OVERRIDES: Partial<Record<AppContentSection, string>> = {
  hero: heroImage,
};

export function getAppContent(): AppContent[] {
  return appContentData as AppContent[];
}

export function getAppContentSection(section: AppContentSection): AppContent | undefined {
  const content = getAppContent().find((c) => c.id === section);
  const override = APP_CONTENT_IMAGE_OVERRIDES[section];
  return content && override ? { ...content, imageUrl: override } : content;
}
