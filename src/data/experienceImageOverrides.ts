// Roman Guides Companion — Experience cover photo overrides
//
// experiences.json's imageUrl field normally points to an externally-hosted
// photo (romanguides.com's media library), so a founder photo swap doesn't
// need a new app release. For a few newer tours (2026-08-18) the founder
// asked to bundle the photo directly into the app instead of first
// uploading it to that CMS — this map is the fallback getExperienceImageUrl()
// checks when an experience's own imageUrl is null. Same pattern as
// PlaceScreen.tsx's CATEGORY_PLACEHOLDER_IMAGES: a static Vite import per
// file, so a missing asset fails the build instead of 404ing silently at
// runtime.
import pompeiiVesuviusWineryDayTrip from '../assets/experiences/pompeii-vesuvius-winery-day-trip.jpg';
import pompeiiReggiaCasertaDayTrip from '../assets/experiences/pompeii-reggia-caserta-day-trip.jpg';
import pompeiiOnlyDayExperience from '../assets/experiences/pompeii-only-day-experience.jpg';
import undergroundCatacombsTour from '../assets/experiences/underground-catacombs-tour.jpg';
import pastaTiramisuCookingClass from '../assets/experiences/pasta-tiramisu-cooking-class.jpg';
import montiFoodTour from '../assets/experiences/monti-food-tour.jpg';
import colosseumUnderground from '../assets/experiences/colosseum-underground.jpg';
import colosseumArena from '../assets/experiences/colosseum-arena.jpg';
import privateTourColosseum from '../assets/experiences/private-tour-colosseum.jpg';

export const EXPERIENCE_IMAGE_OVERRIDES: Partial<Record<string, string>> = {
  'pompeii-vesuvius-winery-day-trip': pompeiiVesuviusWineryDayTrip,
  'pompeii-reggia-caserta-day-trip': pompeiiReggiaCasertaDayTrip,
  'pompeii-only-day-experience': pompeiiOnlyDayExperience,
  'underground-catacombs-tour': undergroundCatacombsTour,
  'pasta-tiramisu-cooking-class': pastaTiramisuCookingClass,
  'monti-food-tour': montiFoodTour,
  // Replaced the old CMS stock photos with real customer photos (2026-08-18)
  // — imageUrl is now null on these 3 in experiences.json, see the comment above.
  'colosseum-underground': colosseumUnderground,
  'colosseum-arena': colosseumArena,
  'private-tour-colosseum': privateTourColosseum,
};
