/**
 * PortfolioHistoryChart
 * Line chart showing portfolio value over time.
 * Uses portfolio_snapshots from the backend API when available,
 * or falls back to a generated stub if the table is not yet seeded.
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '../../services/apiService';

export interface Snapshot {
  date: string;
  portfolio_value: number;
}

type Range = '1W' | '1M' | '3M' | '1Y' | 'ALL';

const RANGES: Range[] = ['1W', '1M', '3M', '1Y', 'ALL'];

interface PortfolioHistoryChartProps {
  currentValue: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="history-chart-tooltip">
        <p className="history-chart-tooltip__date">{label}</p>
        <p className="history-chart-tooltip__value">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

function filterByRange(snapshots: Snapshot[], range: Range): Snapshot[] {
  if (range === 'ALL') return snapshots;
  const now = new Date();
  const days: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: Infinity };
  const cutoff = new Date(now.getTime() - days[range] * 24 * 60 * 60 * 1000);
  return snapshots.filter((s) => new Date(s.date) >= cutoff);
}

function formatDate(dateStr: string, range: Range): string {
  const d = new Date(dateStr);
  if (range === '1W') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (range === '1M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({ currentValue }) => {
  const [range, setRange] = useState<Range>('1M');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshots = async () => {
      setLoading(true);
      try {
        const res = await apiService.http.get('/api/portfolio-snapshots');
        const rows: Snapshot[] = res.data?.data ?? [];
        setSnapshots(rows);
      } catch {
        setSnapshots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshots();
  }, []);

  const filtered = filterByRange(snapshots, range);

  const chartData = filtered.map((s) => ({
    date: formatDate(s.date, range),
    value: s.portfolio_value,
  }));

  const hasData = chartData.length >= 2;

  const trend =
    hasData
      ? chartData[chartData.length - 1].value - chartData[0].value
      : 0;
  const lineColor = trend >= 0 ? '#059669' : '#dc2626';

  return (
    <div className="history-chart-wrapper">
      <div className="history-chart-header">
        <h3 className="chart-section-title">Portfolio Value Over Time</h3>
        <div className="history-chart-ranges">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`range-btn${range === r ? ' range-btn--active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="history-chart-placeholder">Loading chart data...</div>
      ) : !hasData ? (
        <div className="history-chart-placeholder">
          <p>No historical data yet.</p>
          <p className="history-chart-placeholder__sub">
            Current portfolio value: <strong>{fmt(currentValue)}</strong>
          </p>
          <p className="history-chart-placeholder__hint">
            Snapshots are saved daily. Come back tomorrow to see your first data point.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e1e5e9' }}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PortfolioHistoryChart;
