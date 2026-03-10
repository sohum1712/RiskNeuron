import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number; // 0-1
  tier: 'low' | 'medium' | 'high';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, tier }) => {
  const percentage = Math.round(score * 100);
  
  const getColor = () => {
    if (score < 0.35) return '#10B981'; // green
    if (score < 0.65) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const data = [
    {
      name: 'Risk',
      value: percentage,
      fill: getColor()
    }
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#1E293B' }}
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center">
          <div className={`text-3xl font-black uppercase tracking-wider ${
            tier === 'low' ? 'text-emerald-400' : 
            tier === 'medium' ? 'text-amber-400' : 
            'text-red-400'
          }`}>
            {tier}
          </div>
          <div className="text-5xl font-black text-slate-100 mt-1">
            {percentage}
          </div>
          <div className="text-sm text-slate-400 mt-1">Risk Score</div>
        </div>
      </motion.div>
    </div>
  );
};
