"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import {
  Dialog,
  Button,
  Flex,
  Text,
  Box,
  Heading,
  Checkbox,
  TextField,
  Select,
} from "@radix-ui/themes";
import { Building2, Users, Cake, Briefcase } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";

// Predefined position options
const POSITION_OPTIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Product Manager",
  "Senior Product Manager",
  "Product Designer",
  "UX Designer",
  "UI Designer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "QA Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Marketing Manager",
  "Sales Manager",
  "Customer Success Manager",
  "HR Manager",
  "Recruiter",
  "Business Analyst",
  "Project Manager",
  "Scrum Master",
  "Technical Writer",
  "Content Creator",
  "Graphic Designer",
  "Other",
];

export function OnboardingDialog() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const departments = useQuery(api.departments.list);
  const groups = useQuery(api.groups.list, {});
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [birthday, setBirthday] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Show dialog if user exists but hasn't selected a department yet
  const showOnboarding =
    currentUser !== undefined &&
    currentUser !== null &&
    !currentUser.departmentId;

  const handleComplete = async () => {
    if (!selectedDepartment) {
      toast.error("Please select a department");
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        departmentId: selectedDepartment as Id<"departments">,
        groupIds: selectedGroups as Id<"groups">[],
        birthday: birthday || undefined,
        position: position || undefined,
      });
      toast.success("Welcome to Commit! 🎉");
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  if (!showOnboarding) return null;

  return (
    <Dialog.Root open={showOnboarding}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>
          <Heading size="6" mb="2">
            Welcome to Commit! 👋
          </Heading>
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Let's set up your profile. Tell us about yourself!
        </Dialog.Description>

        {/* Department Selection */}
        <Box mb="4">
          <Flex align="center" gap="2" mb="3">
            <Building2 className="h-4 w-4" />
            <Text weight="bold" size="3">
              Select Your Department (Required)
            </Text>
          </Flex>
          <div className="grid grid-cols-2 gap-2">
            {departments?.map((dept) => (
              <button
                key={dept._id}
                onClick={() => setSelectedDepartment(dept._id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedDepartment === dept._id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Flex align="center" gap="2">
                  <span className="text-2xl">{dept.emoji}</span>
                  <Box>
                    <Text weight="medium" size="2">
                      {dept.name}
                    </Text>
                    <Text size="1" color="gray">
                      {dept.memberCount} members
                    </Text>
                  </Box>
                </Flex>
              </button>
            ))}
          </div>
        </Box>

        {/* Position Dropdown */}
        <Box mb="4">
          <Flex align="center" gap="2" mb="3">
            <Briefcase className="h-4 w-4" />
            <Text weight="bold" size="3">
              Your Position (Optional)
            </Text>
          </Flex>
          <Text size="1" color="gray" mb="2">
            Select your job title or role
          </Text>
          <Select.Root value={position} onValueChange={setPosition}>
            <Select.Trigger
              placeholder="Select a position"
              style={{ width: "100%" }}
            />
            <Select.Content>
              {POSITION_OPTIONS.map((pos) => (
                <Select.Item key={pos} value={pos}>
                  {pos}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {/* Birthday Input */}
        <Box mb="4">
          <Flex align="center" gap="2" mb="3">
            <Cake className="h-4 w-4" />
            <Text weight="bold" size="3">
              Your Birthday (Optional)
            </Text>
          </Flex>
          <Text size="1" color="gray" mb="2">
            We'll celebrate with you! Your coworkers will get a reminder.
          </Text>
          <TextField.Root
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder="Select your birthday"
            size="2"
          />
        </Box>

        {/* Groups Selection */}
        <Box mb="4">
          <Flex align="center" gap="2" mb="3">
            <Users className="h-4 w-4" />
            <Text weight="bold" size="3">
              Join Some Groups (Optional)
            </Text>
          </Flex>
          <Text size="1" color="gray" mb="3">
            You can always join more groups later
          </Text>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {groups?.map((group) => (
              <label
                key={group._id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedGroups.includes(group._id)
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Flex align="center" gap="2">
                  <Checkbox
                    checked={selectedGroups.includes(group._id)}
                    onCheckedChange={() => toggleGroup(group._id)}
                  />
                  <span className="text-xl">{group.emoji}</span>
                  <Box style={{ flex: 1 }}>
                    <Text weight="medium" size="2">
                      {group.name}
                    </Text>
                    <Text size="1" color="gray">
                      {group.memberCount} members
                    </Text>
                  </Box>
                </Flex>
              </label>
            ))}
          </div>
        </Box>

        <Flex justify="end" gap="2" mt="4">
          <Button
            onClick={handleComplete}
            disabled={!selectedDepartment || submitting}
            loading={submitting}
            size="3"
          >
            {submitting ? "Setting up..." : "Get Started"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
