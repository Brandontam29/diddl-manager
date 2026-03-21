## ADDED Requirements

### Requirement: @corvu/drawer dependency
The `desktop-app` SHALL include `@corvu/drawer` as a project dependency to support drawer UI components.

#### Scenario: Verify dependency presence
- **WHEN** checking `desktop-app/package.json`
- **THEN** `@corvu/drawer` is listed in the `dependencies` section

### Requirement: Type resolution for drawer components
The `desktop-app` project SHALL correctly resolve modules from `@corvu/drawer` in TypeScript files.

#### Scenario: Resolve @corvu/drawer in drawer.tsx
- **WHEN** opening `desktop-app/src/renderer/src/components/ui/drawer.tsx` in a TypeScript-aware editor
- **THEN** the import from `@corvu/drawer` does not report a "Cannot find module" error
