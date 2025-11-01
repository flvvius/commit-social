"use client";

import { HelpCircle, Flame } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { toast } from "sonner";

export function DailyQuizCard() {
  const quiz = useQuery(api.quizzes.getToday);
  const answerQuiz = useMutation(api.quizzes.answerToday);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (quiz === undefined) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-2" />
        <div className="h-3 w-48 bg-muted rounded mb-3" />
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!quiz?.available) {
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Daily Quiz
        </h3>
        <p className="text-xs text-muted-foreground">No quiz today. Check back tomorrow!</p>
      </div>
    );
  }

  const disabled = !!quiz.hasAnsweredToday || submitting;

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        Daily Quiz
      </h3>
      {quiz.hasAnsweredToday && (
        <div className="text-xs mb-3 rounded border border-border bg-muted p-2 text-muted-foreground">
          You’ve already answered today’s quiz. Come back tomorrow!
        </div>
      )}
      <p className="text-xs text-foreground mb-3">{quiz.question}</p>
      <div className="space-y-2 mb-3">
        {quiz.answers.map((ans, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => setSelected(idx)}
            className={`w-full text-left text-xs px-2 py-2 rounded border transition-colors ${
              disabled
                ? "opacity-60 cursor-not-allowed"
                : selected === idx
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted"
            }`}
          >
            {ans}
          </button>
        ))}
      </div>
      {!disabled && selected === null && (
        <p className="text-[11px] text-muted-foreground mb-2">
          Select an answer to enable submit.
        </p>
      )}
      <button
        className="w-full text-xs bg-gradient-primary text-white px-2 py-1 rounded disabled:opacity-50 hover:brightness-110 shadow-xs"
        disabled={disabled || selected === null}
        onClick={async () => {
          if (selected === null) return;
          setSubmitting(true);
          try {
            const res = await answerQuiz({ answerIndex: selected });
            if ((res as any).ok) {
              if ((res as any).correct) {
                toast.success(`Correct! Streak: ${(res as any).currentStreak}`);
              } else {
                toast.error("Wrong answer. Streak reset.");
              }
            } else {
              const reason = (res as any).reason;
              if (reason === "already_answered") toast("Already answered today");
              else if (reason === "no_quiz") toast("No quiz today yet");
              else toast("Could not submit answer");
            }
          } catch (e: any) {
            toast.error(e?.message || "Failed to submit answer");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {quiz.hasAnsweredToday ? "Already answered today" : submitting ? "Submitting…" : "Submit"}
      </button>
    </div>
  );
}
