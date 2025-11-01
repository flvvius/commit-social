import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { title: v.string(), body: v.string(), tags: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    if (!identity.email) throw new Error("Missing email");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
    if (!user) throw new Error("User not found");

    const id = await ctx.db.insert("questions", {
      authorId: user._id,
      title: args.title,
      body: args.body,
      tags: args.tags,
      acceptedAnswerId: undefined,
      createdAt: Date.now(),
      updatedAt: undefined,
    });
    return await ctx.db.get(id);
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);
    const items = await ctx.db.query("questions").order("desc").take(limit);
    return Promise.all(
      items.map(async (q) => {
        const author = await ctx.db.get(q.authorId);
        const answers = await ctx.db
          .query("answers")
          .withIndex("by_question", (qb) => qb.eq("questionId", q._id))
          .collect();
        return {
          ...q,
          author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
          answersCount: answers.length,
        } as any;
      })
    );
  },
});

export const get = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const q = await ctx.db.get(args.id);
    if (!q) return null;
    const author = await ctx.db.get(q.authorId);
    // determine if current user is the author (without exposing email)
    let isMine = false;
    if (identity?.email) {
      const me = await ctx.db
        .query("users")
        .withIndex("by_email", (qb) => qb.eq("email", identity.email!))
        .unique();
      if (me && me._id === q.authorId) isMine = true;
    }
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (qb) => qb.eq("questionId", q._id))
      .collect();
    // collect reaction counts per answer
    const enriched = await Promise.all(
      answers.map(async (a) => {
        const aAuthor = await ctx.db.get(a.authorId);
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_answer", (ri) => ri.eq("answerId", a._id))
          .collect();
        const reactionCounts = reactions.reduce<Record<string, number>>((acc, r) => {
          const key = (r as any).emojiName ?? (r as any).emoji;
          if (key) acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        const totalReacts = Object.values(reactionCounts).reduce((s, n) => s + n, 0);
        return {
          ...a,
          author: aAuthor ? { _id: aAuthor._id, name: aAuthor.name, avatarUrl: aAuthor.avatarUrl } : undefined,
          reactionCounts,
          totalReacts,
        } as any;
      })
    );

    // sort by total reacts desc; keep accepted at top if present
    const acceptedId = q.acceptedAnswerId?.toString();
    const sorted = enriched.sort((x, y) => (y as any).totalReacts - (x as any).totalReacts);
    let answersSorted = sorted;
    if (acceptedId) {
      const idx = sorted.findIndex((a) => a._id.toString() === acceptedId);
      if (idx > -1) {
        const [acc] = sorted.splice(idx, 1);
        answersSorted = [acc, ...sorted];
      }
    }

    return {
      ...q,
      author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : undefined,
      answers: answersSorted,
      isMine,
    } as any;
  },
});
