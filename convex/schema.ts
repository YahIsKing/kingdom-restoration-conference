import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  config: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),
});
