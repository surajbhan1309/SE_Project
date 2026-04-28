import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeatPlayer } from "@/lib/audio/BeatPlayer";
import { SpeechEngine } from "@/lib/audio/SpeechEngine";
import { RhymeEngine } from "@/lib/game/RhymeEngine";
import { BEATS } from "@/data/beats";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Play, Square, Trophy, Zap } from "lucide-react";

export function TimedRhymeGame() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [currentRhyme, setCurrentRhyme] = useState<{ vowel: string, example: string } | null>(null);
    const [lastMatch, setLastMatch] = useState<string | null>(null);
    const [bars, setBars] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);

    const beatPlayer = useRef(new BeatPlayer());
    const speechEngine = useRef(new SpeechEngine());
    const rhymeEngine = useRef(new RhymeEngine());

    // Bar counting logic (Mocked via interval for now, ideally sync to Tone.Transport)
    useEffect(() => {
        if (!isPlaying) return;

        // Assume 90 BPM ~ 2.6s per 4/4 bar
        const interval = setInterval(() => {
            setBars(b => {
                const newBar = b + 1;
                // Switch rhyme every 4 bars
                if (newBar % 4 === 0) {
                    nextRhyme();
                    setFeedback("SWITCH!");
                }
                return newBar;
            });
        }, 2666);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const nextRhyme = () => {
        setCurrentRhyme(rhymeEngine.current.getRandomVowelTarget());
    };

    const handleSpeech = (text: string, isFinal: boolean) => {
        if (!currentRhyme || !isFinal) return;

        // Check the last word of the phrase
        const words = text.split(" ");
        const lastWord = words[words.length - 1];

        if (rhymeEngine.current.matchesVowel(lastWord, currentRhyme.vowel)) {
            setScore(s => s + 100);
            setLastMatch(lastWord.toUpperCase());
            // Visual feedback
        }
    };

    const startGame = async () => {
        await beatPlayer.current.loadBeat(BEATS[0]); // Classic Boom Bap
        beatPlayer.current.start();
        speechEngine.current.start(handleSpeech);

        setScore(0);
        setBars(0);
        nextRhyme();
        setIsPlaying(true);
    };

    const stopGame = () => {
        beatPlayer.current.stop();
        speechEngine.current.stop();
        setIsPlaying(false);
        setCurrentRhyme(null);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
            <div className="w-full flex justify-between items-center text-primary">
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6" /> Score: <span className="font-mono text-2xl font-bold">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6" /> Bars: <span className="font-mono text-2xl font-bold">{bars}</span>
                </div>
            </div>

            <GlassCard className="w-full p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                {!isPlaying ? (
                    <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black text-white">TIMED CHALLENGE</h2>
                        <p className="text-muted-foreground text-xl">Every 4 bars using the target sound. <br /> Switch when you see the flash.</p>
                        <NeonButton size="xl" onClick={startGame} className="mt-8">
                            <Play className="mr-2 w-6 h-6" /> START
                        </NeonButton>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 relative z-10 text-center">
                        <div className="uppercase tracking-widest text-sm text-cyan-400">Target Sound</div>
                        <h1 className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                            {currentRhyme?.vowel}
                        </h1>
                        <p className="text-2xl text-white/60">Like: "{currentRhyme?.example}"</p>

                        {lastMatch && (
                            <motion.div
                                key={lastMatch}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-green-400 font-bold text-3xl mt-4"
                            >
                                MATCH: {lastMatch}
                            </motion.div>
                        )}

                        {/* Feedback Overlay */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 2 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <h2 className="text-6xl font-black text-red-500 stroke-white drop-shadow-xl">{feedback}</h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </GlassCard>

            {isPlaying && (
                <NeonButton variant="danger" onClick={stopGame} className="w-full max-w-sm">
                    <Square className="mr-2 w-4 h-4" /> GIVE UP
                </NeonButton>
            )}
        </div>
    );
}
