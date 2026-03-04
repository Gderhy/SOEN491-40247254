/**
 * Pages barrel file
 * Re-exports all page components for easier importing
 */

export * from './Home';
export * from './Login';
export * from './Register';
export * from './Dashboard';

// Export HoldingsPage as both named and default export for flexibility
export { default as HoldingsPage } from './HoldingsPage';

// Export TransactionsPage
export { default as TransactionsPage } from './TransactionsPage';
