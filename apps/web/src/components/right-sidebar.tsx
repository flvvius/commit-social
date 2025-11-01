"use client";

import { MessageCircle, Gift, Cigarette } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RightSidebar() {
  const conversations = useQuery(api.messages.getConversations);
  const birthdays = useQuery(api.users.listUpcomingBirthdays, { days: 7 });
  const recentConversations = conversations?.slice(0, 3) || [];
  const getOrCreate = useMutation(api.messages.getOrCreateDirectConversation);
  const sendCigaretteCall = useMutation(api.notifications.sendCigaretteCall);
  const router = useRouter();
  

  return (
    <aside className="w-72 border-l border-border bg-background overflow-y-auto">
      {/* Let's go smoke */}
      <div className="p-4 border-b border-border">
        <button
          className="w-full flex items-center justify-center gap-2 text-sm bg-primary text-primary-foreground px-3 py-2 rounded hover:opacity-90"
          onClick={async () => {
            try {
              // Use the group's slug to be explicit and robust
              const res = await sendCigaretteCall({ groupName: "smokers-lounge" });
              toast.success(`Notified ${res.delivered} people: Come to smoke`);
            } catch (e: any) {
              toast.error(e?.message || "Failed to send notification");
            }
          }}
          aria-label="Let's go smoke"
        >
          <Cigarette className="h-4 w-4" />
          Let's go smoke
        </button>
      </div>

      {/* Daily Quiz removed from right sidebar */}

      {/* Birthdays */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Birthdays
        </h3>
        <div className="space-y-2">
          {(birthdays ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No upcoming birthdays</p>
          ) : (
            (birthdays ?? []).map((u) => (
              <div key={u._id as any} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={(u as any).avatarUrl || "/placeholder.svg"}
                  alt={(u as any).name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {(u as any).name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(u as any).isToday ? "Today" : `${(u as any).daysUntil} days`}
                  </p>
                </div>
                <button
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90"
                  onClick={async () => {
                    try {
                      const convId = await getOrCreate({ otherUserId: (u as any)._id });
                      router.push(`/messages?c=${convId}`);
                    } catch {}
                  }}
                >
                  Wish
                </button>
              </div>
            ))
          )}
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
