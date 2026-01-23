import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Clock, Users, Building, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ExperienceDate {
  id: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  confirmed_count?: number;
}

interface Experience {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  association_name: string | null;
  city: string | null;
  address: string | null;
  category: string | null;
  experience_dates?: ExperienceDate[];
}

interface ExperienceDetailModalProps {
  experience: Experience | null;
  onClose: () => void;
  onBookingComplete: () => void;
}

export function ExperienceDetailModal({
  experience,
  onClose,
  onBookingComplete,
}: ExperienceDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [dates, setDates] = useState<ExperienceDate[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  // Fetch dates separately to ensure RLS is applied correctly
  useEffect(() => {
    if (!experience) return;

    const fetchDates = async () => {
      setLoadingDates(true);
      setSelectedDateId(null);
      try {
        // Query experience_dates directly - RLS will filter by user's company
        const { data, error } = await supabase
          .from("experience_dates")
          .select("id, start_datetime, end_datetime, max_participants")
          .eq("experience_id", experience.id)
          .gte("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: true });

        if (error) throw error;

        // Fetch confirmed bookings count for each date
        const datesWithCount = await Promise.all(
          (data || []).map(async (date) => {
            const { count } = await supabase
              .from("bookings")
              .select("*", { count: "exact", head: true })
              .eq("experience_date_id", date.id)
              .eq("status", "confirmed");

            return {
              ...date,
              confirmed_count: count || 0,
            };
          })
        );

        setDates(datesWithCount);
      } catch (error) {
        console.error("Error fetching dates:", error);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchDates();
  }, [experience]);

  if (!experience) return null;

  const handleBook = async () => {
    if (!selectedDateId || !user) return;

    setIsBooking(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        experience_date_id: selectedDateId,
        status: "confirmed",
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Sei già prenotato per questa data");
        }
        throw error;
      }

      toast({
        title: "Prenotazione confermata! 🎉",
        description: "Ti aspettiamo per questa esperienza di volontariato.",
      });

      onBookingComplete();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore di prenotazione",
        description: error.message || "Non è stato possibile completare la prenotazione.",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-56 md:h-72">
            {experience.image_url ? (
              <img
                src={experience.image_url}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-7xl">🤝</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {experience.category && (
              <Badge className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm text-foreground">
                {experience.category}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Association */}
            {experience.association_name && (
              <div className="flex items-center gap-2 text-primary">
                <Building className="h-4 w-4" />
                <span className="font-medium">{experience.association_name}</span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {experience.title}
            </h2>

            {/* Description */}
            {experience.description && (
              <p className="text-muted-foreground leading-relaxed">
                {experience.description}
              </p>
            )}

            {/* Location */}
            {(experience.city || experience.address) && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  {experience.city && <p className="font-medium">{experience.city}</p>}
                  {experience.address && (
                    <p className="text-sm text-muted-foreground">{experience.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Seleziona una data</h3>
              {loadingDates ? (
                <div className="grid gap-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : dates.length > 0 ? (
                <div className="grid gap-3">
                  {dates.map((date) => {
                    const availableSpots = date.max_participants - (date.confirmed_count || 0);
                    const isFull = availableSpots <= 0;
                    const isSelected = selectedDateId === date.id;

                    return (
                      <button
                        key={date.id}
                        disabled={isFull}
                        onClick={() => setSelectedDateId(date.id)}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all
                          ${isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border hover:bg-muted/30"
                          }
                          ${isFull ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {format(new Date(date.start_datetime), "EEEE d MMMM yyyy", {
                                  locale: it,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(date.start_datetime), "HH:mm")} -{" "}
                                {format(new Date(date.end_datetime), "HH:mm")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-4 w-4" />
                              <span className={isFull ? "text-destructive" : ""}>
                                {isFull ? "Completo" : `${availableSpots} posti`}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nessuna data disponibile per la tua azienda
                </p>
              )}
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBook}
              disabled={!selectedDateId || isBooking}
              className="w-full h-12 text-base font-medium"
            >
              {isBooking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Conferma prenotazione"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
