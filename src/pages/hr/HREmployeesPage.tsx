import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Loader2,
  Users,
  Search,
  Download,
  ArrowUpDown,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { HRLayout } from "@/components/layout/HRLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { devLog } from "@/lib/logger";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeParticipationsDialog } from "@/components/hr/EmployeeParticipationsDialog";

interface EmployeeStats {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  total_experiences: number;
  total_hours: number;
  last_participation: string | null;
}

type SortField = "name" | "experiences" | "hours" | "last_participation";
type SortDirection = "asc" | "desc";

export default function HREmployeesPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyNoParticipation, setShowOnlyNoParticipation] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Dialog state
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStats | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (profile?.company_id) {
      fetchEmployees();
    }
  }, [profile?.company_id]);

  const fetchEmployees = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all employees of the company (including hr_admin)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role")
        .eq("company_id", profile.company_id)
        .in("role", ["employee", "hr_admin"]);

      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      const userIds = profilesData.map((p) => p.id);

      // Fetch all bookings for these users with experience_dates for hours
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          user_id,
          status,
          experience_date_id,
          experience_dates!inner (
            start_datetime,
            volunteer_hours
          )
        `)
        .in("user_id", userIds)
        .eq("status", "confirmed");

      if (bookingsError) throw bookingsError;

      // Calculate stats per employee
      const statsMap = new Map<string, {
        total_experiences: number;
        total_hours: number;
        last_participation: string | null;
      }>();

      // Initialize all employees with zero stats
      profilesData.forEach((p) => {
        statsMap.set(p.id, {
          total_experiences: 0,
          total_hours: 0,
          last_participation: null,
        });
      });

      // Aggregate bookings data
      (bookingsData || []).forEach((booking) => {
        const stats = statsMap.get(booking.user_id);
        if (!stats) return;

        const expDate = booking.experience_dates as unknown as {
          start_datetime: string;
          volunteer_hours: number | null;
        };

        // Only count past experiences as "completed"
        const startDate = new Date(expDate.start_datetime);
        if (startDate > new Date()) return; // Skip future bookings

        stats.total_experiences += 1;
        stats.total_hours += expDate.volunteer_hours ? Number(expDate.volunteer_hours) : 0;

        if (
          !stats.last_participation ||
          new Date(expDate.start_datetime) > new Date(stats.last_participation)
        ) {
          stats.last_participation = expDate.start_datetime;
        }
      });

      // Combine profile data with stats
      const employeesWithStats: EmployeeStats[] = profilesData.map((p) => {
        const stats = statsMap.get(p.id)!;
        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          total_experiences: stats.total_experiences,
          total_hours: stats.total_hours,
          last_participation: stats.last_participation,
        };
      });

      setEmployees(employeesWithStats);
    } catch (err) {
      devLog.error("Error fetching employees:", err);
      setError("Errore nel caricamento dei dipendenti");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.email.toLowerCase().includes(search) ||
          (e.first_name?.toLowerCase() || "").includes(search) ||
          (e.last_name?.toLowerCase() || "").includes(search)
      );
    }

    // No participation filter
    if (showOnlyNoParticipation) {
      result = result.filter((e) => e.total_experiences === 0);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
          const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case "experiences":
          comparison = a.total_experiences - b.total_experiences;
          break;
        case "hours":
          comparison = a.total_hours - b.total_hours;
          break;
        case "last_participation":
          if (!a.last_participation && !b.last_participation) comparison = 0;
          else if (!a.last_participation) comparison = -1;
          else if (!b.last_participation) comparison = 1;
          else comparison = new Date(a.last_participation).getTime() - new Date(b.last_participation).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [employees, searchTerm, showOnlyNoParticipation, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEmployeeClick = (employee: EmployeeStats) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const exportCSV = () => {
    const headers = [
      "Nome",
      "Cognome",
      "Email",
      "Esperienze Completate",
      "Ore Totali",
      "Ultima Partecipazione",
    ];
    const rows = filteredEmployees.map((e) => [
      e.first_name || "",
      e.last_name || "",
      e.email,
      e.total_experiences.toString(),
      e.total_hours.toString(),
      e.last_participation
        ? format(new Date(e.last_participation), "dd/MM/yyyy")
        : "Mai",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dipendenti_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const noParticipationCount = employees.filter((e) => e.total_experiences === 0).length;

  if (loading) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Caricamento dipendenti...</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Errore di caricamento
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  // Empty state - no employees
  if (employees.length === 0) {
    return (
      <HRLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dipendenti</h1>
            <p className="text-muted-foreground mt-1">
              Monitora la partecipazione dei dipendenti
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nessun dipendente registrato
            </h2>
            <p className="text-muted-foreground max-w-md">
              Non ci sono ancora dipendenti registrati per la tua azienda.
              I dipendenti appariranno qui dopo la registrazione con il codice aziendale.
            </p>
          </div>
        </motion.div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Dipendenti</h1>
          <p className="text-muted-foreground mt-1">
            {employees.length} dipendent{employees.length === 1 ? "e" : "i"} registrat{employees.length === 1 ? "o" : "i"}
            {noParticipationCount > 0 && (
              <span className="text-warning"> • {noParticipationCount} da coinvolgere</span>
            )}
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* No participation filter */}
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  id="no-participation"
                  checked={showOnlyNoParticipation}
                  onCheckedChange={setShowOnlyNoParticipation}
                />
                <Label htmlFor="no-participation" className="text-sm cursor-pointer">
                  Mostra utenti da coinvolgere
                </Label>
              </div>

              {/* Export */}
              <Button
                variant="outline"
                onClick={exportCSV}
                className="gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Esporta CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 -ml-3 font-medium"
                      onClick={() => handleSort("name")}
                    >
                      Dipendente
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 font-medium"
                      onClick={() => handleSort("experiences")}
                    >
                      Esperienze
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 font-medium"
                      onClick={() => handleSort("hours")}
                    >
                      Ore
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 font-medium"
                      onClick={() => handleSort("last_participation")}
                    >
                      Ultima partecipazione
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nessun dipendente corrisponde ai filtri
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {employee.first_name || employee.last_name
                                ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
                                : "—"}
                            </p>
                            <p className="text-sm text-muted-foreground md:hidden truncate">
                              {employee.email}
                            </p>
                          </div>
                          {showOnlyNoParticipation && employee.total_experiences === 0 && (
                            <Badge
                              variant="outline"
                              className="shrink-0 bg-primary/10 text-primary border-primary/20"
                            >
                              Da coinvolgere
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{employee.total_experiences}</span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="font-medium">{employee.total_hours}h</span>
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                        {employee.last_participation
                          ? format(new Date(employee.last_participation), "d MMM yyyy", { locale: it })
                          : "—"}
                      </TableCell>
                      <TableCell className="w-10 text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <EmployeeParticipationsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          employee={selectedEmployee}
        />
      </div>
    </HRLayout>
  );
}
