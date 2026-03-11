/**
 * LivePriceCell
 * Displays the live price information for a single portfolio position.
 * Handles loading, error, stale-data, and unavailable states.
 */

import React from 'react';
import type { PriceEntry } from '../../hooks/useLiveAssetPrices';
import './LivePriceCell.css';

interface LivePriceCellProps {
  entry: PriceEntry | undefined;
}

const LivePriceCell: React.FC<LivePriceCellProps> = ({ entry }) => {
  if (!entry || entry.unavailable) {
    return <span className="live-price live-price--unavailable">Live price unavailable</span>;
  }

  if (entry.loading && !entry.quote) {
    return <span className="live-price live-price--loading">Loading…</span>;
  }

  if (entry.error && !entry.quote) {
    return <span className="live-price live-price--error">Failed to refresh</span>;
  }

  if (!entry.quote) {
    return <span className="live-price live-price--loading">Loading…</span>;
  }

  const { price, change, changePercent } = entry.quote;
  const isPositive = change >= 0;
  const changeClass = isPositive ? 'live-price__change--pos' : 'live-price__change--neg';
  const sign = isPositive ? '+' : '';

  return (
    <span className={`live-price ${entry.stale ? 'live-price--stale' : ''}`}>
      <span className="live-price__value">
        {price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
      </span>
      <span className={`live-price__change ${changeClass}`}>
        {sign}{change.toFixed(2)} ({sign}{changePercent.toFixed(2)}%)
      </span>
      {entry.stale && (
        <span className="live-price__stale-badge" title="Last refresh failed — showing stale data">
          stale
        </span>
      )}
      {entry.lastUpdated && (
        <span className="live-price__updated">
          {entry.lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </span>
  );
};

export default LivePriceCell;
