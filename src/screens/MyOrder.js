import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiClock, FiCheckCircle, FiXCircle, FiTruck, FiPackage } from 'react-icons/fi';
import './MyOrder.css';

const statusConfig = {
  Pending: { cls: 'pending', icon: <FiClock size={12} /> },
  Preparing: { cls: 'preparing', icon: <FiPackage size={12} /> },
  'Out for Delivery': { cls: 'out-for-delivery', icon: <FiTruck size={12} /> },
  Delivered: { cls: 'delivered', icon: <FiCheckCircle size={12} /> },
  Cancelled: { cls: 'cancelled', icon: <FiXCircle size={12} /> },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <span className={`myorder-status ${cfg.cls}`}>
      <span className="dot" />
      {status}
    </span>
  );
};

export default function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/myOrderData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: localStorage.getItem('userEmail') }),
        });
        const data = await res.json();
        setOrders(data.orderData || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="myorder-page">
      <Navbar />

      <main className="myorder-main">
        <div className="myorder-header">
          <h1>My Orders</h1>
          <p>Track and review all your orders</p>
        </div>

        {loading ? (
          <div className="myorder-empty">
            <div className="spinner-border text-success" role="status" />
          </div>
        ) : orders.length === 0 ? (
          <div className="myorder-empty">
            <FiPackage size={40} />
            <p>No orders yet. Start ordering!</p>
          </div>
        ) : (
          <>
            <div className="myorder-summary">
              <div className="myorder-summary-stat">
                <div className="num">{orders.length}</div>
                <div className="label">Orders</div>
              </div>
              <div className="myorder-summary-stat">
                <div className="num">{totalItems}</div>
                <div className="label">Items</div>
              </div>
              <div className="myorder-summary-stat">
                <div className="num">Rs. {totalSpent.toLocaleString()}</div>
                <div className="label">Total Spent</div>
              </div>
            </div>

            {orders.map((order) => (
              <div key={order._id} className="myorder-card">
                <div className="myorder-card-header">
                  <div className="myorder-card-date">
                    <div className="date-icon">
                      <FiClock size={14} color="#22c55e" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.88rem' }}>
                        {formatDate(order.order_date)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {formatTime(order.order_date)}
                      </div>
                    </div>
                  </div>
                  <div className="myorder-card-right">
                    <StatusBadge status={order.status} />
                    <span className="myorder-total">Rs. {order.total}</span>
                  </div>
                </div>

                <div className="myorder-card-body">
                  <div className="myorder-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="myorder-item">
                        {item.img && (
                          <img
                            src={item.img}
                            alt={item.name}
                            className="myorder-item-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="myorder-item-info">
                          <p className="myorder-item-name">{item.name}</p>
                          <p className="myorder-item-meta">
                            {item.size} &middot; Qty: {item.qty}
                          </p>
                        </div>
                        <div className="myorder-item-price">
                          Rs. {(Number(item.price) || 0) * (Number(item.qty) || 1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="myorder-card-footer">
                  <span className="myorder-session-total">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                  <span className="myorder-session-total">
                    Total: <strong>Rs. {order.total}</strong>
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
