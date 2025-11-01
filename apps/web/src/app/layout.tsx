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
import { OnboardingDialog } from "@/components/onboarding-dialog";

const figTreeSans = Figtree({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commit",
  description: "A modern social app",
};

// Force dynamic rendering for the entire app
export const dynamic = "force-dynamic";
export const dynamicParams = true;

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
              {/* App background with subtle colorful gradients */}
              <div className="min-h-screen bg-app">
              {/* Onboarding Dialog - Shows on first login */}
              <OnboardingDialog />

              {/* 1. TOP NAV / HEADER */}
              <Navbar />

              {/* 2. MAIN CONTENT AREA */}
              <Grid
                px={{ initial: "4", md: "5" }}
                mt="5"
                columns={{ initial: "1fr", md: "400px 1fr 400px" }}
                gap="5"
              >
                {/* COLUMN 1: LEFT SIDEBAR */}
                <Box display={{ initial: "none", md: "block" }}>
                  <LeftSidebar />
                </Box>

                {/* COLUMN 2: MAIN CONTENT */}
                <Box>
                  <Box
                    style={{
                      margin: "0 auto",
                      maxWidth: "720px",
                    }}
                  >
                    {children}
                  </Box>
                </Box>

                {/* COLUMN 3: RIGHT SIDEBAR */}
                <Box display={{ initial: "none", md: "block" }}>
                  <RightSidebar />
                </Box>
              </Grid>
              </div>
            </Theme>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
