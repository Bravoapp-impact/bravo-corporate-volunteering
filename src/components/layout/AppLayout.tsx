import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Calendar, User, Ticket, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const isHRAdmin = profile?.role === "hr_admin";

  const companyLogo = profile?.companies?.logo_url;

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/experiences" className="flex items-center gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-primary"
              >
                Bravo!
              </motion.span>
            </Link>
            
            {companyLogo && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center"
              >
                <div className="w-px h-6 bg-border/50 mr-4" />
                <img
                  src={companyLogo}
                  alt={profile?.companies?.name || "Company logo"}
                  className="h-8 w-auto max-w-[120px] object-contain"
                />
              </motion.div>
            )}
          </div>

          <nav className="flex items-center gap-2 sm:gap-6">
            {isHRAdmin && (
              <Link
                to="/hr"
                className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive("/hr")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard HR</span>
              </Link>
            )}

            <Link
              to="/app/experiences"
              className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/app/experiences")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Esperienze</span>
            </Link>

            <Link
              to="/app/bookings"
              className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/app/bookings")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Prenotazioni</span>
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
