import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      loginUser(token, user);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ minHeight: "100vh" }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo block */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            borderRadius: 16,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff",
            boxShadow: "0 8px 32px var(--accent-glow-strong)",
            marginBottom: 16,
          }}>P</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Prime<span style={{ color: "var(--accent)" }}>trade</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            Sign in to manage your tasks
          </p>
        </div>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "32px",
          boxShadow: "var(--shadow-lg)",
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required autoComplete="current-password"
              />
            </div>
            <button
              type="submit" className="btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: 8, padding: "12px", fontSize: 15 }}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            No account yet?{" "}
            <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--text-disabled)" }}>
          Secured with JWT · Rate limited · End-to-end encrypted transport
        </p>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default Login;