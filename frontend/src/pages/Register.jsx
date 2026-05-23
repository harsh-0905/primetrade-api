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
    if (form.password.length < 6) return showToast("Password must be at least 6 characters", "error");
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

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "var(--danger)", "var(--warning)", "var(--success)"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="page-center">
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            borderRadius: 16,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff",
            boxShadow: "0 8px 32px var(--accent-glow-strong)", marginBottom: 16,
          }}>P</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Prime<span style={{ color: "var(--accent)" }}>trade</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>Create your free account</p>
        </div>

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: 32, boxShadow: "var(--shadow-lg)",
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
              {form.password.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColors[strength] : "var(--surface-3)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8, padding: 12, fontSize: 15 }}>
              {loading ? <><span className="spinner" /> Creating account...</> : "Create Account →"}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
};

export default Register;