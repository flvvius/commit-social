"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Box, Card, Flex, Text, Avatar, Button, Badge, Separator, Inset } from "@radix-ui/themes";
import { CommentsSection } from "@/components/feed/comments-section";
import { useMemo, useState, useEffect } from "react";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const post = useQuery(api.posts.get, id ? { id: id as any } : "skip");
  const addReaction = useMutation(api.reactions.add);
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const urls = useMemo(() => {
    const u = (post as any)?.mediaUrls ?? [];
    const m = ((post as any)?.media ?? []).map((x: any) => x?.url).filter(Boolean);
    return u?.length ? u : m;
  }, [post]);

  useEffect(() => setIndex(0), [id, urls?.length]);

  if (post === undefined) {
    return (
      <Box p="4">
        <Text>Loading…</Text>
      </Box>
    );
  }
  if (!post) {
    return (
      <Box p="4">
        <Text>Post not found</Text>
      </Box>
    );
  }

  const initials = ((post as any).author?.name ?? "?")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const time = new Date((post as any).createdAt).toLocaleString();
  const EMOJI_MAP: Record<string, string> = { fire: "🔥", heart: "❤️", tada: "🎉", joy: "😂" };
  const emojiNames = Object.keys(EMOJI_MAP);
  const reactionCounts: Record<string, number> = (post as any).reactionCounts ?? {};

  const showcaseStyle = (post as any).isShowcase
    ? { border: "1px solid var(--amber-7)", background: "var(--amber-2)" }
    : undefined;

  return (
    <Box p="4" mx="auto" style={{ maxWidth: 800 }}>
      <Button variant="ghost" onClick={() => router.back()} mb="3">
        ← Back
      </Button>
      <Card style={showcaseStyle}>
        <Flex direction="column" gap="3">
          <Flex gap="3" align="center">
            <Avatar src={(post as any).author?.avatarUrl} fallback={initials || "?"} size="3" />
            <Box>
              <Text as="div" weight="medium">
                {(post as any).author?.name ?? "Unknown"}
              </Text>
              <Text as="div" size="1" color="gray">
                {time}
              </Text>
            </Box>
            {(post as any).isShowcase && (
              <Badge color="amber" radius="full" ml="auto">
                Showcase
              </Badge>
            )}
          </Flex>

          <Box>
            <Text as="p" size="3">
              {(post as any).content}
            </Text>
          </Box>

          {!!urls?.length && (
            <Inset>
              <Box style={{ position: "relative", width: "100%", height: 480, overflow: "hidden", borderRadius: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urls[index]}
                  alt={`image-${index}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />

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
                      ‹
                    </Button>
                  </Box>
                )}

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
                      ›
                    </Button>
                  </Box>
                )}

                {urls.length > 1 && (
                  <Flex
                    justify="center"
                    align="center"
                    gap="2"
                    style={{ position: "absolute", bottom: 8, left: 0, right: 0 }}
                  >
                    {urls.map((_: string, i: number) => (
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
                <Button
                  key={name}
                  variant="soft"
                  size="2"
                  onClick={async () => {
                    try {
                      await addReaction({ postId: (post as any)._id as any, emojiName: name });
                    } catch (err: any) {}
                  }}
                >
                  {EMOJI_MAP[name]} {reactionCounts?.[name] ? reactionCounts[name] : 0}
                </Button>
              ))}
            </Flex>
          </Flex>

          <Separator my="2" size="4" />

          {/* Extended comments */}
          <CommentsSection postId={(post as any)._id} limit={200} />
        </Flex>
      </Card>
    </Box>
  );
}
