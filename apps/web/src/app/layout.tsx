import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import { Theme, Box, Grid } from "@radix-ui/themes";

// Import your new layout components
import { Navbar } from "@/components/navbar";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";

const figTreeSans = Figtree({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commit", // Updated title
  description: "A modern social app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply the font to the body */}
      <body className={figTreeSans.className}>
        <ClerkProvider>
          <Providers>
            {/* Radix Theme component should wrap your entire app */}
            <Theme>
              {/* 1. TOP NAV / HEADER */}
              {/* This component sits outside the main grid, spanning the full width. */}
              <Navbar />

              {/* 2. MAIN CONTENT AREA - CHANGED */}
              {/* We've removed the Box wrapper that had 'maxWidth: "1280px"'. */}
              {/* The Grid is now the top-level container for the layout. */}
              <Grid
                // Add horizontal padding so sidebars aren't stuck to the very edge
                px={{ initial: "4", md: "5" }}
                // Add margin-top to create space below the Header
                mt="5"
                // On mobile ('initial'), 1 column.
                // On medium screens and up ('md'), 3 columns.
                columns={{ initial: "1fr", md: "250px 1fr 300px" }}
                gap="5" // Spacing between columns
              >
                {/* COLUMN 1: LEFT SIDEBAR */}
                {/* This Box is hidden on mobile */}
                <Box display={{ initial: "none", md: "block" }}>
                  <LeftSidebar />
                </Box>

                {/* COLUMN 2: MAIN CONTENT (YOUR PAGE) - CHANGED */}
                {/* This outer Box is the '1fr' grid column. */}
                {/* We add an *inner* Box to constrain the feed's width. */}
                <Box>
                  <Box
                    style={{
                      // This centers the feed within the '1fr' column
                      margin: "0 auto",
                      // Set a readable max-width for your feed
                      maxWidth: "720px",
                    }}
                  >
                    {children}
                  </Box>
                </Box>

                {/* COLUMN 3: RIGHT SIDEBAR */}
                {/* This Box is also hidden on mobile */}
                <Box display={{ initial: "none", md: "block" }}>
                  <RightSidebar />
                </Box>
              </Grid>
            </Theme>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
