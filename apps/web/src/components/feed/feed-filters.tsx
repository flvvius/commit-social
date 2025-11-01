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
  const departments = useQuery(api.departments.list, {});
  const groups = useQuery(api.groups.list, {});

  return (
    <Box mb="4">
      <Flex align="center" gap="3" wrap="wrap">
        <Flex align="center" gap="2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Text size="2" weight="medium">
            Filter by:
          </Text>
        </Flex>

        <Select.Root
          value={selectedDepartment || undefined}
          onValueChange={(val) => onDepartmentChange(val || "")}
        >
          <Select.Trigger
            placeholder="All Departments"
            style={{ minWidth: "180px" }}
          />
          <Select.Content>
            {departments?.map((dept) => (
              <Select.Item key={dept._id} value={dept._id}>
                {dept.emoji} {dept.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={selectedGroup || undefined}
          onValueChange={(val) => onGroupChange(val || "")}
        >
          <Select.Trigger
            placeholder="All Groups"
            style={{ minWidth: "180px" }}
          />
          <Select.Content>
            {groups?.map((group) => (
              <Select.Item key={group._id} value={group._id}>
                {group.emoji} {group.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {(selectedDepartment || selectedGroup) && (
          <Button
            size="1"
            variant="ghost"
            onClick={() => {
              onDepartmentChange("");
              onGroupChange("");
            }}
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
      </Flex>
    </Box>
  );
}
