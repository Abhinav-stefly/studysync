import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const navItems = [
  { to: "/", label: "Problems", end: true },
  { to: "/notes", label: "Notes" },
  { to: "/plans", label: "Study plans" },
  { to: "/rooms", label: "Study rooms" },
  { to: "/analytics", label: "Analytics" },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-ink/10 bg-paper px-4 py-6">
      <div className="mb-8 border-l-2 border-signal pl-3">
        <h1 className="font-display text-xl text-ink">StudySync</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-sm px-3 py-2 font-sans text-sm transition-colors ${
                isActive
                  ? "bg-signal/10 text-signal font-medium"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink/10 pt-4">
        <p className="truncate font-sans text-sm text-ink/70">{user?.name}</p>
        <button
          onClick={logout}
          className="mt-2 font-sans text-sm text-ink/50 underline hover:text-rust"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};