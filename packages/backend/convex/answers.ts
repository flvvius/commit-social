import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { questionId: v.id("questions"), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    if (!identity.email) throw new Error("Missing email");
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
    if (!user) throw new Error("User not found");

    // Prevent answering your own question
    const q = await ctx.db.get(args.questionId);
    if (!q) throw new Error("Question not found");
    if (q.authorId === user._id) {
      throw new Error("You cannot answer your own question");
    }

    const id = await ctx.db.insert("answers", {
      questionId: args.questionId,
      authorId: user._id,
      content: args.content,
      createdAt: Date.now(),
      updatedAt: undefined,
    });
    return await ctx.db.get(id);
  },
});

export const approve = mutation({
  args: { questionId: v.id("questions"), answerId: v.id("answers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    if (!identity.email) throw new Error("Missing email");

    const q = await ctx.db.get(args.questionId);
    if (!q) throw new Error("Question not found");

    const asker = await ctx.db.get(q.authorId);
    if (!asker) throw new Error("Asker not found");

    // Only question author can approve
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (qb) => qb.eq("email", identity.email!))
      .unique();
    if (!user || user._id !== q.authorId) throw new Error("Forbidden");

    // Points bookkeeping
    const APPROVE_POINTS = 15;

    // If there was a previous accepted answer, revert points
    if (q.acceptedAnswerId) {
      const prevAns = await ctx.db.get(q.acceptedAnswerId);
      if (prevAns) {
        const prevAuthor = await ctx.db.get(prevAns.authorId);
        if (prevAuthor) {
          await ctx.db.patch(prevAuthor._id, {
            points: Math.max(0, ((prevAuthor as any).points ?? 0) - APPROVE_POINTS),
          });
        }
      }
    }

    const ans = await ctx.db.get(args.answerId);
    if (!ans) throw new Error("Answer not found");
    const ansAuthor = await ctx.db.get(ans.authorId);
    if (ansAuthor) {
      await ctx.db.patch(ansAuthor._id, { points: ((ansAuthor as any).points ?? 0) + APPROVE_POINTS });
    }

    await ctx.db.patch(q._id, { acceptedAnswerId: args.answerId, updatedAt: Date.now() });
    return { success: true };
  },
});
