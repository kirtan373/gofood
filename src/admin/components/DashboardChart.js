import React from 'react';

export default function DashboardChart({ title, subtitle, children }) {
  return (
    <div className="db-chart-card">
      <div className="db-chart-head">
        <h4>{title}</h4>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="db-chart-body">{children}</div>
    </div>
  );
}
