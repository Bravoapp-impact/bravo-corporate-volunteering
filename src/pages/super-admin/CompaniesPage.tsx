import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Building2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { devLog } from "@/lib/logger";
import { LogoUpload } from "@/components/super-admin/LogoUpload";

interface Company {
  id: string;
  name: string;
  access_code: string;
  logo_url: string | null;
  created_at: string;
  _count?: {
    users: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    access_code: "",
    logo_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Get companies with user count
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user counts for each company
      const companiesWithCounts = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("company_id", company.id);

          return {
            ...company,
            _count: { users: count || 0 },
          };
        })
      );

      setCompanies(companiesWithCounts);
    } catch (error) {
      devLog.error("Error fetching companies:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le aziende",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name,
        access_code: company.access_code,
        logo_url: company.logo_url || "",
      });
    } else {
      setSelectedCompany(null);
      setFormData({
        name: "",
        access_code: generateAccessCode(),
        logo_url: "",
      });
    }
    setDialogOpen(true);
  };

  const generateAccessCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.access_code.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Nome e codice accesso sono obbligatori",
      });
      return;
    }

    setSaving(true);
    try {
      if (selectedCompany) {
        // Update
        const { error } = await supabase
          .from("companies")
          .update({
            name: formData.name,
            access_code: formData.access_code,
            logo_url: formData.logo_url || null,
          })
          .eq("id", selectedCompany.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Azienda aggiornata",
        });
      } else {
        // Create
        const { error } = await supabase.from("companies").insert({
          name: formData.name,
          access_code: formData.access_code,
          logo_url: formData.logo_url || null,
        });

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Azienda creata",
        });
      }

      setDialogOpen(false);
      fetchCompanies();
    } catch (error: any) {
      devLog.error("Error saving company:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile salvare l'azienda",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", selectedCompany.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Azienda eliminata",
      });

      setDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error: any) {
      devLog.error("Error deleting company:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          error.message || "Impossibile eliminare l'azienda. Potrebbe avere utenti associati.",
      });
    }
  };

  const copyAccessCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.access_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aziende</h1>
            <p className="text-muted-foreground">
              Gestisci le aziende clienti della piattaforma
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuova Azienda
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">
                  {companies.length} Aziende
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Azienda</TableHead>
                      <TableHead>Codice Accesso</TableHead>
                      <TableHead>Utenti</TableHead>
                      <TableHead>Creata il</TableHead>
                      <TableHead className="w-24">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : filteredCompanies.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nessuna azienda trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompanies.map((company, index) => (
                        <motion.tr
                          key={company.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-border last:border-0"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {company.logo_url ? (
                                <img
                                  src={company.logo_url}
                                  alt={company.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <span className="font-medium">{company.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                                {company.access_code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  copyAccessCode(company.access_code, company.id)
                                }
                              >
                                {copiedId === company.id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{company._count?.users || 0}</TableCell>
                          <TableCell>
                            {format(new Date(company.created_at), "dd MMM yyyy", {
                              locale: it,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenDialog(company)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? "Modifica Azienda" : "Nuova Azienda"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome azienda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_code">Codice Accesso *</Label>
              <div className="flex gap-2">
                <Input
                  id="access_code"
                  value={formData.access_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      access_code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="CODICE123"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({ ...formData, access_code: generateAccessCode() })
                  }
                >
                  Genera
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo (opzionale)</Label>
              <LogoUpload
                currentLogoUrl={formData.logo_url || null}
                onLogoChange={(url) =>
                  setFormData({ ...formData, logo_url: url || "" })
                }
                companyId={selectedCompany?.id}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa azienda?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'azienda "
              {selectedCompany?.name}" verrà eliminata permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SuperAdminLayout>
  );
}
