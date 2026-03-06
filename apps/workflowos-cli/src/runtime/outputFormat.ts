import type { RenderSections } from '@workflowos/core';

function formatList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function renderDeterministicOutput(sections: RenderSections): string {
  return [
    'A) Best Next Step',
    sections.bestNextStep,
    '',
    'B) Plan',
    formatList(sections.plan),
    '',
    'C) Deliverables',
    formatList(sections.deliverables),
    '',
    'D) QA / Verification',
    formatList(sections.qa),
    '',
    'E) Next Actions',
    formatList(sections.nextActions)
  ].join('\n');
}
