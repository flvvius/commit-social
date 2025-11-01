import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const email = identity.email;
    if (!email) throw new Error("Missing email");
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!existingUser) throw new Error("User not found");

    const id = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: existingUser._id,
      content: args.content,
      parentCommentId: args.parentCommentId,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const listByPost = query({
  args: { postId: v.id("posts"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const all = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .take(limit);
    const comments = all.filter((c) => !c.parentCommentId);
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.authorId);
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_comment", (q) => q.eq("commentId", c._id))
          .collect();
        const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
          const key = (r as any).emojiName ?? (r as any).emoji;
          if (key) acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        return {
          ...c,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
          reactionCounts,
        };
      })
    );
    return enriched;
  },
});

export const listByParent = query({
  args: { parentCommentId: v.id("comments"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.parentCommentId))
      .order("asc")
      .take(limit);
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.authorId);
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_comment", (q) => q.eq("commentId", c._id))
          .collect();
        const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
          const key = (r as any).emojiName ?? (r as any).emoji;
          if (key) acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        return {
          ...c,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
          reactionCounts,
        };
      })
    );
    return enriched;
  },
});
