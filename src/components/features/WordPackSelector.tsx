import { useState } from "react";
import { useWordPack } from "@/contexts/WordPackContext";
import { BookOpen, Check, Lock, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const WordPackSelector = () => {
    const { activeWordPack, availablePacks, setWordPack } = useWordPack();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* TRIGGER BUTTON (Top Left - Adjusted to avoid center overlap) */}
            <div className="fixed top-4 left-24 md:left-36 z-50">
                <motion.button
                    layoutId="word-pack-trigger"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all group shadow-xl hover:shadow-cyan-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none font-bold">Vocabulary</span>
                        <span className="text-sm font-black text-white leading-none mt-1 group-hover:text-cyan-200 transition-colors">{activeWordPack.name}</span>
                    </div>
                </motion.button>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            layoutId="word-pack-modal"
                            className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                                        <BookOpen className="w-6 h-6 text-cyan-400" />
                                        WORD PACKS
                                    </h2>
                                    <p className="text-zinc-400 text-sm mt-1">Select the vocabulary set for your freestyle training.</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">Close</span>
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="p-6 overflow-y-auto custom-scrollbar bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availablePacks.map((pack) => {
                                        const isActive = pack.id === activeWordPack.id;
                                        return (
                                            <button
                                                key={pack.id}
                                                onClick={() => {
                                                    if (pack.is_unlocked) {
                                                        setWordPack(pack.id);
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                disabled={!pack.is_unlocked}
                                                className={`relativetext-left p-5 rounded-xl border transition-all duration-200 group flex flex-col h-full
                                                    ${isActive
                                                        ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]"
                                                        : "bg-zinc-900/50 border-white/5 hover:bg-zinc-800 hover:border-white/20"
                                                    }
                                                    ${!pack.is_unlocked ? "opacity-40 grayscale cursor-not-allowed" : ""}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-3 w-full">
                                                    <h3 className={`font-black text-lg tracking-tight ${isActive ? "text-cyan-400" : "text-white group-hover:text-cyan-200"}`}>
                                                        {pack.name}
                                                    </h3>
                                                    {isActive ? (
                                                        <div className="bg-cyan-500/20 p-1.5 rounded-full">
                                                            <Check className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                    ) : !pack.is_unlocked && (
                                                        <Lock className="w-4 h-4 text-zinc-600" />
                                                    )}
                                                </div>

                                                <p className="text-sm text-zinc-400 mb-4 leading-relaxed flex-grow text-left">
                                                    {pack.description}
                                                </p>

                                                <div className="w-full h-px bg-white/5 mb-4" />

                                                <div className="flex items-center justify-between text-xs w-full mt-auto">
                                                    <div className="flex gap-0.5" title={`Difficulty: ${pack.difficulty_rating}/5`}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3 h-3 ${i < pack.difficulty_rating ? "fill-cyan-500 text-cyan-500" : "text-zinc-800 fill-zinc-900"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                        ${isActive ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : "bg-zinc-950 text-zinc-500 border border-zinc-800"}
                                                    `}>
                                                        {Object.keys(pack.rhyme_map).length} Words
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
