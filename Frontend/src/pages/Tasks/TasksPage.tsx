import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Circle, CheckCircle, Calendar, Filter, ArrowDownWideNarrow, ArrowUpWideNarrow, X } from 'lucide-react';
import './TasksPage.css';
import { Button } from '../../components/Button';

import taskService from '../../services/taskService';
import type { Task } from '../../services/taskService';
import toast from 'react-hot-toast';

const TABS = ['All', 'Pending', 'In Progress', 'Done'];

export const TasksPage: React.FC = () => {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [activeTab, setActiveTab] = useState('All');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Use 5 items per page for better visibility of pagination

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Sorting & Filtering State
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Load tasks on page, tab, or search changes
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const response = await taskService.getTasks(page, limit, activeTab, debouncedSearch);
        setTasks(response.data);
        setTotalPages(response.meta.totalPages || 1);
      } catch (err: any) {
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();

    const handleSync = () => {
      loadTasks();
    };
    window.addEventListener('task-updated', handleSync);
    return () => {
      window.removeEventListener('task-updated', handleSync);
    };
  }, [page, activeTab, debouncedSearch]);

  // Outside click listener for filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset page to 1 when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Helper: check if a task is overdue
  const isOverdue = (task: Task) => {
    if (task.status === 'done' || !task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineCopy = new Date(deadlineDate);
    deadlineCopy.setHours(0, 0, 0, 0);
    return deadlineCopy < today;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No Deadline';
    const date = new Date(dateStr);
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  // Toggle sort order: null -> asc -> desc -> null
  const toggleSort = () => {
    setSortDir(current => {
      if (current === null) return 'asc';
      if (current === 'asc') return 'desc';
      return null;
    });
  };

  // Toggle filter option
  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev =>
      prev.includes(filterKey)
        ? prev.filter(k => k !== filterKey)
        : [...prev, filterKey]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const resetAllFiltersAndSort = () => {
    setActiveFilters([]);
    setSortDir(null);
  };

  // Memoized filtered & sorted tasks
  const displayedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Apply local filters if any
    if (activeFilters.length > 0) {
      result = result.filter(task => {
        const matchOverdue = activeFilters.includes('overdue') && isOverdue(task);
        const matchHasDeadline = activeFilters.includes('hasDeadline') && !!task.deadline;
        const matchNoDeadline = activeFilters.includes('noDeadline') && !task.deadline;
        return matchOverdue || matchHasDeadline || matchNoDeadline;
      });
    }

    // 2. Apply sorting
    if (sortDir) {
      result.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1; // Null deadlines always go to the end
        if (!b.deadline) return -1;
        const timeA = new Date(a.deadline).getTime();
        const timeB = new Date(b.deadline).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }

    return result;
  }, [tasks, activeFilters, sortDir]);

  return (
    <div className="tasks-page">
      <header className="page-header">
        <h1 className="greeting">My Tasks</h1>
        <p className="subtitle">Manage and prioritize your personal work.</p>
      </header>

      <div className="tasks-toolbar">
        <div className="tabs-container">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button
            className={`sort-btn ${sortDir ? 'sort-btn--active' : ''}`}
            onClick={toggleSort}
          >
            {sortDir === 'desc' ? (
              <ArrowUpWideNarrow size={16} />
            ) : (
              <ArrowDownWideNarrow size={16} />
            )}
            Sort by Deadline {sortDir ? `(${sortDir.toUpperCase()})` : ''}
          </button>

          <div className="filter-wrapper" ref={filterRef}>
            <button
              className={`icon-action-btn ${filterOpen || activeFilters.length > 0 ? 'icon-action-btn--active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={18} />
              {activeFilters.length > 0 && (
                <span className="filter-badge">{activeFilters.length}</span>
              )}
            </button>

            {filterOpen && (
              <div className="filter-panel">
                <div className="filter-panel-header">
                  <h3>Filter by Deadline</h3>
                  {activeFilters.length > 0 && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('overdue')}
                      onChange={() => toggleFilter('overdue')}
                    />
                    <span>Overdue</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('hasDeadline')}
                      onChange={() => toggleFilter('hasDeadline')}
                    />
                    <span>Has Deadline</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('noDeadline')}
                      onChange={() => toggleFilter('noDeadline')}
                    />
                    <span>No Deadline</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters / Sort Chips Row */}
      {(sortDir || activeFilters.length > 0) && (
        <div className="active-filters-row">
          <span className="filters-label">Active:</span>
          <div className="filter-chips">
            {sortDir && (
              <span className="filter-chip">
                Sort: Deadline ({sortDir === 'asc' ? 'Ascending' : 'Descending'})
                <button className="remove-chip-btn" onClick={() => setSortDir(null)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.includes('overdue') && (
              <span className="filter-chip">
                Overdue
                <button className="remove-chip-btn" onClick={() => toggleFilter('overdue')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.includes('hasDeadline') && (
              <span className="filter-chip">
                Has Deadline
                <button className="remove-chip-btn" onClick={() => toggleFilter('hasDeadline')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.includes('noDeadline') && (
              <span className="filter-chip">
                No Deadline
                <button className="remove-chip-btn" onClick={() => toggleFilter('noDeadline')}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button className="clear-all-chips-btn" onClick={resetAllFiltersAndSort}>
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="task-cards-list">
        {isLoading ? (
          <div className="text-center p-8 text-gray-500">Loading tasks...</div>
        ) : displayedTasks.length === 0 ? (
          <div className="tasks-empty-state">
            <p>No tasks found matching current filters or search criteria.</p>
            {(activeFilters.length > 0 || sortDir) && (
              <Button onClick={resetAllFiltersAndSort} variant="secondary">
                Reset Filters & Sort
              </Button>
            )}
          </div>
        ) : (
          displayedTasks.map(task => {
            const isCompleted = task.status === 'done';
            const overdue = isOverdue(task);

            return (
              <div className={`task-card ${overdue ? 'task-card--overdue' : ''}`} key={task.id}>
                <div className="task-status-icon">
                  {isCompleted ? (
                    <CheckCircle size={24} className="text-blue-500" />
                  ) : overdue ? (
                    <Circle size={24} className="status-icon-overdue" />
                  ) : (
                    <Circle size={24} className="text-gray-400" />
                  )}
                </div>

                <div className="task-details">
                  <div className="task-title-row">
                    <Link to={`/tasks/${task.id}`} className={`task-title ${isCompleted ? 'completed-text' : ''}`}>
                      {task.title}
                    </Link>
                    {overdue && (
                      <span className="task-badge overdue">OVERDUE</span>
                    )}
                    {task.status && (
                      <span className={`task-badge ${task.status.replace('_', '-')}`}>
                        {getStatusText(task.status)}
                      </span>
                    )}
                  </div>

                  <div className="task-meta-row">
                    <span className={`task-meta-item ${overdue ? 'task-meta-overdue' : ''}`}>
                      <Calendar size={14} />
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls - Hidden when filters are active */}
      {!isLoading && totalPages > 1 && activeFilters.length === 0 && (
        <div className="pagination-controls">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            Previous
          </Button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
