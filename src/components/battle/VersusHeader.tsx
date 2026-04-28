import { Trophy, Zap, ArrowLeft } from "lucide-react";

interface VersusHeaderProps {
    round: number;
    score: number;
    combo: number;
    onExit: () => void;
    onSurrender: () => void;
}

export function VersusHeader({ round, score, combo, onExit, onSurrender }: VersusHeaderProps) {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 pointer-events-none">
            <div className="flex items-center justify-between w-full">
                {/* Left: Exit & Stats */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button
                        onClick={onExit}
                        className="p-2 rounded-full bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span className="text-white font-bold text-sm tracking-wider">{score.toLocaleString()}</span>
                        </div>
                        {combo > 0 && (
                            <div className="bg-black/50 backdrop-blur-md border border-orange-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                                <Zap className="w-3 h-3 text-orange-400" />
                                <span className="text-orange-400 font-bold text-sm tracking-wider">{combo}x</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: VS Emblem */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center">
                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/5 px-6 py-2 rounded-full shadow-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs font-black tracking-[0.2em] text-blue-200">YOU</span>
                        </div>

                        <span className="text-xl font-black italic text-zinc-600 px-2">VS</span>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-[0.2em] text-red-200">AI</span>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Round Indicator Below */}
                    <div className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Round {round}
                    </div>
                </div>

                {/* Right: Surrender */}
                <div className="pointer-events-auto">
                    <button
                        onClick={onSurrender}
                        className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 text-xs font-bold uppercase hover:bg-red-500/10 hover:border-red-500/60 transition-all"
                    >
                        Surrender
                    </button>
                </div>
            </div>
        </header>
    );
}
