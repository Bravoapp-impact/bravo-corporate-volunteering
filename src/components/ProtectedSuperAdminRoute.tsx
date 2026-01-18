import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedSuperAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedSuperAdminRoute({ children }: ProtectedSuperAdminRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== "super_admin") {
    // Redirect based on role
    if (profile?.role === "hr_admin") {
      return <Navigate to="/hr" replace />;
    }
    return <Navigate to="/app/experiences" replace />;
  }

  return <>{children}</>;
}
