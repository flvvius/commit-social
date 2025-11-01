"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type Props = {
  conversationId: Id<"conversations">;
};

export function ChatWindow({ conversationId }: Props) {
  const { user: clerkUser } = useUser();
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    markAsRead({ conversationId });
  }, [conversationId, markAsRead]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId,
        content: inputValue.trim(),
      });
      setInputValue("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!messages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser =
              message.sender?.email ===
              clerkUser?.primaryEmailAddress?.emailAddress;

            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender?.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="flex-shrink-0 h-11 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
