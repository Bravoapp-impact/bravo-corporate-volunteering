import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Clock, Building, Sun, CloudRain, Shirt, Info, Navigation } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingDetailModalProps {
  booking: {
    id: string;
    status: string;
    experience_dates: {
      start_datetime: string;
      end_datetime: string;
      experiences: {
        title: string;
        description: string | null;
        image_url: string | null;
        association_name: string | null;
        city: string | null;
        address: string | null;
        category: string | null;
      };
    };
  } | null;
  onClose: () => void;
}

// Tips based on category
const getCategoryTips = (category: string | null): { icon: React.ReactNode; title: string; tips: string[] } => {
  switch (category?.toLowerCase()) {
    case "ambiente":
      return {
        icon: <Sun className="h-5 w-5 text-primary" />,
        title: "Consigli per attività all'aperto",
        tips: [
          "Indossa abiti comodi che possono sporcarsi",
          "Porta scarpe chiuse e robuste (no sandali)",
          "Crema solare e cappello se c'è sole",
          "Porta una bottiglia d'acqua riutilizzabile",
          "Guanti da lavoro saranno forniti dall'associazione",
        ],
      };
    case "sociale":
      return {
        icon: <Shirt className="h-5 w-5 text-primary" />,
        title: "Come prepararsi",
        tips: [
          "Abbigliamento casual ma ordinato",
          "Scarpe comode per stare in piedi",
          "Arriva 10 minuti prima per il briefing",
          "Porta un documento d'identità",
        ],
      };
    case "educazione":
      return {
        icon: <Info className="h-5 w-5 text-primary" />,
        title: "Suggerimenti utili",
        tips: [
          "Porta pazienza e un sorriso!",
          "Abbigliamento casual e colorato piace ai bambini",
          "Se hai giochi o libri da condividere, portali pure",
          "Arriva qualche minuto prima per conoscere gli educatori",
        ],
      };
    case "anziani":
      return {
        icon: <Info className="h-5 w-5 text-primary" />,
        title: "Per una visita perfetta",
        tips: [
          "Parla lentamente e chiaramente",
          "Porta qualche foto o giornale da sfogliare insieme",
          "Abbigliamento ordinato ma non formale",
          "Evita profumi troppo forti",
          "La cosa più importante è ascoltare",
        ],
      };
    case "animali":
      return {
        icon: <CloudRain className="h-5 w-5 text-primary" />,
        title: "Preparati al meglio",
        tips: [
          "Vestiti che possono sporcarsi (molto!)",
          "Scarpe chiuse e robuste obbligatorie",
          "Porta guanti da lavoro se li hai",
          "Non portare cibo per gli animali",
          "Lascia a casa i tuoi animali domestici",
        ],
      };
    default:
      return {
        icon: <Info className="h-5 w-5 text-primary" />,
        title: "Informazioni utili",
        tips: [
          "Arriva 10-15 minuti prima dell'orario",
          "Porta un documento d'identità",
          "Abbigliamento comodo consigliato",
          "In caso di imprevisti, contatta l'associazione",
        ],
      };
  }
};

export function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

  const experience = booking.experience_dates.experiences;
  const startDate = new Date(booking.experience_dates.start_datetime);
  const endDate = new Date(booking.experience_dates.end_datetime);
  const tips = getCategoryTips(experience.category);

  const handleOpenMaps = () => {
    const query = encodeURIComponent(
      `${experience.address || ""} ${experience.city || ""}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
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
          className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-48">
            {experience.image_url ? (
              <img
                src={experience.image_url}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-6xl">🤝</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {booking.status === "cancelled" && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                Prenotazione annullata
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Association & Category */}
            <div className="flex items-center gap-2 flex-wrap">
              {experience.category && (
                <Badge variant="secondary">{experience.category}</Badge>
              )}
              {experience.association_name && (
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  <Building className="h-4 w-4" />
                  {experience.association_name}
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground">
              {experience.title}
            </h2>

            {/* Date & Time */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {format(startDate, "EEEE d MMMM yyyy", { locale: it })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <p>
                  {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </p>
              </div>
            </div>

            {/* Location */}
            {(experience.city || experience.address) && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    {experience.city && (
                      <p className="font-medium">{experience.city}</p>
                    )}
                    {experience.address && (
                      <p className="text-sm text-muted-foreground">
                        {experience.address}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenMaps}
                  className="w-full"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Apri in Google Maps
                </Button>
              </div>
            )}

            {/* Description */}
            {experience.description && (
              <div>
                <h3 className="font-semibold mb-2">Descrizione</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {experience.description}
                </p>
              </div>
            )}

            {/* Tips Section */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-3">
                {tips.icon}
                <h3 className="font-semibold">{tips.title}</h3>
              </div>
              <ul className="space-y-2">
                {tips.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Close button */}
            <Button onClick={onClose} className="w-full">
              Chiudi
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
