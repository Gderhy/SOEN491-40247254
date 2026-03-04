import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@contexts/index';
import { AppRoutes } from '@routes/index';
import { SnackbarProvider } from '@components/ui';
import '@/App.css';
import '@styles/auth.css';

/**
 * Main App component with routing and authentication
 */
function App() {
  return (
    <AuthProvider>
      <SnackbarProvider placement="bottom-center">
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
