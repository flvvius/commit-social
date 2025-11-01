"use client";

import { api } from "@social-media-app/backend/convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import Feed from "./feed/page";
import { Spinner } from "@radix-ui/themes";

export default function Dashboard() {
  return (
    <>
      <Authenticated>
        <Feed />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <AuthLoading>
        <Spinner />
      </AuthLoading>
    </>
  );
}
