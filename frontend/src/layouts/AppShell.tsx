/**
 * AppShell
 *
 * Main authenticated layout: collapsible sidebar + fixed topbar + scrollable main area.
 *
 * Usage (inside AppRoutes for every protected route):
 *   <AppShell>
 *     <Dashboard />
 *   </AppShell>
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/index';
import { ROUTES } from '@routes/routeConfig';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import './AppShell.css';


/* ── Nav item definition ─────────────────────────────────────── */
interface NavItem {
  path: string;
  label: string;
  Icon: SvgIconComponent;
}

const NAV_ITEMS: NavItem[] = [
  { path: ROUTES.DASHBOARD,    label: 'Dashboard',    Icon: DashboardRoundedIcon },
  { path: ROUTES.HOLDINGS,     label: 'Holdings',     Icon: ShowChartRoundedIcon },
  { path: ROUTES.TRANSACTIONS, label: 'Transactions', Icon: ReceiptLongRoundedIcon },
  { path: ROUTES.ACCOUNTS,     label: 'Accounts',     Icon: AccountBalanceRoundedIcon },
];

/* ── Component ───────────────────────────────────────────────── */
interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  // User initials for the avatar badge
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      {/* ── Mobile overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="app-shell__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`app-shell__sidebar ${mobileOpen ? 'app-shell__sidebar--open' : ''}`}>
        {/* Logo area */}
        <div className="sidebar__brand">
          <ShowChartRoundedIcon className="sidebar__logo" />
          {!collapsed && <span className="sidebar__name">Asset Tracker</span>}
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.Icon className="sidebar__nav-icon" aria-hidden="true" />
                  {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: collapse toggle + user */}
        <div className="sidebar__footer">
          <button
            className="sidebar__collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRightRoundedIcon fontSize="small" />
              : <ChevronLeftRoundedIcon  fontSize="small" />
            }
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Right column (topbar + content) ──────────────────── */}
      <div className="app-shell__main">
        {/* Topbar */}
        <header className="app-shell__topbar">
          {/* Mobile hamburger */}
          <button
            className="topbar__hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open navigation"
          >
            <MenuRoundedIcon />
          </button>

          <div className="topbar__spacer" />

          {/* User menu */}
          <div className="topbar__user">
            <div className="topbar__avatar" aria-hidden="true">{initials}</div>
            <span className="topbar__email">{user?.email}</span>
            <button
              className="topbar__signout"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogoutRoundedIcon fontSize="small" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="app-shell__content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
