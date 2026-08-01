import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiTag, FiClipboard, FiUsers,
  FiTrendingUp, FiSettings, FiLogOut, FiMenu, FiX, FiStar, FiMoon, FiSun
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/foods', label: 'Foods', icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiClipboard },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/revenue', label: 'Revenue', icon: FiTrendingUp },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings }
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('adminDark') === '1');

  useEffect(() => {
    const root = document.querySelector('.admin-root');
    if (root) root.classList.toggle('admin-dark', dark);
    document.body.classList.toggle('admin-dark', dark);
    localStorage.setItem('adminDark', dark ? '1' : '0');
    window.dispatchEvent(new CustomEvent('admin-theme', { detail: { dark } }));
    return () => document.body.classList.remove('admin-dark');
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = admin?.name
    ? admin.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const activeLink = links.find((l) => window.location.pathname.startsWith(l.to));

  return (
    <div className={`admin-root d-flex ${dark ? 'admin-dark' : ''}`}>
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand d-flex align-items-center justify-content-between">
          <div>
            <h4>Mitho</h4>
            <small>Admin Panel</small>
          </div>
          <button className="admin-sidebar-toggle d-lg-none text-light" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="admin-nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon /> {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-admin">
            <div className="admin-avatar">{initials}</div>
            <div>
              <div className="name">{admin?.name || 'Admin'}</div>
              <div className="email">{admin?.email || ''}</div>
            </div>
          </div>
          <button className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(250,247,242,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontWeight: 500, padding: '0.5rem' }}
            onClick={handleLogout}
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-main d-flex flex-column">
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="admin-sidebar-toggle d-lg-none" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h5>{activeLink?.label || 'Admin'}</h5>
          </div>
          <div className="d-none d-sm-flex align-items-center gap-2">
            <span className="admin-welcome">Signed in as <strong>{admin?.name}</strong></span>
            <button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {dark ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
