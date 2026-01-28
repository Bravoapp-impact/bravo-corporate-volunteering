import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AccessRequestModal } from "@/components/auth/AccessRequestModal";
import { signUp, validateAccessCode } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    accessCode: "",
  });
  const [entityName, setEntityName] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessRequestModalOpen, setAccessRequestModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset entity validation when code changes
    if (name === "accessCode") {
      setEntityName(null);
    }
  };

  const handleCodeBlur = async () => {
    if (formData.accessCode.length < 3) return;

    setIsValidatingCode(true);
    try {
      const codeInfo = await validateAccessCode(formData.accessCode);
      if (codeInfo) {
        setEntityName(codeInfo.entity_name);
      } else {
        setEntityName(null);
      }
    } catch {
      setEntityName(null);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accessCode: formData.accessCode,
      });

      toast({
        title: "Registrazione completata!",
        description: `Benvenuto in ${result.entityName}. Ora puoi accedere.`,
      });

      // Redirect based on role
      if (result.role === 'hr_admin') {
        navigate("/hr");
      } else if (result.role === 'association_admin') {
        navigate("/association"); // TODO: create this route
      } else {
        navigate("/app/experiences");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore di registrazione",
        description: error.message || "Si è verificato un errore. Riprova.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea il tuo account"
      subtitle="Inserisci i tuoi dati per creare un account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          {/* Access Code - First! */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="accessCode">Codice di Accesso</Label>
              <button
                type="button"
                onClick={() => setAccessRequestModalOpen(true)}
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Non hai il codice di accesso?
              </button>
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="accessCode"
                name="accessCode"
                type="text"
                placeholder="Inserisci il codice di accesso"
                value={formData.accessCode}
                onChange={handleChange}
                onBlur={handleCodeBlur}
                className="pl-10"
                required
              />
              {isValidatingCode && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {entityName && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-secondary-foreground flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg"
              >
                <span className="text-lg">✓</span>
                {entityName}
              </motion.p>
            )}
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Mario"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Cognome</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Rossi"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="esempio@dominio.it"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimo 8 caratteri"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                minLength={8}
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
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !entityName}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Registrati
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
        Hai già un account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Accedi
        </Link>
      </motion.p>

      <AccessRequestModal
        open={accessRequestModalOpen}
        onClose={() => setAccessRequestModalOpen(false)}
      />
    </AuthLayout>
  );
}
