import { PageTransition } from "@/components/layout/page-transition";
import { ArrowLeft, Grid, Sword, Timer, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/neon-button";

// Drill data
const drills = [
    {
        id: "pattern",
        title: "Pattern Trainer",
        description: "Master AABB / ABAB rhyme schemes with visual guidance",
        icon: Grid,
        gradient: "from-cyan-500/20 via-cyan-400/10 to-blue-500/5",
        glowColor: "rgba(6, 182, 212, 0.4)",
        route: "/drill/pattern",
        tag: "RECOMMENDED",
        iconBg: "bg-cyan-500/10",
        iconColor: "text-cyan-400",
        tagBg: "bg-cyan-500/20",
        tagText: "text-cyan-400",
        tagBorder: "border-cyan-500/30"
    },
    {
        id: "battle",
        title: "Battle Simulator",
        description: "Face off against AI opponents in real-time rap battles",
        icon: Sword,
        gradient: "from-red-500/20 via-red-400/10 to-orange-500/5",
        glowColor: "rgba(239, 68, 68, 0.4)",
        route: "/battle",
        tag: "BETA",
        iconBg: "bg-red-500/10",
        iconColor: "text-red-400",
        tagBg: "bg-red-500/20",
        tagText: "text-red-400",
        tagBorder: "border-red-500/30"
    },
    {
        id: "no-pause",
        title: "No-Pause Drill",
        description: "Keep flowing without stopping - 0.8s silence = failure",
        icon: Timer,
        gradient: "from-amber-500/20 via-amber-400/10 to-yellow-500/5",
        glowColor: "rgba(245, 158, 11, 0.4)",
        route: "/drill/no-pause",
        tag: "HARDCORE",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-400",
        tagBg: "bg-amber-500/20",
        tagText: "text-amber-400",
        tagBorder: "border-amber-500/30"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
};

export default function Drills() {

    return (
        <PageTransition>
            <div className="min-h-screen p-4 md:p-8 relative bg-transparent">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
                    <div className="pointer-events-auto">
                        <Link to="/">
                            <NeonButton variant="secondary" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Home
                            </NeonButton>
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                    className="pt-28 pb-16 text-center"
                >
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full animate-pulse-glow" />
                            <div className="relative glass-surface p-6 rounded-3xl">
                                <Sparkles className="w-12 h-12 text-accent" />
                            </div>
                        </div>
                        <h1 className="text-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30">
                            DRILL CHAMBER
                        </h1>
                        <p className="text-body text-zinc-400 max-w-md">
                            Choose your training mode and sharpen your skills
                        </p>
                    </div>
                </motion.div>

                {/* Drill Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 pb-20 relative z-10"
                >
                    {drills.map((drill) => (
                        <Link
                            key={drill.id}
                            to={drill.route}
                            className="block"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer transform-gpu"
                            >
                                {/* Card Container */}
                                <div className="absolute inset-0 glass-surface border border-white/10 rounded-3xl transition-all duration-300 group-hover:border-white/20" />

                                {/* Gradient Background */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${drill.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl`}
                                />

                                {/* Glow */}
                                <div
                                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ boxShadow: `0 0 60px ${drill.glowColor}` }}
                                />

                                {/* Content */}
                                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                                    {/* Top */}
                                    <div className="space-y-6">
                                        <span className={`
                                            inline-block text-[10px] font-black uppercase tracking-wider
                                            px-3 py-1.5 rounded-full
                                            ${drill.tagBg} ${drill.tagText} border ${drill.tagBorder}
                                        `}>
                                            {drill.tag}
                                        </span>

                                        <div className="flex justify-center">
                                            <div className={`${drill.iconBg} p-8 rounded-3xl group-hover:scale-110 transition-transform duration-500`}>
                                                <drill.icon className={`w-16 h-16 ${drill.iconColor}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom */}
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-white tracking-tight">
                                            {drill.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {drill.description}
                                        </p>
                                        <div className="flex items-center justify-between text-white group-hover:text-cyan-400 transition-colors pt-2">
                                            <span className="text-sm font-bold uppercase tracking-wider">
                                                Start Drill →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

                {/* Footer Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center pb-8"
                >
                    <p className="text-caption text-zinc-600">
                        Use the ⚙️ Settings button to change beats and word packs
                    </p>
                </motion.div>
            </div>
        </PageTransition>
    );
}
