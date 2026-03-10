import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface EarningsDataPoint {
  date: string;
  expected: number;
  actual: number;
  isDisruption?: boolean;
}

interface EarningsChartProps {
  data: EarningsDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const expected = payload[0]?.value || 0;
    const actual = payload[1]?.value || 0;
    const loss = Math.max(0, expected - actual);
    
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-cyan-400 text-sm">Expected: ₹{expected.toFixed(0)}</p>
          <p className="text-emerald-400 text-sm">Actual: ₹{actual.toFixed(0)}</p>
          {loss > 0 && <p className="text-red-400 text-sm font-semibold">Loss: ₹{loss.toFixed(0)}</p>}
        </div>
      </div>
    );
  }
  return null;
};

export const EarningsChart: React.FC<EarningsChartProps> = ({ data }) => {
  const disruptionDates = data.filter(d => d.isDisruption).map(d => d.date);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="date" 
          stroke="#94A3B8" 
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
        />
        <YAxis 
          stroke="#94A3B8" 
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {disruptionDates.map((date, idx) => (
          <ReferenceLine 
            key={idx} 
            x={date} 
            stroke="#EF4444" 
            strokeWidth={2} 
            strokeDasharray="3 3"
            label={{ value: '⚠️', position: 'top', fill: '#EF4444' }}
          />
        ))}
        
        <Area
          type="monotone"
          dataKey="expected"
          stroke="#06B6D4"
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="url(#colorExpected)"
          name="Expected"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#colorActual)"
          name="Actual"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
