import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { NeonButton } from "@/components/ui/neon-button";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { useBeat } from "@/contexts/BeatContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Sword } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ROASTS from "@/data/roasts.json";

// Battle UI Components
import { BattleStage } from "@/components/battle/BattleStage";
import { OpponentAvatar } from "@/components/battle/OpponentAvatar";
import { PlayerHUD } from "@/components/battle/PlayerHUD";
import { EnergyBar } from "@/components/battle/EnergyBar";
import { CinematicLyrics } from "@/components/battle/CinematicLyrics";

type Turn = "intro" | "ai" | "user" | "outro";

export default function BattleTrainer() {
    const { currentBeat } = useBeat();
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [turn, setTurn] = useState<Turn>("intro");
    const [currentRoast, setCurrentRoast] = useState("");
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [timeLeft, setTimeLeft] = useState(8);
    const [combo, setCombo] = useState(0);

    const beatPlayer = useRef(new BeatPlayer());
    const roundTimer = useRef<number | null>(null);
    const countdownInterval = useRef<number | null>(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        return () => {
            stopGame();
        };
    }, []);

    // Hotswap Effect - DISABLED TO PREVENT BEAT STOPPING BUGS
    // useEffect(() => {
    //     if (isPlaying) {
    //         // Only reload if beat changed during gameplay (Hotswap)
    //         if (beatPlayer.current.getCurrentBeat?.id !== currentBeat.id) {
    //             beatPlayer.current.loadBeat(currentBeat).then(() => {
    //                 beatPlayer.current.start();
    //             });
    //         }
    //     }
    // }, [currentBeat]); 

    // Countdown timer
    useEffect(() => {
        if (isPlaying && (turn === "ai" || turn === "user")) {
            setTimeLeft(12); // Reset to 12s
            countdownInterval.current = window.setInterval(() => {
                setTimeLeft(t => Math.max(0, t - 1));
            }, 1000);
            return () => {
                if (countdownInterval.current) clearInterval(countdownInterval.current);
            };
        }
    }, [turn, isPlaying]);

    const speakRoast = (text: string) => {
        if (synth.speaking) synth.cancel();
        const cleanText = text.replace(/\//g, ",");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0; // Normal speed for 12s duration
        utterance.pitch = 0.8;
        utterance.volume = 1.0;
        const voices = synth.getVoices();
        const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark"));
        if (maleVoice) utterance.voice = maleVoice;
        synth.speak(utterance);
    };

    const startGame = async () => {
        // 1. Reset Game State
        stopGame();
        setGameOver(false);
        setScore(0);
        setRound(0);
        setCombo(0);
        setTurn("intro");
        setCurrentRoast("GET READY...");

        // 2. Initialize Audio
        await AudioContextManager.getInstance().initialize();

        // 3. Load & Start Beat
        try {
            await beatPlayer.current.loadBeat(currentBeat);
            await beatPlayer.current.start();
            setIsPlaying(true); // Only set playing if audio started successfully
        } catch (error) {
            console.error("Failed to start beat:", error);
            // Handle error (maybe show toast?)
            return;
        }

        setTimeout(() => {
            startAITurn();
        }, 4000); // 1 bar intro
    };

    const startAITurn = () => {
        setTurn("ai");
        setRound(r => r + 1);

        // Pick 2 distinct roasts for 4 bars
        let r1 = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        let r2 = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        while (r1 === r2) {
            r2 = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        }

        const combinedRoast = `${r1} / ${r2}`;
        setCurrentRoast(combinedRoast);
        speakRoast(combinedRoast);

        // 12 seconds for the turn
        roundTimer.current = window.setTimeout(() => {
            startUserTurn();
        }, 12000);
    };

    const startUserTurn = () => {
        setTurn("user");
        setCurrentRoast("YOUR TURN!");

        roundTimer.current = window.setTimeout(() => {
            setScore(s => s + 500 + (combo * 100));
            setCombo(c => c + 1);
            startAITurn();
        }, 12000);
    };

    const stopGame = () => {
        setIsPlaying(false);
        beatPlayer.current.stop();
        synth.cancel();
        if (roundTimer.current) clearTimeout(roundTimer.current);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
    };

    const surrender = () => {
        stopGame();
        setGameOver(true);
    };

    return (
        <PageTransition>
            <BattleStage>
                {/* Header / Exit */}
                <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
                    <Link to="/drills" className="pointer-events-auto">
                        <NeonButton variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
                        </NeonButton>
                    </Link>

                    {/* Top Right: Controls */}
                    {isPlaying && (
                        <div className="flex items-center gap-4 pointer-events-auto">
                            <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                                <span className="text-zinc-400 text-xs font-bold uppercase mr-2">Round</span>
                                <span className="text-white font-black">{round}</span>
                            </div>

                            <button
                                onClick={surrender}
                                className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 text-xs font-bold uppercase hover:bg-red-500/10 transition-colors"
                            >
                                Surrender
                            </button>
                        </div>
                    )}
                </header>

                {/* Main Content Area */}
                <div className="flex-1 w-full flex flex-col justify-between py-8 px-4 relative z-10">

                    {/* Setup Screen (Intro) */}
                    <AnimatePresence mode="wait">
                        {!isPlaying && !gameOver && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                className="absolute inset-0 flex flex-col items-center justify-center"
                            >
                                <div className="text-center space-y-8 max-w-lg mx-auto bg-black/80 p-12 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-red-600 tracking-tighter">
                                        BATTLE<br />ARENA
                                    </h1>
                                    <p className="text-zinc-400 text-lg">
                                        Step onto the stage. Face the Quantum MC.
                                        <br /><span className="text-red-500 font-bold">Survive the flow.</span>
                                    </p>
                                    <NeonButton size="xl" onClick={startGame} className="w-full" variant="danger">
                                        <Sword className="mr-2 h-5 w-5" /> START BATTLE
                                    </NeonButton>

                                    <div className="grid grid-cols-3 gap-4 text-xs font-mono text-zinc-600 mt-8 pt-8 border-t border-white/5">
                                        <div>12S ROUNDS</div>
                                        <div>4-BAR VERSES</div>
                                        <div>AUTO-SCORING</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Game UI */}
                    {isPlaying && !gameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-between"
                        >
                            {/* Top: Energy Bar */}
                            <div className="w-full max-w-3xl mb-8">
                                <EnergyBar
                                    aiEnergy={50 - (combo * 2)} // Simulated AI energy drop
                                    userEnergy={50 + (combo * 2)} // Simulated User momentum
                                />
                            </div>

                            {/* Center Top: Opponent */}
                            <div className="flex-1 w-full flex flex-col items-center justify-start pt-4 gap-24">
                                <div className="shrink-0 relative z-10">
                                    <OpponentAvatar
                                        isActive={turn === "ai"}
                                    />
                                </div>

                                {/* Lyrics Display - Pushed down to prevent overlap */}
                                <div className="w-full max-w-5xl px-4 flex-1 flex items-start justify-center relative z-20 min-h-[150px] mt-8">
                                    <CinematicLyrics
                                        text={currentRoast}
                                        isActive={turn === "ai"}
                                    />
                                </div>
                            </div>

                            {/* Bottom: Player HUD */}
                            <PlayerHUD
                                isActive={turn === "user"}
                                timeLeft={timeLeft}
                                score={score}
                            />
                        </motion.div>
                    )}

                    {/* Game Over Screen */}
                    {gameOver && (
                        <motion.div
                            key="gameover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50"
                        >
                            <h2 className="text-8xl font-black text-white mb-2">FINISHED</h2>
                            <p className="text-2xl text-zinc-400 mb-12">FINAL SCORE: <span className="text-yellow-400">{score.toLocaleString()}</span></p>

                            <NeonButton size="xl" onClick={startGame} variant="primary">
                                PLAY AGAIN
                            </NeonButton>
                        </motion.div>
                    )}
                </div>
            </BattleStage>
        </PageTransition>
    );
}
