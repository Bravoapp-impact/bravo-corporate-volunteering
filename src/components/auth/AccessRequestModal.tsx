import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Briefcase, Heart, User, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BaseModal } from "@/components/common/BaseModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const accessRequestSchema = z.object({
  firstName: z.string().trim().max(100, "Nome troppo lungo").optional(),
  lastName: z.string().trim().max(100, "Cognome troppo lungo").optional(),
  email: z.string().trim().email("Email non valida").max(255, "Email troppo lunga"),
  phone: z.string().trim().max(30, "Telefono troppo lungo").optional(),
  city: z.string().trim().max(100, "Città troppo lunga").optional(),
  companyName: z.string().trim().max(200, "Nome azienda troppo lungo").optional(),
  associationName: z.string().trim().max(200, "Nome associazione troppo lungo").optional(),
  roleInCompany: z.string().trim().max(100, "Ruolo troppo lungo").optional(),
  message: z.string().trim().max(1000, "Messaggio troppo lungo (max 1000 caratteri)").optional(),
});

type RequestType = "employee_needs_code" | "company_lead" | "association_lead" | "individual_waitlist";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const REQUEST_OPTIONS = [
  {
    type: "employee_needs_code" as RequestType,
    label: "Lavoro in un'azienda che usa Bravo",
    icon: Building2,
  },
  {
    type: "company_lead" as RequestType,
    label: "Vorrei portare Bravo nella mia azienda",
    icon: Briefcase,
  },
  {
    type: "association_lead" as RequestType,
    label: "Rappresento un'associazione",
    icon: Heart,
  },
  {
    type: "individual_waitlist" as RequestType,
    label: "Sono interessato come privato",
    icon: User,
  },
];

const SUCCESS_MESSAGES: Record<RequestType, { title: string; message: string; showCalLink?: boolean }> = {
  employee_needs_code: {
    title: "Richiesta inviata!",
    message: "Ti metteremo in contatto con il referente della tua azienda per farti avere il codice di accesso",
  },
  company_lead: {
    title: "Grazie per il tuo interesse!",
    message: "Ti va se ci prendiamo qualche minuto per approfondire tutti i dettagli? Prenota una chiamata con noi:",
    showCalLink: true,
  },
  association_lead: {
    title: "Richiesta ricevuta!",
    message: "Grazie per aver richiesto di far parte dell'ecosistema Bravo!. Prendiamo subito in carico la tua richiesta e ti ricontattiamo al più presto",
  },
  individual_waitlist: {
    title: "Sei in lista!",
    message: "Grazie davvero per il tuo interesse. Stiamo lavorando per aprire Bravo! anche ai privati. Ti avviseremo non appena sarà tutto pronto!",
  },
};

export function AccessRequestModal({ open, onClose }: AccessRequestModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    companyName: "",
    associationName: "",
    roleInCompany: "",
    message: "",
  });

  const handleTypeSelect = (type: RequestType) => {
    setRequestType(type);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setRequestType(null);
    }
  };

  const handleClose = () => {
    setStep(1);
    setRequestType(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      companyName: "",
      associationName: "",
      roleInCompany: "",
      message: "",
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;

    setIsSubmitting(true);

    try {
      const validated = accessRequestSchema.parse(formData);

      const { error } = await supabase.from("access_requests").insert({
        request_type: requestType,
        first_name: validated.firstName || null,
        last_name: validated.lastName || null,
        email: validated.email,
        phone: validated.phone || null,
        city: validated.city || null,
        company_name: validated.companyName || null,
        association_name: validated.associationName || null,
        role_in_company: validated.roleInCompany || null,
        message: validated.message || null,
      });

      if (error) throw error;

      setStep(3);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]?.message || "Dati non validi";
        toast({
          variant: "destructive",
          title: "Dati non validi",
          description: firstError,
          duration: 3000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Si è verificato un errore. Riprova più tardi.",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-semibold">Non hai un codice?</h2>
            <p className="text-sm text-muted-foreground">
              Bravo! per ora funziona solamente tramite accesso riservato. Il codice può esserti fornito dalla tua azienda o dalla tua associazione no profit. Se ci dici chi sei però possiamo aiutarti
            </p>
          </div>

          <div className="grid gap-3">
            {REQUEST_OPTIONS.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => handleTypeSelect(option.type)}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-left min-h-[64px]"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 3 && requestType) {
      const successInfo = SUCCESS_MESSAGES[requestType];
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <span className="text-3xl text-primary">✓</span>
          </div>
          <h2 className="text-xl font-semibold">{successInfo.title}</h2>
          <p className="text-muted-foreground">{successInfo.message}</p>
          
          {successInfo.showCalLink && (
            <a
              href="https://app.cal.com/bravoapp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Prenota una chiamata
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <Button variant="outline" onClick={handleClose} className="mt-4">
            Chiudi
          </Button>
        </div>
      );
    }

    // Step 2: Dynamic form based on request type
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Completa i tuoi dati</h2>
        </div>

        {requestType === "employee_needs_code" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email aziendale *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome azienda *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </div>
          </>
        )}

        {requestType === "company_lead" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome azienda *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleInCompany">Ruolo *</Label>
              <Input
                id="roleInCompany"
                name="roleInCompany"
                value={formData.roleInCompany}
                onChange={handleChange}
                required
                autoComplete="organization-title"
              />
            </div>
          </>
        )}

        {requestType === "association_lead" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome referente *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="associationName">Nome associazione *</Label>
              <Input
                id="associationName"
                name="associationName"
                value={formData.associationName}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </>
        )}

        {requestType === "individual_waitlist" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Invia richiesta"
          )}
        </Button>
      </form>
    );
  };

  return (
    <BaseModal open={open} onClose={handleClose}>
      <div className="p-6 overflow-y-auto max-h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 2 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 2 ? -20 : 20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </BaseModal>
  );
}
