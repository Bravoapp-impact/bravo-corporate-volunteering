import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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

interface ExperienceCardCompactProps {
  experience: Experience;
  index: number;
  onSelect: (experience: Experience) => void;
}

export function ExperienceCardCompact({ experience, index, onSelect }: ExperienceCardCompactProps) {
  const nextDate = experience.experience_dates?.[0];
  const availableSpots = nextDate
    ? nextDate.max_participants - (nextDate.confirmed_count || 0)
    : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect(experience)}
      className="group flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      {/* Square Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {experience.image_url ? (
          <img
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">🤝</span>
          </div>
        )}
        
        {/* Category badge */}
        {experience.category && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-xs bg-background/90 backdrop-blur-sm"
          >
            {experience.category}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="pt-3 space-y-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {experience.title}
        </h3>

        {/* Association */}
        {experience.association_name && (
          <p className="text-xs text-muted-foreground truncate">
            {experience.association_name}
          </p>
        )}

        {/* Next date + spots */}
        {nextDate && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-medium text-foreground">
              {format(new Date(nextDate.start_datetime), "EEE d MMM", { locale: it })}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className={availableSpots <= 3 ? "text-destructive font-medium" : ""}>
                {availableSpots}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}
