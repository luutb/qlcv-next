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

When the user requests delegation or parallel agent work:

- The primary agent remains the coordinator and integrator.
- Assign exact Story, Task, or Issue IDs and explicit file boundaries to every subagent.
- Do not run workspace-write agents concurrently on overlapping files.
- Complete or explicitly waive ST-01 before parallel write-heavy work.
- Prefer parallel read-only investigation before parallel implementation.
- Require every subagent to preserve existing user changes and report changed files, verification commands, remaining blockers, and completed Issue IDs.
- The primary agent reviews subagent output and runs integration-level checks before marking backlog items complete.
