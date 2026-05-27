import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-body">
          <div className="delete-icon-container">
            <AlertTriangle className="delete-warning-icon" size={32} />
          </div>
          <h2 className="delete-modal-title">Delete Task</h2>
          <p className="delete-modal-desc">
            Are you sure you want to delete <strong>"{taskTitle}"</strong>? This action cannot be undone and will permanently remove this task.
          </p>
        </div>
        <div className="delete-modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete Task'}
          </Button>
        </div>
      </div>
    </div>
  );
};
