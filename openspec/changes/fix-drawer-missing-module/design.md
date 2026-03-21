## Context

The `desktop-app` project uses `@corvu/drawer` for drawer components in SolidJS, but the package is not listed in `package.json`. This causes TypeScript errors during development and build.

## Goals / Non-Goals

**Goals:**
- Add `@corvu/drawer` to `desktop-app/package.json`.
- Resolve the `ts(2307)` error in `drawer.tsx`.

**Non-Goals:**
- Upgrading other dependencies.
- Refactoring the drawer component.

## Decisions

- **Dependency Addition**: Add `@corvu/drawer` to `dependencies` in `desktop-app/package.json`. Rationale: It's a runtime dependency for the renderer.
- **Version Selection**: Use the latest stable version of `@corvu/drawer`.

## Risks / Trade-offs

- **Risk**: Version mismatch with SolidJS. -> **Mitigation**: Check `@corvu/drawer` documentation for compatibility with SolidJS 1.9.x.
