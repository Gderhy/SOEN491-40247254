/**
 * PageLayout
 *
 * Consistent inner-page wrapper used by every protected page inside AppShell.
 * Provides a page header (title + optional subtitle + optional actions)
 * and a scrollable content area.
 *
 * Usage:
 *   <PageLayout
 *     title="Assets"
 *     subtitle="All your tracked assets"
 *     actions={<button>Add Asset</button>}
 *   >
 *     <AssetTable />
 *   </PageLayout>
 */

import React from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  /** Page heading */
  title: string;
  /** Optional supporting text under the title */
  subtitle?: string;
  /** Optional element(s) placed in the top-right (e.g. action buttons) */
  actions?: React.ReactNode;
  /** Main page body */
  children: React.ReactNode;
  /** Remove the default top-padding (useful when the first child has its own spacing) */
  noPadding?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
}) => {
  return (
    <div className="page-layout">
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="page-layout__header">
        <div className="page-layout__heading">
          <h1 className="page-layout__title">{title}</h1>
          {subtitle && <p className="page-layout__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-layout__actions">{actions}</div>}
      </header>

      {/* ── Page body ────────────────────────────────────────── */}
      <div className={`page-layout__body ${noPadding ? 'page-layout__body--no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
