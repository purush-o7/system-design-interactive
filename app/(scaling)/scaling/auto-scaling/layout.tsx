import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Auto-Scaling",
  description: "Dynamically adjusting capacity",
  openGraph: {
    title: "Auto-Scaling",
    description: "Dynamically adjusting capacity",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Auto-Scaling",
          description: "Dynamically adjusting capacity",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/scaling/auto-scaling",
        }}
      />
      {children}
    </>
  );
}
