import { mutation } from "./_generated/server";

function formatUTCDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayUTCString() {
  return formatUTCDate(new Date());
}

// Seed initial departments and groups for demo
export const seedData = mutation({
  handler: async (ctx) => {
    // Seed departments if none exist
    const existingDepts = await ctx.db.query("departments").take(1);
    let departmentsCreated = 0;
    if (existingDepts.length === 0) {
      await Promise.all([
        ctx.db.insert("departments", {
          name: "Engineering",
          slug: "engineering",
          emoji: "💻",
          description: "Tech discussions and code reviews",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("departments", {
          name: "Design",
          slug: "design",
          emoji: "🎨",
          description: "Design trends and UI/UX discussions",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("departments", {
          name: "Marketing",
          slug: "marketing",
          emoji: "📢",
          description: "Campaign ideas and growth strategies",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("departments", {
          name: "Product",
          slug: "product",
          emoji: "🚀",
          description: "Product roadmap and feature discussions",
          members: [],
          createdAt: Date.now(),
        }),
      ]);
      departmentsCreated = 4;
    }

    // Seed groups if none exist
    const existingGroups = await ctx.db.query("groups").take(1);
    let groupsCreated = 0;
    if (existingGroups.length === 0) {
      await Promise.all([
        ctx.db.insert("groups", {
          name: "Book Club",
          slug: "book-club",
          emoji: "📚",
          description: "Monthly book discussions and recommendations",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("groups", {
          name: "Coffee Lovers",
          slug: "coffee-lovers",
          emoji: "☕",
          description: "Everything about coffee, from brewing to cafes",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("groups", {
          name: "Gaming",
          slug: "gaming",
          emoji: "🎮",
          description: "Video games, board games, and everything in between",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("groups", {
          name: "Fitness",
          slug: "fitness",
          emoji: "💪",
          description: "Workout tips, nutrition, and health discussions",
          members: [],
          createdAt: Date.now(),
        }),
        ctx.db.insert("groups", {
          name: "Smokers Lounge",
          slug: "smokers-lounge",
          emoji: "🚬",
          description: "For the cigarette break crew",
          members: [],
          createdAt: Date.now(),
        }),
      ]);
      groupsCreated = 5;
    }

    // Ensure there's a quiz for today
    const today = getTodayUTCString();
    const existingTodayQuiz = await ctx.db
      .query("quizzes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    let quizCreated = false;
    if (!existingTodayQuiz) {
      await ctx.db.insert("quizzes", {
        date: today,
        question: "What does CSS stand for?",
        answers: [
          "Computer Style Sheets",
          "Cascading Style Sheets",
          "Creative Styling System",
          "Colorful Style Syntax",
        ],
        correctAnswer: 1,
      });
      quizCreated = true;
    }

    const parts: string[] = [];
    if (departmentsCreated) parts.push(`${departmentsCreated} departments`);
    if (groupsCreated) parts.push(`${groupsCreated} groups`);
    parts.push(quizCreated ? "quiz for today" : "quiz already existed for today");

    return {
      message: `Seed complete: ${parts.join(", ")}`,
    };
  },
});
