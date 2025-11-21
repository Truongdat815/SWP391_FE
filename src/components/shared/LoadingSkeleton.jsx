import { cn } from '../../utils/cn';

const LoadingSkeleton = ({ className, variant = 'default' }) => {
  const variants = {
    default: 'h-4 rounded',
    circle: 'rounded-full',
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    avatar: 'w-10 h-10 rounded-full',
    button: 'h-10 rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200',
        variants[variant],
        className
      )}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200">
    <LoadingSkeleton variant="text" className="w-3/4 mb-4" />
    <LoadingSkeleton variant="text" className="w-1/2 mb-2" />
    <LoadingSkeleton variant="text" className="w-full" />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <LoadingSkeleton key={j} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="w-1/3" />
          <LoadingSkeleton className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;

