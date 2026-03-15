import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { TopicNav } from "@/components/topic-nav";
import { TableOfContents } from "@/components/table-of-contents";
import { KeyboardProvider } from "@/components/keyboard-provider";
import { CommandPalette } from "@/components/command-palette";
import { VisitTracker } from "@/components/visit-tracker";
import { KeyboardHints } from "@/components/keyboard-hints";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://systemdesign.dev"),
  title: {
    default: "System Design — Interactive Guide",
    template: "%s | System Design",
  },
  description:
    "Interactive learning platform for system design concepts — scaling, databases, caching, reliability, and real-world architectures with visual animations.",
  openGraph: {
    title: "System Design — Interactive Guide",
    description:
      "Interactive learning platform for system design concepts — scaling, databases, caching, reliability, and real-world architectures with visual animations.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <TooltipProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md"
          >
            Skip to main content
          </a>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="max-h-svh overflow-hidden">
              <KeyboardProvider>
                <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 !h-4" />
                  <BreadcrumbNav />
                  <div className="ml-auto flex items-center gap-2">
                    <CommandPalette />
                    <ThemeToggle />
                  </div>
                </header>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  <div id="main-content" data-scroll-container className="flex-1 overflow-y-auto p-6 lg:p-10 min-w-0">
                    <div className="max-w-4xl mx-auto">
                      <VisitTracker />
                      {children}
                      <TopicNav />
                    </div>
                  </div>
                  <TableOfContents />
                </div>
                <KeyboardHints />
              </KeyboardProvider>
            </SidebarInset>
          </SidebarProvider>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
