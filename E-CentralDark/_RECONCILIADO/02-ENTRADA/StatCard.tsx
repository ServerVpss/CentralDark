import { LucideIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  changePositive?: boolean;
  liveIndicator?: boolean;
  index?: number;
}

export function StatCard({ title, value, change, icon: Icon, liveIndicator, index = 0 }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm border-glow hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] transition-colors duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">{title}</p>
        <Icon className="w-4 h-4 text-primary/70" />
      </div>
      <motion.h2 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
        className="font-display text-4xl font-bold text-foreground text-glow mb-2"
      >
        {value}
      </motion.h2>
      <div className="flex items-center gap-1.5 text-xs">
        {liveIndicator ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-medium">{change}</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">{change}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
