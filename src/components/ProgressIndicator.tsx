import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({ current, total, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        
        return (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {isCompleted ? (
              <CheckCircle 
                className="w-8 h-8 text-success fill-success/20" 
                strokeWidth={2}
              />
            ) : (
              <Circle 
                className={cn(
                  "w-8 h-8",
                  isCurrent ? "text-primary animate-pulse" : "text-muted-foreground/40"
                )}
                strokeWidth={2}
              />
            )}
            {isCurrent && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
