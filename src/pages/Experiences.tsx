import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { ExperienceDetailModal } from "@/components/experiences/ExperienceDetailModal";
import { supabase } from "@/integrations/supabase/client";

interface ExperienceDate {
  id: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  confirmed_count?: number;
}

interface ExperienceDateRow extends ExperienceDate {
  experience_id: string;
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

export default function Experiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const fetchExperiences = async () => {
    setLoading(true);

    try {
      // Fetch experiences first (RLS filters to user's company)
      const { data: expData, error: expError } = await supabase
        .from("experiences")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (expError) throw expError;

      const baseExperiences = (expData ?? []) as Experience[];

      if (baseExperiences.length === 0) {
        setExperiences([]);
        return;
      }

      // Fetch dates separately to ensure date-level RLS is applied (company isolation)
      const experienceIds = baseExperiences.map((e) => e.id);
      const { data: datesData, error: datesError } = await supabase
        .from("experience_dates")
        .select("id, experience_id, start_datetime, end_datetime, max_participants")
        .in("experience_id", experienceIds)
        .gte("start_datetime", new Date().toISOString())
        .order("start_datetime", { ascending: true });

      if (datesError) throw datesError;

      const datesByExperienceId = new Map<string, ExperienceDate[]>();
      (datesData as ExperienceDateRow[] | null)?.forEach((d) => {
        const { experience_id, ...date } = d;
        const list = datesByExperienceId.get(experience_id) ?? [];
        list.push(date);
        datesByExperienceId.set(experience_id, list);
      });

      setExperiences(
        baseExperiences.map((exp) => ({
          ...exp,
          experience_dates: datesByExperienceId.get(exp.id) ?? [],
        }))
      );
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const filteredExperiences = experiences.filter(
    (exp) =>
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
          Esperienze di volontariato
        </h1>
        <p className="text-muted-foreground">
          Scopri le opportunità disponibili per la tua azienda
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, città o categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold mb-2">Nessuna esperienza trovata</h3>
          <p className="text-muted-foreground">
            Prova a modificare i criteri di ricerca
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience, index) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              index={index}
              onSelect={setSelectedExperience}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedExperience && (
        <ExperienceDetailModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
          onBookingComplete={fetchExperiences}
        />
      )}
    </AppLayout>
  );
}
