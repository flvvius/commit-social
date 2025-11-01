import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// MUTATION: Send a new message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: args.content,
      mediaUrls: args.mediaUrls,
      readBy: [user._id], // Sender has read it
      createdAt: Date.now(),
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    // Update unread counts for other participants
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const member of members) {
      if (member.userId !== user._id) {
        await ctx.db.patch(member._id, {
          unreadCount: member.unreadCount + 1,
        });
      }
    }

    return messageId;
  },
});

// MUTATION: Create or get existing direct conversation
export const getOrCreateDirectConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Check if conversation already exists
    const existingMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    for (const membership of existingMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (
        conversation?.type === "direct" &&
        conversation.participants.length === 2 &&
        conversation.participants.includes(args.otherUserId)
      ) {
        return membership.conversationId;
      }
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participants: [currentUser._id, args.otherUserId],
      createdAt: Date.now(),
    });

    // Create membership records
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: currentUser._id,
      unreadCount: 0,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      unreadCount: 0,
    });

    return conversationId;
  },
});

// MUTATION: Mark conversation as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    // Find membership
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_conversation", (q) => q.eq("userId", user._id).eq("conversationId", args.conversationId))
      .first();

    if (membership) {
      await ctx.db.patch(membership._id, {
        lastReadAt: Date.now(),
        unreadCount: 0,
      });
    }

    // Mark all messages as read
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      if (!message.readBy.includes(user._id)) {
        await ctx.db.patch(message._id, {
          readBy: [...message.readBy, user._id],
        });
      }
    }
  },
});

// QUERY: Get all conversations for current user
export const getConversations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return [];

    // Get all memberships
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Fetch conversation details
    const conversationsWithDetails = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        // Get other participant info (for direct chats)
        let otherUser = null;
        if (conversation.type === "direct") {
          const otherUserId = conversation.participants.find((id) => id !== user._id);
          if (otherUserId) {
            otherUser = await ctx.db.get(otherUserId);
          }
        }

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .order("desc")
          .first();

        return {
          ...conversation,
          unreadCount: membership.unreadCount,
          lastMessage,
          otherUser,
        };
      })
    );

    return conversationsWithDetails
      .filter((c) => c !== null)
      .sort((a, b) => (b!.lastMessageAt || 0) - (a!.lastMessageAt || 0));
  },
});

// QUERY: Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .take(args.limit || 100);

    // Enrich with sender info
    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
        };
      })
    );

    return messagesWithSender;
  },
});
