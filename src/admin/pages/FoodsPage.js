import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiEye, FiEyeOff,
  FiStar, FiFlag, FiTrendingUp, FiMoreVertical, FiZap
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';
import ImageUploader from '../components/ImageUploader';
import ImageGallery from '../components/ImageGallery';
import AdminPagination from '../components/AdminPagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import '../management.css';

const emptyForm = {
  name: '', CategoryName: '', price: '', description: '',
  ingredients: '', calories: '', prepTime: '', availability: true, stock: 50,
  img: '', images: []
};
const emptyOption = () => ({ key: '', value: '' });

const Flag = ({ children }) => (
  <span className="mg-flag-chip" style={{ fontWeight: 700 }}>{children}</span>
);

export default function FoodsPage() {
  const { token } = useAdminAuth();
  const addToast = useToast();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibility, setVisibility] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState([emptyOption()]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async (quiet) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        search, category: selectedCategory, visibility,
        page: String(page), limit: String(limit)
      });
      const data = await adminApi.get(`/admin/foods?${qs}`, token);
      setFoods(data.foods || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load foods');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [token, search, selectedCategory, visibility, page, limit]);

  useEffect(() => { if (token) loadData(); }, [loadData, token]);

  const optionsObjectToRows = (opts) => {
    if (!opts || typeof opts !== 'object' || Object.keys(opts).length === 0) return [emptyOption()];
    return Object.keys(opts).map((key) => ({ key, value: String(opts[key]) }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOptions([emptyOption()]);
    setShowModal(true);
  };

  const openEditModal = (food) => {
    setEditingId(food._id);
    setForm({
      name: food.name || '',
      CategoryName: food.CategoryName || '',
      price: food.price ?? '',
      description: food.description || '',
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : (food.ingredients || ''),
      calories: food.calories ?? '',
      prepTime: food.prepTime || '',
      availability: food.availability !== false,
      stock: food.stock ?? 50,
      img: food.img || '',
      images: Array.isArray(food.images) ? food.images : []
    });
    setOptions(optionsObjectToRows(food.options));
    setShowModal(true);
  };

  const updateOptionRow = (index, field, value) => {
    setOptions((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addOptionRow = () => setOptions((prev) => [...prev, emptyOption()]);
  const removeOptionRow = (index) => {
    setOptions((prev) => (prev.length === 1 ? [emptyOption()] : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const optionsObject = {};
    options.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      if (trimmedKey && value !== '') optionsObject[trimmedKey] = value;
    });
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      calories: form.calories === '' ? null : Number(form.calories) || 0,
      stock: Number(form.stock),
      ingredients: form.ingredients,
      options: optionsObject
    };
    try {
      if (editingId) {
        await adminApi.put(`/admin/foods/${editingId}`, payload, token);
        addToast('Food updated successfully');
      } else {
        await adminApi.post('/admin/foods', payload, token);
        addToast('Food added successfully');
      }
      setShowModal(false);
      setForm(emptyForm);
      setOptions([emptyOption()]);
      setEditingId(null);
      loadData(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save food item');
      addToast(err instanceof ApiError ? err.message : 'Failed to save food item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await adminApi.delete(`/admin/foods/${deleteTarget._id}`, token);
      addToast('Food deleted');
      setDeleteTarget(null);
      loadData(true);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to delete food item', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleFlag = async (food, flag, value) => {
    setBusyId(food._id);
    try {
      await adminApi.patch(`/admin/foods/${food._id}/flag`, { flag, value }, token);
      const label = flag.replace('is', '').replace(/([A-Z])/g, ' $1').toLowerCase();
      addToast(value ? `${food.name} marked as ${label}` : `${food.name} unmarked (${label})`);
      loadData(true);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update food', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleHidden = async (food) => {
    const next = !food.isHidden;
    setBusyId(food._id);
    try {
      await adminApi.patch(`/admin/foods/${food._id}/flag`, { flag: 'isHidden', value: next }, token);
      addToast(next ? `${food.name} hidden from store` : `${food.name} restored to store`);
      loadData(true);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update food', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const flagDefs = [
    { key: 'isBestSeller', label: 'Best Seller', icon: FiStar, cls: 'mg-flag-best' },
    { key: 'isTodaysSpecial', label: "Today's Special", icon: FiZap, cls: 'mg-flag-special' },
    { key: 'isFeatured', label: 'Featured', icon: FiFlag, cls: 'mg-flag-featured' },
    { key: 'isTrending', label: 'Trending', icon: FiTrendingUp, cls: 'mg-flag-trending' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="admin-section-title mb-0">Food Management</h2>
        <button className="btn btn-admin-primary text-white d-flex align-items-center gap-2" onClick={openAddModal}>
          <FiPlus /> Add Food
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card mb-3">
        <div className="mg-filter-bar">
          <div className="mg-search">
            <FiSearch />
            <input
              className="form-control"
              placeholder="Search food by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="form-select mg-filter-select"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => <option key={cat._id} value={cat.CategoryName}>{cat.CategoryName}</option>)}
          </select>
          <select
            className="form-select mg-filter-select"
            value={visibility}
            onChange={(e) => { setVisibility(e.target.value); setPage(1); }}
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          <span className="mg-filter-count"><strong>{total}</strong> items</span>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-body p-0">
          {loading ? (
            <div>
              {[0, 1, 2, 3].map((i) => (
                <div className="mg-skel-row" key={i}>
                  <div className="mg-skel mg-skel-img" />
                  <div className="flex-grow-1">
                    <div className="mg-skel mg-skel-line" style={{ width: '40%', marginBottom: 8 }} />
                    <div className="mg-skel mg-skel-line" style={{ width: '22%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : foods.length === 0 ? (
            <div className="admin-empty-state">
              <FiImage size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No food items found</div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Sizes &amp; Prices</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => {
                      return (
                        <tr key={food._id} className={food.isHidden ? 'mg-row-hidden' : ''}>
                          <td>
                            {food.img ? (
                              <img src={food.img} alt={food.name} className="mg-thumb" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                            ) : (
                              <div className="mg-thumb-empty"><FiImage /></div>
                            )}
                          </td>
                          <td>
                            <div className="mg-cell-main">{food.name}</div>
                            <div className="mg-flags">
                              {food.isHidden && <Flag><span className="mg-flag-chip mg-flag-hidden"><FiEyeOff /> Hidden</span></Flag>}
                              {flagDefs.filter((f) => food[f.key]).map((f) => (
                                <span key={f.key} className={`mg-flag-chip ${f.cls}`}>{f.label}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span style={{ background: 'var(--admin-accent-light)', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                              {food.CategoryName}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Rs. {food.price || 0}</span>
                          </td>
                          <td>
                            {food.options && Object.keys(food.options).length > 0 ? (
                              <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 220 }}>
                                {Object.entries(food.options).map(([size, amt]) => (
                                  <span key={size} className="admin-size-badge">{size}: Rs. {amt}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>---</span>
                            )}
                          </td>
                          <td>
                            {(() => {
                              const stock = food.stock ?? 50;
                              const low = stock <= 10;
                              return (
                                <span className="badge-status" style={{ background: low ? '#fee2e2' : '#d1fae5', color: low ? '#b91c1c' : '#047857' }}>
                                  {stock} {low ? '· Low' : ''}
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            {food.isHidden ? (
                              <span className="mg-badge mg-badge-gray"><FiEyeOff /> Hidden</span>
                            ) : food.availability === false ? (
                              <span className="mg-badge mg-badge-amber">Unavailable</span>
                            ) : (
                              <span className="mg-badge mg-badge-green">Active</span>
                            )}
                          </td>
                          <td className="text-end">
                            <Dropdown align="end" className="mg-actions">
                              <Dropdown.Toggle size="sm" disabled={busyId === food._id}>
                                <FiMoreVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => openEditModal(food)}><FiEdit2 /> Edit</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleToggleHidden(food)}>
                                  {food.isHidden ? <FiEye /> : <FiEyeOff />} {food.isHidden ? 'Restore' : 'Hide'}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {flagDefs.map((f) => {
                                  const Icon = f.icon;
                                  return (
                                    <Dropdown.Item
                                      key={f.key}
                                      active={!!food[f.key]}
                                      onClick={() => toggleFlag(food, f.key, !food[f.key])}
                                    >
                                      <Icon /> {f.label}
                                    </Dropdown.Item>
                                  );
                                })}
                                <Dropdown.Divider />
                                <Dropdown.Item className="danger" onClick={() => setDeleteTarget(food)}><FiTrash2 /> Delete</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                page={page} pages={pages} total={total} pageSize={limit}
                onPage={setPage} onPageSize={(n) => { setLimit(n); setPage(1); }}
                pageSizeOptions={[10, 12, 20, 50]}
              />
            </>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" dialogClassName="mg-food-modal">
        <Modal.Header closeButton>
          <Modal.Title className="mg-modal-title">{editingId ? 'Edit Food' : 'Add Food'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="mg-form-scroll">
              <div className="mg-modal-grid">
                <div className="mg-modal-col">
              <div className="mg-section">
                <div className="mg-section-title">Basic Information</div>
                <div className="mg-grid-2 mb-3">
                  <div className="mg-field">
                    <label className="mg-label">Name <span className="mg-req">*</span></label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Pepperoni Pizza" />
                  </div>
                  <div className="mg-field">
                    <label className="mg-label">Category <span className="mg-req">*</span></label>
                    <select className="form-select" value={form.CategoryName} onChange={(e) => setForm({ ...form, CategoryName: e.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map((cat) => <option key={cat._id} value={cat.CategoryName}>{cat.CategoryName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

                <div className="mg-section">
                  <div className="mg-section-title">Pricing</div>
                  <div className="mb-3">
                    <div className="mg-field">
                      <label className="mg-label">Price (Rs.)</label>
                      <input className="form-control" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                <div className="mb-0">
                  <label className="mg-label">Sizes &amp; Prices <span className="mg-label-hint">· leave blank for a single price</span></label>
                  <div className="mg-opt-rows">
                    {options.map((row, index) => (
                      <div className="mg-opt-row" key={index}>
                        <input className="form-control" placeholder="e.g. Regular" value={row.key} onChange={(e) => updateOptionRow(index, 'key', e.target.value)} />
                        <input className="form-control" type="number" min="0" placeholder="Price" value={row.value} onChange={(e) => updateOptionRow(index, 'value', e.target.value)} />
                        <button type="button" className="mg-opt-remove" aria-label="Remove size" onClick={() => removeOptionRow(index)}><FiTrash2 /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mg-opt-add" onClick={addOptionRow}><FiPlus /> Add size</button>
                </div>
              </div>

              <div className="mg-section">
                <div className="mg-section-title">Nutrition &amp; Details</div>
                <div className="mg-grid-2 mb-3">
                  <div className="mg-field">
                    <label className="mg-label">Calories (kcal)</label>
                    <input className="form-control" type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="Optional" />
                  </div>
                  <div className="mg-field">
                    <label className="mg-label">Preparation Time</label>
                    <input className="form-control" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} placeholder="e.g. 20 mins" />
                  </div>
                </div>
                <div className="mb-0">
                  <label className="mg-label">Ingredients</label>
                  <input className="form-control" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder="Comma separated, e.g. cheese, tomato, basil" />
                </div>
              </div>

              <div className="mg-section">
                <div className="mg-section-title">Inventory</div>
                <div className="mg-grid-2 mb-0">
                  <div className="mg-field">
                    <label className="mg-label">Stock Quantity</label>
                    <input className="form-control" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                  <div className="mg-field">
                    <label className="mg-label">Availability</label>
                    <div className="mg-avail">
                      <label className="mg-switch mb-0">
                        <input type="checkbox" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} />
                        <span className="mg-switch-slider" />
                      </label>
                      <span className={`mg-avail-text ${form.availability ? 'on' : ''}`}>
                        {form.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mg-section">
                <div className="mg-section-title">Description</div>
                <div className="mb-0">
                  <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the dish..." />
                </div>
              </div>
                </div>

                <div className="mg-modal-col mg-media-col">
              <div className="mg-section">
                <div className="mg-section-title">Media</div>
                <ImageUploader
                  label="Thumbnail Image"
                  value={form.img}
                  onChange={(url) => setForm({ ...form, img: url })}
                  token={token}
                  help="Shown on the storefront card and product page."
                />
                <ImageGallery
                  images={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                  thumbnail={form.img}
                onThumbnailChange={(url) => setForm({ ...form, img: url })}
                token={token}
              />
            </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="mg-btn-ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="btn-admin-primary text-white border-0" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Food'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Food"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name || 'this food item'}? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
