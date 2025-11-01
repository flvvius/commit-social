"use client";

import { ChevronDown, Flame, Plus } from "lucide-react";
import { mockQuiz } from "@/lib/mock-data";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { CreateGroupDialog } from "./groups/create-group-dialog";
import { Button, Flex, Text, Box } from "@radix-ui/themes";
import { toast } from "sonner";

export function LeftSidebar() {
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [answered, setAnswered] = useState(false);

  // Fetch real groups from backend
  const allGroups = useQuery(api.groups.list, {});
  const joinedGroups = allGroups?.filter((g) => g.isJoined) || [];

  const joinGroup = useMutation(api.groups.join);
  const leaveGroup = useMutation(api.groups.leave);

  const handleToggleGroup = async (groupId: string, isJoined: boolean) => {
    try {
      if (isJoined) {
        await leaveGroup({ groupId: groupId as any });
        toast.success("Left group");
      } else {
        await joinGroup({ groupId: groupId as any });
        toast.success("Joined group");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update group");
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-background overflow-y-auto flex flex-col">
      {/* Groups Section */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => setGroupsExpanded(!groupsExpanded)}
          className="flex w-full items-center justify-between gap-2 font-semibold text-foreground hover:bg-muted px-2 py-1 rounded"
        >
          <span className="text-sm">Your Groups</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${groupsExpanded ? "" : "-rotate-90"}`}
          />
        </button>

        {groupsExpanded && (
          <div className="mt-3 space-y-1">
            {joinedGroups.length === 0 ? (
              <Text size="1" color="gray" className="px-2 py-2">
                No groups yet. Join or create one!
              </Text>
            ) : (
              joinedGroups.map((group) => (
                <button
                  key={group._id}
                  className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">{group.emoji || "📚"}</span>
                  <span className="truncate">{group.name}</span>
                </button>
              ))
            )}
          </div>
        )}

        <Box mt="3">
          <CreateGroupDialog />
        </Box>
      </div>

      {/* Browse All Groups */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Discover Groups
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allGroups
            ?.filter((g) => !g.isJoined)
            .slice(0, 5)
            .map((group) => (
              <Flex key={group._id} align="center" justify="between" gap="2">
                <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                  <span className="text-base">{group.emoji || "📚"}</span>
                  <Text size="1" truncate style={{ flex: 1 }}>
                    {group.name}
                  </Text>
                </Flex>
                <Button
                  size="1"
                  variant="soft"
                  onClick={() => handleToggleGroup(group._id, group.isJoined)}
                >
                  Join
                </Button>
              </Flex>
            ))}
        </div>
      </div>

      {/* Daily Quiz */}
      <div className="p-4 border-b border-border">
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Daily Quiz
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {mockQuiz.question}
          </p>
          <div className="space-y-2">
            {mockQuiz.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswered(true)}
                disabled={answered}
                className="w-full text-xs px-2 py-1 rounded border border-border hover:bg-muted disabled:bg-muted transition-colors text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
          {answered && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              ✓ Correct! Streak: +1
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
