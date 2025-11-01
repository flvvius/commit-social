import { query } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { currentStreak: 0, lastAnsweredDate: null as string | null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { currentStreak: 0, lastAnsweredDate: null as string | null };

    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!streak) {
      return { currentStreak: 0, lastAnsweredDate: null as string | null };
    }

    return { currentStreak: streak.currentStreak, lastAnsweredDate: streak.lastAnsweredDate };
  },
});
