/**
 * TransactionsPage Component
 * Displays user transactions with filtering and portfolio overview
 */

import React, { useState, useEffect } from 'react';
import { TransactionsService } from '../services';
import type { Transaction, PortfolioSummary, TransactionFilters } from '../types';
import '../styles/transactions.css';

interface TransactionsPageProps {}

export const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transactionsData, portfolioData] = await Promise.all([
        TransactionsService.getTransactions(filters),
        TransactionsService.getPortfolioSummary()
      ]);
      
      setTransactions(transactionsData);
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterKey: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-page">
        <div className="error-state">
          <h2>Error Loading Transactions</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transaction History</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="filter-toggle-button"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="add-transaction-button">
            Add Transaction
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="portfolio-summary">
          <h2>Portfolio Overview</h2>
          <div className="summary-stats">
            <div className="stat-card">
              <span className="stat-label">Total Invested</span>
              <span className="stat-value">{formatCurrency(portfolio.totalInvested)}</span>
            </div>
            {portfolio.currentValue && (
              <>
                <div className="stat-card">
                  <span className="stat-label">Current Value</span>
                  <span className="stat-value">{formatCurrency(portfolio.currentValue)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Unrealized P&L</span>
                  <span className={`stat-value ${(portfolio.totalUnrealizedPnL || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(portfolio.totalUnrealizedPnL || 0)}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Return %</span>
                  <span className={`stat-value ${(portfolio.totalUnrealizedPnLPercent || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {((portfolio.totalUnrealizedPnLPercent || 0) * 100).toFixed(2)}%
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
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
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
                onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
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
            <h3>No Transactions Found</h3>
            <p>You haven't recorded any transactions yet, or no transactions match your current filters.</p>
            <button className="add-first-transaction-button">
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
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td className="symbol-cell">{transaction.symbol}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>{formatCurrency(transaction.pricePerUnit)}</td>
                    <td className={`amount-cell ${transaction.type}`}>
                      {transaction.type === 'buy' ? '-' : '+'}{formatCurrency(transaction.totalAmount)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-button" title="Edit">✏️</button>
                        <button className="delete-button" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
