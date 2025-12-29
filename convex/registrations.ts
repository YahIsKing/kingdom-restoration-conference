import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    firstName: v.string(),
    familyName: v.string(),
    email: v.string(),
    phone: v.string(),
    state: v.string(),
    registrationType: v.string(),
    tshirts: v.string(),
    dietaryPreference: v.string(),
    allergies: v.string(),
    addOns: v.string(),
    amountPaid: v.string(),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("registrations", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return registrations;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return registration;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();

    // Count dietary preferences
    const dietary: Record<string, number> = {};
    // Count t-shirt sizes and colors
    const tshirtSizes: Record<string, number> = {};
    const tshirtColors: Record<string, number> = {};
    // Count add-ons
    const addOnTotals: Record<string, number> = {};

    for (const reg of registrations) {
      // Dietary
      dietary[reg.dietaryPreference] = (dietary[reg.dietaryPreference] || 0) + 1;

      // T-shirts
      try {
        const tshirts = JSON.parse(reg.tshirts || "[]");
        for (const t of tshirts) {
          tshirtSizes[t.size] = (tshirtSizes[t.size] || 0) + 1;
          tshirtColors[t.color] = (tshirtColors[t.color] || 0) + 1;
        }
      } catch {
        // ignore parse errors
      }

      // Add-ons
      try {
        const addOns = JSON.parse(reg.addOns || "{}");
        for (const [key, qty] of Object.entries(addOns)) {
          if (typeof qty === "number" && qty > 0) {
            addOnTotals[key] = (addOnTotals[key] || 0) + qty;
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    return {
      totalRegistrations: registrations.length,
      dietary,
      tshirtSizes,
      tshirtColors,
      addOnTotals,
    };
  },
});
