import type { BeatState } from "@/hooks/useBeatTiming";
import { motion } from "framer-motion";

interface BouncingBallProps {
    timing: BeatState;
    isActive: boolean;
}

export const BouncingBall = ({ timing, isActive }: BouncingBallProps) => {
    // Animate on beat change
    return (
        <div className="relative w-full h-32 flex items-end justify-center mb-8 overflow-hidden pointer-events-none select-none">
            {/* Rail */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent absolute bottom-4" />

            {/* Ball */}
            <motion.div
                className="w-12 h-12 rounded-full absolute bottom-4 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                animate={{
                    y: isActive && timing.beatIndex >= 0 ? [0, -60, 0] : 0,
                    scaleX: isActive ? [1.3, 0.9, 1.3] : 1,
                    scaleY: isActive ? [0.7, 1.1, 0.7] : 1
                }}
                transition={{
                    duration: 0.4, // Approximation of a beat at 120-140bpm
                    ease: ["easeOut", "easeIn"],
                    times: [0, 0.5, 1]
                }}
                key={timing.beatIndex} // Trigger animation on beat change
                style={{
                    x: 0,
                    background: "radial-gradient(circle at 30% 30%, #fff, #a855f7)",
                }}
            />

            {/* Beat Markers */}
            <div className="absolute bottom-2 text-xs font-mono text-purple-500/30 flex gap-12">
                <span className={timing.beatIndex === 0 ? "text-purple-400 font-bold" : ""}>1</span>
                <span className={timing.beatIndex === 1 ? "text-purple-400 font-bold" : ""}>2</span>
                <span className={timing.beatIndex === 2 ? "text-purple-400 font-bold" : ""}>3</span>
                <span className={timing.beatIndex === 3 ? "text-purple-400 font-bold" : ""}>4</span>
            </div>
        </div>
    );
};
