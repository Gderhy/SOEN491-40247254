/**
 * Holdings Page
 * Shows each stock/crypto holding aggregated from the user's transaction history.
 * One row per symbol: net quantity, avg cost, total invested, realised P&L, fees,
 * unrealized P&L, and portfolio weight.
 * Live stock prices are fetched via the backend Finnhub proxy and auto-refresh
 * at the user's chosen interval.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionsService } from '../services';
import { apiService } from '../services/apiService';
import { PageLayout } from '@layouts/index';
import { LoadingState } from '@components/index';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import type { PortfolioPosition } from '../types';
import { useLiveAssetPrices } from '../hooks/useLiveAssetPrices';
import LivePriceCell from '../components/assets/LivePriceCell';
import RefreshIntervalSelector, { DEFAULT_INTERVAL } from '../components/assets/RefreshIntervalSelector';
import AllocationChart from '../components/charts/AllocationChart';
import PortfolioHistoryChart from '../components/charts/PortfolioHistoryChart';
import './HoldingsPage.css';

type SortField = 'unrealizedPnL' | 'currentValue' | 'quantity' | 'weight' | 'lastTrade';
type SortDir = 'asc' | 'desc';

const HoldingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL.value);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionsService.getPortfolioPositions();
      setPositions(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load holdings');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || !session) { navigate('/login'); return; }
    load();
  }, [user, session, navigate, load]);

  /* -- Live prices ----------------------------------------------- */
  const symbols = positions.map((p) => p.symbol);
  const livePrices = useLiveAssetPrices(symbols, intervalMs);

  /* -- Enrich positions with live-price data --------------------- */
  const enriched = useMemo(() => {
    return positions.map((pos) => {
      const entry = livePrices[pos.symbol];
      const livePrice = entry?.quote?.price ?? null;
      const currentValue = livePrice !== null ? livePrice * pos.totalQuantity : null;
      const unrealizedPnL = (livePrice !== null)
        ? (livePrice - pos.averageBuyPrice) * pos.totalQuantity
        : null;
      const unrealizedPnLPct = (unrealizedPnL !== null && pos.totalInvested > 0)
        ? (unrealizedPnL / pos.totalInvested) * 100
        : null;
      return { ...pos, livePrice, currentValue, unrealizedPnL, unrealizedPnLPct };
    });
  }, [positions, livePrices]);

  /* -- Summary totals -------------------------------------------- */
  const totalInvested      = enriched.reduce((s, p) => s + p.totalInvested, 0);
  const totalCurrentValue  = enriched.reduce((s, p) => s + (p.currentValue ?? p.totalInvested), 0);
  const totalUnrealizedPnL = enriched.reduce((s, p) => s + (p.unrealizedPnL ?? 0), 0);
  const totalRealizedPnL   = enriched.reduce((s, p) => s + (p.realizedPnL ?? 0), 0);
  const totalFees          = enriched.reduce((s, p) => s + p.totalFees, 0);

  /* -- Save daily portfolio snapshot ----------------------------- */
  useEffect(() => {
    if (enriched.length === 0) return;
    const hasLivePrice = enriched.some((p) => p.livePrice !== null);
    if (!hasLivePrice) return;
    apiService.http
      .post('/api/portfolio-snapshots', { portfolio_value: totalCurrentValue })
      .catch(() => { /* non-critical */ });
  }, [totalCurrentValue, enriched]);

  /* -- Best / Worst performer ------------------------------------ */
  const performers = enriched
    .filter((p) => p.unrealizedPnLPct !== null)
    .sort((a, b) => (b.unrealizedPnLPct ?? 0) - (a.unrealizedPnLPct ?? 0));
  const best  = performers[0] ?? null;
  const worst = performers[performers.length - 1] ?? null;

  /* -- Allocation chart data ------------------------------------- */
  const allocationData = useMemo(() => {
    return enriched
      .filter((p) => (p.currentValue ?? p.totalInvested) > 0)
      .map((p) => ({
        symbol: p.symbol,
        value: p.currentValue ?? p.totalInvested,
        weight: totalCurrentValue > 0
          ? ((p.currentValue ?? p.totalInvested) / totalCurrentValue) * 100
          : 0,
      }));
  }, [enriched, totalCurrentValue]);

  /* -- Sorting --------------------------------------------------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedPositions = useMemo(() => {
    if (!sortField) return enriched;
    return [...enriched].sort((a, b) => {
      let av = 0, bv = 0;
      switch (sortField) {
        case 'unrealizedPnL':
          av = a.unrealizedPnL ?? -Infinity;
          bv = b.unrealizedPnL ?? -Infinity;
          break;
        case 'currentValue':
          av = a.currentValue ?? a.totalInvested;
          bv = b.currentValue ?? b.totalInvested;
          break;
        case 'quantity':
          av = a.totalQuantity;
          bv = b.totalQuantity;
          break;
        case 'weight':
          av = a.currentValue ?? a.totalInvested;
          bv = b.currentValue ?? b.totalInvested;
          break;
        case 'lastTrade':
          av = new Date(a.lastTransactionDate).getTime();
          bv = new Date(b.lastTransactionDate).getTime();
          break;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [enriched, sortField, sortDir]);

  /* -- helpers --------------------------------------------------- */
  const fmt = (n: number, digits = 2) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);

  const fmtQty = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 8 }).format(n);

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="sort-icon sort-icon--inactive">⇕</span>;
    return sortDir === 'asc'
      ? <ArrowUpwardRoundedIcon style={{ fontSize: '0.8rem', verticalAlign: 'middle' }} />
      : <ArrowDownwardRoundedIcon style={{ fontSize: '0.8rem', verticalAlign: 'middle' }} />;
  };

  /* -- render ---------------------------------------------------- */
  if (loading) {
    return (
      <PageLayout title="My Holdings">
        <LoadingState message="Loading your holdings..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="My Holdings">
        <div className="error-container">
          <WarningAmberRoundedIcon className="error-icon" />
          <h3>Error Loading Holdings</h3>
          <p>{error}</p>
          <button onClick={load} className="retry-button">Try Again</button>
        </div>
      </PageLayout>
    );
  }

  if (positions.length === 0) {
    return (
      <PageLayout title="My Holdings">
        <div className="empty-container">
          <InboxRoundedIcon className="empty-icon" />
          <h3>No Holdings Yet</h3>
          <p>Your holdings will appear here once you add transactions. Each stock or crypto you have bought (net of sells) shows up as one row.</p>
          <button className="add-holding-button" onClick={() => navigate('/transactions')}>
            <AddRoundedIcon fontSize="small" />
            Go to Transactions
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="My Holdings"
      subtitle={`${positions.length} ${positions.length === 1 ? 'position' : 'positions'} · derived from transaction history`}
    >
      {/* Summary cards */}
      <div className="holdings-summary">
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Total Invested</span>
          <span className="holdings-summary__value">{fmt(totalInvested)}</span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Current Value</span>
          <span className="holdings-summary__value">{fmt(totalCurrentValue)}</span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Unrealized P&amp;L</span>
          <span className={`holdings-summary__value ${totalUnrealizedPnL >= 0 ? 'positive' : 'negative'}`}>
            {totalUnrealizedPnL >= 0 ? '+' : ''}{fmt(totalUnrealizedPnL)}
          </span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Realized P&amp;L</span>
          <span className={`holdings-summary__value ${totalRealizedPnL >= 0 ? 'positive' : 'negative'}`}>
            {totalRealizedPnL >= 0 ? '+' : ''}{fmt(totalRealizedPnL)}
          </span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Total Fees</span>
          <span className="holdings-summary__value">{fmt(totalFees)}</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="holdings-charts-row">
        <div className="holdings-chart-card holdings-chart-card--history">
          <PortfolioHistoryChart currentValue={totalCurrentValue} />
        </div>
        <div className="holdings-chart-card holdings-chart-card--allocation">
          <AllocationChart data={allocationData} />
        </div>
      </div>

      {/* Best / Worst performer */}
      {performers.length >= 2 && best && worst && best.symbol !== worst.symbol && (
        <div className="holdings-performers">
          <div className="performer-card performer-card--best">
            <EmojiEventsRoundedIcon style={{ fontSize: '1.1rem' }} />
            <span className="performer-card__label">Best Performer</span>
            <span className="performer-card__symbol">{best.symbol}</span>
            <span className="performer-card__pct">
              {(best.unrealizedPnLPct ?? 0) >= 0 ? '+' : ''}{(best.unrealizedPnLPct ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="performer-card performer-card--worst">
            <TrendingDownRoundedIcon style={{ fontSize: '1.1rem' }} />
            <span className="performer-card__label">Worst Performer</span>
            <span className="performer-card__symbol">{worst.symbol}</span>
            <span className="performer-card__pct">
              {(worst.unrealizedPnLPct ?? 0) >= 0 ? '+' : ''}{(worst.unrealizedPnLPct ?? 0).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Live price refresh selector */}
      <div className="holdings-live-controls">
        <RefreshIntervalSelector value={intervalMs} onChange={setIntervalMs} />
      </div>

      {/* Table */}
      <div className="holdings-table-container">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Symbol / Name</th>
              <th className="ta-right sortable" onClick={() => handleSort('quantity')}>
                Quantity <SortIcon field="quantity" />
              </th>
              <th className="ta-right">Avg Cost</th>
              <th className="ta-right sortable" onClick={() => handleSort('currentValue')}>
                Current Value <SortIcon field="currentValue" />
              </th>
              <th className="ta-right">Live Price</th>
              <th className="ta-right sortable" onClick={() => handleSort('unrealizedPnL')}>
                Unrealized P&amp;L <SortIcon field="unrealizedPnL" />
              </th>
              <th className="ta-right">Realized P&amp;L</th>
              <th className="ta-right sortable" onClick={() => handleSort('weight')}>
                Weight % <SortIcon field="weight" />
              </th>
              <th className="ta-right">Fees</th>
              <th className="ta-right"># Trades</th>
              <th className="sortable" onClick={() => handleSort('lastTrade')}>
                Last Trade <SortIcon field="lastTrade" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map(pos => {
              const realizedPnL = pos.realizedPnL ?? 0;
              const unrealized  = pos.unrealizedPnL;
              const unrealizedPct = pos.unrealizedPnLPct;
              const cv = pos.currentValue ?? pos.totalInvested;
              const weightPct = totalCurrentValue > 0 ? (cv / totalCurrentValue) * 100 : 0;

              return (
                <tr key={pos.symbol} className="holding-row">
                  <td className="holding-name">
                    <div className="holdings-symbol">{pos.symbol}</div>
                    <div className="holdings-name">{pos.name}</div>
                  </td>
                  <td className="ta-right holding-quantity">{fmtQty(pos.totalQuantity)}</td>
                  <td className="ta-right">{fmt(pos.averageBuyPrice)}</td>
                  <td className="ta-right holding-value">{fmt(cv)}</td>
                  <td className="ta-right holdings-live-cell">
                    <LivePriceCell entry={livePrices[pos.symbol]} />
                  </td>

                  {/* Unrealized P&L */}
                  <td className="ta-right">
                    {unrealized !== null ? (
                      <span className={`holdings-pnl ${unrealized >= 0 ? 'holdings-pnl--pos' : 'holdings-pnl--neg'}`}>
                        {unrealized >= 0
                          ? <TrendingUpRoundedIcon style={{ fontSize: '1rem' }} />
                          : <TrendingDownRoundedIcon style={{ fontSize: '1rem' }} />}
                        <span>
                          {unrealized >= 0 ? '+' : ''}{fmt(unrealized)}
                          {unrealizedPct !== null && (
                            <span className="holdings-pnl__pct">
                              {' '}({unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </span>
                    ) : (
                      <span className="holdings-pnl-unavailable">—</span>
                    )}
                  </td>

                  {/* Realized P&L */}
                  <td className="ta-right">
                    <span className={`holdings-pnl ${realizedPnL >= 0 ? 'holdings-pnl--pos' : 'holdings-pnl--neg'}`}>
                      {realizedPnL >= 0
                        ? <TrendingUpRoundedIcon style={{ fontSize: '1rem' }} />
                        : <TrendingDownRoundedIcon style={{ fontSize: '1rem' }} />}
                      {realizedPnL >= 0 ? '+' : ''}{fmt(realizedPnL)}
                    </span>
                  </td>

                  {/* Weight % */}
                  <td className="ta-right holding-weight">
                    <div className="weight-bar-cell">
                      <span className="weight-bar-cell__pct">{weightPct.toFixed(1)}%</span>
                      <div className="weight-bar">
                        <div
                          className="weight-bar__fill"
                          style={{ width: `${Math.min(weightPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="ta-right">{pos.totalFees > 0 ? fmt(pos.totalFees) : '—'}</td>
                  <td className="ta-right">{pos.transactionCount}</td>
                  <td>{fmtDate(pos.lastTransactionDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default HoldingsPage;
