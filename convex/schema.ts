import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  config: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),

  registrations: defineTable({
    firstName: v.string(),
    familyName: v.string(),
    email: v.string(),
    phone: v.string(),
    state: v.string(),
    registrationType: v.string(),
    tshirts: v.string(), // JSON string
    dietaryPreference: v.string(),
    allergies: v.string(),
    addOns: v.string(), // JSON string
    amountPaid: v.string(),
    stripeSessionId: v.string(),
    createdAt: v.number(), // timestamp
  }).index("by_email", ["email"])
    .index("by_created", ["createdAt"]),
});
