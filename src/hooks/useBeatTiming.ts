import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import type { Beat } from "@/lib/audio/BeatPlayer";

export interface BeatState {
    currentBar: number;      // 0, 1, 2, ... (Cumulative)
    barInLoop: number;       // 0, 1, 2, 3 (Mod bars_per_loop)
    beatIndex: number;       // 0, 1, 2, 3 (Beat within bar)
    secondsPerBar: number;
}

/**
 * OPTIMIZED HOOK: Updates ONLY when the musical time unit changes (Beat or Bar).
 * Does NOT update on every animation frame.
 */
export function useBeatState(beat: Beat | null, isPlaying: boolean) {
    const [beatState, setBeatState] = useState<BeatState>({
        currentBar: 0,
        barInLoop: 0,
        beatIndex: 0,
        secondsPerBar: 0,
    });

    const requestRef = useRef<number>();
    const lastBeatIndex = useRef<number>(-1);

    useEffect(() => {
        if (!isPlaying || !beat) {
            setBeatState({
                currentBar: 0,
                barInLoop: 0,
                beatIndex: 0,
                secondsPerBar: 0,
            });
            lastBeatIndex.current = -1;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const secondsPerBeat = 60 / beat.bpm;
        const secondsPerBar = secondsPerBeat * 4;

        const tick = () => {
            const time = Math.max(0, Tone.Transport.seconds - 0.05);
            const absoluteBars = time / secondsPerBar;
            const currentBar = Math.floor(absoluteBars);
            const absoluteBeats = Math.floor(time / secondsPerBeat);

            // Only update if the integer beat index has changed
            if (absoluteBeats !== lastBeatIndex.current) {
                lastBeatIndex.current = absoluteBeats;

                const beatIndex = absoluteBeats % 4; // 0, 1, 2, 3
                const barInLoop = currentBar % beat.bars_per_loop;

                setBeatState({
                    currentBar,
                    barInLoop,
                    beatIndex,
                    secondsPerBar
                });
            }

            requestRef.current = requestAnimationFrame(tick);
        };

        requestRef.current = requestAnimationFrame(tick);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, beat]);

    return beatState;
}
