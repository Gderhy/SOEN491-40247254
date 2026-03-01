/**
 * API Test Component
 * Test component to verify backend API connectivity
 */

import { useState } from 'react';
import { apiService } from '@/services';
import { useAuth } from '@/contexts';

export function ApiTest() {
  const { user, session } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.checkHealth();
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check health');
    } finally {
      setLoading(false);
    }
  };

  const testGetUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCurrentUser();
      setUserData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Backend API Test</h2>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Auth Status:</h3>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Token: {session?.access_token ? 'Present' : 'None'}</p>
      </div>

      {/* Test Buttons */}
      <div className="space-x-4 mb-6">
        <button
          onClick={testHealth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Health (No Auth)
        </button>
        
        <button
          onClick={testGetUser}
          disabled={loading || !session}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Test Get User (Auth Required)
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-blue-500">Loading...</p>}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Health Data */}
      {healthData && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
          <h4 className="font-semibold">Health Check Result:</h4>
          <pre className="text-sm mt-2">{JSON.stringify(healthData, null, 2)}</pre>
        </div>
      )}

      {/* User Data */}
      {userData && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
          <h4 className="font-semibold">User Data Result:</h4>
          <pre className="text-sm mt-2">{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
