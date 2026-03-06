import path from 'node:path';
import {
  buildPlan,
  buildPromptPackage,
  createDatabase,
  createLogger,
  createTraceId,
  executePlan,
  MemoryRepository,
  OpenAIPlannerOrchestrator,
  routeInput,
  ToolRegistry,
  verifyRun,
  WorkflowRegistry,
  type GmailApiConfig,
  type GmailExecutionMode,
  type PolicyMode,
  type WebSearchProvider,
  type WorkflowRunResult
} from '@workflowos/core';
import { renderAudit } from '../commands/audit';
import { renderContinuity } from '../commands/continuity';
import { renderDaily } from '../commands/daily';
import { renderDecision } from '../commands/decision';
import { renderFollowup } from '../commands/followup';
import { renderPromptpack } from '../commands/promptpack';
import { renderResearch } from '../commands/research';
import { renderTemplate } from '../commands/template';
import type { CommandRenderer } from '../commands/types';
import { renderWeekly } from '../commands/weekly';
import { renderDeterministicOutput } from './outputFormat';
import { PolicyEngine } from './policy';
import { summarizeDraftArtifact } from './artifacts';

export interface RunLoopConfig {
  policyMode: PolicyMode;
  dbPath: string;
  logLevel: string;
  cwd?: string;
  enableModelPlanner?: boolean;
  executeApprovedSideEffects?: boolean;
  approvalRecord?: { approved: boolean; approver: string; reason: string };
  webSearchProvider?: WebSearchProvider;
  gmailExecutionMode?: GmailExecutionMode;
  gmailApiConfig?: GmailApiConfig;
  approverAllowlist?: string[];
}

export interface RunLoopResult {
  runId: string;
  result: WorkflowRunResult;
}

const commandRenderers: Record<string, CommandRenderer> = {
  daily: renderDaily,
  weekly: renderWeekly,
  audit: renderAudit,
  decision: renderDecision,
  template: renderTemplate,
  followup: renderFollowup,
  promptpack: renderPromptpack,
  continuity: renderContinuity,
  research: renderResearch
};

export async function runLoop(rawInput: string, config: RunLoopConfig): Promise<RunLoopResult> {
  const route = routeInput(rawInput);
  const traceId = createTraceId();
  const logger = createLogger(config.logLevel, { trace_id: traceId });
  const workflowRegistry = new WorkflowRegistry();
  const workflow = workflowRegistry.get(route.command);

  const policyEngine = new PolicyEngine(config.policyMode, {
    approverAllowlist: config.approverAllowlist
  });
  const tools = new ToolRegistry({
    cwd: config.cwd,
    policyMode: policyEngine.mode,
    sideEffectPolicy: policyEngine,
    webSearchProvider: config.webSearchProvider,
    gmailExecutionMode: config.gmailExecutionMode,
    gmailApiConfig: config.gmailApiConfig
  });

  const deterministicPlan = buildPlan({ workflow, rawInput });
  let plan = deterministicPlan;

  if (config.enableModelPlanner) {
    const plannerOrchestrator = new OpenAIPlannerOrchestrator(process.env.OPENAI_API_KEY);
    const modelPlan = await plannerOrchestrator.plan({ workflow, rawInput }).catch(() => null);
    if (modelPlan && modelPlan.steps.length >= 3 && modelPlan.steps.length <= 7) {
      plan = modelPlan;
    }
  }

  const promptPackage = buildPromptPackage({
    mode: route.mode,
    command: route.command,
    userInput: rawInput,
    variables: {
      workflow_mode: route.mode,
      policy_mode: policyEngine.mode,
      command: route.command
    }
  });

  const execution = await executePlan({
    command: route.command,
    rawInput,
    steps: plan.steps,
    tools,
    policyMode: policyEngine.mode,
    executeApprovedSideEffects: config.executeApprovedSideEffects,
    approvalRecord: config.approvalRecord
  });

  const renderer = commandRenderers[route.command];
  const assumptions = [...route.assumptions, ...plan.assumptions];
  const sections = renderer({ rawInput, promptPackage, execution, assumptions });

  sections.qa.push(`Policy mode active: ${policyEngine.mode}`);
  sections.qa.push(`Gmail execution mode: ${config.gmailExecutionMode ?? 'STUB'}`);
  if (policyEngine.mode === 'APPROVAL_REQUIRED' && config.executeApprovedSideEffects) {
    if (config.approvalRecord?.approved) {
      sections.qa.push(
        `Approval supplied by ${config.approvalRecord.approver}: ${config.approvalRecord.reason}`
      );
    } else {
      sections.qa.push(
        'Approved execution was requested but no approval object was supplied; actions remained draft-only.'
      );
    }
  }

  if (assumptions.length > 0) {
    sections.qa.push(`Assumptions: ${assumptions.join(' | ')}`);
  }

  if (execution.evidence.length > 0) {
    for (const evidence of execution.evidence) {
      sections.qa.push(`EVIDENCE(${evidence.tool}): ${evidence.details}`);
    }
  } else {
    sections.qa.push('No external tool claims were made.');
  }

  if (execution.drafts.length > 0) {
    for (const artifact of execution.drafts) {
      sections.deliverables.push(`DraftArtifact: ${summarizeDraftArtifact(artifact)}`);
      sections.deliverables.push(
        `DraftPayload(${artifact.connector}): ${artifact.payload.content.replace(/\n/g, ' | ')}`
      );
      sections.deliverables.push(
        `ExecutionPlan(${artifact.connector}): ${artifact.executionPlan.manualSteps.join(' -> ')}`
      );
      if (artifact.executionPlan.futureConnectorCall) {
        sections.deliverables.push(
          `FutureConnectorCall(${artifact.connector}): ${JSON.stringify(
            artifact.executionPlan.futureConnectorCall
          )}`
        );
      }
      sections.deliverables.push(
        `RiskNotes(${artifact.connector}): ${artifact.riskNotes.join(' | ')}`
      );
    }
  }

  for (const note of execution.notes) {
    sections.qa.push(`Execution note: ${note}`);
  }

  let outputText = renderDeterministicOutput(sections);

  const verification = verifyRun({
    outputText,
    command: route.command,
    policyMode: policyEngine.mode,
    execution
  });

  if (!verification.pass) {
    for (const failure of verification.failures) {
      sections.qa.push(`Verifier failure: ${failure}`);
    }
    outputText = renderDeterministicOutput(sections);
  } else {
    for (const check of verification.checks) {
      sections.qa.push(`Verifier check: ${check}`);
    }
    outputText = renderDeterministicOutput(sections);
  }

  const result: WorkflowRunResult = {
    traceId,
    command: route.command,
    mode: route.mode,
    policyMode: policyEngine.mode,
    assumptions,
    sections,
    outputText,
    plan,
    execution,
    verification
  };

  const dbPath = path.resolve(config.cwd ?? process.cwd(), config.dbPath);
  const db = createDatabase(dbPath);
  const repo = new MemoryRepository(db);
  const runId = repo.saveRun(result, rawInput);

  if (config.approvalRecord) {
    const approvalUsed = policyEngine.mode === 'APPROVAL_REQUIRED' && execution.drafts.length === 0;
    repo.createApproval(
      runId,
      approvalUsed ? 'used' : 'recorded',
      approvalUsed ? 'Approval used for side-effect execution path.' : 'Approval recorded.',
      config.approvalRecord
    );
  }

  for (const draft of execution.drafts) {
    repo.saveArtifact(runId, draft);
  }

  for (const assumption of assumptions) {
    repo.addContextForever(runId, `assumption: ${assumption}`);
  }

  repo.addContextForever(runId, `prompt_copy: ${promptPackage.copyPastePrompt}`);

  logger.info(
    {
      traceId,
      runId,
      mode: route.mode,
      command: route.command,
      policyMode: policyEngine.mode,
      planSteps: plan.steps.length,
      evidenceCount: execution.evidence.length,
      draftCount: execution.drafts.length,
      verificationPass: verification.pass
    },
    'workflow run completed'
  );

  db.close();

  return {
    runId,
    result
  };
}
