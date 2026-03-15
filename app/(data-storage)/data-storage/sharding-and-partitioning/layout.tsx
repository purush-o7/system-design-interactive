import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Sharding & Partitioning",
  description: "Splitting data across machines",
  openGraph: {
    title: "Sharding & Partitioning",
    description: "Splitting data across machines",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Sharding & Partitioning",
          description: "Splitting data across machines",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/data-storage/sharding-and-partitioning",
        }}
      />
      {children}
    </>
  );
}
