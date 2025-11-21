import { useCallback } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BarChart = ({ data, dataKey, name, color = '#3B82F6', height = 200 }) => {
  // Custom tooltip với kích thước cố định để tránh layout shift
  // Sử dụng useCallback để tránh re-render không cần thiết
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div 
        className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
        style={{ 
          minWidth: '150px',
          maxWidth: '200px',
          pointerEvents: 'none',
          position: 'absolute',
          zIndex: 1000
        }}
      >
        <p className="font-semibold text-gray-900 mb-1 whitespace-nowrap">{label}</p>
        <p className="text-blue-600 font-medium whitespace-nowrap">
          {name}: {payload[0].value} triệu VND
        </p>
      </div>
    );
  }, [name]);

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          interval={0}
          tickFormatter={(value) => {
            // Giới hạn độ dài tên để tránh quá dài
            if (value.length > 15) {
              return value.substring(0, 15) + '...';
            }
            return value;
          }}
          label={{ value: 'Nhân viên', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          label={{ value: 'Triệu VND', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 } }}
        />
        <Tooltip 
          content={CustomTooltip}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          animationDuration={0}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{ 
            outline: 'none',
            pointerEvents: 'none'
          }}
        />
        <Bar 
          dataKey={dataKey} 
          name={name} 
          fill={color} 
          radius={[4, 4, 0, 0]}
          animationDuration={0}
          isAnimationActive={false}
        />
      </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

