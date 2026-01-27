import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingDetailModal } from "@/components/bookings/BookingDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isPast } from "date-fns";

interface Booking {
  id: string;
  status: string;
  created_at: string;
  experience_dates: {
    id: string;
    start_datetime: string;
    end_datetime: string;
    experiences: {
      id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      association_name: string | null;
      city: string | null;
      address: string | null;
      category: string | null;
    };
  };
}

export default function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        experience_dates (
          id,
          start_datetime,
          end_datetime,
          experiences (
            id,
            title,
            description,
            image_url,
            association_name,
            city,
            address,
            category
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as unknown as Booking[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Prenotazione annullata",
        description: "La tua prenotazione è stata annullata con successo.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Non è stato possibile annullare la prenotazione.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Split bookings into future and past
  const futureBookings = bookings.filter(
    (b) => !isPast(new Date(b.experience_dates.start_datetime)) && b.status === "confirmed"
  );
  const pastBookings = bookings.filter(
    (b) => isPast(new Date(b.experience_dates.start_datetime)) || b.status === "cancelled"
  );

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Le mie prenotazioni
        </h1>
        <p className="text-muted-foreground">
          Gestisci le tue esperienze di volontariato
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-muted/30 rounded-2xl border border-border/50"
        >
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nessuna prenotazione</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Non hai ancora prenotato nessuna esperienza. Esplora il catalogo e trova l'attività perfetta per te!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {/* Future bookings */}
          {futureBookings.length > 0 && (
            <section>
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold mb-6 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                Prossime esperienze
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({futureBookings.length})
                </span>
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {futureBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onCancel={handleCancel}
                    onView={setSelectedBooking}
                    isCancelling={cancellingId === booking.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past bookings */}
          {pastBookings.length > 0 && (
            <section>
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium text-muted-foreground mb-4"
              >
                Storico
                <span className="text-sm font-normal ml-2">
                  ({pastBookings.length})
                </span>
              </motion.h2>
              <div className="space-y-3">
                {pastBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    isPast
                    onCancel={handleCancel}
                    onView={setSelectedBooking}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={handleCancel}
        isCancelling={!!cancellingId}
      />
    </AppLayout>
  );
}
