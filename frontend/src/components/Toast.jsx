const icons = { success: "✓", error: "✕", info: "ℹ" };

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type || "success"}`}>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{icons[toast.type] || "✓"}</span>
      {toast.message}
    </div>
  );
};

export default Toast;