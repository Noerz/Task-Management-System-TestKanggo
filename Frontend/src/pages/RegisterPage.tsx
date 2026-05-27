import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './RegisterPage.css';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setShowSuccessModal(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message ?? 'Registration failed. Please try again.';
        setError(message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="grid-box"></div>
              <div className="grid-box"></div>
              <div className="grid-box"></div>
              <div className="grid-box"></div>
            </div>
            <span className="logo-text">FocusFlow</span>
          </div>
          <h1 className="register-title">Create an account</h1>
          <p className="register-subtitle">Enter your details below to get started.</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-container">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              onIconClick={() => setShowPassword(!showPassword)}
            />
            <p className="password-hint">Must be at least 8 characters long.</p>
          </div>

          <div className="submit-container">
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating account...' : <>Create Account <ArrowRight size={18} className="btn-icon" /></>}
            </Button>
          </div>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal-content">
            <div className="success-modal-body">
              <div className="success-icon-container">
                <CheckCircle2 size={40} className="success-check-icon" />
              </div>
              <h2 className="success-modal-title">Account Created!</h2>
              <p className="success-modal-desc">
                Your account was registered successfully. Please log in with your credentials to access your dashboard.
              </p>
              <div className="success-modal-footer">
                <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
