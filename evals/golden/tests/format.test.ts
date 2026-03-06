import { describe, expect, test } from 'vitest';
import { runLoop } from '../../../apps/workflowos-cli/src/runtime/runLoop';

function testConfig(suffix: string) {
  return {
    policyMode: 'DRAFT_ONLY' as const,
    dbPath: `.workflowos/test-${suffix}.db`,
    logLevel: 'silent',
    cwd: process.cwd(),
    enableModelPlanner: false
  };
}

describe('format golden checks', () => {
  test('every run includes required top-level sections', async () => {
    const { result } = await runLoop('/daily ship onboarding checklist', testConfig('format'));

    expect(result.outputText).toContain('A) Best Next Step');
    expect(result.outputText).toContain('B) Plan');
    expect(result.outputText).toContain('C) Deliverables');
    expect(result.outputText).toContain('D) QA / Verification');
    expect(result.outputText).toContain('E) Next Actions');
  });
});
