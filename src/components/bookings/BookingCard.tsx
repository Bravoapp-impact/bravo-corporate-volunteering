import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, X, ChevronRight } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingCardProps {
  booking: {
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
        image_url: string | null;
        association_name: string | null;
        city: string | null;
        address: string | null;
        category: string | null;
      };
    };
  };
  index: number;
  isPast?: boolean;
  onCancel: (bookingId: string) => void;
  onView: (booking: any) => void;
  isCancelling?: boolean;
}

export function BookingCard({
  booking,
  index,
  isPast = false,
  onCancel,
  onView,
  isCancelling,
}: BookingCardProps) {
  const experience = booking.experience_dates.experiences;
  const startDate = new Date(booking.experience_dates.start_datetime);
  const endDate = new Date(booking.experience_dates.end_datetime);
  const hoursUntilEvent = differenceInHours(startDate, new Date());
  const canCancel = hoursUntilEvent > 48 && booking.status === "confirmed";

  if (isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={() => onView(booking)}
        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-muted-foreground truncate">
            {experience.title}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {format(startDate, "d MMMM yyyy", { locale: it })}
          </p>
        </div>
        {booking.status === "cancelled" && (
          <Badge variant="secondary" className="text-xs">
            Annullata
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={() => onView(booking)}
    >
      {/* Image header */}
      <div className="relative h-32 overflow-hidden">
        {experience.image_url ? (
          <img
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl">🤝</span>
          </div>
        )}
        
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            {format(startDate, "MMM", { locale: it })}
          </p>
          <p className="text-xl font-bold text-foreground leading-none">
            {format(startDate, "d")}
          </p>
        </div>

        {booking.status === "cancelled" && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Annullata
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Category & Association */}
        <div className="flex items-center gap-2 flex-wrap">
          {experience.category && (
            <Badge variant="secondary" className="text-xs">
              {experience.category}
            </Badge>
          )}
          {experience.association_name && (
            <span className="text-xs text-primary font-medium">
              {experience.association_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
          {experience.title}
        </h3>

        {/* Time & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary/70" />
            <span>
              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
            </span>
          </div>
          {experience.city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span>{experience.city}</span>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(booking.id);
            }}
            disabled={isCancelling}
          >
            <X className="h-4 w-4 mr-2" />
            Annulla prenotazione
          </Button>
        )}

        {!canCancel && booking.status === "confirmed" && hoursUntilEvent <= 48 && (
          <p className="text-xs text-muted-foreground text-center mt-3 py-2 bg-muted/50 rounded-lg">
            Non annullabile (meno di 48h all'evento)
          </p>
        )}
      </div>
    </motion.div>
  );
}
