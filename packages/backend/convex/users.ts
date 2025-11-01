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

// MUTATION: Update current user's profile fields (bio, banner, social links)
export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(v.object({ platform: v.string(), url: v.string() }))
    ),
    badges: v.optional(v.array(v.string())),
    birthday: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    // Basic normalization and limits
    const socialLinks = (args.socialLinks ?? []).slice(0, 6).map((s) => ({
      platform: s.platform.trim().slice(0, 24),
      url: s.url.trim(),
    }));

    await ctx.db.patch(user._id, {
      ...(args.bio !== undefined ? { bio: args.bio } : {}),
      ...(args.bannerUrl !== undefined ? { bannerUrl: args.bannerUrl } : {}),
      ...(args.socialLinks !== undefined ? { socialLinks } : {}),
      ...(args.badges !== undefined
        ? { badges: args.badges.slice(0, 64) }
        : {}),
      ...(args.birthday !== undefined ? { birthday: args.birthday } : {}),
    });

    return { ok: true };
  },
});

// QUERY: List upcoming birthdays (today + next N days). Uses users.birthday (YYYY-MM-DD)
export const listUpcomingBirthdays = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const windowDays = Math.max(0, Math.min(args.days ?? 7, 31));
    const users = await ctx.db.query("users").collect();
    const today = new Date();
    const year = today.getUTCFullYear();
    const todayMonth = today.getUTCMonth() + 1;
    const todayDay = today.getUTCDate();

    function parseBirthday(
      s?: string | null
    ): { month: number; day: number } | null {
      if (!s) return null;
      const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
      if (!m) return null;
      return { month: Number(m[2]), day: Number(m[3]) };
    }

    function daysUntil(month: number, day: number) {
      const targetThisYear = Date.UTC(year, month - 1, day);
      const todayUTC = Date.UTC(year, todayMonth - 1, todayDay);
      if (targetThisYear >= todayUTC) {
        return Math.round((targetThisYear - todayUTC) / 86400000);
      }
      // next year
      const targetNextYear = Date.UTC(year + 1, month - 1, day);
      return Math.round((targetNextYear - todayUTC) / 86400000);
    }

    const withBirthdays = users
      .map((u) => {
        const bd = parseBirthday((u as any).birthday);
        if (!bd) return null;
        const d = daysUntil(bd.month, bd.day);
        return { user: u, daysUntil: d, isToday: d === 0 };
      })
      .filter(
        (x): x is { user: any; daysUntil: number; isToday: boolean } =>
          !!x && x.daysUntil <= windowDays
      )
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 20);

    return withBirthdays.map((x) => ({
      _id: x.user._id,
      name: x.user.name,
      avatarUrl: x.user.avatarUrl,
      birthday: (x.user as any).birthday,
      daysUntil: x.daysUntil,
      isToday: x.isToday,
    }));
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

// QUERY: Get user by ID (for viewing other users' profiles)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get user's department if they have one
    let department = null;
    if (user.departmentId) {
      department = await ctx.db.get(user.departmentId);
    }

    // Get user's groups
    const groupIds = user.interests || [];
    const groups = await Promise.all(
      groupIds.map(async (groupId) => {
        const group = await ctx.db.get(groupId);
        return group
          ? {
              _id: group._id,
              name: group.name,
              emoji: group.emoji,
              slug: group.slug,
            }
          : null;
      })
    );

    return {
      ...user,
      department: department
        ? {
            _id: department._id,
            name: department.name,
            emoji: department.emoji,
          }
        : null,
      groups: groups.filter((g) => g !== null),
    };
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

// MUTATION: Recompute badges for current user based on activity
export const recomputeBadges = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const BADGES = {
      ACTIVE: "Active Contributor Badge Design.png",
      STREAK: "Streak Hero Badge Design.png",
      SMOKE: "Smoke Break Crew Badge Design.png",
      DAILY: "Daily Game Badge Design.png",
    } as const;

    const have: Set<string> = new Set(((user as any).badges || []) as string[]);

    // Active Contributor: >= 3 posts
    const postCount = (await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .take(3)).length;
    if (postCount >= 3) have.add(BADGES.ACTIVE);

    // Streak Hero: streak > 5 (prefer users.streak)
    const streakNum: number = (user as any).streak ?? 0;
    if (streakNum > 5) have.add(BADGES.STREAK);

    // Smoke Break: member of smokers-lounge
    const smokers = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", "smokers-lounge"))
      .first();
    if (smokers && ((user as any).interests || []).includes(smokers._id)) {
      have.add(BADGES.SMOKE);
    }

    // Daily Game: played quiz at least once (presence of streaks record)
    const streakDoc = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (streakDoc) have.add(BADGES.DAILY);

    await ctx.db.patch(user._id, { badges: Array.from(have) });
    return { ok: true, badges: Array.from(have) };
  },
});
