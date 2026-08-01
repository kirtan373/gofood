import React from 'react';

export function KpiSkeleton({ cards = 8 }) {
  return (
    <div className="dbk-grid">
      {Array.from({ length: cards }).map((_, i) => (
        <div className="db-skel db-skel-kpi" key={i}>
          <div className="db-skel-top">
            <div className="db-skel db-skel-line" style={{ width: '52%' }} />
            <div className="db-skel db-skel-icon" />
          </div>
          <div className="db-skel db-skel-line" style={{ width: '70%', height: 22, marginTop: 14 }} />
          <div className="db-skel db-skel-line" style={{ width: '40%', marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ cards = 4 }) {
  return (
    <div className="db-charts-grid">
      {Array.from({ length: cards }).map((_, i) => (
        <div className="db-chart-card db-skel-chart" key={i}>
          <div className="db-skel db-skel-line" style={{ width: '38%' }} />
          <div className="db-skel-block" />
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton({ cards = 5 }) {
  return (
    <div className="db-activity-grid">
      {Array.from({ length: cards }).map((_, i) => (
        <div className="db-chart-card" key={i}>
          <div className="db-skel db-skel-line" style={{ width: '42%' }} />
          {Array.from({ length: 4 }).map((__, j) => (
            <div className="db-skel-row" key={j}>
              <div className="db-skel db-skel-avatar" />
              <div className="db-skel-lines">
                <div className="db-skel db-skel-line" style={{ width: '75%' }} />
                <div className="db-skel db-skel-line" style={{ width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
