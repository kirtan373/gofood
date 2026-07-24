import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/context/AdminAuthContext";
import { useUserAuth } from "../context/UserAuthContext";
import { adminApi } from "../admin/utils/api";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
  const { login: loginAdmin } = useAdminAuth();
  const { login: loginUser, blockedMessage } = useUserAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/loginuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setError(json.message || json.errors || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (json.role === "admin") {
        const data = await adminApi.post("/admin/login", {
          email: credentials.email,
          password: credentials.password,
        });
        loginAdmin(data.admin, data.token);
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      loginUser(credentials.email, json.authToken);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
    if (error) setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.brandMark}>🍽️</div>
            <h1 style={styles.brandTitle}>GoFood</h1>
            <p style={styles.brandTagline}>
              Delicious food, delivered fresh to your doorstep
            </p>
            <div style={styles.features}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🛒</span>
                <span>Easy ordering</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>⚡</span>
                <span>Fast delivery</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>💳</span>
                <span>Secure payment</span>
              </div>
            </div>
          </div>
          <div style={styles.leftOverlay} />
        </div>

        {/* Right Panel - Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrapper}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Sign in to your account</p>

            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}

            {blockedMessage && (
              <div style={{ ...styles.errorBox, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                {blockedMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    style={{ ...styles.input, paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.pwToggle}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div style={styles.forgotRow}>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            <Link to="/createuser" style={styles.signupBtn}>
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "900px",
    minHeight: "560px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    background: "#fff",
  },
  leftPanel: {
    flex: "1",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    color: "#fff",
    padding: "3rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
  },
  brandMark: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  brandTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.02em",
  },
  brandTagline: {
    fontSize: "0.95rem",
    opacity: 0.8,
    margin: "0 0 2.5rem 0",
    lineHeight: 1.6,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.9rem",
    opacity: 0.85,
  },
  featureIcon: {
    fontSize: "1.1rem",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
  },
  rightPanel: {
    flex: "1",
    padding: "3rem 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "340px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 0.25rem 0",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: "0 0 1.75rem 0",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
  inputGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.4rem",
    letterSpacing: "0.01em",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
    fontSize: "0.85rem",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.75rem 0.7rem 2.5rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#1f2937",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  pwToggle: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.9rem",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "1.5rem",
    marginTop: "-0.5rem",
  },
  forgotLink: {
    fontSize: "0.82rem",
    color: "#e97451",
    textDecoration: "none",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%",
    padding: "0.75rem",
    background: "linear-gradient(135deg, #e97451, #d4553a)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1.5rem 0",
    gap: "0.75rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  signupBtn: {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    background: "transparent",
    color: "#374151",
    border: "1.5px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
};
