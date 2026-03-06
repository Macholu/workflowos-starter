import type { CommandName, WorkflowMode } from '../workflows/schema';

export interface PromptSkeleton {
  tone: string;
  constraints: string[];
  outputFormat: string[];
  commandVariants: Record<CommandName, string>;
}

export const businessSkeleton: PromptSkeleton = {
  tone: 'Crisp, operator-grade, action-focused.',
  constraints: [
    'No speculation.',
    'State assumptions explicitly when needed.',
    'Prefer deterministic structure over prose.'
  ],
  outputFormat: [
    'A) Best Next Step',
    'B) Plan',
    'C) Deliverables',
    'D) QA / Verification',
    'E) Next Actions'
  ],
  commandVariants: {
    daily: 'Return exactly: 1 outcome, 3 tasks, 2 blocks, 1 ignore.',
    weekly: 'Summarize wins, misses, and top priorities for next week.',
    audit: 'Return top 5 bottlenecks, ordered fixes, 1 automation, 1 KPI.',
    decision: 'Frame options, tradeoffs, recommendation, and trigger points.',
    template: 'Generate reusable template sections with placeholders.',
    followup:
      'Return 5 followups, 2 bumps, 1 breakup. Each <= 60 words. Clear CTA. No guilt.',
    promptpack: 'Not used in business mode.',
    continuity: 'Not used in business mode.',
    research: 'Generate a short research brief with assumptions and evidence gaps.'
  }
};

export const filmSkeleton: PromptSkeleton = {
  tone: 'Cinematic, precise, production ready.',
  constraints: [
    'Preserve character, wardrobe, and prop continuity.',
    'Use explicit camera/lens/DOF/motion language.',
    'Ensure texture realism and consistent lighting constants.'
  ],
  outputFormat: [
    'A) Best Next Step',
    'B) Plan',
    'C) Deliverables',
    'D) QA / Verification',
    'E) Next Actions'
  ],
  commandVariants: {
    daily: 'Not used in film mode.',
    weekly: 'Not used in film mode.',
    audit: 'Not used in film mode.',
    decision: 'Not used in film mode.',
    template: 'Not used in film mode.',
    followup: 'Not used in film mode.',
    promptpack:
      'Generate WIDE, MEDIUM, CLOSE shot prompts with IMAX placeholders, grade constants, negatives, and knobs.',
    continuity: 'Generate continuity scorecard plus fix directives for next prompt iteration.',
    research: 'Not used in film mode.'
  }
};

export function getSkeleton(mode: WorkflowMode): PromptSkeleton {
  return mode === 'FILM_PROMPT_FACTORY' ? filmSkeleton : businessSkeleton;
}
