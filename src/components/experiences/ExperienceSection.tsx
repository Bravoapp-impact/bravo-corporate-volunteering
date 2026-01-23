import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceCardCompact } from "./ExperienceCardCompact";

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

interface ExperienceSectionProps {
  title: string;
  experiences: Experience[];
  onSelectExperience: (experience: Experience) => void;
}

export function ExperienceSection({ title, experiences, onSelectExperience }: ExperienceSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (experiences.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header with navigation arrows (desktop only) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        
        {/* Desktop navigation arrows */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {experiences.map((experience, index) => (
          <div key={experience.id} style={{ scrollSnapAlign: "start" }}>
            <ExperienceCardCompact
              experience={experience}
              index={index}
              onSelect={onSelectExperience}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
