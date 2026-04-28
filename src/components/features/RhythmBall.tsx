import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export function RhythmBall() {
    const ballRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();
    const [barIndex, setBarIndex] = useState(0);

    const animate = () => {
        if (Tone.Transport.state !== "started") {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        const bpm = Tone.Transport.bpm.value;
        const beatDuration = 60 / bpm;
        const measureDuration = beatDuration * 4;

        // precise time in seconds
        const time = Tone.Transport.seconds;

        // 0 to 1 progress through the measure (4 beats)
        const measureProgress = (time % measureDuration) / measureDuration;

        // Calculate X position (0% to 100% of container)
        // We want it to move across 4 bars.
        // Bar 0: 0-25%, Bar 1: 25-50%, etc.
        const xPercent = measureProgress * 100;

        // Calculate Y position (Bounce)
        // We need 4 bounces per measure.
        // 0-0.25 -> Bounce 1
        // 0.25-0.5 -> Bounce 2
        // etc.
        const beatProgress = (measureProgress * 4) % 1;

        // Sin wave for bounce: 0 -> 1 -> 0
        // Math.sin(0) = 0, Math.sin(PI) = 0.
        // So input should be 0 to PI.
        const yBounce = Math.sin(beatProgress * Math.PI);

        // Invert Y because CSS top 0 is top. 
        // We want 0 (bottom/land) -> 1 (high) -> 0 (land)
        // But simplified: 
        // top: 0% (High) -> 100% (Land)
        // We want land at start and end of beat? No, land ON the beat.
        // Beat starts at 0.0. So land at 0.0.
        // So curve should be: Land (0) -> Up -> Land (1)

        // Actually, usually "On Beat" is the impact.
        // So at progress 0.0, y should be "Down".
        // At progress 0.5, y should be "Up".
        // Math.abs(Math.sin(progress * PI)) starts at 0, goes to 1, back to 0.
        // So 0 is "Down". Perfect.

        const yPercent = (1 - yBounce) * 100; // 100% is bottom (floor)

        if (ballRef.current) {
            ballRef.current.style.left = `${xPercent}%`;
            ballRef.current.style.top = `${yPercent}%`; // 0% is top (high), 100% is bottom
        }

        // Update Grid Highlight
        const currentBar = Math.floor(measureProgress * 4);
        if (currentBar !== barIndex) {
            setBarIndex(currentBar);
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [barIndex]); // Dependencies

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 gap-12">
            {/* The Stage */}
            <div className="relative w-full max-w-2xl h-48 border-b-2 border-white/20">

                {/* Visual Guide Bars (Background) */}
                <div className="absolute inset-0 flex gap-4 opacity-20">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex-1 border-x border-white/10" />
                    ))}
                </div>

                {/* The Ball */}
                {/* 
                   We need a container for the ball to move in.
                   Left 0% = Left of Bar 1.
                   Left 100% = Right of Bar 4.
                */}
                <div className="absolute inset-x-0 bottom-0 top-0">
                    <div
                        ref={ballRef}
                        className="absolute w-12 h-12 bg-cyan-400 rounded-full shadow-[0_0_30px_cyan]"
                        style={{
                            left: '0%',
                            top: '100%',
                            transform: 'translate(-50%, -50%)' // Center the ball on the point
                        }}
                    />
                </div>
            </div>

            {/* The Bars (Grid) */}
            <div className="w-full max-w-2xl flex gap-4 h-16">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-lg border-2 transition-all duration-100 flex items-center justify-center
                            ${barIndex === i ? "border-cyan-400 bg-cyan-400/20 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "border-slate-700 bg-slate-900"}
                        `}
                    >
                        <span className={`font-black text-2xl ${barIndex === i ? "text-cyan-400" : "text-slate-700"}`}>
                            {i + 1}
                        </span>
                    </div>
                ))}
            </div>

            {/* Helper Text */}
            <div className="text-center space-y-2">
                <p className="text-muted-foreground animate-pulse font-mono text-xs">SYNCING TO AUDIO ENGINE...</p>
                <p className="text-white font-bold">Flow Phase: {barIndex + 1}/4</p>
            </div>
        </div>
    );
}
