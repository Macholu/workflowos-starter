import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderDaily: CommandRenderer = (context) => {
  const outcome = extractIntent(context.rawInput, 'daily', 'Ship one measurable workflow improvement today.');

  return {
    bestNextStep: `Lock the day around this single outcome: ${outcome}`,
    plan: [
      'Define success criteria and owner within 15 minutes.',
      'Timebox focused execution blocks for highest leverage tasks.',
      'Review blockers at midday and re-sequence if needed.',
      'Close with evidence-backed completion check.'
    ],
    deliverables: [
      `Outcome: ${outcome}`,
      'Task 1: Prioritize the one action that unlocks progress.',
      'Task 2: Execute the core deliverable before shallow work.',
      'Task 3: Publish a concise end-of-day status update.',
      'Block 1: Context switching from reactive channels.',
      'Block 2: Missing dependency decisions.',
      'Ignore: Low-impact formatting or cosmetic changes.'
    ],
    qa: ['Confirmed 1 outcome, 3 tasks, 2 blocks, and 1 ignore item.'],
    nextActions: [
      'Start Task 1 immediately.',
      'Set a 90-minute uninterrupted deep-work block.',
      'Review completion against outcome before ending the day.'
    ]
  };
};
