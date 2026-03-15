import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Netflix",
  description: "How Netflix streams to 200M+ users worldwide",
  openGraph: {
    title: "Netflix",
    description: "How Netflix streams to 200M+ users worldwide",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Netflix",
          description: "How Netflix streams to 200M+ users worldwide",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/case-studies/netflix",
        }}
      />
      {children}
    </>
  );
}
