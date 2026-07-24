import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiTrendingUp } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RevenuePage() {
  const { token } = useAdminAuth();
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.get('/admin/revenue', token);
        setRevenue(data.revenue);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load revenue');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const last7 = revenue?.last7Days || [];
  const chartData = {
    labels: last7.map((d) => d.day.slice(5)),
    datasets: [{
      label: 'Revenue (Rs.)',
      data: last7.map((d) => d.total),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      hoverBackgroundColor: '#10b981',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
      }
    }
  };

  return (
    <div>
      <h2 className="admin-section-title mb-4">Revenue</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#10b981' }} role="status" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: 'Last 7 Days', value: revenue?.totalLast7 || 0, color: '#10b981' },
              { label: 'Last 30 Days', value: revenue?.totalLast30 || 0, color: '#6366f1' },
              { label: 'All Time', value: revenue?.totalAllTime || 0, color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} className="col-md-4">
                <div className="admin-revenue-card" style={{ borderLeft: `3px solid ${item.color}` }}>
                  <div className="admin-revenue-label">{item.label}</div>
                  <div className="admin-revenue-value">Rs. {item.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Daily Revenue (Last 7 Days)</h5>
            {last7.length === 0 ? (
              <div className="admin-empty-state">
                <FiTrendingUp size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>No revenue recorded yet</div>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
