import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Web Crawler",
  description: "Design a system like Googlebot",
  openGraph: {
    title: "Web Crawler",
    description: "Design a system like Googlebot",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Web Crawler",
          description: "Design a system like Googlebot",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/real-world/web-crawler",
        }}
      />
      {children}
    </>
  );
}
