import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    content: v.string(),
    type: v.optional(v.string()), // "text" | "image" | "collab" (free form for now)
    mediaUrls: v.optional(v.array(v.string())),
    departmentId: v.optional(v.id("departments")),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find or create the Convex user document by email.
    // Our schema indexes users by email.
    if (!identity.email) {
      throw new Error("Authenticated user missing email");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    let authorId = existingUser?._id;

    if (!authorId) {
      authorId = await ctx.db.insert("users", {
        name: identity.name ?? identity.email.split("@")[0],
        email: identity.email,
        avatarUrl: identity.pictureUrl ?? undefined,
        bio: undefined,
        departmentId: undefined,
        bannerUrl: undefined,
        socialLinks: undefined,
        badges: undefined,
        interests: undefined,
        lastActive: Date.now(),
      });
    }

    const postId = await ctx.db.insert("posts", {
      authorId,
      departmentId: args.departmentId,
      groupId: args.groupId,
      type: args.type ?? (args.mediaUrls && args.mediaUrls.length > 0 ? "image" : "text"),
      content: args.content,
      mediaUrls: args.mediaUrls,
      tags: undefined,
      collabId: undefined,
      createdAt: Date.now(),
      updatedAt: undefined,
    });

    return await ctx.db.get(postId);
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);
    const posts = await ctx.db.query("posts").order("desc").take(limit);

    // Attach author info for convenience
    const results = await Promise.all(
      posts.map(async (p) => {
        const author = await ctx.db.get(p.authorId);
        return {
          ...p,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
        };
      })
    );
    return results;
  },
});

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!me) return [];

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", me._id))
      .order("desc")
      .take(limit);

    const results = await Promise.all(
      posts.map(async (p) => {
        const author = await ctx.db.get(p.authorId);
        return {
          ...p,
          author: author
            ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl }
            : undefined,
        };
      })
    );

    return results;
  },
});
