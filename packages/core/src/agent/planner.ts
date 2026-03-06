import type { PlannerOutput, PlanStep } from './types';
import type { WorkflowSpec } from '../workflows/schema';

function shouldCreateSideEffectStep(command: string, input: string): boolean {
  const lower = input.toLowerCase();
  if (command === 'followup') {
    return true;
  }

  return /(send|email|dm|post|publish|delete|buy|edit\s+doc|update\s+notion)/i.test(lower);
}

function buildBaseSteps(workflow: WorkflowSpec): PlanStep[] {
  return [
    {
      id: 'step-1',
      title: 'Clarify objective',
      description: `Interpret intent for /${workflow.command} and map constraints.`
    },
    {
      id: 'step-2',
      title: 'Collect evidence',
      description: 'Run read-only tools for grounding where useful.',
      tool: workflow.defaultTools[0]
    },
    {
      id: 'step-3',
      title: 'Draft outputs',
      description: 'Generate deterministic deliverables from workflow schema.'
    },
    {
      id: 'step-4',
      title: 'Run verification',
      description: 'Validate formatting and constraints before returning output.'
    }
  ];
}

export function buildPlan(input: { workflow: WorkflowSpec; rawInput: string }): PlannerOutput {
  const assumptions: string[] = [];
  const steps = buildBaseSteps(input.workflow);

  if (input.workflow.defaultTools.length === 0) {
    assumptions.push('No default read-only tools required for this workflow.');
  }

  if (shouldCreateSideEffectStep(input.workflow.command, input.rawInput)) {
    steps.splice(3, 0, {
      id: 'step-side-effect',
      title: 'Convert side-effect intent into draft artifact',
      description: 'Generate DraftPayload + ExecutionPlan instead of executing external actions.',
      requiresSideEffect: true,
      tool: 'connector'
    });
  }

  while (steps.length < 3) {
    steps.push({
      id: `step-filler-${steps.length + 1}`,
      title: 'Stabilize plan',
      description: 'Ensure plan length meets deterministic constraints.'
    });
  }

  if (steps.length > 7) {
    steps.splice(7);
    assumptions.push('Plan was capped at 7 steps for deterministic bounds.');
  }

  return {
    assumptions,
    steps,
    selectedTools: input.workflow.defaultTools
  };
}
