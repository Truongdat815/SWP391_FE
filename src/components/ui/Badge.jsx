import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-700 border border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    primary: 'bg-blue-600 text-white border border-blue-700',
    secondary: 'bg-purple-50 text-purple-700 border border-purple-200',
    tertiary: 'bg-pink-50 text-pink-700 border border-pink-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

