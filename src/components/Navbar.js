import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSignOutAlt, FaUser, FaMapMarkerAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useCart } from "./ContextReducer";
import { useUserAuth } from "../context/UserAuthContext";
import "./Navbar.css";

export default function Navbar() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartData = useCart() || [];
  const navigate = useNavigate();
  const { isLoggedIn, userEmail, logout } = useUserAuth();
  const userName = userEmail ? userEmail.split('@')[0] : "User";
  const userInitial = userName.charAt(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setPasswordMessage('Please log in again before changing your password.');
      return;
    }

    const payload = {
      currentPassword: passwordForm.currentPassword.trim(),
      newPassword: passwordForm.newPassword.trim()
    };

    if (!payload.currentPassword || !payload.newPassword) {
      setPasswordMessage('Please enter both your current and new password.');
      return;
    }

    const response = await fetch('http://localhost:5001/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authToken: token,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.success) {
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowPasswordModal(false);
      window.alert(data.message || 'Password updated successfully.');
    } else {
      setPasswordMessage(data.message || 'Password update failed');
    }
  };

  return (
    <>
    <div className="nb-sticky-wrap">
      {/* Top Bar */}
      <div className="nb-topbar">
        <div className="nb-topbar-left">
          <FaMapMarkerAlt />
          <span>Delivering to Kathmandu & Nearby Areas</span>
        </div>
        <div className="nb-topbar-divider" />
        <div className="nb-topbar-right">
          Free Delivery Above Rs.1000 &nbsp;|&nbsp; Open 9:00 AM - 11:00 PM
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="nb-nav">
        <div className="nb-inner">
          <Link className="nb-brand" to="/">
            <span className="nb-brand-icon">🍽️</span>
            GoFood
          </Link>

          <button
            className={`nb-toggler ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="nb-toggler-line" />
            <span className="nb-toggler-line" />
            <span className="nb-toggler-line" />
          </button>

          <div className={`nb-menu ${menuOpen ? 'open' : ''}`}>
            <Link className="nb-link active" to="/menu" onClick={() => setMenuOpen(false)}>
              Menu
            </Link>
            {isLoggedIn && (
              <Link className="nb-link" to="/myOrder" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
            )}
          </div>

          <div className={`nb-menu ${menuOpen ? 'open' : ''}`}>
            {!isLoggedIn ? (
              <div className="nb-auth-buttons">
                <Link to="/login" className="nb-btn nb-btn-primary">
                  <FaUser />
                  Login
                </Link>
                <Link to="/createuser" className="nb-btn nb-btn-outline">
                  Signup
                </Link>
              </div>
            ) : (
              <div className="nb-right">
                <div className="nb-user-info">
                  <div className="nb-user-avatar">{userInitial}</div>
                  <div className="nb-user-details">
                    <span className="nb-user-name">{userName}</span>
                    <span className="nb-user-email">{userEmail}</span>
                  </div>
                </div>

                <button
                  className="nb-btn nb-btn-ghost nb-cart-btn"
                  onClick={() => navigate('/cart')}
                >
                  <FaShoppingCart />
                  Cart
                  <span className="nb-cart-badge">{cartData.length}</span>
                </button>

                <button
                  className="nb-btn nb-btn-ghost"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Password
                </button>

                <button className="nb-btn nb-btn-outline" onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="nb-modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="nb-modal-title">Change Password</h3>

            {passwordMessage && (
              <div className={`nb-alert ${passwordMessage.toLowerCase().includes('incorrect') || passwordMessage.toLowerCase().includes('failed') ? 'nb-alert-error' : 'nb-alert-success'}`}>
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="nb-field" style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="nb-pw-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="nb-field" style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="nb-pw-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button className="nb-btn nb-btn-primary nb-btn-success" type="submit">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
