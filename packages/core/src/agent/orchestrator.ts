import OpenAI from 'openai';
import type { WorkflowSpec } from '../workflows/schema';
import type { PlannerOutput } from './types';

export interface OpenAIPlannerInput {
  workflow: WorkflowSpec;
  rawInput: string;
}

/**
 * Responses API wrapper following an agent-style planner interface.
 * Falls back to local planning when API key is absent or parsing fails.
 */
export class OpenAIPlannerOrchestrator {
  private readonly client: OpenAI | null;

  constructor(apiKey?: string) {
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  async plan(input: OpenAIPlannerInput): Promise<PlannerOutput | null> {
    if (!this.client) {
      return null;
    }

    const response = await this.client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'Return strict JSON with keys: assumptions (string[]), steps ({id,title,description,tool,requiresSideEffect}[]), selectedTools (string[]).'
        },
        {
          role: 'user',
          content: `Command: /${input.workflow.command}\nInput: ${input.rawInput}\nConstraints: ${JSON.stringify(
            input.workflow.constraints
          )}`
        }
      ]
    });

    const text = response.output_text;
    if (!text) {
      return null;
    }

    try {
      const parsed = JSON.parse(text) as PlannerOutput;
      if (!Array.isArray(parsed.steps) || !Array.isArray(parsed.assumptions)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
