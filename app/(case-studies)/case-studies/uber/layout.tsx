import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Uber",
  description: "How Uber matches riders and drivers in real-time",
  openGraph: {
    title: "Uber",
    description: "How Uber matches riders and drivers in real-time",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Uber",
          description: "How Uber matches riders and drivers in real-time",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/case-studies/uber",
        }}
      />
      {children}
    </>
  );
}
