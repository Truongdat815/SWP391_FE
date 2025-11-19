import { cn } from '../../utils/cn';

const Input = ({
  label,
  error,
  className,
  type = 'text',
  placeholder,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300',
          className
        )}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;

