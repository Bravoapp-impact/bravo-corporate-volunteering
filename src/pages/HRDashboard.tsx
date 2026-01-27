import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HRLayout } from "@/components/layout/HRLayout";
import { MetricsCards } from "@/components/hr/MetricsCards";
import { SDGImpactGrid } from "@/components/hr/SDGImpactGrid";
import { UpcomingEvents } from "@/components/hr/UpcomingEvents";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { devLog } from "@/lib/logger";

interface DashboardData {
  employeesCount: number;
  participationRate: number;
  totalVolunteerHours: number;
  totalBeneficiaries: number;
  totalParticipations: number;
  sdgImpacts: { code: string; hours: number }[];
  upcomingEvents: {
    id: string;
    experience_title: string;
    city: string | null;
    start_datetime: string;
    company_participants: number;
    max_participants: number;
  }[];
}

export default function HRDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    employeesCount: 0,
    participationRate: 0,
    totalVolunteerHours: 0,
    totalBeneficiaries: 0,
    totalParticipations: 0,
    sdgImpacts: [],
    upcomingEvents: [],
  });

  useEffect(() => {
    if (profile?.company_id) {
      fetchDashboardData();
    }
  }, [profile?.company_id]);

  const fetchDashboardData = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employees count and profiles
      const { data: companyProfiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("company_id", profile.company_id);

      const employeesCount = companyProfiles?.length || 0;
      const companyUserIds = new Set(companyProfiles?.map((p) => p.id) || []);

      // Fetch all bookings with related data for this company
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          user_id,
          experience_dates (
            id,
            start_datetime,
            end_datetime,
            volunteer_hours,
            beneficiaries_count,
            max_participants,
            experiences (
              id,
              title,
              city,
              sdgs
            )
          )
        `)
        .order("created_at", { ascending: false });

      // Filter bookings by company employees
      const companyBookings = bookingsData?.filter((b) => companyUserIds.has(b.user_id)) || [];

      // Calculate completed bookings (end_datetime < now AND status = confirmed)
      const now = new Date();
      const completedBookings = companyBookings.filter(
        (b) =>
          b.status === "confirmed" &&
          b.experience_dates &&
          new Date(b.experience_dates.end_datetime) < now
      );

      // Calculate unique employees who participated
      const participatingEmployees = new Set(completedBookings.map((b) => b.user_id));
      const participationRate = employeesCount > 0 
        ? Math.round((participatingEmployees.size / employeesCount) * 100) 
        : 0;

      // Calculate metrics
      let totalVolunteerHours = 0;
      let totalBeneficiaries = 0;
      const sdgHoursMap: Record<string, number> = {};

      completedBookings.forEach((booking) => {
        const hours = Number(booking.experience_dates?.volunteer_hours) || 0;
        const beneficiaries = booking.experience_dates?.beneficiaries_count || 0;
        const sdgs = booking.experience_dates?.experiences?.sdgs || [];

        totalVolunteerHours += hours;
        totalBeneficiaries += beneficiaries;

        // Aggregate SDG hours
        sdgs.forEach((sdg: string) => {
          sdgHoursMap[sdg] = (sdgHoursMap[sdg] || 0) + hours;
        });
      });

      const sdgImpacts = Object.entries(sdgHoursMap)
        .map(([code, hours]) => ({ code, hours }))
        .sort((a, b) => b.hours - a.hours);

      // Fetch upcoming events with company participants count
      const { data: upcomingDates } = await supabase
        .from("experience_dates")
        .select(`
          id,
          start_datetime,
          max_participants,
          experiences (
            id,
            title,
            city
          )
        `)
        .gt("start_datetime", now.toISOString())
        .order("start_datetime", { ascending: true })
        .limit(10);

      // Count company participants for each upcoming event
      const upcomingEvents = await Promise.all(
        (upcomingDates || []).map(async (date) => {
          const { count } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("experience_date_id", date.id)
            .eq("status", "confirmed")
            .in("user_id", Array.from(companyUserIds));

          return {
            id: date.id,
            experience_title: date.experiences?.title || "",
            city: date.experiences?.city || null,
            start_datetime: date.start_datetime,
            company_participants: count || 0,
            max_participants: date.max_participants,
          };
        })
      );

      // Filter to only show events with at least one company participant, limit to 4
      const eventsWithParticipants = upcomingEvents
        .filter((e) => e.company_participants > 0)
        .slice(0, 4);

      setData({
        employeesCount,
        participationRate,
        totalVolunteerHours,
        totalBeneficiaries,
        totalParticipations: completedBookings.length,
        sdgImpacts,
        upcomingEvents: eventsWithParticipants,
      });
    } catch (error) {
      devLog.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Caricamento dashboard...</p>
          </div>
        </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Panoramica dell'impatto sociale della tua azienda
          </p>
        </motion.div>

        {/* Metrics Cards - 5 cards */}
        <MetricsCards
          employeesCount={data.employeesCount}
          participationRate={data.participationRate}
          totalVolunteerHours={data.totalVolunteerHours}
          totalBeneficiaries={data.totalBeneficiaries}
          totalParticipations={data.totalParticipations}
        />

        {/* Two column layout: SDG Impact + Upcoming Events */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SDGImpactGrid sdgImpacts={data.sdgImpacts} />
          </div>
          <div>
            <UpcomingEvents events={data.upcomingEvents} />
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
