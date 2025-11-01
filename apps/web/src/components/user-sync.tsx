"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function UserSync() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      // TODO: add user sync mutation if needed; no-op for now to avoid type issues
    }
  }, [isSignedIn]);

  return null;
}
