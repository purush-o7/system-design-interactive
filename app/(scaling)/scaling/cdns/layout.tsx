import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CDNs",
  description: "Content delivery at the edge",
  openGraph: {
    title: "CDNs",
    description: "Content delivery at the edge",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "CDNs",
          description: "Content delivery at the edge",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/scaling/cdns",
        }}
      />
      {children}
    </>
  );
}
