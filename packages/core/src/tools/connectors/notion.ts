import type { DraftArtifact } from '../../agent/types';
import type { ApprovalRecord, SideEffectPolicy } from '../toolRegistry';

export class NotionConnector {
  constructor(private readonly policy: SideEffectPolicy) {}

  createPatchDraft(input: {
    pageId: string;
    patch: string;
    rationale: string;
  }): DraftArtifact {
    return {
      type: 'DraftPayload',
      connector: 'notion',
      payload: {
        action: 'patch_page',
        target: input.pageId,
        content: `Page: ${input.pageId}\nPatch:\n${input.patch}\n\nRationale: ${input.rationale}`,
        serializedRequest: {
          page_id: input.pageId,
          patch: input.patch,
          rationale: input.rationale
        }
      },
      executionPlan: {
        manualSteps: [
          'Review patch text and affected sections.',
          'Apply patch manually in Notion UI or API.',
          'Use APPROVAL_REQUIRED mode to execute later with approval metadata.'
        ],
        approvalPath: [
          'Attach approval object including approver + reason.',
          'Switch policy_mode to APPROVAL_REQUIRED.',
          'Run executePatch with approval object.'
        ],
        futureConnectorCall: {
          connector: 'notion',
          action: 'patch_page',
          request: {
            pageId: input.pageId,
            patch: input.patch,
            rationale: input.rationale
          }
        }
      },
      riskNotes: [
        'Patch could overwrite critical docs if page id is wrong.',
        'Review for permissions and change control compliance.',
        'No external document edits were executed in DRAFT_ONLY.'
      ]
    };
  }

  executePatch(input: {
    pageId: string;
    patch: string;
    rationale: string;
  }, approval?: ApprovalRecord): { status: string; request: Record<string, unknown> } {
    this.policy.assertCanExecute('notion.patch_page', approval);
    return {
      status: 'executed',
      request: {
        pageId: input.pageId,
        patch: input.patch,
        rationale: input.rationale
      }
    };
  }
}
