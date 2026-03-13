# Codebase Structure

## Goal

This project mixes two concerns:

1. The actual NR-1 School application runtime.
2. A large Metronic layout/template base kept in the repository.

The codebase stays professional only if these concerns remain explicit.

## Runtime Structure

These folders are the active product surface and should receive new work by default:

- `src/pages`: route-level features and feature-local helpers/components.
- `src/services`: API contracts and request orchestration.
- `src/mocks`: browser-side mock database and handlers.
- `src/layouts`: the app shell actually used by routing.
- `src/lib`: shared cross-feature utilities.
- `src/types`: shared domain and transport types.
- `src/routing`: router setup and route composition.
- `src/styles`: app tokens, globals and theme behavior.
- `src/config`: runtime product configuration only.

## Legacy Template Surface

These folders are template/vendor-heavy and should not be treated as normal product code unless there is a deliberate migration plan:

- `src/vendor/metronic/layouts`
- `src/vendor/metronic/config`
- `src/vendor/metronic/hooks`

They are useful as a design/reference inventory, but they are not the current app shell. Product work should prefer `src/layouts` unless the team explicitly decides to adopt one of those template layouts.

## Rules For New Code

### Pages

- Keep `page.tsx` focused on orchestration.
- If a screen grows, split into `components.tsx` and `helpers.ts`.
- Put only feature-local helpers inside the page folder.

### Lib

- `src/lib` is for cross-feature utilities only.
- Use `formatters.ts` for presentation formatting reused across modules.
- Use `pagination.ts` for pagination mechanics.
- Use focused files such as `asset-path.ts`, `names.ts`, `timing.ts` and `identifiers.ts` for shared primitives.
- Treat `helpers.ts` as a compatibility layer for older imports; avoid adding new product logic there.

### Services

- `src/services` should reflect API boundaries, not UI boundaries.
- Prefer normalized payloads and `snake_case` compatibility for backend handoff.
- Keep response types close to the service that owns the endpoint.

### Mocks

- `src/mocks/data` owns persisted in-browser mock state.
- `src/mocks/handlers` should behave like real HTTP handlers.
- Mock contracts should mirror backend naming and tenant scoping.

### Layouts

- `src/layouts` is the source of truth for the active shell.
- Avoid importing from `src/vendor/metronic/layouts` into product flows unless that move is intentional.

## Current Structural Debt

These are the main remaining cleanup targets:

1. Keep `src/vendor/metronic` isolated from the runtime app unless there is an explicit migration.
2. Gradually extract repeated `status/meta` maps from large pages into feature modules when reused inside the same domain.
3. Continue splitting large route files when orchestration and presentation start drifting together.

## Practical North Star

If a new developer opens the repository, they should understand this quickly:

- product runtime lives in `src/pages`, `src/services`, `src/mocks`, `src/layouts`
- shared utilities live in `src/lib`
- Metronic legacy lives in `src/vendor/metronic` and should be touched carefully

That is the bar for structural coherence in this repository.
