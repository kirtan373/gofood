import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import '../admin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await adminApi.post('/admin/login', form);
      login(data.admin, data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card p-4">
        <div className="text-center mb-4">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #ff6b35, #e14f1d)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1rem',
            boxShadow: '0 8px 20px rgba(255, 107, 53, 0.35)'
          }}>
            M
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>Mitho Admin</h3>
          <p style={{ color: '#776c5f', fontSize: '0.88rem', margin: 0 }}>Sign in to manage your store</p>
        </div>

        {error && (
          <div style={{
            background: '#fdecec', border: '1px solid #f5c6c8', color: '#e5484d',
            padding: '0.65rem 0.85rem', borderRadius: 10, fontSize: '0.85rem', marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d342b' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89b8b', fontSize: '0.9rem' }} />
              <input
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                placeholder="admin@mitho.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3d342b' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89b8b', fontSize: '0.9rem' }} />
              <input
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            className="btn btn-admin-primary text-white w-100"
            style={{ padding: '0.65rem', fontSize: '0.92rem', fontWeight: 600, borderRadius: 10 }}
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: '0.78rem', color: '#a89b8b' }}>
          No admin account? Run <code style={{ background: '#f3ede4', padding: '2px 6px', borderRadius: 4 }}>npm run seed:admin</code>
        </p>
      </div>
    </div>
  );
}
