"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { Button } from "@radix-ui/themes";
import { toast } from "sonner";

export function SeedButton() {
  const [seeding, setSeeding] = useState(false);
  const seedData = useMutation(api.seed.seedData);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData({});
      toast.success(result.message);
    } catch (err: any) {
      toast.error(err?.message || "Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={seeding} variant="outline" size="1">
      {seeding ? "Seeding..." : "🌱 Seed Data"}
    </Button>
  );
}
