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
      <div style={{
        background: 'rgba(22,28,39,0.95)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: '12px 16px',
        backdropFilter: 'blur(16px)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ color: '#5690FF', fontSize: 13, marginBottom: 3 }}>Expected: ₹{expected.toFixed(0)}</p>
        <p style={{ color: '#22C55E', fontSize: 13, marginBottom: loss > 0 ? 3 : 0 }}>Actual: ₹{actual.toFixed(0)}</p>
        {loss > 0 && <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 700 }}>Loss: ₹{loss.toFixed(0)}</p>}
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
            <stop offset="5%" stopColor="#5690FF" stopOpacity={0.20} />
            <stop offset="95%" stopColor="#5690FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis 
          dataKey="date" 
          stroke="rgba(255,255,255,0.15)"
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.15)"
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
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
          stroke="#5690FF"
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="url(#colorExpected)"
          name="Expected"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#22C55E"
          strokeWidth={2}
          fill="url(#colorActual)"
          name="Actual"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
