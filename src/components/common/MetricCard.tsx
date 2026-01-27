import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  subLabel?: string;
  animationDelay?: number;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subLabel,
  animationDelay = 0,
  className = "",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={className}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2.5 sm:p-3 rounded-xl ${iconBgColor} shrink-0`}>
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                {label}
              </p>
              {subLabel && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subLabel}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
