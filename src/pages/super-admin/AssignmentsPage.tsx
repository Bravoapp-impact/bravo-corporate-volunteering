import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Building2, Calendar, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: string;
  title: string;
  status: string;
  city: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface Assignment {
  experience_id: string;
  company_id: string;
}

export default function AssignmentsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [experiencesRes, companiesRes, assignmentsRes] = await Promise.all([
        supabase
          .from("experiences")
          .select("id, title, status, city")
          .order("title"),
        supabase.from("companies").select("id, name").order("name"),
        supabase.from("experience_companies").select("experience_id, company_id"),
      ]);

      if (experiencesRes.error) throw experiencesRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setExperiences(experiencesRes.data || []);
      setCompanies(companiesRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i dati",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (experienceId: string, companyId: string) => {
    return assignments.some(
      (a) => a.experience_id === experienceId && a.company_id === companyId
    );
  };

  const toggleAssignment = async (experienceId: string, companyId: string) => {
    setSaving(true);
    try {
      if (isAssigned(experienceId, companyId)) {
        // Remove assignment
        const { error } = await supabase
          .from("experience_companies")
          .delete()
          .eq("experience_id", experienceId)
          .eq("company_id", companyId);

        if (error) throw error;

        setAssignments((prev) =>
          prev.filter(
            (a) => !(a.experience_id === experienceId && a.company_id === companyId)
          )
        );

        toast({
          title: "Rimosso",
          description: "Assegnazione rimossa",
        });
      } else {
        // Add assignment
        const { error } = await supabase.from("experience_companies").insert({
          experience_id: experienceId,
          company_id: companyId,
        });

        if (error) throw error;

        setAssignments((prev) => [
          ...prev,
          { experience_id: experienceId, company_id: companyId },
        ]);

        toast({
          title: "Assegnato",
          description: "Esperienza assegnata all'azienda",
        });
      }
    } catch (error: any) {
      console.error("Error toggling assignment:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile modificare l'assegnazione",
      });
    } finally {
      setSaving(false);
    }
  };

  const assignAllToCompany = async (companyId: string) => {
    setSaving(true);
    try {
      const unassignedExperiences = experiences.filter(
        (exp) => !isAssigned(exp.id, companyId)
      );

      if (unassignedExperiences.length === 0) {
        toast({
          title: "Info",
          description: "Tutte le esperienze sono già assegnate a questa azienda",
        });
        return;
      }

      const newAssignments = unassignedExperiences.map((exp) => ({
        experience_id: exp.id,
        company_id: companyId,
      }));

      const { error } = await supabase
        .from("experience_companies")
        .insert(newAssignments);

      if (error) throw error;

      setAssignments((prev) => [...prev, ...newAssignments]);

      toast({
        title: "Successo",
        description: `${newAssignments.length} esperienze assegnate`,
      });
    } catch (error: any) {
      console.error("Error bulk assigning:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile assegnare le esperienze",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAllFromCompany = async (companyId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("experience_companies")
        .delete()
        .eq("company_id", companyId);

      if (error) throw error;

      setAssignments((prev) => prev.filter((a) => a.company_id !== companyId));

      toast({
        title: "Successo",
        description: "Tutte le assegnazioni rimosse",
      });
    } catch (error: any) {
      console.error("Error removing all:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile rimuovere le assegnazioni",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const matchesSearch =
        !searchTerm ||
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.city?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [experiences, searchTerm]);

  const getAssignmentCountForExperience = (experienceId: string) => {
    return assignments.filter((a) => a.experience_id === experienceId).length;
  };

  const getAssignmentCountForCompany = (companyId: string) => {
    return assignments.filter((a) => a.company_id === companyId).length;
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Assegnazioni</h1>
          <p className="text-muted-foreground">
            Assegna esperienze alle aziende
          </p>
        </motion.div>

        {/* Filter by company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="w-full sm:w-64 bg-background">
                      <SelectValue placeholder="Seleziona azienda" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">Tutte le aziende</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{company.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {getAssignmentCountForCompany(company.id)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCompany !== "all" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => assignAllToCompany(selectedCompany)}
                      disabled={saving}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Assegna tutte
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAllFromCompany(selectedCompany)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rimuovi tutte
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Experiences Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Esperienze</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca esperienza..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Caricamento...</div>
              ) : selectedCompany === "all" ? (
                // Matrix view when no company selected
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Esperienza</th>
                        {companies.map((company) => (
                          <th
                            key={company.id}
                            className="p-3 font-medium text-center min-w-[120px]"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs truncate max-w-[100px]">
                                {company.name}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExperiences.map((experience) => (
                        <tr
                          key={experience.id}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{experience.title}</span>
                              {experience.status !== "published" && (
                                <Badge variant="outline" className="text-xs">
                                  {experience.status}
                                </Badge>
                              )}
                            </div>
                          </td>
                          {companies.map((company) => (
                            <td key={company.id} className="p-3 text-center">
                              <Checkbox
                                checked={isAssigned(experience.id, company.id)}
                                onCheckedChange={() =>
                                  toggleAssignment(experience.id, company.id)
                                }
                                disabled={saving}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredExperiences.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      Nessuna esperienza trovata
                    </p>
                  )}
                </div>
              ) : (
                // List view when a company is selected
                <div className="space-y-2">
                  {filteredExperiences.map((experience) => {
                    const assigned = isAssigned(experience.id, selectedCompany);
                    return (
                      <div
                        key={experience.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          assigned
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={assigned}
                            onCheckedChange={() =>
                              toggleAssignment(experience.id, selectedCompany)
                            }
                            disabled={saving}
                          />
                          <div>
                            <p className="font-medium">{experience.title}</p>
                            {experience.city && (
                              <p className="text-xs text-muted-foreground">
                                {experience.city}
                              </p>
                            )}
                          </div>
                        </div>
                        {experience.status !== "published" && (
                          <Badge variant="outline">{experience.status}</Badge>
                        )}
                      </div>
                    );
                  })}
                  {filteredExperiences.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      Nessuna esperienza trovata
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SuperAdminLayout>
  );
}
