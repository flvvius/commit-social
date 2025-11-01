import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// QUERY: List all groups
export const list = query({
  args: {
    joined: v.optional(v.boolean()), // Filter by user's joined groups
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db.query("groups").collect();

    // If filtering by joined groups
    if (args.joined) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity?.email) return [];

      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();

      if (!user) return [];

      const joinedGroupIds = user.interests || [];
      return groups
        .filter((g) => joinedGroupIds.includes(g._id))
        .map((g) => ({
          ...g,
          memberCount: g.members?.length || 0,
          isJoined: true,
        }));
    }

    // Get current user to check joined status
    const identity = await ctx.auth.getUserIdentity();
    let userGroupIds: any[] = [];

    if (identity?.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      userGroupIds = user?.interests || [];
    }

    return groups.map((g) => ({
      ...g,
      memberCount: g.members?.length || 0,
      isJoined: userGroupIds.includes(g._id),
    }));
  },
});

// QUERY: Get single group by ID
export const get = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) return null;

    const identity = await ctx.auth.getUserIdentity();
    let isJoined = false;

    if (identity?.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      isJoined = user?.interests?.includes(group._id) || false;
    }

    return {
      ...group,
      memberCount: group.members?.length || 0,
      isJoined,
    };
  },
});

// MUTATION: Create new group
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      slug,
      emoji: args.emoji || "📚",
      description: args.description,
      members: [user._id],
      createdAt: Date.now(),
    });

    // Auto-join creator
    const userInterests = user.interests || [];
    await ctx.db.patch(user._id, {
      interests: [...userInterests, groupId],
    });

    return groupId;
  },
});

// MUTATION: Join group
export const join = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    // Add to group members
    const members = group.members || [];
    if (!members.includes(user._id)) {
      await ctx.db.patch(args.groupId, {
        members: [...members, user._id],
      });
    }

    // Add to user interests
    const interests = user.interests || [];
    if (!interests.includes(args.groupId)) {
      await ctx.db.patch(user._id, {
        interests: [...interests, args.groupId],
      });
    }

    // Badge: Smoke Break (if joining smokers-lounge)
    try {
      if ((group as any).slug === "smokers-lounge" || (group as any).name === "Smokers Lounge") {
        const BADGE = "Smoke Break Crew Badge Design.png";
        const currentBadges: string[] = ((await ctx.db.get(user._id)) as any)?.badges || [];
        if (!currentBadges.includes(BADGE)) {
          await ctx.db.patch(user._id, { badges: [...currentBadges, BADGE] });
        }
      }
    } catch {}
  },
});

// MUTATION: Leave group
export const leave = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    // Remove from group members
    const members = group.members || [];
    await ctx.db.patch(args.groupId, {
      members: members.filter((id) => id !== user._id),
    });

    // Remove from user interests
    const interests = user.interests || [];
    await ctx.db.patch(user._id, {
      interests: interests.filter((id) => id !== args.groupId),
    });
  },
});
