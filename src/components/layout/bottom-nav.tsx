import { NavLink } from "react-router";
import { Timer, CalendarDays, BarChart3, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Timer, label: "タイマー" },
  { to: "/history", icon: CalendarDays, label: "履歴" },
  { to: "/stats", icon: BarChart3, label: "統計" },
  { to: "/goals", icon: Target, label: "目標" },
  { to: "/settings", icon: Settings, label: "設定" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
