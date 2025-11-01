"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "./ui/sonner";
import { UserSync } from "./user-sync";
import { NotificationsListener } from "./notifications-listener";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSync />
        <NotificationsListener />
        {children}
      </ConvexProviderWithClerk>
      <Toaster richColors />
    </>
  );
}
