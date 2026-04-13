import { mock } from "bun:test";

void mock.module("electron", () => ({
  app: {
    getPath: () => "/tmp/diddl-manager",
    getAppPath: () => "/tmp",
  },
}));

void mock.module("../logging", () => ({
  logging: {
    error: mock(() => {}),
  },
}));
