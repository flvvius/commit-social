"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PopupEditProfile,
  PopupEditProfileTrigger,
  PopupEditProfileContent,
  PopupEditProfileHeader,
  PopupEditProfileTitle,
  PopupEditProfileDescription,
  PopupEditProfileFooter,
} from "@/components/ui/popup-editprofile";
import { useMutation } from "convex/react";
import { PostCard } from "@/components/feed/post-card";

import {
  Calendar,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Edit,
  Flame,
  LogOut,
} from "lucide-react";

const Profile = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const updateProfile = useMutation(api.users.updateProfile);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Form state
  const [bio, setBio] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");
  const [links, setLinks] = React.useState<{ platform: string; url: string }[]>([]);

  // Convex data
  const me = useQuery(api.users.getMe);
  const myPosts = useQuery(api.posts.listMine, { limit: 20 });

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Please sign in to view your profile</div>
      </div>
    );
  }

  // Prefer full name, then first/last, then email local-part, then fallback
  const meAny = me as any;
  const displayName =
    (meAny?.name as string | undefined) ||
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";

  // Get initials for avatar fallback (supports names or email)
  const sourceForInitials = displayName || user.primaryEmailAddress?.emailAddress || "User";
  const initials = sourceForInitials
    .split(/[ ._@-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Map badge names to colors/styles
  const getBadgeVariant = (badge: string) => {
    const lowerBadge = badge.toLowerCase();
    if (lowerBadge.includes("early") || lowerBadge.includes("verified")) return "default";
    if (lowerBadge.includes("active") || lowerBadge.includes("helpful")) return "secondary";
    return "outline";
  };

  // Merged profile data (Convex first, then Clerk, then fallbacks)
  const profileData = {
    name: displayName,
    avatar: user.hasImage ? user.imageUrl : (meAny?.avatarUrl as string | undefined),
    banner: (meAny?.bannerUrl as string | undefined) ?? null,
    bio: (meAny?.bio as string | undefined) ?? "Coffee enthusiast, code explorer, always learning 🚀",
    badges: ((meAny?.badges as string[] | undefined) ?? ["Early Adopter", "Active Member", "Helpful"]) as string[],
    socialLinks: ((meAny?.socialLinks as { platform: string; url: string }[] | undefined) ?? [
      { platform: "twitter", url: "#" },
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ]) as { platform: string; url: string }[],
    streak: 7,
    joinedDate: user.createdAt ? new Date(user.createdAt) : new Date(),
  };

  // Initialize form values when Convex/me is ready
  React.useEffect(() => {
    const meAny = me as any;
    setBio((meAny?.bio as string | undefined) ?? "");
    setBannerUrl((meAny?.bannerUrl as string | undefined) ?? "");
    setLinks(((meAny?.socialLinks as { platform: string; url: string }[] | undefined) ?? []) as any);
  }, [me]);

  const addLink = () => setLinks((prev) => [...prev, { platform: "", url: "" }]);
  const removeLink = (idx: number) => setLinks((prev) => prev.filter((_, i) => i !== idx));
  const updateLink = (idx: number, field: "platform" | "url", value: string) =>
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  const onSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        bio: bio || undefined,
        bannerUrl: bannerUrl || undefined,
        socialLinks: links
          .map((l) => ({ platform: l.platform.trim(), url: l.url.trim() }))
          .filter((l) => l.platform && l.url),
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl">
        {/* Banner and Avatar Section */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-64 w-full overflow-hidden rounded-b-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {profileData.banner ? (
              <img src={profileData.banner} alt="Profile banner" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            )}
          </div>

          {/* Profile Info Overlay */}
          <div className="relative px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar */}
              <div className="relative -mt-16">
                <Avatar className="h-32 w-32 border-4 border-background">
                  {profileData.avatar ? (
                    <AvatarImage src={profileData.avatar} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pb-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <PopupEditProfile open={open} onOpenChange={setOpen}>
                  <PopupEditProfileTrigger asChild>
                    <Button size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </PopupEditProfileTrigger>
                  <PopupEditProfileContent>
                    <PopupEditProfileHeader>
                      <PopupEditProfileTitle>Edit profile</PopupEditProfileTitle>
                      <PopupEditProfileDescription>Update your description, social links, and banner image.</PopupEditProfileDescription>
                    </PopupEditProfileHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Tell people a bit about you"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Banner URL</label>
                        <input
                          value={bannerUrl}
                          onChange={(e) => setBannerUrl(e.target.value)}
                          className="w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Social links</label>
                          <Button type="button" variant="outline" size="sm" onClick={addLink}>
                            Add link
                          </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {links.map((l, idx) => (
                            <div key={idx} className="grid grid-cols-5 gap-2">
                              <input
                                value={l.platform}
                                onChange={(e) => updateLink(idx, "platform", e.target.value)}
                                className="col-span-2 rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                placeholder="platform (twitter, github, linkedin)"
                              />
                              <input
                                value={l.url}
                                onChange={(e) => updateLink(idx, "url", e.target.value)}
                                className="col-span-3 rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                placeholder="https://..."
                              />
                              <div className="col-span-5 flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(idx)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <PopupEditProfileFooter>
                      <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                      </Button>
                      <Button onClick={onSave} disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                      </Button>
                    </PopupEditProfileFooter>
                  </PopupEditProfileContent>
                </PopupEditProfile>
                <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>

            {/* Name, Bio & About details (merged) */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                {profileData.streak && profileData.streak > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-semibold">{profileData.streak} day streak</span>
                  </div>
                )}
              </div>
              {user.primaryEmailAddress && (
                <p className="text-muted-foreground text-sm">{user.primaryEmailAddress.emailAddress}</p>
              )}
              {profileData.bio && <p className="text-muted-foreground max-w-2xl">{profileData.bio}</p>}

              {/* About: Joined date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Joined {profileData.joinedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              {/* About: Social Links */}
              {profileData.socialLinks && profileData.socialLinks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.socialLinks.map((link, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {link.platform === "twitter" && <Twitter className="h-4 w-4" />}
                          {link.platform === "linkedin" && <Linkedin className="h-4 w-4" />}
                          {link.platform === "github" && <Github className="h-4 w-4" />}
                          <span className="capitalize">{link.platform}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Badges Section */}
            {profileData.badges && profileData.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profileData.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={getBadgeVariant(badge) as "default" | "secondary" | "outline"}
                    className="px-3 py-1 text-sm"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-6" />

            {/* Stats */}
            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Activity</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Posts</span>
                      <span className="font-semibold">{myPosts?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Comments</span>
                      <span className="font-semibold">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Reactions Given</span>
                      <span className="font-semibold">—</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Current Streak</span>
                      <span className="flex items-center gap-1 font-semibold text-orange-500">
                        <Flame className="h-4 w-4" />
                        7 days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Personal Feed */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Your Posts</h2>
                </CardHeader>
                <CardContent>
                  {myPosts === undefined ? (
                    <p className="text-muted-foreground text-center py-8">Loading your posts…</p>
                  ) : myPosts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">You haven't posted anything yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {myPosts.map((p: any) => (
                        <PostCard key={p._id} post={p} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
