export interface ComputerUseResult {
  summary: string;
  steps: string[];
}

export async function computerUse(task: string): Promise<ComputerUseResult> {
  return {
    summary: `computerUse is stubbed. Task captured but not executed: ${task}`,
    steps: [
      'Capture task intent',
      'Map required UI actions',
      'Return draft-only recommendation'
    ]
  };
}
