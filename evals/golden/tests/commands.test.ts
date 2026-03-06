import { describe, expect, test } from 'vitest';
import { runLoop } from '../../../apps/workflowos-cli/src/runtime/runLoop';

function cfg(name: string) {
  return {
    policyMode: 'DRAFT_ONLY' as const,
    dbPath: `.workflowos/test-${name}.db`,
    logLevel: 'silent',
    cwd: process.cwd(),
    enableModelPlanner: false,
    webSearchProvider: 'MOCK' as const
  };
}

describe('command golden checks', () => {
  test('/followup respects required count and <=60 word limit', async () => {
    const { result } = await runLoop('/followup pending contract review', cfg('followup'));

    const messageLines = result.outputText
      .split('\n')
      .map((line) => line.trim())
      .map((line) => line.replace(/^-+\s*/, ''))
      .filter((line) => /^(F\d|B\d|BR):/.test(line));

    expect(messageLines).toHaveLength(8);

    for (const line of messageLines) {
      const message = line.split(':').slice(1).join(':').trim();
      const wordCount = message.split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeLessThanOrEqual(60);
    }
  });

  test('/promptpack returns 3 shot prompts plus negatives and knobs', async () => {
    const { result } = await runLoop('/promptpack Night Runner IMAX chase', cfg('promptpack'));

    expect(result.outputText).toContain('WIDE:');
    expect(result.outputText).toContain('MEDIUM:');
    expect(result.outputText).toContain('CLOSE:');
    expect(result.outputText).toContain('NEGATIVES:');
    expect(result.outputText).toContain('ITERATION_KNOBS:');
  });

  test('/audit returns exactly 5 bottlenecks', async () => {
    const { result } = await runLoop('/audit sales pipeline ops', cfg('audit'));

    const bottlenecks = result.outputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes('Bottleneck '));

    expect(bottlenecks).toHaveLength(5);
  });

  test('/research surfaces webSearch evidence marker with configured provider', async () => {
    const { result } = await runLoop('/research pipeline quality metrics', cfg('research'));

    expect(result.outputText).toContain('EVIDENCE(webSearch):');
    expect(result.outputText).toContain('provider=MOCK');
  });
});
