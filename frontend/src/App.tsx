import { useState, useEffect } from 'react';
import { config } from './config/env';
import { supabase } from './config/supabase';
import './App.css';

function App() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Test Supabase connection
    const testSupabase = async () => {
      try {
        const { error } = await supabase.from('_test').select('*').limit(1);
        setSupabaseStatus(error ? 'error' : 'connected');
      } catch (err) {
        setSupabaseStatus('error');
      }
    };

    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await fetch(`${config.api.baseUrl}/health`);
        setBackendStatus(response.ok ? 'connected' : 'error');
      } catch (err) {
        setBackendStatus('error');
      }
    };

    testSupabase();
    testBackend();
  }, []);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'checking': return '⏳';
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <>
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Asset Tracker Frontend Running</h1>
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginTop: '2rem',
          fontFamily: 'monospace'
        }}>
          <h3>System Status</h3>
          <p>
            Backend API: {getStatusEmoji(backendStatus)} {backendStatus}
            <br />
            <small>{config.api.baseUrl}/health</small>
          </p>
          <p>
            Supabase: {getStatusEmoji(supabaseStatus)} {supabaseStatus}
            <br />
            <small>{config.supabase.url}</small>
          </p>
          <p>
            Environment: {config.isDevelopment ? '🔧 Development' : '🚀 Production'}
          </p>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <p>
            ✅ Environment variables loaded successfully
            <br />
            ✅ Supabase client initialized
            <br />
            ✅ Backend API connection tested
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
