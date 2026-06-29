import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import TodoList from "./pages/TodoList";
import TodoDetail from "./pages/TodoDetail";
import { ToastProvider } from "./components/Toast";

// Simple client-side router using URL hash
function getRoute() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/todo\/(.+)$/);
  if (match) return { page: "detail", id: match[1] };
  return { page: "list" };
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [activeNav, setActiveNav] = useState("all");
  const [navFilters, setNavFilters] = useState({});
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0 });

  const navigate = (path) => {
    window.location.hash = path;
    if (path === "/" || path === "") {
      setRoute({ page: "list" });
    } else {
      const match = path.match(/^\/todo\/(.+)$/);
      if (match) setRoute({ page: "detail", id: match[1] });
    }
  };

  const handleNav = (key, filters) => {
    setActiveNav(key);
    setNavFilters(filters);
    setRoute({ page: "list" });
    window.location.hash = "#/";
  };

  // Listen for browser back/forward
  React.useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar active={activeNav} onNav={handleNav} stats={stats} />
        {route.page === "list"
          ? <TodoList navigate={navigate} initialFilters={navFilters} onStatsLoad={setStats} />
          : <TodoDetail id={route.id} navigate={navigate} />
        }
      </div>
    </ToastProvider>
  );
}
