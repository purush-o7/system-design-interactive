import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Auth & Authorization",
  description: "OAuth, JWT, and access control",
  openGraph: {
    title: "Auth & Authorization",
    description: "OAuth, JWT, and access control",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Auth & Authorization",
          description: "OAuth, JWT, and access control",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/security/auth-and-authorization",
        }}
      />
      {children}
    </>
  );
}
