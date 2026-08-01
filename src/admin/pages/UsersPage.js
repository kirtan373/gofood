import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Dropdown } from 'react-bootstrap';
import {
  FiSearch, FiUsers, FiSlash, FiCheckCircle, FiTrash2,
  FiEye, FiUser, FiChevronDown, FiMapPin, FiShoppingBag
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import AdminPagination from '../components/AdminPagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import '../management.css';

const formatDate = (d) => {
  if (!d) return '---';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const initials = (name = '') =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

const STATUS_COLORS = {
  Pending: 'mg-badge-amber',
  Preparing: 'mg-badge-violet',
  'Out for Delivery': 'mg-badge-amber',
  Delivered: 'mg-badge-green',
  Cancelled: 'mg-badge-gray',
};

export default function UsersPage() {
  const { token } = useAdminAuth();
  const addToast = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [profile, setProfile] = useState(null);

  const loadData = useCallback(async (quiet) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        search, role: roleFilter, status: statusFilter,
        page: String(page), limit: String(limit)
      });
      const data = await adminApi.get(`/admin/users?${qs}`, token);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [token, search, roleFilter, statusFilter, page, limit]);

  useEffect(() => { if (token) loadData(); }, [loadData, token]);

  const openProfile = async (user) => {
    setProfile({ user, addresses: [], orderHistory: [], loading: true });
    try {
      const data = await adminApi.get(`/admin/users/${user._id}`, token);
      setProfile({ user: data.user, addresses: data.addresses || [], orderHistory: data.orderHistory || [], loading: false });
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to load profile', 'error');
      setProfile(null);
    }
  };

  const setBlocked = async (user, blocked) => {
    setBusyId(user._id);
    try {
      const data = await adminApi.patch(`/admin/users/${user._id}/block`, { blocked }, token);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isBlocked: data.user.isBlocked } : u)));
      if (profile?.user?._id === user._id) {
        setProfile((p) => p ? { ...p, user: { ...p.user, isBlocked: data.user.isBlocked } } : p);
      }
      addToast(blocked ? `${user.name} has been blocked` : `${user.name} has been unblocked`);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update user', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await adminApi.delete(`/admin/users/${deleteTarget._id}`, token);
      addToast('User deleted permanently');
      setDeleteTarget(null);
      loadData(true);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to delete user', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (user, role) => {
    if (user.role === role) return;
    setBusyId(user._id);
    try {
      const data = await adminApi.patch(`/admin/users/${user._id}/role`, { role }, token);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: data.user.role } : u)));
      if (profile?.user?._id === user._id) {
        setProfile((p) => p ? { ...p, user: { ...p.user, role: data.user.role } } : p);
      }
      addToast(`${user.name} is now ${role}`);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to change role', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="admin-section-title mb-4">User Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card mb-3">
        <div className="mg-filter-bar">
          <div className="mg-search">
            <FiSearch />
            <input
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select mg-filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select className="form-select mg-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <span className="mg-filter-count"><strong>{total}</strong> users</span>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-body p-0">
          {loading ? (
            <div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="mg-skel-row" key={i}>
                  <div className="mg-skel mg-skel-img" style={{ borderRadius: '50%' }} />
                  <div className="flex-grow-1">
                    <div className="mg-skel mg-skel-line" style={{ width: '35%', marginBottom: 8 }} />
                    <div className="mg-skel mg-skel-line" style={{ width: '25%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">
              <FiUsers size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No users found</div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="mg-avatar">{initials(user.name)}</div>
                            <div>
                              <div className="mg-cell-main">{user.name}</div>
                              <div className="mg-cell-sub">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              size="sm"
                              className={`mg-badge ${user.role === 'admin' ? 'mg-badge-violet' : 'mg-badge-gray'}`}
                              disabled={busyId === user._id}
                              style={{ border: 'none', cursor: 'pointer' }}
                            >
                              {user.role === 'admin' ? <FiUser /> : null} {user.role} <FiChevronDown size={11} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item active={user.role === 'user'} onClick={() => changeRole(user, 'user')}>User</Dropdown.Item>
                              <Dropdown.Item active={user.role === 'admin'} onClick={() => changeRole(user, 'admin')}>Admin</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                        <td style={{ color: 'var(--admin-text-secondary)', fontSize: '0.85rem' }}>{user.location || '---'}</td>
                        <td><span style={{ fontWeight: 700 }}>{user.stats?.totalOrders ?? 0}</span></td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--admin-accent)' }}>
                            Rs. {(user.stats?.totalSpending ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>{formatDate(user.date)}</td>
                        <td>
                          {user.isBlocked ? (
                            <span className="mg-badge mg-badge-red">Blocked</span>
                          ) : (
                            <span className="mg-badge mg-badge-green">Active</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" title="View profile" onClick={() => openProfile(user)}>
                            <FiEye />
                          </button>
                          <button
                            className={`btn btn-sm me-2 ${user.isBlocked ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            disabled={busyId === user._id}
                            onClick={() => setBlocked(user, !user.isBlocked)}
                          >
                            {user.isBlocked ? <><FiCheckCircle /> Unblock</> : <><FiSlash /> Block</>}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(user)}>
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                page={page} pages={pages} total={total} pageSize={limit}
                onPage={setPage} onPageSize={(n) => { setLimit(n); setPage(1); }}
                pageSizeOptions={[10, 20, 50]}
              />
            </>
          )}
        </div>
      </div>

      {/* Profile modal */}
      <Modal show={!!profile} onHide={() => setProfile(null)} centered size="lg" scrollable dialogClassName="mg-food-modal">
        {profile && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="mg-modal-title">User Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              {profile.loading ? (
                <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#ff6b35' }} role="status" /></div>
              ) : (
                <>
                  <div className="mg-profile-head">
                    <div className="mg-profile-avatar">{initials(profile.user?.name)}</div>
                    <div>
                      <div className="mg-profile-name">{profile.user?.name}</div>
                      <div className="mg-cell-sub">{profile.user?.email}</div>
                      <div className="mt-1 d-flex gap-1">
                        <span className={`mg-badge ${profile.user?.role === 'admin' ? 'mg-badge-violet' : 'mg-badge-gray'}`}>
                          {profile.user?.role}
                        </span>
                        {profile.user?.isBlocked ? (
                          <span className="mg-badge mg-badge-red">Blocked</span>
                        ) : (
                          <span className="mg-badge mg-badge-green">Active</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mg-kpi-strip">
                    <div className="mg-kpi">
                      <div className="mg-kpi-value">{profile.user?.totalOrders ?? 0}</div>
                      <div className="mg-kpi-label">Total Orders</div>
                    </div>
                    <div className="mg-kpi">
                      <div className="mg-kpi-value">Rs. {(profile.user?.totalSpending ?? 0).toLocaleString()}</div>
                      <div className="mg-kpi-label">Total Spent</div>
                    </div>
                    <div className="mg-kpi">
                      <div className="mg-kpi-value" style={{ fontSize: '0.95rem' }}>{profile.user?.location || '---'}</div>
                      <div className="mg-kpi-label">Location</div>
                    </div>
                    <div className="mg-kpi">
                      <div className="mg-kpi-value" style={{ fontSize: '0.95rem' }}>{formatDate(profile.user?.date)}</div>
                      <div className="mg-kpi-label">Joined</div>
                    </div>
                  </div>

                  <div className="mg-profile-section">
                    <h6><FiMapPin style={{ marginRight: 4 }} /> Saved Addresses</h6>
                    {profile.addresses.length === 0 ? (
                      <div className="mg-empty">No saved addresses yet.</div>
                    ) : (
                      profile.addresses.map((a, i) => (
                        <div className="mg-address-item" key={i}>
                          <strong>{a.name || 'Delivery'}{a.phone ? ` · ${a.phone}` : ''}</strong>
                          {a.address}
                          {a.notes ? <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{a.notes}</div> : null}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mg-profile-section">
                    <h6><FiShoppingBag style={{ marginRight: 4 }} /> Order History ({profile.orderHistory.length})</h6>
                    {profile.orderHistory.length === 0 ? (
                      <div className="mg-empty">No orders yet.</div>
                    ) : (
                      profile.orderHistory.map((o) => (
                        <div className="mg-order-item" key={o._id}>
                          <div className="mg-order-head">
                            <span className="mg-order-date">{formatDate(o.orderDate)}</span>
                            <span className={`mg-badge ${STATUS_COLORS[o.status] || 'mg-badge-gray'}`}>{o.status}</span>
                          </div>
                          <div className="mg-order-items">
                            {o.items.map((it, idx) => (
                              <div key={idx}>• {it.qty}× {it.name}{it.size ? ` (${it.size})` : ''} — Rs. {it.price}</div>
                            ))}
                          </div>
                          <div className="mg-order-head" style={{ marginTop: 6, marginBottom: 0 }}>
                            <span className="mg-cell-sub">
                              {o.paymentMethod ? `Paid via ${o.paymentMethod}` : ''}
                            </span>
                            <span className="mg-order-total">Total: Rs. {o.total}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User Permanently"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name || ''} (${deleteTarget?.email || ''})? This action cannot be undone and the user will no longer be able to access the website.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
