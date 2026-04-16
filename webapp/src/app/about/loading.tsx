export default function AboutLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative h-[50vh] min-h-[400px] bg-muted animate-pulse" />
      
      {/* Content skeleton */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            <div className="h-24 w-full bg-muted rounded animate-pulse" />
            <div className="h-24 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="h-64 w-full bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
