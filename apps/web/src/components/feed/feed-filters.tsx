"use client";

import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Select, Flex, Text, Box, Button } from "@radix-ui/themes";
import { Filter, X } from "lucide-react";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";

type FeedFiltersProps = {
  selectedDepartment: string;
  selectedGroup: string;
  onDepartmentChange: (value: string) => void;
  onGroupChange: (value: string) => void;
};

export function FeedFilters({
  selectedDepartment,
  selectedGroup,
  onDepartmentChange,
  onGroupChange,
}: FeedFiltersProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const myDepartment = useQuery(
    api.departments.get,
    currentUser?.departmentId ? { id: currentUser.departmentId } : "skip"
  );
  const myGroups = useQuery(api.groups.list, { joined: true }); // Only joined groups

  return (
    <Box mb="4">
      <Flex align="center" gap="3" wrap="wrap">
        <Flex align="center" gap="2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Text size="2" weight="medium">
            Filter by:
          </Text>
        </Flex>

        {/* Show user's department (not selectable - they can only see their own) */}
        {myDepartment && (
          <Flex
            align="center"
            gap="2"
            px="3"
            py="2"
            style={{
              border: "1px solid var(--gray-6)",
              borderRadius: "8px",
              background: "var(--gray-2)",
            }}
          >
            <Text size="2">
              {myDepartment.emoji} {myDepartment.name} (My Department)
            </Text>
          </Flex>
        )}

        {/* Groups dropdown - only show joined groups */}
        {myGroups && myGroups.length > 0 && (
          <Select.Root
            value={selectedGroup || undefined}
            onValueChange={(val) => onGroupChange(val || "")}
          >
            <Select.Trigger
              placeholder="All My Groups"
              style={{ minWidth: "180px" }}
            />
            <Select.Content>
              {myGroups.map((group) => (
                <Select.Item key={group._id} value={group._id}>
                  {group.emoji} {group.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}

        {selectedGroup && (
          <Button
            size="1"
            variant="ghost"
            onClick={() => {
              onDepartmentChange("");
              onGroupChange("");
            }}
          >
            <X className="h-3 w-3" />
            Clear filter
          </Button>
        )}
      </Flex>
    </Box>
  );
}
