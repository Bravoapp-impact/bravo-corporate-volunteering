import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChallengeMFAProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChallengeMFA({ onSuccess, onCancel }: ChallengeMFAProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);

    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactors = factorsData?.totp?.filter((f) => f.status === "verified") ?? [];
      if (totpFactors.length === 0) throw new Error("Nessun fattore MFA trovato");

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: totpFactors[0].id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactors[0].id,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Codice non valido",
        description: error.message || "Verifica il codice e riprova.",
      });
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout title="Verifica identità" subtitle="Inserisci il codice dall'app authenticator">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Apri la tua app authenticator (Google Authenticator, Authy, ecc.) e inserisci il codice a 6 cifre.
        </p>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            className="w-full h-12 text-base font-medium"
            disabled={code.length !== 6 || verifying}
          >
            {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verifica"}
          </Button>

          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            Torna al login
          </Button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
