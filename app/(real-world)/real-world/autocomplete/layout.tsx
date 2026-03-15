import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Autocomplete",
  description: "Design a typeahead search suggestion system",
  openGraph: {
    title: "Autocomplete",
    description: "Design a typeahead search suggestion system",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Autocomplete",
          description: "Design a typeahead search suggestion system",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/real-world/autocomplete",
        }}
      />
      {children}
    </>
  );
}
