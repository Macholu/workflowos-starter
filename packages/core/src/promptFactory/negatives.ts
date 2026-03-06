import type { WorkflowMode } from '../workflows/schema';

const businessNegatives = [
  'No vague recommendations.',
  'No passive language.',
  'No unverified tool claims.'
];

const filmNegatives = [
  'Avoid fake plastic skin.',
  'Avoid incorrect anatomy.',
  'Avoid duplicate limbs or faces.',
  'Avoid warped hands and fingers.',
  'Avoid inconsistent wardrobe continuity.'
];

export function getNegativePrompts(mode: WorkflowMode): string[] {
  return mode === 'FILM_PROMPT_FACTORY' ? filmNegatives : businessNegatives;
}
