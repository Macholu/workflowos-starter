import type { ExecutionOutput, RenderSections } from '@workflowos/core';
import type { PromptPackage } from '@workflowos/core';

export interface CommandContext {
  rawInput: string;
  promptPackage: PromptPackage;
  execution: ExecutionOutput;
  assumptions: string[];
}

export type CommandRenderer = (context: CommandContext) => RenderSections;

export function extractIntent(rawInput: string, command: string, fallback: string): string {
  const intent = rawInput.replace(new RegExp(`^/${command}\\s*`, 'i'), '').trim();
  return intent.length > 0 ? intent : fallback;
}
