import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const statusClass = (s) => `badge badge-${s}`;
const priorityClass = (p) => `badge badge-${p}`;
const statusLabel = { todo: "To Do", "in-progress": "In Progress", done: "Done" };

const Dashboard = () => {
  const { user } = useAuth();
  const { toast, showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoadingTasks(true);
    try {
      const params = { page, limit: 8, ...filters };
      // Remove empty filter keys
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getTasks(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      showToast("Failed to load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  }, [filters]); // eslint-disable-line

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
    } finally {
      setSubmitting(false);
    }
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      showToast("Task deleted");
      fetchTasks(pagination.page);
    } catch {
      showToast("Failed to delete task", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Tasks</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              Welcome back, {user?.name}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            style={{ width: "auto", minWidth: 130 }}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            style={{ width: "auto", minWidth: 130 }}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {(filters.status || filters.priority) && (
            <button
              className="btn-ghost"
              onClick={() => setFilters({ status: "", priority: "" })}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Clear
            </button>
          )}

          <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13, alignSelf: "center" }}>
            {pagination.total} task{pagination.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Task List */}
        {loadingTasks ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 32 }}>📋</p>
            <p style={{ color: "var(--text-muted)", marginTop: 10 }}>No tasks yet. Create one!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task) => (
              <div
                key={task._id}
                className="card"
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}
              >
                {/* Color bar for priority */}
                <div style={{
                  width: 4, height: 40, borderRadius: 4, flexShrink: 0,
                  background: task.priority === "high" ? "var(--danger)"
                    : task.priority === "medium" ? "var(--warning)"
                    : "#60a5fa",
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: 15,
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      color: task.status === "done" ? "var(--text-muted)" : "var(--text)",
                    }}>
                      {task.title}
                    </span>
                    <span className={statusClass(task.status)}>{statusLabel[task.status]}</span>
                    <span className={priorityClass(task.priority)}>{task.priority}</span>
                  </div>
                  {task.description && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => setEditingTask(task)}
                  >
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchTasks(p)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: p === pagination.page ? "var(--accent)" : "var(--surface2)",
                  color: p === pagination.page ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <TaskModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
          loading={submitting}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdate}
          loading={submitting}
        />
      )}

      <Toast toast={toast} />
    </>
  );
};

export default Dashboard;
