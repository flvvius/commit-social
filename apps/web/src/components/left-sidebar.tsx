"use client";

import { ChevronDown, Flame } from "lucide-react";
import { mockGroups, mockQuiz } from "@/lib/mock-data";
import { useState } from "react";

export function LeftSidebar() {
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [answered, setAnswered] = useState(false);

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
            {mockGroups
              .filter((g) => g.isJoined)
              .map((group) => (
                <button
                  key={group.id}
                  className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted text-foreground transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">{group.icon}</span>
                  <span className="truncate">{group.name}</span>
                </button>
              ))}
          </div>
        )}
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
