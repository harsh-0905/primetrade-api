import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return showToast("Password must be at least 6 characters", "error");
    }
    setLoading(true);
    try {
      const res = await register(form);
      const { token, user } = res.data.data;
      loginUser(token, user);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 32 }}>⬡</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>Primetrade</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
      <Toast toast={toast} />
    </div>
  );
};

export default Register;
