import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/index';
import { LoadingState } from '@components/index';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';

/**
 * Home page component
 * Landing page with navigation based on auth status
 */
export function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <ShowChartRoundedIcon className="home-header__icon" />
        <h1>Asset Tracker</h1>
        <p>Track and manage your assets with ease</p>
      </header>

      <main className="home-content">
        {user ? (
          <div className="home-card">
            <h2>Welcome back, {user.email}!</h2>
            <p>You're already signed in.</p>
            <div className="home-buttons">
              <Link to="/dashboard" className="cta-button">
                <DashboardRoundedIcon fontSize="small" />
                Go to Dashboard
              </Link>
              <Link to="/assets" className="cta-button">
                <ShowChartRoundedIcon fontSize="small" />
                View My Assets
              </Link>
              <Link to="/api-test" className="cta-button secondary">
                <ApiRoundedIcon fontSize="small" />
                Test API Connection
              </Link>
            </div>
          </div>
        ) : (
          <div className="home-card">
            <h2>Get Started</h2>
            <p>Sign in to access your asset tracking dashboard.</p>
            <div className="home-buttons">
              <Link to="/login" className="cta-button">
                <LoginRoundedIcon fontSize="small" />
                Sign In
              </Link>
              <Link to="/register" className="cta-button secondary">
                <PersonAddRoundedIcon fontSize="small" />
                Create Account
              </Link>
              <Link to="/api-test" className="cta-button secondary">
                <ApiRoundedIcon fontSize="small" />
                Test API
              </Link>
            </div>
          </div>
        )}
      </main>

      <section className="features">
        <h3>Features</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <BarChartRoundedIcon className="feature-icon" />
            <h4>Track Assets</h4>
            <p>Monitor your assets in real-time</p>
          </div>
          <div className="feature-item">
            <LockRoundedIcon className="feature-icon" />
            <h4>Secure</h4>
            <p>Your data is protected with authentication</p>
          </div>
          <div className="feature-item">
            <DevicesRoundedIcon className="feature-icon" />
            <h4>Responsive</h4>
            <p>Access from any device</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Default export for backward compatibility
export default Home;
