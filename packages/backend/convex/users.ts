import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const email = identity.email;
    if (!email) return null;

    // Find by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    return existing ?? null;
  },
});

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) throw new Error("Unauthorized");

    const me = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!me) throw new Error("User not found");

    await ctx.db.patch(me._id, {
      bio: args.bio ?? me.bio,
      bannerUrl: args.bannerUrl ?? me.bannerUrl,
      socialLinks: args.socialLinks ?? me.socialLinks,
      lastActive: Date.now(),
    });

    return await ctx.db.get(me._id);
  },
});
