import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/index';
import { PageLayout } from '@layouts/index';
import { ROUTES } from '@routes/routeConfig';
import './Dashboard.css';

/**
 * Dashboard page - protected route
 * Displays user information and app functionality
 */
export function Dashboard() {
  const { user } = useAuth();

  return (
    <PageLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.email}`}
    >
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>🎉 Authentication Successful!</h2>
          <p>You are now logged in to Asset Tracker.</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
        </div>

        <div className="dashboard-card">
          <h3>📊 Quick Navigation</h3>
          <div className="navigation-buttons">
            <Link to={ROUTES.ASSETS} className="nav-button primary">
              📈 View My Assets
            </Link>
            <Link to={ROUTES.TRANSACTIONS} className="nav-button primary">
              💰 Transaction History
            </Link>
            <Link to="/api-test" className="nav-button secondary">
              🔧 API Test
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Next Steps</h3>
          <ul>
            <li>✅ Add asset tracking functionality</li>
            <li>Create asset categories</li>
            <li>Set up user profiles</li>
            <li>Add data visualization</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}

// Default export for backward compatibility
export default Dashboard;