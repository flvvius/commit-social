"use client";

import { UserButton } from "@clerk/nextjs";
import { CreatePost } from "@/components/feed/create-post";
import { PostsList } from "@/components/feed/posts-list";
import { Flex } from "@radix-ui/themes";

export default function Feed() {
  return (
    <>
      <Flex direction="column" gap="4">
        <CreatePost />
        <PostsList />
        <UserButton />
      </Flex>
    </>
  );
}
