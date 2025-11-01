"use client";

import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react";

type Conversation = {
  _id: Id<"conversations">;
  type: string;
  participants: Id<"users">[];
  lastMessageAt?: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: number;
  } | null;
  otherUser?: {
    name: string;
    avatarUrl?: string;
  } | null;
};

type Props = {
  conversations: Conversation[];
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => onSelect(conversation._id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-muted transition-colors border-b border-border ${
                selectedId === conversation._id ? "bg-muted" : ""
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {conversation.otherUser?.avatarUrl ? (
                  <img
                    src={conversation.otherUser.avatarUrl}
                    alt={conversation.otherUser.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {conversation.otherUser?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {conversation.otherUser?.name || "Unknown User"}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      conversation.unreadCount > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
