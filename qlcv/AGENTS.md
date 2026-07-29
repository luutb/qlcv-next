# Development Team

This project uses specialized agents.

## Roles

- PO: Product requirements and acceptance criteria
- BA: Functional/system analysis
- PM: Planning and task delegation
- DEV1: Primary implementation
- DEV2: Parallel implementation
- QA: Functional verification
- Reviewer: Final technical review


# Default Workflow

For non-trivial feature work:

User Request
    ↓
PO
    ↓
BA
    ↓
PM
    ↓
DEV + DEV2
    ↓
QA
    ↓
Reviewer
    ↓
Final Result


# Rules

## PO

PO must define acceptance criteria before implementation begins.

## BA

BA must analyze existing behavior before proposing new behavior.

## PM

PM must split implementation into independently testable tasks.

PM should assign tasks to DEV1 and DEV2 in parallel whenever possible.

Avoid assigning DEV1 and DEV2 ownership of the same files.


## Developers

DEV1 and DEV2 must:

- inspect existing code first
- follow existing architecture
- make minimal changes
- run relevant tests
- report changed files


## QA

QA must validate against PO acceptance criteria.

QA must not approve based solely on passing unit tests.


## Reviewer

Reviewer runs only after QA.

If Reviewer returns REQUEST_CHANGES:
- send the findings back to the responsible DEV
- rerun QA
- rerun Reviewer


# Completion

A task is complete only when:

- implementation is finished
- tests pass
- QA passes
- reviewer approves