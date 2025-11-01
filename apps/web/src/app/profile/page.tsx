"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import {
  Avatar,
  Badge,
  Box,
  Card,
  Button,
  Dialog,
  Flex,
  Inset,
  Link as RLink,
  Separator,
  TextArea,
  TextField,
  Text,
  Tooltip,
  Select,
} from "@radix-ui/themes";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  Flame,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { AVAILABLE_BADGES, badgeUrl, getBadgeMeta } from "@/lib/badges";
import Link from "next/link";

type SocialLink = { platform: string; url: string };

// Platforme sociale predefinite
const SOCIAL_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Twitter/X",
  "Facebook",
  "Instagram",
  "YouTube",
  "TikTok",
  "Behance",
  "Dribbble",
  "Medium",
  "Dev.to",
  "Stack Overflow",
  "Website",
  "Other",
];

function SocialIcon({ platform }: { platform?: string }) {
  const key = (platform ?? "").toLowerCase();
  if (key.includes("git")) return <Github size={16} />;
  if (key.includes("link")) return <Linkedin size={16} />;
  if (key.includes("x") || key.includes("twit")) return <Twitter size={16} />;
  return <Globe size={16} />;
}

export default function ProfilePage() {
  const user = useQuery(api.users.getCurrentUser);
  const posts = useQuery(api.posts.listRecent, { limit: 50 });
  const streak = useQuery(api.streaks.getCurrent, {});
  const updateProfile = useMutation(api.users.updateProfile);

  // Edit dialog state
  const [open, setOpen] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bannerDraft, setBannerDraft] = useState("");
  const [birthdayDraft, setBirthdayDraft] = useState("");
  const [linksDraft, setLinksDraft] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize edit form when user loads (must be declared before any early return)
  useEffect(() => {
    if (!user) return;
    const u: any = user;
    const links = ((u.socialLinks ?? []) as SocialLink[]) ?? [];
    setBioDraft((u.bio as string) ?? "");
    setBannerDraft((u.bannerUrl as string) ?? "");
    setBirthdayDraft(((u as any).birthday as string) ?? "");
    setLinksDraft([...links]);
    // Only re-run when the identity of the user doc changes
  }, [user?._id]);

  // Filter to personal posts only
  const myPosts = useMemo(() => {
    if (!user || !posts) return undefined;
    return posts.filter((p: any) => (p.author?._id ?? p.authorId) === user._id);
  }, [user, posts]);

  if (user === undefined) {
    return <Text color="gray">Se încarcă profilul…</Text>;
  }

  if (!user) {
    return (
      <Card>
        <Flex direction="column" gap="3" align="center" py="5">
          <Text size="3" weight="medium">
            Trebuie să te autentifici pentru a-ți vedea profilul
          </Text>
          <SignedOut>
            <SignInButton mode="modal">
              {/* Using Radix Link styling for a clean CTA */}
              <RLink href="#">Autentifică-te</RLink>
            </SignInButton>
          </SignedOut>
        </Flex>
      </Card>
    );
  }

  const name = user.name ?? "Utilizator";
  const avatarUrl = user.avatarUrl as string | undefined;
  const bannerUrl = (user as any).bannerUrl as string | undefined;
  const bio = (user as any).bio as string | undefined;
  const socialLinks = ((user as any).socialLinks ?? []) as SocialLink[];
  const userBadges = ((user as any).badges ?? []) as string[];
  // Images available under /public/badges
  const badgesToShow = AVAILABLE_BADGES;
  const earnedBadges = badgesToShow.filter((b) => userBadges.includes(b));

  // (moved useEffect above to avoid breaking Hooks order with early returns)

  const onAddLink = () =>
    setLinksDraft((arr) => [...arr, { platform: "GitHub", url: "" }]);
  const onRemoveLink = (idx: number) =>
    setLinksDraft((arr) => arr.filter((_, i) => i !== idx));
  const onChangeLink = (idx: number, key: keyof SocialLink, val: string) =>
    setLinksDraft((arr) =>
      arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it))
    );

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: bioDraft,
        bannerUrl: bannerDraft || undefined,
        birthday: birthdayDraft || undefined,
        socialLinks: linksDraft
          .filter((l) => l.url.trim().length > 0)
          .map((l) => ({ platform: l.platform || "Website", url: l.url })),
      });
      setOpen(false);
    } catch (e) {
      // Swallow for now; Toaster available if desired later
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex direction="column" gap="5">
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
            <Link href="/admin/kb">
              <Button variant="soft" size="2">
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Box ml="auto">
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                  <Button variant="soft" size="2">
                    <Pencil size={14} /> Editare profil
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content size="4">
                  <Dialog.Title>Editează profilul</Dialog.Title>
                  <Separator my="3" size="4" />
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" color="gray">
                        Banner URL
                      </Text>
                      <TextField.Root
                        value={bannerDraft}
                        onChange={(e) => setBannerDraft(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <Text size="2" color="gray">
                        Descriere
                      </Text>
                      <TextArea
                        value={bioDraft}
                        onChange={(e) => setBioDraft(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <Text size="2" color="gray">
                        Ziua de naștere
                      </Text>
                      <TextField.Root
                        type="date"
                        value={birthdayDraft}
                        onChange={(e) => setBirthdayDraft(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <Text size="2" color="gray">
                        Link-uri sociale
                      </Text>
                      <Flex direction="column" gap="2">
                        {linksDraft.map((lk, i) => (
                          <Flex key={i} align="center" gap="2">
                            <Select.Root
                              value={lk.platform}
                              onValueChange={(val) =>
                                onChangeLink(i, "platform", val)
                              }
                            >
                              <Select.Trigger
                                placeholder="Platformă"
                                style={{ minWidth: 140 }}
                              />
                              <Select.Content>
                                {SOCIAL_PLATFORMS.map((platform) => (
                                  <Select.Item key={platform} value={platform}>
                                    {platform}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                            <TextField.Root
                              placeholder="https://…"
                              value={lk.url}
                              onChange={(e) =>
                                onChangeLink(i, "url", e.target.value)
                              }
                              style={{ flex: 1 }}
                            />
                            <Button
                              variant="ghost"
                              color="red"
                              onClick={() => onRemoveLink(i)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Flex>
                        ))}
                        <Button variant="soft" onClick={onAddLink}>
                          <Plus size={14} /> Adaugă link
                        </Button>
                      </Flex>
                    </Box>
                    <Flex justify="end" gap="2" mt="2">
                      <Dialog.Close>
                        <Button variant="soft">Anulează</Button>
                      </Dialog.Close>
                      <Button
                        onClick={onSave}
                        disabled={saving}
                        loading={saving}
                      >
                        Salvează
                      </Button>
                    </Flex>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Box>
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
                <Text color="gray">
                  Adaugă-ți link-urile sociale din setări (în curând)
                </Text>
              )}
            </Flex>
          </Box>
        </Box>
      </Card>

      {/* Streak */}
      <Card>
        <Flex align="center" gap="3" px="3" py="2">
          <Flame color="var(--orange-11)" />
          <Text weight="medium">Streak</Text>
          <Separator orientation="vertical" size="4" my="2" />
          {streak === undefined ? (
            <Text color="gray">Se încarcă…</Text>
          ) : (
            <Flex gap="3" wrap="wrap" align="center">
              <Badge color="orange" radius="full">
                {(streak as any).currentStreak ?? 0} zile
              </Badge>
              {(streak as any).lastAnsweredDate && (
                <Text color="gray" size="2">
                  Ultima activitate: {(streak as any).lastAnsweredDate}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Card>

      {/* Badges - Earned */}
      <Card>
        <Flex align="center" justify="between" px="3">
          <Text weight="medium">Badge-uri câștigate</Text>
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
            {(earnedBadges.length > 0 ? earnedBadges : []).map((file, i) => {
              const meta = getBadgeMeta(file);
              const content = (
                <span className="block rounded-md border border-border bg-card px-3 py-2 shadow-md text-xs max-w-[240px]">
                  <span className="block font-medium text-foreground">
                    {meta.title}
                  </span>
                  <span className="block mt-1 text-muted-foreground leading-snug">
                    {meta.description}
                  </span>
                </span>
              );
              return (
                <Tooltip key={i} content={content}>
                  <div style={{ position: "relative" }}>
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
                </Tooltip>
              );
            })}
            {earnedBadges.length === 0 && (
              <Text color="gray">Încă nu ai badge-uri câștigate.</Text>
            )}
          </div>
        </Box>
      </Card>

      {/* Badges - All */}
      <Card>
        <Flex align="center" justify="between" px="3">
          <Text weight="medium">Toate badge-urile</Text>
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
              const meta = getBadgeMeta(file);
              const content = (
                <span className="block rounded-md border border-border bg-card px-3 py-2 shadow-md text-xs max-w-[240px]">
                  <span className="block font-medium text-foreground">
                    {meta.title}
                  </span>
                  <span className="block mt-1 text-muted-foreground leading-snug">
                    {meta.description}
                  </span>
                </span>
              );
              return (
                <Tooltip key={i} content={content}>
                  <div style={{ position: "relative" }}>
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
                </Tooltip>
              );
            })}
          </div>
        </Box>
      </Card>

      {/* Feed: personal posts */}
      <Box>
        <Text as="div" size="4" weight="medium" mb="2">
          Postările mele
        </Text>
        {posts === undefined || myPosts === undefined ? (
          <Text color="gray">Se încarcă postările…</Text>
        ) : myPosts.length === 0 ? (
          <Card>
            <Box p="3">
              <Text color="gray">Nu ai postări încă.</Text>
            </Box>
          </Card>
        ) : (
          <Flex direction="column" gap="3">
            {myPosts.map((p: any) => (
              <PostCard key={p._id} post={p as any} />
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
