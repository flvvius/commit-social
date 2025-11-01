"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Box, Button, Card, Flex, Inset, Separator, Text, TextArea, Badge } from "@radix-ui/themes";
import { toast } from "sonner";

export default function AdminKbPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const createDoc = useMutation(api.ai.createDoc);
  const deleteDoc = useMutation(api.ai.deleteDoc);
  const docs = useQuery(api.ai.listDocs, { limit: 100 });

  const disabled = !title.trim() || !content.trim();

  return (
    <Flex direction="column" gap="4">
      <Card>
        <Flex direction="column" gap="2">
          <Text weight="bold">Add knowledge base document</Text>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--gray-a6)" }}
          />
          <TextArea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          <input
            placeholder="tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--gray-a6)" }}
          />
          <Flex justify="end">
            <Button
              disabled={disabled}
              onClick={async () => {
                try {
                  const tagList = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  await createDoc({ title: title.trim(), content: content.trim(), tags: tagList });
                  setTitle("");
                  setContent("");
                  setTags("");
                  toast.success("Document added");
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to add document");
                }
              }}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Separator my="2" size="4" />

      <Flex direction="column" gap="3">
        <Text weight="bold">Knowledge base</Text>
        {docs === undefined ? (
          <Text color="gray">Loading…</Text>
        ) : docs.length === 0 ? (
          <Text color="gray">No documents yet</Text>
        ) : (
          docs.map((d: any) => (
            <Card key={(d as any)._id}>
              <Inset>
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between" wrap="wrap" gap="2">
                    <Text weight="medium">{(d as any).title}</Text>
                    <Button size="1" variant="soft" color="red" onClick={() => deleteDoc({ id: (d as any)._id })}>
                      Delete
                    </Button>
                  </Flex>
                  <Text as="p" size="2" color="gray">
                    {(d as any).content.length > 240 ? `${(d as any).content.slice(0, 240)}…` : (d as any).content}
                  </Text>
                  <Flex gap="1" wrap="wrap">
                    {((d as any).tags ?? []).map((t: string, i: number) => (
                      <Badge key={i} variant="soft" size="1">
                        {t}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Inset>
            </Card>
          ))
        )}
      </Flex>
    </Flex>
  );
}
