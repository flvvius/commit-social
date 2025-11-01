import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    postId: v.id("posts"),
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

    await ctx.db.insert("reactions", {
      postId: args.postId,
      userId: existingUser._id,
      type: "emoji",
      emojiName: args.emojiName,
      createdAt: Date.now(),
      pozaURL: undefined,
    });

    return { success: true };
  },
});
