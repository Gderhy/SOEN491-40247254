/**
 * AuthLayout
 *
 * Centered, gradient-background wrapper used by Login and Register pages.
 * Usage:
 *   <AuthLayout title="Sign In" subtitle="Welcome back">
 *     <LoginForm />
 *   </AuthLayout>
 */

import React from 'react';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import './AuthLayout.css';

interface AuthLayoutProps {
  /** Page / card title */
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Main form / content */
  children: React.ReactNode;
  /** Optional footer content (e.g. "Don't have an account? Register") */
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <div className="auth-layout">
      {/* Decorative blobs */}
      <div className="auth-layout__blob auth-layout__blob--top" aria-hidden="true" />
      <div className="auth-layout__blob auth-layout__blob--bottom" aria-hidden="true" />

      <div className="auth-layout__card">
        {/* Branding strip */}
        <div className="auth-layout__brand">
          <ShowChartRoundedIcon className="auth-layout__logo" aria-hidden="true" />
          <span className="auth-layout__app-name">Asset Tracker</span>
        </div>

        {/* Header */}
        <header className="auth-layout__header">
          <h1 className="auth-layout__title">{title}</h1>
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
        </header>

        {/* Content */}
        <div className="auth-layout__body">{children}</div>

        {/* Footer */}
        {footer && <footer className="auth-layout__footer">{footer}</footer>}
      </div>
    </div>
  );
};

export default AuthLayout;
