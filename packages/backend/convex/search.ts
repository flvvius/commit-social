import { v } from "convex/values";
import { query } from "./_generated/server";

// Global search across posts, users, and groups
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = Math.min(args.limit ?? 20, 50);

    if (searchQuery.length === 0) {
      return { posts: [], users: [], groups: [] };
    }

    // Get current user to check permissions
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;
    if (identity?.email) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
    }

    // Search posts
    const allPosts = await ctx.db.query("posts").collect();
    const matchingPosts = allPosts
      .filter((post) => {
        // Check if user can see this post (group permission check)
        if (post.groupId) {
          if (!currentUser?.interests?.includes(post.groupId)) {
            return false;
          }
        }

        // Search in content
        return post.content.toLowerCase().includes(searchQuery);
      })
      .slice(0, limit);

    // Enrich posts with author info
    const posts = await Promise.all(
      matchingPosts.map(async (p) => {
        const author = await ctx.db.get(p.authorId);
        return {
          ...p,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                avatarUrl: author.avatarUrl,
              }
            : undefined,
        };
      })
    );

    // Search users
    const allUsers = await ctx.db.query("users").collect();
    const users = allUsers
      .filter((user) => {
        const name = user.name.toLowerCase();
        const email = user.email.toLowerCase();
        const bio = ((user as any).bio || "").toLowerCase();
        return (
          name.includes(searchQuery) ||
          email.includes(searchQuery) ||
          bio.includes(searchQuery)
        );
      })
      .slice(0, limit)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        bio: (u as any).bio,
      }));

    // Search groups
    const allGroups = await ctx.db.query("groups").collect();
    const groups = allGroups
      .filter((group) => {
        const name = group.name.toLowerCase();
        const description = (group.description || "").toLowerCase();
        return name.includes(searchQuery) || description.includes(searchQuery);
      })
      .slice(0, limit)
      .map((g) => ({
        _id: g._id,
        name: g.name,
        emoji: g.emoji,
        description: g.description,
        memberCount: g.members?.length || 0,
      }));

    return { posts, users, groups };
  },
});
