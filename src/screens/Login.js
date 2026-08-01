import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/context/AdminAuthContext";
import { useUserAuth } from "../context/UserAuthContext";
import { adminApi } from "../admin/utils/api";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUtensils, FaShoppingCart, FaBolt, FaShieldAlt } from "react-icons/fa";

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
            <div style={styles.brandMark}>
              <FaUtensils />
            </div>
            <h1 style={styles.brandTitle}>Mitho</h1>
            <p style={styles.brandTagline}>
              Delicious food, delivered fresh to your doorstep
            </p>
            <div style={styles.features}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}><FaShoppingCart /></span>
                <span>Easy ordering</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}><FaBolt /></span>
                <span>Fast delivery</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}><FaShieldAlt /></span>
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
              <div style={{ ...styles.errorBox, background: '#fdecec', border: '1px solid #f5c6c8', color: '#e5484d' }}>
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
    background: "var(--bg)",
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
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(32, 26, 20, 0.14)",
    background: "#fff",
  },
  leftPanel: {
    flex: "1",
    background:
      "radial-gradient(600px 300px at 110% 0%, rgba(255, 107, 53, 0.28), transparent 60%), radial-gradient(500px 260px at -10% 110%, rgba(232, 163, 61, 0.18), transparent 60%), linear-gradient(160deg, #120e0a 0%, #1f1913 60%, #241d14 100%)",
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
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundImage: "linear-gradient(135deg, #ff6b35 0%, #e14f1d 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    marginBottom: "1.25rem",
    boxShadow: "0 8px 24px rgba(255, 107, 53, 0.35)",
  },
  brandTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontWeight: "400",
    fontSize: "2rem",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.01em",
    color: "#fff",
  },
  brandTagline: {
    fontSize: "0.95rem",
    opacity: 0.75,
    margin: "0 0 2.5rem 0",
    lineHeight: 1.6,
    color: "rgba(250, 247, 242, 0.75)",
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
    color: "rgba(250, 247, 242, 0.85)",
  },
  featureIcon: {
    fontSize: "0.85rem",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 107, 53, 0.16)",
    color: "#ff8c5a",
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
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontWeight: "400",
    fontSize: "1.7rem",
    color: "#201a14",
    margin: "0 0 0.25rem 0",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#776c5f",
    margin: "0 0 1.75rem 0",
  },
  errorBox: {
    background: "#fdecec",
    border: "1px solid #f5c6c8",
    color: "#e5484d",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
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
    color: "#3d342b",
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
    color: "#a89b8b",
    fontSize: "0.85rem",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.75rem 0.7rem 2.5rem",
    border: "1.5px solid #eae2d6",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#201a14",
    background: "#faf7f2",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  pwToggle: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    color: "#a89b8b",
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
    color: "#e14f1d",
    textDecoration: "none",
    fontWeight: "600",
  },
  submitBtn: {
    width: "100%",
    padding: "0.75rem",
    background: "linear-gradient(135deg, #ff6b35, #e14f1d)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: "0 6px 20px rgba(255, 107, 53, 0.28)",
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
    background: "#eae2d6",
  },
  dividerText: {
    fontSize: "0.8rem",
    color: "#a89b8b",
  },
  signupBtn: {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    background: "transparent",
    color: "#201a14",
    border: "1.5px solid #d9cfbf",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
};
