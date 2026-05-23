import { useState, useEffect } from "react";
import { getAdminStats, getAllUsers } from "../api/endpoints";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { format } from "date-fns";

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()])
      .then(([sr, ur]) => { setStats(sr.data.data); setUsers(ur.data.data.users); })
      .catch(() => showToast("Failed to load admin data", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    </>
  );

  const statusColors = { todo: "var(--text-muted)", "in-progress": "var(--warning)", done: "var(--success)" };
  const statItems = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, color: "var(--accent)", icon: "◉" },
    { label: "Total Tasks", value: stats?.totalTasks ?? 0, color: "var(--success)", icon: "◈" },
    ...(stats?.tasksByStatus?.map(s => ({
      label: s._id === "in-progress" ? "In Progress" : s._id.charAt(0).toUpperCase() + s._id.slice(1),
      value: s.count,
      color: statusColors[s._id] || "var(--text-muted)",
      icon: s._id === "done" ? "✓" : s._id === "in-progress" ? "↻" : "○",
    })) || []),
  ];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Admin Panel</h1>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              color: "#fff", padding: "3px 9px", borderRadius: "var(--radius-full)"
            }}>ADMIN</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Platform overview and user management</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {statItems.map(({ label, value, color, icon }) => (
            <div key={label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
                </div>
                <span style={{ fontSize: 20, color, opacity: 0.5 }}>{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Registered Users</h2>
            <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "3px 10px", borderRadius: "var(--radius-full)" }}>
              {users.length} total
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["User", "Email", "Role", "Joined"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none", transition: "background var(--transition)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
                          border: "1px solid var(--border-light)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: "var(--accent-2)"
                        }}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        background: u.role === "admin" ? "linear-gradient(135deg, var(--accent), var(--accent-2))" : "var(--surface-3)",
                        color: u.role === "admin" ? "#fff" : "var(--text-muted)",
                        padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em"
                      }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </>
  );
};

export default Admin;