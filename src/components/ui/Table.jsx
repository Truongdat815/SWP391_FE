import { cn } from '../../utils/cn';

const Table = ({ children, className, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('min-w-full border-collapse border border-gray-300', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={cn('bg-gray-100', className)} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('bg-white', className)} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className, ...props }) => {
  return (
    <tr className={cn('border-b border-gray-300 hover:bg-gray-50 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
};

const TableHead = ({ children, className, ...props }) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-4 py-3 text-sm text-gray-900 border border-gray-300', className)} {...props}>
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
