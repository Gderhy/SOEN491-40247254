/**
 * Accounts Page
 * Manage trading platforms and trading accounts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccountsService } from '../services';
import { useSnackbar } from '@components/ui';
import { PageLayout } from '@layouts/index';
import { LoadingState } from '@components/index';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { TradingPlatform, TradingAccount } from '../types/accounts';
import './AccountsPage.css';

/* ── Small create-platform form ─────────────────────────────── */
const PlatformForm: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const { showSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Platform name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await AccountsService.createPlatform({ name: name.trim() });
      setName('');
      showSnackbar({ severity: 'success', message: 'Platform created.' });
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create platform';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="e.g. Questrade"
        value={name}
        onChange={e => { setName(e.target.value); setError(null); }}
        className={error ? 'input--error' : ''}
      />
      <button type="submit" disabled={saving} className="btn btn--primary btn--sm">
        <AddRoundedIcon fontSize="small" />
        {saving ? 'Adding…' : 'Add'}
      </button>
      {error && <span className="inline-form__error">{error}</span>}
    </form>
  );
};

/* ── Small create-account form ──────────────────────────────── */
const AccountForm: React.FC<{ platforms: TradingPlatform[]; onCreated: () => void }> = ({ platforms, onCreated }) => {
  const { showSnackbar } = useSnackbar();
  const [platformId, setPlatformId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState('CAD');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformId) { setError('Select a platform'); return; }
    if (!accountName.trim()) { setError('Account name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await AccountsService.createAccount({
        platformId,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim() || undefined,
        currency,
      });
      setAccountName('');
      setAccountNumber('');
      showSnackbar({ severity: 'success', message: 'Account created.' });
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create account';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <div className="account-form__row">
        <div className="account-form__field">
          <label>Platform <span className="required">*</span></label>
          <select value={platformId} onChange={e => { setPlatformId(e.target.value); setError(null); }}
            className={error && !platformId ? 'input--error' : ''}>
            <option value="">— Select —</option>
            {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="account-form__field">
          <label>Account Name <span className="required">*</span></label>
          <input type="text" placeholder="e.g. TFSA"
            value={accountName}
            onChange={e => { setAccountName(e.target.value); setError(null); }}
            className={error && !accountName.trim() ? 'input--error' : ''}
          />
        </div>

        <div className="account-form__field">
          <label>Account # <span className="optional">(optional)</span></label>
          <input type="text" placeholder="e.g. 12345678"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="account-form__field account-form__field--sm">
          <label>Currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="account-form__field account-form__field--action">
          <label>&nbsp;</label>
          <button type="submit" disabled={saving} className="btn btn--primary btn--sm">
            <AddRoundedIcon fontSize="small" />
            {saving ? 'Adding…' : 'Add Account'}
          </button>
        </div>
      </div>
      {error && <p className="account-form__error">{error}</p>}
    </form>
  );
};

/* ── Main Page ──────────────────────────────────────────────── */
const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [platforms, setPlatforms] = useState<TradingPlatform[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pl, ac] = await Promise.all([
        AccountsService.getPlatforms(),
        AccountsService.getAccounts(),
      ]);
      setPlatforms(pl);
      setAccounts(ac);
    } catch (err: any) {
      if (err?.response?.status === 401) { navigate('/login'); return; }
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || !session) { navigate('/login'); return; }
    load();
  }, [user, session, navigate, load]);

  const handleDeletePlatform = async (id: string) => {
    setDeletingId(id);
    try {
      await AccountsService.deletePlatform(id);
      showSnackbar({ severity: 'success', message: 'Platform deleted.' });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      showSnackbar({ severity: 'error', message: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setDeletingId(id);
    try {
      await AccountsService.deleteAccount(id);
      showSnackbar({ severity: 'success', message: 'Account deleted.' });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      showSnackbar({ severity: 'error', message: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <PageLayout title="Accounts">
      <LoadingState message="Loading accounts…" />
    </PageLayout>
  );

  if (error) return (
    <PageLayout title="Accounts">
      <div className="error-container">
        <WarningAmberRoundedIcon className="error-icon" />
        <h3>Error Loading Accounts</h3>
        <p>{error}</p>
        <button onClick={load} className="btn btn--primary">Try Again</button>
      </div>
    </PageLayout>
  );

  /* Group accounts by platform for display */
  const accountsByPlatform = accounts.reduce<Record<string, TradingAccount[]>>((acc, a) => {
    if (!acc[a.platformId]) acc[a.platformId] = [];
    acc[a.platformId].push(a);
    return acc;
  }, {});

  return (
    <PageLayout
      title="Accounts"
      subtitle="Manage your brokerage platforms and trading accounts"
    >
      {/* ── Platforms section ─────────────────────── */}
      <section className="accounts-section">
        <div className="accounts-section__header">
          <h2 className="accounts-section__title">
            <AccountBalanceRoundedIcon fontSize="small" />
            Platforms
          </h2>
          <PlatformForm onCreated={load} />
        </div>

        {platforms.length === 0 ? (
          <p className="accounts-empty">No platforms yet. Add one above to get started.</p>
        ) : (
          <div className="platforms-list">
            {platforms.map(platform => (
              <div key={platform.id} className="platform-card">
                {/* Platform header */}
                <div className="platform-card__header">
                  <span className="platform-card__name">{platform.name}</span>
                  <button
                    className="icon-btn icon-btn--danger"
                    title="Delete platform"
                    disabled={deletingId === platform.id}
                    onClick={() => handleDeletePlatform(platform.id)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </button>
                </div>

                {/* Accounts under this platform */}
                <div className="platform-card__accounts">
                  {(accountsByPlatform[platform.id] ?? []).length === 0 ? (
                    <p className="platform-card__no-accounts">No accounts yet.</p>
                  ) : (
                    <table className="acct-table">
                      <thead>
                        <tr>
                          <th>Account Name</th>
                          <th>Account #</th>
                          <th>Currency</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(accountsByPlatform[platform.id] ?? []).map(acct => (
                          <tr key={acct.id}>
                            <td className="acct-name">{acct.accountName}</td>
                            <td className="acct-number">{acct.accountNumber ?? '—'}</td>
                            <td>{acct.currency}</td>
                            <td>
                              <button
                                className="icon-btn icon-btn--danger"
                                title="Delete account"
                                disabled={deletingId === acct.id}
                                onClick={() => handleDeleteAccount(acct.id)}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Create account section ─────────────────── */}
      <section className="accounts-section">
        <div className="accounts-section__header">
          <h2 className="accounts-section__title">Add New Account</h2>
        </div>
        {platforms.length === 0 ? (
          <p className="accounts-empty">Add a platform first before creating an account.</p>
        ) : (
          <AccountForm platforms={platforms} onCreated={load} />
        )}
      </section>
    </PageLayout>
  );
};

export default AccountsPage;
