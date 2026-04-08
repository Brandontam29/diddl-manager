import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    userId: v.string(),
    userName: v.string(),
    body: v.string(),
  }).index("by_userId", ["userId"]),

  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    completed: v.boolean(),
  }).index("by_userId", ["userId"]),
});
