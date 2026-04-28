import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { PageTransition } from "@/components/layout/page-transition";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor";
import { Visualizer } from "@/components/features/Visualizer";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Square, Music, Activity, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { RecordingModule } from "@/components/features/RecordingModule";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { PromptEngine } from "@/lib/game/PromptEngine";
import { useBeat } from "@/contexts/BeatContext";
import { SpeechEngine } from "@/lib/audio/SpeechEngine";
import { RhythmGrid } from "@/components/features/RhythmGrid";
import { AnimatePresence, motion } from "framer-motion";
import * as Tone from "tone";

export default function Freestyle() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStarting, setIsStarting] = useState(false); // New state for visual loading
    const [prompt, setPrompt] = useState("Topic");
    const [lastSpoken, setLastSpoken] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const beatPlayer = useRef(new BeatPlayer());
    const promptEngine = useRef(new PromptEngine());
    const speechEngine = useRef(new SpeechEngine());

    // Auto-refresh prompt
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            const newWord = promptEngine.current.getWord().toUpperCase();
            setPrompt(newWord);
        }, 8000);
        setPrompt(promptEngine.current.getTopic().toUpperCase());

        // Score ticker
        const scoreInterval = setInterval(() => {
            setScore(s => s + 10);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(scoreInterval);
        };
    }, [isPlaying]);

    // Hotswap Effect
    useEffect(() => {
        if (isPlaying) {
            setPrompt(`${currentBeat.name}`);
            setTimeout(() => setPrompt(promptEngine.current.getTopic().toUpperCase()), 1500);
            beatPlayer.current.loadBeat(currentBeat).then(() => {
                beatPlayer.current.start();
            });
        }
    }, [currentBeat, isPlaying]);

    const handleSpeechResult = (text: string, isFinal: boolean) => {
        setLastSpoken(text);
        if (isFinal) {
            const currentPrompt = prompt.toLowerCase();
            if (text.toLowerCase().includes(currentPrompt)) {
                setFeedback("TARGET HIT! +500");
                setScore(s => s + 500);
                setTimeout(() => setFeedback(null), 1000);
            }
        }
    };

    const handleSilence = (isSilent: boolean) => {
        if (isSilent && isPlaying) {
            setFeedback("DON'T FREEZE! -50");
            setScore(s => Math.max(0, s - 50));
            // Trigger visual shake?
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleFiller = (word: string) => {
        setFeedback(`NO FILLERS! (${word.toUpperCase()}) -20`);
        setScore(s => Math.max(0, s - 20));
        setTimeout(() => setFeedback(null), 1000);
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            beatPlayer.current.stop();
            speechEngine.current.stop();
            // Reset global volume just in case
            Tone.Destination.volume.rampTo(-6, 0.1);
        };
    }, []);

    const toggleSession = async () => {
        console.log("Toggle Session Clicked. Current State:", isPlaying);

        if (!isPlaying) {
            try {
                console.log("Starting Session...");
                setIsStarting(true); // Trigger UI loading state
                setFeedback("GET READY..."); // Visual Feedback

                // 1. Initialize Audio Context
                await AudioContextManager.getInstance().initialize();

                // 2. Prepare Beat (Silent)
                Tone.Destination.volume.value = -60; // Mute initially
                await beatPlayer.current.loadBeat(currentBeat);

                // 3. Short Visual Delay (optional "breath" before music)
                await new Promise(resolve => setTimeout(resolve, 800));

                // 4. Start Engine & Ramp Volume (Build-up)
                await beatPlayer.current.start();
                Tone.Destination.volume.rampTo(-6, 2.5); // 2.5s Fade In

                speechEngine.current.start(handleSpeechResult, handleFiller);

                setScore(0);
                setIsPlaying(true);
                setFeedback(null); // Clear "Get Ready"
                console.log("Session Started Successfully");
            } catch (err) {
                console.error("Failed to start session:", err);
            } finally {
                setIsStarting(false);
            }
        } else {
            console.log("Stopping Session...");
            try {
                // Fade out slightly on stop for polish?
                Tone.Destination.volume.rampTo(-60, 0.5);
                setTimeout(() => {
                    beatPlayer.current.stop();
                    speechEngine.current.stop();
                    Tone.Destination.volume.value = -6; // Reset for next time
                }, 500);

                console.log("Engines stopped.");
            } catch (err) {
                console.error("Error stopping engines:", err);
            } finally {
                // FORCE STATE UPDATE
                console.log("Updating State to Stopped");
                setIsPlaying(false);
                setFeedback(null);
            }
        }
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen p-4 gap-6 items-center justify-center relative overflow-hidden">


                <div className="absolute top-6 left-6 z-30">
                    <Link to="/">
                        <NeonButton variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
                        </NeonButton>
                    </Link>
                </div>

                {/* Score Header - Premium Floating Pill */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-6 right-6 z-30"
                >
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                        <TrophyIcon className="w-4 h-4 text-yellow-400" />
                        <div className="h-4 w-px bg-white/10" />
                        <span className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            {score.toLocaleString()} PTS
                        </span>
                    </div>
                </motion.div>

                {/* Main Session Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl relative z-10 px-4 md:px-8">

                    {/* Left Panel: Audio Control & Visuals */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="h-full"
                    >
                        <GlassCard className="h-full p-1 flex flex-col min-h-[500px] border-white/5 bg-black/40 shadow-2xl overflow-hidden relative group">
                            {/* Inner Container */}
                            <div className="flex-1 rounded-[2rem] bg-black/60 border border-white/5 p-6 flex flex-col gap-6 relative overflow-hidden backdrop-blur-md">

                                {/* Status Header */}
                                <div className="flex justify-between items-start z-10">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-title text-white flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-primary" />
                                            AUDIO MONITOR
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                                            <span className="text-caption text-zinc-500">
                                                {isPlaying ? "LIVE FEED ACTIVE" : "SYSTEM STANDBY"}
                                            </span>
                                        </div>
                                    </div>
                                    <RecordingModule isRecording={isPlaying} autoArm={true} />
                                </div>

                                {/* Main Visualizer Area */}
                                <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-inner group-hover:border-primary/20 transition-colors duration-500">
                                    <MicrophoneMonitor
                                        renderVisualizer={(analyser) => <Visualizer analyser={analyser} className="w-full h-full opacity-80" />}
                                        onSilence={handleSilence}
                                        silenceThreshold={1200}
                                    />

                                    {/* Speech Text Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <p className="text-center font-mono text-lg md:text-xl text-white/90 drop-shadow-lg min-h-[1.5em] transition-all duration-200">
                                            {lastSpoken || <span className="text-white/20 animate-pulse">Waiting for audio input...</span>}
                                        </p>
                                    </div>

                                    {!isPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10">
                                            <div className="px-4 py-2 rounded-full border border-white/10 bg-black/80 text-xs text-white/50 font-mono tracking-widest uppercase">
                                                Visualizer Offline
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Rhythm Grid Section */}
                                <div className="h-24 relative glass-surface rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                                    {isPlaying ? (
                                        <RhythmGrid rows={1} barsPerRow={4} />
                                    ) : (
                                        <div className="text-caption text-zinc-600 flex items-center gap-2">
                                            <Music className="w-3 h-3" /> Rhythm Engine Offline
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="relative z-20">
                                    <NeonButton
                                        size="xl"
                                        variant={isPlaying ? "danger" : "primary"}
                                        onClick={toggleSession}
                                        disabled={isStarting}
                                        className="w-full shadow-lg"
                                    >
                                        {isStarting ? (
                                            <><Sparkles className="mr-2 h-5 w-5 animate-spin" /> INITIALIZING...</>
                                        ) : isPlaying ? (
                                            <><Square className="mr-2 h-5 w-5 fill-current" /> TERMINATE SESSION</>
                                        ) : (
                                            <><Play className="mr-2 h-5 w-5 fill-current" /> INITIATE FREESTYLE</>
                                        )}
                                    </NeonButton>
                                </div>
                            </div>

                            {/* Decorative Corner Gradients */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 blur-3xl pointer-events-none" />
                        </GlassCard>
                    </motion.div>

                    {/* Right Panel: Prompt Engine */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-full"
                    >
                        <GlassCard className="h-full flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-black border-white/10 shadow-2xl p-0">
                            {/* Background Effects */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-20" />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-8 w-full p-12">
                                <div className="glass-surface px-4 py-2 rounded-full flex items-center gap-2">
                                    <Sparkles className={`w-4 h-4 ${isPlaying ? "text-cyan-400 animate-spin-slow" : "text-zinc-600"}`} />
                                    <span className="text-caption text-zinc-400">
                                        Neurolinguistic Engine
                                    </span>
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={prompt}
                                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(8px)" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -20, scale: 1.05, filter: "blur(8px)" }}
                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                        className="text-center"
                                    >
                                        <h2 className="text-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 select-none">
                                            {prompt}
                                        </h2>
                                    </motion.div>
                                </AnimatePresence>

                                {/* System Feedback UI */}
                                <div className="mt-8 h-16 w-full flex justify-center items-center">
                                    <AnimatePresence>
                                        {feedback && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                className={`px-8 py-3 rounded-full backdrop-blur-md border ${feedback.includes("HIT")
                                                    ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                                                    : "bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                                                    }`}
                                            >
                                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide">
                                                    {feedback}
                                                </h3>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}

function TrophyIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
