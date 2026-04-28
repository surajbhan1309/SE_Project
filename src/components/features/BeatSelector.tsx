import { useState } from "react";
import { useBeat } from "@/contexts/BeatContext";

import { Music, ChevronDown, Check, Activity, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const BeatSelector = () => {
    const { currentBeat, setCurrentBeat, allBeats, addCustomBeat } = useBeat();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Active Beat Display / Trigger */}
            <div className="relative group">
                <motion.button
                    layoutId="beat-selector-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 text-white pl-4 pr-3 py-2.5 rounded-full hover:bg-white/5 transition-colors shadow-lg z-10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span className="text-sm font-black tracking-widest uppercase hidden md:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            {currentBeat.name}
                        </span>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold hidden md:inline">
                            {currentBeat.bpm} BPM
                        </span>
                        <div className="bg-white/5 rounded-full p-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Drag & Drop Zone */}
            <AnimatePresence>
                {(isOpen) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 shadow-2xl relative overflow-hidden group/drop"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#22d3ee"; }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("audio/")) {
                                addCustomBeat(file);
                                setIsOpen(false);
                            }
                        }}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 border-dashed group-hover/drop:border-cyan-400/50 transition-colors">
                                <LinkIcon className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Drag MP3 Here</span>
                                <span className="text-[10px] text-zinc-500 font-mono">Auto-Saved to Library</span>
                            </div>
                        </div>

                        {/* Hidden File Input for Click */}
                        <input
                            type="file"
                            accept="audio/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    addCustomBeat(file);
                                    setIsOpen(false);
                                }
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="absolute right-0 top-full mt-4 w-80 perspective-1000 z-50"
                    >
                        <div className="bg-[#0a0a0b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Select Frequency</span>
                                <Music className="w-3 h-3 text-white/20" />
                            </div>

                            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                {allBeats.filter(b => b.id !== "custom-url").map((beat) => {
                                    const isActive = currentBeat.id === beat.id;
                                    const isCustom = beat.id.startsWith("custom-");
                                    return (
                                        <motion.button
                                            key={beat.id}
                                            onClick={() => {
                                                setCurrentBeat(beat);
                                                setIsOpen(false);
                                            }}
                                            whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all border border-transparent ${isActive
                                                ? "bg-cyan-500/10 border-cyan-500/20"
                                                : "hover:border-white/5"
                                                }`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`text-sm font-bold ${isActive ? "text-cyan-400 glow-text-primary" : isCustom ? "text-white" : "text-zinc-300"}`}>
                                                    {beat.name}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider opacity-60">
                                                    <span className={isActive ? "text-cyan-400/70" : "text-zinc-500"}>{beat.style}</span>
                                                    {beat.bpm && (
                                                        <>
                                                            <span className="text-white/20">•</span>
                                                            <span className={isActive ? "text-cyan-400/70" : "text-zinc-500"}>{beat.bpm} BPM</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring" }}
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                                                        <Check className="w-3 h-3 text-cyan-400" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
