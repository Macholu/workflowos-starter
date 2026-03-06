import type { WorkflowMode } from '../workflows/schema';

const businessKnobs = [
  'If output is generic: increase specificity with concrete metrics.',
  'If plan is too long: compress to highest-leverage actions only.',
  'If assumptions are weak: add explicit assumption/evidence gap markers.'
];

const filmKnobs = [
  'If image looks fake: add pore-level microtexture, fabric weave, and film grain constraints.',
  'If composition fails: tighten blocking with subject-to-camera geometry and eye-line notes.',
  'If motion is unclear: specify camera path, velocity profile, and stabilization intent.',
  'If continuity drifts: restate wardrobe/props constants and lock color IDs.'
];

export function getIterationKnobs(mode: WorkflowMode): string[] {
  return mode === 'FILM_PROMPT_FACTORY' ? filmKnobs : businessKnobs;
}
