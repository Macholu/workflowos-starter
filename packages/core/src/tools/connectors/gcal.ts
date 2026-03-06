import type { DraftArtifact } from '../../agent/types';
import type { ApprovalRecord, SideEffectPolicy } from '../toolRegistry';

export class GCalConnector {
  constructor(private readonly policy: SideEffectPolicy) {}

  createEventDraft(input: {
    attendees: string[];
    title: string;
    when: string;
    notes: string;
  }): DraftArtifact {
    return {
      type: 'DraftPayload',
      connector: 'gcal',
      payload: {
        action: 'create_calendar_event',
        target: input.attendees.join(', '),
        content: `Title: ${input.title}\nWhen: ${input.when}\nAttendees: ${input.attendees.join(', ')}\nNotes: ${input.notes}`,
        serializedRequest: {
          attendees: input.attendees,
          title: input.title,
          when: input.when,
          notes: input.notes
        }
      },
      executionPlan: {
        manualSteps: [
          'Validate attendees and time zone.',
          'Create event manually in calendar or API console.',
          'Optionally run under APPROVAL_REQUIRED mode with approval metadata.'
        ],
        approvalPath: [
          'Provide explicit approver and reason.',
          'Switch to APPROVAL_REQUIRED.',
          'Call executeCreateEvent with approval object.'
        ],
        futureConnectorCall: {
          connector: 'gcal',
          action: 'create_calendar_event',
          request: {
            attendees: input.attendees,
            title: input.title,
            when: input.when,
            notes: input.notes
          }
        }
      },
      riskNotes: [
        'Incorrect attendee list can leak sensitive context.',
        'Time zone mismatch risk if when field is ambiguous.',
        'No event was created in DRAFT_ONLY.'
      ]
    };
  }

  executeCreateEvent(input: {
    attendees: string[];
    title: string;
    when: string;
    notes: string;
  }, approval?: ApprovalRecord): { status: string; request: Record<string, unknown> } {
    this.policy.assertCanExecute('gcal.create_event', approval);
    return {
      status: 'executed',
      request: {
        attendees: input.attendees,
        title: input.title,
        when: input.when,
        notes: input.notes
      }
    };
  }
}
