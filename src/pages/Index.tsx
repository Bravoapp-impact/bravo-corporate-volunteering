import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import bravoLogo from "@/assets/bravo-logo.png";

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        
        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <img src={bravoLogo} alt="Bravo!" className="h-12 md:h-16 w-auto mb-6" />
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Fai del bene,{" "}
              <span className="text-primary">insieme</span> alla tua azienda
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              Scopri esperienze di volontariato uniche. Prenota con un click e crea impatto nella tua comunità.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/register">
                  Inizia ora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Link to="/login">Accedi</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-xl"
          >
            {[
              { icon: Users, value: "2,500+", label: "Volontari" },
              { icon: Calendar, value: "150+", label: "Esperienze" },
              { icon: Heart, value: "50+", label: "Aziende" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
