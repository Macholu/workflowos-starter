import { fileSearch } from './fileSearch';
import { webSearch, type WebSearchProvider } from './webSearch';
import { computerUse } from './computerUse';
import { GmailConnector } from './connectors/gmail';
import { GCalConnector } from './connectors/gcal';
import { NotionConnector } from './connectors/notion';
import type { DraftArtifact, PolicyMode } from '../agent/types';

export interface ToolEvidence {
  tool: string;
  details: string;
  raw?: unknown;
}

export interface ToolRegistryOptions {
  cwd?: string;
  policyMode: PolicyMode;
  sideEffectPolicy?: SideEffectPolicy;
  webSearchProvider?: WebSearchProvider;
  gmailExecutionMode?: GmailExecutionMode;
  gmailApiConfig?: GmailApiConfig;
}

export interface ApprovalRecord {
  approved: boolean;
  approver: string;
  reason: string;
}

export type GmailExecutionMode = 'STUB' | 'GMAIL_API';

export interface GmailApiConfig {
  accessToken: string;
  from: string;
  userId?: string;
}

export interface SideEffectPolicy {
  mode: PolicyMode;
  assertCanExecute(action: string, approval?: ApprovalRecord): void;
}

export class DefaultSideEffectPolicy implements SideEffectPolicy {
  constructor(public readonly mode: PolicyMode) {}

  assertCanExecute(action: string, approval?: ApprovalRecord): void {
    if (this.mode === 'DRAFT_ONLY') {
      throw new Error(`DRAFT_ONLY policy blocks side-effect action: ${action}`);
    }

    if (!approval || !approval.approved) {
      throw new Error(`APPROVAL_REQUIRED policy requires explicit approval for action: ${action}`);
    }
  }
}

export class ToolRegistry {
  readonly policy: SideEffectPolicy;
  readonly gmail: GmailConnector;
  readonly gcal: GCalConnector;
  readonly notion: NotionConnector;
  readonly cwd: string;
  readonly webSearchProvider: WebSearchProvider;
  readonly gmailExecutionMode: GmailExecutionMode;

  constructor(options: ToolRegistryOptions) {
    this.cwd = options.cwd ?? process.cwd();
    this.webSearchProvider = options.webSearchProvider ?? 'MOCK';
    this.gmailExecutionMode = options.gmailExecutionMode ?? 'STUB';
    this.policy = options.sideEffectPolicy ?? new DefaultSideEffectPolicy(options.policyMode);
    this.gmail = new GmailConnector(this.policy, {
      mode: this.gmailExecutionMode,
      gmailApiConfig: options.gmailApiConfig
    });
    this.gcal = new GCalConnector(this.policy);
    this.notion = new NotionConnector(this.policy);
  }

  async runFileSearch(query: string): Promise<ToolEvidence> {
    const results = await fileSearch(query, this.cwd);
    return {
      tool: 'fileSearch',
      details: `Found ${results.length} local matches for \"${query}\"`,
      raw: results
    };
  }

  async runWebSearch(query: string): Promise<ToolEvidence> {
    const results = await webSearch(query, { provider: this.webSearchProvider });
    return {
      tool: 'webSearch',
      details: `Returned ${results.length} web results for \"${query}\" (provider=${this.webSearchProvider})`,
      raw: results
    };
  }

  async runComputerUse(task: string): Promise<ToolEvidence> {
    const result = await computerUse(task);
    return {
      tool: 'computerUse',
      details: result.summary,
      raw: result
    };
  }

  draftEmail(input: {
    to: string;
    subject: string;
    body: string;
    objective: string;
  }): DraftArtifact {
    return this.gmail.createSendDraft(input);
  }

  draftCalendarEvent(input: {
    attendees: string[];
    title: string;
    when: string;
    notes: string;
  }): DraftArtifact {
    return this.gcal.createEventDraft(input);
  }

  draftNotionPatch(input: {
    pageId: string;
    patch: string;
    rationale: string;
  }): DraftArtifact {
    return this.notion.createPatchDraft(input);
  }
}
