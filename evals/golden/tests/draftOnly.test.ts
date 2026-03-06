import { describe, expect, test } from 'vitest';
import { createDatabase, ToolRegistry } from '@workflowos/core';
import { PolicyEngine } from '../../../apps/workflowos-cli/src/runtime/policy';
import { runLoop } from '../../../apps/workflowos-cli/src/runtime/runLoop';

function cfg(name: string) {
  return {
    policyMode: 'DRAFT_ONLY' as const,
    dbPath: `.workflowos/test-${name}.db`,
    logLevel: 'silent',
    cwd: process.cwd(),
    enableModelPlanner: false
  };
}

describe('DRAFT_ONLY policy enforcement', () => {
  test('connector execute is blocked in DRAFT_ONLY', () => {
    const policy = new PolicyEngine('DRAFT_ONLY');
    const tools = new ToolRegistry({
      policyMode: 'DRAFT_ONLY',
      sideEffectPolicy: policy
    });

    expect(() =>
      tools.gmail.executeSend({
        to: 'test@example.com',
        subject: 'Subject',
        body: 'Body'
      })
    ).toThrow(/DRAFT_ONLY/);
  });

  test('side-effect requests become DraftPayload artifacts instead of execution', async () => {
    const { result } = await runLoop('/followup send email to test@example.com', cfg('draft-artifact'));

    expect(result.execution.drafts.length).toBeGreaterThan(0);
    expect(result.execution.drafts[0]?.type).toBe('DraftPayload');
    expect(result.execution.drafts[0]?.payload.action).toBe('send_email');
    expect(result.outputText).toContain('DraftArtifact:');
    expect(result.outputText).not.toContain('Execution note: Executed approved');
  });

  test('APPROVAL_REQUIRED without approval object still drafts side effects', async () => {
    const { result } = await runLoop('/followup send email to test@example.com', {
      policyMode: 'APPROVAL_REQUIRED',
      dbPath: '.workflowos/test-approval-missing.db',
      logLevel: 'silent',
      cwd: process.cwd(),
      enableModelPlanner: false,
      executeApprovedSideEffects: true
    });

    expect(result.execution.drafts.length).toBeGreaterThan(0);
    expect(result.outputText).toContain('actions remained draft-only');
  });

  test('APPROVAL_REQUIRED with approval can execute connector path', async () => {
    const dbPath = '.workflowos/test-approval-used.db';
    const { result } = await runLoop('/followup send email to test@example.com', {
      policyMode: 'APPROVAL_REQUIRED',
      dbPath,
      logLevel: 'silent',
      cwd: process.cwd(),
      enableModelPlanner: false,
      executeApprovedSideEffects: true,
      approvalRecord: {
        approved: true,
        approver: 'qa-user',
        reason: 'validated send path'
      }
    });

    expect(result.execution.drafts.length).toBe(0);
    expect(result.outputText).toContain('Execution note: Executed approved email action via gmail connector.');

    const db = createDatabase(dbPath);
    const count = db.prepare('SELECT COUNT(*) AS count FROM approvals').get() as { count: number };
    expect(count.count).toBeGreaterThan(0);
    db.close();
  });
});
