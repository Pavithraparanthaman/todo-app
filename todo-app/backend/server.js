const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data", "todos.json");

app.use(cors());
app.use(express.json());

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"));
}
if (!fs.existsSync(DATA_FILE)) {
  const seed = [
    {
      id: uuidv4(),
      title: "Complete React Assignment",
      description: "Implement the todo application UI with all required features",
      category: "Work",
      priority: "High",
      status: "Pending",
      dueDate: "2025-06-05",
      tags: ["react", "frontend"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Study System Design",
      description: "Learn about microservices architecture and distributed systems",
      category: "Learning",
      priority: "Medium",
      status: "Pending",
      dueDate: "2025-06-08",
      tags: ["architecture", "backend"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Grocery Shopping",
      description: "Buy vegetables and fruits for the week",
      category: "Personal",
      priority: "Low",
      status: "Completed",
      dueDate: "2025-06-03",
      tags: ["errands"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Prepare Presentation",
      description: "Create slides for project demo with team",
      category: "Work",
      priority: "High",
      status: "Completed",
      dueDate: "2025-06-02",
      tags: ["presentation", "work"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Read a Book",
      description: "Finish reading Atomic Habits — remaining 3 chapters",
      category: "Personal",
      priority: "Low",
      status: "Pending",
      dueDate: "2025-06-10",
      tags: ["reading", "self-improvement"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Fix Login Bug",
      description: "Resolve the authentication token expiry issue in prod",
      category: "Work",
      priority: "High",
      status: "Pending",
      dueDate: "2025-06-04",
      tags: ["bug", "auth"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Morning Jog",
      description: "30-minute jog around the park every day this week",
      category: "Health",
      priority: "Medium",
      status: "Pending",
      dueDate: "2025-06-07",
      tags: ["fitness", "health"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
}

// Helpers
const readTodos = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeTodos = (todos) => fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));

// GET /api/todos — list with search, filter, sort, pagination
app.get("/api/todos", (req, res) => {
  let todos = readTodos();
  const { search, status, priority, category, sort = "createdAt", order = "desc", page = 1, limit = 5 } = req.query;

  if (search) {
    const q = search.toLowerCase();
    todos = todos.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }
  if (status && status !== "All") todos = todos.filter((t) => t.status === status);
  if (priority && priority !== "All") todos = todos.filter((t) => t.priority === priority);
  if (category && category !== "All") todos = todos.filter((t) => t.category === category);

  todos.sort((a, b) => {
    let valA = a[sort] || "";
    let valB = b[sort] || "";
    if (sort === "dueDate") { valA = new Date(valA); valB = new Date(valB); }
    if (order === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const total = todos.length;
  const totalPages = Math.ceil(total / parseInt(limit));
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = todos.slice(start, start + parseInt(limit));

  // Stats over full (unfiltered) dataset
  const allTodos = readTodos();
  const stats = {
    total: allTodos.length,
    completed: allTodos.filter((t) => t.status === "Completed").length,
    pending: allTodos.filter((t) => t.status === "Pending").length,
    highPriority: allTodos.filter((t) => t.priority === "High").length,
  };

  res.json({ todos: paginated, total, totalPages, page: parseInt(page), stats });
});

// GET /api/todos/:id
app.get("/api/todos/:id", (req, res) => {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

// POST /api/todos
app.post("/api/todos", (req, res) => {
  const { title, description, category, priority, dueDate, tags } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

  const newTodo = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim() || "",
    category: category || "Personal",
    priority: priority || "Medium",
    status: "Pending",
    dueDate: dueDate || null,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const todos = readTodos();
  todos.unshift(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id
app.put("/api/todos/:id", (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Todo not found" });

  const allowed = ["title", "description", "category", "priority", "status", "dueDate", "tags"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) todos[idx][field] = req.body[field];
  });
  todos[idx].updatedAt = new Date().toISOString();

  writeTodos(todos);
  res.json(todos[idx]);
});

// PATCH /api/todos/:id/toggle — toggle status quickly
app.patch("/api/todos/:id/toggle", (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Todo not found" });

  todos[idx].status = todos[idx].status === "Completed" ? "Pending" : "Completed";
  todos[idx].updatedAt = new Date().toISOString();
  writeTodos(todos);
  res.json(todos[idx]);
});

// DELETE /api/todos/:id
app.delete("/api/todos/:id", (req, res) => {
  let todos = readTodos();
  const exists = todos.find((t) => t.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Todo not found" });

  todos = todos.filter((t) => t.id !== req.params.id);
  writeTodos(todos);
  res.json({ message: "Todo deleted successfully" });
});

// DELETE /api/todos — bulk delete by ids
app.delete("/api/todos", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  let todos = readTodos();
  todos = todos.filter((t) => !ids.includes(t.id));
  writeTodos(todos);
  res.json({ message: `${ids.length} todos deleted` });
});

app.get("/", (req, res) => res.json({ message: "Todo API running", version: "1.0.0" }));

app.listen(PORT, () => console.log(`✅  Todo API running on http://localhost:${PORT}`));
