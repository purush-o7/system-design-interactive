import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Vertical vs Horizontal",
  description: "Two approaches to handling growth",
  openGraph: {
    title: "Vertical vs Horizontal",
    description: "Two approaches to handling growth",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Vertical vs Horizontal",
          description: "Two approaches to handling growth",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/scaling/vertical-vs-horizontal",
        }}
      />
      {children}
    </>
  );
}
