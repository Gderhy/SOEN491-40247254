/**
 * AccountsPage
 * Full CRUD for Trading Platforms and Trading Accounts.
 *
 * Layout:
 *  - Platforms section: card list + inline "Add platform" form + delete with ConfirmModal
 *  - Accounts section: card list + "Add account" drawer + delete with ConfirmModal
 *
 * Delete uses <ConfirmModal intent="danger"> with a warning that linked
 * transactions will also be permanently deleted.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccountsService } from '../services';
import { useSnackbar } from '@components/ui';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { Drawer } from '@components/ui/Drawer';
import { PageLayout } from '@layouts/index';
import { LoadingState } from '@components/index';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { TradingPlatform, TradingAccount, CreateTradingAccountRequest } from '../types/accounts';
import './AccountsPage.css';

/* ─── Account form state ──────────────────────────────────────── */
interface AccountFormState {
  platformId: string;
  accountName: string;
  accountNumber: string;
  currency: string;
}

const EMPTY_ACCOUNT_FORM: AccountFormState = {
  platformId: '',
  accountName: '',
  accountNumber: '',
  currency: 'CAD',
};

const CURRENCY_OPTIONS = ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CHF'];

/* ── Main Page ──────────────────────────────────────────────── */
const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { showSnackbar } = useSnackbar();

  /* ── Data ──────────────────────────────────────────────────── */
  const [platforms, setPlatforms] = useState<TradingPlatform[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Platform inline form ──────────────────────────────────── */
  const [newPlatformName, setNewPlatformName] = useState('');
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [platformFormVisible, setPlatformFormVisible] = useState(false);
  const [platformNameError, setPlatformNameError] = useState<string | null>(null);

  /* ── Platform delete modal ─────────────────────────────────── */
  const [deletePlatformModalOpen, setDeletePlatformModalOpen] = useState(false);
  const [deletingPlatform, setDeletingPlatform] = useState<TradingPlatform | null>(null);

  /* ── Account drawer ────────────────────────────────────────── */
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<AccountFormState>(EMPTY_ACCOUNT_FORM);
  const [accountFormErrors, setAccountFormErrors] = useState<Partial<AccountFormState>>({});
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);

  /* ── Account delete modal ──────────────────────────────────── */
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<TradingAccount | null>(null);

  /* ── Load data ─────────────────────────────────────────────── */
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

  /* ── Platform handlers ─────────────────────────────────────── */
  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlatformName.trim();
    if (!name) { setPlatformNameError('Platform name is required'); return; }
    setAddingPlatform(true);
    setPlatformNameError(null);
    try {
      const created = await AccountsService.createPlatform({ name });
      setPlatforms(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPlatformName('');
      setPlatformFormVisible(false);
      showSnackbar({ severity: 'success', message: `Platform "${created.name}" added.` });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to add platform';
      setPlatformNameError(msg);
    } finally {
      setAddingPlatform(false);
    }
  };

  const openDeletePlatform = (platform: TradingPlatform) => {
    setDeletingPlatform(platform);
    setDeletePlatformModalOpen(true);
  };

  const confirmDeletePlatform = async () => {
    if (!deletingPlatform) return;
    await AccountsService.deletePlatform(deletingPlatform.id);
    setPlatforms(prev => prev.filter(p => p.id !== deletingPlatform.id));
    setAccounts(prev => prev.filter(a => a.platformId !== deletingPlatform.id));
    showSnackbar({ severity: 'success', message: `Platform "${deletingPlatform.name}" deleted.` });
    setDeletePlatformModalOpen(false);
    setDeletingPlatform(null);
  };

  /* ── Account form helpers ──────────────────────────────────── */
  const setAccountField = (field: keyof AccountFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAccountForm(prev => ({ ...prev, [field]: e.target.value }));
      setAccountFormErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const validateAccountForm = (): boolean => {
    const errs: Partial<AccountFormState> = {};
    if (!accountForm.platformId) errs.platformId = 'Select a platform';
    if (!accountForm.accountName.trim()) errs.accountName = 'Account name is required';
    if (!accountForm.currency) errs.currency = 'Select a currency';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddAccount = () => {
    setAccountForm({
      ...EMPTY_ACCOUNT_FORM,
      platformId: platforms.length === 1 ? platforms[0].id : '',
    });
    setAccountFormErrors({});
    setAccountSaveError(null);
    setAccountDrawerOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountForm()) return;
    setSavingAccount(true);
    setAccountSaveError(null);
    try {
      const payload: CreateTradingAccountRequest = {
        platformId: accountForm.platformId,
        accountName: accountForm.accountName.trim(),
        accountNumber: accountForm.accountNumber.trim() || undefined,
        currency: accountForm.currency,
      };
      const created = await AccountsService.createAccount(payload);
      setAccounts(prev => [...prev, created]);
      showSnackbar({ severity: 'success', message: `Account "${created.accountName}" added.` });
      setAccountDrawerOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to add account';
      setAccountSaveError(msg);
    } finally {
      setSavingAccount(false);
    }
  };

  /* ── Account delete handlers ───────────────────────────────── */
  const openDeleteAccount = (account: TradingAccount) => {
    setDeletingAccount(account);
    setDeleteAccountModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletingAccount) return;
    await AccountsService.deleteAccount(deletingAccount.id);
    setAccounts(prev => prev.filter(a => a.id !== deletingAccount.id));
    showSnackbar({ severity: 'success', message: `Account "${deletingAccount.accountName}" deleted.` });
    setDeleteAccountModalOpen(false);
    setDeletingAccount(null);
  };

  /* ── Derived ───────────────────────────────────────────────── */
  const accountsByPlatform = (platformId: string) =>
    accounts.filter(a => a.platformId === platformId);

  /* ── Early returns ─────────────────────────────────────────── */
  if (loading) {
    return (
      <PageLayout title="Accounts">
        <LoadingState message="Loading accounts…" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Accounts">
        <div className="acct-error">
          <WarningAmberRoundedIcon className="acct-error__icon" />
          <h3>Error Loading Accounts</h3>
          <p>{error}</p>
          <button className="acct-btn acct-btn--primary" onClick={load}>Try Again</button>
        </div>
      </PageLayout>
    );
  }

  /* ── Account drawer footer ─────────────────────────────────── */
  const accountDrawerFooter = (
    <>
      <button
        type="button"
        className="acct-btn acct-btn--cancel"
        onClick={() => setAccountDrawerOpen(false)}
        disabled={savingAccount}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="account-form"
        className="acct-btn acct-btn--primary"
        disabled={savingAccount}
      >
        <SaveRoundedIcon fontSize="small" />
        {savingAccount ? 'Saving…' : 'Add Account'}
      </button>
    </>
  );

  return (
    <PageLayout
      title="Accounts"
      subtitle="Manage your brokerage platforms and trading accounts"
    >
      <div className="acct-page">

        {/* ── Platforms Section ───────────────────────────────── */}
        <section className="acct-section">
          <div className="acct-section__header">
            <div className="acct-section__title-group">
              <StorefrontRoundedIcon className="acct-section__icon" />
              <h2 className="acct-section__title">Trading Platforms</h2>
              <span className="acct-section__count">{platforms.length}</span>
            </div>
            {!platformFormVisible && (
              <button
                className="acct-btn acct-btn--primary acct-btn--sm"
                onClick={() => { setPlatformFormVisible(true); setPlatformNameError(null); }}
              >
                <AddRoundedIcon fontSize="small" />
                Add Platform
              </button>
            )}
          </div>

          {/* Inline add-platform form */}
          {platformFormVisible && (
            <form className="acct-inline-form" onSubmit={handleAddPlatform} noValidate>
              <div className="acct-inline-form__field">
                <input
                  type="text"
                  placeholder="e.g. Questrade, Wealthsimple, TD…"
                  value={newPlatformName}
                  onChange={e => { setNewPlatformName(e.target.value); setPlatformNameError(null); }}
                  className={platformNameError ? 'input--error' : ''}
                  autoFocus
                  disabled={addingPlatform}
                />
                {platformNameError && (
                  <span className="acct-field-error">{platformNameError}</span>
                )}
              </div>
              <div className="acct-inline-form__actions">
                <button
                  type="button"
                  className="acct-btn acct-btn--cancel acct-btn--sm"
                  disabled={addingPlatform}
                  onClick={() => { setPlatformFormVisible(false); setNewPlatformName(''); setPlatformNameError(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="acct-btn acct-btn--primary acct-btn--sm"
                  disabled={addingPlatform}
                >
                  {addingPlatform ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {/* Platform list */}
          {platforms.length === 0 ? (
            <div className="acct-empty">
              <InboxRoundedIcon className="acct-empty__icon" />
              <p>No platforms yet. Add your first trading platform above.</p>
            </div>
          ) : (
            <ul className="acct-platform-list">
              {platforms.map(platform => (
                <li key={platform.id} className="acct-platform-item">
                  <div className="acct-platform-item__info">
                    <StorefrontRoundedIcon className="acct-platform-item__icon" />
                    <span className="acct-platform-item__name">{platform.name}</span>
                    <span className="acct-platform-item__count">
                      {accountsByPlatform(platform.id).length}{' '}
                      account{accountsByPlatform(platform.id).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    className="acct-icon-btn acct-icon-btn--danger"
                    title={`Delete ${platform.name}`}
                    onClick={() => openDeletePlatform(platform)}
                    aria-label={`Delete platform ${platform.name}`}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Accounts Section ────────────────────────────────── */}
        <section className="acct-section">
          <div className="acct-section__header">
            <div className="acct-section__title-group">
              <AccountBalanceRoundedIcon className="acct-section__icon" />
              <h2 className="acct-section__title">Brokerage Accounts</h2>
              <span className="acct-section__count">{accounts.length}</span>
            </div>
            <button
              className="acct-btn acct-btn--primary acct-btn--sm"
              onClick={openAddAccount}
              disabled={platforms.length === 0}
              title={platforms.length === 0 ? 'Add a platform first' : 'Add new account'}
            >
              <AddRoundedIcon fontSize="small" />
              Add Account
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="acct-empty">
              <InboxRoundedIcon className="acct-empty__icon" />
              <p>
                {platforms.length === 0
                  ? 'Add a trading platform first, then create accounts under it.'
                  : 'No accounts yet. Add your first brokerage account above.'}
              </p>
            </div>
          ) : (
            <div className="acct-table-wrap">
              <table className="acct-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Account Name</th>
                    <th>Account #</th>
                    <th>Currency</th>
                    <th className="acct-table__actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.id}>
                      <td>
                        <span className="acct-platform-badge">{account.platformName}</span>
                      </td>
                      <td className="acct-table__name">{account.accountName}</td>
                      <td className="acct-table__number">
                        {account.accountNumber ?? <span className="acct-table__none">—</span>}
                      </td>
                      <td>
                        <span className="acct-currency-badge">{account.currency}</span>
                      </td>
                      <td className="acct-table__actions-col">
                        <button
                          className="acct-icon-btn acct-icon-btn--danger"
                          title={`Delete ${account.accountName}`}
                          onClick={() => openDeleteAccount(account)}
                          aria-label={`Delete account ${account.accountName}`}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── Add Account Drawer ──────────────────────────────────── */}
      <Drawer
        open={accountDrawerOpen}
        title="Add Brokerage Account"
        subtitle="Link a new account to one of your trading platforms."
        onClose={() => setAccountDrawerOpen(false)}
        footer={accountDrawerFooter}
      >
        <form id="account-form" className="acct-form" onSubmit={handleSaveAccount} noValidate>

          <div className="acct-form__field">
            <label htmlFor="acc-platform">Platform <span className="required">*</span></label>
            <select
              id="acc-platform"
              value={accountForm.platformId}
              onChange={setAccountField('platformId')}
              className={accountFormErrors.platformId ? 'input--error' : ''}
            >
              <option value="">— Select platform —</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {accountFormErrors.platformId && (
              <span className="acct-form__error">{accountFormErrors.platformId}</span>
            )}
          </div>

          <div className="acct-form__field">
            <label htmlFor="acc-name">Account Name <span className="required">*</span></label>
            <input
              id="acc-name"
              type="text"
              placeholder="e.g. TFSA, RRSP, Margin…"
              value={accountForm.accountName}
              onChange={setAccountField('accountName')}
              className={accountFormErrors.accountName ? 'input--error' : ''}
              autoComplete="off"
            />
            {accountFormErrors.accountName && (
              <span className="acct-form__error">{accountFormErrors.accountName}</span>
            )}
          </div>

          <div className="acct-form__field">
            <label htmlFor="acc-number">
              Account Number <span className="optional">(optional)</span>
            </label>
            <input
              id="acc-number"
              type="text"
              placeholder="e.g. 12345678"
              value={accountForm.accountNumber}
              onChange={setAccountField('accountNumber')}
              autoComplete="off"
            />
          </div>

          <div className="acct-form__field">
            <label htmlFor="acc-currency">Currency <span className="required">*</span></label>
            <select
              id="acc-currency"
              value={accountForm.currency}
              onChange={setAccountField('currency')}
              className={accountFormErrors.currency ? 'input--error' : ''}
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {accountFormErrors.currency && (
              <span className="acct-form__error">{accountFormErrors.currency}</span>
            )}
          </div>

          {accountSaveError && (
            <div className="acct-form__save-error" role="alert">{accountSaveError}</div>
          )}
        </form>
      </Drawer>

      {/* ── Delete Platform Modal ───────────────────────────────── */}
      <ConfirmModal
        open={deletePlatformModalOpen}
        intent="danger"
        title="Delete Platform"
        description={
          deletingPlatform ? (
            <>
              <p>
                Are you sure you want to delete the platform{' '}
                <strong>"{deletingPlatform.name}"</strong>?
              </p>
              {accountsByPlatform(deletingPlatform.id).length > 0 && (
                <p className="acct-modal-warning">
                  ⚠️ This will also delete all{' '}
                  <strong>{accountsByPlatform(deletingPlatform.id).length}</strong>{' '}
                  account{accountsByPlatform(deletingPlatform.id).length !== 1 ? 's' : ''} under
                  this platform, along with all transactions linked to those accounts.
                </p>
              )}
            </>
          ) : undefined
        }
        confirmLabel="Delete Platform"
        cancelLabel="Cancel"
        onClose={() => { setDeletePlatformModalOpen(false); setDeletingPlatform(null); }}
        onConfirm={confirmDeletePlatform}
      />

      {/* ── Delete Account Modal ────────────────────────────────── */}
      <ConfirmModal
        open={deleteAccountModalOpen}
        intent="danger"
        title="Delete Account"
        description={
          deletingAccount ? (
            <>
              <p>
                Are you sure you want to delete the account{' '}
                <strong>"{deletingAccount.accountName}"</strong>
                {deletingAccount.platformName ? ` (${deletingAccount.platformName})` : ''}?
              </p>
              <p className="acct-modal-warning">
                ⚠️ All transactions linked to this account will also be permanently deleted.
                This action cannot be undone.
              </p>
            </>
          ) : undefined
        }
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        onClose={() => { setDeleteAccountModalOpen(false); setDeletingAccount(null); }}
        onConfirm={confirmDeleteAccount}
      />
    </PageLayout>
  );
};

export default AccountsPage;
