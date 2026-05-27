import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './Button';
import taskService from '../services/taskService';
import type { Task } from '../services/taskService';
import './NewTaskModal.css'; // Reusing the same modal styles

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateSuccess: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onUpdateSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'done'>('pending');
  const [priority, setPriority] = useState('Medium'); // Kept static as backend does not store priority
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      if (task.deadline) {
        // Convert to YYYY-MM-DD
        setDueDate(new Date(task.deadline).toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
      setError(null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Task Title is required');
      return;
    }

    setIsLoading(true);
    try {
      await taskService.updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status: status,
        deadline: dueDate ? new Date(dueDate).toISOString() : null,
      });
      window.dispatchEvent(new CustomEvent('task-updated'));
      toast.success('Task updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
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
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-2" style={{ color: 'red' }}>{error}</div>}
          
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input" 
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-input textarea"
              rows={4}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Status</label>
              <div className="select-wrapper">
                <select 
                  className="form-input custom-select" 
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  disabled={isLoading}
                >
                  <option value="pending">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
            <div className="form-group flex-1">
              <label>Priority</label>
              <div className="select-wrapper">
                <select 
                  className="form-input custom-select" 
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <div className="input-with-icon">
              <input 
                type="date" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="form-input" 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
