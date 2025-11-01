import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// QUERY: List all departments
export const list = query({
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();

    // Add member count
    const withStats = await Promise.all(
      departments.map(async (dept) => ({
        ...dept,
        memberCount: dept.members?.length || 0,
      }))
    );

    return withStats;
  },
});

// QUERY: Get single department by ID
export const get = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    const dept = await ctx.db.get(args.id);
    if (!dept) return null;

    return {
      ...dept,
      memberCount: dept.members?.length || 0,
    };
  },
});

// QUERY: Get department by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const dept = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!dept) return null;

    return {
      ...dept,
      memberCount: dept.members?.length || 0,
    };
  },
});

// MUTATION: Join department
export const join = mutation({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const dept = await ctx.db.get(args.departmentId);
    if (!dept) throw new Error("Department not found");

    const members = dept.members || [];
    if (members.includes(user._id)) {
      return; // Already joined
    }

    await ctx.db.patch(args.departmentId, {
      members: [...members, user._id],
    });

    // Update user's primary department
    await ctx.db.patch(user._id, {
      departmentId: args.departmentId,
    });
  },
});

// MUTATION: Leave department
export const leave = mutation({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const dept = await ctx.db.get(args.departmentId);
    if (!dept) throw new Error("Department not found");

    const members = dept.members || [];
    await ctx.db.patch(args.departmentId, {
      members: members.filter((id) => id !== user._id),
    });

    // Clear user's primary department if it matches
    if (user.departmentId === args.departmentId) {
      await ctx.db.patch(user._id, {
        departmentId: undefined,
      });
    }
  },
});
