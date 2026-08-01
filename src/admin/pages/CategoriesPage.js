import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiSearch, FiEye, FiEyeOff, FiHash } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import ImageUploader from '../components/ImageUploader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import '../management.css';

const quickIcons = ['🍕', '🍔', '🥟', '🍰', '🥤', '🍗', '🍝', '🥪', '🍟', '🍛', '🍣', '🌮', '🥗', '🍜', '🍱', '🍩', '🍪', '☕', '🧋', '🍽️'];

const formatDate = (d) => {
  if (!d) return '---';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function CategoriesPage() {
  const { token } = useAdminAuth();
  const addToast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState(999);

  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('🍽️');
  const [editImage, setEditImage] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState(999);
  const [editIsHidden, setEditIsHidden] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async () => {
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
  }, [token]);

  useEffect(() => { if (token) loadData(); }, [token, loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => !q || (c.CategoryName || '').toLowerCase().includes(q));
  }, [categories, search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/categories', { CategoryName: name, icon, image, displayOrder }, token);
      addToast('Category created');
      setName('');
      setIcon('🍽️');
      setImage('');
      setDisplayOrder(999);
      loadData();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to add category', 'error');
      setError(err instanceof ApiError ? err.message : 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setEditName(cat.CategoryName);
    setEditIcon(cat.icon || '🍽️');
    setEditImage(cat.image || '');
    setEditDisplayOrder(cat.displayOrder ?? 999);
    setEditIsHidden(!!cat.isHidden);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.put(`/admin/categories/${editing._id}`, {
        CategoryName: editName,
        icon: editIcon,
        image: editImage,
        displayOrder: editDisplayOrder,
        isHidden: editIsHidden
      }, token);
      addToast('Category updated');
      setEditing(null);
      loadData();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update category', 'error');
      setError(err instanceof ApiError ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await adminApi.delete(`/admin/categories/${deleteTarget._id}`, token);
      addToast('Category deleted');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to delete category', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleHidden = async (cat) => {
    setBusyId(cat._id);
    try {
      await adminApi.patch(`/admin/categories/${cat._id}/flag`, { flag: 'isHidden', value: !cat.isHidden }, token);
      addToast(cat.isHidden ? `${cat.CategoryName} restored` : `${cat.CategoryName} hidden`);
      loadData();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update category', 'error');
    } finally {
      setBusyId(null);
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
                <div className="mb-3">
                  <label className="mg-label">Category Name</label>
                  <input className="form-control" placeholder="e.g. Mo:Mo, Pizza, Biryani" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="mg-label">Display Order</label>
                  <input className="form-control" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
                  <small className="mg-help-text">Lower numbers appear first on the storefront.</small>
                </div>
                <div className="mb-3">
                  <label className="mg-label">Icon (Emoji)</label>
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
                <ImageUploader
                  label="Category Image"
                  value={image}
                  onChange={setImage}
                  token={token}
                  help="Optional — shown on the category card."
                />
                <button className="btn btn-admin-primary text-white w-100" disabled={saving}>
                  <FiPlus className="me-1" /> {saving ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="admin-card mb-3">
            <div className="mg-filter-bar">
              <div className="mg-search">
                <FiSearch />
                <input
                  className="form-control"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span className="mg-filter-count"><strong>{filtered.length}</strong> of {categories.length} categories</span>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-body" style={{ padding: '1.25rem' }}>
              {loading ? (
                <div>
                  {[0, 1, 2].map((i) => (
                    <div className="mg-skel-row" key={i}>
                      <div className="mg-skel mg-skel-img" />
                      <div className="flex-grow-1">
                        <div className="mg-skel mg-skel-line" style={{ width: '35%', marginBottom: 8 }} />
                        <div className="mg-skel mg-skel-line" style={{ width: '18%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="admin-empty-state">
                  <FiTag size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div>No categories found</div>
                </div>
              ) : (
                <div className="row g-3">
                  {filtered.map((cat) => (
                    <div key={cat._id} className="col-md-6 col-xl-4">
                      <div className={`mg-cat-card ${cat.isHidden ? 'hidden' : ''}`}>
                        <div className="mg-cat-img-wrap">
                          {cat.image ? (
                            <img className="mg-cat-img" src={cat.image} alt={cat.CategoryName} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="mg-cat-img-fallback">{cat.icon || '🍽️'}</div>
                          )}
                          {cat.isHidden && (
                            <span className="mg-cat-hidden-tag"><FiEyeOff /> Hidden</span>
                          )}
                        </div>
                        <div className="mg-cat-body">
                          <div className="mg-cat-name">
                            <span>{cat.icon || '🍽️'}</span> {cat.CategoryName}
                          </div>
                          <div className="mg-cat-meta">
                            <span className="mg-badge mg-badge-violet">{cat.foodCount} foods</span>
                            {cat.isHidden ? (
                              <span className="mg-badge mg-badge-gray">Hidden</span>
                            ) : (
                              <span className="mg-badge mg-badge-green">Visible</span>
                            )}
                          </div>
                          <div className="mg-cat-meta" style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><FiHash /> Order {cat.displayOrder ?? 999}</span>
                            <span>Added {formatDate(cat.createdAt)}</span>
                          </div>
                          <div className="mg-cat-actions">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(cat)}>
                              <FiEdit2 /> Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              disabled={busyId === cat._id}
                              onClick={() => toggleHidden(cat)}
                            >
                              {cat.isHidden ? <><FiEye /> Restore</> : <><FiEyeOff /> Hide</>}
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(cat)}>
                              <FiTrash2 />
                            </button>
                          </div>
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
        <Modal.Header closeButton><Modal.Title className="mg-modal-title">Edit Category</Modal.Title></Modal.Header>
        <form onSubmit={handleEditSave}>
          <Modal.Body>
            <div className="mb-3">
              <label className="mg-label">Category Name</label>
              <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="mg-label">Display Order</label>
              <input className="form-control" type="number" min="0" value={editDisplayOrder} onChange={(e) => setEditDisplayOrder(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="mg-label">Icon (Emoji)</label>
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
            <ImageUploader
              label="Category Image"
              value={editImage}
              onChange={setEditImage}
              token={token}
            />
            <div className="d-flex align-items-center gap-2">
              <label className="mg-switch mb-0">
                <input type="checkbox" checked={editIsHidden} onChange={(e) => setEditIsHidden(e.target.checked)} />
                <span className="mg-switch-slider" />
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                {editIsHidden ? 'Hidden from store' : 'Visible on store'}
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" className="btn-admin-primary text-white border-0" disabled={saving}>Save</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete ${deleteTarget?.CategoryName || 'this category'}? Foods in this category will keep the old category name.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
