import { useAuth } from '@contexts/index';

/**
 * Dashboard page - protected route
 * Displays user information and app functionality
 */
export function Dashboard() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Asset Tracker Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleSignOut} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>🎉 Authentication Successful!</h2>
          <p>You are now logged in to Asset Tracker.</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
        </div>

        <div className="dashboard-card">
          <h3>Next Steps</h3>
          <ul>
            <li>Add asset tracking functionality</li>
            <li>Create asset categories</li>
            <li>Set up user profiles</li>
            <li>Add data visualization</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// Default export for backward compatibility
export default Dashboard;
