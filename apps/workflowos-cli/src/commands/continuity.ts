import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderContinuity: CommandRenderer = (context) => {
  const target = extractIntent(context.rawInput, 'continuity', 'Night Runner sequence iteration');

  return {
    bestNextStep: 'Score the latest frame set, then apply only the top two fix directives before next render pass.',
    plan: [
      'Evaluate continuity checklist against latest outputs.',
      'Compute weak points below threshold.',
      'Translate weak points into directive-level prompt edits.',
      'Run next iteration with minimal, targeted changes.'
    ],
    deliverables: [
      `Continuity Target: ${target}`,
      'Checklist 1: Character identity stability score = 8/10.',
      'Checklist 2: Wardrobe continuity score = 7/10.',
      'Checklist 3: Prop persistence score = 8/10.',
      'Checklist 4: Lighting direction consistency score = 6/10.',
      'Checklist 5: Grade consistency score = 7/10.',
      'Checklist 6: Spatial blocking continuity score = 6/10.',
      'Fix Directive 1: Restate key light direction and practical source location in every shot prompt.',
      'Fix Directive 2: Lock wardrobe color IDs and material descriptors as non-negotiable constants.',
      'Fix Directive 3: Add geometry anchors for subject position relative to background landmarks.',
      'Fix Directive 4: Tighten camera motion intent wording to remove ambiguous movement verbs.'
    ],
    qa: [
      'Confirmed checklist includes at least six scored continuity checks.',
      'Confirmed at least four fix directives are included.'
    ],
    nextActions: [
      'Apply Directive 1 and 3 first.',
      'Render one controlled A/B pass.',
      'Re-score continuity and track delta.'
    ]
  };
};
