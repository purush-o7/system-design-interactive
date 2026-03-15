import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Load Balancing",
  description: "Distributing traffic across servers",
  openGraph: {
    title: "Load Balancing",
    description: "Distributing traffic across servers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Load Balancing",
          description: "Distributing traffic across servers",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/scaling/load-balancing",
        }}
      />
      {children}
    </>
  );
}
