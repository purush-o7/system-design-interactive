import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Bloom Filters",
  description: "Probabilistic data structure for membership testing",
  openGraph: {
    title: "Bloom Filters",
    description: "Probabilistic data structure for membership testing",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Bloom Filters",
          description: "Probabilistic data structure for membership testing",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/data-storage/bloom-filters",
        }}
      />
      {children}
    </>
  );
}
