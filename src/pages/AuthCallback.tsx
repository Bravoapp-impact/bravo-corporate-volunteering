import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const redirectByRole = async () => {
      // Wait for Supabase to process the URL hash tokens
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // No session found — fallback to login
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const role = profile?.role;

      if (role === "super_admin") {
        navigate("/super-admin", { replace: true });
      } else if (role === "hr_admin") {
        navigate("/hr", { replace: true });
      } else if (role === "association_admin") {
        navigate("/association", { replace: true });
      } else {
        navigate("/app/experiences", { replace: true });
      }
    };

    // Give Supabase a moment to process the URL hash tokens
    const timer = setTimeout(redirectByRole, 300);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifica in corso...</p>
      </div>
    </div>
  );
}
