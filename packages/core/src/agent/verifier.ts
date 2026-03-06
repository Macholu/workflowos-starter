import type { CommandName } from '../workflows/schema';
import type { ExecutionOutput, PolicyMode, VerificationOutput } from './types';

const requiredHeadings = [
  'A) Best Next Step',
  'B) Plan',
  'C) Deliverables',
  'D) QA / Verification',
  'E) Next Actions'
];

function verifyEvidenceMarkers(outputText: string, execution: ExecutionOutput): string[] {
  const failures: string[] = [];
  const markers = outputText.match(/EVIDENCE\(([a-zA-Z0-9_-]+)\)/g) ?? [];
  for (const marker of markers) {
    const tool = marker.slice('EVIDENCE('.length, -1);
    const exists = execution.evidence.some((evidence) => evidence.tool === tool);
    if (!exists) {
      failures.push(`Output references ${marker} but no evidence exists.`);
    }
  }
  return failures;
}

function verifyFollowupWordLimits(outputText: string): string[] {
  const failures: string[] = [];
  const lines = outputText
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^-+\s*/, ''))
    .filter((line) => /^(F\d|B\d|BR):/i.test(line));

  for (const line of lines) {
    const message = line.split(':').slice(1).join(':').trim();
    const words = message.split(/\s+/).filter(Boolean);
    if (words.length > 60) {
      failures.push(`Follow-up exceeds 60 words: ${line}`);
    }
  }

  return failures;
}

function verifyDraftOnlyPolicy(policyMode: PolicyMode, execution: ExecutionOutput): string[] {
  if (policyMode !== 'DRAFT_ONLY') {
    return [];
  }

  const failures: string[] = [];
  const executedHints = execution.notes.filter((note) => /executed/i.test(note));
  if (executedHints.length > 0) {
    failures.push('Detected executed side-effect notes while in DRAFT_ONLY mode.');
  }

  return failures;
}

export function verifyRun(input: {
  outputText: string;
  command: CommandName;
  policyMode: PolicyMode;
  execution: ExecutionOutput;
}): VerificationOutput {
  const checks: string[] = [];
  const failures: string[] = [];

  for (const heading of requiredHeadings) {
    if (!input.outputText.includes(heading)) {
      failures.push(`Missing required heading: ${heading}`);
    } else {
      checks.push(`Heading present: ${heading}`);
    }
  }

  failures.push(...verifyEvidenceMarkers(input.outputText, input.execution));

  if (input.command === 'followup') {
    const wordLimitFailures = verifyFollowupWordLimits(input.outputText);
    if (wordLimitFailures.length === 0) {
      checks.push('Follow-up messages respect <=60 word limit.');
    }
    failures.push(...wordLimitFailures);
  }

  failures.push(...verifyDraftOnlyPolicy(input.policyMode, input.execution));

  if (input.policyMode === 'DRAFT_ONLY' && input.execution.drafts.length > 0) {
    checks.push('Side-effect intents were converted into draft artifacts.');
  }

  return {
    pass: failures.length === 0,
    checks,
    failures
  };
}
