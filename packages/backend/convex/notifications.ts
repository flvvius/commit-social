import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation: notify all members of a group to go smoke
export const sendCigaretteCall = mutation({
  args: {
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Resolve current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!currentUser) throw new Error("User not found");

    // Find group by name or slug (robust to casing/spacing)
    const toSlug = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const desiredSlug = toSlug(args.groupName);

    // 1) Try slug match using normalized input
    let group = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", desiredSlug))
      .first();

    // 2) Fallback: try exact name match as provided
    if (!group) {
      group = await ctx.db
        .query("groups")
        .withIndex("by_name", (q) => q.eq("name", args.groupName))
        .first();
    }

    // 3) Fallback: if user typed common variants specifically for smokers lounge
    if (!group && desiredSlug === "smokers-lounge") {
      group = await ctx.db
        .query("groups")
        .withIndex("by_slug", (q) => q.eq("slug", "smokers-lounge"))
        .first();
    }

    if (!group) throw new Error("Group not found");

    const members = group.members ?? [];
    const message = `Come to smoke`;
    let delivered = 0;
    for (const uid of members) {
      if (uid === currentUser._id) continue; // skip sender
      await ctx.db.insert("notifications", {
        userId: uid,
        type: "cigarette_call",
        message,
        createdAt: Date.now(),
        read: false,
      });
      // Also send a chat message in a direct conversation between sender and this user
      // 1) Find existing direct conversation between currentUser and uid
      let conversationId: any = null;
      const myMemberships = await ctx.db
        .query("conversationMembers")
        .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
        .collect();
      for (const membership of myMemberships) {
        const conv = await ctx.db.get(membership.conversationId);
        if (conv && conv.type === "direct" && conv.participants.length === 2 && conv.participants.includes(uid)) {
          conversationId = conv._id;
          break;
        }
      }
      // 2) If none, create one and memberships
      if (!conversationId) {
        conversationId = await ctx.db.insert("conversations", {
          type: "direct",
          participants: [currentUser._id, uid],
          createdAt: Date.now(),
          lastMessageAt: Date.now(),
        });
        await ctx.db.insert("conversationMembers", {
          conversationId,
          userId: currentUser._id,
          unreadCount: 0,
        });
        await ctx.db.insert("conversationMembers", {
          conversationId,
          userId: uid,
          unreadCount: 0,
        });
      }
      // 3) Insert the message from the sende
      const msgId = await ctx.db.insert("messages", {
        conversationId,
        senderId: currentUser._id,
        content: message,
        mediaUrls: [],
        readBy: [currentUser._id],
        createdAt: Date.now(),
      });
      // 4) Update conversation lastMessageAt
      await ctx.db.patch(conversationId, { lastMessageAt: Date.now() });
      // 5) Increment unread count for the recipient
      const membersRecs = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
        .collect();
      for (const m of membersRecs) {
        if (m.userId !== currentUser._id) {
          await ctx.db.patch(m._id, { unreadCount: m.unreadCount + 1 });
        }
      }
      delivered++;
    }
    return { delivered };
  },
});

// Live query: current user's notifications (most recent first)
export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return [];

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    return items;
  },
});

// Mutation: mark all notifications as read for current user
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { updated: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return { updated: 0 };

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    let updated = 0;
    for (const it of items) {
      if (!it.read) {
        await ctx.db.patch(it._id, { read: true });
        updated++;
      }
    }
    return { updated };
  },
});
