import { useState, useEffect } from "react";
import { getTasks } from "../api/endpoints";
import Navbar from "../components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays, parseISO, isAfter } from "date-fns";

const COLORS = {
  todo: "#6b7a99",
  "in-progress": "#f59e0b",
  done: "#10b981",
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 12, color: "var(--text-2)" }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.fill || p.stroke }}>{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

const Analytics = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTasks({ limit: 200 });
        setAllTasks(res.data.data.tasks);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        {/* FIX: loading skeleton also uses responsive minmax */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      </div>
    </>
  );

  // Compute data
  const byStatus = ["todo", "in-progress", "done"].map(s => ({
    name: s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1),
    value: allTasks.filter(t => t.status === s).length,
    fill: COLORS[s],
  }));

  const byPriority = ["low", "medium", "high"].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    Tasks: allTasks.filter(t => t.priority === p).length,
    fill: COLORS[p],
  }));

  // Tasks created per day (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const createdByDay = days.map(day => ({
    name: format(day, "MMM d"),
    Created: allTasks.filter(t => format(parseISO(t.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length,
    Completed: allTasks.filter(t => t.status === "done" && format(parseISO(t.updatedAt || t.createdAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length,
  }));

  const completionRate = allTasks.length > 0 ? Math.round((allTasks.filter(t => t.status === "done").length / allTasks.length) * 100) : 0;
  const overdueCount = allTasks.filter(t => t.dueDate && isAfter(new Date(), parseISO(t.dueDate)) && t.status !== "done").length;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            Insights from your {allTasks.length} tasks
          </p>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Completion Rate", value: `${completionRate}%`, color: "var(--success)" },
            { label: "Total Tasks", value: allTasks.length, color: "var(--accent)" },
            { label: "Overdue", value: overdueCount, color: overdueCount > 0 ? "var(--danger)" : "var(--text-muted)" },
            { label: "In Progress", value: allTasks.filter(t => t.status === "in-progress").length, color: "var(--warning)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Charts grid — FIX: minmax(min(100%, 400px), 1fr) prevents overflow on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 16 }}>

          {/* Status breakdown */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: "var(--text-2)" }}>Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                {/* FIX: removed label and labelLine props — they caused text overlap on small/zero slices */}
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {byStatus.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
              {byStatus.map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.fill, display: "inline-block" }} />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </div>

          {/* Priority distribution */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: "var(--text-2)" }}>Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byPriority} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="Tasks" radius={[6,6,0,0]}>
                  {byPriority.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity over time */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: "var(--text-2)" }}>7-Day Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={createdByDay}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Created" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} />
                <Line type="monotone" dataKey="Completed" stroke="var(--success)" strokeWidth={2} dot={{ fill: "var(--success)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
              {[["Created", "var(--accent)"], ["Completed", "var(--success)"]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ width: 20, height: 2, background: color, display: "inline-block", borderRadius: 1 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;