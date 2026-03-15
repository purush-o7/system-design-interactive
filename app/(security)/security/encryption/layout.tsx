import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Encryption",
  description: "TLS, at-rest, and end-to-end encryption",
  openGraph: {
    title: "Encryption",
    description: "TLS, at-rest, and end-to-end encryption",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Encryption",
          description: "TLS, at-rest, and end-to-end encryption",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/security/encryption",
        }}
      />
      {children}
    </>
  );
}
