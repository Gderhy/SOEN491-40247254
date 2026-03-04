/**
 * DeleteConfirmModal
 * Simple confirmation modal before permanently deleting a transaction.
 */

import React, { useEffect, useState } from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  title = 'Delete Transaction',
  description = 'Are you sure you want to delete this transaction? This action cannot be undone.',
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* Reset state when modal opens/closes */
  useEffect(() => {
    if (open) {
      setDeleting(false);
      setDeleteError(null);
    }
  }, [open]);

  /* Prevent background scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
      >
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon-wrap">
            <WarningAmberRoundedIcon className="confirm-modal__icon" />
          </div>
          <button className="confirm-modal__close" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        <h3 id="delete-modal-title" className="confirm-modal__title">{title}</h3>
        <p id="delete-modal-desc" className="confirm-modal__desc">{description}</p>

        {deleteError && (
          <div className="confirm-modal__error" role="alert">{deleteError}</div>
        )}

        <div className="confirm-modal__actions">
          <button
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="confirm-modal__btn confirm-modal__btn--delete"
            onClick={handleConfirm}
            disabled={deleting}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
