import { useState, useEffect } from "react";
import { getAdminStats, getAllUsers } from "../api/endpoints";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <div style={{ fontSize: 32, fontWeight: 700, color: color || "var(--accent)" }}>{value}</div>
    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
  </div>
);

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.users);
      })
      .catch(() => showToast("Failed to load admin data", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-center"><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>
      </>
    );
  }

  const statusColors = { todo: "var(--text-muted)", "in-progress": "var(--warning)", done: "var(--success)" };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Admin Panel</h1>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 36 }}>
          <StatCard label="Total Users" value={stats?.totalUsers ?? 0} color="var(--accent)" />
          <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} color="var(--success)" />
          {stats?.tasksByStatus?.map((s) => (
            <StatCard key={s._id} label={s._id} value={s.count} color={statusColors[s._id]} />
          ))}
        </div>

        {/* Users Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>All Users ({users.length})</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "12px 16px" }}>{u.name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: u.role === "admin" ? "var(--accent)" : "var(--surface2)",
                        color: u.role === "admin" ? "#fff" : "var(--text-muted)",
                        padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
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
