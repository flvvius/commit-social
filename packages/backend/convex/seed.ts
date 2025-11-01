import { mutation } from "./_generated/server";

// Seed initial departments and groups for demo
export const seedData = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingDepts = await ctx.db.query("departments").take(1);
    if (existingDepts.length > 0) {
      return { message: "Already seeded" };
    }

    // Create departments
    const deptIds = await Promise.all([
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

    // Create groups
    const groupIds = await Promise.all([
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

    return { 
      message: "Seeded successfully",
      departments: deptIds.length,
      groups: groupIds.length,
    };
  },
});
