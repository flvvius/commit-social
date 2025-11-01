"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Flex,
  Avatar,
  Text,
  Box,
  Button,
  Inset,
  Separator,
  Tooltip,
  Badge,
} from "@radix-ui/themes";
import { useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { toast } from "sonner";
import { CommentsSection } from "./comments-section";

type Author = {
  _id: string;
  name?: string;
  avatarUrl?: string;
};

type Department = {
  _id: string;
  name: string;
  emoji?: string;
};

type Group = {
  _id: string;
  name: string;
  emoji?: string;
};

export type Post = {
  _id: string;
  content: string;
  createdAt: number;
  author?: Author;
  mediaUrls?: string[];
  reactionCounts?: Record<string, number>;
  isShowcase?: boolean;
  department?: Department;
  group?: Group;
};

export function PostCard({ post }: { post: Post }) {
  const [index, setIndex] = useState(0);
  const initials = (post.author?.name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const urls = useMemo(() => {
    const fromUrls = post.mediaUrls ?? [];
    // Fallback if media (with captions) exists in the payload
    const fromMedia: string[] = (post as any)?.media?.map((m: any) => m?.url).filter(Boolean) ?? [];
    return (fromUrls.length ? fromUrls : fromMedia) as string[];
  }, [post]);

  // Reset carousel index when post changes or image count changes
  useEffect(() => {
    setIndex(0);
  }, [post._id, urls?.length]);

  const time = new Date(post.createdAt).toLocaleString();
  const addReaction = useMutation(api.reactions.add);
  const EMOJI_MAP: Record<string, string> = {
    fire: "🔥",
    heart: "❤️",
    tada: "🎉",
    joy: "😂",
  };
  const emojiNames = Object.keys(EMOJI_MAP);

  const showcaseStyle = post.isShowcase
    ? { border: "1px solid var(--amber-7)", background: "var(--amber-2)" }
    : undefined;

  return (
    <Card style={showcaseStyle}>
      <Flex direction="column" gap="2">
        <Flex gap="3" align="center">
          <Avatar
            src={post.author?.avatarUrl}
            fallback={initials || "?"}
            size="3"
          />
          <Box>
            <Text as="div" weight="medium">
              {post.author?.name ?? "Unknown"}
            </Text>
            <Flex align="center" gap="2">
              <Text as="div" size="1" color="gray">
                {time}
              </Text>
              {/* Department Badge */}
              {post.department && (
                <Badge size="1" variant="soft" color="blue">
                  {post.department.emoji} {post.department.name}
                </Badge>
              )}
              {/* Group Badge */}
              {post.group && (
                <Badge size="1" variant="soft" color="green">
                  {post.group.emoji} {post.group.name}
                </Badge>
              )}
            </Flex>
          </Box>
          {post.isShowcase && (
            <Badge color="amber" radius="full" ml="auto">
              Showcase
            </Badge>
          )}
        </Flex>
        <Box>
          <Text as="p">{post.content}</Text>
        </Box>
        {!!urls?.length && (
          <Inset>
            <Box style={{ position: "relative", width: "100%", height: 520, overflow: "hidden", borderRadius: 8 }}>
              {/* Current image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[index]}
                alt={`image-${index}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* Left control */}
              {urls.length > 1 && (
                <Box style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                  <Button
                    radius="full"
                    variant="solid"
                    size="2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((prev) => (prev - 1 + urls.length) % urls.length);
                    }}
                    aria-label="Previous image"
                  >
                    &lt;
                  </Button>
                </Box>
              )}

              {/* Right control */}
              {urls.length > 1 && (
                <Box style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                  <Button
                    radius="full"
                    variant="solid"
                    size="2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((prev) => (prev + 1) % urls.length);
                    }}
                    aria-label="Next image"
                  >
                    &gt;
                  </Button>
                </Box>
              )}

              {/* Dots */}
              {urls.length > 1 && (
                <Flex
                  justify="center"
                  align="center"
                  gap="2"
                  style={{ position: "absolute", bottom: 8, left: 0, right: 0 }}
                >
                  {urls.map((_, i) => (
                    <Button
                      key={i}
                      size="1"
                      variant={i === index ? "solid" : "soft"}
                      radius="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndex(i);
                      }}
                      aria-label={`Go to image ${i + 1}`}
                    >
                      {/* small dot */}
                      <Box style={{ width: 8, height: 8, borderRadius: 9999 }} />
                    </Button>
                  ))}
                </Flex>
              )}
            </Box>
          </Inset>
        )}
        <Separator my="2" size="4" />
        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            {emojiNames.map((name) => (
              <Tooltip key={name} content={`React ${EMOJI_MAP[name]}`}>
                <Button
                  variant="soft"
                  size="2"
                  onClick={async () => {
                    try {
                      await addReaction({
                        postId: post._id as any,
                        emojiName: name,
                      });
                    } catch (err: any) {
                      toast.error(err?.message ?? "Failed to react");
                    }
                  }}
                >
                  {EMOJI_MAP[name]}{" "}
                  {post.reactionCounts?.[name] ? post.reactionCounts[name] : 0}
                </Button>
              </Tooltip>
            ))}
          </Flex>
          <Flex align="center" gap="2">
            <Button
              variant="ghost"
              onClick={async () => {
                const content = window.prompt("Add a comment:");
                if (!content) return;
                try {
                  const createComment = (
                    await import("convex/react")
                  ).useMutation?.(api.comments.create);
                  // Fallback: if hook can't be used dynamically, just toast guidance
                  toast.message(
                    "Comment UI not fully wired in this build. TODO: implement inline."
                  );
                } catch {}
              }}
            >
              Comment
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const link = `${location.origin}/feed#${post._id}`;
                try {
                  if (navigator.share) {
                    await navigator.share({ url: link });
                  } else {
                    await navigator.clipboard.writeText(link);
                    toast.success("Link copied");
                  }
                } catch {}
              }}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.message("Award coming soon ✨")}
            >
              Award
            </Button>
          </Flex>
        </Flex>
        <Separator my="2" size="4" />
        <CommentsSection postId={post._id} />
      </Flex>
    </Card>
  );
}
