import type { CommandName, WorkflowMode } from '../workflows/schema';

export type PolicyMode = 'DRAFT_ONLY' | 'APPROVAL_REQUIRED';

export interface RunInput {
  rawInput: string;
  command: CommandName;
  mode: WorkflowMode;
  policyMode: PolicyMode;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  tool?: string;
  requiresSideEffect?: boolean;
}

export interface PlannerOutput {
  assumptions: string[];
  steps: PlanStep[];
  selectedTools: string[];
}

export interface EvidenceItem {
  tool: string;
  details: string;
  raw?: unknown;
}

export interface DraftPayload {
  action: string;
  target: string;
  content: string;
  serializedRequest?: Record<string, unknown>;
}

export interface FutureConnectorCall {
  connector: string;
  action: string;
  request: Record<string, unknown>;
}

export interface ExecutionPlan {
  manualSteps: string[];
  approvalPath: string[];
  futureConnectorCall?: FutureConnectorCall;
}

export interface DraftArtifact {
  type: 'DraftPayload';
  connector: string;
  payload: DraftPayload;
  executionPlan: ExecutionPlan;
  riskNotes: string[];
}

export interface ExecutionOutput {
  evidence: EvidenceItem[];
  drafts: DraftArtifact[];
  notes: string[];
}

export interface RenderSections {
  bestNextStep: string;
  plan: string[];
  deliverables: string[];
  qa: string[];
  nextActions: string[];
}

export interface VerificationOutput {
  pass: boolean;
  checks: string[];
  failures: string[];
}

export interface WorkflowRunResult {
  traceId: string;
  command: CommandName;
  mode: WorkflowMode;
  policyMode: PolicyMode;
  assumptions: string[];
  sections: RenderSections;
  outputText: string;
  plan: PlannerOutput;
  execution: ExecutionOutput;
  verification: VerificationOutput;
}
