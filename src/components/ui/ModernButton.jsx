import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ModernButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  roleColor = 'emerald' // emerald, blue, purple, green
}) => {
  const variants = {
    primary: `bg-gradient-to-r from-${roleColor}-500 to-${roleColor === 'emerald' ? 'teal' : roleColor === 'blue' ? 'indigo' : roleColor === 'purple' ? 'pink' : 'emerald'}-600 text-white hover:from-${roleColor}-600 hover:to-${roleColor === 'emerald' ? 'teal' : roleColor === 'blue' ? 'indigo' : roleColor === 'purple' ? 'pink' : 'emerald'}-700`,
    secondary: `bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300`,
    ghost: `bg-transparent text-gray-700 hover:bg-gray-100`,
    danger: `bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600`,
    success: `bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600`,
    glass: `bg-white/20 backdrop-blur-lg border border-white/20 text-white hover:bg-white/30`
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-medium shadow-lg hover:shadow-xl 
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : icon && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  );
};

export default ModernButton;

