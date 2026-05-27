import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, CheckCircle2, AlertTriangle, Circle, CheckCircle, CalendarClock, Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { NewTaskModal } from '../../components/NewTaskModal';
import taskService from '../../services/taskService';
import type { Task } from '../../services/taskService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch enough tasks to compute stats and show recents
      const response = await taskService.getTasks(1, 100);
      setTasks(response.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    const handleSync = () => {
      fetchTasks();
    };
    window.addEventListener('task-updated', handleSync);
    return () => {
      window.removeEventListener('task-updated', handleSync);
    };
  }, []);

  // ── Computed Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (!t.deadline || t.status === 'done') return false;
      return new Date(t.deadline) < now;
    }).length;
    const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, overdue, donePercent };
  }, [tasks]);

  // ── Recent Tasks (latest 5 by createdAt) ──────────────────────────────────
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  // ── Upcoming (with deadline, not done, sorted soonest first) ──────────────
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(t => t.deadline && t.status !== 'done')
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 5)
      .map(t => {
        const deadline = new Date(t.deadline!);
        const isOverdue = deadline < now;
        return { ...t, deadline, isOverdue };
      });
  }, [tasks]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No Deadline';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRelativeDeadline = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays}d`;
  };

  const getStatusText = (status: string) => status.replace('_', ' ').toUpperCase();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="dashboard-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="page-header">
        <p className="date-text">{todayLabel}</p>
        <h1 className="greeting">{greeting()}, {firstName}.</h1>
        <p className="subtitle">
          {isLoading
            ? 'Loading your tasks…'
            : stats.overdue > 0
              ? `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} and ${stats.inProgress} in progress.`
              : stats.inProgress > 0
                ? `You have ${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress. Keep going!`
                : `All caught up! You have ${stats.total} task${stats.total !== 1 ? 's' : ''} total.`
          }
        </p>
      </header>

      {/* ── Metric Cards ───────────────────────────────────────────────────── */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completion Rate</span>
            <div className="metric-icon-bg bg-blue-100">
              <Target size={16} className="text-blue-500" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{isLoading ? '—' : `${stats.donePercent}%`}</span>
            <span className="metric-target">{stats.done} of {stats.total} done</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-bg bg-blue-100">
              <Zap size={16} className="text-blue-500" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{isLoading ? '—' : stats.inProgress}</span>
            <span className="metric-target">active task{stats.inProgress !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-bg bg-blue-100">
              <CheckCircle2 size={16} className="text-blue-500" />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{isLoading ? '—' : stats.done}</span>
            <span className="metric-target">total done</span>
          </div>
        </div>

        <div className={`metric-card ${stats.overdue > 0 ? 'alert-card' : ''}`}>
          <div className="metric-header">
            <span className={`metric-title ${stats.overdue > 0 ? 'text-red' : ''}`}>Overdue</span>
            <div className={`metric-icon-bg ${stats.overdue > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
              <AlertTriangle size={16} className={stats.overdue > 0 ? 'text-red-500' : 'text-blue-500'} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className={`metric-value ${stats.overdue > 0 ? 'text-red' : ''}`}>{isLoading ? '—' : stats.overdue}</span>
            <span className={`metric-target ${stats.overdue > 0 ? 'text-red' : ''}`}>
              {stats.overdue > 0 ? 'need attention' : 'none overdue 🎉'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <section className="dashboard-content-split">

        {/* Recent Tasks */}
        <div className="recent-tasks-card">
          <div className="card-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="view-all">View All</Link>
          </div>

          <div className="task-list">
            {isLoading ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            ) : recentTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '16px' }}>No tasks yet. Create your first one!</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '6px' }} /> New Task
                </Button>
              </div>
            ) : (
              recentTasks.map(task => {
                const isCompleted = task.status === 'done';
                return (
                  <div className={`task-item ${isCompleted ? 'completed' : ''}`} key={task.id}>
                    {isCompleted
                      ? <CheckCircle size={20} className="task-check" style={{ color: 'var(--primary)' }} />
                      : <Circle size={20} className="task-check" />}
                    <div className="task-info">
                      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                        <h3 className={isCompleted ? 'strikethrough' : ''}>{task.title}</h3>
                      </Link>
                      <p>Due {formatDate(task.deadline)}</p>
                    </div>
                    {!isCompleted && task.status && (
                      <span className={`badge ${task.status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`}>
                        {getStatusText(task.status)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="right-column">

          {/* Upcoming Deadlines */}
          <div className="schedule-card">
            <h2>Upcoming Deadlines</h2>
            {isLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading…</div>
            ) : upcomingTasks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                No upcoming deadlines. 🎉
              </div>
            ) : (
              <div className="timeline">
                {upcomingTasks.map(task => (
                  <div className="timeline-item" key={task.id}>
                    <div className={`timeline-dot ${task.isOverdue ? 'red' : task.status === 'in_progress' ? 'blue' : 'grey'}`}></div>
                    <div className="timeline-content">
                      <p className={`time ${task.isOverdue ? 'red-text' : task.status === 'in_progress' ? 'blue-text' : ''}`}>
                        <CalendarClock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {formatRelativeDeadline(task.deadline)} · {formatDate(task.deadline.toISOString())}
                      </p>
                      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                        <h4>{task.title}</h4>
                      </Link>
                      <p>{getStatusText(task.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Task */}
          <div className="focus-card">
            <div className="focus-overlay">
              <p>Ready to be productive?</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                style={{ marginTop: '12px', background: 'white', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} /> New Task
              </Button>
            </div>
          </div>

        </div>
      </section>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
};
