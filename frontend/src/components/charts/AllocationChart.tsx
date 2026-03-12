/**
 * AllocationChart
 * Donut chart showing portfolio allocation by asset weight.
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fmtCurrency } from '../../utils/formatters';
import { generateChartColors } from '../../utils/chartColors';

interface AllocationEntry {
  symbol: string;
  value: number;
  weight: number;
}

interface AllocationChartProps {
  data: AllocationEntry[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry: AllocationEntry = payload[0].payload;
    return (
      <div className="alloc-chart-tooltip">
        <p className="alloc-chart-tooltip__symbol">{entry.symbol}</p>
        <p className="alloc-chart-tooltip__value">{fmtCurrency(entry.value)}</p>
        <p className="alloc-chart-tooltip__weight">{entry.weight.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, weight, symbol }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (weight < 4) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#6b7280"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {symbol} {weight.toFixed(1)}%
    </text>
  );
};

const AllocationChart: React.FC<AllocationChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const colors = generateChartColors(data.length);

  return (
    <div className="alloc-chart-wrapper">
      <h3 className="chart-section-title">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span style={{ fontSize: '0.8rem', color: '#374151' }}>{value}</span>
            )}
            iconType="circle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
