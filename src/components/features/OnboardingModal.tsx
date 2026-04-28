import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { Mic, Headphones, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
    onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [micError, setMicError] = useState(false);

    const handleMicPermission = async () => {
        try {
            await AudioContextManager.getInstance().initialize();
            setStep(1);
        } catch (e) {
            console.error(e);
            setMicError(true);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <GlassCard className="max-w-md w-full p-8 flex flex-col items-center text-center gap-6">
                    {step === 0 && (
                        <>
                            <div className="p-4 rounded-full bg-primary/20 text-primary">
                                <Mic className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/80">
                                Microphone Access
                            </h2>
                            <p className="text-muted-foreground">
                                FlowState needs access to your microphone to analyze your flow and provide visual feedback.
                            </p>
                            {micError && <p className="text-destructive">Access denied. Please enable permission in browser settings.</p>}

                            <NeonButton onClick={handleMicPermission} className="w-full">
                                Grant Access
                            </NeonButton>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <div className="p-4 rounded-full bg-secondary/20 text-secondary">
                                <Headphones className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold">Use Headphones</h2>
                            <p className="text-muted-foreground">
                                For the best experience and to avoid audio feedback loops, please wear headphones.
                            </p>

                            <NeonButton onClick={onComplete} className="w-full">
                                I'm Ready <ArrowRight className="w-4 h-4" />
                            </NeonButton>
                        </>
                    )}
                </GlassCard>
            </motion.div>
        </AnimatePresence>
    );
}
