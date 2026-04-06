import { Effect, Layer, Context, pipe } from "effect";

// ── Service Definitions ──────────────────────────────────────────────

export class AppConfig extends Context.Tag("AppConfig")<
  AppConfig,
  {
    readonly appName: string;
    readonly version: string;
  }
>() {}

export const AppConfigLive = Layer.succeed(AppConfig, {
  appName: "Website Solid Claude",
  version: "0.1.0",
});

// ── Effect Utilities ──────────────────────────────────────────────────

export const runPromise = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runPromise(effect);

export const runSync = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSync(effect);

// ── Common Effects ──────────────────────────────────────────────────

export const getAppInfo = pipe(
  AppConfig,
  Effect.map((config) => ({
    name: config.appName,
    version: config.version,
  })),
  Effect.provide(AppConfigLive)
);

export { Effect, Layer, Context, pipe };
