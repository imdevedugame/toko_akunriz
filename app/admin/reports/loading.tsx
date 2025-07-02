export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}
