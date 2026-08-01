import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FiRefreshCw, FiSearch, FiTrendingUp, FiClock, FiUsers, FiShoppingBag,
  FiTag, FiStar, FiDollarSign, FiClipboard, FiCheckCircle, FiXCircle,
  FiTruck, FiPackage, FiZap, FiAward, FiCalendar, FiAlertTriangle
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import DashboardKpiCard from '../components/DashboardKpiCard';
import DashboardChart from '../components/DashboardChart';
import { KpiSkeleton, ChartSkeleton, ActivitySkeleton } from '../components/DashboardSkeleton';
import '../dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const fmtMoney = (v) => `Rs. ${Number(v || 0).toLocaleString()}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—');
const initials = (name) => (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const STATUS_META = {
  Pending: { bg: '#fef3c7', color: '#b45309' },
  Preparing: { bg: '#cffafe', color: '#0e7490' },
  'Out for Delivery': { bg: '#dbeafe', color: '#1d4ed8' },
  Delivered: { bg: '#d1fae5', color: '#047857' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c' },
};

const PAY_META = {
  cod: { label: 'COD', color: '#b45309', bg: '#fef3c7' },
  esewa: { label: 'eSewa', color: '#047857', bg: '#d1fae5' },
  khalti: { label: 'Khalti', color: '#4c1d95', bg: '#ede9fe' },
};

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedRange, setAppliedRange] = useState(null);
  const [dark, setDark] = useState(() => document.querySelector('.admin-root')?.classList.contains('admin-dark'));
  const [toasts, setToasts] = useState([]);
  const firstLoad = useRef(true);

  useEffect(() => {
    const handler = (e) => setDark(!!e.detail?.dark);
    window.addEventListener('admin-theme', handler);
    return () => window.removeEventListener('admin-theme', handler);
  }, []);

  const pushToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const load = useCallback(async (notify = false) => {
    setLoading(true);
    setError('');
    try {
      const qs = appliedRange ? `?from=${appliedRange.from}&to=${appliedRange.to}` : '';
      const res = await adminApi.get(`/admin/analytics${qs}`, token);
      setData(res);
      if (notify) pushToast('Dashboard updated');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load dashboard';
      setError(msg);
      if (notify) pushToast(msg, 'error');
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  }, [token, appliedRange, pushToast]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const applyRange = () => {
    if (from && to && from > to) {
      pushToast('Start date must be before end date', 'error');
      return;
    }
    if (from || to) {
      setAppliedRange({ from: from || undefined, to: to || undefined });
      pushToast('Date range applied');
    } else {
      setAppliedRange(null);
      pushToast('Date range cleared');
    }
  };

  const clearRange = () => {
    setFrom('');
    setTo('');
    setAppliedRange(null);
    pushToast('Date range cleared');
  };

  /* ── Chart theme colors ── */
  const axisColor = dark ? '#8a7e70' : '#a89b8b';
  const gridColor = dark ? 'rgba(255,255,255,0.06)' : '#f3ede4';

  const baseScales = (horizontal = false) => ({
    grid: { display: horizontal, color: gridColor },
    border: { display: false },
    ticks: { color: axisColor, font: { family: 'DM Sans', size: 11 }, padding: 6 },
  });

  const lineDataset = (label, values) => ({
    label,
    data: values,
    borderColor: '#ff6b35',
    backgroundColor: (ctx) => {
      const { chart } = ctx;
      const { ctx: c, chartArea } = chart;
      if (!chartArea) return 'rgba(255,107,53,0.1)';
      const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, 'rgba(255,107,53,0.35)');
      g.addColorStop(1, 'rgba(255,107,53,0.02)');
      return g;
    },
    fill: true,
    tension: 0.4,
    pointRadius: 2,
    pointHoverRadius: 5,
    pointBackgroundColor: '#ff6b35',
    borderWidth: 2.5,
  });

  const barColors = ['#ff6b35', '#e8a33d', '#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c'];
  const barDataset = (label, values, single = true, horizontal = false) => ({
    label,
    data: values,
    backgroundColor: single ? 'rgba(255,107,53,0.85)' : barColors,
    hoverBackgroundColor: single ? '#e14f1d' : barColors.map((c) => c + 'cc'),
    borderRadius: 6,
    borderSkipped: false,
    maxBarThickness: 42,
    indexAxis: horizontal ? 'y' : 'x',
  });

  const baseOptions = (horizontal = false, legend = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: legend ? { display: true, position: 'bottom', labels: { color: axisColor, font: { family: 'DM Sans', size: 11 }, boxWidth: 12, padding: 14 } } : { display: false },
      tooltip: {
        backgroundColor: dark ? '#2a221a' : '#17120d',
        padding: 10,
        cornerRadius: 10,
        titleFont: { family: 'DM Sans', size: 12 },
        bodyFont: { family: 'DM Sans', size: 12 },
        displayColors: false,
      },
    },
    scales: {
      x: { ...baseScales(horizontal), grid: { display: horizontal, color: gridColor } },
      y: { ...baseScales(!horizontal), beginAtZero: true },
    },
  });

  const c = data?.charts;
  const q = search.trim().toLowerCase();
  const filterBy = (arr, keys) => (arr || []).filter((item) => keys.some((k) => String(item[k] || '').toLowerCase().includes(q)));

  const filteredOrders = filterBy(data?.activity?.latestOrders, ['email', 'status']);
  const filteredUsers = filterBy(data?.activity?.latestUsers, ['name', 'email']);
  const filteredPayments = filterBy(data?.activity?.recentPayments, ['email', 'method', 'transactionId']);
  const filteredLowStock = filterBy(data?.activity?.lowStockFoods, ['name', 'CategoryName']);
  const filteredReviews = filterBy(data?.activity?.latestReviews, ['name', 'review']);

  /* ── KPI cards config ── */
  const cardCfg = [
    { key: 'totalRevenue', label: 'Total Revenue', icon: FiDollarSign, grad: 'linear-gradient(135deg,#ff6b35,#e14f1d)', fmt: fmtMoney },
    { key: 'todayRevenue', label: "Today's Revenue", icon: FiTrendingUp, grad: 'linear-gradient(135deg,#f59e0b,#ea580c)', fmt: fmtMoney },
    { key: 'todayOrders', label: "Today's Orders", icon: FiClipboard, grad: 'linear-gradient(135deg,#38bdf8,#2563eb)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'pendingOrders', label: 'Pending Orders', icon: FiClock, grad: 'linear-gradient(135deg,#fbbf24,#d97706)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'preparingOrders', label: 'Preparing', icon: FiPackage, grad: 'linear-gradient(135deg,#22d3ee,#0e7490)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'outForDeliveryOrders', label: 'Out for Delivery', icon: FiTruck, grad: 'linear-gradient(135deg,#60a5fa,#1d4ed8)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'deliveredOrders', label: 'Delivered', icon: FiCheckCircle, grad: 'linear-gradient(135deg,#34d399,#059669)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'cancelledOrders', label: 'Cancelled', icon: FiXCircle, grad: 'linear-gradient(135deg,#f87171,#dc2626)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'totalCustomers', label: 'Total Customers', icon: FiUsers, grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'totalFoods', label: 'Total Foods', icon: FiShoppingBag, grad: 'linear-gradient(135deg,#fb923c,#ea580c)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'totalCategories', label: 'Categories', icon: FiTag, grad: 'linear-gradient(135deg,#2dd4bf,#0d9488)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'totalReviews', label: 'Total Reviews', icon: FiStar, grad: 'linear-gradient(135deg,#f472b6,#db2777)', fmt: (v) => Number(v).toLocaleString() },
    { key: 'mostOrderedFood', label: 'Most Ordered Food', icon: FiZap, grad: 'linear-gradient(135deg,#facc15,#eab308)', fmt: (v) => v },
    { key: 'bestSellingCategory', label: 'Best Selling Category', icon: FiAward, grad: 'linear-gradient(135deg,#94a3b8,#475569)', fmt: (v) => v },
  ];

  const hasError = !!error;
  const empty = !loading && data && !data.cards;

  return (
    <div className="admin-dashboard">
      {/* ── Toasts ── */}
      <div className="db-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`db-toast db-toast-${t.type}`}>
            <span className={`db-toast-dot ${t.type === 'error' ? 'db-toast-dot-error' : ''}`} />
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="db-header">
        <div className="db-header-title">
          <h2>Dashboard</h2>
          <p>Welcome back — here's what's happening at Mitho today.</p>
        </div>

        <div className="db-toolbar">
          <div className="db-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search orders, users, payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="db-range">
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            <span>→</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            <button className="db-range-apply" onClick={applyRange} title="Apply date range">
              <FiCalendar /> Apply
            </button>
            {appliedRange && (
              <button className="db-range-clear" onClick={clearRange} title="Clear range">✕</button>
            )}
          </div>

          <button className="db-refresh" onClick={() => load(true)} disabled={loading} title="Refresh data">
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {appliedRange && (
        <div className="db-range-chip">
          Showing analytics from <strong>{appliedRange.from || 'beginning'}</strong> to <strong>{appliedRange.to || 'today'}</strong>
          <button onClick={clearRange}>Clear</button>
        </div>
      )}

      {hasError && (
        <div className="db-error">
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !data ? (
        <>
          <div className="db-quick-grid">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="db-skel db-skel-quick" />)}
          </div>
          <KpiSkeleton cards={14} />
          <div className="db-section-label db-skel-label" />
          <ChartSkeleton cards={4} />
          <ActivitySkeleton cards={5} />
        </>
      ) : empty ? (
        <div className="admin-empty-state">
          <FiAlertTriangle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <div>No dashboard data available</div>
        </div>
      ) : data ? (
        <>
          {/* ── Quick stats ── */}
          <div className="db-quick-grid">
            <div className="db-quick">
              <span className="db-quick-label">Revenue in range</span>
              <strong>{fmtMoney(data.quickStats?.revenueInRange)}</strong>
            </div>
            <div className="db-quick">
              <span className="db-quick-label">Orders in range</span>
              <strong>{data.quickStats?.ordersInRange ?? 0}</strong>
            </div>
            <div className="db-quick">
              <span className="db-quick-label">Avg order value</span>
              <strong>{fmtMoney(data.quickStats?.avgOrderValue)}</strong>
            </div>
            <div className="db-quick">
              <span className="db-quick-label">Active orders</span>
              <strong>{data.quickStats?.activeOrders ?? 0}</strong>
              <em>{data.quickStats?.deliveredRate ?? 0}% delivered in range</em>
            </div>
          </div>

          {/* ── KPI cards ── */}
          <div className="dbk-grid">
            {cardCfg.map((cfg, i) => {
              const stat = data.cards[cfg.key] || {};
              const isLabel = cfg.key === 'mostOrderedFood' || cfg.key === 'bestSellingCategory';
              return (
                <DashboardKpiCard
                  key={cfg.key}
                  label={cfg.label}
                  value={cfg.fmt(stat.value)}
                  sub={isLabel && stat.sub ? `${stat.sub} orders` : undefined}
                  icon={cfg.icon}
                  gradient={cfg.grad}
                  change={stat.change}
                  delay={Math.min(i * 0.04, 0.4)}
                />
              );
            })}
          </div>

          {/* ── Revenue charts ── */}
          <div className="db-section-label">Revenue Analytics</div>
          <div className="db-charts-grid">
            <DashboardChart title="Daily Revenue" subtitle="Last 14 days">
              <Line data={{ labels: c?.dailyRevenue?.labels, datasets: [lineDataset('Revenue', c?.dailyRevenue?.data)] }} options={baseOptions()} />
            </DashboardChart>

            <DashboardChart title="Monthly Revenue" subtitle="Last 12 months">
              <Bar data={{ labels: c?.monthlyRevenue?.labels, datasets: [barDataset('Revenue', c?.monthlyRevenue?.data)] }} options={baseOptions()} />
            </DashboardChart>
          </div>

          <div className="db-charts-grid">
            <DashboardChart title="Weekly Revenue" subtitle="Last 8 weeks">
              <Bar data={{ labels: c?.weeklyRevenue?.labels, datasets: [barDataset('Revenue', c?.weeklyRevenue?.data, true)] }} options={baseOptions()} />
            </DashboardChart>

            <DashboardChart title="Daily Orders" subtitle="Last 14 days">
              <Bar data={{ labels: c?.dailyOrders?.labels, datasets: [barDataset('Orders', c?.dailyOrders?.data, true)] }} options={baseOptions()} />
            </DashboardChart>

            <DashboardChart title="Monthly Orders" subtitle="Last 12 months">
              <Line data={{ labels: c?.monthlyOrders?.labels, datasets: [lineDataset('Orders', c?.monthlyOrders?.data)] }} options={baseOptions()} />
            </DashboardChart>
          </div>

          {/* ── Popularity charts ── */}
          <div className="db-section-label">Popularity</div>
          <div className="db-charts-grid">
            <DashboardChart title="Popular Categories" subtitle="Units sold by category">
              <Doughnut
                data={{
                  labels: c?.popularCategories?.labels,
                  datasets: [{
                    data: c?.popularCategories?.data,
                    backgroundColor: barColors,
                    hoverOffset: 8,
                    borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: axisColor, font: { family: 'DM Sans', size: 11 }, boxWidth: 12, padding: 12 } },
                    tooltip: { backgroundColor: dark ? '#2a221a' : '#17120d', padding: 10, cornerRadius: 10, displayColors: true },
                  },
                }}
              />
            </DashboardChart>

            <DashboardChart title="Most Ordered Foods" subtitle="Top 8 by units sold">
              <Bar data={{ labels: c?.mostOrderedFoods?.labels, datasets: [barDataset('Units', c?.mostOrderedFoods?.data, true, true)] }} options={baseOptions(true)} />
            </DashboardChart>

            <DashboardChart title="New Customers" subtitle="Sign-ups per month">
              <Bar data={{ labels: c?.newCustomersPerMonth?.labels, datasets: [barDataset('Customers', c?.newCustomersPerMonth?.data, true)] }} options={baseOptions()} />
            </DashboardChart>
          </div>

          {/* ── Activity ── */}
          <div className="db-section-label">Recent Activity</div>
          <div className="db-activity-grid">
            {/* Latest Orders */}
            <div className="db-widget">
              <div className="db-widget-head">
                <div>
                  <h4>Latest Orders</h4>
                  <p>Most recent checkouts</p>
                </div>
                <FiClipboard />
              </div>
              <div className="db-widget-body">
                {filteredOrders.length === 0 ? (
                  <div className="db-widget-empty">No orders found</div>
                ) : filteredOrders.map((o, i) => {
                  const st = STATUS_META[o.status] || STATUS_META.Pending;
                  return (
                    <div className="db-widget-row" key={i}>
                      <div className="db-avatar">{initials(o.email)}</div>
                      <div className="db-widget-main">
                        <div className="db-widget-title">{o.email}</div>
                        <div className="db-widget-sub">{o.items} item{o.items !== 1 ? 's' : ''} · {fmtDateTime(o.date)}</div>
                      </div>
                      <div className="db-widget-side">
                        <div className="db-widget-amount">{fmtMoney(o.total)}</div>
                        <span className="db-badge" style={{ background: st.bg, color: st.color }}>{o.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="db-widget">
              <div className="db-widget-head">
                <div>
                  <h4>Recent Payments</h4>
                  <p>Latest transactions</p>
                </div>
                <FiDollarSign />
              </div>
              <div className="db-widget-body">
                {filteredPayments.length === 0 ? (
                  <div className="db-widget-empty">No payments found</div>
                ) : filteredPayments.map((p, i) => {
                  const pm = PAY_META[p.method] || PAY_META.cod;
                  return (
                    <div className="db-widget-row" key={i}>
                      <div className="db-avatar db-avatar-alt">{p.method === 'cod' ? 'C' : p.method === 'esewa' ? 'E' : 'K'}</div>
                      <div className="db-widget-main">
                        <div className="db-widget-title">{p.email}</div>
                        <div className="db-widget-sub">{fmtDateTime(p.date)}</div>
                      </div>
                      <div className="db-widget-side">
                        <div className="db-widget-amount">{fmtMoney(p.amount)}</div>
                        <span className="db-badge" style={{ background: pm.bg, color: pm.color }}>{pm.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest Users */}
            <div className="db-widget">
              <div className="db-widget-head">
                <div>
                  <h4>Latest Users</h4>
                  <p>Newest customer accounts</p>
                </div>
                <FiUsers />
              </div>
              <div className="db-widget-body">
                {filteredUsers.length === 0 ? (
                  <div className="db-widget-empty">No users found</div>
                ) : filteredUsers.map((u, i) => (
                  <div className="db-widget-row" key={i}>
                    <div className="db-avatar db-avatar-brand">{initials(u.name)}</div>
                    <div className="db-widget-main">
                      <div className="db-widget-title">{u.name}</div>
                      <div className="db-widget-sub">{u.email}</div>
                    </div>
                    <div className="db-widget-side">
                      <div className="db-widget-sub">{fmtDate(u.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Foods */}
            <div className="db-widget">
              <div className="db-widget-head">
                <div>
                  <h4>Low Stock Foods</h4>
                  <p>Items running low (≤ 10)</p>
                </div>
                <FiAlertTriangle />
              </div>
              <div className="db-widget-body">
                {filteredLowStock.length === 0 ? (
                  <div className="db-widget-empty">All items well stocked</div>
                ) : filteredLowStock.map((f, i) => (
                  <div className="db-widget-row" key={f._id || i}>
                    {f.img ? (
                      <img className="db-thumb" src={f.img} alt={f.name} onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                    ) : (
                      <div className="db-avatar">{initials(f.name)}</div>
                    )}
                    <div className="db-widget-main">
                      <div className="db-widget-title">{f.name}</div>
                      <div className="db-widget-sub">{f.CategoryName}</div>
                    </div>
                    <div className="db-widget-side">
                      <span className={`db-badge ${f.stock <= 5 ? 'db-badge-danger' : 'db-badge-warn'}`}>{f.stock} left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Reviews */}
            <div className="db-widget db-widget-wide">
              <div className="db-widget-head">
                <div>
                  <h4>Latest Reviews</h4>
                  <p>Most recent customer feedback</p>
                </div>
                <FiStar />
              </div>
              <div className="db-widget-body">
                {filteredReviews.length === 0 ? (
                  <div className="db-widget-empty">No reviews found</div>
                ) : filteredReviews.map((r, i) => (
                  <div className="db-widget-row" key={i}>
                    <div className="db-avatar db-avatar-gold">{initials(r.name)}</div>
                    <div className="db-widget-main">
                      <div className="db-widget-title">
                        {r.name} <span className="db-stars">{'★'.repeat(Math.min(r.rating || 5, 5))}</span>
                      </div>
                      <div className="db-widget-sub db-review-text">“{r.review}”</div>
                    </div>
                    <div className="db-widget-side">
                      <div className="db-widget-sub">{fmtDate(r.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
