import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ChallengeMFA } from "@/components/auth/ChallengeMFA";
import { signIn } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateByRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role === "super_admin") {
      navigate("/super-admin");
    } else if (profile?.role === "hr_admin") {
      navigate("/hr");
    } else if (profile?.role === "association_admin") {
      navigate("/association");
    } else {
      navigate("/app/experiences");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn({ email, password });
      
      // Check MFA status
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (!aalError && aalData?.nextLevel === "aal2" && aalData?.currentLevel === "aal1") {
        // MFA required - show challenge screen
        setShowMFAChallenge(true);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Benvenuto!",
        description: "Accesso effettuato con successo.",
      });

      const user = result?.user;
      if (user) {
        await navigateByRole(user.id);
      } else {
        navigate("/app/experiences");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore di accesso",
        description: error.message || "Credenziali non valide. Riprova.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASuccess = async () => {
    toast({
      title: "Benvenuto!",
      description: "Accesso effettuato con successo.",
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await navigateByRole(user.id);
    } else {
      navigate("/app/experiences");
    }
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setShowMFAChallenge(false);
  };

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast({
        title: "Email inviata!",
        description: `Abbiamo reinviato l'email di conferma a ${resendEmail}. Controlla la tua casella (anche lo spam).`,
      });
      setShowResend(false);
      setResendEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile inviare l'email. Riprova.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (showMFAChallenge) {
    return <ChallengeMFA onSuccess={handleMFASuccess} onCancel={handleMFACancel} />;
  }

  return (
    <AuthLayout title="Bentornato" subtitle="Inserisci i tuoi dati per accedere">
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="esempio@dominio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Password dimenticata?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Accedi
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        Non hai ancora un account?{" "}
        <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Registrati
        </Link>
      </motion.p>

      {/* Resend confirmation email */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-4 text-center"
      >
        <button
          type="button"
          onClick={() => setShowResend(!showResend)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Non hai ricevuto l'email di conferma?
        </button>

        <AnimatePresence>
          {showResend && (
            <motion.form
              key="resend-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleResendConfirmation}
              className="mt-4 overflow-hidden"
            >
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3 text-left">
                <p className="text-xs text-muted-foreground">
                  Inserisci la tua email e ti reinvieremo il link di conferma.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="esempio@dominio.it"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="pl-10 h-9 text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Reinvia email di conferma
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthLayout>
  );
}
