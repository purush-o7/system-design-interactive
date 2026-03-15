import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Networking Basics",
  description: "Ports, protocols, and the network stack",
  openGraph: {
    title: "Networking Basics",
    description: "Ports, protocols, and the network stack",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Networking Basics",
          description: "Ports, protocols, and the network stack",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/fundamentals/networking-basics",
        }}
      />
      {children}
    </>
  );
}
