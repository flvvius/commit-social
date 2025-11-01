"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Flex, Text } from "@radix-ui/themes";
import { PostCard } from "./post-card";

export function PostsList() {
  const posts = useQuery(api.posts.listRecent, { limit: 20 });

  if (posts === undefined) {
    return <Text color="gray">Loading feed…</Text>;
  }

  if (posts.length === 0) {
    return <Text color="gray">No posts yet. Be the first to post!</Text>;
  }

  return (
    <Flex direction="column" gap="3">
      {posts.map((p) => (
        <PostCard key={p._id} post={p as any} />
      ))}
    </Flex>
  );
}
