import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Message Queues",
  description: "Kafka, RabbitMQ, and async processing",
  openGraph: {
    title: "Message Queues",
    description: "Kafka, RabbitMQ, and async processing",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Message Queues",
          description: "Kafka, RabbitMQ, and async processing",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "System Design Interactive" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "System Design" },
          inLanguage: "en",
          url: "https://systemdesign.dev/system-patterns/message-queues",
        }}
      />
      {children}
    </>
  );
}
