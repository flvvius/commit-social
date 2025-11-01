"use client";
import { useTheme } from "next-themes";
import { Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")} title="Toggle theme" size="2">
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
