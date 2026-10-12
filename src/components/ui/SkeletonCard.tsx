// Skeleton loading cards for Gigma
// Used wherever data is loading — jobs, workers, transactions

import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.6,
    repeat: Infinity,
    ease: 'linear',
  },
};

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] ${className}`}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
      <div className="flex justify-between items-start">
        <SkeletonLine className="h-5 w-2/3" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-1">
        <SkeletonLine className="h-5 w-24" />
        <SkeletonLine className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex-1 rounded-xl p-3 bg-gray-50 space-y-2">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="h-5 w-20" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3">
      <SkeletonLine className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
      <SkeletonLine className="h-5 w-20" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <SkeletonLine className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-4 w-32" />
      </div>
    </div>
  );
}
