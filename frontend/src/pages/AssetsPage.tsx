/**
 * Assets Page Component
 * Displays user's assets in a table format with loading, error, and empty states
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { PageLayout } from '@layouts/index';
import type { Asset, ApiResponse } from '../types';
import './AssetsPage.css';

interface AssetsPageState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
}

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [state, setState] = useState<AssetsPageState>({
    assets: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !session) {
      navigate('/login');
      return;
    }

    const fetchAssets = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response: ApiResponse<Asset[]> = await apiService.getAssets();
        
        if (response.status === 'success' && response.data) {
          setState(prev => ({
            ...prev,
            assets: response.data || [],
            loading: false,
            error: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            assets: [],
            loading: false,
            error: response.message || 'Failed to fetch assets',
          }));
        }
      } catch (error: any) {
        console.error('Error fetching assets:', error);
        
        // Handle authentication errors
        if (error?.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          navigate('/login');
          return;
        }
        
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'An unexpected error occurred while fetching assets';
        
        setState(prev => ({
          ...prev,
          assets: [],
          loading: false,
          error: errorMessage,
        }));
      }
    };

    fetchAssets();
  }, [user, session, navigate]);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number, currency: string = 'CAD'): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  if (state.loading) {
    return (
      <PageLayout title="My Assets">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your assets...</p>
        </div>
      </PageLayout>
    );
  }

  if (state.error) {
    return (
      <PageLayout title="My Assets">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Assets</h3>
          <p>{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  if (state.assets.length === 0) {
    return (
      <PageLayout title="My Assets">
        <div className="empty-container">
          <div className="empty-icon">📊</div>
          <h3>No Assets Found</h3>
          <p>You haven't added any assets yet. Start building your portfolio!</p>
          <button className="add-asset-button">
            Add Your First Asset
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="My Assets"
      subtitle={`${state.assets.length} ${state.assets.length === 1 ? 'asset' : 'assets'}`}
    >

      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Value</th>
              <th>Currency</th>
              <th>Source</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {state.assets.map((asset) => (
              <tr key={asset.id} className="asset-row">
                <td className="asset-name">
                  <strong>{asset.name}</strong>
                </td>
                <td className="asset-type">
                  <span className={`type-badge type-${asset.type.toLowerCase()}`}>
                    {asset.type}
                  </span>
                </td>
                <td className="asset-symbol">
                  {asset.symbol || '—'}
                </td>
                <td className="asset-quantity">
                  {asset.quantity !== undefined ? 
                    new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 8,
                    }).format(asset.quantity) : '—'
                  }
                </td>
                <td className="asset-value">
                  {formatCurrency(asset.value, asset.currency)}
                </td>
                <td className="asset-currency">
                  {asset.currency}
                </td>
                <td className="asset-source">
                  <span className={`source-badge source-${asset.source.toLowerCase()}`}>
                    {asset.source}
                  </span>
                </td>
                <td className="asset-created">
                  {formatDate(asset.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default AssetsPage;
