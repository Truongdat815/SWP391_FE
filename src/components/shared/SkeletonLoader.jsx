const SkeletonLoader = ({ className = '', lines = 1, width = 'full' }) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${widthClasses[width] || widthClasses.full}`}
          style={typeof width === 'number' ? { width: `${width}%` } : {}}
        />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {/* Header skeleton */}
        <div className="flex gap-4 border-b border-gray-200 pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

export default SkeletonLoader;

