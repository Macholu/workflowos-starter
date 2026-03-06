import type { ApprovalRecord, SideEffectPolicy } from '@workflowos/core';
import type { PolicyMode } from '@workflowos/core';

export class PolicyEngine implements SideEffectPolicy {
  readonly mode: PolicyMode;

  constructor(mode: PolicyMode = 'DRAFT_ONLY') {
    this.mode = mode;
  }

  assertCanExecute(action: string, approval?: ApprovalRecord): void {
    if (this.mode === 'DRAFT_ONLY') {
      throw new Error(`DRAFT_ONLY enforced: action blocked (${action})`);
    }

    if (!approval || !approval.approved) {
      throw new Error(`APPROVAL_REQUIRED enforced: missing approval for ${action}`);
    }
  }

  isDraftOnly(): boolean {
    return this.mode === 'DRAFT_ONLY';
  }
}
