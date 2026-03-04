/**
 * TransactionsPage Component
 * Full CRUD: list, create (drawer), edit (drawer), delete (confirm modal).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TransactionsService } from '../services';
import { PageLayout } from '@layouts/index';
import { LoadingState, TransactionDrawer, DeleteConfirmModal } from '@components/index';
import { useSnackbar } from '@components/ui';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type {
  Transaction,
  PortfolioSummary,
  TransactionFilters,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '../types';
import '../styles/transactions.css';

interface TransactionsPageProps {}

export const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const { showSnackbar } = useSnackbar();

  /* ─── Data state ───────────────────────────────────────────── */
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Filter state ─────────────────────────────────────────── */
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  /* ─── Drawer state ─────────────────────────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  /* ─── Delete modal state ───────────────────────────────────── */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  /* ─── Load data ────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsData, portfolioData] = await Promise.all([
        TransactionsService.getTransactions(filters),
        TransactionsService.getPortfolioSummary(),
      ]);
      setTransactions(transactionsData);
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ─── Drawer helpers ───────────────────────────────────────── */
  const openCreateDrawer = () => {
    setDrawerMode('create');
    setEditingTransaction(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (tx: Transaction) => {
    setDrawerMode('edit');
    setEditingTransaction(tx);
    setDrawerOpen(true);
  };

  const handleSave = async (data: CreateTransactionRequest | UpdateTransactionRequest) => {
    if (drawerMode === 'create') {
      await TransactionsService.createTransaction(data as CreateTransactionRequest);
      showSnackbar({ severity: 'success', message: 'Transaction added successfully.' });
    } else if (editingTransaction) {
      await TransactionsService.updateTransaction(editingTransaction.id, data as UpdateTransactionRequest);
      showSnackbar({ severity: 'success', message: 'Transaction updated successfully.' });
    }
    await loadData();
  };

  /* ─── Delete helpers ───────────────────────────────────────── */
  const openDeleteModal = (tx: Transaction) => {
    setDeletingTransaction(tx);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    await TransactionsService.deleteTransaction(deletingTransaction.id);
    showSnackbar({ severity: 'success', message: 'Transaction deleted.' });
    await loadData();
  };

  /* ─── Filter helpers ───────────────────────────────────────── */
  const handleFilterChange = (filterKey: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [filterKey]: value || undefined }));
  };

  const clearFilters = () => setFilters({});

  /* ─── Formatters ───────────────────────────────────────────── */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  /* ─── Render ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout title="Transaction History">
        <LoadingState message="Loading transactions…" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Transaction History">
        <div className="error-state">
          <WarningAmberRoundedIcon className="state-icon state-icon--error" />
          <h2>Error Loading Transactions</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">Try Again</button>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title="Transaction History"
        actions={
          <>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="filter-toggle-button"
            >
              <FilterListRoundedIcon fontSize="small" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button className="add-transaction-button" onClick={openCreateDrawer}>
              <AddRoundedIcon fontSize="small" />
              Add Transaction
            </button>
          </>
        }
      >
        {/* Portfolio Summary */}
        {portfolio && (
          <div className="portfolio-summary">
            <h2>Portfolio Overview</h2>
            <div className="summary-stats">
              <div className="stat-card">
                <span className="stat-label">Total Invested</span>
                <span className="stat-value">{formatCurrency(portfolio.totalInvested)}</span>
              </div>
              {portfolio.currentValue != null && (
                <>
                  <div className="stat-card">
                    <span className="stat-label">Current Value</span>
                    <span className="stat-value">{formatCurrency(portfolio.currentValue)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Unrealized P&amp;L</span>
                    <span className={`stat-value ${(portfolio.totalUnrealizedPnL ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(portfolio.totalUnrealizedPnL ?? 0)}
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Return %</span>
                    <span className={`stat-value ${(portfolio.totalUnrealizedPnLPercent ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                      {((portfolio.totalUnrealizedPnLPercent ?? 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL"
                  value={filters.symbol || ''}
                  onChange={e => handleFilterChange('symbol', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Type</label>
                <select
                  value={filters.type || ''}
                  onChange={e => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={e => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={e => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="transactions-section">
          <div className="section-header">
            <h2>Transactions ({transactions.length})</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <InboxRoundedIcon className="state-icon state-icon--empty" />
              <h3>No Transactions Found</h3>
              <p>You haven't recorded any transactions yet, or no transactions match your current filters.</p>
              <button className="add-first-transaction-button" onClick={openCreateDrawer}>
                <AddRoundedIcon fontSize="small" />
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price per Unit</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.date)}</td>
                      <td className="symbol-cell">{tx.symbol}</td>
                      <td>
                        <span className={`transaction-type ${tx.type}`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{tx.quantity}</td>
                      <td>{formatCurrency(tx.pricePerUnit)}</td>
                      <td className={`amount-cell ${tx.type}`}>
                        {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.totalAmount)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            title="Edit transaction"
                            onClick={() => openEditDrawer(tx)}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </button>
                          <button
                            className="delete-button"
                            title="Delete transaction"
                            onClick={() => openDeleteModal(tx)}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageLayout>

      {/* Create / Edit Drawer */}
      <TransactionDrawer
        open={drawerOpen}
        mode={drawerMode}
        transaction={editingTransaction}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Transaction"
        description={
          deletingTransaction
            ? `Delete the ${deletingTransaction.type.toUpperCase()} of ${deletingTransaction.quantity} × ${deletingTransaction.symbol}? This cannot be undone.`
            : 'Are you sure you want to delete this transaction? This action cannot be undone.'
        }
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TransactionsPage;
