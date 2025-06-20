import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

// Lazy load the heavy inventory component
const InventoryContent = dynamic(() => import('../inventory/page'), {
  loading: () => (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Inventory Loading Skeleton */}
      <div className="mb-8">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="w-full h-32 rounded-lg mb-4" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for this heavy component
});

export default InventoryContent; 