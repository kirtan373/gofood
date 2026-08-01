import React from 'react';
import { FiUser, FiMail, FiShield, FiLock } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function SettingsPage() {
  const { admin } = useAdminAuth();
  const initials = admin?.name
    ? admin.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div>
      <h2 className="admin-section-title mb-4">Settings</h2>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="admin-profile-card">
            <div className="admin-profile-header">
              <div className="admin-profile-avatar">{initials}</div>
              <div className="admin-profile-name">{admin?.name || 'Admin'}</div>
              <div className="admin-profile-email">{admin?.email || ''}</div>
            </div>
            <div className="admin-profile-body">
              <div className="admin-profile-row">
                <FiUser size={16} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#a89b8b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</div>
                  <div style={{ fontWeight: 500 }}>{admin?.name || '---'}</div>
                </div>
              </div>
              <div className="admin-profile-row">
                <FiMail size={16} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#a89b8b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{admin?.email || '---'}</div>
                </div>
              </div>
              <div className="admin-profile-row">
                <FiShield size={16} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#a89b8b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
                  <div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>Administrator</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="admin-card">
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>More Settings</h5>
              <p style={{ color: '#776c5f', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Theme, notification, and backup preferences will be added here in a future update.
              </p>
              <div style={{ background: '#faf7f2', borderRadius: 10, padding: '1rem', border: '1px dashed #eae2d6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#776c5f', fontSize: '0.85rem' }}>
                  <FiLock size={14} />
                  <span>To change your password, use the <strong>Password</strong> button in the top navigation bar.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
