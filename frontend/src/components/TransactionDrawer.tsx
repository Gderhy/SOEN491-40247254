/**
 * TransactionDrawer
 * Feature-specific drawer for creating / editing transactions.
 * Delegates chrome (backdrop, header, scroll-lock) to the generic <Drawer>.
 */

import React, { useEffect, useState } from 'react';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Drawer } from './ui/Drawer';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transactions';
import type { TradingAccount } from '../types/accounts';
import '../styles/transaction-form.css';

export interface TransactionDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  transaction?: Transaction | null;
  accounts: TradingAccount[];
  onClose: () => void;
  onSave: (data: CreateTransactionRequest | UpdateTransactionRequest) => Promise<void>;
}

interface FormState {
  accountId: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: string;
  pricePerUnit: string;
  date: string;
  fees: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  accountId: '',
  symbol: '',
  name: '',
  type: 'buy',
  quantity: '',
  pricePerUnit: '',
  date: new Date().toISOString().split('T')[0],
  fees: '',
  notes: '',
};

function toFormState(t: Transaction): FormState {
  return {
    accountId: t.accountId ?? '',
    symbol: t.symbol,
    name: t.name ?? t.symbol,
    type: t.type as 'buy' | 'sell',
    quantity: String(t.quantity),
    pricePerUnit: String(t.pricePerUnit),
    date: new Date(t.date).toISOString().split('T')[0],
    fees: t.fees != null ? String(t.fees) : '',
    notes: t.notes ?? '',
  };
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  open,
  mode,
  transaction,
  accounts,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* Reset form whenever the drawer opens */
  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && transaction ? toFormState(transaction) : EMPTY_FORM);
      setErrors({});
      setSaveError(null);
    }
  }, [open, mode, transaction]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const computedTotal = () => {
    const q = parseFloat(form.quantity);
    const p = parseFloat(form.pricePerUnit);
    if (!isNaN(q) && !isNaN(p)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q * p);
    }
    return '—';
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (accounts.length > 0 && !form.accountId) e.accountId = 'Select a trading account';
    if (!form.symbol.trim()) e.symbol = 'Symbol is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      e.quantity = 'Enter a positive quantity';
    if (!form.pricePerUnit || isNaN(Number(form.pricePerUnit)) || Number(form.pricePerUnit) <= 0)
      e.pricePerUnit = 'Enter a positive price';
    if (!form.date) e.date = 'Date is required';
    if (form.fees && (isNaN(Number(form.fees)) || Number(form.fees) < 0))
      e.fees = 'Fees must be a non-negative number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: CreateTransactionRequest = {
        accountId: form.accountId || undefined,
        symbol: form.symbol.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        quantity: parseFloat(form.quantity),
        pricePerUnit: parseFloat(form.pricePerUnit),
        date: new Date(form.date),
        fees: form.fees ? parseFloat(form.fees) : undefined,
        notes: form.notes.trim() || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'create' ? 'Add Transaction' : 'Edit Transaction';

  const footer = (
    <>
      <button
        type="button"
        form="tx-form"
        className="tx-form__btn tx-form__btn--cancel"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="tx-form"
        className="tx-form__btn tx-form__btn--save"
        disabled={saving}
      >
        <SaveRoundedIcon fontSize="small" />
        {saving ? 'Saving…' : mode === 'create' ? 'Add Transaction' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <Drawer open={open} title={title} onClose={onClose} footer={footer}>
      <form id="tx-form" className="tx-form" onSubmit={handleSubmit} noValidate>

        {/* Account selector */}
        <div className="tx-form__field">
          <label htmlFor="tx-account">Trading Account <span className="required">*</span></label>
          {accounts.length === 0 ? (
            <p className="tx-form__no-accounts">
              No trading accounts found. <a href="/accounts">Create an account</a> first.
            </p>
          ) : (
            <select
              id="tx-account"
              value={form.accountId}
              onChange={set('accountId')}
              className={errors.accountId ? 'input--error' : ''}
            >
              <option value="">— Select account —</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.platformName} — {acc.accountName}
                  {acc.currency !== 'CAD' ? ` (${acc.currency})` : ''}
                </option>
              ))}
            </select>
          )}
          {errors.accountId && <span className="tx-form__error-msg">{errors.accountId}</span>}
        </div>

        {/* Symbol + Name */}
        <div className="tx-form__row--2col">
          <div className="tx-form__field">
            <label htmlFor="tx-symbol">Symbol <span className="required">*</span></label>
            <input
              id="tx-symbol"
              type="text"
              placeholder="e.g. AAPL"
              value={form.symbol}
              onChange={set('symbol')}
              className={errors.symbol ? 'input--error' : ''}
              autoComplete="off"
            />
            {errors.symbol && <span className="tx-form__error-msg">{errors.symbol}</span>}
          </div>

          <div className="tx-form__field">
            <label htmlFor="tx-name">Asset Name <span className="required">*</span></label>
            <input
              id="tx-name"
              type="text"
              placeholder="e.g. Apple Inc."
              value={form.name}
              onChange={set('name')}
              className={errors.name ? 'input--error' : ''}
              autoComplete="off"
            />
            {errors.name && <span className="tx-form__error-msg">{errors.name}</span>}
          </div>
        </div>

        {/* Type toggle */}
        <div className="tx-form__field">
          <label>Transaction Type <span className="required">*</span></label>
          <div className="tx-form__type-toggle">
            <button
              type="button"
              className={`tx-form__type-btn tx-form__type-btn--buy${form.type === 'buy' ? ' tx-form__type-btn--active' : ''}`}
              onClick={() => setForm(p => ({ ...p, type: 'buy' }))}
            >
              Buy
            </button>
            <button
              type="button"
              className={`tx-form__type-btn tx-form__type-btn--sell${form.type === 'sell' ? ' tx-form__type-btn--active' : ''}`}
              onClick={() => setForm(p => ({ ...p, type: 'sell' }))}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Quantity + Price */}
        <div className="tx-form__row--2col">
          <div className="tx-form__field">
            <label htmlFor="tx-quantity">Quantity <span className="required">*</span></label>
            <input
              id="tx-quantity"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={form.quantity}
              onChange={set('quantity')}
              className={errors.quantity ? 'input--error' : ''}
            />
            {errors.quantity && <span className="tx-form__error-msg">{errors.quantity}</span>}
          </div>

          <div className="tx-form__field">
            <label htmlFor="tx-price">Price per Unit <span className="required">*</span></label>
            <div className="tx-form__prefix-wrap">
              <span className="tx-form__prefix">$</span>
              <input
                id="tx-price"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={form.pricePerUnit}
                onChange={set('pricePerUnit')}
                className={errors.pricePerUnit ? 'input--error' : ''}
              />
            </div>
            {errors.pricePerUnit && <span className="tx-form__error-msg">{errors.pricePerUnit}</span>}
          </div>
        </div>

        {/* Estimated total */}
        <div className="tx-form__total">
          <span className="tx-form__total-label">Estimated Total</span>
          <span className={`tx-form__total-value tx-form__total-value--${form.type}`}>
            {computedTotal()}
          </span>
        </div>

        {/* Date */}
        <div className="tx-form__field">
          <label htmlFor="tx-date">Transaction Date <span className="required">*</span></label>
          <input
            id="tx-date"
            type="date"
            value={form.date}
            onChange={set('date')}
            className={errors.date ? 'input--error' : ''}
          />
          {errors.date && <span className="tx-form__error-msg">{errors.date}</span>}
        </div>

        {/* Fees */}
        <div className="tx-form__field">
          <label htmlFor="tx-fees">Fees <span className="optional">(optional)</span></label>
          <div className="tx-form__prefix-wrap">
            <span className="tx-form__prefix">$</span>
            <input
              id="tx-fees"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={form.fees}
              onChange={set('fees')}
              className={errors.fees ? 'input--error' : ''}
            />
          </div>
          {errors.fees && <span className="tx-form__error-msg">{errors.fees}</span>}
        </div>

        {/* Notes */}
        <div className="tx-form__field">
          <label htmlFor="tx-notes">Notes <span className="optional">(optional)</span></label>
          <textarea
            id="tx-notes"
            rows={3}
            placeholder="Add any notes about this transaction…"
            value={form.notes}
            onChange={set('notes')}
          />
        </div>

        {/* Form-level error */}
        {saveError && (
          <div className="tx-form__save-error" role="alert">{saveError}</div>
        )}
      </form>
    </Drawer>
  );
};

export default TransactionDrawer;
