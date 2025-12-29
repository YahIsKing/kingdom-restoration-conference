import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const TOTAL_SPOTS = 200;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", "spots_remaining"))
      .unique();

    return config?.value ?? TOTAL_SPOTS;
  },
});

export const decrement = mutation({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", "spots_remaining"))
      .unique();

    if (!config) {
      // Initialize if not exists
      await ctx.db.insert("config", {
        key: "spots_remaining",
        value: TOTAL_SPOTS - 1,
      });
      return TOTAL_SPOTS - 1;
    }

    const newValue = Math.max(0, config.value - 1);
    await ctx.db.patch(config._id, { value: newValue });
    return newValue;
  },
});

export const set = mutation({
  args: { value: v.number() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", "spots_remaining"))
      .unique();

    if (!config) {
      await ctx.db.insert("config", {
        key: "spots_remaining",
        value: args.value,
      });
    } else {
      await ctx.db.patch(config._id, { value: args.value });
    }
    return args.value;
  },
});

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("config")
      .withIndex("by_key", (q) => q.eq("key", "spots_remaining"))
      .unique();

    if (!config) {
      await ctx.db.insert("config", {
        key: "spots_remaining",
        value: TOTAL_SPOTS,
      });
      return { initialized: true, spots: TOTAL_SPOTS };
    }
    return { initialized: false, spots: config.value };
  },
});
