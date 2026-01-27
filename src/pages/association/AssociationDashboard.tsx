import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AssociationLayout } from "@/components/layout/AssociationLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, CalendarX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { devLog } from "@/lib/logger";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";

interface UpcomingDate {
  id: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  confirmed_count: number;
  experience: {
    id: string;
    title: string;
    city: string | null;
  };
}

export default function AssociationDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);

  useEffect(() => {
    if (profile?.association_id) {
      fetchUpcomingDates();
    }
  }, [profile?.association_id]);

  const fetchUpcomingDates = async () => {
    if (!profile?.association_id) return;

    try {
      setLoading(true);
      const now = new Date().toISOString();

      // Fetch future dates for this association's experiences
      const { data: dates, error } = await supabase
        .from("experience_dates")
        .select(`
          id,
          start_datetime,
          end_datetime,
          max_participants,
          experiences!inner (
            id,
            title,
            city,
            association_id
          )
        `)
        .eq("experiences.association_id", profile.association_id)
        .gt("start_datetime", now)
        .order("start_datetime", { ascending: true });

      if (error) {
        devLog.error("Error fetching upcoming dates:", error);
        return;
      }

      // Get confirmed bookings count for each date
      const datesWithCounts = await Promise.all(
        (dates || []).map(async (date) => {
          const { count } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("experience_date_id", date.id)
            .eq("status", "confirmed");

          return {
            id: date.id,
            start_datetime: date.start_datetime,
            end_datetime: date.end_datetime,
            max_participants: date.max_participants,
            confirmed_count: count || 0,
            experience: {
              id: date.experiences.id,
              title: date.experiences.title,
              city: date.experiences.city,
            },
          };
        })
      );

      setUpcomingDates(datesWithCounts);
    } catch (error) {
      devLog.error("Error in fetchUpcomingDates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AssociationLayout>
        <LoadingState message="Caricamento dashboard..." />
      </AssociationLayout>
    );
  }

  return (
    <AssociationLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Panoramica delle prossime attività di volontariato"
        />

        {/* Upcoming Dates Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Prossime Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDates.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="Nessuna data in programma"
                  description="Al momento non ci sono attività future programmate per la tua associazione."
                />
              ) : (
                <div className="space-y-4">
                  {upcomingDates.map((date, index) => (
                    <motion.div
                      key={date.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                        <h4 className="font-medium text-foreground truncate">
                          {date.experience.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(date.start_datetime), "EEEE d MMMM yyyy", { locale: it })}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(date.start_datetime), "HH:mm")} - {format(new Date(date.end_datetime), "HH:mm")}
                          </span>
                          {date.experience.city && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {date.experience.city}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={date.confirmed_count >= date.max_participants ? "destructive" : "secondary"}
                          className="flex items-center gap-1.5"
                        >
                          <Users className="h-3.5 w-3.5" />
                          {date.confirmed_count}/{date.max_participants} partecipanti
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AssociationLayout>
  );
}
