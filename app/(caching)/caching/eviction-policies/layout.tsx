import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Eviction Policies",
  description: "LRU, LFU, FIFO - deciding what to keep",
  openGraph: {
    title: "Eviction Policies",
    description: "LRU, LFU, FIFO - deciding what to keep",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Eviction Policies",
          description: "LRU, LFU, FIFO - deciding what to keep",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/caching/eviction-policies",
        }}
      />
      {children}
    </>
  );
}
