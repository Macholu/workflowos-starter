# Self-Operating Workflow OS (Starter Repo)

Production-oriented TypeScript starter for a local **Self-Operating Workflow OS** with:

- OpenAI agent orchestration patterns (planner/executor/verifier + optional Responses API planner)
- Slash-command workflows (`/daily`, `/audit`, `/followup`, `/promptpack`, etc.)
- Prompt Factory (stable constants + command variables + negatives + iteration knobs)
- **Hard default policy gate: `DRAFT_ONLY`** (no external side-effects)

## Safety-First Policy

`DRAFT_ONLY` is the default and enforced in runtime code.

In `DRAFT_ONLY`:

- External side-effects are blocked at execution time.
- Connectors return draft artifacts only:
  - `DraftPayload`
  - `ExecutionPlan`
  - `RiskNotes`

`APPROVAL_REQUIRED` pathway is wired:

- Connector execute calls require explicit approval object.
- CLI can pass approval metadata and enable execution path.

## Monorepo Layout

- `apps/workflowos-cli`: CLI + runtime + command renderers
- `packages/core`: orchestration, tools, memory, observability, prompt factory
- `evals/golden`: reliability and policy golden tests
- `config`: `config.yaml` and `config.example.yaml`

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Build:

```bash
pnpm build
```

3. Run tests:

```bash
pnpm test
```

4. Run CLI once:

```bash
pnpm --filter @workflowos/cli dev -- "/daily Ship onboarding dashboard"
```

5. Start interactive mode:

```bash
pnpm --filter @workflowos/cli dev -- --repl
```

## Example Commands

```bash
workflowos "/daily hit Q2 launch milestone"
workflowos "/audit RevOps handoff latency"
workflowos "/followup send email to lead@example.com"
workflowos "/promptpack Night Runner IMAX alley chase"
workflowos "/continuity Night Runner pass 3"
workflowos "/followup send email to lead@example.com" --policy-mode APPROVAL_REQUIRED --execute-approved-side-effects --approve --approver "Ops Lead" --approval-reason "Reviewed and approved"
workflowos "/followup send email to lead@example.com" --policy-mode APPROVAL_REQUIRED --gmail-mode GMAIL_API --approver-allowlist "Ops Lead,Director"
```

## Approval Execution Flags

- `--policy-mode APPROVAL_REQUIRED`
- `--execute-approved-side-effects`
- `--approve`
- `--approver "<name>"`
- `--approval-reason "<reason>"`
- `--web-provider MOCK|WIKIPEDIA`
- `--gmail-mode STUB|GMAIL_API`
- `--approver-allowlist "NameA,NameB"`

## Deterministic Output Contract

Every run returns these top-level sections exactly:

- `A) Best Next Step`
- `B) Plan`
- `C) Deliverables`
- `D) QA / Verification`
- `E) Next Actions`

## Configuration

Edit `config/config.yaml`:

```yaml
policy_mode: DRAFT_ONLY
log_level: info
db_path: .workflowos/workflowos.db
enable_model_planner: false
execute_approved_side_effects: false
web_search_provider: MOCK
gmail_execution_mode: STUB
approver_allowlist: []
```

Environment overrides (optional):

- `WORKFLOWOS_POLICY_MODE`
- `WORKFLOWOS_DB_PATH`
- `WORKFLOWOS_LOG_LEVEL`
- `WORKFLOWOS_ENABLE_MODEL_PLANNER`
- `WORKFLOWOS_EXECUTE_APPROVED_SIDE_EFFECTS`
- `WORKFLOWOS_WEB_SEARCH_PROVIDER` (`MOCK` or `WIKIPEDIA`)
- `WORKFLOWOS_GMAIL_EXECUTION_MODE` (`STUB` or `GMAIL_API`)
- `WORKFLOWOS_APPROVER_ALLOWLIST` (comma-separated names)
- `WORKFLOWOS_GMAIL_ACCESS_TOKEN`, `WORKFLOWOS_GMAIL_FROM`, `WORKFLOWOS_GMAIL_USER_ID`

## Memory (SQLite)

On each run, data is stored in SQLite:

- `runs`
- `artifacts`
- `preferences`
- `approvals`
- `context_forever`

## Add a New Workflow

1. Add schema entry in `packages/core/src/workflows/defaultWorkflows.ts`
2. Add command renderer in `apps/workflowos-cli/src/commands/<name>.ts`
3. Register renderer in `apps/workflowos-cli/src/runtime/runLoop.ts`
4. Add golden checks in `evals/golden/tests`

## Roadmap

- Add additional production web providers beyond the built-in `WIKIPEDIA` provider.
- Replace `computerUse` stub with production integration.
- Add production APIs for calendar and notion connectors (gmail has GMAIL_API execution mode).
- Add richer evaluator suites and regression snapshots.
