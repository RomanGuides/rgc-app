// Roman Guides Companion — Experiences data service
// Stesso pattern di placesService.ts.

import type { Experience } from '../data/types';
import experiencesData from '../data/experiences.json';

export function getExperiences(): Experience[] {
  return experiencesData as Experience[];
}
