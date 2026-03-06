export type CommandName =
  | 'daily'
  | 'weekly'
  | 'audit'
  | 'decision'
  | 'template'
  | 'followup'
  | 'promptpack'
  | 'continuity'
  | 'research';

export type WorkflowMode = 'BUSINESS_OPS' | 'FILM_PROMPT_FACTORY';

export interface WorkflowConstraint {
  key: string;
  value: string | number;
  description: string;
}

export interface WorkflowSpec {
  command: CommandName;
  mode: WorkflowMode;
  description: string;
  outputContract: string[];
  constraints: WorkflowConstraint[];
  defaultTools: string[];
}
