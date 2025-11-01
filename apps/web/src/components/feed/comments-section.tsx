"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Box, Button, Flex, Text, TextArea, Avatar, Separator, Tooltip } from "@radix-ui/themes";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

const EMOJI_MAP: Record<string, string> = {
  fire: "🔥",
  heart: "❤️",
  tada: "🎉",
  joy: "😂",
};
const emojiNames = Object.keys(EMOJI_MAP);

export function CommentsSection({
  postId,
  answerId,
  limit = 50,
}: {
  postId?: string;
  answerId?: string;
  limit?: number;
}) {
  const isForPost = !!postId && !answerId;
  const isForAnswer = !!answerId && !postId;
  const comments = isForPost
    ? useQuery(api.comments.listByPost, { postId: postId as any, limit })
    : isForAnswer
      ? useQuery(api.comments.listByAnswer, { answerId: answerId as any, limit })
      : undefined;
  const createComment = useMutation(api.comments.create);
  const addReaction = useMutation(api.reactions.add);
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
                    if (isForPost) {
                      await createComment({ postId: postId as any, content: value.trim() } as any);
                    } else if (isForAnswer) {
                      await createComment({ answerId: answerId as any, content: value.trim() } as any);
                    }
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
          <Flex direction="column" gap="3">
            {comments.map((c: any) => (
              <CommentItem key={(c as any)._id} comment={c} onReply={createComment} onReact={addReaction} />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}

function CommentItem({
  comment,
  onReply,
  onReact,
  depth = 0,
}: {
  comment: any;
  onReply: ReturnType<typeof useMutation<typeof api.comments.create>>;
  onReact: ReturnType<typeof useMutation<typeof api.reactions.add>>;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const replies = useQuery(api.comments.listByParent, { parentCommentId: (comment as any)._id as any, limit: 50 });

  return (
    <Box>
      <Flex align="start" gap="2">
        <Avatar size="2" src={(comment as any).author?.avatarUrl} fallback="?" />
        <Box flexGrow="1">
          <Text weight="medium">{(comment as any).author?.name ?? "Unknown"}</Text>
          <Text as="div" size="2">
            {(comment as any).content}
          </Text>
          <Flex align="center" gap="2" mt="1" wrap="wrap">
            {emojiNames.map((name) => (
              <Tooltip key={name} content={`React ${EMOJI_MAP[name]}`}>
                <Button
                  size="1"
                  variant="soft"
                  onClick={async () => {
                    try {
                      await onReact({ commentId: (comment as any)._id, emojiName: name } as any);
                    } catch (err: any) {
                      toast.error(err?.message ?? "Failed to react");
                    }
                  }}
                >
                  {EMOJI_MAP[name]} {((comment as any).reactionCounts?.[name] ?? 0) as number}
                </Button>
              </Tooltip>
            ))}
            <Button size="1" variant="ghost" onClick={() => setReplying((v) => !v)}>
              Reply
            </Button>
          </Flex>
          {replying && (
            <Box mt="2">
              <TextArea
                placeholder="Write a reply"
                value={text}
                onChange={(e) => setText(e.target.value)}
                size="2"
                style={{ width: "100%" }}
              />
              <Flex justify="end" mt="2" gap="2">
                <Button variant="soft" size="1" onClick={() => setReplying(false)}>
                  Cancel
                </Button>
                <Button
                  size="1"
                  disabled={!text.trim()}
                  onClick={async () => {
                    try {
                      const payload: any = {
                        content: text.trim(),
                        parentCommentId: (comment as any)._id,
                      };
                      if ((comment as any).postId) payload.postId = (comment as any).postId;
                      if ((comment as any).answerId) payload.answerId = (comment as any).answerId;
                      await onReply(payload);
                      setText("");
                      setReplying(false);
                    } catch (err: any) {
                      toast.error(err?.message ?? "Failed to reply");
                    }
                  }}
                >
                  Reply
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
      {/* Replies */}
      {replies && replies.length > 0 && (
        <Box ml="5" mt="2">
          <Separator my="2" size="4" />
          <Flex direction="column" gap="2">
            {replies.map((r: any) => (
              <CommentItem key={(r as any)._id} comment={r} onReply={onReply} onReact={onReact} depth={depth + 1} />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}
