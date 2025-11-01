"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";

function MessagesContent() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const conversations = useQuery(api.messages.getConversations);
  const searchParams = useSearchParams();

  // If ?c=<conversationId> present, preselect it when conversations load
  useEffect(() => {
    const cid = searchParams?.get("c");
    if (!cid || !conversations) return;
    const found = conversations.find((c) => (c as any)._id === cid);
    if (found) setSelectedConversationId((found as any)._id);
  }, [searchParams, conversations]);

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

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-64px)] border border-border rounded-lg overflow-hidden bg-card">
        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
          Loading messages...
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
