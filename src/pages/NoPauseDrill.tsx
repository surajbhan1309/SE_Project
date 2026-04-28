import { useState, useRef } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { MicrophoneMonitor } from "@/components/features/MicrophoneMonitor"; // Reusing monitor for drill
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { BEATS } from "@/data/beats";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, AlertOctagon } from "lucide-react";

export default function NoPauseDrill() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timeSurvived, setTimeSurvived] = useState(0);
    const beatPlayer = useRef(new BeatPlayer());
    const startTime = useRef<number>(0);
    const timerRef = useRef<number | null>(null);

    const startGame = async () => {
        setGameOver(false);
        setTimeSurvived(0);

        await AudioContextManager.getInstance().initialize();
        await beatPlayer.current.loadBeat(BEATS[2]); // Heavy Trap for pressure
        beatPlayer.current.start();

        setIsPlaying(true);
        startTime.current = Date.now();

        timerRef.current = window.setInterval(() => {
            setTimeSurvived((Date.now() - startTime.current) / 1000);
        }, 100);
    };

    const handleSilence = (isSilent: boolean) => {
        if (isSilent && isPlaying) {
            failGame();
        }
    };

    const failGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        beatPlayer.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen p-4 items-center justify-center relative">
                <div className="absolute top-4 left-4 z-20">
                    <Link to="/drills">
                        <NeonButton variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Drills
                        </NeonButton>
                    </Link>
                </div>

                <GlassCard className={`w-full max-w-2xl p-12 text-center transition-colors duration-300 ${gameOver ? "border-red-500 bg-red-950/30" : ""}`}>
                    {!isPlaying && !gameOver && (
                        <div className="space-y-6">
                            <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto text-primary">
                                <Zap className="w-12 h-12" />
                            </div>
                            <h1 className="text-5xl font-black">NO PAUSE DRILL</h1>
                            <p className="text-xl text-muted-foreground">
                                Rap continuously. <br />
                                <span className="text-red-400 font-bold">Silence  {'>'} 0.8s = GAME OVER.</span>
                            </p>
                            <NeonButton size="xl" onClick={startGame} className="mt-8 w-full">START DRILL</NeonButton>
                        </div>
                    )}

                    {isPlaying && (
                        <div className="space-y-8">
                            <div className="text-8xl font-mono font-black text-white/90">
                                {timeSurvived.toFixed(1)}s
                            </div>
                            <p className="text-green-400 font-bold tracking-widest animate-pulse">KEEP FLOWING</p>

                            {/* Silent Microphone Monitor just for logic */}
                            <div className="opacity-0 h-0 w-0 overflow-hidden">
                                <MicrophoneMonitor onSilence={handleSilence} silenceThreshold={800} />
                            </div>

                            <NeonButton variant="danger" onClick={failGame}>STOP</NeonButton>
                        </div>
                    )}

                    {gameOver && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-500/20 rounded-full w-fit mx-auto text-red-500">
                                <AlertOctagon className="w-16 h-16" />
                            </div>
                            <h1 className="text-6xl font-black text-red-500">FAILED</h1>
                            <p className="text-2xl">You Survived: <span className="font-bold text-white">{timeSurvived.toFixed(1)}s</span></p>

                            <NeonButton size="xl" onClick={startGame} className="mt-8 w-full">RETRY</NeonButton>
                        </div>
                    )}
                </GlassCard>
            </div>
        </PageTransition>
    );
}
