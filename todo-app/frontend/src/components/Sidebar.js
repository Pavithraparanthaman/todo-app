import React from "react";

const NAV = [
  { key: "all", label: "All Todos", icon: "🏠", filter: {} },
  { key: "completed", label: "Completed", icon: "✅", filter: { status: "Completed" } },
  { key: "pending", label: "Pending", icon: "🕐", filter: { status: "Pending" } },
  { key: "high", label: "High Priority", icon: "🚩", filter: { priority: "High" } },
  { key: "categories", label: "Categories", icon: "📁", filter: {} },
];

export default function Sidebar({ active, onNav, stats }) {
  const badges = {
    all: stats?.total,
    completed: stats?.completed,
    pending: stats?.pending,
    high: stats?.highPriority,
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        TodoApp
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {NAV.map((n) => (
          <div
            key={n.key}
            className={`nav-item ${active === n.key ? "active" : ""}`}
            onClick={() => onNav(n.key, n.filter)}
          >
            <span>{n.icon}</span>
            <span>{n.label}</span>
            {badges[n.key] !== undefined && (
              <span className="nav-badge">{badges[n.key]}</span>
            )}
          </div>
        ))}

        <div className="nav-label" style={{ marginTop: 16 }}>Other</div>
        <div className="nav-item" onClick={() => window.open("https://github.com", "_blank")}>
          <span>ℹ️</span><span>About</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-promo">
          <div className="promo-icon">📋</div>
          <p>Stay productive!</p>
          <span>Organize your tasks and get things done.</span>
        </div>
      </div>
    </aside>
  );
}
