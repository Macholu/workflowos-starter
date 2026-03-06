import type { DraftArtifact, DraftPayload, ExecutionPlan } from '@workflowos/core';

export type { DraftArtifact, DraftPayload, ExecutionPlan };

export function summarizeDraftArtifact(artifact: DraftArtifact): string {
  return [
    `connector=${artifact.connector}`,
    `action=${artifact.payload.action}`,
    `target=${artifact.payload.target}`
  ].join(' ');
}
