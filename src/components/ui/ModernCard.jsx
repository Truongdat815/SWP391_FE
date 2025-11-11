import { motion } from 'framer-motion';

export const ModernCard = ({ children, className = '', hover = true, gradient = false, roleColor = 'emerald' }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } : {}}
      className={`
        bg-white/80 backdrop-blur-lg rounded-lg shadow-md border border-white/20
        transition-all duration-300
        ${hover ? 'hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {gradient && (
        <div className={`absolute inset-0 bg-gradient-to-br from-${roleColor}-500/5 to-${roleColor === 'emerald' ? 'teal' : roleColor}-500/5 rounded-lg pointer-events-none`} />
      )}
      {children}
    </motion.div>
  );
};

export const ModernCardHeader = ({ title, subtitle, actions, icon, roleColor = 'emerald' }) => {
  return (
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-2 bg-gradient-to-br from-${roleColor}-500 to-${roleColor === 'emerald' ? 'teal' : roleColor}-600 rounded-lg shadow-md`}>
            <div className="w-5 h-5 text-white">{icon}</div>
          </div>
        )}
        <div>
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export const ModernCardContent = ({ children, className = '' }) => {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
};

export const ModernCardFooter = ({ children, className = '' }) => {
  return <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
};

