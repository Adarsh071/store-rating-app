import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email, password, address } = formData;

    if (name.trim().length < 20 || name.trim().length > 60) {
      return 'Name must be between 20 and 60 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 8 || password.length > 16) {
      return 'Password must be between 8 and 16 characters.';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUpperCase || !hasSpecialChar) {
      return 'Password must include at least one uppercase letter and one special character.';
    }

    if (!address.trim() || address.trim().length > 400) {
      return 'Address is required and must be maximum 400 characters.';
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/signup', formData);
      const { token, user } = res.data;
      login(token, user);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      padding: '30px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '36px 32px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#4f46e5',
            color: '#fff',
            marginBottom: 14
          }}>
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Create Normal User Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 4 }}>
            Sign up to browse stores and submit ratings
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: 18
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: formData.name.length >= 20 && formData.name.length <= 60 ? '#10b981' : '#64748b' }}>
                {formData.name.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name (20 to 60 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              required
            />
            <span className="form-hint">
              8-16 characters with at least 1 uppercase letter and 1 special symbol.
            </span>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Address</label>
              <span style={{ fontSize: '0.75rem', color: formData.address.length > 400 ? '#ef4444' : '#64748b' }}>
                {formData.address.length}/400 max
              </span>
            </div>
            <textarea
              name="address"
              className="form-input"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete residential address"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 10, padding: 12, fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
