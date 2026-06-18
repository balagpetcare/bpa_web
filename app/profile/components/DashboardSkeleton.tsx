export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gray-200 h-48 w-full" />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 h-28" />
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 h-44" />
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 h-36" />
          ))}
        </div>
      </div>
    </div>
  );
}
