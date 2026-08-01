import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Compact page-number pagination used across the admin list pages.
export default function AdminPagination({ page, pages, total, pageSize, onPage, onPageSize, pageSizeOptions }) {
  if (!total) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mg-pagination">
      <span className="mg-pagination-info">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>
      </span>
      <div className="mg-pagination-controls">
        <button className="mg-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <FiChevronLeft />
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            className={`mg-page-btn ${n === page ? 'active' : ''}`}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button className="mg-page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <FiChevronRight />
        </button>
      </div>
      {pageSizeOptions && (
        <select className="form-select form-select-sm mg-page-size" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {pageSizeOptions.map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      )}
    </div>
  );
}
