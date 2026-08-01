import React from 'react';

export function SkeletonCard() {
  return (
    <div className="gf-skeleton-card">
      <div className="gf-skeleton gf-skeleton--image" />
      <div className="gf-skeleton-body">
        <div className="gf-skeleton gf-skeleton--line short" />
        <div className="gf-skeleton gf-skeleton--line" />
        <div className="gf-skeleton gf-skeleton--line short" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-3">
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRow({ count = 5 }) {
  return (
    <div className="gf-scroll-row">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="gf-skeleton-card">
          <div className="gf-skeleton gf-skeleton--image" style={{ height: '160px' }} />
          <div className="gf-skeleton-body">
            <div className="gf-skeleton gf-skeleton--line short" />
            <div className="gf-skeleton gf-skeleton--line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 76 }) {
  return (
    <div
      className="gf-skeleton gf-skeleton--circle"
      style={{ width: size, height: size, margin: '0 auto 16px' }}
    />
  );
}
