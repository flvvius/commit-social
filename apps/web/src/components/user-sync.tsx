"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function UserSync() {
  const { isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (isSignedIn) {
      syncUser().catch((error) => {
        console.error("Failed to sync user:", error);
      });
    }
  }, [isSignedIn, syncUser]);

  return null;
}
