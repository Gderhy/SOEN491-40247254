/**
 * Assets Page
 * Shows each stock/crypto holding aggregated from the user's transaction history.
 * One row per symbol: net quantity, avg cost, total invested, realised P&L, fees.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionsService } from '../services';
import { PageLayout } from '@layouts/index';
import { LoadingState } from '@components/index';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { PortfolioPosition } from '../types';
import './AssetsPage.css';

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  /* ── helpers ─────────────────────────────────────────────── */
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

  /* ── summary totals ─────────────────────────────────────── */
  const totalInvested = positions.reduce((s, p) => s + p.totalInvested, 0);
  const totalValue    = positions.reduce((s, p) => s + (p.currentValue ?? p.totalInvested), 0);
  const totalPnL      = positions.reduce((s, p) => s + (p.realizedPnL ?? 0), 0);
  const totalFees     = positions.reduce((s, p) => s + p.totalFees, 0);

  /* ── render ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout title="My Holdings">
        <LoadingState message="Loading your holdings…" />
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
          <p>Your holdings will appear here once you add transactions. Each stock or crypto you've bought (net of sells) shows up as one row.</p>
          <button className="add-asset-button" onClick={() => navigate('/transactions')}>
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
      {/* Summary bar */}
      <div className="holdings-summary">
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Total Invested</span>
          <span className="holdings-summary__value">{fmt(totalInvested)}</span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Current Value</span>
          <span className="holdings-summary__value">{fmt(totalValue)}</span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Realized P&amp;L</span>
          <span className={`holdings-summary__value ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)}
          </span>
        </div>
        <div className="holdings-summary__stat">
          <span className="holdings-summary__label">Total Fees</span>
          <span className="holdings-summary__value">{fmt(totalFees)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Symbol / Name</th>
              <th className="ta-right">Quantity</th>
              <th className="ta-right">Avg Cost</th>
              <th className="ta-right">Total Invested</th>
              <th className="ta-right">Realized P&amp;L</th>
              <th className="ta-right">Fees</th>
              <th className="ta-right"># Trades</th>
              <th>Last Trade</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const pnl = pos.realizedPnL ?? 0;
              return (
                <tr key={pos.symbol} className="asset-row">
                  <td className="asset-name">
                    <div className="holdings-symbol">{pos.symbol}</div>
                    <div className="holdings-name">{pos.name}</div>
                  </td>
                  <td className="ta-right asset-quantity">{fmtQty(pos.totalQuantity)}</td>
                  <td className="ta-right">{fmt(pos.averageBuyPrice)}</td>
                  <td className="ta-right asset-value">{fmt(pos.totalInvested)}</td>
                  <td className="ta-right">
                    <span className={`holdings-pnl ${pnl >= 0 ? 'holdings-pnl--pos' : 'holdings-pnl--neg'}`}>
                      {pnl >= 0
                        ? <TrendingUpRoundedIcon style={{ fontSize: '1rem' }} />
                        : <TrendingDownRoundedIcon style={{ fontSize: '1rem' }} />}
                      {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                    </span>
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

export default AssetsPage;
