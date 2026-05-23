import api from "./client";

// ─── Auth ────────────────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// ─── Tasks ───────────────────────────────────────────────────────
export const getTasks = (params) => api.get("/tasks", { params });
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getTaskStats = () => api.get("/tasks/stats");

// ─── AI ──────────────────────────────────────────────────────────
export const aiChat = (messages) => api.post("/ai/chat", { messages });
export const aiSuggestTask = (context) => api.post("/ai/suggest", context);
export const aiPrioritize = (tasks) => api.post("/ai/prioritize", { tasks });

// ─── Admin ───────────────────────────────────────────────────────
export const getAdminStats = () => api.get("/admin/stats");
export const getAllUsers = () => api.get("/admin/users");