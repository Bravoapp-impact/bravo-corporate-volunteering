import { HRLayout } from "@/components/layout/HRLayout";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function HREmployeesPage() {
  return (
    <HRLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dipendenti</h1>
          <p className="text-muted-foreground mt-1">
            Visualizza i dipendenti della tua azienda
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Pagina in costruzione
          </h2>
          <p className="text-muted-foreground max-w-md">
            Qui potrai visualizzare tutti i dipendenti registrati della tua azienda 
            e monitorare la loro partecipazione alle esperienze.
          </p>
        </div>
      </motion.div>
    </HRLayout>
  );
}
