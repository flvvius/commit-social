import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    postId: v.optional(v.id("posts")),
    answerId: v.optional(v.id("answers")),
    commentId: v.optional(v.id("comments")),
    emojiName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Find user by email (created on-demand in posts.create as well)
    const email = identity.email;
    if (!email) throw new Error("Missing email");
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!existingUser) throw new Error("User not found");

    if (!args.postId && !args.commentId && !args.answerId) throw new Error("Missing target");

    // Toggle logic: if the same user already reacted with this emoji on this target, remove it; otherwise add it.
    let existing: any | undefined;
    if (args.postId) {
      const items = await ctx.db
        .query("reactions")
        .withIndex("by_post", (q) => q.eq("postId", args.postId!))
        .collect();
      existing = items.find((r) => r.userId === existingUser._id && (r as any).emojiName === args.emojiName);
    } else if (args.commentId) {
      const items = await ctx.db
        .query("reactions")
        .withIndex("by_comment", (q) => q.eq("commentId", args.commentId!))
        .collect();
      existing = items.find((r) => r.userId === existingUser._id && (r as any).emojiName === args.emojiName);
    } else if (args.answerId) {
      const items = await ctx.db
        .query("reactions")
        .withIndex("by_answer", (q) => q.eq("answerId", args.answerId!))
        .collect();
      existing = items.find((r) => r.userId === existingUser._id && (r as any).emojiName === args.emojiName);
    }

    // Points for answer authors on reaction
    const REACT_POINTS = 1;
    if (existing) {
      // Remove reaction and deduct points if target is answer
      await ctx.db.delete(existing._id);
      if (args.answerId) {
        const ans = await ctx.db.get(args.answerId);
        if (ans) {
          const ansAuthor = await ctx.db.get((ans as any).authorId);
          if (ansAuthor) {
            await ctx.db.patch(ansAuthor._id, { points: Math.max(0, ((ansAuthor as any).points ?? 0) - REACT_POINTS) });
          }
        }
      }
      return { success: true, toggled: "removed" as const };
    }

    await ctx.db.insert("reactions", {
      postId: args.postId,
      answerId: args.answerId,
      commentId: args.commentId,
      userId: existingUser._id,
      type: "emoji",
      emojiName: args.emojiName,
      createdAt: Date.now(),
      pozaURL: undefined,
    });

    if (args.answerId) {
      const ans = await ctx.db.get(args.answerId);
      if (ans) {
        const ansAuthor = await ctx.db.get((ans as any).authorId);
        if (ansAuthor) {
          await ctx.db.patch(ansAuthor._id, { points: ((ansAuthor as any).points ?? 0) + REACT_POINTS });
        }
      }
    }

    return { success: true, toggled: "added" as const };
  },
});
