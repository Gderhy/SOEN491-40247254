/**
 * TransactionDrawer
 * Slide-in drawer for creating and editing transactions.
 */

import React, { useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transactions';

interface TransactionDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  transaction?: Transaction | null;
  onClose: () => void;
  onSave: (data: CreateTransactionRequest | UpdateTransactionRequest) => Promise<void>;
}

interface FormState {
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
    symbol: t.symbol,
    name: (t as any).name ?? t.symbol,
    type: t.type as 'buy' | 'sell',
    quantity: String(t.quantity),
    pricePerUnit: String(t.pricePerUnit),
    date: new Date(t.date).toISOString().split('T')[0],
    fees: (t as any).fees != null ? String((t as any).fees) : '',
    notes: t.notes ?? '',
  };
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  open,
  mode,
  transaction,
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

  /* Prevent background scroll while drawer is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      newErrors.quantity = 'Enter a positive quantity';
    if (!form.pricePerUnit || isNaN(Number(form.pricePerUnit)) || Number(form.pricePerUnit) <= 0)
      newErrors.pricePerUnit = 'Enter a positive price';
    if (!form.date) newErrors.date = 'Date is required';
    if (form.fees && (isNaN(Number(form.fees)) || Number(form.fees) < 0))
      newErrors.fees = 'Fees must be a non-negative number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: CreateTransactionRequest = {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? 'drawer-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`transaction-drawer ${open ? 'transaction-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
      >
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
          </h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Form */}
        <form className="drawer-form" onSubmit={handleSubmit} noValidate>
          <div className="drawer-body">

            {/* Symbol + Name row */}
            <div className="drawer-row drawer-row--2col">
              <div className="drawer-field">
                <label htmlFor="tx-symbol">Symbol <span className="required">*</span></label>
                <input
                  id="tx-symbol"
                  type="text"
                  placeholder="e.g. AAPL"
                  value={form.symbol}
                  onChange={set('symbol')}
                  className={errors.symbol ? 'field-error' : ''}
                  autoComplete="off"
                />
                {errors.symbol && <span className="field-error-msg">{errors.symbol}</span>}
              </div>

              <div className="drawer-field">
                <label htmlFor="tx-name">Asset Name <span className="required">*</span></label>
                <input
                  id="tx-name"
                  type="text"
                  placeholder="e.g. Apple Inc."
                  value={form.name}
                  onChange={set('name')}
                  className={errors.name ? 'field-error' : ''}
                  autoComplete="off"
                />
                {errors.name && <span className="field-error-msg">{errors.name}</span>}
              </div>
            </div>

            {/* Type */}
            <div className="drawer-field">
              <label htmlFor="tx-type">Transaction Type <span className="required">*</span></label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn type-btn--buy ${form.type === 'buy' ? 'type-btn--active' : ''}`}
                  onClick={() => setForm(p => ({ ...p, type: 'buy' }))}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`type-btn type-btn--sell ${form.type === 'sell' ? 'type-btn--active' : ''}`}
                  onClick={() => setForm(p => ({ ...p, type: 'sell' }))}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Quantity + Price per unit row */}
            <div className="drawer-row drawer-row--2col">
              <div className="drawer-field">
                <label htmlFor="tx-quantity">Quantity <span className="required">*</span></label>
                <input
                  id="tx-quantity"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.quantity}
                  onChange={set('quantity')}
                  className={errors.quantity ? 'field-error' : ''}
                />
                {errors.quantity && <span className="field-error-msg">{errors.quantity}</span>}
              </div>

              <div className="drawer-field">
                <label htmlFor="tx-price">Price per Unit <span className="required">*</span></label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="tx-price"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={form.pricePerUnit}
                    onChange={set('pricePerUnit')}
                    className={errors.pricePerUnit ? 'field-error' : ''}
                  />
                </div>
                {errors.pricePerUnit && <span className="field-error-msg">{errors.pricePerUnit}</span>}
              </div>
            </div>

            {/* Computed total */}
            <div className="drawer-total">
              <span className="drawer-total__label">Estimated Total</span>
              <span className={`drawer-total__value ${form.type}`}>{computedTotal()}</span>
            </div>

            {/* Date */}
            <div className="drawer-field">
              <label htmlFor="tx-date">Transaction Date <span className="required">*</span></label>
              <input
                id="tx-date"
                type="date"
                value={form.date}
                onChange={set('date')}
                className={errors.date ? 'field-error' : ''}
              />
              {errors.date && <span className="field-error-msg">{errors.date}</span>}
            </div>

            {/* Fees */}
            <div className="drawer-field">
              <label htmlFor="tx-fees">Fees <span className="optional">(optional)</span></label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">$</span>
                <input
                  id="tx-fees"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={form.fees}
                  onChange={set('fees')}
                  className={errors.fees ? 'field-error' : ''}
                />
              </div>
              {errors.fees && <span className="field-error-msg">{errors.fees}</span>}
            </div>

            {/* Notes */}
            <div className="drawer-field">
              <label htmlFor="tx-notes">Notes <span className="optional">(optional)</span></label>
              <textarea
                id="tx-notes"
                rows={3}
                placeholder="Add any notes about this transaction…"
                value={form.notes}
                onChange={set('notes')}
              />
            </div>

            {/* Save error */}
            {saveError && (
              <div className="drawer-save-error" role="alert">
                {saveError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="drawer-footer">
            <button type="button" className="drawer-btn drawer-btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="drawer-btn drawer-btn--save" disabled={saving}>
              <SaveRoundedIcon fontSize="small" />
              {saving ? 'Saving…' : mode === 'create' ? 'Add Transaction' : 'Save Changes'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default TransactionDrawer;
