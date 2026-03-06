import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { DraftArtifact, WorkflowRunResult } from '../agent/types';

export interface StoredRun {
  id: string;
  ts: string;
  mode: string;
  input: string;
  plan_json: string;
  output: string;
  trace_id: string;
  policy_mode: string;
}

export class MemoryRepository {
  constructor(private readonly db: Database.Database) {}

  saveRun(result: WorkflowRunResult, rawInput: string): string {
    const runId = randomUUID();
    const run: StoredRun = {
      id: runId,
      ts: new Date().toISOString(),
      mode: result.mode,
      input: rawInput,
      plan_json: JSON.stringify(result.plan),
      output: result.outputText,
      trace_id: result.traceId,
      policy_mode: result.policyMode
    };

    this.db
      .prepare(
        'INSERT INTO runs (id, ts, mode, input, plan_json, output, trace_id, policy_mode) VALUES (@id, @ts, @mode, @input, @plan_json, @output, @trace_id, @policy_mode)'
      )
      .run(run);

    return runId;
  }

  saveArtifact(runId: string, artifact: DraftArtifact): string {
    const artifactId = randomUUID();

    this.db
      .prepare(
        'INSERT INTO artifacts (id, run_id, type, content, created_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(
        artifactId,
        runId,
        artifact.type,
        artifact.payload.content,
        new Date().toISOString(),
        JSON.stringify({
          connector: artifact.connector,
          payload: artifact.payload,
          executionPlan: artifact.executionPlan,
          riskNotes: artifact.riskNotes
        })
      );

    return artifactId;
  }

  addContextForever(runId: string, entry: string): string {
    const id = randomUUID();
    this.db
      .prepare('INSERT INTO context_forever (id, run_id, entry, created_at) VALUES (?, ?, ?, ?)')
      .run(id, runId, entry, new Date().toISOString());
    return id;
  }

  setPreference(key: string, value: string): void {
    this.db
      .prepare(
        'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      )
      .run(key, value);
  }

  getPreference(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM preferences WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  }

  createApproval(runId: string, status: string, summary: string, payload: object): string {
    const id = randomUUID();
    this.db
      .prepare(
        'INSERT INTO approvals (id, run_id, status, summary, payload_json) VALUES (?, ?, ?, ?, ?)'
      )
      .run(id, runId, status, summary, JSON.stringify(payload));
    return id;
  }

  listArtifacts(runId: string): Array<{ id: string; type: string; content: string; metadata_json: string }> {
    return this.db
      .prepare('SELECT id, type, content, metadata_json FROM artifacts WHERE run_id = ? ORDER BY created_at ASC')
      .all(runId) as Array<{ id: string; type: string; content: string; metadata_json: string }>;
  }
}
