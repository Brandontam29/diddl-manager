/// <reference types="@solidjs/start/server" />
import type { AuthObject } from "@clerk/backend";

declare module "@solidjs/start/server" {
  export interface RequestEventLocals {
    auth: AuthObject;
  }
}

export {};
