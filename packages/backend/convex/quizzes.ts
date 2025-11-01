import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function formatUTCDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getYesterdayUTCString() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return formatUTCDate(d);
}

function getTodayUTCString() {
  return formatUTCDate(new Date());
}

// Query: fetch today's quiz and whether current user already answered today
export const getToday = query({
  args: {},
  handler: async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
    const today = getTodayUTCString();

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (!quiz) return { available: false } as const;

    let hasAnsweredToday = false;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      if (user) {
        const streak = await ctx.db
          .query("streaks")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        hasAnsweredToday = !!streak && streak.lastAnsweredDate === today;
      }
    }

    return {
      available: true,
      date: quiz.date,
      question: quiz.question,
      answers: quiz.answers,
      hasAnsweredToday,
    } as const;
  },
});

// Mutation: answer today's quiz (one attempt per day). Updates streak on correct answer.
export const answerToday = mutation({
  args: { answerIndex: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const today = getTodayUTCString();
    const yesterday = getYesterdayUTCString();

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    if (!quiz) return { ok: false as const, reason: "no_quiz" as const };

    // Enforce one attempt per day using streak.lastAnsweredDate
    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (streak && streak.lastAnsweredDate === today) {
      return { ok: false as const, reason: "already_answered" as const };
    }

    const correct = args.answerIndex === quiz.correctAnswer;

    let newStreak = 0;
    if (correct) {
      if (streak && streak.lastAnsweredDate === yesterday) {
        newStreak = streak.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 0; // wrong answer breaks the streak
    }

    if (streak) {
      await ctx.db.patch(streak._id, {
        currentStreak: newStreak,
        lastAnsweredDate: today,
      });
    } else {
      await ctx.db.insert("streaks", {
        userId: user._id,
        currentStreak: newStreak,
        lastAnsweredDate: today,
      });
    }

    // Also reflect the simple numeric streak directly on the user doc
    await ctx.db.patch(user._id, {
      streak: newStreak,
    });

    // Badge awards
    try {
      // Daily Game: played at least once
      const DAILY = "Daily Game Badge Design.png";
      const STREAK = "Streak Hero Badge Design.png";
      const currentBadges: string[] = ((await ctx.db.get(user._id)) as any)?.badges || [];
      let updated = currentBadges;
      if (!updated.includes(DAILY)) {
        updated = [...updated, DAILY];
      }
      if (newStreak > 5 && !updated.includes(STREAK)) {
        updated = [...updated, STREAK];
      }
      if (updated !== currentBadges) {
        await ctx.db.patch(user._id, { badges: updated });
      }
    } catch {}

    return { ok: true as const, correct, currentStreak: newStreak };
  },
});
