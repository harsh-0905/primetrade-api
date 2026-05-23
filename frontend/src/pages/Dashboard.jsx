import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import Toast from "../components/Toast";
import AIAssistant from "../components/AIAssistant";
import { useToast } from "../hooks/useToast";
import { format, isAfter, parseISO, isToday, isTomorrow } from "date-fns";

const statusConfig = {
  "todo": { label: "To Do", color: "var(--text-muted)", dot: "#6b7a99" },
  "in-progress": { label: "In Progress", color: "var(--warning)", dot: "#f59e0b" },
  "done": { label: "Done", color: "var(--success)", dot: "#10b981" },
};

const priorityConfig = {
  "low": { color: "var(--info)", bar: "#3b82f6" },
  "medium": { color: "var(--warning)", bar: "#f59e0b" },
  "high": { color: "var(--danger)", bar: "#ef4444" },
};

const getDueDateLabel = (dueDate) => {
  if (!dueDate) return null;
  const d = parseISO(dueDate);
  const now = new Date();
  if (isToday(d)) return { label: "Due today", color: "var(--warning)" };
  if (isTomorrow(d)) return { label: "Due tomorrow", color: "var(--warning)" };
  if (isAfter(now, d)) return { label: "Overdue", color: "var(--danger)" };
  return { label: `Due ${format(d, "MMM d")}`, color: "var(--text-muted)" };
};

const TaskCard = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const p = priorityConfig[task.priority] || priorityConfig.medium;
  const s = statusConfig[task.status] || statusConfig.todo;
  const due = task.dueDate ? getDueDateLabel(task.dueDate) : null;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      transition: "all var(--transition)",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Priority bar */}
      <div style={{ width: 3, height: 44, borderRadius: 4, background: p.bar, flexShrink: 0 }} />

      {/* Checkbox */}
      <div
        onClick={() => onStatusToggle(task)}
        style={{
          width: 20, height: 20,
          border: `2px solid ${task.status === "done" ? "var(--success)" : "var(--border-light)"}`,
          borderRadius: 6,
          background: task.status === "done" ? "var(--success)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all var(--transition)",
          color: "#fff", fontSize: 11, fontWeight: 700,
        }}
      >{task.status === "done" ? "✓" : ""}</div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontWeight: 600, fontSize: 14,
            textDecoration: task.status === "done" ? "line-through" : "none",
            color: task.status === "done" ? "var(--text-muted)" : "var(--text)",
            transition: "all var(--transition)",
          }}>{task.title}</span>
          <span className={`badge badge-${task.status}`}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {s.label}
          </span>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {due && (
            <span style={{ fontSize: 11, color: due.color, display: "flex", alignItems: "center", gap: 3 }}>
              ◷ {due.label}
            </span>
          )}
        </div>
        {task.description && (
          <p style={{
            fontSize: 12, color: "var(--text-muted)", marginTop: 4,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60ch",
          }}>{task.description}</p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">✎</button>
        <button className="btn-danger" onClick={() => onDelete(task._id)}>✕</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [view, setView] = useState("list"); // list | kanban

  const fetchTasks = useCallback(async (page = 1) => {
    setLoadingTasks(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getTasks(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      showToast("Failed to load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await createTask(form);
      showToast("Task created");
      setModalOpen(false);
      fetchTasks(1);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create task", "error");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (form) => {
    setSubmitting(true);
    try {
      await updateTask(editingTask._id, form);
      showToast("Task updated");
      setEditingTask(null);
      fetchTasks(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update task", "error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      showToast("Task deleted");
      fetchTasks(pagination.page);
    } catch { showToast("Failed to delete task", "error"); }
  };

  const handleStatusToggle = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      await updateTask(task._id, { status: nextStatus });
      setTasks(ts => ts.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    } catch { showToast("Failed to update", "error"); }
  };

  // Stats
  const total = pagination.total;
  const done = tasks.filter(t => t.status === "done").length;
  const high = tasks.filter(t => t.priority === "high" && t.status !== "done").length;
  const overdue = tasks.filter(t => t.dueDate && isAfter(new Date(), parseISO(t.dueDate)) && t.status !== "done").length;

  // Kanban groupings
  const kanbanCols = ["todo", "in-progress", "done"];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>My Tasks</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
              Welcome back, <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{user?.name}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={() => setShowAI(v => !v)} style={{ padding: "9px 16px", fontSize: 13, background: showAI ? "var(--accent-glow)" : undefined, borderColor: showAI ? "var(--accent)" : undefined, color: showAI ? "var(--accent-2)" : undefined }}>
              ✦ AI Assistant
            </button>
            <button className="btn-primary" onClick={() => setModalOpen(true)} style={{ padding: "9px 18px" }}>
              + New Task
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Tasks", value: total, color: "var(--accent)", icon: "◈" },
            { label: "Completed", value: done, color: "var(--success)", icon: "✓" },
            { label: "High Priority", value: high, color: "var(--danger)", icon: "↑" },
            { label: "Overdue", value: overdue, color: overdue > 0 ? "var(--danger)" : "var(--text-muted)", icon: "◷" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="card" style={{ padding: "16px 18px", borderColor: value > 0 && label === "Overdue" ? "rgba(239,68,68,0.2)" : "var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
                </div>
                <span style={{ fontSize: 18, color, opacity: 0.6 }}>{icon}</span>
              </div>
              {label === "Completed" && total > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.round((done / tasks.length || 0) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filters + view toggle */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ width: "auto", minWidth: 200, flex: 1, maxWidth: 280 }}
          />
          <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} style={{ width: "auto", minWidth: 130 }}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))} style={{ width: "auto", minWidth: 130 }}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {(filters.status || filters.priority || filters.search) && (
            <button className="btn-ghost" onClick={() => setFilters({ status: "", priority: "", search: "" })} style={{ padding: "8px 12px", fontSize: 13 }}>✕ Clear</button>
          )}

          {/* View toggle */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "var(--surface-2)", padding: 4, borderRadius: "var(--radius)" }}>
            {[["list", "≡"], ["kanban", "⊞"]].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "5px 12px", fontSize: 14,
                background: view === v ? "var(--surface-3)" : "transparent",
                border: view === v ? "1px solid var(--border)" : "1px solid transparent",
                color: view === v ? "var(--text)" : "var(--text-muted)",
                borderRadius: 6,
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Task content */}
        {loadingTasks ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />)}
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No tasks found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {filters.status || filters.priority || filters.search ? "Try adjusting your filters" : "Create your first task to get started"}
            </p>
          </div>
        ) : view === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </div>
        ) : (
          /* Kanban view */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {kanbanCols.map(col => {
              const colTasks = tasks.filter(t => t.status === col);
              const config = statusConfig[col];
              return (
                <div key={col}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: config.dot, display: "inline-block" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>{config.label}</span>
                    <span style={{ fontSize: 12, color: "var(--text-disabled)", marginLeft: "auto" }}>{colTasks.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {colTasks.map(task => (
                      <div key={task._id} style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: 14,
                        transition: "all var(--transition)",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
                      >
                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{task.title}</p>
                        {task.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{task.description.slice(0, 60)}{task.description.length > 60 ? "..." : ""}</p>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className={`badge badge-${task.priority}`} style={{ fontSize: 10 }}>{task.priority}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn-icon" onClick={() => setEditingTask(task)} style={{ padding: "3px 7px", fontSize: 11 }}>✎</button>
                            <button className="btn-danger" onClick={() => handleDelete(task._id)} style={{ padding: "3px 7px", fontSize: 11 }}>✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center", color: "var(--text-disabled)", fontSize: 12 }}>
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
            <button
              className="btn-ghost"
              disabled={pagination.page === 1}
              onClick={() => fetchTasks(pagination.page - 1)}
              style={{ padding: "7px 14px", fontSize: 13 }}
            >← Prev</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchTasks(p)} style={{
                padding: "7px 13px", borderRadius: "var(--radius)",
                background: p === pagination.page ? "var(--accent)" : "var(--surface-2)",
                color: p === pagination.page ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)", fontSize: 13, fontWeight: 600,
              }}>{p}</button>
            ))}
            <button
              className="btn-ghost"
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchTasks(pagination.page + 1)}
              style={{ padding: "7px 14px", fontSize: 13 }}
            >Next →</button>
          </div>
        )}
      </div>

      {/* AI Floating button (when closed) */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          style={{
            position: "fixed", bottom: 24, right: 24,
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            border: "none", color: "#fff",
            fontSize: 20, cursor: "pointer",
            boxShadow: "0 4px 20px var(--accent-glow-strong)",
            zIndex: 200,
            transition: "all var(--transition)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          title="AI Assistant"
        >✦</button>
      )}

      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
      {modalOpen && <TaskModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} loading={submitting} />}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleUpdate} loading={submitting} />}
      <Toast toast={toast} />
    </>
  );
};

export default Dashboard;