export type GlossaryEntry = {
  term: string;
  definition: string;
  relatedTopicHref?: string;
};

export const glossary: Record<string, GlossaryEntry> = {
  // Fundamentals
  dns: {
    term: "DNS",
    definition:
      "Domain Name System — translates human-readable domain names (like google.com) into IP addresses that computers use to find each other.",
    relatedTopicHref: "/fundamentals/how-the-internet-works",
  },
  "ip address": {
    term: "IP Address",
    definition:
      "A unique numerical label assigned to every device on a network, like a street address for computers. Example: 192.168.1.1.",
    relatedTopicHref: "/fundamentals/networking-basics",
  },
  tcp: {
    term: "TCP",
    definition:
      "Transmission Control Protocol — ensures data arrives completely and in order. Used for web pages, emails, file transfers.",
    relatedTopicHref: "/fundamentals/networking-basics",
  },
  udp: {
    term: "UDP",
    definition:
      "User Datagram Protocol — sends data fast without guaranteeing delivery or order. Used for video streaming, gaming, DNS lookups.",
    relatedTopicHref: "/fundamentals/networking-basics",
  },
  api: {
    term: "API",
    definition:
      "Application Programming Interface — a set of rules that lets different software talk to each other. Like a menu at a restaurant: you pick what you want, the kitchen makes it.",
    relatedTopicHref: "/fundamentals/apis-and-rest",
  },
  rest: {
    term: "REST",
    definition:
      "Representational State Transfer — an architectural style for APIs that uses standard HTTP methods (GET, POST, PUT, DELETE) to manipulate resources.",
    relatedTopicHref: "/fundamentals/apis-and-rest",
  },
  latency: {
    term: "Latency",
    definition:
      "The time it takes for data to travel from point A to point B. Lower is better. Measured in milliseconds (ms).",
    relatedTopicHref: "/fundamentals/latency-and-throughput",
  },
  throughput: {
    term: "Throughput",
    definition:
      "The amount of data or number of requests a system can handle per unit of time. Like how many cars a highway can carry per hour.",
    relatedTopicHref: "/fundamentals/latency-and-throughput",
  },
  "p99": {
    term: "P99 Latency",
    definition:
      "The 99th percentile response time — 99% of requests are faster than this. It captures worst-case user experience better than averages.",
    relatedTopicHref: "/fundamentals/latency-and-throughput",
  },
  "p95": {
    term: "P95 Latency",
    definition:
      "The 95th percentile response time — 95% of requests are faster than this value.",
    relatedTopicHref: "/fundamentals/latency-and-throughput",
  },
  stateless: {
    term: "Stateless",
    definition:
      "A server that doesn't remember anything between requests. Each request is independent. This makes it easy to scale by adding more servers.",
    relatedTopicHref: "/fundamentals/stateless-vs-stateful",
  },
  stateful: {
    term: "Stateful",
    definition:
      "A server that remembers information between requests (like a shopping cart). Harder to scale because users must return to the same server.",
    relatedTopicHref: "/fundamentals/stateless-vs-stateful",
  },

  // Scaling
  "load balancer": {
    term: "Load Balancer",
    definition:
      "A server that distributes incoming traffic across multiple backend servers so no single server gets overwhelmed. Like a traffic cop for web requests.",
    relatedTopicHref: "/scaling/load-balancing",
  },
  "horizontal scaling": {
    term: "Horizontal Scaling",
    definition:
      "Adding more machines to handle more traffic (scaling out). Like adding more lanes to a highway instead of making one lane wider.",
    relatedTopicHref: "/scaling/vertical-vs-horizontal",
  },
  "vertical scaling": {
    term: "Vertical Scaling",
    definition:
      "Making a single machine more powerful (more CPU, RAM). Like replacing a sedan with a truck — there's a limit to how big you can go.",
    relatedTopicHref: "/scaling/vertical-vs-horizontal",
  },
  cdn: {
    term: "CDN",
    definition:
      "Content Delivery Network — a global network of servers that cache content close to users. Your website loads faster because data travels a shorter distance.",
    relatedTopicHref: "/scaling/cdns",
  },
  "auto-scaling": {
    term: "Auto-Scaling",
    definition:
      "Automatically adding or removing servers based on current demand. Scales up during traffic spikes, scales down to save costs when quiet.",
    relatedTopicHref: "/scaling/auto-scaling",
  },

  // Data
  sql: {
    term: "SQL Database",
    definition:
      "A relational database that stores data in structured tables with rows and columns. Uses SQL language for queries. Examples: PostgreSQL, MySQL.",
    relatedTopicHref: "/data-storage/sql-vs-nosql",
  },
  nosql: {
    term: "NoSQL Database",
    definition:
      "A non-relational database that stores data flexibly (documents, key-value pairs, graphs). Examples: MongoDB, DynamoDB, Cassandra.",
    relatedTopicHref: "/data-storage/sql-vs-nosql",
  },
  index: {
    term: "Database Index",
    definition:
      "A data structure that makes finding rows faster — like a book's index that tells you which page a topic is on, instead of reading every page.",
    relatedTopicHref: "/data-storage/database-indexing",
  },
  sharding: {
    term: "Sharding",
    definition:
      "Splitting a database across multiple machines so each handles a subset of the data. Like dividing a phone book into A-M and N-Z.",
    relatedTopicHref: "/data-storage/sharding-and-partitioning",
  },
  partition: {
    term: "Partition",
    definition:
      "A division of data across nodes. Can refer to database sharding or a network partition (when nodes can't communicate with each other).",
    relatedTopicHref: "/data-storage/sharding-and-partitioning",
  },
  replication: {
    term: "Replication",
    definition:
      "Keeping copies of data on multiple servers for reliability. If one server dies, others still have the data.",
    relatedTopicHref: "/data-storage/replication",
  },
  "cap theorem": {
    term: "CAP Theorem",
    definition:
      "States that a distributed system can only guarantee 2 of 3: Consistency (same data everywhere), Availability (always responds), Partition tolerance (works despite network splits).",
    relatedTopicHref: "/data-storage/cap-theorem",
  },
  "bloom filter": {
    term: "Bloom Filter",
    definition:
      "A space-efficient data structure that can tell you 'definitely not in set' or 'probably in set'. Never has false negatives, but can have false positives.",
    relatedTopicHref: "/data-storage/bloom-filters",
  },

  // Caching
  cache: {
    term: "Cache",
    definition:
      "A fast storage layer that keeps frequently accessed data close to where it's needed. Like keeping your favorite books on your desk instead of walking to the library each time.",
  },
  "cache hit": {
    term: "Cache Hit",
    definition:
      "When requested data is found in the cache — fast response, no need to query the database.",
  },
  "cache miss": {
    term: "Cache Miss",
    definition:
      "When requested data is NOT in the cache — must fetch from the slower database, then optionally store it in cache for next time.",
  },
  "write-through": {
    term: "Write-Through",
    definition:
      "A caching strategy where data is written to both the cache and database simultaneously. Consistent but slower writes.",
    relatedTopicHref: "/caching/caching-strategies",
  },
  "write-back": {
    term: "Write-Back",
    definition:
      "A caching strategy where data is written to cache first, then asynchronously to the database. Fast writes but risk of data loss.",
    relatedTopicHref: "/caching/caching-strategies",
  },
  lru: {
    term: "LRU (Least Recently Used)",
    definition:
      "A cache eviction policy that removes the item that hasn't been accessed for the longest time. Most commonly used strategy.",
    relatedTopicHref: "/caching/eviction-policies",
  },
  ttl: {
    term: "TTL (Time To Live)",
    definition:
      "How long data stays valid in a cache before it expires and must be refreshed from the source.",
    relatedTopicHref: "/caching/cache-invalidation",
  },
  redis: {
    term: "Redis",
    definition:
      "An in-memory data store used as a cache, message broker, and database. Extremely fast because it stores everything in RAM.",
    relatedTopicHref: "/caching/distributed-caching",
  },

  // System Patterns
  microservices: {
    term: "Microservices",
    definition:
      "An architecture where an application is built as a collection of small, independent services that communicate over the network. Each can be deployed separately.",
    relatedTopicHref: "/system-patterns/microservices-vs-monolith",
  },
  monolith: {
    term: "Monolith",
    definition:
      "An architecture where the entire application is one single codebase deployed as one unit. Simpler to start with but harder to scale independently.",
    relatedTopicHref: "/system-patterns/microservices-vs-monolith",
  },
  "message queue": {
    term: "Message Queue",
    definition:
      "A system that lets services communicate asynchronously by putting messages in a queue. The receiver processes them at its own pace. Examples: Kafka, RabbitMQ.",
    relatedTopicHref: "/system-patterns/message-queues",
  },
  "event-driven": {
    term: "Event-Driven",
    definition:
      "An architecture where services react to events (things that happened) rather than direct requests. Enables loose coupling between components.",
    relatedTopicHref: "/system-patterns/event-driven-architecture",
  },
  cqrs: {
    term: "CQRS",
    definition:
      "Command Query Responsibility Segregation — using separate models for reading and writing data. Allows each to be optimized independently.",
    relatedTopicHref: "/system-patterns/cqrs-event-sourcing",
  },
  "event sourcing": {
    term: "Event Sourcing",
    definition:
      "Storing every change as an immutable event instead of just the current state. You can rebuild state by replaying events — like a bank transaction history.",
    relatedTopicHref: "/system-patterns/cqrs-event-sourcing",
  },
  "api gateway": {
    term: "API Gateway",
    definition:
      "A single entry point that routes client requests to the correct microservice. Handles auth, rate limiting, and request transformation.",
    relatedTopicHref: "/system-patterns/api-gateway",
  },
  "reverse proxy": {
    term: "Reverse Proxy",
    definition:
      "A server that sits between clients and backend servers, forwarding requests on behalf of clients. Provides load balancing, caching, and security.",
    relatedTopicHref: "/system-patterns/reverse-proxy",
  },

  // Reliability
  "circuit breaker": {
    term: "Circuit Breaker",
    definition:
      "A pattern that stops calling a failing service after repeated failures, giving it time to recover. Prevents cascade failures across your system.",
    relatedTopicHref: "/reliability/circuit-breaker",
  },
  "fault tolerance": {
    term: "Fault Tolerance",
    definition:
      "A system's ability to keep working when some components fail. Achieved through redundancy, replication, and graceful degradation.",
    relatedTopicHref: "/reliability/fault-tolerance",
  },
  failover: {
    term: "Failover",
    definition:
      "Automatically switching to a backup system when the primary one fails. Like a generator that kicks in during a power outage.",
    relatedTopicHref: "/reliability/fault-tolerance",
  },
  "health check": {
    term: "Health Check",
    definition:
      "A periodic probe that verifies if a service is running and healthy. Unhealthy services are removed from the load balancer until they recover.",
    relatedTopicHref: "/reliability/health-checks",
  },

  // Security
  oauth: {
    term: "OAuth",
    definition:
      "An authorization framework that lets users grant limited access to their accounts on one service to another, without sharing passwords.",
    relatedTopicHref: "/security/auth-and-authorization",
  },
  jwt: {
    term: "JWT",
    definition:
      "JSON Web Token — a compact, self-contained token that carries user identity and claims. The server can verify it without a database lookup.",
    relatedTopicHref: "/security/auth-and-authorization",
  },
  "rate limiting": {
    term: "Rate Limiting",
    definition:
      "Restricting how many requests a client can make in a time window. Protects APIs from abuse and ensures fair usage.",
    relatedTopicHref: "/security/rate-limiting",
  },
  "token bucket": {
    term: "Token Bucket",
    definition:
      "A rate limiting algorithm where tokens are added at a fixed rate. Each request uses one token. When the bucket is empty, requests are rejected.",
    relatedTopicHref: "/security/rate-limiting",
  },
  ddos: {
    term: "DDoS",
    definition:
      "Distributed Denial of Service — an attack where many machines flood a target with traffic to make it unavailable to real users.",
    relatedTopicHref: "/security/ddos-protection",
  },
  tls: {
    term: "TLS",
    definition:
      "Transport Layer Security — encrypts data in transit between client and server. The 'S' in HTTPS. Prevents eavesdropping and tampering.",
    relatedTopicHref: "/security/encryption",
  },

  // Real-world concepts
  "fan-out": {
    term: "Fan-out",
    definition:
      "When one event triggers messages to many recipients. In a social feed: one post may need to appear in millions of followers' timelines.",
    relatedTopicHref: "/real-world/news-feed",
  },
  websocket: {
    term: "WebSocket",
    definition:
      "A protocol that enables two-way real-time communication between client and server over a single persistent connection. Used in chat apps and live updates.",
    relatedTopicHref: "/real-world/chat-system",
  },
  "consistent hashing": {
    term: "Consistent Hashing",
    definition:
      "A technique for distributing data across servers so that adding or removing a server only moves a small portion of the data, not everything.",
    relatedTopicHref: "/scaling/load-balancing",
  },
  "base62": {
    term: "Base62",
    definition:
      "An encoding that uses 62 characters (a-z, A-Z, 0-9) to represent numbers compactly. Used in URL shorteners to create short, readable codes.",
    relatedTopicHref: "/real-world/url-shortener",
  },
  snowflake: {
    term: "Snowflake ID",
    definition:
      "A distributed unique ID format (created by Twitter) that encodes timestamp, machine ID, and sequence number into a 64-bit integer. IDs are sortable by time.",
    relatedTopicHref: "/real-world/unique-id-generator",
  },
  idempotent: {
    term: "Idempotent",
    definition:
      "An operation that produces the same result no matter how many times you repeat it. Important for retries — paying twice shouldn't charge twice.",
  },
  "back pressure": {
    term: "Back Pressure",
    definition:
      "A mechanism where a system slows down accepting new work when it's overwhelmed, preventing crashes. Like a queue at a popular restaurant.",
    relatedTopicHref: "/system-patterns/message-queues",
  },
};
