import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    postId: v.optional(v.id("posts")),
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

    if (!args.postId && !args.commentId) throw new Error("Missing target");

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
    }

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true, toggled: "removed" as const };
    }

    await ctx.db.insert("reactions", {
      postId: args.postId,
      commentId: args.commentId,
      userId: existingUser._id,
      type: "emoji",
      emojiName: args.emojiName,
      createdAt: Date.now(),
      pozaURL: undefined,
    });

    return { success: true, toggled: "added" as const };
  },
});
