import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderFollowup: CommandRenderer = (context) => {
  const contextLine = extractIntent(
    context.rawInput,
    'followup',
    'Confirm interest and align on a concrete next step.'
  );

  return {
    bestNextStep: 'Send Follow-up 1 first, then sequence bumps every 2-3 business days if no reply.',
    plan: [
      'Tailor placeholders to recipient and context.',
      'Send followups in sequence, then bumps, then breakup.',
      'Track replies and stop sequence on response.',
      'Escalate only with new value, not pressure.'
    ],
    deliverables: [
      `Context: ${contextLine}`,
      'F1: Quick follow-up on this. If it is still relevant, can you share your preferred next step by Friday?',
      'F2: Circling back with a short check-in. Would next Tuesday or Wednesday work for a 15-minute decision call?',
      'F3: I drafted two options to make this easier. Can you reply with A or B so I can proceed correctly?',
      'F4: Sharing one concise update that may help your review. Can you confirm whether this stays in scope?',
      'F5: Final standard follow-up before I close my queue. Do you want me to keep this active this month?',
      'B1: Friendly bump in case this got buried. Can you reply with yes/no on moving forward?',
      'B2: One more bump with a quick choice: proceed now, revisit later, or close? A one-word reply works.',
      'BR: I will close this thread for now to keep things tidy. If priorities shift, reply anytime and I can restart.'
    ],
    qa: [
      'Confirmed 5 followups + 2 bumps + 1 breakup are present.',
      'All messages are concise, CTA-based, and non-guilt framing.'
    ],
    nextActions: [
      'Personalize recipient name and context line.',
      'Use DRAFT_ONLY artifacts for any send intent.',
      'Schedule sequence cadence in CRM or task manager.'
    ]
  };
};
