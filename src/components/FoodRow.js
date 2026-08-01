import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import FoodTile from './FoodTile';
import { SkeletonRow } from './Skeleton';

export default function FoodRow({ label, title, items, linkText, linkTo, badge, loading, id }) {
  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section id={id} className="lp-section" style={{ padding: '56px 0' }}>
      <div className="lp-container">
        <div className="gf-row-header">
          <div>
            {label && <span className="gf-row-label">{label}</span>}
            <h2 className="gf-row-title">{title}</h2>
          </div>
          {linkText && linkTo && (
            <Link className="gf-row-link" to={linkTo}>
              {linkText} <FaArrowRight />
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="gf-scroll-row">
            {items.map((item) => (
              <FoodTile key={item._id} item={item} badge={badge} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
