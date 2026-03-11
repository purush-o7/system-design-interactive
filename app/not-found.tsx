import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-md border border-border bg-muted/30 px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
