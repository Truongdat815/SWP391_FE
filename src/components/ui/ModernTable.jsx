import { motion } from 'framer-motion';

export const ModernTable = ({ children, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-100 shadow-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          {children}
        </table>
      </div>
    </div>
  );
};

export const ModernTableHead = ({ children }) => {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      {children}
    </thead>
  );
};

export const ModernTableHeader = ({ children, sortable = false, onSort, className = '' }) => {
  return (
    <th className={`px-6 py-4 text-left ${className}`}>
      <div className={`flex items-center gap-2 ${sortable ? 'group cursor-pointer' : ''}`} onClick={onSort}>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {children}
        </span>
        {sortable && (
          <motion.svg
            whileHover={{ scale: 1.2 }}
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </motion.svg>
        )}
      </div>
    </th>
  );
};

export const ModernTableBody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-100">
      {children}
    </tbody>
  );
};

export const ModernTableRow = ({ children, index = 0, onClick, className = '' }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.tr>
  );
};

export const ModernTableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
};

