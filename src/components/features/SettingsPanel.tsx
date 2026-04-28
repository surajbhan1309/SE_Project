import { useState } from "react";
import { Settings, X, Upload, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeat } from "@/contexts/BeatContext";
import { useWordPack } from "@/contexts/WordPackContext";
import { FlowingMenu } from "@/components/ui/FlowingMenu";

type Tab = "beats" | "wordpacks";

export function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("beats");

    const { currentBeat, setCurrentBeat, allBeats, addCustomBeat, removeCustomBeat } = useBeat();
    const { activeWordPack, setWordPack, availablePacks } = useWordPack();

    const beatItems = allBeats.map(beat => ({
        text: beat.name,
        // Using a placeholder image or a generated gradient image for beats if no image exists
        image: beat.style === "custom"
            ? "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
        link: "#",
        onClick: () => setCurrentBeat(beat),
        isActive: currentBeat.id === beat.id,
        description: `${beat.style} • ${beat.bpm} BPM`,
        actionIcon: beat.id.startsWith("custom-") ? <Trash2 className="w-3 h-3" /> : undefined,
        onAction: beat.id.startsWith("custom-") ? () => removeCustomBeat(beat.id) : undefined
    }));

    const packItems = availablePacks.map(pack => ({
        text: pack.name,
        // Using a placeholder image for packs
        image: "https://images.unsplash.com/photo-1456324504439-367cee13d643?q=80&w=600&auto=format&fit=crop",
        link: "#",
        onClick: () => setWordPack(pack.id),
        isActive: activeWordPack.id === pack.id,
        description: `${Object.keys(pack.rhyme_map).length} rhyme groups`
    }));

    return (
        <>
            {/* Trigger Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="fixed top-6 right-6 z-[60]"
            >
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                        group relative
                        w-12 h-12 rounded-full 
                        bg-black/40 backdrop-blur-xl
                        border border-white/10
                        grid place-items-center
                        hover:border-white/20 hover:bg-white/5
                        transition-colors duration-300
                        shadow-2xl shadow-black/50
                    "
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
                </motion.button>
            </motion.div>

            {/* Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-md bg-[#050505]/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl flex flex-col h-screen"
                        >
                            {/* Decorative Gradients */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                            {/* Header */}
                            <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/5 z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 grid place-items-center">
                                        <Settings className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Studio Settings</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 -mr-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="px-8 pt-6 pb-2 z-10 shrink-0">
                                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setActiveTab("beats")}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${activeTab === "beats"
                                            ? "bg-white/10 text-white shadow-lg shadow-black/20"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                            }`}
                                    >
                                        Beats
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("wordpacks")}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${activeTab === "wordpacks"
                                            ? "bg-white/10 text-white shadow-lg shadow-black/20"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                            }`}
                                    >
                                        Word Packs
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative z-10 min-h-0 bg-black/20">
                                {activeTab === "beats" && (
                                    <div className="h-full flex flex-col">
                                        {/* Beat Upload - Kept as a separate block above menu if desired, or remove if wanting pure menu */}
                                        <div className="px-8 pt-4 pb-2 shrink-0">
                                            <div
                                                className="p-4 border border-dashed border-white/10 rounded-xl text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer relative overflow-hidden group"
                                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#22d3ee"; }}
                                                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                                    const file = e.dataTransfer.files[0];
                                                    if (file && file.type.startsWith("audio/")) {
                                                        addCustomBeat(file);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) addCustomBeat(file);
                                                    }}
                                                />
                                                <div className="w-8 h-8 rounded-full bg-white/5 grid place-items-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                                <span className="text-xs text-zinc-500 group-hover:text-white transition-colors">Upload Custom Beat</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar">
                                            <FlowingMenu
                                                items={beatItems}
                                                bgColor="transparent"
                                                marqueeBgColor="#22d3ee"
                                                marqueeTextColor="#000"
                                                borderColor="rgba(255,255,255,0.1)"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "wordpacks" && (
                                    <div className="h-full w-full relative overflow-y-auto custom-scrollbar">
                                        <FlowingMenu
                                            items={packItems}
                                            bgColor="transparent"
                                            marqueeBgColor="#a855f7"
                                            marqueeTextColor="#fff"
                                            borderColor="rgba(255,255,255,0.1)"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
