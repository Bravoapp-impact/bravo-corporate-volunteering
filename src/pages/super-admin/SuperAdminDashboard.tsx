import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { devLog } from "@/lib/logger";

interface DashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalExperiences: number;
  publishedExperiences: number;
  totalBookings: number;
  totalVolunteerHours: number;
  totalBeneficiaries: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        companiesRes,
        usersRes,
        experiencesRes,
        publishedRes,
        bookingsRes,
      ] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("experiences").select("id", { count: "exact", head: true }),
        supabase
          .from("experiences")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("bookings")
          .select(
            `
            id,
            status,
            experience_dates (
              volunteer_hours,
              beneficiaries_count,
              end_datetime
            )
          `
          )
          .eq("status", "confirmed"),
      ]);

      // Calculate volunteer hours and beneficiaries from completed bookings
      let totalVolunteerHours = 0;
      let totalBeneficiaries = 0;
      const now = new Date();

      if (bookingsRes.data) {
        bookingsRes.data.forEach((booking: any) => {
          const endDate = booking.experience_dates?.end_datetime
            ? new Date(booking.experience_dates.end_datetime)
            : null;
          if (endDate && endDate < now) {
            totalVolunteerHours += booking.experience_dates?.volunteer_hours || 0;
            totalBeneficiaries += booking.experience_dates?.beneficiaries_count || 0;
          }
        });
      }

      setStats({
        totalCompanies: companiesRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalExperiences: experiencesRes.count || 0,
        publishedExperiences: publishedRes.count || 0,
        totalBookings: bookingsRes.data?.length || 0,
        totalVolunteerHours,
        totalBeneficiaries,
      });
    } catch (error) {
      devLog.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Aziende",
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: "text-bravo-purple",
      bgColor: "bg-bravo-purple/10",
    },
    {
      label: "Utenti",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-bravo-magenta",
      bgColor: "bg-bravo-magenta/10",
    },
    {
      label: "Esperienze",
      value: stats?.publishedExperiences || 0,
      subLabel: `${stats?.totalExperiences || 0} totali`,
      icon: Calendar,
      color: "text-bravo-pink",
      bgColor: "bg-bravo-pink/10",
    },
    {
      label: "Prenotazioni",
      value: stats?.totalBookings || 0,
      icon: TrendingUp,
      color: "text-bravo-orange",
      bgColor: "bg-bravo-orange/10",
    },
    {
      label: "Ore Volontariato",
      value: stats?.totalVolunteerHours || 0,
      icon: Clock,
      color: "text-bravo-yellow",
      bgColor: "bg-bravo-yellow/10",
    },
    {
      label: "Beneficiari",
      value: stats?.totalBeneficiaries || 0,
      icon: Heart,
      color: "text-bravo-pink",
      bgColor: "bg-bravo-pink/10",
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Panoramica globale della piattaforma Bravo!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
                        {stat.subLabel && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {stat.subLabel}
                          </p>
                        )}
                      </div>
                      <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/super-admin/companies"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Gestisci Aziende</span>
                </a>
                <a
                  href="/super-admin/experiences"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Gestisci Esperienze</span>
                </a>
                <a
                  href="/super-admin/assignments"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Assegna Esperienze</span>
                </a>
                <a
                  href="/super-admin/users"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Visualizza Utenti</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SuperAdminLayout>
  );
}
