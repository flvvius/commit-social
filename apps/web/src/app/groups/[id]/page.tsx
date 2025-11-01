"use client";

import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Flex, Text, Box, Button, Heading, Avatar, Dialog } from "@radix-ui/themes";
import { PostCard } from "@/components/feed/post-card";
import { CreatePost } from "@/components/feed/create-post";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function GroupPage() {
  const params = useParams();
  const groupId = params.id as Id<"groups">;
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const group = useQuery(api.groups.get, { id: groupId });
  const members = useQuery(api.groups.getMembers, { groupId: groupId });
  const posts = useQuery(api.posts.listRecent, {
    limit: 50,
    groupId: groupId,
  });

  if (group === undefined || posts === undefined || members === undefined) {
    return (
      <Flex direction="column" gap="4" p="4">
        <Text color="gray">Loading group...</Text>
      </Flex>
    );
  }

  if (group === null) {
    return (
      <Flex direction="column" gap="4" p="4">
        <Text color="red">Group not found</Text>
        <Link href="/feed">
          <Button variant="soft">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      {/* Back Navigation */}
      <Link href="/feed">
        <Button variant="ghost" size="2">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      {/* Group Header */}
      <Box
        p="5"
        style={{
          background: "var(--gray-2)",
          border: "1px solid var(--gray-6)",
          borderRadius: "12px",
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" gap="3">
            <span style={{ fontSize: "3rem" }}>{group.emoji || "📚"}</span>
            <Flex direction="column" gap="1">
              <Heading size="6">{group.name}</Heading>
              <Button
                variant="ghost"
                size="1"
                onClick={() => setMembersDialogOpen(true)}
                style={{ width: "fit-content", padding: "4px 8px" }}
              >
                <Users className="h-4 w-4" />
                <Text size="2">
                  {group.memberCount}{" "}
                  {group.memberCount === 1 ? "member" : "members"}
                </Text>
              </Button>
            </Flex>
          </Flex>
          {group.description && (
            <Text size="2" color="gray">
              {group.description}
            </Text>
          )}
        </Flex>
      </Box>

      {/* Members Dialog */}
      <Dialog.Root open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <Dialog.Content maxWidth="500px">
          <Dialog.Title>
            <Flex align="center" gap="2">
              <Users className="h-5 w-5" />
              Group Members ({members.length})
            </Flex>
          </Dialog.Title>
          <Dialog.Description size="2" mb="4">
            All members of {group.name}
          </Dialog.Description>

          <Flex direction="column" gap="2" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {members.length === 0 ? (
              <Text size="2" color="gray">
                No members yet
              </Text>
            ) : (
              members.map((member) => (
                <Link
                  key={member._id}
                  href={`/profile?id=${member._id}`}
                  style={{ textDecoration: "none" }}
                  onClick={() => setMembersDialogOpen(false)}
                >
                  <Flex
                    align="center"
                    gap="3"
                    p="3"
                    style={{
                      background: "var(--gray-2)",
                      border: "1px solid var(--gray-6)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    className="hover:bg-gray-3"
                  >
                    <Avatar
                      size="3"
                      src={member.avatarUrl || undefined}
                      fallback={member.name.charAt(0).toUpperCase()}
                    />
                    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                      <Text size="2" weight="medium">
                        {member.name}
                      </Text>
                      {member.bio && (
                        <Text size="1" color="gray" style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {member.bio}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Link>
              ))
            )}
          </Flex>

          <Flex justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Create Post Section - Pre-filled with group */}
      {group.isJoined && <CreatePost defaultGroupId={groupId} />}

      {/* Posts List */}
      <Flex direction="column" gap="3">
        {posts.length === 0 ? (
          <Box
            p="6"
            style={{
              background: "var(--gray-2)",
              border: "1px solid var(--gray-6)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <Text color="gray">
              No posts in this group yet.{" "}
              {group.isJoined
                ? "Be the first to post!"
                : "Join the group to see posts."}
            </Text>
          </Box>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post as any} />)
        )}
      </Flex>
    </Flex>
  );
}
