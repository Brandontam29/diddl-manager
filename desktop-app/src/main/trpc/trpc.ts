import { initTRPC } from "@trpc/server";

import { AppError } from "../errors";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  errorFormatter({ shape, error }) {
    const appError = error.cause instanceof AppError ? error.cause : null;

    return {
      ...shape,
      data: {
        ...shape.data,
        appCode: appError?.appCode ?? "UNKNOWN",
        details: appError?.details ?? null,
        isExpected: appError !== null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
