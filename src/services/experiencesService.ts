// Roman Guides Companion — Experiences data service
// Stesso pattern di placesService.ts.

import type { Experience } from '../data/types';
import experiencesData from '../data/experiences.json';
import { EXPERIENCE_IMAGE_OVERRIDES } from '../data/experienceImageOverrides';

export function getExperiences(): Experience[] {
  return experiencesData as Experience[];
}

// Prefers the CMS-hosted imageUrl (so a founder photo swap on
// romanguides.com doesn't need a new release); falls back to a bundled
// local asset for tours that don't have one yet — see experienceImageOverrides.ts.
export function getExperienceImageUrl(exp: Experience): string | null {
  return exp.imageUrl ?? EXPERIENCE_IMAGE_OVERRIDES[exp.id] ?? null;
}
