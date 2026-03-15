import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Reverse Proxy",
  description: "The invisible middleman between clients and servers",
  openGraph: {
    title: "Reverse Proxy",
    description: "The invisible middleman between clients and servers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Reverse Proxy",
          description: "The invisible middleman between clients and servers",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/system-patterns/reverse-proxy",
        }}
      />
      {children}
    </>
  );
}
