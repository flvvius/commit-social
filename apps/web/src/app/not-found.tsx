"use client";

import { Card, Flex, Text, Button } from "@radix-ui/themes";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: "60vh" }}>
      <Card size="4">
        <Flex direction="column" gap="4" align="center" p="5">
          <Text size="8" weight="bold">
            404
          </Text>
          <Text size="5" weight="medium">
            Pagina nu a fost găsită
          </Text>
          <Text size="2" color="gray" align="center">
            Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
          </Text>
          <Link href="/feed">
            <Button size="3">
              <Home className="h-4 w-4" />
              Înapoi la Feed
            </Button>
          </Link>
        </Flex>
      </Card>
    </Flex>
  );
}
