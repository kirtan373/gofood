import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

export default function CategoriesPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('🍽️');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const quickIcons = ['🍕', '🍔', '🥟', '🍰', '🥤', '🍗', '🍝', '🥪', '🍟', '🍛', '🍣', '🌮', '🥗', '🍜', '🍱', '🍩', '🍪', '☕', '🧋', '🍰', '🍽️'];

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/categories', token);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/categories', { CategoryName: name, icon }, token);
      setName('');
      setIcon('🍽️');
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setEditName(cat.CategoryName);
    setEditIcon(cat.icon || '🍽️');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.put(`/admin/categories/${editing._id}`, { CategoryName: editName, icon: editIcon }, token);
      setEditing(null);
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/admin/categories/${deleteTarget._id}`, token);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <h2 className="admin-section-title mb-4">Category Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="admin-card">
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Add Category</h5>
              <form onSubmit={handleAdd}>
                <div className="mb-2">
                  <label className="form-label">Category Name</label>
                  <input className="form-control" placeholder="e.g. Mo:Mo, Pizza, Biryani" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Icon (Emoji)</label>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {quickIcons.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`admin-emoji-btn ${icon === emoji ? 'active' : ''}`}
                        onClick={() => setIcon(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input className="form-control" placeholder="Or type any emoji" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} />
                </div>
                <button className="btn btn-admin-primary text-white w-100" disabled={saving}>
                  <FiPlus className="me-1" /> {saving ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="admin-card">
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>All Categories ({categories.length})</h5>
              {loading ? (
                <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#10b981' }} role="status" /></div>
              ) : categories.length === 0 ? (
                <div className="admin-empty-state">
                  <FiTag size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div>No categories yet</div>
                </div>
              ) : (
                <div className="row g-2">
                  {categories.map((cat) => (
                    <div key={cat._id} className="col-md-6">
                      <div className="admin-category-card">
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          <span style={{ fontSize: '1.2rem', marginRight: 6 }}>{cat.icon || '🍽️'}</span>
                          {cat.CategoryName}
                        </span>
                        <div>
                          <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(cat)}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(cat)}><FiTrash2 /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal show={!!editing} onHide={() => setEditing(null)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Category</Modal.Title></Modal.Header>
        <form onSubmit={handleEditSave}>
          <Modal.Body>
            <div className="mb-2">
              <label className="form-label">Category Name</label>
              <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Icon (Emoji)</label>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {quickIcons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`admin-emoji-btn ${editIcon === emoji ? 'active' : ''}`}
                    onClick={() => setEditIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input className="form-control" placeholder="Or type any emoji" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} maxLength={4} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" className="btn-admin-primary text-white border-0" disabled={saving}>Save</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Category</Modal.Title></Modal.Header>
        <Modal.Body>Delete <strong>{deleteTarget?.CategoryName}</strong>? Foods in this category will keep the old category name.</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
