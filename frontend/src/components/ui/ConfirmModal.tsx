/**
 * ConfirmModal – generic reusable confirmation dialog
 *
 * Usage:
 *   <ConfirmModal
 *     open={open}
 *     intent="danger"
 *     title="Delete Asset"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"
 *     onClose={handleClose}
 *     onConfirm={handleDelete}
 *   />
 */

import React, { useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import '../../styles/modal.css';

export type ModalIntent = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalProps {
  open: boolean;
  /** Visual intent — controls icon & confirm-button colour (default: 'danger') */
  intent?: ModalIntent;
  title: string;
  description?: React.ReactNode;
  /** Label for the confirm button (default: 'Confirm') */
  confirmLabel?: string;
  /** Label for the cancel button (default: 'Cancel') */
  cancelLabel?: string;
  /** Called when the modal is dismissed */
  onClose: () => void;
  /**
   * Called when the user confirms. Throw to show an inline error.
   * The modal stays open until the promise resolves, then calls onClose.
   */
  onConfirm: () => Promise<void> | void;
}

const ICON_MAP: Record<ModalIntent, React.ReactNode> = {
  danger:  <DeleteOutlineRoundedIcon className="modal__icon modal__icon--danger" />,
  warning: <WarningAmberRoundedIcon  className="modal__icon modal__icon--warning" />,
  info:    <InfoOutlinedIcon         className="modal__icon modal__icon--info" />,
  success: <CheckCircleOutlineRoundedIcon className="modal__icon modal__icon--success" />,
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  intent = 'danger',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setBusy(false);
      setError(null);
    }
  }, [open]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const btnVariant = intent === 'success' || intent === 'info'
    ? 'modal__btn--primary'
    : 'modal__btn--danger';

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={description ? 'confirm-modal-desc' : undefined}
      >
        {/* Header */}
        <div className="modal__header">
          <div className={`modal__icon-wrap modal__icon-wrap--${intent}`}>
            {ICON_MAP[intent]}
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Content */}
        <h3 id="confirm-modal-title" className="modal__title">{title}</h3>
        {description && (
          <p id="confirm-modal-desc" className="modal__description">{description}</p>
        )}

        {error && (
          <div className="modal__error" role="alert">{error}</div>
        )}

        {/* Actions */}
        <div className="modal__actions">
          <button
            className="modal__btn modal__btn--cancel"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            className={`modal__btn ${btnVariant}`}
            onClick={handleConfirm}
            disabled={busy}
          >
            {ICON_MAP[intent]}
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
