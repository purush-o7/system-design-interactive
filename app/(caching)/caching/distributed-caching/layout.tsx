import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Distributed Caching",
  description: "Redis clusters and cache coordination",
  openGraph: {
    title: "Distributed Caching",
    description: "Redis clusters and cache coordination",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Distributed Caching",
          description: "Redis clusters and cache coordination",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/caching/distributed-caching",
        }}
      />
      {children}
    </>
  );
}
