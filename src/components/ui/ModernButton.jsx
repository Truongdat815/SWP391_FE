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
  roleColor = 'emerald', // emerald, blue, purple, green
  noHover = false
}) => {
  const getPrimaryVariant = () => {
    const base = `bg-gradient-to-r text-white`;
    const colorMap = {
      emerald: 'from-emerald-500 to-teal-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      green: 'from-green-500 to-emerald-600'
    };
    const hoverMap = {
      emerald: 'hover:from-emerald-600 hover:to-teal-700',
      blue: 'hover:from-blue-600 hover:to-indigo-700',
      purple: 'hover:from-purple-600 hover:to-pink-700',
      green: 'hover:from-green-600 hover:to-emerald-700'
    };
    return `${base} ${colorMap[roleColor] || colorMap.emerald} ${noHover ? '' : hoverMap[roleColor] || hoverMap.emerald}`;
  };

  const variants = {
    primary: getPrimaryVariant(),
    secondary: `bg-white border-2 border-gray-200 text-gray-700 ${noHover ? '' : 'hover:bg-gray-50 hover:border-gray-300'}`,
    ghost: `bg-transparent text-gray-700 ${noHover ? '' : 'hover:bg-gray-100'}`,
    danger: `bg-gradient-to-r from-red-500 to-pink-500 text-white ${noHover ? '' : 'hover:from-red-600 hover:to-pink-600'}`,
    success: `bg-gradient-to-r from-green-500 to-emerald-500 text-white ${noHover ? '' : 'hover:from-green-600 hover:to-emerald-600'}`,
    glass: `bg-white/20 backdrop-blur-lg border border-white/20 text-white ${noHover ? '' : 'hover:bg-white/30'}`
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
      whileHover={noHover || disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={noHover || disabled || loading ? {} : { scale: 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-medium shadow-lg ${noHover ? '' : 'hover:shadow-xl'} 
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

