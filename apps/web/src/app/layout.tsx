import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import { Theme, Box } from "@radix-ui/themes";
// import Header from "@/components/header";

const figTreeSans = Figtree({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "social-media-app",
  description: "social-media-app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <Providers>
            <Theme>
            	  <Box width="60rem">{children}</Box>
            </Theme>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
