"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary", className)}
      {...props}
    />
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-card border border-border overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6">
        <Skeleton className="w-full max-w-xs h-64 rounded-full" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <Skeleton className="w-full sm:w-28 lg:w-32 h-28 lg:h-32 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

