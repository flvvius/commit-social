import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Simple todos table (used by sample page)
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  // Utilizatori
  users: defineTable({
    clerkId: v.optional(v.string()), // Clerk user ID for syncing (optional for legacy docs)
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()), // optional
    bannerUrl: v.optional(v.string()), // optional
    birthday: v.optional(v.string()), // YYYY-MM-DD
    departmentId: v.optional(v.id("departments")),
    bio: v.optional(v.string()),
    isShowcase: v.optional(v.boolean()),
    streak: v.optional(v.number()), // Simple numeric streak counter
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
    badges: v.optional(v.array(v.string())), // in functie de string sa arate badge-ul ca poza
    interests: v.optional(v.array(v.id("groups"))),
    lastActive: v.optional(v.number()), //  pentru hotsreak
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),

  // Departamente (echivalent subreddits)
  departments: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly name
    emoji: v.optional(v.string()), // Visual icon
    description: v.optional(v.string()),
    members: v.optional(v.array(v.id("users"))),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  // Grupuri / Cluburi (pe interese)
  groups: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly name
    emoji: v.optional(v.string()), // Visual icon
    description: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    members: v.optional(v.array(v.id("users"))),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  // Postări
  posts: defineTable({
    authorId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
    groupId: v.optional(v.id("groups")),
    type: v.string(), // "text" | "image" | "collab"
    content: v.string(),
    // Showcase posts (achievements) get special styling on the frontend
    isShowcase: v.optional(v.boolean()),
    mediaUrls: v.optional(v.array(v.string())), // nu ii vad sensul
    media: v.optional(
      v.array(
        v.object({
          url: v.string(),
          caption: v.optional(v.string()),
        })
      )
    ),
    tags: v.optional(v.array(v.id("tags"))),
    collabId: v.optional(v.id("collaborations")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_department", ["departmentId"])
    .index("by_group", ["groupId"]),

  // Comentarii
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_parent", ["parentCommentId"]),

  // Reacții (emoji-uri / poze)
  reactions: defineTable({
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    userId: v.id("users"),
    type: v.string(), // “emoji” | “poza”
    emojiName: v.optional(v.string()), // ex: "fire", "joy", "heart"
    pozaURL: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_comment", ["commentId"]),

  // Tag-uri
  tags: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  // Quizuri zilnice / Daily game
  quizzes: defineTable({
    question: v.string(),
    answers: v.array(v.string()),
    correctAnswer: v.number(),
    date: v.string(), // ex: "2025-11-01"
  }).index("by_date", ["date"]),

  // Streaks (de răspuns la întrebări)
  streaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    lastAnsweredDate: v.string(),
  }).index("by_user", ["userId"]),

  // Notificări (inclusiv pentru “hai la țigară”)
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "comment", "reaction", "cigarette_call", etc.
    message: v.string(),
    createdAt: v.number(),
    read: v.boolean(), // o lasam aici vedem dc
  }).index("by_user", ["userId"]),

  // Zile de naștere
  birthdays: defineTable({
    userId: v.id("users"),
    date: v.string(), // ex: "YYYY-MM-DD"
  }),

  // Postări colaborative
  collaborations: defineTable({
    title: v.string(),
    participants: v.array(v.id("users")),
    // postIds: v.optional(v.array(v.id("posts"))), nu vad de ce sa avem postIds
    createdAt: v.number(),
  }),

  // Conversații (chat threads)
  conversations: defineTable({
    type: v.string(), // "direct" | "group"
    participants: v.array(v.id("users")), // array de user IDs
    lastMessageAt: v.optional(v.number()), // pentru sortare
    createdAt: v.number(),
  }).index("by_lastMessage", ["lastMessageAt"]),
  // Note: removed by_participant index - use conversationMembers table instead

  // Mesaje individuale
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())), // pentru poze/fișiere
    readBy: v.array(v.id("users")), // cine a citit mesajul
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"]),

  // Membri conversații (pentru many-to-many și status citit)
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.optional(v.number()), // când a deschis ultima dată chat-ul
    unreadCount: v.number(), // număr mesaje necitite (cached)
  })
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_conversation", ["userId", "conversationId"]),
});
