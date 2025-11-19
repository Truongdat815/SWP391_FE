import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from '../ui/Card';

const MetricCard = ({ title, value, change, changeType = 'positive', icon: Icon, className }) => {
  return (
    <Card className={cn('', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <TrendingUp size={16} className="text-green-600 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-600 mr-1" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon size={24} className="text-blue-600" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;

