import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "No account found with this email");
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 5) {
      setError("Password must be at least 5 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Password Reset Successful</h2>
          <p style={styles.subtitle}>Your password has been updated. You can now sign in with your new password.</p>
          <Link to="/login" style={styles.submitBtn}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/login" style={styles.backLink}>
          <FaArrowLeft /> Back to login
        </Link>

        <div style={styles.iconWrap}>
          {step === 1 ? <FaEnvelope size={24} /> : <FaLock size={24} />}
        </div>

        <h2 style={styles.title}>
          {step === 1 ? "Reset your password" : "Create new password"}
        </h2>
        <p style={styles.subtitle}>
          {step === 1
            ? "Enter the email associated with your account"
            : `Setting new password for ${email}`}
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  placeholder="Min 5 characters"
                  required
                  style={{ ...styles.input, paddingRight: "3rem" }}
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={styles.pwToggle}>
                  {showNewPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter your password"
                  required
                  style={{ ...styles.input, paddingRight: "3rem" }}
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={styles.pwToggle}>
                  {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
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
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "20px",
    padding: "2.5rem",
    boxShadow: "0 24px 60px rgba(32, 26, 20, 0.14)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.85rem",
    color: "#776c5f",
    textDecoration: "none",
    marginBottom: "1.5rem",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #ff6b35, #e14f1d)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.25rem",
    boxShadow: "0 8px 24px rgba(255, 107, 53, 0.35)",
  },
  title: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontWeight: "400",
    fontSize: "1.5rem",
    color: "#201a14",
    margin: "0 0 0.35rem 0",
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "#776c5f",
    margin: "0 0 1.5rem 0",
    lineHeight: 1.5,
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
  submitBtn: {
    display: "block",
    width: "100%",
    padding: "0.75rem",
    background: "linear-gradient(135deg, #ff6b35, #e14f1d)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    boxShadow: "0 6px 20px rgba(255, 107, 53, 0.28)",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#e8f7ec",
    color: "#2f9e44",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "1.25rem",
  },
};
