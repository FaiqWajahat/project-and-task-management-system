"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, LogOut, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAllActivity } from "@/hooks/useActivity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getAvatarGradient, cn } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
      href: "/" + seg,
    }));

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
      <span className="text-foreground font-medium">Home</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <span
            className={cn(
              i === segments.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {seg.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { data: activities } = useAllActivity();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const hasNotifications = activities && activities.length > 0;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notification bell dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent text-foreground transition-colors outline-none cursor-pointer">
            <Bell className="h-4 w-4" />
            {hasNotifications && (
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="font-semibold text-sm px-2 py-1.5">
              Recent Activity Updates
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto py-1 space-y-1">
              {activities?.slice(0, 5).map((act) => (
                <DropdownMenuItem
                  key={act.id}
                  className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-accent text-xs cursor-default outline-none"
                >
                  <p className="font-medium text-foreground leading-normal">
                    <span className="font-semibold text-primary">
                      {act.user?.name || "Someone"}
                    </span>{" "}
                    {act.action}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </DropdownMenuItem>
              ))}
              {(!activities || activities.length === 0) && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No recent activities recorded
                </div>
              )}
            </div>
            {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0 cursor-pointer">
                  <Link
                    href="/activity"
                    className="w-full text-center text-xs text-primary font-medium block py-1.5 hover:underline"
                  >
                    View all activity logs
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none cursor-pointer"
              id="user-menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className={cn(
                    "bg-gradient-to-br text-white text-xs font-bold",
                    getAvatarGradient(user.name)
                  )}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {user.name.split(" ")[0]}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary font-medium capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0 cursor-pointer" id="profile-menu-item">
                <Link href="/profile" className="flex items-center gap-2 w-full px-3 py-2 text-sm">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
                id="logout-menu-item"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
