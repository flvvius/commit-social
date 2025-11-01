"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Flex, Text } from "@radix-ui/themes";
import { PostCard } from "./post-card";
import { FeedFilters } from "./feed-filters";
import { useState } from "react";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";

export function PostsList() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const posts = useQuery(api.posts.listRecent, {
    limit: 20,
    departmentId: selectedDepartment
      ? (selectedDepartment as Id<"departments">)
      : undefined,
    groupId: selectedGroup ? (selectedGroup as Id<"groups">) : undefined,
  });

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

      {posts.length === 0 ? (
        <Text color="gray">No posts yet. Be the first to post!</Text>
      ) : (
        <Flex direction="column" gap="3">
          {posts.map((p) => (
            <PostCard key={p._id} post={p as any} />
          ))}
        </Flex>
      )}
    </>
  );
}
