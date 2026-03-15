import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Caching Strategies",
  description: "Write-through, write-back, and write-around",
  openGraph: {
    title: "Caching Strategies",
    description: "Write-through, write-back, and write-around",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Caching Strategies",
          description: "Write-through, write-back, and write-around",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/caching/caching-strategies",
        }}
      />
      {children}
    </>
  );
}
