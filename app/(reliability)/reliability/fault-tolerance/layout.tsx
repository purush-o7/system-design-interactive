import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Fault Tolerance",
  description: "Surviving failures gracefully",
  openGraph: {
    title: "Fault Tolerance",
    description: "Surviving failures gracefully",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Fault Tolerance",
          description: "Surviving failures gracefully",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/reliability/fault-tolerance",
        }}
      />
      {children}
    </>
  );
}
