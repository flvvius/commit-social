"use client";
import Link from "next/link";
// import { ModeToggle } from "./mode-toggle";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/todos", label: "Todos" },
  ] as const;

  const user = useUser();
  const privateData = useQuery(api.privateData.get);

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">{/* <ModeToggle /> */}</div>
      </div>
      <hr />
    </div>
  );
}
