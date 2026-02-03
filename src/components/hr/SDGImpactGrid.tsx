import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SDG_DATA, getSDGInfo } from "@/lib/sdg-data";

interface SDGImpact {
  code: string;
  hours: number;
}

interface SDGImpactGridProps {
  sdgImpacts: SDGImpact[];
}

export function SDGImpactGrid({ sdgImpacts }: SDGImpactGridProps) {
  if (sdgImpacts.length === 0) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Impatto per SDG</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nessuna attività registrata con SDG associati
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Impatto per SDG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sdgImpacts.map((impact, index) => {
            const sdg = getSDGInfo(impact.code);
            if (!sdg) return null;

            return (
              <motion.div
                key={impact.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border border-border/50 hover:shadow-md transition-all"
                style={{ 
                  backgroundColor: `${sdg.color}10`,
                  borderColor: `${sdg.color}30`
                }}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {sdg.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      SDG {impact.code.replace('sdg_', '')}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">
                      {sdg.name}
                    </p>
                    <p className="text-base font-bold mt-1" style={{ color: sdg.color }}>
                      {impact.hours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
