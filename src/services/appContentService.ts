// Roman Guides Companion — App Content data service
// Stesso pattern degli altri servizi. Espone anche un helper per sezione
// singola, dato che l'uso tipico è "dammi la sezione hero", non l'elenco intero.

import type { AppContent, AppContentSection } from '../data/types';
import appContentData from '../data/appContent.json';

export function getAppContent(): AppContent[] {
  return appContentData as AppContent[];
}

export function getAppContentSection(section: AppContentSection): AppContent | undefined {
  return getAppContent().find((c) => c.id === section);
}
