import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AssociationLayout } from "@/components/layout/AssociationLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Building, Globe, Mail, Phone, MapPin, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { devLog } from "@/lib/logger";
import { LogoUpload } from "@/components/super-admin/LogoUpload";

interface AssociationProfile {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
}

export default function AssociationProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [association, setAssociation] = useState<AssociationProfile | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    logo_url: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    address: "",
  });

  useEffect(() => {
    if (profile?.association_id) {
      fetchAssociationProfile();
    }
  }, [profile?.association_id]);

  const fetchAssociationProfile = async () => {
    if (!profile?.association_id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("associations")
        .select("*")
        .eq("id", profile.association_id)
        .single();

      if (error) {
        devLog.error("Error fetching association:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati dell'associazione.",
          variant: "destructive",
        });
        return;
      }

      setAssociation(data);
      setFormData({
        description: data.description || "",
        logo_url: data.logo_url || "",
        contact_name: data.contact_name || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        website: data.website || "",
        address: data.address || "",
      });
    } catch (error) {
      devLog.error("Error in fetchAssociationProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (url: string | null) => {
    setFormData((prev) => ({ ...prev, logo_url: url || "" }));
  };

  const handleSave = async () => {
    if (!profile?.association_id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("associations")
        .update({
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          website: formData.website || null,
          address: formData.address || null,
        })
        .eq("id", profile.association_id);

      if (error) {
        devLog.error("Error updating association:", error);
        toast({
          title: "Errore",
          description: "Impossibile salvare le modifiche.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Salvato",
        description: "Il profilo dell'associazione è stato aggiornato.",
      });

      // Refresh profile to get updated association data
      await refreshProfile();
    } catch (error) {
      devLog.error("Error in handleSave:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AssociationLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Caricamento profilo...</p>
          </div>
        </div>
      </AssociationLayout>
    );
  }

  return (
    <AssociationLayout>
      <div className="space-y-6 sm:space-y-8 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-foreground">Profilo Associazione</h1>
          <p className="text-muted-foreground mt-1 text-[13px]">
            Gestisci le informazioni della tua associazione
          </p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                {association?.name}
              </CardTitle>
              <CardDescription>
                Modifica le informazioni pubbliche della tua associazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <LogoUpload
                  currentLogoUrl={formData.logo_url || null}
                  onLogoChange={handleLogoChange}
                  bucket="association-logos"
                  entityId={profile?.association_id || "temp"}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descrivi la tua associazione e la sua missione..."
                  rows={4}
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="contact_name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome Referente
                </Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange("contact_name", e.target.value)}
                  placeholder="Nome e cognome del referente"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email di Contatto
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="email@associazione.it"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Telefono
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Sito Web
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.associazione.it"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Indirizzo Sede
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Via Roma 1, 00100 Roma"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salva Modifiche
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AssociationLayout>
  );
}
