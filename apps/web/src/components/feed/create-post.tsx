"use client";

import { useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Box, Flex, Avatar, TextArea, Button, Card, Text } from "@radix-ui/themes";
import { toast } from "sonner";

type CreatePostProps = {
  placeholder?: string;
  onCreated?: () => void;
};

export function CreatePost({ placeholder = "Share something...", onCreated }: CreatePostProps) {
  const { user } = useUser();
  const createPost = useMutation(api.posts.create);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = submitting || content.trim().length === 0;

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await createPost({ content: content.trim() });
      setContent("");
      toast.success("Posted");
      onCreated?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="classic">
      <SignedIn>
        <Flex direction="column" gap="3">
          <Flex gap="3" align="start">
            <Avatar
              size="3"
              src={user?.imageUrl ?? undefined}
              fallback={(user?.firstName?.[0] ?? "").concat(user?.lastName?.[0] ?? "").toUpperCase() || "?"}
            />
            <Box flexGrow="1">
              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                size="3"
                variant="soft"
                style={{ width: "100%" }}
              />
            </Box>
          </Flex>
          <Flex justify="end">
            <Button onClick={handleSubmit} disabled={disabled} loading={submitting} variant="solid">
              Post
            </Button>
          </Flex>
        </Flex>
      </SignedIn>
      <SignedOut>
        <Flex align="center" justify="between" gap="3">
          <Text color="gray">Sign in to create a post</Text>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Flex>
      </SignedOut>
    </Card>
  );
}
