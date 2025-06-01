'use client';

import { Skeleton } from './ui/skeleton';

export default function MealPlannerSkeleton() {
  return (
    <div className="h-[80vh] max-h-[600px] min-h-[500px] flex flex-col border rounded-lg bg-white shadow-lg">
      {/* Header Skeleton */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 bg-white/20" />
          <Skeleton className="h-5 w-32 bg-white/20" />
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Agent Message */}
        <div className="flex justify-start">
          <div className="flex items-start gap-3 max-w-[85%]">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="bg-gray-100 rounded-lg p-3 max-w-full">
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="flex items-start gap-3 max-w-[85%] flex-row-reverse">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="bg-indigo-100 rounded-lg p-3 max-w-full">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Another Agent Message */}
        <div className="flex justify-start">
          <div className="flex items-start gap-3 max-w-[85%]">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="bg-gray-100 rounded-lg p-3 max-w-full">
              <Skeleton className="h-4 w-56 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="border-t bg-gray-50 p-4 flex-shrink-0 rounded-b-lg">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
} 