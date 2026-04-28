import React from "react";
import { motion } from "framer-motion";

interface BattleStageProps {
    children: React.ReactNode;
    intensity?: "low" | "medium" | "high";
}

export function BattleStage({ children }: BattleStageProps) {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center perspective-1000">
            {/* Ambient Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-purple-950/20 to-black opacity-80" />

                {/* Stage Spotlights */}
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent blur-[100px]"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-b from-purple-500/10 via-transparent to-transparent blur-[100px]"
                />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />

                {/* Scanlines / Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20" />
            </div>

            {/* Crowd / Atmosphere Layer (Abstract) */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 pointer-events-none">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-t from-black via-zinc-900/50 to-transparent blur-xl opacity-60"
                />
            </div>

            {/* Main Stage Content */}
            <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col">
                {children}
            </div>
        </div>
    );
}
