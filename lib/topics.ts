import {
  Globe,
  Server,
  Plug,
  Gauge,
  Network,
  ArrowUpDown,
  Scale,
  RefreshCw,
  MapPin,
  Database,
  Search,
  Split,
  Copy,
  Triangle,
  Layers,
  RotateCcw,
  Share2,
  Trash2,
  Boxes,
  Radio,
  MessageSquare,
  GitFork,
  DoorOpen,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Link,
  MessageCircle,
  Newspaper,
  HardDrive,
  Play,
  Lightbulb,
  Calculator,
  ArrowLeftRight,
  Zap,
  Activity,
  HeartPulse,
  Ambulance,
  BookOpen,
  Tv,
  Gamepad2,
  Car,
  CreditCard,
  Hash,
  ArrowRightLeft,
  Fingerprint,
  Filter,
  Bell,
  ServerCrash,
  Bug,
  TextSearch,
  type LucideIcon,
} from "lucide-react";

export type Topic = {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
};

export type Category = {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  topics: Topic[];
};

export type SidebarGroup = {
  label: string;
  categories: Category[];
};

const fundamentals: Category = {
  slug: "fundamentals",
  label: "Fundamentals",
  href: "/fundamentals",
  icon: Globe,
  color: "teal",
  topics: [
    { slug: "how-the-internet-works", label: "How the Internet Works", href: "/fundamentals/how-the-internet-works", icon: Globe, difficulty: "beginner", description: "DNS, TCP/IP, and how data travels across the web" },
    { slug: "client-server-architecture", label: "Client-Server Architecture", href: "/fundamentals/client-server-architecture", icon: Server, difficulty: "beginner", description: "The foundation of modern web applications" },
    { slug: "apis-and-rest", label: "APIs & REST", href: "/fundamentals/apis-and-rest", icon: Plug, difficulty: "beginner", description: "How systems communicate through APIs" },
    { slug: "latency-and-throughput", label: "Latency & Throughput", href: "/fundamentals/latency-and-throughput", icon: Gauge, difficulty: "beginner", description: "Measuring system performance" },
    { slug: "networking-basics", label: "Networking Basics", href: "/fundamentals/networking-basics", icon: Network, difficulty: "beginner", description: "Ports, protocols, and the network stack" },
    { slug: "stateless-vs-stateful", label: "Stateless vs Stateful", href: "/fundamentals/stateless-vs-stateful", icon: ServerCrash, difficulty: "beginner", description: "Understanding state management in distributed systems" },
  ],
};

const scaling: Category = {
  slug: "scaling",
  label: "Scaling",
  href: "/scaling",
  icon: ArrowUpDown,
  color: "blue",
  topics: [
    { slug: "vertical-vs-horizontal", label: "Vertical vs Horizontal", href: "/scaling/vertical-vs-horizontal", icon: ArrowUpDown, difficulty: "beginner", description: "Two approaches to handling growth" },
    { slug: "load-balancing", label: "Load Balancing", href: "/scaling/load-balancing", icon: Scale, difficulty: "intermediate", description: "Distributing traffic across servers" },
    { slug: "auto-scaling", label: "Auto-Scaling", href: "/scaling/auto-scaling", icon: RefreshCw, difficulty: "intermediate", description: "Dynamically adjusting capacity" },
    { slug: "cdns", label: "CDNs", href: "/scaling/cdns", icon: MapPin, difficulty: "intermediate", description: "Content delivery at the edge" },
  ],
};

const dataStorage: Category = {
  slug: "data-storage",
  label: "Data Storage",
  href: "/data-storage",
  icon: Database,
  color: "amber",
  topics: [
    { slug: "sql-vs-nosql", label: "SQL vs NoSQL", href: "/data-storage/sql-vs-nosql", icon: Database, difficulty: "beginner", description: "Choosing the right database type" },
    { slug: "database-indexing", label: "Database Indexing", href: "/data-storage/database-indexing", icon: Search, difficulty: "intermediate", description: "Making queries blazing fast" },
    { slug: "sharding-and-partitioning", label: "Sharding & Partitioning", href: "/data-storage/sharding-and-partitioning", icon: Split, difficulty: "advanced", description: "Splitting data across machines" },
    { slug: "replication", label: "Replication", href: "/data-storage/replication", icon: Copy, difficulty: "intermediate", description: "Keeping copies of your data in sync" },
    { slug: "cap-theorem", label: "CAP Theorem", href: "/data-storage/cap-theorem", icon: Triangle, difficulty: "advanced", description: "The impossible tradeoff in distributed systems" },
    { slug: "bloom-filters", label: "Bloom Filters", href: "/data-storage/bloom-filters", icon: Filter, difficulty: "intermediate", description: "Probabilistic data structure for membership testing" },
  ],
};

const caching: Category = {
  slug: "caching",
  label: "Caching",
  href: "/caching",
  icon: Layers,
  color: "orange",
  topics: [
    { slug: "caching-strategies", label: "Caching Strategies", href: "/caching/caching-strategies", icon: Layers, difficulty: "intermediate", description: "Write-through, write-back, and write-around" },
    { slug: "eviction-policies", label: "Eviction Policies", href: "/caching/eviction-policies", icon: RotateCcw, difficulty: "intermediate", description: "LRU, LFU, FIFO - deciding what to keep" },
    { slug: "distributed-caching", label: "Distributed Caching", href: "/caching/distributed-caching", icon: Share2, difficulty: "advanced", description: "Redis clusters and cache coordination" },
    { slug: "cache-invalidation", label: "Cache Invalidation", href: "/caching/cache-invalidation", icon: Trash2, difficulty: "advanced", description: "The hardest problem in computer science" },
  ],
};

const systemPatterns: Category = {
  slug: "system-patterns",
  label: "System Patterns",
  href: "/system-patterns",
  icon: Boxes,
  color: "purple",
  topics: [
    { slug: "microservices-vs-monolith", label: "Microservices vs Monolith", href: "/system-patterns/microservices-vs-monolith", icon: Boxes, difficulty: "intermediate", description: "When to split and when to stay together" },
    { slug: "event-driven-architecture", label: "Event-Driven Architecture", href: "/system-patterns/event-driven-architecture", icon: Radio, difficulty: "intermediate", description: "Building reactive, decoupled systems" },
    { slug: "message-queues", label: "Message Queues", href: "/system-patterns/message-queues", icon: MessageSquare, difficulty: "intermediate", description: "Kafka, RabbitMQ, and async processing" },
    { slug: "cqrs-event-sourcing", label: "CQRS & Event Sourcing", href: "/system-patterns/cqrs-event-sourcing", icon: GitFork, difficulty: "advanced", description: "Separating reads from writes" },
    { slug: "api-gateway", label: "API Gateway", href: "/system-patterns/api-gateway", icon: DoorOpen, difficulty: "intermediate", description: "The front door to your microservices" },
    { slug: "reverse-proxy", label: "Reverse Proxy", href: "/system-patterns/reverse-proxy", icon: ArrowRightLeft, difficulty: "intermediate", description: "The invisible middleman between clients and servers" },
  ],
};

const reliability: Category = {
  slug: "reliability",
  label: "Reliability",
  href: "/reliability",
  icon: Shield,
  color: "rose",
  topics: [
    { slug: "fault-tolerance", label: "Fault Tolerance", href: "/reliability/fault-tolerance", icon: ShieldCheck, difficulty: "intermediate", description: "Surviving failures gracefully" },
    { slug: "circuit-breaker", label: "Circuit Breaker", href: "/reliability/circuit-breaker", icon: Zap, difficulty: "intermediate", description: "Preventing cascade failures" },
    { slug: "health-checks", label: "Health Checks", href: "/reliability/health-checks", icon: HeartPulse, difficulty: "beginner", description: "Monitoring system health" },
    { slug: "disaster-recovery", label: "Disaster Recovery", href: "/reliability/disaster-recovery", icon: Ambulance, difficulty: "advanced", description: "Planning for the worst" },
  ],
};

const security: Category = {
  slug: "security",
  label: "Security",
  href: "/security",
  icon: Lock,
  color: "red",
  topics: [
    { slug: "auth-and-authorization", label: "Auth & Authorization", href: "/security/auth-and-authorization", icon: Key, difficulty: "intermediate", description: "OAuth, JWT, and access control" },
    { slug: "rate-limiting", label: "Rate Limiting", href: "/security/rate-limiting", icon: Gauge, difficulty: "intermediate", description: "Protecting your API from abuse" },
    { slug: "ddos-protection", label: "DDoS Protection", href: "/security/ddos-protection", icon: Shield, difficulty: "advanced", description: "Defending against distributed attacks" },
    { slug: "encryption", label: "Encryption", href: "/security/encryption", icon: Lock, difficulty: "intermediate", description: "TLS, at-rest, and end-to-end encryption" },
  ],
};

const realWorld: Category = {
  slug: "real-world",
  label: "Real-World Designs",
  href: "/real-world",
  icon: Lightbulb,
  color: "emerald",
  topics: [
    { slug: "url-shortener", label: "URL Shortener", href: "/real-world/url-shortener", icon: Link, difficulty: "intermediate", description: "Design a system like bit.ly" },
    { slug: "chat-system", label: "Chat System", href: "/real-world/chat-system", icon: MessageCircle, difficulty: "advanced", description: "Design a system like WhatsApp" },
    { slug: "news-feed", label: "News Feed", href: "/real-world/news-feed", icon: Newspaper, difficulty: "advanced", description: "Design a system like Twitter's feed" },
    { slug: "file-storage", label: "File Storage", href: "/real-world/file-storage", icon: HardDrive, difficulty: "advanced", description: "Design a system like Dropbox" },
    { slug: "video-streaming", label: "Video Streaming", href: "/real-world/video-streaming", icon: Play, difficulty: "advanced", description: "Design a system like YouTube" },
    { slug: "unique-id-generator", label: "Unique ID Generator", href: "/real-world/unique-id-generator", icon: Fingerprint, difficulty: "intermediate", description: "Snowflake, UUID, and distributed ID generation" },
    { slug: "notification-system", label: "Notification System", href: "/real-world/notification-system", icon: Bell, difficulty: "advanced", description: "Design a system like push notifications at scale" },
    { slug: "web-crawler", label: "Web Crawler", href: "/real-world/web-crawler", icon: Bug, difficulty: "advanced", description: "Design a system like Googlebot" },
    { slug: "autocomplete", label: "Autocomplete", href: "/real-world/autocomplete", icon: TextSearch, difficulty: "intermediate", description: "Design a typeahead search suggestion system" },
  ],
};

const interviewPrep: Category = {
  slug: "interview-prep",
  label: "Interview Prep",
  href: "/interview-prep",
  icon: Activity,
  color: "cyan",
  topics: [
    { slug: "framework", label: "Framework", href: "/interview-prep/framework", icon: Lightbulb, difficulty: "beginner", description: "A structured approach to system design interviews" },
    { slug: "estimation", label: "Estimation", href: "/interview-prep/estimation", icon: Calculator, difficulty: "intermediate", description: "Back-of-the-envelope calculations" },
    { slug: "trade-offs", label: "Trade-offs", href: "/interview-prep/trade-offs", icon: ArrowLeftRight, difficulty: "intermediate", description: "Evaluating design decisions" },
  ],
};

const caseStudies: Category = {
  slug: "case-studies",
  label: "Case Studies",
  href: "/case-studies",
  icon: BookOpen,
  color: "pink",
  topics: [
    { slug: "netflix", label: "Netflix", href: "/case-studies/netflix", icon: Tv, difficulty: "advanced", description: "How Netflix streams to 200M+ users worldwide" },
    { slug: "discord", label: "Discord", href: "/case-studies/discord", icon: Gamepad2, difficulty: "advanced", description: "How Discord handles millions of concurrent users" },
    { slug: "uber", label: "Uber", href: "/case-studies/uber", icon: Car, difficulty: "advanced", description: "How Uber matches riders and drivers in real-time" },
    { slug: "stripe", label: "Stripe", href: "/case-studies/stripe", icon: CreditCard, difficulty: "advanced", description: "How Stripe processes payments reliably at scale" },
    { slug: "twitter", label: "Twitter/X", href: "/case-studies/twitter", icon: Hash, difficulty: "advanced", description: "How Twitter built and scaled the home timeline" },
  ],
};

export const categories: Category[] = [
  fundamentals,
  scaling,
  dataStorage,
  caching,
  systemPatterns,
  reliability,
  security,
  realWorld,
  interviewPrep,
  caseStudies,
];

export const sidebarGroups: SidebarGroup[] = [
  { label: "Foundations", categories: [fundamentals, scaling] },
  { label: "Data Layer", categories: [dataStorage, caching] },
  { label: "Architecture", categories: [systemPatterns, reliability] },
  { label: "Applied", categories: [security, realWorld, interviewPrep, caseStudies] },
];

// Flat list of all topics in learning order
export const allTopics: (Topic & { category: string })[] = categories.flatMap(
  (cat) => cat.topics.map((t) => ({ ...t, category: cat.label }))
);

// Label map for breadcrumbs
export const labelMap: Record<string, string> = Object.fromEntries([
  ...categories.map((c) => [c.slug, c.label]),
  ...categories.flatMap((c) => c.topics.map((t) => [t.slug, t.label])),
]);

// Get topic by href
export function getTopicByHref(href: string) {
  return allTopics.find((t) => t.href === href);
}

// Get category by href
export function getCategoryByHref(href: string) {
  return categories.find((c) => c.href === href);
}

// Get adjacent topics for navigation
export function getAdjacentTopics(href: string) {
  const index = allTopics.findIndex((t) => t.href === href);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? allTopics[index - 1] : null,
    next: index < allTopics.length - 1 ? allTopics[index + 1] : null,
  };
}
