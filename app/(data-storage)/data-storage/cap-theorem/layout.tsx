import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CAP Theorem",
  description: "The impossible tradeoff in distributed systems",
  openGraph: {
    title: "CAP Theorem",
    description: "The impossible tradeoff in distributed systems",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "CAP Theorem",
          description: "The impossible tradeoff in distributed systems",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/data-storage/cap-theorem",
        }}
      />
      {children}
    </>
  );
}
