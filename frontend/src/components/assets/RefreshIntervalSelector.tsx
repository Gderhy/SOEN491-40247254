/**
 * RefreshIntervalSelector
 * Renders a labelled dropdown that lets the user choose how often live
 * stock prices are refreshed.
 */

import React from 'react';
import './RefreshIntervalSelector.css';

export interface RefreshInterval {
  label: string;
  value: number; // milliseconds
}

export const REFRESH_INTERVALS: RefreshInterval[] = [
  { label: '15s', value: 15_000 },
  { label: '30s', value: 30_000 },
  { label: '1m',  value: 60_000 },
  { label: '5m',  value: 300_000 },
];

export const DEFAULT_INTERVAL = REFRESH_INTERVALS[1]; // 30s

interface RefreshIntervalSelectorProps {
  value: number;
  onChange: (intervalMs: number) => void;
}

const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="refresh-selector">
      <label className="refresh-selector__label" htmlFor="refresh-interval-select">
        Refresh every
      </label>
      <select
        id="refresh-interval-select"
        className="refresh-selector__select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {REFRESH_INTERVALS.map((interval) => (
          <option key={interval.value} value={interval.value}>
            {interval.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RefreshIntervalSelector;
