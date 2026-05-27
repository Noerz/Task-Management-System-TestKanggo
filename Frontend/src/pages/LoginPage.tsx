import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './LoginPage.css';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message ?? 'Invalid email or password.';
        setError(message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-header-top">
        <h1 className="logo-title">FocusFlow</h1>
        <p className="logo-subtitle">Modern Productivity</p>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Enter your details to access your dashboard.</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            leftIcon={<Lock size={18} />}
            icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onIconClick={() => setShowPassword(!showPassword)}

          />

          <div className="remember-me-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="custom-checkbox"
              />
              <span className="checkbox-text">Remember me for 30 days</span>
            </label>
          </div>

          <div className="submit-container">
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in...' : <>Sign In <ArrowRight size={18} className="btn-icon" /></>}
            </Button>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p>Don't have an account? <Link to="/register" className="register-link">Create one now</Link></p>
      </div>
    </div>
  );
};
