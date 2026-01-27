import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CrudTableRowProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function CrudTableRow({ index, children, className }: CrudTableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50",
        className
      )}
    >
      {children}
    </motion.tr>
  );
}
