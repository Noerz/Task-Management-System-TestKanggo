import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { TasksPage } from './pages/Tasks/TasksPage';
import { TaskDetailPage } from './pages/Tasks/TaskDetailPage';
import { CalendarPage } from './pages/Calendar/CalendarPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* "/" → let ProtectedRoute / GuestRoute decide the destination */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Guest-only routes – redirect to /dashboard if already logged in */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes – redirect to /login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/projects" element={<div>Projects Placeholder</div>} />
              {/* <Route path="/settings" element={<div>Settings Placeholder</div>} /> */}
              <Route path="/support" element={<div>Support Placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
