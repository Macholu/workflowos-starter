import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderWeekly: CommandRenderer = (context) => {
  const focus = extractIntent(context.rawInput, 'weekly', 'Strengthen operating cadence and throughput.');

  return {
    bestNextStep: `Set this week’s focus: ${focus}`,
    plan: [
      'Review prior week outcomes and unresolved blockers.',
      'Prioritize top three results for this week.',
      'Allocate owner and deadline for each priority.',
      'Schedule checkpoint to adjust midweek.'
    ],
    deliverables: [
      `Weekly Focus: ${focus}`,
      'Priority 1: Ship the highest-impact deliverable by Wednesday.',
      'Priority 2: Remove one repeat blocker from the process.',
      'Priority 3: Automate one recurring manual task.',
      'Risk Watch: Capacity conflicts across owners.'
    ],
    qa: ['Confirmed exactly three priorities are defined.'],
    nextActions: [
      'Publish priorities to team channel.',
      'Book a 20-minute midweek review.',
      'Track one leading indicator daily.'
    ]
  };
};
