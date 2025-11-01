import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    content: v.string(),
    type: v.optional(v.string()), // "text" | "image" | "collab" (free form for now)
    mediaUrls: v.optional(v.array(v.string())),
    imageIds: v.optional(v.array(v.id("_storage"))),
    images: v.optional(v.array(v.object({ id: v.id("_storage"), caption: v.optional(v.string()) }))),
    departmentId: v.optional(v.id("departments")),
    groupId: v.optional(v.id("groups")),
    isShowcase: v.optional(v.boolean()),
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

    // Resolve images to public URLs and build media with captions
    let mediaUrls: string[] | undefined = args.mediaUrls;
    let media: { url: string; caption?: string }[] | undefined;
    if (args.images && args.images.length > 0) {
      const items = await Promise.all(
        args.images.map(async (img) => ({ url: (await ctx.storage.getUrl(img.id)) ?? "", caption: img.caption }))
      );
      media = items.filter((x) => !!x.url);
      mediaUrls = media.map((m) => m.url);
    } else if (args.imageIds && args.imageIds.length > 0) {
      const urls = await Promise.all(args.imageIds.map(async (id) => (await ctx.storage.getUrl(id)) ?? ""));
      mediaUrls = urls.filter(Boolean);
    }

    const doc: any = {
      authorId,
      departmentId: args.departmentId,
      groupId: args.groupId,
      type: args.type ?? (mediaUrls && mediaUrls.length > 0 ? "image" : "text"),
      content: args.content,
      mediaUrls,
      media,
      tags: undefined,
      collabId: undefined,
      createdAt: Date.now(),
      updatedAt: undefined,
    };
    if (args.isShowcase !== undefined) doc.isShowcase = args.isShowcase;

    const postId = await ctx.db.insert("posts", doc);

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
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_post", (q) => q.eq("postId", p._id))
          .collect();
        const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
          const key = (r as any).emojiName ?? (r as any).emoji; // fallback for older docs
          if (key) acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        return {
          ...p,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
          reactionCounts,
        };
      })
    );
    return results;
  },
});

// Generate a signed upload URL to upload images from the client directly to Convex storage
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const url = await ctx.storage.generateUploadUrl();
    return { url };
  },
});
