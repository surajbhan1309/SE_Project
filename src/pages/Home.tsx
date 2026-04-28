import { NeonButton } from "@/components/ui/neon-button";
import { PageTransition } from "@/components/layout/page-transition";
import { Mic, Zap, Trophy, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingModal } from "@/components/features/OnboardingModal";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TextPressure from "@/components/ui/TextPressure";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export default function Home() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Simple check if visited before, or just show on first click
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 100, damping: 20 }
        }
    };

    return (
        <PageTransition>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-start min-h-screen p-4 pt-32 gap-12 text-center bg-transparent relative z-10 perspective-1000"
            >

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-8 mb-8 relative z-20">
                    {/* Logo/Title */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-[100px] opacity-50" />
                        <h1 className="text-display text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 relative z-10 select-none">
                            FLOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">STATE</span>
                        </h1>
                        <motion.div
                            className="absolute -top-4 -right-4 text-accent hidden md:block"
                            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Crown className="w-10 h-10 opacity-70" />
                        </motion.div>
                    </div>

                    {/* Tagline */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-title text-zinc-400 font-light">
                            The Academy of <span className="text-white font-medium">Freestyle</span>
                        </p>
                        <p className="text-caption text-primary/60">
                            MASTER THE ART OF RHYME // RHYTHM // FLOW
                        </p>
                    </div>

                    {/* CTA Button */}
                    <NeonButton
                        size="xl"
                        className="mt-4"
                        onClick={() => setShowOnboarding(true)}
                    >
                        <Mic className="w-5 h-5 mr-3" />
                        ENTER THE BOOTH
                    </NeonButton>
                </motion.div>

                {/* Feature Cards Grid */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-4 justify-center items-center"
                >
                    {/* FREESTYLE GYM CARD */}
                    <Link to="/freestyle" className="contents">
                        <CardContainer className="inter-var">
                            <CardBody className="bg-black/40 backdrop-blur-xl relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.3] dark:bg-black dark:border-white/[0.2] border-white/10 w-auto sm:w-[30rem] h-auto rounded-xl p-8 border flex flex-col items-center gap-6 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                                <CardItem translateZ="50" className="p-4 rounded-3xl bg-black/40 border border-white/10 text-secondary group-hover/card:text-primary transition-colors duration-300 shadow-xl relative z-10 mb-2 mt-4">
                                    <Zap className="w-10 h-10" />
                                </CardItem>

                                <CardItem translateZ="60" className="w-full relative z-10">
                                    <div style={{ position: 'relative', height: '100px', width: '100%' }}>
                                        <TextPressure
                                            text="FREESTYLE GYM"
                                            flex={true}
                                            alpha={false}
                                            stroke={false}
                                            width={true}
                                            weight={true}
                                            italic={true}
                                            textColor="#ffffff"
                                            strokeColor="#5227FF"
                                            minFontSize={36}
                                        />
                                    </div>
                                </CardItem>

                                <CardItem
                                    as="p"
                                    translateZ="40"
                                    className="text-sm text-zinc-400 group-hover/card:text-white/80 transition-colors px-4 leading-relaxed z-10 -mt-2 text-center"
                                >
                                    Infinite beats. Real-time visuals. <br /> Pure creative flow.
                                </CardItem>
                            </CardBody>
                        </CardContainer>
                    </Link>

                    {/* BATTLE & DRILLS CARD */}
                    <Link to="/drills" className="contents">
                        <CardContainer className="inter-var">
                            <CardBody className="bg-black/40 backdrop-blur-xl relative group/card dark:hover:shadow-2xl dark:hover:shadow-accent/[0.3] dark:bg-black dark:border-white/[0.2] border-white/10 w-auto sm:w-[30rem] h-auto rounded-xl p-8 border flex flex-col items-center gap-6 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                                <CardItem translateZ="50" className="p-4 rounded-3xl bg-black/40 border border-white/10 text-accent group-hover/card:text-white transition-colors duration-300 shadow-xl relative z-10 mb-2 mt-4">
                                    <Trophy className="w-10 h-10" />
                                </CardItem>

                                <CardItem translateZ="60" className="w-full relative z-10">
                                    <div style={{ position: 'relative', height: '100px', width: '100%' }}>
                                        <TextPressure
                                            text="BATTLE & DRILLS"
                                            flex={true}
                                            alpha={false}
                                            stroke={false}
                                            width={true}
                                            weight={true}
                                            italic={true}
                                            textColor="#ffffff"
                                            strokeColor="#ec4899"
                                            minFontSize={36}
                                        />
                                    </div>
                                </CardItem>

                                <CardItem
                                    as="p"
                                    translateZ="40"
                                    className="text-sm text-zinc-400 group-hover/card:text-white/80 transition-colors px-4 leading-relaxed z-10 -mt-2 text-center"
                                >
                                    Rhyme schemes. Punchlines. <br /> High intensity training.
                                </CardItem>
                            </CardBody>
                        </CardContainer>
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="text-xs font-mono text-white/20 mt-8 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> System Operational // V2.0
                </motion.div>

                {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
            </motion.div>
        </PageTransition>
    );
}
