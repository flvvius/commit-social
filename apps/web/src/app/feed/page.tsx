"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Flex, Text, Button, Box, Avatar, TextArea } from "@radix-ui/themes";

export default function Feed() {
  const user = useUser();
  const privateData = useQuery(api.privateData.get);

  return (
    <>
      <Flex direction="column" gap="2">
        <Box>
          <TextArea placeholder="Reply to comment..." />
        </Box>
      </Flex>
      <UserButton />
    </>
  );
}
