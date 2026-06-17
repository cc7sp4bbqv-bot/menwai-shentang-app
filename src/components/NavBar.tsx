import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/reading", icon: "📖", label: "阅读" },
  { path: "/discussion", icon: "💬", label: "讨论" },
  { path: "/reflection", icon: "🪞", label: "复盘" },
  { path: "/profile", icon: "👤", label: "我的" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="nav-bar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
