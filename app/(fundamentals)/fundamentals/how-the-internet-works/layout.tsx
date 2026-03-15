import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "How the Internet Works",
  description: "DNS, TCP/IP, and how data travels across the web",
  openGraph: {
    title: "How the Internet Works",
    description: "DNS, TCP/IP, and how data travels across the web",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "How the Internet Works",
          description: "DNS, TCP/IP, and how data travels across the web",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/fundamentals/how-the-internet-works",
        }}
      />
      {children}
    </>
  );
}
