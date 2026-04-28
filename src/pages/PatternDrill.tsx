import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { NeonButton } from "@/components/ui/neon-button";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { PatternEngine, PATTERNS } from "@/lib/game/PatternEngine";
import { Link } from "react-router-dom";
import { ArrowLeft, Grid, RefreshCw, Mic, Clock, Square } from "lucide-react";
import { RhythmGrid } from "@/components/features/RhythmGrid";
import { useBeatState } from "@/hooks/useBeatTiming";
import { useBeat } from "@/contexts/BeatContext";
import { useWordPack } from "@/contexts/WordPackContext";
import { RecordingModule } from "@/components/features/RecordingModule";
import { SessionProgress } from "@/components/features/SessionProgress";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import PillNav from "@/components/ui/PillNav";

type GameMode = "easy" | "punchline" | "cliff" | "hidden";
type SessionLength = 8 | 16 | 32 | 64 | "Infinity";

export default function PatternDrill() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [patternId, setPatternId] = useState<string>("AABB");
    const [gameMode, setGameMode] = useState<GameMode>("easy");
    const [sessionLength, setSessionLength] = useState<SessionLength>(16);
    const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);

    // Viewport Scroll State
    const [startBarIndex, setStartBarIndex] = useState(0);

    // Audio engine ref
    const beatPlayer = useRef(new BeatPlayer());
    // Pattern logic ref
    const patternEngine = useRef(new PatternEngine());
    // Ref to track hotswapping and prevent race conditions
    const lastBeatIdRef = useRef<string | null>(currentBeat?.id || null);

    // HOOK: Source of Truth for Timing (Low Frequency - purely for Logic/Grid)
    const timing = useBeatState(currentBeat, isPlaying);

    // EFFECT: Auto-Scroll Logic (Focus Mode)
    // Scroll active bar to Top.
    useEffect(() => {
        if (!isPlaying) {
            setStartBarIndex(0);
            return;
        }
        // Active Bar is always the first row. 0, 1, 2, 3...
        // This hides previous bars immediately.
        setStartBarIndex(timing.currentBar);
    }, [timing.currentBar, isPlaying]);

    // EFFECT: Check Session End
    useEffect(() => {
        if (isPlaying && sessionLength !== "Infinity" && timing.currentBar >= sessionLength) {
            stopGame("effect");
        }
    }, [timing.currentBar, isPlaying, sessionLength]);

    // EFFECT: Hotswap beat
    useEffect(() => {
        // Init ref if needed (first run safety)
        if (lastBeatIdRef.current === null && currentBeat?.id) {
            lastBeatIdRef.current = currentBeat.id;
        }

        // PREVENT HOTSWAP DURING PLAY - CAUSES SYNC BUGS
        // Only load if NOT playing.
        if (!isPlaying && !countdown && currentBeat.id !== lastBeatIdRef.current) {
            // console.log("Pre-loading beat:", currentBeat.name);
            lastBeatIdRef.current = currentBeat.id;
            beatPlayer.current.loadBeat(currentBeat).catch(console.error);
        }
    }, [currentBeat, isPlaying, countdown]);

    // EFFECT: Countdown Logic
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev! - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // GO!
            startAudio();
            setCountdown(null);
        }
    }, [countdown]);

    // EFFECT: Update Word Pack
    const { activeWordPack } = useWordPack();
    useEffect(() => {
        patternEngine.current.setPack(activeWordPack);
    }, [activeWordPack]);

    // EFFECT: Cleanup on unmount (navigation)
    useEffect(() => {
        return () => {
            beatPlayer.current.stop();
            // Reset global volume just in case
            Tone.Destination.volume.rampTo(-6, 0.1);
        };
    }, []);

    const startGame = async () => {
        // Initialize Pattern Engine
        patternEngine.current.setPattern(patternId);

        // Sync beat ID to prevent immediate hotswap race condition
        if (currentBeat) lastBeatIdRef.current = currentBeat.id;

        // Resume Context on Click (User Gesture)
        try {
            await AudioContextManager.getInstance().initialize();

            // Load words/beat but don't play yet
            await beatPlayer.current.loadBeat(currentBeat);

            // Mute initially
            Tone.Destination.volume.value = -60;

            // IMMEDIATE TRANSITION: Switch Scene First
            setIsPlaying(true);

            // Start Countdown
            setCountdown(3);
        } catch (error) {
            console.error("Failed to start pattern drill:", error);
            setIsPlaying(false);
            // Optional: Show toast or error UI
        }
    };

    const startAudio = async () => {
        try {
            await beatPlayer.current.start();
            Tone.Destination.volume.rampTo(-6, 0.5); // Quick fade-in

            // SCHEDULE AUTO-STOP (Post-Start to avoid .cancel() wipe)
            if (sessionLength !== "Infinity") {
                // Schedule stop exactly at the end of the last bar (e.g., "16:0:0")
                Tone.Transport.scheduleOnce(() => {
                    console.log("Session limit reached (Tone Scheduler)");
                    stopGame("scheduler");
                }, `${sessionLength}:0:0`);
            }
        } catch (e) {
            console.error("Failed to start audio", e);
            stopGame("error");
        }
    };

    const stopGame = (source = "user") => {
        console.log("Stopping Game. Source:", source);
        // Fade out polish (Faster now)
        Tone.Destination.volume.rampTo(-60, 0.1);
        setTimeout(() => {
            beatPlayer.current.stop();
            setIsPlaying(false);
            setCountdown(null);
            Tone.Destination.volume.value = -6; // Reset
        }, 100);
    };

    const togglePattern = () => {
        const keys = Object.keys(PATTERNS);
        const currentIndex = keys.indexOf(patternId);
        const nextIndex = (currentIndex + 1) % keys.length;
        setPatternId(keys[nextIndex]);
    };

    /**
     * Determines if a word should be visible based on Game Mode and Slot Position.
     */
    const getVisibility = (slotIndex: number, slots: string[]): boolean => {
        if (gameMode === "easy") return true;
        if (gameMode === "hidden") return false;

        const group = slots[slotIndex];
        // Find all indices of this group in the pattern
        const groupIndices = slots.map((s, i) => s === group ? i : -1).filter(i => i !== -1);
        const positionInGroup = groupIndices.indexOf(slotIndex); // 0 = first, 1 = second...

        if (gameMode === "punchline") {
            // Show ONLY the last one in the group
            return positionInGroup === groupIndices.length - 1;
        }

        if (gameMode === "cliff") {
            // Show ONLY the first one in the group
            return positionInGroup === 0;
        }

        return true;
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen bg-transparent text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">


                {/* HEADER / NAV */}
                <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
                    {/* Left: Back Button Area (Pointer events auto) */}
                    <div className="pointer-events-auto">
                        <Link to="/drills">
                            <NeonButton variant="secondary" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Exit Drill
                            </NeonButton>
                        </Link>
                    </div>

                    {/* Right: Recording Status (Visible when playing) */}
                    <div className="pointer-events-auto">
                        {isRecordingEnabled && (
                            <RecordingModule isRecording={isPlaying && !countdown} autoArm={true} />
                        )}
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 z-10 w-full max-w-7xl mx-auto">

                    {/* GAME AREA - Modes */}
                    <div className={`${isPlaying ? "opacity-0 pointer-events-none translate-y-[-20px] scale-90 absolute" : "mb-12 relative flex justify-center w-full"}`}>
                        <PillNav
                            initialLoadAnimation={true}
                            className="bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl"
                            activeHref={gameMode}
                            baseColor="#000000"
                            pillColor="#ffffff"
                            pillTextColor="#000000"
                            hoveredPillTextColor="#ffffff"
                            items={[
                                { label: "Easy", onClick: () => setGameMode("easy"), href: "easy" },
                                { label: "Punchline", onClick: () => setGameMode("punchline"), href: "punchline" },
                                { label: "Cliff", onClick: () => setGameMode("cliff"), href: "cliff" },
                                { label: "Hidden", onClick: () => setGameMode("hidden"), href: "hidden" }
                            ]}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {!isPlaying ? (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex-1 flex flex-col items-center justify-center max-w-2xl text-center z-20"
                            >
                                {/* Hero Icon with Ambient Glow */}
                                <div className="mb-8 relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full animate-pulse-glow" />
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative z-10 glass-surface p-8 rounded-3xl shadow-2xl"
                                    >
                                        <Grid className="w-16 h-16 text-cyan-400" />
                                    </motion.div>
                                </div>

                                {/* Pattern Title */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="text-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 mb-3 select-none"
                                >
                                    {PATTERNS[patternId].name}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg text-zinc-400 mb-10 font-light"
                                >
                                    Master the <span className="text-caption text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded-md border border-cyan-500/20">{PATTERNS[patternId].slots.join("-")}</span> rhyme scheme
                                </motion.p>

                                {/* Settings Row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex gap-4 mb-10 w-full max-w-md"
                                >
                                    {/* Length Selector */}
                                    <div className="flex-1 glass-surface p-4 rounded-2xl flex flex-col items-center gap-3 group">
                                        <span className="text-caption text-zinc-500 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Bars
                                        </span>
                                        <div className="flex gap-1.5">
                                            {(["16", "32", "inf"] as const).map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => setSessionLength(l === "inf" ? "Infinity" : parseInt(l) as SessionLength)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${((sessionLength === "Infinity" && l === "inf") || sessionLength === parseInt(l))
                                                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25"
                                                        : "text-zinc-500 bg-white/5 hover:bg-white/10 hover:text-white"
                                                        }`}
                                                >
                                                    {l === "inf" ? "∞" : l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recording Toggle */}
                                    <div className="flex-1 glass-surface p-4 rounded-2xl flex flex-col items-center gap-3 group">
                                        <span className="text-caption text-zinc-500 flex items-center gap-1.5">
                                            <Mic className="w-3 h-3" /> Record
                                        </span>
                                        <button
                                            onClick={() => setIsRecordingEnabled(!isRecordingEnabled)}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isRecordingEnabled
                                                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                                : "text-zinc-500 bg-white/5 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {isRecordingEnabled ? "ON" : "OFF"}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Primary CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col gap-4 w-full max-w-sm mx-auto"
                                >
                                    <NeonButton
                                        size="xl"
                                        onClick={startGame}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        START SESSION
                                    </NeonButton>

                                    <button
                                        onClick={togglePattern}
                                        className="flex items-center justify-center gap-2 text-caption text-zinc-500 hover:text-white transition-colors py-2"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Change Pattern
                                    </button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full flex flex-col items-center justify-center relative z-20"
                            >
                                {/* Compact HUD */}
                                <div className="w-full flex items-center justify-center gap-8 mb-6">
                                    {/* Pattern Badge */}
                                    <div className="glass-surface px-4 py-2 rounded-full flex items-center gap-2">
                                        <Grid className="w-4 h-4 text-cyan-400" />
                                        <span className="text-title text-white">{PATTERNS[patternId].name}</span>
                                    </div>

                                    {/* Progress Counter - Optimized Component */}
                                    <SessionProgress
                                        isPlaying={isPlaying}
                                        sessionLength={sessionLength}
                                        currentBar={timing.currentBar}
                                        beat={currentBeat}
                                    />
                                </div>

                                {/* MAIN GRID HUD */}
                                <div className="w-full max-w-6xl aspect-[16/9] max-h-[65vh] glass-surface rounded-[2rem] p-3 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />



                                    <RhythmGrid
                                        rows={4}
                                        barsPerRow={4} // This is actually BEATS per row
                                        startBarIndex={Math.max(0, startBarIndex * 4)} // Convert Bar Scroll to Step Scroll (Bar 0 -> Step 0, Bar 1 -> Step 4)
                                        activeBarIndex={(timing.currentBar * 4) + timing.beatIndex} // Pass Cumulative Step (Bar * 4 + Beat)
                                        renderBarContent={(globalStepIndex, isActive) => {
                                            // "Cell" Logic (Beat)
                                            const globalBarIndex = Math.floor(globalStepIndex / 4);
                                            const beatInBar = globalStepIndex % 4; // 0, 1, 2, 3

                                            const isLastBeat = beatInBar === 3; // The "4th Number"

                                            if (isLastBeat) {
                                                // Show Rhyme Word on the 4th Beat
                                                const rowTarget = patternEngine.current.getContentForBar(globalBarIndex);

                                                const patternLength = PATTERNS[patternId].slots.length;
                                                const slotIndex = globalBarIndex % patternLength;
                                                const isVisible = getVisibility(slotIndex, PATTERNS[patternId].slots);

                                                return (
                                                    <div className="flex flex-col items-center justify-center h-full w-full gap-2 relative overflow-hidden">
                                                        <div
                                                            className={`
                                                            relative px-4 py-3 rounded-2xl border transition-all duration-300 transform w-full text-center flex items-center justify-center shadow-lg
                                                            ${isActive
                                                                    ? "bg-cyan-500 text-black border-cyan-400 scale-105 shadow-[0_0_30px_rgba(6,182,212,0.5)] z-10"
                                                                    : "bg-white/5 text-white/80 border-white/5"}
                                                            ${!isVisible ? "opacity-30 blur-[2px] grayscale border-transparent bg-transparent" : "opacity-100"}
                                                        `}
                                                        >
                                                            <span className="text-xl md:text-3xl font-black uppercase tracking-tight truncate filter drop-shadow-md">
                                                                {isVisible ? rowTarget.suggestion : "???"}
                                                            </span>
                                                        </div>

                                                        {/* Vowel Helper Pill */}
                                                        {gameMode !== "hidden" && isActive && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                                                            >
                                                                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 whitespace-nowrap shadow-xl">
                                                                    {rowTarget.vowel.split('-')[0]} Note
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            // Beats 1, 2, 3 -> Show Number
                                            return (
                                                <div className={`flex flex-col items-center justify-center h-full w-full transition-all duration-300 ${isActive ? "scale-110 opacity-100" : "opacity-10"}`}>
                                                    <span className={`font-black text-4xl md:text-5xl select-none pointer-events-none ${isActive ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "text-white/50"}`}>
                                                        {beatInBar + 1}
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />

                                </div>

                                {/* COUNTDOWN OVERLAY - FIXED SCREEN CENTER */}
                                <AnimatePresence>
                                    {countdown !== null && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
                                        >
                                            <motion.div
                                                key={countdown}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1.5, opacity: 1 }}
                                                exit={{ scale: 2, opacity: 0 }}
                                                transition={{ duration: 0.5, type: "spring" }}
                                                className="font-black text-[12rem] text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 drop-shadow-[0_0_50px_rgba(6,182,212,0.8)]"
                                            >
                                                {countdown}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="flex justify-center mt-8"
                                >
                                    <button
                                        onClick={() => stopGame("manual")}
                                        className="group flex items-center gap-3 px-8 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <Square className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold tracking-widest uppercase">End Session</span>
                                    </button>
                                </motion.div>
                            </motion.div>
                        )
                        }
                    </AnimatePresence>
                </main>

                {/* DEBUG OVERLAY (Hidden visually but kept for structure) */}
                <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none">
                    {/* Progress removed from debug as it's no longer in main state */}
                    <div>Bar: {timing.currentBar}</div>
                    <div>Focus: {startBarIndex}</div>
                </div>

            </div>
        </PageTransition>
    );
}
