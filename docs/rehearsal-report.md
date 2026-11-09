# Preparation evidence

Verified on **2026-11-08**. The public starter is commit
[`befbe46a407f4ec9d5f80e1c3f538b0f8b9b311b`](https://github.com/cinnamon-msft/brewprint/commit/befbe46a407f4ec9d5f80e1c3f538b0f8b9b311b),
tag **demo-start**. Later main commits only update rehearsal documentation
and the numerical example in seed definitions; starter source is unchanged.
The tag retains the original pre-rehearsal notes; this report on main is the
current preparation record.

## Starter evidence

Local toolchain: .NET **10.0.403**, Node **26.13.0**, npm **11.20.0**.
GitHub Actions also passed with Node **24** and .NET **10.0.x**.

| Check | Result |
| --- | --- |
| `dotnet test Brewprint.sln --configuration Release` | 9 passed |
| Frontend `npm run check` / `npm run build` | Strict TypeScript and production build passed |
| Frontend `npm test` | 24 passed |
| Chromium suite against published single-origin app | 8 passed |
| Clean clone of public `demo-start`: npm ci/build/tests, .NET tests/publish | Passed |
| Chromium suite against clean-clone published app, port 5084 | Same 8 scenarios passed |
| API health and production frontend assets | Served by ASP.NET from publish directory |
| Seed script, two consecutive real reruns | 10 existing each time; zero creations |
| GitHub issues | Exactly 10 OPEN (4 independent headline, 6 optional) |
| PRs created by preparation | None |

The eight browser scenarios cover six recipes and explicit load, independent
browsing, actual mouse drag/drop, keyboard Add and gallery selection, real
touch taps, skip-link focus, exact capacity and partial/full overflow rejection,
undo/removal/reset, memory-only reload, actual SVG height/y geometry, API
loading/503/malformed data/retry, desktop 1440px/mobile 390px width and reduced
motion. All six serving totals are independently checked through the API:
30, 180, 240, 180, 165, 240mL.

Screenshots were captured and visually inspected at desktop/mobile widths.
Their ignored local files are
`src/Brewprint.Web/test-results/bar-desktop.png` and `bar-mobile.png`.
The starter preview runs at `http://127.0.0.1:5080` from the published output.
Perceptual projector readability still requires the actual room/projector;
this preparation checks large text, contrast, responsive widths and zoomable SVG.

Successful workflows:
[starter CI](https://github.com/cinnamon-msft/brewprint/actions/runs/42537307065),
[Copilot setup steps](https://github.com/cinnamon-msft/brewprint/actions/runs/42537307077).
The setup file is at the cloud agent's recognized
`.github/workflows/copilot-setup-steps.yml`, with the required job name.

## Independent recovery checkpoints

Every checkpoint branches **directly from demo-start**. Each includes a complete
small UI slice, local API/frontend checks as applicable, and all eight unchanged
starter browser scenarios plus one feature scenario. Nothing was merged into
starter main, and no issue was closed.

| Branch | Commit | API tests | Frontend tests | Browser scenarios | CI |
| --- | --- | --- | --- | --- | --- |
| `rehearsal/cli-scaling` | [`2ac93b5`](https://github.com/cinnamon-msft/brewprint/commit/2ac93b5755373b4ac54872719defb3a8cc5d2304) | 27 | 24 | 9 | [Passed](https://github.com/cinnamon-msft/brewprint/actions/runs/42537986950) |
| `rehearsal/vs-shots-milk` | [`2633129`](https://github.com/cinnamon-msft/brewprint/commit/2633129a7f93146bfd24e9c71126b6df8f44fd3f) | 25 | 24 | 9 | [Passed](https://github.com/cinnamon-msft/brewprint/actions/runs/42537991584) |
| `rehearsal/vscode-filter` | [`4f1561c`](https://github.com/cinnamon-msft/brewprint/commit/4f1561ce1c559a7323401409388220f16354cfa1) | 9 | 26 | 9 | [Passed](https://github.com/cinnamon-msft/brewprint/actions/runs/42537994912) |
| `rehearsal/cloud-compare` | [`240667a`](https://github.com/cinnamon-msft/brewprint/commit/240667a2b03f04078c1897f632c47a6ac052f53b) | 9 | 26 | 9 | [Passed](https://github.com/cinnamon-msft/brewprint/actions/runs/42537998941) |

- Scaling: C# largest-remainder allocation, 60-480 whole mL, finite/bounds
  rejection, deterministic assembly-order ties, 237/480mL previews. Base
  recipe load and the manual builder remain unchanged. Current catalog
  ingredients never round to zero within these bounds; the UI names any
  zero layer explicitly.
- Shots/milk: C# rules for 1-4 shots, Whole/Oat/Soy labels, preserved serving
  and foam, espresso-only total exception, ineligible brewed coffee and
  insufficient-volume rejection. Two-shot oat latte is 240mL.
- Filtering: existing API data, native AND checkboxes, count, reset, useful
  empty state and selection reconciliation.
- Comparison: existing data, independent selections, equal diagram capacity,
  signed ingredient differences, zero missing amounts and same-drink handling.

Rehearsal corrected one **example**, not the approved rules: four shots fit a
165mL flat white (120 espresso + 30 milk + 15 foam), so it must be accepted.
Four shots in a 180mL cappuccino with 60mL foam leave zero steamed milk and
must reject. The actual issue and main seed/runbook wording now use cappuccino.

## Remaining surface/preflight limitations

These are tested **local implementation recovery slices**, not evidence of
four separate Copilot editor/CLI/cloud conversations. The actual presenter
workflow, logins, latency and audience timing must be rehearsed on that machine.
`Get-Command copilot,code` found neither command on this host's PATH; that
does not prove they are uninstalled, but their interactive surface workflows
were not exercised here.

**Visual Studio:** `vswhere -latest -format json` returned `[]`. No installed
Visual Studio was available to open the solution or exercise its Copilot UI.
Supported net10.0 editor work needs Visual Studio 2026/18.0+ with the ASP.NET
workload. C# builds/tests and the companion browser UI did pass here.

**Cloud assignment:** the Browser canvas opened the real comparison issue
but showed GitHub **Sign in / Sign up**, so the authenticated assignee/agent
controls could not be inspected. `gh` is authenticated with repository admin
access, but the REST assignable-user list contains only the owner and does
not establish cloud-agent entitlement. The setup workflow succeeded; an
actual cloud-agent run remains **unverified**, not claimed unavailable.
No cloud task or PR was launched, and no credentials were transferred into
the browser. Sign into GitHub on the presenter machine, verify the Copilot
assignee/policies/billing and launch the independent comparison early.
Use the explicitly labeled local checkpoint if cloud is unavailable or slow.
