"use client";

import { Search, Bell, Mail, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
// import { SeedButton } from "./seed-button";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  const user = useUser();
  const privateData = useQuery(api.privateData.get);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            C
          </div>
          <span className="text-lg font-semibold text-foreground hidden sm:inline">
            Commit
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, people, groups..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* <SeedButton /> */}
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <Link
            href="/messages"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Messages"
          >
            <Mail className="h-5 w-5 text-foreground" />
          </Link>
          <Link
            href="/profile"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Profile"
          >
            <UserButton />
          </Link>
        </div>
      </div>
    </nav>
  );
}
