import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "DDoS Protection",
  description: "Defending against distributed attacks",
  openGraph: {
    title: "DDoS Protection",
    description: "Defending against distributed attacks",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "DDoS Protection",
          description: "Defending against distributed attacks",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/security/ddos-protection",
        }}
      />
      {children}
    </>
  );
}
