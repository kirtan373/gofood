import React, { useEffect, useState } from 'react';
import {
  FiUsers, FiShoppingBag, FiClipboard, FiTag,
  FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="col-sm-6 col-xl-3">
    <div className="admin-stat-card">
      <div className="card-body d-flex align-items-center gap-3">
        <div className="admin-stat-icon" style={{ background: color }}>
          <Icon />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
        </div>
      </div>
    </div>
  </div>
);

const statusStyles = {
  Pending: { bg: '#fef3c7', color: '#b45309' },
  Preparing: { bg: '#e0f7fa', color: '#0e7490' },
  'Out for Delivery': { bg: '#e8f0fe', color: '#1d4ed8' },
  Delivered: { bg: '#dcfce7', color: '#15803d' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/dashboard', token);
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) load(); }, [token]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="admin-section-title mb-0">Overview</h2>
        <button className="btn btn-sm d-flex align-items-center gap-1"
          style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 500, color: '#64748b' }}
          onClick={load} disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && !stats ? (
        <div className="admin-empty-state">
          <div className="spinner-border mb-2" style={{ color: '#10b981' }} role="status" />
          <div>Loading dashboard...</div>
        </div>
      ) : stats ? (
        <>
          <div className="row g-3 mb-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={FiUsers} color="#6366f1" />
            <StatCard label="Total Orders" value={stats.totalOrders} icon={FiClipboard} color="#8b5cf6" />
            <StatCard label="Food Items" value={stats.totalFoodItems} icon={FiShoppingBag} color="#f97316" />
            <StatCard label="Categories" value={stats.totalCategories} icon={FiTag} color="#06b6d4" />
            <StatCard label="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} icon={FiDollarSign} color="#10b981" />
            <StatCard label="Pending" value={stats.pendingOrders} icon={FiAlertCircle} color="#f59e0b" />
            <StatCard label="Completed" value={stats.completedOrders} icon={FiCheckCircle} color="#22c55e" />
          </div>

          <div className="admin-card">
            <div className="card-body">
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Recent Orders</h5>
              {recentOrders.length === 0 ? (
                <div className="admin-empty-state py-4">
                  <FiClock size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div>No orders yet</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table admin-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Sessions</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => {
                        const st = statusStyles[order.status] || statusStyles.Pending;
                        return (
                          <tr key={order._id || index}>
                            <td style={{ fontWeight: 600 }}>{order.email || 'Unknown'}</td>
                            <td style={{ color: '#64748b' }}>{Array.isArray(order.order_data) ? order.order_data.length : 0}</td>
                            <td>
                              <span style={{
                                background: st.bg, color: st.color,
                                padding: '3px 10px', borderRadius: 6,
                                fontSize: '0.72rem', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.03em'
                              }}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
