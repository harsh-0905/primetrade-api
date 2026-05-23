import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const navLinks = [
    { to: "/dashboard", label: "Tasks", icon: "✓" },
    { to: "/analytics", label: "Analytics", icon: "◈" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: "⚙" }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "rgba(17,24,39,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32,
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff",
          boxShadow: "0 2px 12px var(--accent-glow-strong)"
        }}>P</div>
        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
          Prime<span style={{ color: "var(--accent)" }}>trade</span>
        </span>
      </Link>

      {/* Nav links — desktop */}
      <div className="hide-mobile" style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: 500,
              color: isActive(to) ? "var(--accent-2)" : "var(--text-muted)",
              background: isActive(to) ? "var(--accent-glow)" : "transparent",
              transition: "all var(--transition)",
            }}
          >{label}</Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
            border: "1px solid var(--border-light)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "var(--accent-2)"
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
            {user?.name}
          </span>
          {user?.role === "admin" && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              color: "#fff", padding: "2px 7px", borderRadius: "var(--radius-full)",
              letterSpacing: "0.05em"
            }}>ADMIN</span>
          )}
        </div>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: "6px 14px", fontSize: 13 }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;