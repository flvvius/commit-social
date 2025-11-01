"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import {
  Dialog,
  Button,
  Flex,
  TextField,
  TextArea,
  Text,
} from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [submitting, setSubmitting] = useState(false);

  const createGroup = useMutation(api.groups.create);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setSubmitting(true);
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: emoji || "📚",
      });
      toast.success("Group created!");
      setOpen(false);
      setName("");
      setDescription("");
      setEmoji("📚");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button size="2" variant="soft" style={{ width: "100%" }}>
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create New Group</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Start a new community around your interests
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Emoji
            </Text>
            <TextField.Root
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📚"
              maxLength={2}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Book Club"
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Description (optional)
            </Text>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? "Creating..." : "Create Group"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
