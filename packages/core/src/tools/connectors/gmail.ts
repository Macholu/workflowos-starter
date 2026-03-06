import type { DraftArtifact } from '../../agent/types';
import type {
  ApprovalRecord,
  GmailApiConfig,
  GmailExecutionMode,
  SideEffectPolicy
} from '../toolRegistry';

interface GmailConnectorOptions {
  mode: GmailExecutionMode;
  gmailApiConfig?: GmailApiConfig;
}

export class GmailConnector {
  constructor(
    private readonly policy: SideEffectPolicy,
    private readonly options: GmailConnectorOptions = { mode: 'STUB' }
  ) {}

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

  private getGmailApiConfig(): GmailApiConfig {
    if (!this.options.gmailApiConfig) {
      throw new Error('GMAIL_API mode is enabled but gmailApiConfig is missing.');
    }
    return this.options.gmailApiConfig;
  }

  async executeSend(
    input: {
      to: string;
      subject: string;
      body: string;
    },
    approval?: ApprovalRecord
  ): Promise<{ status: string; provider: string; request: Record<string, string>; messageId?: string }> {
    this.policy.assertCanExecute('gmail.send_email', approval);

    if (this.options.mode === 'STUB') {
      return {
        status: 'executed',
        provider: 'stub',
        request: {
          to: input.to,
          subject: input.subject,
          body: input.body
        }
      };
    }

    const gmailApi = this.getGmailApiConfig();
    const userId = gmailApi.userId ?? 'me';
    const rawMessage = [
      `From: ${gmailApi.from}`,
      `To: ${input.to}`,
      `Subject: ${input.subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      input.body
    ].join('\r\n');

    const encoded = Buffer.from(rawMessage).toString('base64url');
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gmailApi.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encoded })
      }
    );

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`Gmail API send failed: HTTP ${response.status} ${bodyText}`);
    }

    const payload = (await response.json()) as { id?: string };

    return {
      status: 'executed',
      provider: 'gmail_api',
      request: {
        to: input.to,
        subject: input.subject,
        body: input.body
      },
      messageId: payload.id
    };
  }
}
