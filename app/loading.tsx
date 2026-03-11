export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-4/5 bg-muted rounded" />
      </div>

      {/* Content block skeletons */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-5 w-1/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-2/5 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-4/5 bg-muted rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-1/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-1/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
