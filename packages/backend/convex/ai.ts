import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Knowledge Base CRUD
export const createDoc = mutation({
  args: { title: v.string(), content: v.string(), tags: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
    const id = await ctx.db.insert("kbDocs", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      authorId: user?._id,
      createdAt: Date.now(),
      updatedAt: undefined,
    });
    return await ctx.db.get(id);
  },
});

export const listDocs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const docs = await ctx.db.query("kbDocs").order("desc").take(limit);
    return docs;
  },
});

export const deleteDoc = mutation({
  args: { id: v.id("kbDocs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function score(query: string, title: string, content: string): number {
  const q = new Set(tokenize(query));
  const words = tokenize(title + " " + content);
  let s = 0;
  for (const w of words) if (q.has(w)) s += 1;
  // small title weight boost
  for (const w of tokenize(title)) if (q.has(w)) s += 1;
  return s;
}

// Ask AI with KB grounding
export const answerQuestion = action({
  args: { questionId: v.optional(v.id("questions")), text: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY env var. Run: npx convex env set OPENAI_API_KEY sk-***");
    }

    let questionText = args.text ?? "";
    if (args.questionId) {
      const q: any = await ctx.runQuery(api.questions.get, { id: args.questionId });
      if (!q) throw new Error("Question not found");
      questionText = `${q.title}\n\n${q.body}`;
    }
    if (!questionText.trim()) throw new Error("Missing question text");

    const allDocs: any[] = await ctx.runQuery(api.ai.listDocs, { limit: 200 });
    const ranked = allDocs
      .map((d: any) => ({ d, s: score(questionText, d.title, d.content) }))
      .sort((a: any, b: any) => b.s - a.s)
      .slice(0, 3);

    const contextBlocks = ranked
      .filter((r: any) => r.s > 0)
      .map(({ d }: any) => `Title: ${d.title}\nContent: ${d.content.slice(0, 2000)}`);

    const system =
      "You are a helpful assistant for an internal Q&A tool. Use ONLY the provided context blocks to answer. If the context is insufficient, say you don't have enough information. Be concise (max ~150 words).";

    const messages = [
      { role: "system", content: system },
      contextBlocks.length
        ? {
            role: "system",
            content: `Context blocks:\n\n${contextBlocks.map((c: string, i: number) => `[${i + 1}]\n${c}`).join("\n\n")}`,
          }
        : undefined,
      { role: "user", content: questionText },
    ].filter(Boolean) as Array<{ role: string; content: string }>;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        max_tokens: 500,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`OpenAI error: ${resp.status} ${text}`);
    }
    const data = (await resp.json()) as any;
    const answer = data?.choices?.[0]?.message?.content ?? "";
    return {
      answer,
      usedDocs: ranked.map(({ d }: any) => ({ _id: d._id, title: d.title })),
    } as any;
  },
});
