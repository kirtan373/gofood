import React from 'react';
import FoodTile from './FoodTile';
import { getRecentViews } from '../utils/recentlyViewed';

export default function RecentlyViewed({ foodItems }) {
  if (!foodItems || foodItems.length === 0) return null;

  const recentIds = getRecentViews().slice(0, 8);
  if (recentIds.length === 0) return null;

  const items = recentIds
    .map((r) => foodItems.find((f) => f._id === r.id))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <section className="lp-section" style={{ padding: '40px 0 0' }}>
      <div className="lp-container">
        <div className="gf-row-header">
          <div>
            <span className="gf-row-label">Jump back in</span>
            <h2 className="gf-row-title">Recently Viewed</h2>
          </div>
        </div>
        <div className="gf-scroll-row">
          {items.map((item) => (
            <FoodTile key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
