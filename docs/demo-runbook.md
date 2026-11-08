# Brewprint: Copilot Everywhere, live

[Public repository](https://github.com/cinnamon-msft/brewprint).
Start every independent feature from **demo-start**, not another feature
branch. The starter is already a working gallery/manual builder, so each
demo produces a genuine new audience-visible capability.

## Real issues

| Surface | Issue | Visible result | Dependency |
| --- | --- | --- | --- |
| CLI | [Scale predefined recipes](https://github.com/cinnamon-msft/brewprint/issues/8) | A 237mL latte with conserved rounded amounts | None |
| Visual Studio | [Shots and milk](https://github.com/cinnamon-msft/brewprint/issues/2) | Two-shot oat latte; reject four-shot flat white | None |
| VS Code | [Ingredient filtering](https://github.com/cinnamon-msft/brewprint/issues/3) | Three milk drinks; useful no-match state | None |
| Cloud | [Compare drinks](https://github.com/cinnamon-msft/brewprint/issues/9) | Aligned latte/cappuccino diagrams and differences | None |

Optional: [base-drink URL](https://github.com/cinnamon-msft/brewprint/issues/4),
[print card](https://github.com/cinnamon-msft/brewprint/issues/6),
[themes](https://github.com/cinnamon-msft/brewprint/issues/5),
[text-first mode](https://github.com/cinnamon-msft/brewprint/issues/1),
[rounding tests](https://github.com/cinnamon-msft/brewprint/issues/10)
(depends on scaling), [favorites](https://github.com/cinnamon-msft/brewprint/issues/7).
Keep all ten OPEN in preparation. Do not run two seeders concurrently.

## Before the room opens

1. Use the README's clean setup/build/test commands. Restore packages and
   download Chromium before traveling. Confirm .NET 10, Node 24 LTS, Git,
   GitHub CLI, Copilot CLI and each editor's Copilot authentication.
2. Visual Studio must be 2026/18.0+ with ASP.NET workload. It was **not
   installed on the preparation host**; the real editor workflow must be
   checked on the presenter machine. Test VS Code/CLI logins there too.
3. Open the production starter on localhost:5080 and show six house drinks.
   Drag espresso/milk/foam, use keyboard Add, undo/remove/reset, load a
   recipe, browse without replacing it, then demonstrate overflow rejection.
4. Use browser zoom and a projector resolution before the audience arrives.
   Body text is 18px, small text 16px; original SVG scales without remote
   fonts/images. Scroll to the workbench when demonstrating the builder.
5. Check cloud assignment on the **actual account and repository**. Having
   a setup workflow or Copilot CLI entitlement is not sufficient. In the
   issue assignee menu, confirm Copilot is offered, repository agent access
   is enabled, billing/policies permit a run, and Actions can execute.
   At preparation time, REST assignable users listed only `cinnamon-msft`,
   not a Copilot agent; availability is **not verified**. Do not claim a
   live cloud launch until the UI check succeeds. No preparation agent task
   or PR has been started.

## Audience sequence (about 50 minutes; leave buffer)

| Time | Action | What to narrate |
| --- | --- | --- |
| 0-6 | Show the working vintage coffee bar and manual cup | A useful baseline, not an intentionally broken app |
| 6-9 | Launch cloud comparison from its issue if enabled | Issue + repo instructions + tests are durable context; agent runs asynchronously |
| 9-19 | CLI scaling from an independent starter checkout | Inspect, specify boundaries, implement, run tests, inspect diff |
| 19-29 | VS Code gallery filter from a fresh starter checkout | UI iteration with running preview, keyboard/empty-state tests |
| 29-40 | Visual Studio shots/milk from a fresh starter checkout | C# validation plus a complete small UI, not just a backend helper |
| 40-47 | Review cloud output, tests, diff and browser result | Human review before any merge; local demos do not depend on it |
| 47-50 | Explain context handoffs, recovery and recap | Same repo/issue/test loop across surfaces; not magic shared editor chats |

If cloud is slow, review it later and demonstrate a **clearly labeled local
comparison rehearsal checkpoint**. If unavailable, state that directly;
show issue delegation/setup and local recovery, not a pretend cloud result.

## Surface prompts

Open the referenced issue, copy its acceptance criteria and start with:

> Implement this issue from demo-start. Read AGENTS.md,
> .github/copilot-instructions.md and DESIGN.md. Preserve the fixed 360mL
> manual builder. Include the complete UI and tests. Run the repository's
> relevant checks, then show the diff and remaining uncertainty.

- **CLI:** invoke the installed Copilot CLI in the scaling checkout. Show
  repository inspection, a concrete rounding test and the 237mL result.
- **VS Code:** open the filtering checkout, let Copilot edit the UI and test
  the AND filters with keyboard. Explain why empty state is part of done.
- **Visual Studio:** open `Brewprint.sln` in the shots checkout, focus on C#
  rules/invalid requests, then show the companion UI in the browser.
- **Cloud:** assign the comparison issue through GitHub's actual supported
  agent UI. Review its proposed branch/PR and CI when it finishes. Do not
  auto-merge or close preparation issues.

No automatic cross-editor conversation transfer is assumed. Carry the
**issue URL, branch/commit, acceptance decisions, changed files, commands and
failures**. If you intentionally continue one feature in another surface,
open the same checkout/branch and paste this small handoff:

```text
Issue: <real URL>
Branch/commit: <actual value>
Implemented: <bounded summary>
Checks: <commands and outcomes>
Next: <one concrete remaining step>
Constraints: predefined recipes only; manual builder unchanged
```

## Isolated live work and recovery

Create fresh worktrees in your own presenter checkout (native path separators):

```powershell
git fetch origin --tags
git worktree add -b live-cli ..\brewprint-live-cli demo-start
git worktree add -b live-vscode ..\brewprint-live-vscode demo-start
git worktree add -b live-vs ..\brewprint-live-vs demo-start
```

Only one preview uses 5080/5173 at a time. Stop its own terminal process
before launching another. Tests use 5083/5183; do not run parallel browser
suites against those ports. Never reset a dirty/shared checkout to recover.
Save the live work with a commit or leave its worktree intact, then open a
separate recovery worktree:

```powershell
git worktree add ..\brewprint-recovery origin/rehearsal/cli-scaling
```

Recovery branch names reserved for isolated tested preparation slices:
`rehearsal/cli-scaling`, `rehearsal/vs-shots-milk`,
`rehearsal/vscode-filter`, `rehearsal/cloud-compare`.
See [the rehearsal report](rehearsal-report.md) for actual commit hashes,
scope and verification status. These are **not** merged into `main`.

## Checks after each change

From root: `dotnet test Brewprint.sln`. From `src/Brewprint.Web`:
`npm run build`, `npm test`, `npm run test:e2e`.
For production: build frontend, publish API, change into publish directory
and launch per README. Confirm the new feature, unchanged builder and errors.
Inspect the diff and test output before explaining success.

## Safe contingency

- API down: show explicit error/retry and the still-working manual builder;
  restart only the relevant backend terminal.
- Broken edit: preserve it, move to an isolated known checkpoint and state
  which part was pre-rehearsed. Never present recovery code as a fresh agent run.
- Network lost: starter/rehearsal run locally after dependency restore.
  Cloud delegation/review needs network and must be called unavailable.
- Test failure: show it and fix it; trim optional content, not validation.
- Cloud review: keep preparation issues open; no unrequested PR/merge from
  this preparation session.
