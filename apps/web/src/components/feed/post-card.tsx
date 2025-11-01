"use client";

import { Card, Flex, Avatar, Text, Box } from "@radix-ui/themes";

type Author = {
  _id: string;
  name?: string;
  avatarUrl?: string;
};

export type Post = {
  _id: string;
  content: string;
  createdAt: number;
  author?: Author;
};

export function PostCard({ post }: { post: Post }) {
  const initials = (post.author?.name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const time = new Date(post.createdAt).toLocaleString();

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Flex gap="3" align="center">
          <Avatar src={post.author?.avatarUrl} fallback={initials || "?"} size="3" />
          <Box>
            <Text as="div" weight="medium">
              {post.author?.name ?? "Unknown"}
            </Text>
            <Text as="div" size="1" color="gray">
              {time}
            </Text>
          </Box>
        </Flex>
        <Box>
          <Text as="p">{post.content}</Text>
        </Box>
      </Flex>
    </Card>
  );
}
