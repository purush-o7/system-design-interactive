import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "APIs & REST",
  description: "How systems communicate through APIs",
  openGraph: {
    title: "APIs & REST",
    description: "How systems communicate through APIs",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "APIs & REST",
          description: "How systems communicate through APIs",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/fundamentals/apis-and-rest",
        }}
      />
      {children}
    </>
  );
}
