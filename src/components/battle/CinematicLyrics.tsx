import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicLyricsProps {
    text: string;
    isActive: boolean;
}

export function CinematicLyrics({ text, isActive }: CinematicLyricsProps) {
    // Split text into lines (assuming " / " separator)
    const lines = text.split(" / ");

    return (
        <div className="w-full max-w-4xl mx-auto h-64 flex flex-col items-center justify-center perspective-500">
            <AnimatePresence mode="wait">
                {isActive && text && (
                    <motion.div
                        key={text} // Re-animate on new text
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 text-center"
                    >
                        {lines.map((line, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    delay: index * 1.5, // Stagger effect matching rough speech timing
                                    duration: 0.5,
                                    type: "spring"
                                }}
                                className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-lg"
                            >
                                "{line}"
                            </motion.p>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
