# Brewprint

An educational local-first espresso bar: ASP.NET Core .NET 10 API, React,
TypeScript and Vite. Read DESIGN.md before UI changes. Use original SVG and
system fonts. No accounts, database, paid APIs or embedded AI.

## Architecture

- `src/Brewprint.Api/RecipeCatalog.cs`: six static, immutable predefined drinks.
- `src/Brewprint.Api/Program.cs`: recipe API and production static hosting.
- `src/Brewprint.Web/src/model.ts`: typed ingredients, portions and layers.
- `src/Brewprint.Web/src/builder.ts`: pure fixed-capacity assembly reducer.
- `src/Brewprint.Web/src/Cup.tsx`: actual fill fraction, reusable schematic.
- `src/Brewprint.Web/src/App.tsx`: one central cup shared by House menu and
  Build your own, with drink choices beneath it.
- `tests/Brewprint.Api.Tests`: xUnit API integration tests.
- `src/Brewprint.Web/e2e`: real browser drag/drop and keyboard tests.

The manual builder stays at 360mL with fixed portions. Gallery selection must
not overwrite a custom build. Predefined recipe enhancements must not silently
change the builder. Foam is illustrative occupied volume, not liquid yield.
Layers represent assembly order, not fluid simulation.
The current starter defaults to dark. Preserve its single-cup composition and
reduced-motion behavior unless the assigned feature explicitly needs another
display (such as side-by-side comparison).

## Working agreement

Implement only the assigned issue. Include explicit validation/error states,
accessible controls and text equivalents. Preserve API IDs and existing
behavior. Keep frontend API data runtime-validated. Do not add unrelated
features or substitute mock data for API failures. No new dependencies unless
needed. Do not close demo issues during rehearsal.

## Validation (from repository root)

```text
dotnet test Brewprint.sln
npm --prefix src/Brewprint.Web ci
npm --prefix src/Brewprint.Web run build
npm --prefix src/Brewprint.Web test
npm --prefix src/Brewprint.Web exec -- playwright install chromium
npm --prefix src/Brewprint.Web run test:e2e
```

Use the shell's native path separators on Windows. If Node is installed but
not on PATH, prepend its installation directory for the current shell only.
Record cross-surface context in the issue/commit, not an assumed shared chat.
