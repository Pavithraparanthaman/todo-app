import React, { useState, useEffect } from "react";

const CATEGORIES = ["Work", "Personal", "Learning", "Health", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

export default function TodoModal({ todo, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "Personal",
    priority: "Medium", dueDate: "", tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title || "",
        description: todo.description || "",
        category: todo.category || "Personal",
        priority: todo.priority || "Medium",
        dueDate: todo.dueDate || "",
        tags: todo.tags || [],
      });
    }
  }, [todo]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== tag) }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{todo ? "Edit Todo" : "Add New Todo"}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title <span className="required">*</span></label>
            <input
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-input-wrap">
              <input
                className="form-input"
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button className="btn-secondary" style={{ padding: "9px 14px", whiteSpace: "nowrap" }} onClick={addTag}>Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="tags-list">
                {form.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                    <button onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {todo ? "Save Changes" : "Create Todo"}
          </button>
        </div>
      </div>
    </div>
  );
}
