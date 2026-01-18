import { motion } from "framer-motion";
import { Users, Clock, Heart, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardsProps {
  employeesCount: number;
  totalVolunteerHours: number;
  totalBeneficiaries: number;
  totalParticipations: number;
}

export function MetricsCards({
  employeesCount,
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
      label: "Ore di Volontariato",
      value: totalVolunteerHours.toFixed(1),
      icon: Clock,
      color: "text-sage",
      bgColor: "bg-sage-light",
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
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
