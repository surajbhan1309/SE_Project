import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MetronomeProps {
    bpm: number;
    isPlaying: boolean;
}

export function Metronome({ bpm, isPlaying }: MetronomeProps) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!isPlaying) {
            setTick(0);
            return;
        }

        const interval = (60 / bpm) * 1000;
        const timer = setInterval(() => {
            setTick(t => (t + 1) % 4);
        }, interval);

        return () => clearInterval(timer);
    }, [bpm, isPlaying]);

    return (
        <div className="flex gap-4 justify-center items-center py-4">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: isPlaying && tick === i ? 1.5 : 1,
                        opacity: isPlaying && tick === i ? 1 : 0.3,
                        backgroundColor: isPlaying && tick === i
                            ? (i === 0 ? "hsla(var(--accent), 1)" : "hsla(var(--primary), 1)")
                            : "hsla(var(--muted), 1)"
                    }}
                    className="w-4 h-4 rounded-full bg-muted shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                />
            ))}
        </div>
    );
}
