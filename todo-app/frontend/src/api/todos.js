const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const req = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

export const getTodos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/todos?${qs}`);
};
export const getTodo = (id) => req(`/todos/${id}`);
export const createTodo = (data) => req("/todos", { method: "POST", body: JSON.stringify(data) });
export const updateTodo = (id, data) => req(`/todos/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const toggleTodo = (id) => req(`/todos/${id}/toggle`, { method: "PATCH" });
export const deleteTodo = (id) => req(`/todos/${id}`, { method: "DELETE" });
export const bulkDelete = (ids) => req("/todos", { method: "DELETE", body: JSON.stringify({ ids }) });
