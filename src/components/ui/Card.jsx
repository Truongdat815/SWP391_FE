import { cn } from '../../utils/cn';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;

