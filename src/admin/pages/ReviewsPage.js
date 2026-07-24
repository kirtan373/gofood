import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiSearch, FiTrash2, FiStar } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

export default function ReviewsPage() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/reviews', token);
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/admin/reviews/${deleteTarget._id}`, token);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete review');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredReviews = reviews.filter((r) =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.review || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <div>
      <h2 className="admin-section-title mb-4">Review Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="admin-review-stat">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-review-stat">
            <div className="stat-value" style={{ color: '#f59e0b' }}>{avgRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-review-stat">
            <div className="stat-value" style={{ color: '#10b981' }}>{fiveStarCount}</div>
            <div className="stat-label">5-Star Reviews</div>
          </div>
        </div>
      </div>

      <div className="admin-card mb-3">
        <div className="card-body admin-search-bar">
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input className="form-control" style={{ paddingLeft: '2.25rem' }} placeholder="Search by name, email, or review..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-body">
          {loading ? (
            <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#10b981' }} role="status" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="admin-empty-state">
              <FiStar size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No reviews found</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review._id}>
                      <td style={{ fontWeight: 600 }}>{review.name}</td>
                      <td style={{ color: '#64748b' }}>{review.email}</td>
                      <td>
                        <span style={{ display: 'inline-flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} style={{ color: s <= review.rating ? '#f59e0b' : '#e2e8f0', fontSize: '0.85rem' }}>★</span>
                          ))}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', color: '#475569', fontSize: '0.85rem' }}>
                        {review.review.length > 80 ? `${review.review.slice(0, 80)}...` : review.review}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(review)}><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Review</Modal.Title></Modal.Header>
        <Modal.Body>Delete review by <strong>{deleteTarget?.name}</strong>? This cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
