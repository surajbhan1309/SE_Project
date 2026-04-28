import { motion } from "framer-motion";

interface EnergyBarProps {
    aiEnergy: number; // 0-100
    userEnergy: number; // 0-100
}

export function EnergyBar({ aiEnergy, userEnergy }: EnergyBarProps) {
    // Normalize to a single slider value 0-100 where 50 is neutral
    // If AI has 100 and User has 0, value is 0 (All AI)
    // If User has 100 and AI has 0, value is 100 (All User)
    // Simple heuristic: 50 + (User - AI) / 2
    // Clamped between 0 and 100
    const balance = Math.min(100, Math.max(0, 50 + (userEnergy - aiEnergy) / 2));

    return (
        <div className="w-full max-w-2xl mx-auto h-2 bg-zinc-900/80 rounded-full overflow-hidden relative backdrop-blur-sm border border-white/5">
            {/* Center Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/20 z-20 -translate-x-1/2" />

            {/* AI Side (Left) fills from left to the balance point */}
            <motion.div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 to-red-400 z-10"
                animate={{ width: `${100 - balance}%` }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
            />

            {/* User Side (Right) fills from right to the balance point */}
            <motion.div
                className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-cyan-600 to-cyan-400 z-10"
                animate={{ width: `${balance}%` }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
            />

            {/* Glow effect at the meeting point */}
            <motion.div
                className="absolute top-0 bottom-0 w-4 bg-white blur-md z-30 -translate-x-1/2 mix-blend-overlay"
                style={{ left: `${balance}%` }}
            />
        </div>
    );
}
