import { query } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { currentStreak: 0, lastAnsweredDate: null as string | null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

  if (!user) return { currentStreak: 0, lastAnsweredDate: null as string | null };

    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Prefer the simple numeric 'streak' on user; fallback to table if missing
    const currentStreak = (user as any).streak ?? (streak ? streak.currentStreak : 0);
    const lastAnsweredDate = streak ? streak.lastAnsweredDate : (null as string | null);
    return { currentStreak, lastAnsweredDate };
  },
});
