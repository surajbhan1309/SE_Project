import { motion } from "framer-motion";

export function AuroraBackground() {
    return (
        <div className="fixed inset-0 min-h-screen w-full -z-50 overflow-hidden bg-[#050508] text-white">
            {/* Aurora Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/30 rounded-full blur-[150px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 100, 0],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-secondary/20 rounded-full blur-[180px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    y: [0, -100, 0],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] bg-accent/20 rounded-full blur-[160px]"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
        </div>
    );
}
