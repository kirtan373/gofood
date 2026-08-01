import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiSearch, FiClipboard, FiPhone, FiMapPin, FiUser, FiMessageCircle, FiCreditCard, FiHash } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusStyles = {
  Pending: { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  Preparing: { bg: '#e0f7fa', color: '#0e7490', dot: '#06b6d4' },
  'Out for Delivery': { bg: '#e8f0fe', color: '#1d4ed8', dot: '#3b82f6' },
  Delivered: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
};

export default function OrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/orders', token);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) loadData(); }, [token, loadData]);

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order._id);
    try {
      await adminApi.put(`/admin/orders/${order._id}`, { status }, token);
      setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status } : o));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = (order.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (order.status || 'Pending') === statusFilter;
    return matchesSearch && matchesStatus;
  }), [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const counts = { total: orders.length, Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0, Cancelled: 0 };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  const formatDate = (d) => {
    if (!d) return '---';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 className="admin-section-title mb-4">Order Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Row */}
      <div className="row g-2 mb-4">
        {[
          { label: 'Total', value: stats.total, color: '#201a14' },
          { label: 'Pending', value: stats.Pending, color: '#f59e0b' },
          { label: 'Preparing', value: stats.Preparing, color: '#06b6d4' },
          { label: 'Out for Delivery', value: stats['Out for Delivery'], color: '#3b82f6' },
          { label: 'Delivered', value: stats.Delivered, color: '#22c55e' },
          { label: 'Cancelled', value: stats.Cancelled, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} className="col-6 col-md-4 col-lg-2">
            <div className="admin-revenue-card" style={{ borderLeft: `3px solid ${s.color}`, padding: '0.85rem 1rem' }}>
              <div className="admin-revenue-label">{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="admin-card mb-3">
        <div className="card-body admin-search-bar">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89b8b' }} />
                <input className="form-control" style={{ paddingLeft: '2.25rem' }} placeholder="Search by customer email..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3 text-end">
              <span style={{ fontSize: '0.82rem', color: '#776c5f' }}>
                Showing <strong style={{ color: '#201a14' }}>{filteredOrders.length}</strong> of {orders.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#ff6b35' }} role="status" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty-state">
          <FiClipboard size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No orders found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredOrders.map((order) => {
            const st = statusStyles[order.status] || statusStyles.Pending;
            return (
              <div key={order._id} className="admin-card" style={{ overflow: 'hidden' }}>
                {/* Order Header */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                  justifyContent: 'space-between', gap: '0.75rem',
                  padding: '0.85rem 1.25rem', borderBottom: '1px solid #eae2d6',
                  background: '#faf7f2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                      <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {order.status}
                      </span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.email}</span>
                    <span style={{ fontSize: '0.8rem', color: '#a89b8b' }}>{formatDate(order.order_date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#e14f1d' }}>Rs. {order.total?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.72rem', color: '#a89b8b' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                    </div>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto', fontSize: '0.78rem', minWidth: 130, fontWeight: 600 }}
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ padding: '0.75rem 1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a89b8b' }}>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Item</th>
                        <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 600 }}>Size</th>
                        <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 600 }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, iIdx) => (
                        <tr key={iIdx} style={{ borderTop: '1px solid #f3ede4' }}>
                          <td style={{ padding: '8px 0', fontSize: '0.88rem', fontWeight: 500 }}>{item.name || 'Item'}</td>
                          <td style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#776c5f' }}>{item.size || '---'}</td>
                          <td style={{ padding: '8px 0', fontSize: '0.85rem', textAlign: 'center' }}>{item.qty || 1}</td>
                          <td style={{ padding: '8px 0', fontSize: '0.88rem', textAlign: 'right', fontWeight: 600 }}>
                            Rs. {((Number(item.price) || 0) * (Number(item.qty) || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Delivery Info */}
                {order.deliveryInfo && (
                  <div style={{ margin: '0 1.25rem 1rem', padding: '0.85rem 1rem', background: '#faf7f2', borderRadius: 10, border: '1px dashed #eae2d6' }}>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a89b8b', fontWeight: 600, marginBottom: '0.5rem' }}>Delivery Details</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.75rem', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiUser style={{ color: '#a89b8b', fontSize: '0.78rem' }} />
                        <span>{order.deliveryInfo.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiPhone style={{ color: '#a89b8b', fontSize: '0.78rem' }} />
                        <span>{order.deliveryInfo.phone}</span>
                      </div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <FiMapPin style={{ color: '#a89b8b', fontSize: '0.78rem', marginTop: 2, flexShrink: 0 }} />
                        <span>{order.deliveryInfo.address}</span>
                      </div>
                      {order.deliveryInfo.notes && (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                          <FiMessageCircle style={{ color: '#a89b8b', fontSize: '0.78rem', marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontStyle: 'italic', color: '#776c5f' }}>{order.deliveryInfo.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div style={{ margin: '0 1.25rem 1rem', padding: '0.85rem 1rem', background: order.paymentMethod === 'cod' ? '#fffbeb' : '#f0fdf4', borderRadius: 10, border: `1px dashed ${order.paymentMethod === 'cod' ? '#fde68a' : '#bbf7d0'}` }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a89b8b', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Details</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.75rem', fontSize: '0.82rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FiCreditCard style={{ color: '#a89b8b', fontSize: '0.78rem' }} />
                      <span style={{ fontWeight: 600 }}>Method:</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        background: order.paymentMethod === 'cod' ? '#fef3c7' : '#dcfce7',
                        color: order.paymentMethod === 'cod' ? '#b45309' : '#15803d',
                      }}>
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'esewa' ? 'eSewa' : order.paymentMethod === 'khalti' ? 'Khalti' : order.paymentMethod || 'N/A'}
                      </span>
                    </div>
                    {order.transactionId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiHash style={{ color: '#a89b8b', fontSize: '0.78rem' }} />
                        <span style={{ fontWeight: 600 }}>Transaction ID:</span>
                        <span style={{ fontFamily: "'SF Mono', 'Consolas', monospace", fontSize: '0.78rem', color: '#201a14', background: '#fff', padding: '2px 8px', borderRadius: 4, border: '1px solid #eae2d6' }}>
                          {order.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
