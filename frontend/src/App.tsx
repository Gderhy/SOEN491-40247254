import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@contexts/index';
import { AppRoutes } from '@routes/index';
import '@/App.css';
import '@styles/auth.css';

/**
 * Main App component with routing and authentication
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
