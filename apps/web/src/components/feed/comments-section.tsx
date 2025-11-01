"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Box, Button, Flex, Text, TextArea, Avatar } from "@radix-ui/themes";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export function CommentsSection({ postId, limit = 50 }: { postId: string; limit?: number }) {
  const comments = useQuery(api.comments.listByPost, { postId: postId as any, limit });
  const createComment = useMutation(api.comments.create);
  const { user } = useUser();
  const [value, setValue] = useState("");

  return (
    <Box>
      <SignedIn>
        <Flex align="start" gap="2">
          <Avatar size="2" src={user?.imageUrl ?? undefined} fallback="?" />
          <Box flexGrow="1">
            <TextArea
              placeholder="Write a comment"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              size="2"
              style={{ width: "100%" }}
            />
            <Flex justify="end" mt="2">
              <Button
                disabled={!value.trim()}
                onClick={async () => {
                  try {
                    await createComment({ postId: postId as any, content: value.trim() });
                    setValue("");
                  } catch (err: any) {
                    toast.error(err?.message ?? "Failed to comment");
                  }
                }}
              >
                Comment
              </Button>
            </Flex>
          </Box>
        </Flex>
      </SignedIn>
      <SignedOut>
        <Flex align="center" gap="2">
          <Text color="gray">Sign in to comment</Text>
          <SignInButton mode="modal">
            <Button size="1">Sign in</Button>
          </SignInButton>
        </Flex>
      </SignedOut>

      <Box mt="3">
        {comments === undefined ? (
          <Text color="gray">Loading comments…</Text>
        ) : comments.length === 0 ? (
          <Text color="gray">No comments yet</Text>
        ) : (
          <Flex direction="column" gap="2">
            {comments.map((c: any) => (
              <Flex key={(c as any)._id} align="start" gap="2">
                <Avatar size="2" src={(c as any).author?.avatarUrl} fallback="?" />
                <Box>
                  <Text weight="medium">{(c as any).author?.name ?? "Unknown"}</Text>
                  <Text as="div" size="2">
                    {(c as any).content}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
