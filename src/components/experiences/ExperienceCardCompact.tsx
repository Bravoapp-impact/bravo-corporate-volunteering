import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BaseCardImage } from "@/components/common/BaseCardImage";
import { format, differenceInMinutes } from "date-fns";
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
  association_logo_url?: string | null;
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

  // Calculate duration in hours
  const duration = nextDate
    ? Math.round(differenceInMinutes(new Date(nextDate.end_datetime), new Date(nextDate.start_datetime)) / 60)
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect(experience)}
      className="group flex-shrink-0 w-[165px] sm:w-[185px] md:w-[210px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
    >
      {/* Square Image with category badge */}
      <BaseCardImage
        imageUrl={experience.image_url}
        alt={experience.title}
        aspectRatio="square"
        badge={
          experience.category ? (
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-white/95 text-foreground backdrop-blur-sm rounded-full px-3 py-1 shadow-sm"
            >
              {experience.category}
            </Badge>
          ) : null
        }
        badgePosition="top-left"
      />

      {/* Content */}
      <div className="pt-3 space-y-1.5">
        {/* Title - regular weight, more natural */}
        <h3 className="text-[15px] font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {experience.title}
        </h3>

        {/* Association with logo */}
        {experience.association_name && (
          <div className="flex items-center gap-1.5">
            {experience.association_logo_url ? (
              <img
                src={experience.association_logo_url}
                alt=""
                className="w-4 h-4 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-[8px]">🏢</span>
              </div>
            )}
            <p className="text-[13px] text-muted-foreground font-light truncate">
              {experience.association_name}
            </p>
          </div>
        )}

        {/* Date + Duration + Spots - lighter text */}
        {nextDate && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-light">
            <span>
              {format(new Date(nextDate.start_datetime), "EEE d MMM", { locale: it })}
            </span>
            {duration && (
              <>
                <span className="text-border">·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {duration}h
                </span>
              </>
            )}
            <span className="text-border">·</span>
            <span className={`flex items-center gap-0.5 ${availableSpots <= 3 ? "text-destructive font-normal" : ""}`}>
              <Users className="h-3 w-3" />
              {availableSpots}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
