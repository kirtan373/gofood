import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import { usePageMeta } from '../utils/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: 'Page Not Found | Mitho',
    description: 'The page you are looking for could not be found.',
  });

  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h2>Oops! Page not found</h2>
      <p>
        The page you are looking for may have been moved or never existed.
        Let's get you back to delicious food.
      </p>
      <Link to="/" className="lp-btn">
        <FaUtensils /> Back to Home
      </Link>
    </div>
  );
}
