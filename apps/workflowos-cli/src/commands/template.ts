import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderTemplate: CommandRenderer = (context) => {
  const useCase = extractIntent(context.rawInput, 'template', 'Operational update');

  return {
    bestNextStep: `Adopt this reusable template for: ${useCase}`,
    plan: [
      'Define intended audience and decision needed.',
      'Fill placeholders with current cycle data.',
      'Review for brevity and actionability.',
      'Save as team default template.'
    ],
    deliverables: [
      `Template Use Case: ${useCase}`,
      'Section 1: Objective and scope.',
      'Section 2: Current state and evidence.',
      'Section 3: Recommended action and owner.',
      'Section 4: Risks, mitigations, and timeline.',
      'Section 5: Success metric and review date.'
    ],
    qa: ['Confirmed template contains at least four actionable sections.'],
    nextActions: [
      'Run one live instance with current project data.',
      'Collect feedback from two stakeholders.',
      'Iterate and lock v1 template.'
    ]
  };
};
