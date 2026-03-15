import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Client-Server Architecture",
  description: "The foundation of modern web applications",
  openGraph: {
    title: "Client-Server Architecture",
    description: "The foundation of modern web applications",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Client-Server Architecture",
          description: "The foundation of modern web applications",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/fundamentals/client-server-architecture",
        }}
      />
      {children}
    </>
  );
}
