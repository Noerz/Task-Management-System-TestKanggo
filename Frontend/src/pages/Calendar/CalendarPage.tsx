import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { NewTaskModal } from '../../components/NewTaskModal';
import taskService from '../../services/taskService';
import type { Task } from '../../services/taskService';
import './CalendarPage.css';

interface CalendarCell {
  dayNumber: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPrevMonth?: boolean;
  isNextMonth?: boolean;
}

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch up to 100 tasks to cover the current calendar view
      const response = await taskService.getTasks(1, 100);
      setTasks(response.data);
    } catch (err: any) {
      toast.error('Failed to load tasks for calendar');
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

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const d = new Date(task.deadline);
      return isSameDay(d, date);
    });
  };

  // Build calendar grid
  const getCalendarCells = (): CalendarCell[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const startDayOfWeek = startOfMonth.getDay(); // 0: Sunday, 1: Monday...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];
    const today = new Date();

    // Previous month filler cells
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const cellDate = new Date(year, month - 1, dayNum);
      cells.push({
        dayNumber: dayNum,
        date: cellDate,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, today),
        isPrevMonth: true,
      });
    }

    // Current month cells
    for (let i = 1; i <= daysInMonth; i++) {
      const cellDate = new Date(year, month, i);
      cells.push({
        dayNumber: i,
        date: cellDate,
        isCurrentMonth: true,
        isToday: isSameDay(cellDate, today),
      });
    }

    // Next month filler cells to complete 42 cell grid (6 rows * 7 columns)
    const totalCells = cells.length;
    const nextMonthDaysNeeded = 42 - totalCells;
    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
      const cellDate = new Date(year, month + 1, i);
      cells.push({
        dayNumber: i,
        date: cellDate,
        isCurrentMonth: false,
        isToday: isSameDay(cellDate, today),
        isNextMonth: true,
      });
    }

    return cells;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const calendarCells = getCalendarCells();
  const selectedDayTasks = getTasksForDate(selectedDate);

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div>
          <p className="calendar-subtitle">CALENDAR OVERVIEW</p>
          <div className="month-controls">
            <h1 className="month-title">{monthName} {currentYear}</h1>
            <div className="date-nav">
              <button className="nav-btn" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
              <span className="current-date-text" style={{ cursor: 'pointer' }} onClick={handleGoToToday}>Today</span>
              <button className="nav-btn" onClick={handleNextMonth}><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="calendar-content">
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            <div className="grid-header">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>
            
            <div className="grid-body">
              {isLoading ? (
                <div style={{ gridColumn: 'span 7', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Loading calendar tasks...
                </div>
              ) : (
                calendarCells.map((cell, idx) => {
                  const dayTasks = getTasksForDate(cell.date);
                  const isSelected = isSameDay(cell.date, selectedDate);
                  
                  let dayClass = 'day';
                  if (cell.isPrevMonth) dayClass += ' prev-month';
                  if (cell.isNextMonth) dayClass += ' next-month';
                  if (cell.isToday) dayClass += ' today';
                  if (isSelected) dayClass += ' selected';

                  return (
                    <div 
                      className={dayClass} 
                      key={idx} 
                      onClick={() => setSelectedDate(cell.date)}
                    >
                      <span className={`day-number ${cell.isToday ? 'circle' : ''}`}>{cell.dayNumber}</span>
                      {dayTasks.slice(0, 2).map(task => (
                        <div 
                          key={task.id} 
                          className={`event ${task.status === 'done' ? 'event-grey' : task.status === 'in_progress' ? 'event-blue' : 'event-outline'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}`);
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="event event-grey" style={{ fontSize: '0.65rem', padding: '2px 4px', textAlign: 'center' }}>
                          + {dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="calendar-sidebar">
          <div className="schedule-card">
            <h2>Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h2>
            {selectedDayTasks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                <p style={{ margin: '0 0 16px 0' }}>No tasks scheduled for this day.</p>
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '8px' }} /> Create Task
                </Button>
              </div>
            ) : (
              <div className="timeline">
                {selectedDayTasks.map(task => (
                  <div className="timeline-item" key={task.id}>
                    <div className={`timeline-dot ${task.status === 'done' ? 'dark-grey' : 'blue'}`}></div>
                    <div className="timeline-content">
                      <p className={`time ${task.status === 'done' ? 'dark-grey-text' : 'blue-text'}`}>
                        {task.status === 'done' ? 'DONE' : task.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO'}
                      </p>
                      <h4 
                        style={{ cursor: 'pointer', textDecoration: task.status === 'done' ? 'line-through' : 'none' }} 
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px' }}>
                  <Button fullWidth onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} style={{ marginRight: '8px' }} /> Add Task
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={fetchTasks}
        initialDate={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
      />
    </div>
  );
};
