import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import type { Beat } from "@/lib/audio/BeatPlayer";

interface SessionProgressProps {
    isPlaying: boolean;
    sessionLength: number | "Infinity";
    currentBar: number;
    beat: Beat | null;
}

export function SessionProgress({ isPlaying, sessionLength, currentBar, beat }: SessionProgressProps) {
    // Local High-Frequency State for SMOOTH animation
    const [progressPercent, setProgressPercent] = useState(0);
    const requestRef = useRef<number>();

    useEffect(() => {
        if (!isPlaying || sessionLength === "Infinity" || !beat) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const secondsPerBeat = 60 / beat.bpm;
        const secondsPerBar = secondsPerBeat * 4;

        const tick = () => {
            // Audio Time Logic
            const time = Math.max(0, Tone.Transport.seconds - 0.05);

            // Calculate absolute progress
            const absoluteBars = time / secondsPerBar;

            // Percentage of TOTAL session
            const percent = (absoluteBars / (sessionLength as number)) * 100;

            setProgressPercent(Math.min(percent, 100));

            requestRef.current = requestAnimationFrame(tick);
        };

        requestRef.current = requestAnimationFrame(tick);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, sessionLength, beat]);

    if (sessionLength === "Infinity") return null;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
                {/* This part (currentBar) updates on LOW frequnecy from parent */}
                <span className="text-headline text-cyan-400">{currentBar + 1}</span>
                <span className="text-caption text-zinc-500">/ {sessionLength}</span>
            </div>
            <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                // Removing layout prop for pure JS animation performance where possible, 
                // but framer motion handles style updates well too.
                />
            </div>
        </div>
    );
}
