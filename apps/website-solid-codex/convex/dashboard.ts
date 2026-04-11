import { queryGeneric } from "convex/server";

const query = queryGeneric;

export const getSummary = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();

    return {
      appName: "website-solid",
      generatedAt: new Date().toISOString(),
      deployment: process.env.CONVEX_DEPLOYMENT ?? "local",
      features: [
        "SolidStart 2 app shell",
        "Clerk browser auth via ClerkJS",
        "Convex live query ready",
        "Effect-powered server snapshot",
      ],
      viewer: identity
        ? {
            subject: identity.subject,
            name: identity.name ?? null,
            email: identity.email ?? null,
          }
        : null,
    };
  },
});
