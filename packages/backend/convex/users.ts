import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// MUTATION: Sync current user from Clerk to Convex
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      // Update user info
      await ctx.db.patch(existingUser._id, {
        name: identity.name || identity.email || "Unknown",
        email: identity.email || "",
        avatarUrl: identity.pictureUrl,
        lastActive: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name || identity.email || "Unknown",
      email: identity.email || "",
      avatarUrl: identity.pictureUrl,
      lastActive: Date.now(),
    });

    return userId;
  },
});

// QUERY: Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// INTERNAL MUTATION: Upsert user from webhook
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        lastActive: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      lastActive: Date.now(),
    });
  },
});

// INTERNAL MUTATION: Delete user from webhook
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

// MUTATION: Complete onboarding (set department and join groups)
export const completeOnboarding = mutation({
  args: {
    departmentId: v.id("departments"),
    groupIds: v.array(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Update user's department
    await ctx.db.patch(user._id, {
      departmentId: args.departmentId,
      interests: args.groupIds,
    });

    // Add user to department members
    const department = await ctx.db.get(args.departmentId);
    if (department) {
      const members = department.members || [];
      if (!members.includes(user._id)) {
        await ctx.db.patch(args.departmentId, {
          members: [...members, user._id],
        });
      }
    }

    // Add user to all selected groups
    for (const groupId of args.groupIds) {
      const group = await ctx.db.get(groupId);
      if (group) {
        const members = group.members || [];
        if (!members.includes(user._id)) {
          await ctx.db.patch(groupId, {
            members: [...members, user._id],
          });
        }
      }
    }

    return user._id;
  },
});
