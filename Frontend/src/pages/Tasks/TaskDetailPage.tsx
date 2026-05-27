import React, { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Edit2, FileText, History, Calendar, Copy, Link as LinkIcon, CircleAlert } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { EditTaskModal } from '../../components/EditTaskModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import taskService from '../../services/taskService';
import type { Task } from '../../services/taskService';
import './TaskDetailPage.css';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTask = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id);
      setTask(data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch task details';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    setIsDeleting(true);
    
    try {
      await taskService.deleteTask(task.id);
      window.dispatchEvent(new CustomEvent('task-updated'));
      toast.success('Task deleted successfully!');
      setIsDeleteModalOpen(false);
      navigate('/tasks');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete task';
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!task) return;
    try {
      const duplicated = await taskService.createTask({
        title: `${task.title} (Copy)`,
        description: task.description || undefined,
        status: task.status,
        deadline: task.deadline || undefined,
      });
      window.dispatchEvent(new CustomEvent('task-updated'));
      toast.success('Task duplicated successfully!');
      navigate(`/tasks/${duplicated.id}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to duplicate task';
      toast.error(errMsg);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Task link copied to clipboard!');
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatActivityDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="task-detail-page" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading task details...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-detail-page" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#EF4444', marginBottom: '16px' }}>
          {error || 'Task not found'}
        </div>
        <Link to="/tasks" className="breadcrumb-link" style={{ justifyContent: 'center' }}>
          Back to My Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      {/* Breadcrumbs */}
      <div className="task-breadcrumbs">
        <Link to="/tasks" className="breadcrumb-link">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          My Tasks
        </Link>
        <ChevronRight size={16} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{task.title}</span>
      </div>

      {/* Header Card */}
      <div className="task-header-card">
        <div className="task-header-content">
          <div className="task-header-info">
            <div className="task-badges">
              {task.status === 'pending' && (
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>To Do</span>
              )}
              {task.status === 'in_progress' && (
                <span className="badge badge-in-progress">In Progress</span>
              )}
              {task.status === 'done' && (
                <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>Done</span>
              )}
              <span className="badge badge-high-priority">
                <CircleAlert size={12} className="mr-1" />
                Medium Priority
              </span>
            </div>
            <h1 className="task-detail-title">{task.title}</h1>
          </div>
          <div className="task-header-actions">
            <Button variant="secondary" className="btn-delete" onClick={handleDeleteClick}>
              <Trash2 size={16} /> Delete Task
            </Button>
            <Button className="btn-edit" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} /> Edit Task
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="task-content-grid">
        {/* Left Column */}
        <div className="task-main-col">
          {/* Description Section */}
          <div className="task-card-box">
            <h2 className="card-box-title">
              <FileText size={20} className="card-box-icon" />
              Description
            </h2>
            <div className="card-box-content">
              {task.description ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{task.description}</p>
              ) : (
                <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No description provided for this task.</p>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="task-card-box">
            <h2 className="card-box-title">
              <History size={20} className="card-box-icon" />
              Activity
            </h2>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-marker blue-marker"></div>
                <div className="timeline-content">
                  <p>Task status is <strong>{task.status === 'in_progress' ? 'In Progress' : task.status === 'pending' ? 'To Do' : 'Done'}</strong></p>
                  <span className="timeline-date">Last updated {formatActivityDate(task.updatedAt)}</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker grey-marker"></div>
                <div className="timeline-content">
                  <p>You created this task</p>
                  <span className="timeline-date">{formatActivityDate(task.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="task-side-col">
          {/* Details Section */}
          <div className="task-card-box">
            <h2 className="card-box-title">Details</h2>
            <div className="details-section">
              <span className="details-label">DUE DATE</span>
              <div className="details-value">
                <Calendar size={18} className="details-icon" />
                {formatDeadline(task.deadline)}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="task-card-box bg-slate-50">
            <h2 className="card-box-title">Quick Actions</h2>
            <div className="quick-actions-list">
              <button className="quick-action-btn" onClick={handleDuplicate}>
                <Copy size={16} /> Duplicate Task
              </button>
              <button className="quick-action-btn" onClick={handleCopyLink}>
                <LinkIcon size={16} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        task={task}
        onUpdateSuccess={fetchTask}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={task.title}
        isLoading={isDeleting}
      />
    </div>
  );
};
