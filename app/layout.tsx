import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
import { PageTransition } from "@/components/page-transition";
import { JsonLd } from "@/lib/structured-data";
import { Github } from "lucide-react";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
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
  keywords: [
    "system design",
    "distributed systems",
    "load balancing",
    "caching",
    "database sharding",
    "microservices",
    "CAP theorem",
    "scalability",
    "reliability",
    "interview prep",
    "interactive guide",
    "tutorial",
  ],
  authors: [{ name: "Purushottam Reddy" }],
  creator: "Purushottam Reddy",
  openGraph: {
    type: "website",
    siteName: "System Design — Interactive Guide",
    locale: "en_US",
    title: "System Design — Interactive Guide",
    description:
      "Learn system design through failure-first, interactive examples. Scaling, databases, caching, reliability, and real-world architectures.",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Design — Interactive Guide",
    description:
      "Learn system design through failure-first, interactive examples. Scaling, databases, caching, reliability, and real-world architectures.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8BGX6XYTRC"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8BGX6XYTRC');
        `}
      </Script>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <JsonLd
          data={{
            "@type": "WebSite",
            name: "System Design — Interactive Guide",
            url: "https://systemdesign.dev",
            description:
              "Interactive learning platform for system design concepts with visual animations",
            inLanguage: "en",
            publisher: {
              "@type": "Person",
              name: "Purushottam Reddy",
            },
          }}
        />
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
                    <a
                      href="https://github.com/purush-o7/system-design-interactive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7"
                    >
                      <Github className="size-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                    <ThemeToggle />
                  </div>
                </header>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  <div id="main-content" data-scroll-container className="flex-1 overflow-y-auto p-6 lg:p-10 min-w-0">
                    <div className="max-w-4xl mx-auto">
                      <VisitTracker />
                      <PageTransition>
                        {children}
                      </PageTransition>
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
