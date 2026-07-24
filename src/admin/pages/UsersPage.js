import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiUsers, FiSlash, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function UsersPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/users', token);
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const toggleBlock = async (user) => {
    setBusyId(user._id);
    try {
      const data = await adminApi.patch(`/admin/users/block/${user._id}`, {}, token);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update user');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await adminApi.delete(`/admin/users/${deleteTarget._id}`, token);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete user';
      setDeleteError(msg);
    }
  };

  const filteredUsers = useMemo(() => users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  return (
    <div>
      <h2 className="admin-section-title mb-4">User Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card mb-3">
        <div className="card-body admin-search-bar">
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input className="form-control" style={{ paddingLeft: '2.25rem' }} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-body">
          {loading ? (
            <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#10b981' }} role="status" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <FiUsers size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No users found</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 600 }}>{user.name}</td>
                      <td style={{ color: '#64748b' }}>{user.email}</td>
                      <td>{user.location || '---'}</td>
                      <td>
                        {user.isBlocked ? (
                          <span style={{ background: '#fef2f2', color: '#b91c1c', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>Blocked</span>
                        ) : (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>Active</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm me-2 ${user.isBlocked ? 'btn-outline-success' : 'btn-outline-warning'}`}
                          disabled={busyId === user._id}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isBlocked ? <><FiCheckCircle /> Unblock</> : <><FiSlash /> Block</>}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(user)}><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User Permanently"
        message={deleteError || `Are you sure you want to permanently delete ${deleteTarget?.name || ''} (${deleteTarget?.email || ''})? This action cannot be undone and the user will no longer be able to access the website.`}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
      />
    </div>
  );
}
