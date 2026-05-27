import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './Button';
import taskService from '../services/taskService';
import type { CreateTaskPayload } from '../services/taskService';
import './NewTaskModal.css';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  initialDate?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onTaskCreated, initialDate }) => {
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(initialDate || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeadline(initialDate || '');
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'pending', // default state based on backend schema
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      };

      await taskService.createTask(payload);
      window.dispatchEvent(new CustomEvent('task-updated'));
      toast.success('Task created successfully!');
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('Medium');
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create task';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-2" style={{ color: 'red' }}>{error}</div>}
          <div className="form-group">
            <label>Task Name</label>
            <input
              type="text"
              placeholder="e.g., Finalize project proposal"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group flex-1">
              <label>Deadline</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-segments">
              <button
                type="button"
                className={`segment-btn ${priority === 'Low' ? 'active' : ''}`}
                onClick={() => setPriority('Low')}
              >
                Low
              </button>
              <button
                type="button"
                className={`segment-btn ${priority === 'Medium' ? 'active' : ''}`}
                onClick={() => setPriority('Medium')}
              >
                Medium
              </button>
              <button
                type="button"
                className={`segment-btn ${priority === 'High' ? 'active' : ''}`}
                onClick={() => setPriority('High')}
              >
                High
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Add any extra details..."
              className="form-input textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Task'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
