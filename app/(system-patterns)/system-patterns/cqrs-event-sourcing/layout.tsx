import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CQRS & Event Sourcing",
  description: "Separating reads from writes",
  openGraph: {
    title: "CQRS & Event Sourcing",
    description: "Separating reads from writes",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "CQRS & Event Sourcing",
          description: "Separating reads from writes",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/system-patterns/cqrs-event-sourcing",
        }}
      />
      {children}
    </>
  );
}
