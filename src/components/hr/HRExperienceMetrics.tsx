import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck, Users, TrendingUp } from "lucide-react";

interface HRExperienceMetricsProps {
  activeExperiences: number;
  futureEvents: number;
  totalParticipations: number;
  averageFillRate: number;
}

export function HRExperienceMetrics({
  activeExperiences,
  futureEvents,
  totalParticipations,
  averageFillRate,
}: HRExperienceMetricsProps) {
  const metrics = [
    {
      label: "Esperienze Attive",
      value: activeExperiences,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Eventi Futuri",
      value: futureEvents,
      icon: CalendarCheck,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Partecipazioni Totali",
      value: totalParticipations,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Tasso Medio Riempimento",
      value: `${averageFillRate}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  // Split metrics: first 2 on top row, last 2 on bottom row (centered)
  const topRow = metrics.slice(0, 2);
  const bottomRow = metrics.slice(2);

  // Get the Icon component for each metric inside the render function
  const renderCardWithIcon = (metric: typeof metrics[0], index: number, rowOffset: number = 0) => {
    const Icon = metric.icon;
    return (
      <motion.div
        key={metric.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (rowOffset + index) * 0.1 }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`p-2.5 sm:p-3 rounded-xl ${metric.bgColor} shrink-0`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                  {metric.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top row: 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {topRow.map((metric, index) => renderCardWithIcon(metric, index))}
      </div>
      {/* Bottom row: 2 cards full-width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {bottomRow.map((metric, index) => renderCardWithIcon(metric, index, 2))}
      </div>
    </div>
  );
}
