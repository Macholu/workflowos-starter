import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderDecision: CommandRenderer = (context) => {
  const decisionTopic = extractIntent(context.rawInput, 'decision', 'Choose next workflow investment.');

  return {
    bestNextStep: `Choose the option with highest upside and lowest coordination load for: ${decisionTopic}`,
    plan: [
      'Define decision criteria and constraints.',
      'Evaluate options against impact, cost, and reversibility.',
      'Pick recommendation and predefine trigger to revisit.',
      'Document assumptions and owner.'
    ],
    deliverables: [
      `Decision Topic: ${decisionTopic}`,
      'Option A: Optimize existing workflow with targeted automations.',
      'Option B: Redesign process end-to-end with stronger intake controls.',
      'Option C: Keep process and add additional staffing buffer.',
      'Recommendation: Option A for fastest measurable improvement.',
      'Revisit Trigger: If KPI does not improve by 15% in two cycles.'
    ],
    qa: ['Confirmed at least three options and one recommendation are present.'],
    nextActions: [
      'Assign owner to execute recommendation.',
      'Set KPI checkpoint dates.',
      'Capture decision note in run memory.'
    ]
  };
};
