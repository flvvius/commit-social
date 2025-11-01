"use client";

import { useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import {
  Box,
  Flex,
  Avatar,
  TextArea,
  Button,
  Card,
  Text,
  SegmentedControl,
  Inset,
  Dialog,
  Separator,
  Select,
} from "@radix-ui/themes";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { registerPlugin } from "filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import { toast } from "sonner";

type CreatePostProps = {
  placeholder?: string;
  onCreated?: () => void;
};
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation
);

export function CreatePost({
  placeholder = "Share something...",
  onCreated,
}: CreatePostProps) {
  const { user } = useUser();
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useAction(api.posts.generateUploadUrl);

  // Fetch departments and groups
  const departments = useQuery(api.departments.list, {});
  const groups = useQuery(api.groups.list, {});

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"default" | "showcase">("default");
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [pondFiles, setPondFiles] = useState<any[]>([]);

  // New state for department and group selection
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const disabled =
    submitting || (content.trim().length === 0 && files.length === 0);

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      if (files.length > 0) {
        // Upload each selected file now (no auto-upload from FilePond)
        const uploaded: string[] = [];
        for (const file of files) {
          const { url } = await generateUploadUrl({});
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!res.ok) throw new Error("Upload failed");
          const json = (await res.json()) as { storageId: string };
          uploaded.push(json.storageId);
        }
        const images = uploaded.map((id, i) => ({
          id: id as Id<"_storage">,
          caption: captions[i] || undefined,
        }));
        await createPost({
          content: content.trim(),
          images,
          isShowcase: variant === "showcase",
          departmentId: selectedDepartment
            ? (selectedDepartment as any)
            : undefined,
          groupId: selectedGroup ? (selectedGroup as any) : undefined,
        });
      } else {
        await createPost({
          content: content.trim(),
          isShowcase: variant === "showcase",
          departmentId: selectedDepartment
            ? (selectedDepartment as any)
            : undefined,
          groupId: selectedGroup ? (selectedGroup as any) : undefined,
        });
      }

      setContent("");
      setFiles([]);
      setPondFiles([]);
      setCaptions([]);
      setSelectedDepartment("");
      setSelectedGroup("");
      toast.success("Posted");
      onCreated?.();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="classic">
      <SignedIn>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Flex gap="3" align="center">
            <Avatar
              size="3"
              src={user?.imageUrl ?? undefined}
              fallback={
                (user?.firstName?.[0] ?? "")
                  .concat(user?.lastName?.[0] ?? "")
                  .toUpperCase() || "?"
              }
            />
            <Box flexGrow="1">
              <TextArea
                placeholder={placeholder}
                size="3"
                variant="soft"
                style={{ width: "100%", cursor: "text" }}
                readOnly
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
              />
            </Box>
          </Flex>

          <Dialog.Content size="4">
            <Dialog.Title>Create post</Dialog.Title>
            <Separator my="3" size="4" />
            <Flex direction="column" gap="3">
              <SegmentedControl.Root
                size="2"
                value={variant}
                onValueChange={(v) => setVariant(v as any)}
              >
                <SegmentedControl.Item value="default">
                  Default
                </SegmentedControl.Item>
                <SegmentedControl.Item value="showcase">
                  Showcase
                </SegmentedControl.Item>
              </SegmentedControl.Root>

              {/* Department and Group Selectors */}
              <Flex gap="3">
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Department (optional)
                  </Text>
                  <Select.Root
                    value={selectedDepartment || undefined}
                    onValueChange={(val) => setSelectedDepartment(val || "")}
                  >
                    <Select.Trigger
                      placeholder="Select department..."
                      style={{ width: "100%" }}
                    />
                    <Select.Content>
                      {departments?.map((dept) => (
                        <Select.Item key={dept._id} value={dept._id}>
                          {dept.emoji} {dept.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Group (optional)
                  </Text>
                  <Select.Root
                    value={selectedGroup || undefined}
                    onValueChange={(val) => setSelectedGroup(val || "")}
                  >
                    <Select.Trigger
                      placeholder="Select group..."
                      style={{ width: "100%" }}
                    />
                    <Select.Content>
                      {groups?.map((group) => (
                        <Select.Item key={group._id} value={group._id}>
                          {group.emoji} {group.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                size="3"
                variant={variant === "showcase" ? "surface" : "soft"}
                style={{ width: "100%" }}
              />
              <FilePond
                files={pondFiles as any}
                onupdatefiles={(items: any[]) => {
                  setPondFiles(items);
                  setFiles(items.map((it: any) => it.file as File));
                  setCaptions((prev) => {
                    const next = [...prev];
                    next.length = items.length;
                    return next.map((v) => v ?? "");
                  });
                }}
                allowMultiple={true}
                instantUpload={false}
                acceptedFileTypes={["image/*"]}
                name="images"
                labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
              />

              <Flex justify="end" gap="2" mt="3">
                <Dialog.Close>
                  <Button
                    variant="soft"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={handleSubmit}
                  disabled={disabled}
                  loading={submitting}
                  variant="solid"
                >
                  Post
                </Button>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </SignedIn>
      <SignedOut>
        <Flex align="center" justify="between" gap="3">
          <Text color="gray">Sign in to create a post</Text>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </Flex>
      </SignedOut>
    </Card>
  );
}
