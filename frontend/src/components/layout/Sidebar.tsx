"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Activity,
  Zap,
  X,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["ADMIN", "MANAGER", "MEMBER"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <FolderKanban className="h-4 w-4" />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-4 w-4" />,
    roles: ["ADMIN", "MANAGER", "MEMBER"],
  },
  {
    label: "Activity",
    href: "/activity",
    icon: <Activity className="h-4 w-4" />,
    roles: ["ADMIN", "MANAGER"],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface SidebarContentProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  showToggle?: boolean;
}

function SidebarContent({
  isCollapsed = false,
  onToggleCollapse,
  showToggle = false,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo & Toggle Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b border-border/50 py-5",
            isCollapsed ? "px-3 justify-center" : "px-4"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold gradient-text truncate">
                TaskFlow
              </span>
            )}
          </div>
          {showToggle && !isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {showToggle && isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="absolute left-16 top-5 bg-background border border-border rounded-full p-1 shadow-md text-muted-foreground hover:text-foreground z-50 transition-all hover:scale-105"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Role Badge */}
        {user && !isCollapsed && (
          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav
          className={cn(
            "px-3 py-4 space-y-1",
            isCollapsed ? "flex flex-col items-center" : ""
          )}
        >
          {filteredItems.map((item) => {
            const resolvedHref =
              item.href === "/dashboard" && user?.role === "ADMIN"
                ? "/admin"
                : item.href;
            const isActive =
              pathname === resolvedHref ||
              pathname.startsWith(resolvedHref + "/");
            return (
              <Link
                key={item.href}
                href={resolvedHref}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  isCollapsed ? "justify-center px-0 h-10 w-10" : ""
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && <span>{item.label}</span>}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom user info (Active Profile Link) */}
      {user && (
        <div className="border-t border-border/50 p-4">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg p-1.5 hover:bg-accent/60 transition-all group duration-200",
              isCollapsed ? "justify-center p-0" : ""
            )}
            title={isCollapsed ? "View Profile" : undefined}
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-bold transition-transform group-hover:scale-105",
                "from-violet-500 to-purple-600"
              )}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:rotate-45 transition-transform duration-300" />
            )}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-shrink-0 flex-col border-r border-border/50 bg-sidebar h-full transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          showToggle
        />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border/50 bg-sidebar lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
