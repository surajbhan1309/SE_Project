import { motion } from "framer-motion";
import { Skull } from "lucide-react";

interface OpponentAvatarProps {
    isActive: boolean;
    isDefeated?: boolean;
}

export function OpponentAvatar({ isActive, isDefeated = false }: OpponentAvatarProps) {
    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Avatar Container */}
            <div className="relative w-32 h-32 md:w-48 md:h-48">
                {/* Glow Ring */}
                <motion.div
                    animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                        opacity: isActive ? 0.8 : 0.3,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-xl ${isDefeated ? 'bg-zinc-800' : 'bg-red-600'}`}
                />

                {/* Inner Circle */}
                <div className={`
                    absolute inset-2 rounded-full flex items-center justify-center 
                    border-4 transition-colors duration-500
                    ${isActive ? 'border-red-500 bg-black' : 'border-zinc-700 bg-zinc-900'}
                    ${isDefeated ? 'border-zinc-800 opacity-50' : ''}
                `}>
                    {/* Character Icon */}
                    <motion.div
                        animate={isActive ? {
                            scale: [1, 1.05, 1],
                            rotate: [0, -2, 2, 0]
                        } : {}}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                        <Skull className={`
                            w-16 h-16 md:w-24 md:h-24 transition-colors duration-300
                            ${isActive ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-zinc-600'}
                            ${isDefeated ? 'text-zinc-800' : ''}
                        `} />
                    </motion.div>
                </div>

                {/* Speaking Waves (Only when active) */}
                {isActive && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 rounded-full border border-red-500"
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.5 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Name Tag */}
            <motion.div
                className="mt-6 flex flex-col items-center gap-1"
                animate={{ opacity: isDefeated ? 0.5 : 1 }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-[0.2em] text-red-500 uppercase">Opponent</span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    Quantum <span className="text-red-500">MC</span>
                </h3>
            </motion.div>
        </div>
    );
}
