export function JobCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="skeleton w-14 h-14 rounded-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
            <div className="skeleton h-4 w-16 rounded" />
          </div>

          <div className="flex gap-3 mt-3">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>

          <div className="flex gap-2 mt-3">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
