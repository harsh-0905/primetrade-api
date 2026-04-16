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
    <div className="page-center">
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 32 }}>⬡</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>Primetrade</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Register
          </Link>
        </p>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default Login;
