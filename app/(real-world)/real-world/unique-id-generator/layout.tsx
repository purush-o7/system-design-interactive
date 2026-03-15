import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Unique ID Generator",
  description: "Snowflake, UUID, and distributed ID generation",
  openGraph: {
    title: "Unique ID Generator",
    description: "Snowflake, UUID, and distributed ID generation",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Unique ID Generator",
          description: "Snowflake, UUID, and distributed ID generation",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/real-world/unique-id-generator",
        }}
      />
      {children}
    </>
  );
}
