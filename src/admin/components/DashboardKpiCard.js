import React from 'react';

const TrendBadge = ({ change }) => {
  if (change === null || change === undefined) {
    return <span className="dbk-trend dbk-trend-none">—</span>;
  }
  const up = change >= 0;
  return (
    <span className={`dbk-trend ${up ? 'dbk-trend-up' : 'dbk-trend-down'}`}>
      {up ? '▲' : '▼'} {Math.abs(change)}%
    </span>
  );
};

export default function DashboardKpiCard({ label, value, sub, icon: Icon, gradient, change, delay = 0 }) {
  return (
    <div className="dbk-card" style={{ '--dbk-grad': gradient, animationDelay: `${delay}s` }}>
      <div className="dbk-top">
        <div className="dbk-label">{label}</div>
        {Icon && (
          <div className="dbk-icon">
            <Icon />
          </div>
        )}
      </div>
      <div className="dbk-value" title={String(value)}>{value}</div>
      {sub !== undefined && sub !== null ? <div className="dbk-sub">{sub}</div> : null}
      <div className="dbk-foot">
        <TrendBadge change={change} />
        {change !== null && change !== undefined && <span className="dbk-vs">vs prev. period</span>}
      </div>
      <div className="dbk-glow" />
    </div>
  );
}
