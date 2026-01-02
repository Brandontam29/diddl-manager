// oxlint-disable no-explicit-any
import { appendFile } from "node:fs/promises";
import path from "node:path";

import { logDirectory } from "../pathing";
import ensureFileExists from "../utils/ensureFileExists";

type LogLevel = "info" | "warn" | "error" | "fatal" | "debug";

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

const formatDate = (date: Date): string => {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
  );
};

const getQuarter = (date: Date): number => Math.floor(date.getMonth() / 3) + 1;

const formatMessage = (msg: any): string => {
  if (msg instanceof Error) {
    return `${msg.message}${msg.stack ? `\n${msg.stack}` : ""}`;
  }
  return typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg);
};

const writeLog = async (type: LogLevel, ...messages: any[]) => {
  const now = new Date();
  const timestamp = formatDate(now);
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;

  // oxlint-disable-next-line no-array-callback-reference
  const content = messages.map(formatMessage).join(" ");
  const fullLogLine = `${prefix} ${content}\n`;

  console[type](fullLogLine.trim());

  try {
    const fileName = `LOGGING-Q${getQuarter(now)}.log`;
    const filePath = path.join(logDirectory(), fileName);

    await ensureFileExists(filePath);
    await appendFile(filePath, fullLogLine, "utf8");
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};

const log = {
  info: (...args: any[]) => {
    writeLog("info", ...args);
  },
  warn: (...args: any[]) => {
    writeLog("warn", ...args);
  },
  error: (...args: any[]) => {
    writeLog("error", ...args);
  },
  fatal: (...args: any[]) => {
    writeLog("fatal", ...args);
  },
  debug: (...args: any[]) => {
    writeLog("debug", ...args);
  },
};

export default log;
