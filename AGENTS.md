<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project multi-agent workflow

Project-scoped custom agents are defined in `.codex/agents/` and map to the Stories in `docs/BACKLOG.md`:

- `repo_stabilizer`: ST-01
- `core_types`: ST-02
- `api_services`: ST-03
- `qa_platform`: ST-04 and ST-05
- `auth_security`: ST-06 and ST-07
- `core_features`: ST-08 through ST-10
- `admin_features`: ST-11 through ST-14
- `ux_accessibility`: ST-15 and ST-16
- `release_qa`: ST-17 and ST-18
- `qa_reviewer`: independent Issue, Task, and Story quality gates
- `po_reviewer`: final Story-level product acceptance after QA passes

When the user requests delegation or parallel agent work:

- The primary agent remains the coordinator and integrator.
- Assign exact Story, Task, or Issue IDs and explicit file boundaries to every subagent.
- Do not run workspace-write agents concurrently on overlapping files.
- Complete or explicitly waive ST-01 before parallel write-heavy work.
- Prefer parallel read-only investigation before parallel implementation.
- Require every subagent to preserve existing user changes and report changed files, verification commands, remaining blockers, and completed Issue IDs.
- The primary agent reviews subagent output and runs integration-level checks before marking backlog items complete.

## Branch workflow

- `main` is the production branch.
- `develop` is the integration branch and the base for new Story branches.
- Create one Story branch from `develop` using `story/st-xx-short-name`.
- Keep Issue work as focused commits on the Story branch by default, using an `IS-xx.y.z: summary` commit subject.
- Create a Task branch using `task/tk-xx-y-short-name` from its Story branch only when the Task must be developed independently or in parallel.
- Merge Task branches back into their Story branch; merge a Story branch into `develop` only after all review gates pass.
- Never create hundreds of permanent Issue branches. Use an Issue branch only when isolation is materially required.
- Do not push, merge, rebase, delete a branch, or open/modify a pull request unless the active user request authorizes that external or Git state change.

## Review gates

Implementation agents may not review their own work. The primary agent must delegate reviews as follows when agents are available:

1. **Issue gate:** after an Issue implementation and focused checks complete, call `qa_reviewer` with the Issue acceptance checklist from `docs/BACKLOG.md`. Mark the Issue checkbox complete only on `PASS` and record evidence in `docs/reviews/ST-xx.md`.
2. **Task gate:** after all child Issues pass, call `qa_reviewer` with the Task acceptance checklist for integration and regression review. Record Task `PASS` only in `docs/reviews/ST-xx.md`.
3. **Story QA gate:** after all child Tasks pass, call `qa_reviewer` with the Story checklist and Story acceptance criteria. Continue only on `PASS` recorded in the review file.
4. **Story PO gate:** after Story QA passes, call `po_reviewer` for final business acceptance. A Story is complete only on `ACCEPT` recorded in the review file.

On `FAIL`, `REJECT`, or `BLOCKED`, route findings back to the appropriate implementation agent, keep the backlog item open, and repeat the same review gate after fixes. The primary agent records verdicts and evidence using `docs/reviews/README.md` before updating an Issue checkbox in `docs/BACKLOG.md`.

Until ST-05 receives Story QA `PASS`, use the documented baseline and require scoped checks with no new regressions. After ST-05 passes, require lint, typecheck, test, and build to be green for every implementation change.
