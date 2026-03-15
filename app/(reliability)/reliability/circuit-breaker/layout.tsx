import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Circuit Breaker",
  description: "Preventing cascade failures",
  openGraph: {
    title: "Circuit Breaker",
    description: "Preventing cascade failures",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Circuit Breaker",
          description: "Preventing cascade failures",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/reliability/circuit-breaker",
        }}
      />
      {children}
    </>
  );
}
