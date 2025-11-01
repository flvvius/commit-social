"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Flex, Text } from "@radix-ui/themes";
import { PostCard } from "./post-card";
import { FeedFilters } from "./feed-filters";
import { useState, useMemo } from "react";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";

export function PostsList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const posts = useQuery(api.posts.listRecent, {
    limit: 20,
    departmentId: selectedDepartment
      ? (selectedDepartment as Id<"departments">)
      : undefined,
    groupId: selectedGroup ? (selectedGroup as Id<"groups">) : undefined,
  });

  // Filter posts based on search query with fuzzy search
  const filteredPosts = useMemo(() => {
    if (!posts) return undefined;
    if (!searchQuery.trim()) return posts;

    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(posts, {
      keys: [
        { name: "content", weight: 2 }, // Give content higher weight
        { name: "author.name", weight: 1.5 },
        { name: "group.name", weight: 1 },
        { name: "department.name", weight: 1 },
      ],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [posts, searchQuery]);

  if (posts === undefined) {
    return <Text color="gray">Loading feed…</Text>;
  }

  return (
    <>
      <FeedFilters
        selectedDepartment={selectedDepartment}
        selectedGroup={selectedGroup}
        onDepartmentChange={setSelectedDepartment}
        onGroupChange={setSelectedGroup}
      />

      {searchQuery && (
        <Text size="2" color="gray" mb="2">
          Showing results for "{searchQuery}" ({filteredPosts?.length || 0}{" "}
          {filteredPosts?.length === 1 ? "post" : "posts"})
        </Text>
      )}

      {filteredPosts && filteredPosts.length === 0 ? (
        <Text color="gray">
          {searchQuery
            ? `No posts found for "${searchQuery}"`
            : "No posts yet. Be the first to post!"}
        </Text>
      ) : (
        <Flex direction="column" gap="3">
          {filteredPosts?.map((p) => (
            <PostCard key={p._id} post={p as any} />
          ))}
        </Flex>
      )}
    </>
  );
}
