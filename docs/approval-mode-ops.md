# Approval Mode Operations Runbook

This runbook covers secure operation of `APPROVAL_REQUIRED` mode for Workflow OS.

## Scope

- Connector currently supported for execution: Gmail (`GMAIL_API` mode)
- Policy modes:
  - `DRAFT_ONLY` (default, no side effects)
  - `APPROVAL_REQUIRED` (explicit approval required)

## Required Secrets

Set these as environment variables in your runtime environment (never commit them):

- `WORKFLOWOS_GMAIL_EXECUTION_MODE=GMAIL_API`
- `WORKFLOWOS_GMAIL_ACCESS_TOKEN=<short-lived OAuth token>`
- `WORKFLOWOS_GMAIL_FROM=<approved sender email>`
- `WORKFLOWOS_GMAIL_USER_ID=me`

## Safe Enablement Procedure

1. Keep `policy_mode: DRAFT_ONLY` in `config/config.yaml` for normal operation.
2. Switch to `APPROVAL_REQUIRED` only for approved execution windows.
3. Require explicit runtime approval metadata (`approver`, `reason`) for each run.
4. Verify output includes execution notes and artifact logging in SQLite (`approvals` table).

## Token Rotation Policy

1. Use short-lived OAuth access tokens.
2. Rotate tokens on a fixed schedule (recommended: every 7 days) or immediately after suspected exposure.
3. After rotation, run a dry test in `DRAFT_ONLY` and then one controlled `APPROVAL_REQUIRED` execution.
4. Record rotation date, approver, and operator in your internal audit log.

## Revocation Procedure

Trigger immediate revocation when:

- token appears in logs/chat/history
- unknown sender behavior is detected
- device/workstation compromise is suspected

Steps:

1. Revoke OAuth token from Google Cloud / account security controls.
2. Remove old token from all environments and CI secrets.
3. Generate a new token and re-test with `DRAFT_ONLY` first.
4. Re-enable `APPROVAL_REQUIRED` executions only after validation.

## Incident Response Checklist

- Freeze side-effect execution by forcing `policy_mode: DRAFT_ONLY`
- Revoke and rotate tokens
- Review recent `runs`, `artifacts`, and `approvals` records
- Open an incident issue with timeline and remediation actions

## Minimum Operational Controls

- Keep branch protection enabled on `main`
- Require CI (`build-test-lint`) before merge
- Require at least one human approval for production PRs
- Keep `delete_branch_on_merge` enabled
