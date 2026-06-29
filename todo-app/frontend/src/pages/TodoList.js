import React, { useState, useEffect, useCallback } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo, bulkDelete } from "../api/todos";
import TodoModal from "../components/TodoModal";
import Confirm from "../components/Confirm";
import { useToast } from "../components/Toast";

const CATEGORY_CLASS = { Work: "badge-work", Personal: "badge-personal", Learning: "badge-learning", Health: "badge-health" };

function StatCard({ icon, iconClass, value, label, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(d, status) {
  if (!d || status === "Completed") return false;
  return new Date(d) < new Date();
}

export default function TodoList({ navigate, initialFilters = {}, onStatsLoad }) {
  const toast = useToast();

  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialFilters.status || "All");
  const [priority, setPriority] = useState(initialFilters.priority || "All");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null); // null | "add" | todo-object
  const [confirm, setConfirm] = useState(null); // null | { type, id?, ids? }

  const limit = 5;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort, order };
      if (search) params.search = search;
      if (status !== "All") params.status = status;
      if (priority !== "All") params.priority = priority;
      if (initialFilters.status) params.status = initialFilters.status;
      if (initialFilters.priority) params.priority = initialFilters.priority;

      const data = await getTodos(params);
      setTodos(data.todos);
      setStats(data.stats);
      if (onStatsLoad) onStatsLoad(data.stats);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelected([]);
    } catch {
      toast("Failed to load todos", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, sort, order, initialFilters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, priority, sort, order]);

  const handleCreate = async (data) => {
    try {
      await createTodo(data);
      toast("Todo created!");
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleUpdate = async (data) => {
    try {
      await updateTodo(modal.id, data);
      toast("Todo updated!");
      setModal(null);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const handleToggle = async (id) => {
    try {
      await toggleTodo(id);
      load();
    } catch { toast("Failed to update status", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      toast("Todo deleted", "info");
      setConfirm(null);
      load();
    } catch { toast("Failed to delete", "error"); }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selected);
      toast(`${selected.length} todos deleted`, "info");
      setConfirm(null);
      load();
    } catch { toast("Bulk delete failed", "error"); }
  };

  const handleBulkComplete = async () => {
    try {
      await Promise.all(selected.map((id) => {
        const t = todos.find((x) => x.id === id);
        if (t && t.status !== "Completed") return toggleTodo(id);
        return null;
      }));
      toast(`Marked ${selected.length} todos as completed`);
      load();
    } catch { toast("Failed", "error"); }
  };

  const toggleSelect = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(selected.length === todos.length ? [] : todos.map((t) => t.id));

  const pageLabel = () => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${total === 0 ? 0 : start} to ${end} of ${total} todos`;
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Todos</h1>
          <p className="page-subtitle">Manage your tasks and stay productive</p>
        </div>
        <button className="btn-primary" onClick={() => setModal("add")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Todo
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📋" iconClass="blue" value={stats.total} label="Total Todos" sub="All tasks" />
        <StatCard icon="✅" iconClass="green" value={stats.completed} label="Completed" sub="Tasks done" />
        <StatCard icon="🕐" iconClass="yellow" value={stats.pending} label="Pending" sub="Tasks remaining" />
        <StatCard icon="🚩" iconClass="red" value={stats.highPriority} label="High Priority" sub="Important tasks" />
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search todos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Filter by Status</span>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All","Pending","Completed"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Filter by Priority</span>
          <select className="filter-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {["All","High","Medium","Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Sort by</span>
          <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">Created Date</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <button className="sort-toggle-btn" onClick={() => setOrder((o) => o === "asc" ? "desc" : "asc")} title={`Order: ${order}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {order === "asc"
              ? <><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></>
              : <><polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/></>}
          </svg>
        </button>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>{selected.length} selected</span>
          <button className="bulk-btn" onClick={handleBulkComplete}>Mark Complete</button>
          <button className="bulk-btn danger" onClick={() => setConfirm({ type: "bulk" })}>Delete Selected</button>
          <button className="bulk-btn" onClick={() => setSelected([])}>Deselect All</button>
        </div>
      )}

      {/* Table */}
      <div className="table-card" style={{ borderRadius: selected.length > 0 ? "0 0 var(--radius) var(--radius)" : undefined }}>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <h3>No todos found</h3>
            <p>Try adjusting your filters or create a new todo.</p>
          </div>
        ) : (
          <table className="todo-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={selected.length === todos.length && todos.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>Todo</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todos.map((t) => (
                <tr key={t.id} className={selected.includes(t.id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      className="todo-checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleSelect(t.id)}
                    />
                  </td>
                  <td>
                    <div className="todo-title-cell">
                      <div className="title" style={{ textDecoration: t.status === "Completed" ? "line-through" : "none", opacity: t.status === "Completed" ? 0.6 : 1 }}>
                        {t.title}
                      </div>
                      {t.description && <div className="desc">{t.description.slice(0, 55)}{t.description.length > 55 ? "…" : ""}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${CATEGORY_CLASS[t.category] || "badge-other"}`}>{t.category}</span>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </td>
                  <td>
                    <span className={`due-date ${isOverdue(t.dueDate, t.status) ? "overdue" : ""}`}>
                      {t.dueDate && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      )}
                      {formatDate(t.dueDate)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge status-badge status-${t.status.toLowerCase()}`}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => handleToggle(t.id)}
                      title="Click to toggle status"
                    >
                      {t.status}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn view" title="View" onClick={() => navigate(`/todo/${t.id}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button className="action-btn edit" title="Edit" onClick={() => setModal(t)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="action-btn delete" title="Delete" onClick={() => setConfirm({ type: "single", id: t.id })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && todos.length > 0 && (
          <div className="table-footer">
            <span className="table-footer-info">{pageLabel()}</span>
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <TodoModal
          todo={modal === "add" ? null : modal}
          onSave={modal === "add" ? handleCreate : handleUpdate}
          onClose={() => setModal(null)}
        />
      )}

      {confirm?.type === "single" && (
        <Confirm
          title="Delete Todo"
          message="Are you sure you want to delete this todo? This action cannot be undone."
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm?.type === "bulk" && (
        <Confirm
          title={`Delete ${selected.length} Todos`}
          message={`Are you sure you want to delete ${selected.length} selected todos? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirm(null)}
          confirmLabel={`Delete ${selected.length} Todos`}
        />
      )}
    </div>
  );
}
