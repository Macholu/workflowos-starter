import { defaultWorkflows } from './defaultWorkflows';
import type { CommandName, WorkflowSpec } from './schema';

export class WorkflowRegistry {
  private readonly workflows: Map<CommandName, WorkflowSpec>;

  constructor(workflows: WorkflowSpec[] = defaultWorkflows) {
    this.workflows = new Map(workflows.map((workflow) => [workflow.command, workflow]));
  }

  get(command: CommandName): WorkflowSpec {
    const workflow = this.workflows.get(command);
    if (!workflow) {
      throw new Error(`Workflow not found for command: ${command}`);
    }
    return workflow;
  }

  list(): WorkflowSpec[] {
    return [...this.workflows.values()];
  }
}
