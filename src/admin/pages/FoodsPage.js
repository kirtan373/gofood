import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, ApiError } from '../utils/api';

const emptyForm = { name: '', CategoryName: '', price: '', description: '', img: '' };
const emptyOption = () => ({ key: '', value: '' });

export default function FoodsPage() {
  const { token } = useAdminAuth();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState([emptyOption()]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.get('/admin/foods', token);
      setFoods(data.foods || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

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
    setForm({ name: food.name || '', CategoryName: food.CategoryName || '', price: food.price ?? '', description: food.description || '', img: food.img || '' });
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
    const payload = { ...form, price: Number(form.price) || 0, options: optionsObject };
    try {
      if (editingId) {
        await adminApi.put(`/admin/foods/${editingId}`, payload, token);
      } else {
        await adminApi.post('/admin/foods', payload, token);
      }
      setShowModal(false);
      setForm(emptyForm);
      setOptions([emptyOption()]);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save food item');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/admin/foods/${deleteTarget._id}`, token);
      setFoods((prev) => prev.filter((f) => f._id !== deleteTarget._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete food item');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredFoods = useMemo(() => foods.filter((food) => {
    const matchesSearch = (food.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.CategoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [foods, search, selectedCategory]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="admin-section-title mb-0">Food Management</h2>
        <button className="btn btn-admin-primary text-white d-flex align-items-center gap-2" onClick={openAddModal}>
          <FiPlus /> Add Food
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card mb-3">
        <div className="card-body admin-search-bar">
          <div className="row g-2">
            <div className="col-md-5">
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="form-control" style={{ paddingLeft: '2.25rem' }} placeholder="Search food by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-5">
              <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((cat) => <option key={cat._id} value={cat.CategoryName}>{cat.CategoryName}</option>)}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-center justify-content-end">
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <strong style={{ color: '#1e293b' }}>{filteredFoods.length}</strong> items
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-body">
          {loading ? (
            <div className="admin-empty-state"><div className="spinner-border" style={{ color: '#10b981' }} role="status" /></div>
          ) : filteredFoods.length === 0 ? (
            <div className="admin-empty-state">
              <FiImage size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No food items found</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Sizes &amp; Prices</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food) => (
                    <tr key={food._id}>
                      <td>
                        {food.img ? (
                          <img src={food.img} alt={food.name} className="admin-food-thumb" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                        ) : (
                          <div className="admin-food-thumb d-flex align-items-center justify-content-center" style={{ color: '#94a3b8' }}><FiImage /></div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{food.name}</td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500 }}>
                          {food.CategoryName}
                        </span>
                      </td>
                      <td>
                        {food.options && Object.keys(food.options).length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {Object.entries(food.options).map(([size, amt]) => (
                              <span key={size} className="admin-size-badge">
                                {size}: Rs. {amt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>Rs. {food.price || 0}</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '260px', color: '#64748b', fontSize: '0.85rem' }}>
                        {food.description ? (food.description.length > 60 ? `${food.description.slice(0, 60)}...` : food.description) : '---'}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditModal(food)}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(food)}><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Food' : 'Add Food'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.CategoryName} onChange={(e) => setForm({ ...form, CategoryName: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat._id} value={cat.CategoryName}>{cat.CategoryName}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Base Price (Rs.)</label>
              <input className="form-control" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Sizes &amp; Prices</label>
              {options.map((row, index) => (
                <div className="d-flex gap-2 mb-2" key={index}>
                  <input className="form-control" placeholder="e.g. Regular" value={row.key} onChange={(e) => updateOptionRow(index, 'key', e.target.value)} />
                  <input className="form-control" type="number" min="0" placeholder="Price" style={{ maxWidth: '140px' }} value={row.value} onChange={(e) => updateOptionRow(index, 'value', e.target.value)} />
                  <Button variant="outline-danger" size="sm" type="button" onClick={() => removeOptionRow(index)}><FiTrash2 /></Button>
                </div>
              ))}
              <Button variant="outline-secondary" size="sm" type="button" onClick={addOptionRow}><FiPlus /> Add size</Button>
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Image URL</label>
              <input className="form-control" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} placeholder="https://..." />
              {form.img && <img src={form.img} alt="preview" className="img-fluid rounded mt-2" style={{ maxHeight: '140px' }} />}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="btn-admin-primary text-white border-0" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Food'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Food</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
