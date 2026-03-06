#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { Command } from 'commander';
import yaml from 'js-yaml';
import type { PolicyMode, WebSearchProvider } from '@workflowos/core';
import { runLoop, type RunLoopConfig } from './runtime/runLoop';

interface FileConfig {
  policy_mode?: PolicyMode;
  log_level?: string;
  db_path?: string;
  enable_model_planner?: boolean;
  execute_approved_side_effects?: boolean;
  web_search_provider?: WebSearchProvider;
}

function parseWebProvider(value: string | undefined): WebSearchProvider {
  if (!value) {
    return 'MOCK';
  }

  const normalized = value.toUpperCase();
  if (normalized === 'MOCK' || normalized === 'WIKIPEDIA') {
    return normalized;
  }

  return 'MOCK';
}

function loadConfigFile(configPath: string): FileConfig {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  const content = fs.readFileSync(configPath, 'utf8');
  return (yaml.load(content) as FileConfig) ?? {};
}

export function resolveRuntimeConfig(options: { configPath?: string; cwd?: string }): RunLoopConfig {
  const cwd = options.cwd ?? process.cwd();
  const defaultPath = path.resolve(cwd, 'config/config.yaml');
  const fallbackPath = path.resolve(cwd, 'config/config.example.yaml');
  const selectedPath = options.configPath ? path.resolve(cwd, options.configPath) : defaultPath;

  const fileConfig = fs.existsSync(selectedPath)
    ? loadConfigFile(selectedPath)
    : loadConfigFile(fallbackPath);

  const policyMode =
    (process.env.WORKFLOWOS_POLICY_MODE as PolicyMode | undefined) ??
    fileConfig.policy_mode ??
    'DRAFT_ONLY';

  const dbPath = process.env.WORKFLOWOS_DB_PATH ?? fileConfig.db_path ?? '.workflowos/workflowos.db';
  const logLevel = process.env.WORKFLOWOS_LOG_LEVEL ?? fileConfig.log_level ?? 'info';
  const enableModelPlanner =
    process.env.WORKFLOWOS_ENABLE_MODEL_PLANNER === 'true' ||
    fileConfig.enable_model_planner === true;
  const executeApprovedSideEffects =
    process.env.WORKFLOWOS_EXECUTE_APPROVED_SIDE_EFFECTS === 'true' ||
    fileConfig.execute_approved_side_effects === true;
  const webSearchProvider = parseWebProvider(
    process.env.WORKFLOWOS_WEB_SEARCH_PROVIDER ?? fileConfig.web_search_provider
  );

  return {
    policyMode,
    dbPath,
    logLevel,
    cwd,
    enableModelPlanner,
    executeApprovedSideEffects,
    webSearchProvider
  };
}

export async function runWorkflowInput(
  input: string,
  options: { configPath?: string; cwd?: string } = {}
): Promise<string> {
  const config = resolveRuntimeConfig(options);
  const { runId, result } = await runLoop(input, config);
  return `${result.outputText}\n\n[run_id=${runId}] [trace_id=${result.traceId}]`;
}

async function startRepl(config: RunLoopConfig): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'workflowos> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (trimmed === 'exit' || trimmed === 'quit' || trimmed === '/exit') {
      rl.close();
      return;
    }

    if (trimmed.length === 0) {
      rl.prompt();
      return;
    }

    try {
      const { runId, result } = await runLoop(trimmed, config);
      process.stdout.write(`${result.outputText}\n\n[run_id=${runId}] [trace_id=${result.traceId}]\n\n`);
    } catch (error) {
      process.stderr.write(`Error: ${(error as Error).message}\n`);
    }

    rl.prompt();
  });

  await new Promise<void>((resolve) => {
    rl.on('close', () => resolve());
  });
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('workflowos')
    .description('Self-Operating Workflow OS CLI')
    .argument('[input...]', 'command input, e.g. "/daily ship milestone plan"')
    .option('--repl', 'start interactive mode')
    .option('--config <path>', 'path to config yaml')
    .option('--policy-mode <mode>', 'override policy mode (DRAFT_ONLY|APPROVAL_REQUIRED)')
    .option('--web-provider <provider>', 'web search provider (MOCK|WIKIPEDIA)')
    .option('--execute-approved-side-effects', 'allow execution when explicit approval exists')
    .option('--approve', 'attach explicit approval object for this run')
    .option('--approver <name>', 'approval owner identity')
    .option('--approval-reason <reason>', 'approval justification')
    .action(
      async (
        inputParts: string[],
        opts: {
          repl?: boolean;
          config?: string;
          policyMode?: string;
          webProvider?: string;
          executeApprovedSideEffects?: boolean;
          approve?: boolean;
          approver?: string;
          approvalReason?: string;
        }
      ) => {
        const config = resolveRuntimeConfig({ configPath: opts.config });

        if (opts.policyMode) {
          const normalized = opts.policyMode.toUpperCase();
          if (normalized === 'DRAFT_ONLY' || normalized === 'APPROVAL_REQUIRED') {
            config.policyMode = normalized;
          }
        }

        if (opts.webProvider) {
          config.webSearchProvider = parseWebProvider(opts.webProvider);
        }

        if (opts.executeApprovedSideEffects) {
          config.executeApprovedSideEffects = true;
        }

        if (opts.approve) {
          config.approvalRecord = {
            approved: true,
            approver: opts.approver ?? 'cli-user',
            reason: opts.approvalReason ?? 'CLI explicit approval'
          };
        }

        if (opts.repl) {
          await startRepl(config);
          return;
        }

        const input = inputParts.join(' ').trim();
        if (!input) {
          throw new Error('Provide an input command string or use --repl.');
        }

        const { runId, result } = await runLoop(input, config);
        process.stdout.write(`${result.outputText}\n\n[run_id=${runId}] [trace_id=${result.traceId}]\n`);
      }
    );

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exitCode = 1;
  });
}
