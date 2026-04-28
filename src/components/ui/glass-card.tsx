import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={hoverEffect ? { scale: 1.01 } : undefined}
            className={cn(
                "relative glass-surface rounded-3xl shadow-2xl overflow-hidden",
                "transition-all duration-300",
                hoverEffect && "hover:border-white/15",
                className
            )}
            {...props}
        >
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
