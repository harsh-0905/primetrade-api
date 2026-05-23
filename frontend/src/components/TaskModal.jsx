import { useState, useEffect } from "react";
import { aiSuggestTask } from "../api/endpoints";

const TaskModal = ({ task, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", dueDate: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    }
  }, [task]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.dueDate) delete data.dueDate;
    onSubmit(data);
  };

  const handleAISuggest = async () => {
    if (!form.title.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await aiSuggestTask({ title: form.title, description: form.description });
      const s = res.data.data;
      setAiSuggestion(s);
    } catch {
      // fail silently
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;
    setForm((f) => ({
      ...f,
      description: aiSuggestion.description || f.description,
      priority: aiSuggestion.priority || f.priority,
    }));
    setAiSuggestion(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-xl)",
        width: "100%", maxWidth: 500,
        animation: "fadeIn 0.2s ease",
        boxShadow: "var(--shadow-lg)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>{task ? "Edit Task" : "New Task"}</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {task ? "Update task details" : "Create and optionally enhance with AI"}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "var(--surface-3)", border: "none",
            color: "var(--text-muted)", width: 30, height: 30,
            borderRadius: "50%", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* Title + AI button */}
          <div className="form-group">
            <label>Title *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAISuggest}
                disabled={aiLoading || !form.title.trim()}
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.2))",
                  border: "1px solid rgba(99,102,241,0.4)",
                  color: "var(--accent-2)",
                  padding: "0 14px",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                {aiLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "✦"}
                {aiLoading ? "" : "AI"}
              </button>
            </div>
          </div>

          {/* AI suggestion banner */}
          {aiSuggestion && (
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.05))",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 16px",
              marginBottom: 16,
              fontSize: 13,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--accent-2)", marginBottom: 6, fontSize: 12 }}>✦ AI Suggestion</p>
                  {aiSuggestion.description && (
                    <p style={{ color: "var(--text-2)", marginBottom: 4 }}>{aiSuggestion.description}</p>
                  )}
                  {aiSuggestion.priority && (
                    <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      Suggested priority: <strong style={{ color: aiSuggestion.priority === "high" ? "var(--danger)" : aiSuggestion.priority === "medium" ? "var(--warning)" : "var(--info)" }}>{aiSuggestion.priority}</strong>
                    </p>
                  )}
                </div>
                <button type="button" className="btn-primary" onClick={applyAISuggestion} style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}>Apply</button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details, context, or acceptance criteria..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;