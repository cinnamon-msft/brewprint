# Brewprint

**The illustrated espresso bar.** Explore six coffee classics and build a cup
from espresso, brewed coffee, water, steamed milk and foam. Original cutaway SVG
cup, an elegant dark walnut/ivory/burgundy/brass theme, and no accounts, database,
paid APIs or embedded AI.

Built for [GitHub Copilot Everywhere: CLI, VS Code, Visual Studio, and the Cloud](https://live360events.com/events/orlando-2026/sessions/wednesday/aiw02-github-copilot.aspx).
The working starter deliberately leaves four independent **predefined-recipe**
enhancements for the talk. See [the runbook](docs/demo-runbook.md).

## Prerequisites

- .NET 10 SDK. Tested locally with **10.0.403**. `global.json` accepts stable
  .NET 10 feature bands starting at 10.0.100.
- Node **24 LTS** recommended (22.12+ supported). Local validation used
  **26.13.0 / npm 11.20.0**; CI uses Node 24 and the committed lockfile.
- PowerShell 7 for the optional issue-seeding script; GitHub CLI authenticated
  with issue-write access only when seeding.
- Visual Studio **2026 / 18.0+**, with ASP.NET and web development workload,
  for supported `net10.0` editor work. VS 2022 cannot target this project.
  See Microsoft's [SDK/Visual Studio matrix](https://learn.microsoft.com/en-us/dotnet/core/porting/versioning-sdk-msbuild-vs).
  Visual Studio was not installed on the preparation host, so verify the
  presenter machine before the talk.

If Windows has Node at `C:\Program Files\nodejs` but not on PATH, use this
**current-shell-only** setting:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
```

## Development

From the repository root, in two terminals:

```powershell
dotnet run --project src\Brewprint.Api --no-launch-profile --urls http://127.0.0.1:5080
```

```powershell
Set-Location src\Brewprint.Web
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` to port 5080. On Linux/macOS
use native `/` path separators in commands.

## Single-origin production launch

From the root:

```powershell
npm --prefix src\Brewprint.Web ci
npm --prefix src\Brewprint.Web run build
dotnet publish src\Brewprint.Api --configuration Release --output artifacts\publish
Set-Location artifacts\publish
dotnet Brewprint.Api.dll --urls http://127.0.0.1:5080
```

Open **http://127.0.0.1:5080**. ASP.NET serves both the built React app and API.
Launch from the publish directory so the content root resolves its `wwwroot`.
Publishing without a frontend build fails explicitly. Output is ignored by Git.
No Node process is required after publishing; the .NET 10 runtime is.

API: `GET /api/recipes`, `GET /api/recipes/{id}`, `GET /api/health`.
Unknown API routes and drink IDs return JSON problem details, never the SPA.
The six immutable base servings are espresso 30, americano 180, latte 240,
cappuccino 180, flat white 165, and brewed coffee 240 mL.

## One cup, two ways to explore

The default dark experience centers one animated glass cup. Choose a drink
from the house menu below it to update its ingredient layers, description and
text breakdown. There are no repeated cup thumbnails. Ingredient callouts
identify each layer directly beside the glass. On narrow screens, callouts show names
while the text breakdown retains all amounts. Pours, glass highlights and
steam are decorative; reduced motion shows accurate final geometry
immediately. Pointer/touch selection brings an offscreen cup into view so the
updated drink is visible; keyboard selection retains focus on its menu button.

**Build your own** switches that same cup to your custom build and reveals the
ingredient tray. **House menu** or any drink choice returns to recipe viewing,
without overwriting the custom build. Switching back restores it.

## Build your cup

Drag an ingredient icon into the cup, or select the same labeled Add control
with pointer, keyboard or touch. The icon palette sits beside the cup on the
right, keeping the drag distance short and the layer labels unobstructed.
On narrow screens it moves above the cup. Fixed portions: espresso 30,
brewed coffee 60, water 60, steamed milk
30, foam 30 mL; capacity **360 mL**. Fill is the actual occupied fraction,
with unused space visible. Additions stack bottom-to-top in assembly order;
only adjacent matching layers merge visually. Undo removes the last whole
addition; Remove removes all occurrences of that ingredient; Reset empties it.

Browsing updates the recipe cup, never your custom build. **Use this recipe**
explicitly replaces the custom build and enters Build your own.
Overflow is announced and rejected without mutation. Builds remain in memory
and disappear on reload. Named layer breakdowns, SVG descriptions, visible
focus, native buttons, live feedback and reduced-motion support are baseline.

The builder recognizes house drinks by **ingredient proportions**, using the
loaded recipe API data. A smaller/larger serving or a different pouring order
can still match: 30mL each of espresso, milk and foam is a 90mL cappuccino.
Its name and description appear above the cup, with a live match announcement.
Missing or extra ingredients and changed ratios do not match; editing, undo,
removal and reset update the recognition immediately. Recognition does not
resize the cup or alter its contents. If recipes cannot load, the builder
still works and explicitly reports that recognition is unavailable.

**Educational disclaimer:** recipes vary by café. Foam is illustrative
occupied volume, not liquid-yield accuracy. This is a schematic, not fluid
simulation, a nutrition calculator or a barista specification.

## Validation

```powershell
dotnet test Brewprint.sln
npm --prefix src\Brewprint.Web run build
npm --prefix src\Brewprint.Web test
Set-Location src\Brewprint.Web
npx playwright install chromium
npm run test:e2e
```

Playwright starts and stops isolated API/Vite servers on ports 5083/5183.
Tests include real mouse drag/drop, keyboard controls, recipe load, exact
capacity/overflow, undo/removal/reset, API failure/retry, accurate SVG fill,
responsive widths and reduced motion. To run the same browser suite against
a separately launched published app:

```powershell
$env:BREWPRINT_E2E_URL = 'http://127.0.0.1:5080'
npm run test:e2e
```

CI runs .NET tests, TypeScript/build, frontend tests, Chromium and publishing.
The cloud agent's recognized setup file is
`.github/workflows/copilot-setup-steps.yml` (not `.github/copilot-setup-steps.yml`).
It restores .NET/Node dependencies and Chromium; having this file alone does
not prove the account can assign Copilot.

## Issues and demo baseline

Seed definitions are in [docs/issue-seeds.json](docs/issue-seeds.json).
The script supports dry run and matches stable markers **or exact titles**
across open/closed issues, preventing duplicate replacements:

```powershell
.\scripts\seed-issues.ps1 -DryRun
.\scripts\seed-issues.ps1
.\scripts\seed-issues.ps1  # all existing, no new issues
```

Do not run two seeders concurrently. The four headline issues are independent
from `demo-start`; only awkward-volume rounding coverage depends on scaling.
Keep issues open during preparation. Feature recovery checkpoints belong on
separate rehearsal branches, never in starter `main`.

`main` now includes the default-dark, single-cup redesign. The published
`demo-start` tag and four recovery branches retain the original gallery-based
starter, so their existing rehearsal evidence remains reproducible. Use `main`
for the updated presentation; use `demo-start` for the original rehearsed flow.
The four headline capabilities remain unimplemented on both starter versions.

## Repository map

| Location | Purpose |
| --- | --- |
| `Brewprint.sln` | API and xUnit projects |
| `src/Brewprint.Api` | Static recipe catalog, API, production host |
| `src/Brewprint.Web` | React/Vite, shared ingredient model, cup and builder |
| `tests/Brewprint.Api.Tests` | API contracts and all six totals |
| `DESIGN.md`, `.agents/design/components.jsonc` | Shared visual language |
| `.github/copilot-instructions.md` | Cross-surface working context |
| `docs/demo-runbook.md` | Talk flow, issue URLs and recovery |

Original artwork and code are provided under [MIT](LICENSE). Dependencies
retain their own licenses. No bundled fonts or external media are required.
