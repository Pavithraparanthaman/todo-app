import React, { useState, useEffect } from "react";
import { getTodo, updateTodo, deleteTodo, toggleTodo } from "../api/todos";
import TodoModal from "../components/TodoModal";
import Confirm from "../components/Confirm";
import { useToast } from "../components/Toast";

const CATEGORY_CLASS = { Work: "badge-work", Personal: "badge-personal", Learning: "badge-learning", Health: "badge-health" };

function formatDate(d) {
  if (!d) return "Not set";
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function timeAgo(d) {
  const now = new Date();
  const past = new Date(d);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TodoDetail({ id, navigate }) {
  const toast = useToast();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTodo(id);
      setTodo(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleToggle = async () => {
    try {
      const updated = await toggleTodo(todo.id);
      setTodo(updated);
      toast(`Marked as ${updated.status}`);
    } catch { toast("Failed to update", "error"); }
  };

  const handleUpdate = async (data) => {
    try {
      const updated = await updateTodo(todo.id, data);
      setTodo(updated);
      setEditing(false);
      toast("Todo updated!");
    } catch (e) { toast(e.message, "error"); }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id);
      toast("Todo deleted", "info");
      navigate("/");
    } catch { toast("Delete failed", "error"); }
  };

  if (loading) return (
    <div className="main-content">
      <div className="loading-wrap"><div className="spinner" /></div>
    </div>
  );

  if (notFound) return (
    <div className="main-content">
      <div className="not-found">
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2>Todo Not Found</h2>
        <p>The todo with ID <code style={{ background: "#F3F4F6", padding: "2px 6px", borderRadius: 4 }}>{id}</code> doesn't exist.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>← Back to Todos</button>
      </div>
    </div>
  );

  const isOverdue = todo.dueDate && todo.status !== "Completed" && new Date(todo.dueDate) < new Date();

  return (
    <div className="main-content">
      <button className="back-btn" onClick={() => navigate("/")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Todos
      </button>

      <div className="detail-card">
        {/* Hero */}
        <div className="detail-hero">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`badge ${CATEGORY_CLASS[todo.category] || "badge-other"}`} style={{ background: "rgba(255,255,255,.2)", color: "white" }}>
                {todo.category}
              </span>
              <span style={{ background: "rgba(255,255,255,.15)", color: "white", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                {todo.priority} Priority
              </span>
            </div>
            <span style={{
              padding: "4px 12px", borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: todo.status === "Completed" ? "rgba(16,185,129,.3)" : "rgba(245,158,11,.3)",
              color: "white"
            }}>
              {todo.status}
            </span>
          </div>
          <h1 className="d-title" style={{ textDecoration: todo.status === "Completed" ? "line-through" : "none", opacity: todo.status === "Completed" ? 0.7 : 1 }}>
            {todo.title}
          </h1>
          {todo.description && <p className="d-desc">{todo.description}</p>}
        </div>

        {/* Body */}
        <div className="detail-body">
          <div className="detail-grid">
            <div className="detail-field">
              <label>Due Date</label>
              <div className="value" style={{ color: isOverdue ? "var(--danger)" : undefined }}>
                {isOverdue && "⚠️ "}{formatDate(todo.dueDate)}
                {isOverdue && <span style={{ color: "var(--danger)", fontSize: 12, display: "block" }}>Overdue</span>}
              </div>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <div className="value">
                <span className={`badge status-badge status-${todo.status.toLowerCase()}`}>{todo.status}</span>
              </div>
            </div>
            <div className="detail-field">
              <label>Created</label>
              <div className="value">{formatDate(todo.createdAt)} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({timeAgo(todo.createdAt)})</span></div>
            </div>
            <div className="detail-field">
              <label>Last Updated</label>
              <div className="value">{formatDate(todo.updatedAt)} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({timeAgo(todo.updatedAt)})</span></div>
            </div>
            <div className="detail-field">
              <label>Category</label>
              <div className="value">
                <span className={`badge ${CATEGORY_CLASS[todo.category] || "badge-other"}`}>{todo.category}</span>
              </div>
            </div>
            <div className="detail-field">
              <label>Priority</label>
              <div className="value">
                <span className={`priority-badge priority-${todo.priority.toLowerCase()}`} style={{ fontSize: 15, fontWeight: 700 }}>
                  {todo.priority === "High" ? "🔴" : todo.priority === "Medium" ? "🟡" : "🟢"} {todo.priority}
                </span>
              </div>
            </div>
          </div>

          {/* ID */}
          <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 16 }}>
            <strong>ID:</strong> {todo.id}
          </div>

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="detail-tags">
              <label>Tags</label>
              <div className="tags-list">
                {todo.tags.map((tag) => (
                  <span key={tag} className="tag-chip">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button
            className={`status-toggle-btn ${todo.status === "Completed" ? "completed" : "pending"}`}
            onClick={handleToggle}
          >
            {todo.status === "Completed"
              ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg> Mark Pending</>
              : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Mark Complete</>
            }
          </button>

          <button className="btn-secondary" onClick={() => setEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Todo
          </button>

          <button className="btn-danger" onClick={() => setConfirm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <TodoModal todo={todo} onSave={handleUpdate} onClose={() => setEditing(false)} />
      )}

      {confirm && (
        <Confirm
          title="Delete Todo"
          message={`Delete "${todo.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}
