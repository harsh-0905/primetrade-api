import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      background: "var(--surface)",
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
      <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>⬡</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Primetrade</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {user?.role === "admin" && (
          <Link to="/admin" style={{ color: "var(--warning)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
            Admin Panel
          </Link>
        )}
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {user?.name}
          {user?.role === "admin" && (
            <span style={{ marginLeft: 6, background: "var(--accent)", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>
              ADMIN
            </span>
          )}
        </span>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: "6px 14px", fontSize: 13 }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
