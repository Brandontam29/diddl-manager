type Level = "info" | "warn" | "error";
type Meta = Record<string, unknown>;

// One JSON line per call; Vercel captures stdout/stderr as runtime logs (spec.md §9).
export function formatLogLine(level: Level, msg: string, meta?: Meta, time = new Date()): string {
  return JSON.stringify({ time: time.toISOString(), level, msg, ...meta });
}

function write(level: Level, msg: string, meta?: Meta) {
  const line = formatLogLine(level, msg, meta);
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const log = {
  info: (msg: string, meta?: Meta) => write("info", msg, meta),
  warn: (msg: string, meta?: Meta) => write("warn", msg, meta),
  error: (msg: string, meta?: Meta) => write("error", msg, meta),
};
