import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "SQL vs NoSQL",
  description: "Choosing the right database type",
  openGraph: {
    title: "SQL vs NoSQL",
    description: "Choosing the right database type",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "SQL vs NoSQL",
          description: "Choosing the right database type",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/data-storage/sql-vs-nosql",
        }}
      />
      {children}
    </>
  );
}
