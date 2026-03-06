import type { WorkflowSpec } from './schema';

const outputContract = [
  'A) Best Next Step',
  'B) Plan',
  'C) Deliverables',
  'D) QA / Verification',
  'E) Next Actions'
];

export const defaultWorkflows: WorkflowSpec[] = [
  {
    command: 'daily',
    mode: 'BUSINESS_OPS',
    description: 'Plan the day around one high-value outcome.',
    outputContract,
    constraints: [
      { key: 'outcomes', value: 1, description: 'Exactly one outcome.' },
      { key: 'tasks', value: 3, description: 'Exactly three tasks.' },
      { key: 'blocks', value: 2, description: 'Exactly two blockers.' },
      { key: 'ignore', value: 1, description: 'Exactly one ignore item.' }
    ],
    defaultTools: ['fileSearch']
  },
  {
    command: 'weekly',
    mode: 'BUSINESS_OPS',
    description: 'Review progress and set weekly priorities.',
    outputContract,
    constraints: [{ key: 'priorities', value: 3, description: 'Top three priorities.' }],
    defaultTools: ['fileSearch']
  },
  {
    command: 'audit',
    mode: 'BUSINESS_OPS',
    description: 'Find and rank operational bottlenecks.',
    outputContract,
    constraints: [
      { key: 'bottlenecks', value: 5, description: 'Exactly five bottlenecks.' },
      { key: 'automation', value: 1, description: 'Exactly one automation candidate.' },
      { key: 'kpi', value: 1, description: 'Exactly one KPI recommendation.' }
    ],
    defaultTools: ['fileSearch', 'webSearch']
  },
  {
    command: 'decision',
    mode: 'BUSINESS_OPS',
    description: 'Frame a decision with tradeoffs and recommendation.',
    outputContract,
    constraints: [{ key: 'options', value: 3, description: 'At least three options.' }],
    defaultTools: ['fileSearch']
  },
  {
    command: 'template',
    mode: 'BUSINESS_OPS',
    description: 'Generate reusable business templates.',
    outputContract,
    constraints: [{ key: 'template_sections', value: 4, description: 'At least four sections.' }],
    defaultTools: []
  },
  {
    command: 'followup',
    mode: 'BUSINESS_OPS',
    description: 'Generate professional follow-up messages.',
    outputContract,
    constraints: [
      { key: 'followups', value: 5, description: 'Five follow-up messages.' },
      { key: 'bumps', value: 2, description: 'Two bump messages.' },
      { key: 'breakup', value: 1, description: 'One breakup message.' },
      { key: 'word_limit', value: 60, description: 'Each message must be <=60 words.' }
    ],
    defaultTools: ['gmail']
  },
  {
    command: 'research',
    mode: 'BUSINESS_OPS',
    description: 'Run a structured research brief.',
    outputContract,
    constraints: [{ key: 'sources', value: 3, description: 'At least three source entries.' }],
    defaultTools: ['webSearch', 'fileSearch']
  },
  {
    command: 'promptpack',
    mode: 'FILM_PROMPT_FACTORY',
    description: 'Produce WIDE, MEDIUM, CLOSE production prompts.',
    outputContract,
    constraints: [
      { key: 'shot_variants', value: 3, description: 'WIDE, MEDIUM, CLOSE variants.' },
      { key: 'negatives', value: 1, description: 'Negative prompt bundle required.' },
      { key: 'knobs', value: 1, description: 'Iteration knobs required.' }
    ],
    defaultTools: []
  },
  {
    command: 'continuity',
    mode: 'FILM_PROMPT_FACTORY',
    description: 'Score continuity and provide fix directives.',
    outputContract,
    constraints: [
      { key: 'checklist', value: 6, description: 'At least six continuity checks.' },
      { key: 'fix_directives', value: 4, description: 'At least four fix directives.' }
    ],
    defaultTools: []
  }
];
