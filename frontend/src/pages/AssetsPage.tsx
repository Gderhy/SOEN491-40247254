/**
 * Assets Page
 * Displays the user's portfolio positions with live stock price tracking.
 * Positions are derived from transaction history (same data source as
 * HoldingsPage). For each position whose symbol looks like an exchange ticker,
 * the latest Finnhub price is fetched via the backend proxy and refreshed at
 * the user's chosen interval.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionsService } from '../services';
import { PageLayout } from '@layouts/index';
import { LoadingState } from '@components/index';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { PortfolioPosition } from '../types';
import { useLiveAssetPrices } from '../hooks/useLiveAssetPrices';
import LivePriceCell from '../components/assets/LivePriceCell';
import RefreshIntervalSelector, { DEFAULT_INTERVAL } from '../components/assets/RefreshIntervalSelector';
import './AssetsPage.css';

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL.value);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionsService.getPortfolioPositions();
      setPositions(data);
    } catch (err: unknown) {
      const e = err as any;
      if (e?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || !session) { navigate('/login'); return; }
    load();
  }, [user, session, navigate, load]);

  /* ── Live prices ───────────────────────────────────────────── */
  const symbols = positions.map((p) => p.symbol);
  const livePrices = useLiveAssetPrices(symbols, intervalMs);

  /* ── Helpers ───────────────────────────────────────────────── */
  const fmt = (n: number, digits = 2) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);

  const fmtQty = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 8 }).format(n);

  /* ── Render guards ─────────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout title="My Assets">
        <LoadingState message="Loading your assets…" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="My Assets">
        <div className="error-container">
          <WarningAmberRoundedIcon className="error-icon" />
          <h3>Error Loading Assets</h3>
          <p>{error}</p>
          <button onClick={load} className="retry-button">Try Again</button>
        </div>
      </PageLayout>
    );
  }

  if (positions.length === 0) {
    return (
      <PageLayout title="My Assets">
        <div className="empty-container">
          <InboxRoundedIcon className="empty-icon" />
          <h3>No Assets Yet</h3>
          <p>
            Your assets will appear here once you add transactions. Each stock
            or crypto you own shows up as one row with live pricing where
            available.
          </p>
          <button className="add-holding-button" onClick={() => navigate('/transactions')}>
            <AddRoundedIcon fontSize="small" />
            Go to Transactions
          </button>
        </div>
      </PageLayout>
    );
  }

  /* ── Main view ─────────────────────────────────────────────── */
  return (
    <PageLayout
      title="My Assets"
      subtitle={`${positions.length} ${positions.length === 1 ? 'position' : 'positions'} · live prices auto-refresh`}
    >
      {/* Controls */}
      <div className="assets-controls">
        <RefreshIntervalSelector value={intervalMs} onChange={setIntervalMs} />
        <button
          className="assets-refresh-btn"
          onClick={load}
          title="Reload positions"
        >
          <RefreshRoundedIcon fontSize="small" />
          Reload
        </button>
      </div>

      {/* Table */}
      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Symbol / Name</th>
              <th className="ta-right">Qty</th>
              <th className="ta-right">Avg Cost</th>
              <th className="ta-right">Total Invested</th>
              <th className="ta-right">Live Price</th>
              <th className="ta-right">Realized P&amp;L</th>
              <th className="ta-right">Fees</th>
              <th className="ta-right"># Trades</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const pnl = pos.realizedPnL ?? 0;
              const priceEntry = livePrices[pos.symbol];
              return (
                <tr key={pos.symbol} className="assets-row">
                  <td className="assets-name-cell">
                    <div className="assets-symbol">{pos.symbol}</div>
                    <div className="assets-name">{pos.name}</div>
                  </td>
                  <td className="ta-right">{fmtQty(pos.totalQuantity)}</td>
                  <td className="ta-right">{fmt(pos.averageBuyPrice)}</td>
                  <td className="ta-right">{fmt(pos.totalInvested)}</td>
                  <td className="ta-right assets-live-cell">
                    <LivePriceCell entry={priceEntry} />
                  </td>
                  <td className="ta-right">
                    <span className={`assets-pnl ${pnl >= 0 ? 'assets-pnl--pos' : 'assets-pnl--neg'}`}>
                      {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                    </span>
                  </td>
                  <td className="ta-right">{pos.totalFees > 0 ? fmt(pos.totalFees) : '—'}</td>
                  <td className="ta-right">{pos.transactionCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default AssetsPage;
