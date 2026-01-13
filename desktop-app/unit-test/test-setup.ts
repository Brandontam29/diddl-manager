import { mock } from "bun:test";

mock.module("electron", () => ({
  app: {
    getPath: () => "/tmp/diddl-manager",
    getAppPath: () => "/tmp",
  },
}));

mock.module("../logging", () => ({
  logging: {
    error: mock(() => {}),
  },
}));
