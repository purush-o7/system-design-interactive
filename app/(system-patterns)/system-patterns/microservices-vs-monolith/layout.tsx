import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Microservices vs Monolith",
  description: "When to split and when to stay together",
  openGraph: {
    title: "Microservices vs Monolith",
    description: "When to split and when to stay together",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Microservices vs Monolith",
          description: "When to split and when to stay together",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/system-patterns/microservices-vs-monolith",
        }}
      />
      {children}
    </>
  );
}
