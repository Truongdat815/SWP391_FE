import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const LineChart = ({ data, dataKey, name, color = '#3B82F6', height = 200 }) => {
  // Custom tooltip - Memoize để tránh re-render
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg pointer-events-none">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-blue-600 font-medium">
          {name}: {payload[0].value} triệu VND
        </p>
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart 
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          label={{ value: 'Tuần', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          label={{ value: 'Triệu VND', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          animationDuration={0}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          name={name} 
          stroke={color} 
          strokeWidth={3}
          dot={{ fill: color, r: 5 }}
          activeDot={{ r: 7 }}
          animationDuration={0}
        />
      </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;

