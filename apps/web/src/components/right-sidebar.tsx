"use client";

import { MessageCircle, Gift } from "lucide-react";
import { mockBirthdays, mockMessages } from "@/lib/mock-data";

export function RightSidebar() {
  return (
    <aside className="w-72 border-l border-border bg-background overflow-y-auto">
      {/* Birthdays */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Birthdays
        </h3>
        <div className="space-y-2">
          {mockBirthdays.map((birthday) => (
            <div key={birthday.name} className="flex items-center gap-2">
              <img
                src={birthday.avatar || "/placeholder.svg"}
                alt={birthday.name}
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {birthday.name}
                </p>
                <p className="text-xs text-muted-foreground">{birthday.date}</p>
              </div>
              <button className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90">
                Wish
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Messages
        </h3>
        <div className="space-y-2">
          {mockMessages.map((msg) => (
            <button
              key={msg.id}
              className={`w-full text-left p-2 rounded border transition-colors ${
                msg.unread
                  ? "bg-primary/10 border-primary/30"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="text-xs font-medium text-foreground truncate">
                {msg.sender}
              </p>
              <p
                className={`text-xs truncate ${msg.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}
              >
                {msg.preview}
              </p>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
