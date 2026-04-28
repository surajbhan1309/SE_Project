import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RhythmGridProps {
    rows?: number;
    barsPerRow?: number;
    startBarIndex?: number;
    activeBarIndex?: number;
    renderBarContent?: (barIndex: number, isActive: boolean) => React.ReactNode;
}

export function RhythmGrid({
    rows = 4,
    barsPerRow = 4,
    startBarIndex = 0,
    activeBarIndex,
    renderBarContent
}: RhythmGridProps) {
    return (
        <div className="w-full relative rounded-2xl overflow-hidden">
            <div className="flex flex-col w-full h-full min-h-[400px] gap-3 p-3">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex-1 flex gap-3 relative">
                        {Array.from({ length: barsPerRow }).map((_, colIndex) => {
                            const globalIndex = startBarIndex + (rowIndex * barsPerRow) + colIndex;
                            const isActive = activeBarIndex !== undefined ? globalIndex === activeBarIndex : false;

                            return (
                                <motion.div
                                    key={colIndex}
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.02 : 1,
                                        transition: { type: "spring", stiffness: 400, damping: 25 }
                                    }}
                                    className={cn(
                                        "flex-1 relative flex items-center justify-center rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "glass-surface border-cyan-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_20px_-5px_rgba(6,182,212,0.4)]"
                                            : "glass-surface border-white/[0.04] hover:border-white/[0.08]",
                                    )}
                                >
                                    {/* Content Container */}
                                    <div className="z-10 w-full px-2 h-full flex items-center justify-center">
                                        {renderBarContent ? renderBarContent(globalIndex, isActive) : null}
                                    </div>

                                    {/* Active Indicator Ring */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/30 animate-glow-pulse pointer-events-none" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
