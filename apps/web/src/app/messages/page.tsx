"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const conversations = useQuery(api.messages.getConversations);

  return (
    <div className="flex h-[calc(100vh-64px)] border border-border rounded-lg overflow-hidden bg-card">
      {/* Left: Conversation List */}
      <div className="w-80 border-r border-border shrink-0">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging!
          </div>
        )}
      </div>
    </div>
  );
}
