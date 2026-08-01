import React from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUtensils,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h2 className="footer-logo">
            <FaUtensils className="me-2" />
            Mitho
          </h2>

          <p className="footer-description">
            Fresh food delivered fast at your doorstep.
            Experience premium taste with quick delivery and
            excellent customer service.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>

          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/myOrder">My Orders</Link>
          <Link to="/login">Login</Link>
          <Link to="/createuser">Signup</Link>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>

          <p>
            <FaEnvelope className="footer-icon" />
            mitho000@gmail.com
          </p>

          <p>
            <FaPhoneAlt className="footer-icon" />
            +977-9843965533
          </p>

          <p>
            <FaMapMarkerAlt className="footer-icon" />
            Bhaktapur, Nepal
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Mitho | Designed & Developed by <strong>Kirtan</strong>
      </div>
    </footer>
  );
}