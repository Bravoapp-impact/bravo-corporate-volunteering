import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getAllSDGs, SDGInfo } from "@/lib/sdg-data";
import { Checkbox } from "@/components/ui/checkbox";
import { ExperienceDateDialog } from "@/components/super-admin/ExperienceDateDialog";

interface Experience {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  association_name: string | null;
  city: string | null;
  address: string | null;
  category: string | null;
  status: string;
  sdgs: string[] | null;
  created_at: string;
  experience_dates?: ExperienceDate[];
}

interface ExperienceDate {
  id: string;
  experience_id: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  volunteer_hours: number | null;
  beneficiaries_count: number | null;
}

const CATEGORIES = [
  "ambiente",
  "sociale",
  "educazione",
  "anziani",
  "animali",
  "cultura",
  "sport",
  "altro",
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Bozza" },
  { value: "published", label: "Pubblicata" },
  { value: "archived", label: "Archiviata" },
];

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<ExperienceDate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    association_name: "",
    city: "",
    address: "",
    category: "",
    status: "draft",
    sdgs: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const allSDGs = getAllSDGs();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*, experience_dates(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le esperienze",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (experience?: Experience) => {
    if (experience) {
      setSelectedExperience(experience);
      setFormData({
        title: experience.title,
        description: experience.description || "",
        image_url: experience.image_url || "",
        association_name: experience.association_name || "",
        city: experience.city || "",
        address: experience.address || "",
        category: experience.category || "",
        status: experience.status,
        sdgs: experience.sdgs || [],
      });
    } else {
      setSelectedExperience(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        association_name: "",
        city: "",
        address: "",
        category: "",
        status: "draft",
        sdgs: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il titolo è obbligatorio",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        association_name: formData.association_name || null,
        city: formData.city || null,
        address: formData.address || null,
        category: formData.category || null,
        status: formData.status,
        sdgs: formData.sdgs.length > 0 ? formData.sdgs : null,
      };

      if (selectedExperience) {
        const { error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", selectedExperience.id);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Esperienza aggiornata",
        });
      } else {
        const { error } = await supabase.from("experiences").insert(payload);

        if (error) throw error;

        toast({
          title: "Successo",
          description: "Esperienza creata",
        });
      }

      setDialogOpen(false);
      fetchExperiences();
    } catch (error: any) {
      console.error("Error saving experience:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile salvare l'esperienza",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;

    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", selectedExperience.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Esperienza eliminata",
      });

      setDeleteDialogOpen(false);
      setSelectedExperience(null);
      fetchExperiences();
    } catch (error: any) {
      console.error("Error deleting experience:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          error.message || "Impossibile eliminare l'esperienza. Potrebbe avere prenotazioni associate.",
      });
    }
  };

  const handleSDGToggle = (sdgCode: string) => {
    setFormData((prev) => ({
      ...prev,
      sdgs: prev.sdgs.includes(sdgCode)
        ? prev.sdgs.filter((s) => s !== sdgCode)
        : [...prev.sdgs, sdgCode],
    }));
  };

  const handleDateSaved = () => {
    fetchExperiences();
    setDateDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDeleteDate = async (dateId: string) => {
    try {
      const { error } = await supabase
        .from("experience_dates")
        .delete()
        .eq("id", dateId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Data eliminata",
      });

      fetchExperiences();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare la data",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-secondary text-secondary-foreground">Pubblicata</Badge>;
      case "draft":
        return <Badge variant="outline">Bozza</Badge>;
      case "archived":
        return <Badge variant="secondary">Archiviata</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      !searchTerm ||
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.association_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Esperienze</h1>
            <p className="text-muted-foreground">
              Gestisci le esperienze di volontariato
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuova Esperienza
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
                  {experiences.length} Esperienze
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-background">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="published">Pubblicate</SelectItem>
                      <SelectItem value="draft">Bozze</SelectItem>
                      <SelectItem value="archived">Archiviate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Esperienza</TableHead>
                      <TableHead>Città</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-24">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Caricamento...
                        </TableCell>
                      </TableRow>
                    ) : filteredExperiences.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nessuna esperienza trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExperiences.map((experience, index) => (
                        <>
                          <motion.tr
                            key={experience.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="border-b border-border"
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setExpandedExperience(
                                    expandedExperience === experience.id
                                      ? null
                                      : experience.id
                                  )
                                }
                              >
                                {expandedExperience === experience.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {experience.image_url ? (
                                  <img
                                    src={experience.image_url}
                                    alt={experience.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{experience.title}</p>
                                  {experience.association_name && (
                                    <p className="text-xs text-muted-foreground">
                                      {experience.association_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {experience.city ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  {experience.city}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {experience.category ? (
                                <Badge variant="outline" className="capitalize">
                                  {experience.category}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(experience.status)}</TableCell>
                            <TableCell>
                              {experience.experience_dates?.length || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenDialog(experience)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedExperience(experience);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                          {/* Expanded dates section */}
                          {expandedExperience === experience.id && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">
                                      Date Esperienza
                                    </h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedExperience(experience);
                                        setSelectedDate(null);
                                        setDateDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Aggiungi Data
                                    </Button>
                                  </div>
                                  {experience.experience_dates &&
                                  experience.experience_dates.length > 0 ? (
                                    <div className="grid gap-2">
                                      {experience.experience_dates
                                        .sort(
                                          (a, b) =>
                                            new Date(a.start_datetime).getTime() -
                                            new Date(b.start_datetime).getTime()
                                        )
                                        .map((date) => (
                                          <div
                                            key={date.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                                          >
                                            <div className="flex items-center gap-4">
                                              <div>
                                                <p className="font-medium text-sm">
                                                  {format(
                                                    new Date(date.start_datetime),
                                                    "EEEE d MMMM yyyy",
                                                    { locale: it }
                                                  )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {format(
                                                    new Date(date.start_datetime),
                                                    "HH:mm"
                                                  )}{" "}
                                                  -{" "}
                                                  {format(
                                                    new Date(date.end_datetime),
                                                    "HH:mm"
                                                  )}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                  <Users className="h-4 w-4" />
                                                  {date.max_participants} posti
                                                </span>
                                                {date.volunteer_hours && (
                                                  <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {date.volunteer_hours}h
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                  setSelectedExperience(experience);
                                                  setSelectedDate(date);
                                                  setDateDialogOpen(true);
                                                }}
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteDate(date.id)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                      Nessuna data programmata
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create/Edit Experience Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>
              {selectedExperience ? "Modifica Esperienza" : "Nuova Esperienza"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Titolo esperienza"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrizione dettagliata..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="association_name">Associazione</Label>
                <Input
                  id="association_name"
                  value={formData.association_name}
                  onChange={(e) =>
                    setFormData({ ...formData, association_name: e.target.value })
                  }
                  placeholder="Nome associazione"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Città"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Via..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL Immagine</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>SDGs (Obiettivi di Sviluppo Sostenibile)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-border rounded-lg max-h-48 overflow-y-auto">
                {allSDGs.map((sdg) => (
                  <div key={sdg.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={sdg.code}
                      checked={formData.sdgs.includes(sdg.code)}
                      onCheckedChange={() => handleSDGToggle(sdg.code)}
                    />
                    <label
                      htmlFor={sdg.code}
                      className="text-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{sdg.icon}</span>
                      <span className="truncate">{sdg.name}</span>
                    </label>
                  </div>
                ))}
              </div>
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
            <AlertDialogTitle>Eliminare questa esperienza?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'esperienza "
              {selectedExperience?.title}" verrà eliminata permanentemente.
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

      {/* Experience Date Dialog */}
      <ExperienceDateDialog
        open={dateDialogOpen}
        onOpenChange={setDateDialogOpen}
        experienceId={selectedExperience?.id || ""}
        experienceDate={selectedDate}
        onSaved={handleDateSaved}
      />
    </SuperAdminLayout>
  );
}
