import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/index';
import { PageLayout } from '@layouts/index';
import { ROUTES } from '@routes/routeConfig';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
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
          <h2 className="dashboard-card__heading">
            <CheckCircleOutlineRoundedIcon className="dashboard-card__heading-icon success" />
            Authentication Successful!
          </h2>
          <p>You are now logged in to Asset Tracker.</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p>
            <strong>Email Verified:</strong>{' '}
            {user?.email_confirmed_at
              ? <VerifiedUserRoundedIcon className="inline-icon success" fontSize="small" />
              : 'No'}
          </p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card__heading">
            <BarChartRoundedIcon className="dashboard-card__heading-icon" />
            Quick Navigation
          </h3>
          <div className="navigation-buttons">
            <Link to={ROUTES.ASSETS} className="nav-button primary">
              <ShowChartRoundedIcon fontSize="small" />
              View My Assets
            </Link>
            <Link to={ROUTES.TRANSACTIONS} className="nav-button primary">
              <ReceiptLongRoundedIcon fontSize="small" />
              Transaction History
            </Link>
            <Link to="/api-test" className="nav-button secondary">
              <ApiRoundedIcon fontSize="small" />
              API Test
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card__heading">
            <BarChartRoundedIcon className="dashboard-card__heading-icon" />
            Next Steps
          </h3>
          <ul>
            <li><CheckCircleOutlineRoundedIcon className="inline-icon success" fontSize="small" /> Add asset tracking functionality</li>
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