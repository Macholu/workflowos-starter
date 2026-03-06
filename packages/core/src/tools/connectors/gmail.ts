import type { DraftArtifact } from '../../agent/types';
import type { ApprovalRecord, SideEffectPolicy } from '../toolRegistry';

export class GmailConnector {
  constructor(private readonly policy: SideEffectPolicy) {}

  createSendDraft(input: {
    to: string;
    subject: string;
    body: string;
    objective: string;
  }): DraftArtifact {
    return {
      type: 'DraftPayload',
      connector: 'gmail',
      payload: {
        action: 'send_email',
        target: input.to,
        content: `To: ${input.to}\nSubject: ${input.subject}\n\n${input.body}`,
        serializedRequest: {
          to: input.to,
          subject: input.subject,
          body: input.body
        }
      },
      executionPlan: {
        manualSteps: [
          'Review draft content and recipient list.',
          'Copy payload into your email client or API request.',
          'Run in APPROVAL_REQUIRED mode with an approval record when ready.'
        ],
        approvalPath: [
          'Create approval object with approver and reason.',
          'Switch policy_mode to APPROVAL_REQUIRED.',
          'Execute connector call with explicit approval payload.'
        ],
        futureConnectorCall: {
          connector: 'gmail',
          action: 'send_email',
          request: {
            to: input.to,
            subject: input.subject,
            body: input.body,
            objective: input.objective
          }
        }
      },
      riskNotes: [
        'Recipient accuracy must be verified manually.',
        'Message tone should be checked for legal/commercial fit before send.',
        'No external side effect was executed in DRAFT_ONLY.'
      ]
    };
  }

  executeSend(input: {
    to: string;
    subject: string;
    body: string;
  }, approval?: ApprovalRecord): { status: string; request: Record<string, string> } {
    this.policy.assertCanExecute('gmail.send_email', approval);
    return {
      status: 'executed',
      request: {
        to: input.to,
        subject: input.subject,
        body: input.body
      }
    };
  }
}
