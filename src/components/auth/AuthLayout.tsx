import { ReactNode } from "react";
import { motion } from "framer-motion";
import bravoLogo from "@/assets/bravo-logo.png";
import bravoLogoWhite from "@/assets/bravo-logo-white.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" />

        {/* Decorative shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-32 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img src={bravoLogoWhite} alt="Bravo!" className="h-12 lg:h-16 w-auto mb-6" />
            <p className="text-xl font-light opacity-90 max-w-md leading-relaxed">
              Esperienze sociali ad alto impatto positivo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm font-medium"
                >
                  {["👩‍💼", "👨‍💻", "👩‍🔬", "👨‍🍳"][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-sm opacity-80">+1,800 persone hanno vissuto le nostre esperienze</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile logo */}
          <div className="md:hidden mb-8">
            <img src={bravoLogo} alt="Bravo!" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-semibold text-foreground"
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-2 text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
