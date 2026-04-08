import { makeFunctionReference } from "convex/server";

export type DashboardSummary = {
  appName: string;
  generatedAt: string;
  deployment: string;
  features: string[];
  viewer: {
    subject: string;
    name: string | null;
    email: string | null;
  } | null;
};

export const dashboardSummaryQuery = makeFunctionReference<
  "query",
  Record<string, never>,
  DashboardSummary
>("dashboard:getSummary");
