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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${metric.bgColor} w-fit`}>
                  <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {metric.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {metric.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
