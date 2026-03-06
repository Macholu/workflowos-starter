import type { CommandName, WorkflowMode } from '../workflows/schema';

const commandNames: CommandName[] = [
  'daily',
  'weekly',
  'audit',
  'decision',
  'template',
  'followup',
  'promptpack',
  'continuity',
  'research'
];

const filmKeywords = ['night runner', 'shot', 'promptpack', 'continuity', 'imax'];

export interface RouteResult {
  mode: WorkflowMode;
  command: CommandName;
  normalizedInput: string;
  assumptions: string[];
}

function detectMode(input: string): WorkflowMode {
  const lower = input.toLowerCase();
  return filmKeywords.some((keyword) => lower.includes(keyword))
    ? 'FILM_PROMPT_FACTORY'
    : 'BUSINESS_OPS';
}

function extractCommand(input: string): CommandName | null {
  const firstToken = input.trim().split(/\s+/)[0] ?? '';
  if (!firstToken.startsWith('/')) {
    return null;
  }

  const command = firstToken.slice(1).toLowerCase();
  return commandNames.includes(command as CommandName) ? (command as CommandName) : null;
}

export function routeInput(input: string): RouteResult {
  const mode = detectMode(input);
  const explicitCommand = extractCommand(input);
  const assumptions: string[] = [];

  let command: CommandName;
  if (explicitCommand) {
    command = explicitCommand;
  } else {
    command = mode === 'FILM_PROMPT_FACTORY' ? 'promptpack' : 'daily';
    assumptions.push(`No explicit slash command found; defaulted to /${command}.`);
  }

  return {
    mode,
    command,
    normalizedInput: input.trim(),
    assumptions
  };
}
