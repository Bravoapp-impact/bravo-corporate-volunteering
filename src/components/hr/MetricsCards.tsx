import { motion } from "framer-motion";
import { Users, Clock, Heart, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardsProps {
  employeesCount: number;
  participationRate: number;
  totalVolunteerHours: number;
  totalBeneficiaries: number;
  totalParticipations: number;
}

export function MetricsCards({
  employeesCount,
  participationRate,
  totalVolunteerHours,
  totalBeneficiaries,
  totalParticipations,
}: MetricsCardsProps) {
  const metrics = [
    {
      label: "Dipendenti Registrati",
      value: employeesCount,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Tasso di Partecipazione",
      value: `${participationRate}%`,
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Ore di Volontariato",
      value: totalVolunteerHours.toFixed(1),
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Beneficiari Raggiunti",
      value: totalBeneficiaries,
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Partecipazioni Totali",
      value: totalParticipations,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // Split metrics: first 3 on top row, last 2 on bottom row (centered)
  const topRow = metrics.slice(0, 3);
  const bottomRow = metrics.slice(3);

  const renderCard = (metric: typeof metrics[0], index: number, rowOffset: number = 0) => (
    <motion.div
      key={metric.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rowOffset + index) * 0.1 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2.5 sm:p-3 rounded-xl ${metric.bgColor} shrink-0`}>
              <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
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

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top row: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {topRow.map((metric, index) => renderCard(metric, index))}
      </div>
      {/* Bottom row: 2 cards full-width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {bottomRow.map((metric, index) => renderCard(metric, index, 3))}
      </div>
    </div>
  );
}
