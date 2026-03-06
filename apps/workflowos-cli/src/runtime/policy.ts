import type { ApprovalRecord, SideEffectPolicy } from '@workflowos/core';
import type { PolicyMode } from '@workflowos/core';

interface PolicyEngineOptions {
  approverAllowlist?: string[];
}

export class PolicyEngine implements SideEffectPolicy {
  readonly mode: PolicyMode;
  private readonly approverAllowlist: Set<string>;

  constructor(mode: PolicyMode = 'DRAFT_ONLY', options: PolicyEngineOptions = {}) {
    this.mode = mode;
    this.approverAllowlist = new Set(options.approverAllowlist ?? []);
  }

  assertCanExecute(action: string, approval?: ApprovalRecord): void {
    if (this.mode === 'DRAFT_ONLY') {
      throw new Error(`DRAFT_ONLY enforced: action blocked (${action})`);
    }

    if (!approval || !approval.approved) {
      throw new Error(`APPROVAL_REQUIRED enforced: missing approval for ${action}`);
    }

    if (
      this.approverAllowlist.size > 0 &&
      !this.approverAllowlist.has(approval.approver)
    ) {
      throw new Error(`APPROVAL_REQUIRED enforced: approver not allowlisted (${approval.approver})`);
    }
  }

  isDraftOnly(): boolean {
    return this.mode === 'DRAFT_ONLY';
  }
}
