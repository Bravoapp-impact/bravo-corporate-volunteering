import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, LayoutDashboard, Calendar, Ticket, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HRLayoutProps {
  children: ReactNode;
}

export function HRLayout({ children }: HRLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/hr" className="flex items-center gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-primary"
              >
                Bravo!
              </motion.span>
            </Link>
            <Badge variant="secondary" className="bg-sage-light text-sage font-medium">
              HR Admin
            </Badge>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/hr"
              className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/hr")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              to="/app/experiences"
              className="text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Esperienze</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden md:inline text-sm">
                    {profile?.first_name || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  {profile?.companies && (
                    <p className="text-xs text-primary mt-1">
                      {profile.companies.name}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">{children}</main>
    </div>
  );
}
