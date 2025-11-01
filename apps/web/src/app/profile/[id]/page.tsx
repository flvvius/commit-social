"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Link as RLink,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  Flame,
  ArrowLeft,x
} from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { AVAILABLE_BADGES, badgeUrl } from "@/lib/badges";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";

type SocialLink = { platform: string; url: string };

function SocialIcon({ platform }: { platform?: string }) {
  const key = (platform ?? "").toLowerCase();
  if (key.includes("git")) return <Github size={16} />;
  if (key.includes("link")) return <Linkedin size={16} />;
  if (key.includes("x") || key.includes("twit")) return <Twitter size={16} />;
  return <Globe size={16} />;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as Id<"users">;

  const user = useQuery(api.users.getUserById, { userId });
  const posts = useQuery(api.posts.listRecent, { limit: 50 });
  const streak = useQuery(api.streaks.getCurrent, {});
  const currentUser = useQuery(api.users.getCurrentUser);

  // Filter to user's posts only
  const userPosts = useMemo(() => {
    if (!user || !posts) return undefined;
    return posts.filter((p: any) => (p.author?._id ?? p.authorId) === user._id);
  }, [user, posts]);

  const isOwnProfile = currentUser?._id === userId;

  if (user === undefined || posts === undefined) {
    return <Text color="gray">Loading profile…</Text>;
  }

  if (!user) {
    return (
      <Card>
        <Flex direction="column" gap="3" align="center" py="5">
          <Text size="3" weight="medium">
            User not found
          </Text>
          <Link href="/feed">
            <Button variant="soft">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </Flex>
      </Card>
    );
  }

  const name = user.name ?? "User";
  const avatarUrl = user.avatarUrl as string | undefined;
  const bannerUrl = (user as any).bannerUrl as string | undefined;
  const bio = (user as any).bio as string | undefined;
  const socialLinks = ((user as any).socialLinks ?? []) as SocialLink[];
  const userBadges = ((user as any).badges ?? []) as string[];
  const department = (user as any).department;
  const groups = (user as any).groups || [];

  const badgesToShow = AVAILABLE_BADGES;
  const earnedBadges = badgesToShow.filter((b) => userBadges.includes(b));

  return (
    <Flex direction="column" gap="5">
      {/* Back Navigation */}
      {!isOwnProfile && (
        <Link href="/feed">
          <Button variant="ghost" size="2">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      )}

      {/* Banner + Avatar */}
      <Card variant="surface">
        <Box position="relative">
          <div
            style={{
              width: "100%",
              height: 180,
              borderRadius: 12,
              background: bannerUrl
                ? `url(${bannerUrl}) center/cover no-repeat`
                : "linear-gradient(135deg, var(--accent-6), var(--accent-8))",
            }}
          />
          <Flex align="end" gap="4" mt="-6" px="4" pb="3">
            <Avatar
              size="6"
              src={avatarUrl}
              fallback={
                (name || "?")
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"
              }
              style={{ boxShadow: "0 0 0 4px var(--color-panel)" }}
            />
            <Box>
              <Text as="div" size="5" weight="bold">
                {name}
              </Text>
              {(user as any).position && (
                <Text as="div" size="3" color="gray" mb="1">
                  {(user as any).position}
                </Text>
              )}
              {bio && (
                <Text as="div" color="gray">
                  {bio}
                </Text>
              )}
            </Box>
            {isOwnProfile && (
              <Box ml="auto">
                <Link href="/profile">
                  <Button variant="soft" size="2">
                    Edit Profile
                  </Button>
                </Link>
              </Box>
            )}
          </Flex>

          {/* Social links */}
          <Box style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}>
            <Flex gap="3" wrap="wrap">
              {socialLinks.length > 0 ? (
                socialLinks.map((s, i) => (
                  <RLink key={i} href={s.url} target="_blank" rel="noreferrer">
                    <Flex align="center" gap="2">
                      <SocialIcon platform={s.platform} />
                      <Text size="2">
                        {new URL(s.url).hostname.replace("www.", "")}
                      </Text>
                    </Flex>
                  </RLink>
                ))
              ) : (
                <Text color="gray" size="2">
                  No social links
                </Text>
              )}
            </Flex>
          </Box>
        </Box>
      </Card>

      {/* Department */}
      {department && (
        <Card>
          <Flex align="center" gap="3" px="3" py="2">
            <Text weight="medium">Department</Text>
            <Separator orientation="vertical" size="4" my="2" />
            <Flex align="center" gap="2">
              <span style={{ fontSize: "1.5rem" }}>{department.emoji}</span>
              <Text size="2">{department.name}</Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <Card>
          <Flex align="center" justify="between" px="3">
            <Text weight="medium">Groups</Text>
            <Badge color="blue" radius="full">
              {groups.length}
            </Badge>
          </Flex>
          <Separator my="3" size="4" />
          <Box style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
            <Flex gap="2" wrap="wrap">
              {groups.map((group: any) => (
                <Link key={group._id} href={`/groups/${group._id}`}>
                  <Button variant="soft" size="2">
                    <span>{group.emoji}</span>
                    {group.name}
                  </Button>
                </Link>
              ))}
            </Flex>
          </Box>
        </Card>
      )}

      {/* Streak - only show for own profile or if we have data */}
      {isOwnProfile && (
        <Card>
          <Flex align="center" gap="3" px="3" py="2">
            <Flame color="var(--orange-11)" />
            <Text weight="medium">Streak</Text>
            <Separator orientation="vertical" size="4" my="2" />
            {streak === undefined ? (
              <Text color="gray">Loading…</Text>
            ) : (
              <Flex gap="3" wrap="wrap" align="center">
                <Badge color="orange" radius="full">
                  {(streak as any).currentStreak ?? 0} days
                </Badge>
                {(streak as any).lastAnsweredDate && (
                  <Text color="gray" size="2">
                    Last activity: {(streak as any).lastAnsweredDate}
                  </Text>
                )}
              </Flex>
            )}
          </Flex>
        </Card>
      )}

      {/* Badges - Earned */}
      <Card>
        <Flex align="center" justify="between" px="3">
          <Text weight="medium">Badges Earned</Text>
          <Badge color="green" radius="full">
            {earnedBadges.length}
          </Badge>
        </Flex>
        <Separator my="3" size="4" />
        <Box style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 12,
            }}
          >
            {earnedBadges.length > 0 ? (
              earnedBadges.map((file, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badgeUrl(file)}
                    alt={file.replace(/\.[^.]+$/, "")}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 12,
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))
            ) : (
              <Text color="gray">No badges earned yet.</Text>
            )}
          </div>
        </Box>
      </Card>

      {/* Badges - All */}
      <Card>
        <Flex align="center" justify="between" px="3">
          <Text weight="medium">All Badges</Text>
          <Badge color="gray" radius="full">
            {badgesToShow.length}
          </Badge>
        </Flex>
        <Separator my="3" size="4" />
        <Box style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 12,
            }}
          >
            {badgesToShow.map((file, i) => {
              const isEarned = userBadges.includes(file);
              return (
                <div key={i} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badgeUrl(file)}
                    alt={file.replace(/\.[^.]+$/, "")}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 12,
                      objectFit: "cover",
                      filter: isEarned
                        ? undefined
                        : "grayscale(100%) brightness(0.6)",
                    }}
                  />
                  {!isEarned && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        borderRadius: 12,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Box>
      </Card>

      {/* Feed: user's posts */}
      <Box>
        <Text as="div" size="4" weight="medium" mb="2">
          {isOwnProfile ? "My Posts" : `${name}'s Posts`}
        </Text>
        {userPosts === undefined ? (
          <Text color="gray">Loading posts…</Text>
        ) : userPosts.length === 0 ? (
          <Card>
            <Box p="3">
              <Text color="gray">No posts yet.</Text>
            </Box>
          </Card>
        ) : (
          <Flex direction="column" gap="3">
            {userPosts.map((p: any) => (
              <PostCard key={p._id} post={p as any} />
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
