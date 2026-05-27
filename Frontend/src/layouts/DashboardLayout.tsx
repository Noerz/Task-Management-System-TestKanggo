import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Calendar as CalendarIcon,
  Settings,
  Search,
  Bell,
  Plus,
  LogOutIcon,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/Button';
import { NewTaskModal } from '../components/NewTaskModal';
import { useAuth } from '../hooks/useAuth';
import taskService from '../services/taskService';
import type { Task } from '../services/taskService';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<{
    id: string;
    taskId: string;
    title: string;
    type: 'overdue' | 'today' | 'tomorrow' | 'soon';
    deadline: Date;
    message: string;
  }[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const computeNotifications = (allTasks: Task[]) => {
    const notifs: {
      id: string;
      taskId: string;
      title: string;
      type: 'overdue' | 'today' | 'tomorrow' | 'soon';
      deadline: Date;
      message: string;
    }[] = [];
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    const dayAfterTomorrowStart = new Date(todayStart);
    dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 2);
    
    const fourDaysLaterStart = new Date(todayStart);
    fourDaysLaterStart.setDate(fourDaysLaterStart.getDate() + 4);

    allTasks.forEach(task => {
      if (task.status === 'done' || !task.deadline) return;
      
      const deadlineDate = new Date(task.deadline);
      
      if (deadlineDate < todayStart) {
        const diffMs = todayStart.getTime() - deadlineDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        notifs.push({
          id: task.id,
          taskId: task.id,
          title: task.title,
          type: 'overdue',
          deadline: deadlineDate,
          message: diffDays === 1 ? 'Overdue by 1 day' : `Overdue by ${diffDays} days`
        });
      } else if (deadlineDate >= todayStart && deadlineDate < tomorrowStart) {
        notifs.push({
          id: task.id,
          taskId: task.id,
          title: task.title,
          type: 'today',
          deadline: deadlineDate,
          message: 'Due today'
        });
      } else if (deadlineDate >= tomorrowStart && deadlineDate < dayAfterTomorrowStart) {
        notifs.push({
          id: task.id,
          taskId: task.id,
          title: task.title,
          type: 'tomorrow',
          deadline: deadlineDate,
          message: 'Due tomorrow'
        });
      } else if (deadlineDate >= dayAfterTomorrowStart && deadlineDate < fourDaysLaterStart) {
        const diffMs = deadlineDate.getTime() - todayStart.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        notifs.push({
          id: task.id,
          taskId: task.id,
          title: task.title,
          type: 'soon',
          deadline: deadlineDate,
          message: `Due in ${diffDays} days`
        });
      }
    });

    const order = { overdue: 0, today: 1, tomorrow: 2, soon: 3 };
    return notifs.sort((a, b) => {
      if (a.type !== b.type) {
        return order[a.type] - order[b.type];
      }
      return a.deadline.getTime() - b.deadline.getTime();
    });
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const response = await taskService.getTasks(1, 100);
      const computed = computeNotifications(response.data);
      setNotifications(computed);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener('task-updated', handleSync);
    return () => {
      window.removeEventListener('task-updated', handleSync);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query && location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  };

  return (
    <div className={`dashboard-layout ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
      {/* Backdrop overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="sidebar-header">
          <div className="logo-icon small"></div>
          <div className="sidebar-brand">
            <span className="brand-title">FocusFlow</span>
            <span className="brand-subtitle">Personal Productivity</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CheckCircle2 size={20} />
            My Tasks
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CalendarIcon size={20} />
            Calendar
          </NavLink>
          <NavLink 
            to="/settings" 
            className="nav-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={20} />
            Settings
          </NavLink>
          <NavLink 
            to="/" 
            className="nav-item" 
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              handleLogout(e);
            }}
          >
            <LogOutIcon size={20} />
            Logout
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <button className="menu-toggle-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search my tasks..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="topbar-actions">
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                className={`icon-btn ${isNotifOpen ? 'active' : ''}`} 
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <h3>Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="notif-count-label">{notifications.length} task{notifications.length > 1 ? 's' : ''} due soon</span>
                    )}
                  </div>
                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <CheckCircle2 size={32} className="notif-empty-icon" />
                        <p className="notif-empty-title">All caught up!</p>
                        <p className="notif-empty-desc">No tasks are approaching deadlines.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className="notif-item"
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate(`/tasks/${notif.taskId}`);
                          }}
                        >
                          <div className="notif-item-header">
                            <span className="notif-item-title">{notif.title}</span>
                            <span className={`notif-type-tag ${notif.type}`}>
                              {notif.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="notif-item-message">{notif.message}</p>
                          <p className="notif-item-date">
                            Deadline: {new Date(notif.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button className="new-task-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span className="new-task-btn-text">New Task</span>
            </Button>
            <div className="user-avatar" title={user?.name ?? 'User'}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=1F2937&color=fff`}
                alt={user?.name ?? 'User'}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>

      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
