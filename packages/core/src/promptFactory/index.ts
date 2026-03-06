import { getIterationKnobs } from './knobs';
import { getNegativePrompts } from './negatives';
import { getSkeleton } from './templates';
import type { CommandName, WorkflowMode } from '../workflows/schema';

export interface PromptBuildInput {
  mode: WorkflowMode;
  command: CommandName;
  userInput: string;
  variables: Record<string, string>;
}

export interface PromptPackage {
  systemPrompt: string;
  commandPrompt: string;
  negativePrompt: string;
  iterationKnobs: string[];
  copyPastePrompt: string;
}

function formatVariables(variables: Record<string, string>): string {
  const pairs = Object.entries(variables);
  if (pairs.length === 0) {
    return '- none';
  }

  return pairs.map(([key, value]) => `- ${key}: ${value}`).join('\n');
}

export function buildPromptPackage(input: PromptBuildInput): PromptPackage {
  const skeleton = getSkeleton(input.mode);
  const negatives = getNegativePrompts(input.mode);
  const knobs = getIterationKnobs(input.mode);
  const variantInstruction = skeleton.commandVariants[input.command];

  const systemPrompt = [
    `Tone: ${skeleton.tone}`,
    'Global constraints:',
    ...skeleton.constraints.map((item) => `- ${item}`),
    'Required output sections:',
    ...skeleton.outputFormat.map((item) => `- ${item}`)
  ].join('\n');

  const commandPrompt = [
    `Command: /${input.command}`,
    `Instruction: ${variantInstruction}`,
    'User input:',
    input.userInput,
    'Variables:',
    formatVariables(input.variables)
  ].join('\n');

  const negativePrompt = negatives.join(' | ');

  const copyPastePrompt = [
    '### CORE SKELETON',
    systemPrompt,
    '',
    '### TASK',
    commandPrompt,
    '',
    '### NEGATIVE PROMPTS',
    negativePrompt,
    '',
    '### ITERATION KNOBS',
    knobs.map((item) => `- ${item}`).join('\n')
  ].join('\n');

  return {
    systemPrompt,
    commandPrompt,
    negativePrompt,
    iterationKnobs: knobs,
    copyPastePrompt
  };
}
