import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderAudit: CommandRenderer = (context) => {
  const scope = extractIntent(context.rawInput, 'audit', 'Current operating workflow');

  return {
    bestNextStep: `Audit the highest-friction area first: ${scope}`,
    plan: [
      'Map current flow and identify queue points.',
      'Score bottlenecks by impact and frequency.',
      'Sequence fixes for compounding benefit.',
      'Implement one automation and track one KPI.'
    ],
    deliverables: [
      `Audit Scope: ${scope}`,
      'Bottleneck 1: Unclear intake criteria creates rework loops.',
      'Bottleneck 2: Manual status updates consume execution time.',
      'Bottleneck 3: Dependency handoffs are missing owner SLAs.',
      'Bottleneck 4: Priority changes are not timeboxed.',
      'Bottleneck 5: QA criteria defined too late in the cycle.',
      'Fix Order: 1) Intake criteria 2) Handoff SLAs 3) QA upfront 4) Priority guardrails 5) Status automation',
      'Automation: Auto-generate daily status digest from run artifacts.',
      'KPI: Lead time from intake to accepted completion.'
    ],
    qa: [
      'Confirmed exactly five bottlenecks listed.',
      'Included one automation recommendation and one KPI.'
    ],
    nextActions: [
      'Implement Fix 1 and Fix 2 this week.',
      'Baseline KPI today before changes.',
      'Re-run /audit after one week for delta.'
    ]
  };
};
