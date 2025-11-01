"use client";

import { useParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Box, Button, Card, Flex, Inset, Separator, Text, TextArea, Badge } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CommentsSection } from "@/components/feed/comments-section";

const EMOJI_MAP: Record<string, string> = { fire: "🔥", heart: "❤️", tada: "🎉", joy: "😂" };
const emojiNames = Object.keys(EMOJI_MAP);

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const question = useQuery(api.questions.get, id ? { id: id as any } : "skip");
  const addReaction = useMutation(api.reactions.add);
  const createAnswer = useMutation(api.answers.create);
  const approveAnswer = useMutation(api.answers.approve);
  const askAI = useAction(api.ai.answerQuestion);

  const [answerText, setAnswerText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  if (question === undefined) return (<Text>Loading…</Text>) as any;
  if (!question) return (<Text>Not found</Text>) as any;

  const answers = (question as any).answers ?? [];

  return (
    <Flex direction="column" gap="4">
      <Card>
        <Flex direction="column" gap="2">
          <Text as="div" weight="bold" size="4">
            {(question as any).title}
          </Text>
          <Text as="div" size="2" color="gray">
            {new Date((question as any).createdAt).toLocaleString()}
          </Text>
          <Box mt="2">
            <Text as="p">{(question as any).body}</Text>
          </Box>
          <Flex gap="1" mt="1" wrap="wrap">
            {((question as any).tags ?? []).map((t: string, i: number) => (
              <Badge key={i} variant="soft" size="1">
                {t}
              </Badge>
            ))}
          </Flex>
        </Flex>
      </Card>

      {!(question as any).isMine && (
        <Card>
          <Flex direction="column" gap="2">
            <Text weight="bold">Your answer</Text>
            <TextArea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer"
            />
            <Flex justify="end">
              <Button
                disabled={!answerText.trim()}
                onClick={async () => {
                  try {
                    await createAnswer({ questionId: (question as any)._id, content: answerText.trim() });
                    setAnswerText("");
                    toast.success("Answer posted");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to post answer");
                  }
                }}
              >
                Post answer
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      <Card>
        <Flex direction="column" gap="2">
          <Text weight="bold">Ask the AI</Text>
          <Text color="gray" size="2">
            Generate a suggested answer using the internal knowledge base.
          </Text>
          <Flex justify="end" gap="2">
            {!!aiAnswer && (
              <Button
                variant="soft"
                onClick={async () => {
                  try {
                    await createAnswer({ questionId: (question as any)._id, content: aiAnswer! });
                    setAiAnswer(null);
                    toast.success("AI answer posted");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to post AI answer");
                  }
                }}
              >
                Post AI answer
              </Button>
            )}
            <Button
              loading={aiLoading as any}
              onClick={async () => {
                setAiLoading(true);
                setAiAnswer(null);
                try {
                  const res: any = await askAI({ questionId: (question as any)._id });
                  setAiAnswer(res?.answer ?? null);
                } catch (e: any) {
                  toast.error(e?.message ?? "AI request failed");
                } finally {
                  setAiLoading(false);
                }
              }}
            >
              {aiLoading ? "Thinking…" : "Generate AI answer"}
            </Button>
          </Flex>
          {!!aiAnswer && (
            <Card variant="surface">
              <Inset>
                <Text as="p" style={{ whiteSpace: "pre-wrap" }}>
                  {aiAnswer}
                </Text>
              </Inset>
            </Card>
          )}
        </Flex>
      </Card>

      <Separator my="2" size="4" />

      <Flex direction="column" gap="3">
        <Text as="div" weight="bold">
          Answers
        </Text>
        {answers.length === 0 ? (
          <Text color="gray">No answers yet</Text>
        ) : (
          answers.map((a: any) => (
            <Card
              key={(a as any)._id}
              variant={(question as any).acceptedAnswerId === (a as any)._id ? "classic" : undefined}
            >
              <Inset>
                <Flex direction="column" gap="2">
                  {(question as any).acceptedAnswerId === (a as any)._id && (
                    <Badge color="green" radius="full">
                      Accepted
                    </Badge>
                  )}
                  <Text as="p">{(a as any).content}</Text>
                  <Flex align="center" gap="2" wrap="wrap">
                    {emojiNames.map((name) => (
                      <Button
                        key={name}
                        size="1"
                        variant="soft"
                        onClick={async () => {
                          try {
                            await addReaction({ answerId: (a as any)._id, emojiName: name });
                          } catch (e: any) {
                            toast.error(e?.message ?? "Failed to react");
                          }
                        }}
                      >
                        {EMOJI_MAP[name]} {((a as any).reactionCounts?.[name] ?? 0) as number}
                      </Button>
                    ))}
                    <Button
                      size="1"
                      onClick={async () => {
                        try {
                          await approveAnswer({ questionId: (question as any)._id, answerId: (a as any)._id });
                        } catch (e: any) {
                          toast.error(e?.message ?? "Failed to approve");
                        }
                      }}
                    >
                      Approve
                    </Button>
                  </Flex>
                  <Separator my="2" size="4" />
                  <CommentsSection answerId={(a as any)._id as string} limit={50} />
                </Flex>
              </Inset>
            </Card>
          ))
        )}
      </Flex>
    </Flex>
  );
}
