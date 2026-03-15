import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Event-Driven Architecture",
  description: "Building reactive, decoupled systems",
  openGraph: {
    title: "Event-Driven Architecture",
    description: "Building reactive, decoupled systems",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Event-Driven Architecture",
          description: "Building reactive, decoupled systems",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/system-patterns/event-driven-architecture",
        }}
      />
      {children}
    </>
  );
}
