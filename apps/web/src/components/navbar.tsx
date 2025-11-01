"use client";

import { Search, Bell, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { SeedButton } from "./seed-button";

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(
    searchParams.get("q") || ""
  );

  const user = useUser();
  const privateData = useQuery(api.privateData.get);

  // Debounce search query with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`/feed?q=${encodeURIComponent(debouncedQuery)}`);
    } else if (searchQuery === "") {
      router.push("/feed");
    }
  }, [debouncedQuery, router, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    router.push("/feed");
  };

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
              className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* <SeedButton /> */}
          {/* <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </button> */}
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
            <User className="h-5 w-5 text-foreground" />
          </Link>
          <div className="p-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
