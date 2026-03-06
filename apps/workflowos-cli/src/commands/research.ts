import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderResearch: CommandRenderer = (context) => {
  const topic = extractIntent(context.rawInput, 'research', 'Priority operating question');

  return {
    bestNextStep: `Lock the research question and collect three evidence points for: ${topic}`,
    plan: [
      'Define the exact question and decision dependency.',
      'Gather local and web evidence where available.',
      'Summarize findings with confidence and gaps.',
      'Recommend next action with risk note.'
    ],
    deliverables: [
      `Research Topic: ${topic}`,
      'Finding 1: Local context shows current process baseline.',
      'Finding 2: External benchmark not claimed; add trusted sources after enabling real webSearch.',
      'Finding 3: Risk and dependency map from internal assumptions.',
      'Evidence gap: Replace webSearch stubs with real provider before production decisions.'
    ],
    qa: ['Confirmed at least three findings and explicit evidence gap.'],
    nextActions: [
      'Promote stubs to real connectors as needed.',
      'Re-run once trusted external sources are integrated.',
      'Record final decision in memory.'
    ]
  };
};
