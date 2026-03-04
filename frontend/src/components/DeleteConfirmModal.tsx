/**
 * DeleteConfirmModal
 * Thin wrapper around the generic <ConfirmModal> wired for deletion.
 * Kept as a named export so existing call-sites don't need to change.
 */

import React from 'react';
import { ConfirmModal } from './ui/ConfirmModal';

export interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  title = 'Delete',
  description,
  onClose,
  onConfirm,
}) => (
  <ConfirmModal
    open={open}
    intent="danger"
    title={title}
    description={description}
    confirmLabel="Delete"
    cancelLabel="Cancel"
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

export default DeleteConfirmModal;
