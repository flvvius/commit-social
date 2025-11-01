import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByPost = query({
  args: { postId: v.id("posts"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .take(limit);
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.authorId);
        return {
          ...c,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
        };
      })
    );
    return enriched;
  },
});
