// Roman Guides Companion — Testimonials data service
// Stesso pattern degli altri servizi.

import type { Testimonial } from '../data/types';
import testimonialsData from '../data/testimonials.json';

export function getTestimonials(): Testimonial[] {
  return testimonialsData as Testimonial[];
}
