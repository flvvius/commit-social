"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Box, Button, Card, Flex, Inset, Separator, Text, TextArea, Badge } from "@radix-ui/themes";
import Link from "next/link";
import { toast } from "sonner";

export default function QuestionsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const createQuestion = useMutation(api.questions.create);
  const questions = useQuery(api.questions.list, { limit: 20 });
  const askAI = useAction(api.ai.answerQuestion);
  const [aiQ, setAiQ] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiA, setAiA] = useState<string | null>(null);

  const disabled = !title.trim() || !body.trim();

  return (
    <Flex direction="column" gap="4">
      <Card>
        <Flex direction="column" gap="2">
          <Text as="div" weight="bold">
            Ask the AI (demo)
          </Text>
          <TextArea placeholder="Ask anything…" value={aiQ} onChange={(e) => setAiQ(e.target.value)} />
          <Flex justify="end" gap="2">
            {!!aiA && (
              <Button variant="soft" onClick={() => setAiA(null)} size="1">
                Clear
              </Button>
            )}
            <Button
              disabled={!aiQ.trim()}
              loading={aiLoading as any}
              onClick={async () => {
                setAiLoading(true);
                setAiA(null);
                try {
                  const res: any = await askAI({ text: aiQ.trim() });
                  setAiA(res?.answer ?? null);
                } catch (e: any) {
                  toast.error(e?.message ?? "AI request failed");
                } finally {
                  setAiLoading(false);
                }
              }}
            >
              {aiLoading ? "Thinking…" : "Ask AI"}
            </Button>
          </Flex>
          {!!aiA && (
            <Card variant="surface">
              <Inset>
                <Text as="p" style={{ whiteSpace: "pre-wrap" }}>
                  {aiA}
                </Text>
              </Inset>
            </Card>
          )}
        </Flex>
      </Card>

      <Card>
        <Flex direction="column" gap="2">
          <Text as="div" weight="bold">
            Ask a question
          </Text>
          <Box>
            <input
              placeholder="Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                background: "var(--color-popover)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
              }}
            />
          </Box>
          <TextArea placeholder="Describe your problem" value={body} onChange={(e) => setBody(e.target.value)} />
          <Box>
            <input
              placeholder="tags (comma separated)"
              value={tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                background: "var(--color-popover)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
              }}
            />
          </Box>
          <Flex justify="end">
            <Button
              disabled={disabled}
              onClick={async () => {
                try {
                  const tagList = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  await createQuestion({ title: title.trim(), body: body.trim(), tags: tagList });
                  setTitle("");
                  setBody("");
                  setTags("");
                  toast.success("Question posted");
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to post");
                }
              }}
            >
              Post question
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Separator my="2" size="4" />

      <Flex direction="column" gap="3">
        <Text as="div" weight="bold">
          Recent questions
        </Text>
        {questions === undefined ? (
          <Text color="gray">Loading…</Text>
        ) : questions.length === 0 ? (
          <Text color="gray">No questions yet</Text>
        ) : (
          questions.map((q: any) => (
            <Card key={(q as any)._id}>
              <Inset>
                <Flex align="center" justify="between" wrap="wrap" gap="2">
                  <Box>
                    <Link href={`/questions/${String((q as any)._id)}` as any}>
                      <Text as="div" weight="medium">
                        {(q as any).title}
                      </Text>
                    </Link>
                    <Text as="div" size="1" color="gray">
                      {new Date((q as any).createdAt).toLocaleString()}
                    </Text>
                    <Flex gap="1" mt="1" wrap="wrap">
                      {((q as any).tags ?? []).map((t: string, i: number) => (
                        <Badge key={i} variant="soft" size="1">
                          {t}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                  <Box>
                    <Badge color={(q as any).acceptedAnswerId ? "green" : "gray"}>
                      {(q as any).answersCount || 0} answers{(q as any).acceptedAnswerId ? " • accepted" : ""}
                    </Badge>
                  </Box>
                </Flex>
              </Inset>
            </Card>
          ))
        )}
      </Flex>
    </Flex>
  );
}
