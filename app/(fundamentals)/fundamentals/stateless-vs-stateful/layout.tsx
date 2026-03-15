import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Stateless vs Stateful",
  description: "Understanding state management in distributed systems",
  openGraph: {
    title: "Stateless vs Stateful",
    description: "Understanding state management in distributed systems",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Stateless vs Stateful",
          description: "Understanding state management in distributed systems",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/fundamentals/stateless-vs-stateful",
        }}
      />
      {children}
    </>
  );
}
