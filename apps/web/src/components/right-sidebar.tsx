"use client";

import { MessageCircle, Gift } from "lucide-react";
import { mockBirthdays } from "@/lib/mock-data";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import Link from "next/link";

export function RightSidebar() {
  const conversations = useQuery(api.messages.getConversations);
  const recentConversations = conversations?.slice(0, 3) || [];

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </h3>
          <Link
            href="/messages"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentConversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet
            </p>
          ) : (
            recentConversations.map((conv) => (
              <Link
                key={conv._id}
                href="/messages"
                className={`block w-full text-left p-2 rounded border transition-colors ${
                  conv.unreadCount > 0
                    ? "bg-primary/10 border-primary/30"
                    : "border-border hover:bg-muted"
                }`}
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {conv.otherUser?.name || "Unknown User"}
                </p>
                <p
                  className={`text-xs truncate ${
                    conv.unreadCount > 0
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {conv.lastMessage?.content || "No messages yet"}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
