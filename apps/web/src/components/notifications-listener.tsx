"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { toast } from "sonner";

export function NotificationsListener() {
  const items = useQuery(api.notifications.listForCurrentUser);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const initializedRef = useRef(false);
  const lastSeenRef = useRef(0);

  useEffect(() => {
    if (!items) return;

    // On first load, don't toast historical notifications
    if (!initializedRef.current) {
      initializedRef.current = true;
      const maxTime = items.reduce((m, it) => Math.max(m, (it as any).createdAt ?? 0), 0);
      lastSeenRef.current = maxTime;
      return;
    }

    const newOnes = items.filter((it) => !it.read && (it as any).createdAt > lastSeenRef.current);
    if (newOnes.length > 0) {
      newOnes.forEach((it) => toast(it.message));
      lastSeenRef.current = Math.max(
        lastSeenRef.current,
        ...newOnes.map((it) => (it as any).createdAt as number)
      );
      // Best-effort mark-as-read so we don't re-toast
      markAllRead().catch(() => {});
    }
  }, [items, markAllRead]);

  return null;
}
