import { motion } from "framer-motion";
import { Mic } from "lucide-react";

interface PlayerHUDProps {
    isActive: boolean;
    timeLeft: number;
    score: number;
}

export function PlayerHUD({ isActive, timeLeft, score }: PlayerHUDProps) {
    return (
        <div className="relative w-full max-w-4xl mx-auto mt-auto">
            {/* Active Turn Indicator Border */}
            <motion.div
                className="absolute -inset-4 rounded-3xl border border-cyan-500/0 pointer-events-none"
                animate={{
                    borderColor: isActive ? "rgba(6,182,212,0.3)" : "rgba(6,182,212,0)",
                    boxShadow: isActive ? "inset 0 0 50px rgba(6,182,212,0.1)" : "none"
                }}
            />

            <div className="flex items-end justify-between gap-8">
                {/* Left: Score Stats */}
                <div className="hidden md:flex flex-col gap-2">
                    <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Score</span>
                    <span className="text-3xl font-black text-white tabular-nums">{score.toLocaleString()}</span>
                </div>

                {/* Center: Mic / Visualizer */}
                <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="relative">
                        {/* Countdown Ring */}
                        {isActive && (
                            <div className="absolute inset-[-8px] z-0">
                                <svg className="w-[96px] h-[96px] -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="46"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="4"
                                    />
                                    <motion.circle
                                        cx="48" cy="48" r="46"
                                        fill="none"
                                        stroke={timeLeft <= 3 ? "#ef4444" : "#06b6d4"}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 1 }}
                                        animate={{ pathLength: timeLeft / 12 }} // Assuming 12s round
                                        transition={{ duration: 1, ease: "linear" }}
                                        style={{ filter: timeLeft <= 3 ? "drop-shadow(0 0 8px rgba(239,68,68,0.8))" : "none" }}
                                    />
                                </svg>
                            </div>
                        )}

                        {/* Mic Circle */}
                        <motion.div
                            className={`
                                w-20 h-20 rounded-full flex items-center justify-center
                                border-2 backdrop-blur-md transition-all duration-300 relative z-10
                                ${isActive ? 'bg-cyan-500/10 border-cyan-400' : 'bg-black/40 border-zinc-800'}
                            `}
                            animate={{ scale: isActive ? 1.1 : 1 }}
                        >
                            <Mic className={`w-8 h-8 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`} />
                        </motion.div>

                        {/* Ripple Effect when active */}
                        {isActive && (
                            <>
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-cyan-500"
                                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </>
                        )}
                    </div>

                    {/* Status Text / Timer */}
                    <div className="text-center">
                        <p className={`text-sm font-bold tracking-widest uppercase mb-1 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`}>
                            {isActive ? "Your Turn" : "Listen"}
                        </p>
                        <p className={`text-2xl font-black tabular-nums ${timeLeft <= 3 && isActive ? 'text-red-500' : 'text-white'}`}>
                            {timeLeft}<span className="text-sm font-medium text-zinc-600 ml-1">SEC</span>
                        </p>
                    </div>
                </div>

                {/* Right: Visualizer bars (Simulated) */}
                <div className="hidden md:flex flex-col gap-2 items-end">
                    <div className="flex items-end gap-1 h-12">
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                className={`w-1.5 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                                animate={{ height: isActive ? [10, 30, 15, 40, 20] : 4 }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: i * 0.1
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
