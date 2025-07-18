import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-black ${sizeClasses[size]} ${className}`}></div>
  );
};

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />;
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 ${colIndex === 0 ? "w-32" : "w-24"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton = ({ count = 3 }: CardSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-4">
            <Skeleton className="p-2.5 rounded-lg w-10 h-10" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface PageSkeletonProps {
  showHeader?: boolean;
  showCards?: boolean;
  showTable?: boolean;
}

export const PageSkeleton = ({
  showHeader = true,
  showCards = true,
  showTable = true,
}: PageSkeletonProps) => {
  return (
    <div className="space-y-8">
      {showHeader && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Skeleton className="h-6 w-48 mb-4" />
          <CardSkeleton />
        </div>
      )}

      {showCards && <CardSkeleton />}

      {showTable && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-4">
            <TableSkeleton />
          </div>
        </div>
      )}
    </div>
  );
}; 