## Why

The `desktop-app` project is missing the `@corvu/drawer` dependency, causing a TypeScript error in `desktop-app/src/renderer/src/components/ui/drawer.tsx`. This prevents the application from building and being linted correctly.

## What Changes

- Add `@corvu/drawer` to the `dependencies` in `desktop-app/package.json`.
- Ensure the dependency is installed in the `desktop-app` environment.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `drawer-component`: Ensure drawer component has required dependencies.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- None

## Impact

- `desktop-app/package.json`: Updated with `@corvu/drawer`.
- `desktop-app/src/renderer/src/components/ui/drawer.tsx`: TypeScript error `ts(2307)` will be resolved.
- Build and linting processes for the `desktop-app` will succeed.
