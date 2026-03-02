import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/index';

/**
 * Home page component
 * Landing page with navigation based on auth status
 */
export function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🏠 Asset Tracker</h1>
        <p>Track and manage your assets with ease</p>
      </header>

      <main className="home-content">
        {user ? (
          // User is logged in
          <div className="home-card">
            <h2>Welcome back, {user.email}!</h2>
            <p>You're already signed in.</p>
            <div className="home-buttons">
              <Link to="/dashboard" className="cta-button">
                Go to Dashboard
              </Link>
              <Link to="/assets" className="cta-button">
                View My Assets
              </Link>
              <Link to="/api-test" className="cta-button secondary">
                Test API Connection
              </Link>
            </div>
          </div>
        ) : (
          // User is not logged in
          <div className="home-card">
            <h2>Get Started</h2>
            <p>Sign in to access your asset tracking dashboard.</p>
            <div className="home-buttons">
              <Link to="/login" className="cta-button">
                Sign In
              </Link>
              <Link to="/register" className="cta-button secondary">
                Create Account
              </Link>
              <Link to="/api-test" className="cta-button secondary">
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
            <h4>📊 Track Assets</h4>
            <p>Monitor your assets in real-time</p>
          </div>
          <div className="feature-item">
            <h4>🔐 Secure</h4>
            <p>Your data is protected with authentication</p>
          </div>
          <div className="feature-item">
            <h4>📱 Responsive</h4>
            <p>Access from any device</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Default export for backward compatibility
export default Home;
