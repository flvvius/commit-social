"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import type { Id } from "@social-media-app/backend/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Search } from "lucide-react";

type Props = {
  onConversationCreated: (conversationId: Id<"conversations">) => void;
};

export function NewMessageDialog({ onConversationCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const allUsers = useQuery(api.messages.getAllUsers);
  const createConversation = useMutation(
    api.messages.getOrCreateDirectConversation
  );

  const filteredUsers = (allUsers || []).filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (userId: Id<"users">) => {
    try {
      const conversationId = await createConversation({ otherUserId: userId });
      onConversationCreated(conversationId);
      setOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Users List */}
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {!allUsers ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading users...
              </p>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No users found" : "No users available"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-muted rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-sm text-foreground">
                      {user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
