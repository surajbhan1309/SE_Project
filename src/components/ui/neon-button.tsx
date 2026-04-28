import { useEffect, useMemo, useState } from "react";
import { Sparkle, Loader2 } from "lucide-react";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isLoading?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const baseOptions: ISourceOptions = {
    key: "star",
    name: "Star",
    particles: {
        number: {
            value: 20,
            density: {
                enable: false,
            },
        },
        color: {
            value: ["#7c3aed", "#bae6fd", "#a78bfa", "#93c5fd", "#0284c7", "#fafafa", "#38bdf8"],
        },
        shape: {
            type: "star",
            options: {
                star: {
                    sides: 4,
                },
            },
        },
        opacity: {
            value: 0.8,
        },
        size: {
            value: { min: 1, max: 4 },
        },
        rotate: {
            value: {
                min: 0,
                max: 360,
            },
            enable: true,
            direction: "clockwise",
            animation: {
                enable: true,
                speed: 10,
                sync: false,
            },
        },
        links: {
            enable: false,
        },
        reduceDuplicates: true,
        move: {
            enable: true,
            center: {
                x: 120,
                y: 45,
            },
        },
    },
    interactivity: {
        events: {},
    },
    smooth: true,
    fpsLimit: 120,
    background: {
        color: "transparent",
        size: "cover",
    },
    fullScreen: {
        enable: false,
    },
    detectRetina: true,
    absorbers: [
        {
            enable: true,
            opacity: 0,
            size: {
                value: 1,
                density: 1,
                limit: {
                    radius: 5,
                    mass: 5,
                },
            },
            position: {
                x: 110,
                y: 45,
            },
        },
    ],
    emitters: [
        {
            autoPlay: true,
            fill: true,
            life: {
                wait: true,
            },
            rate: {
                quantity: 5,
                delay: 0.5,
            },
            position: {
                x: 110,
                y: 45,
            },
        },
    ],
};

let particlesInitialized = false;

export function NeonButton({
    children,
    variant = "primary",
    isLoading,
    size = "md",
    className,
    ...props
}: NeonButtonProps) {
    const [partId] = useState(() => `particles-${Math.random().toString(36).substr(2, 9)}`);
    const [particleState, setParticlesReady] = useState<"loaded" | "ready">();
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!particlesInitialized) {
            initParticlesEngine(async (engine) => {
                await loadFull(engine);
            }).then(() => {
                particlesInitialized = true;
                setParticlesReady("loaded");
            });
        } else {
            setParticlesReady("loaded");
        }
    }, []);

    const modifiedOptions = useMemo(() => {
        const opts = JSON.parse(JSON.stringify(baseOptions));
        opts.autoPlay = isHovering;
        return opts;
    }, [isHovering]);

    // Outer ring gradients
    const variantStyles = {
        primary: "bg-gradient-to-r from-blue-300/30 via-blue-500/30 via-40% to-purple-500/30",
        secondary: "bg-gradient-to-r from-zinc-300/30 via-zinc-500/30 via-40% to-zinc-700/30",
        danger: "bg-gradient-to-r from-red-300/30 via-red-500/30 via-40% to-orange-500/30",
        ghost: "bg-none hover:bg-white/5"
    };

    // Inner button gradients
    const innerVariantStyles = {
        primary: "bg-gradient-to-r from-blue-300 via-blue-500 via-40% to-purple-500 text-white",
        secondary: "bg-gradient-to-r from-zinc-500 via-zinc-600 via-40% to-zinc-800 text-white",
        danger: "bg-gradient-to-r from-red-400 via-red-600 via-40% to-orange-600 text-white",
        ghost: "bg-transparent text-zinc-400 group-hover:text-white"
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-xl"
    };

    const isGhost = variant === "ghost";

    return (
        <motion.button
            className={cn(
                "group relative rounded-full p-1 transition-transform hover:scale-105 active:scale-95",
                !isGhost && variantStyles[variant],
                props.disabled && "opacity-50 cursor-not-allowed hover:scale-100",
                className
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            disabled={isLoading || props.disabled}
            whileTap={!props.disabled ? { scale: 0.95 } : undefined}
            {...props}
        >
            <div className={cn(
                "relative flex items-center justify-center gap-2 rounded-full",
                innerVariantStyles[variant],
                sizeStyles[size]
            )}>
                {/* Sparkles - Hide for ghost or if loading */}
                {!isGhost && !isLoading && (
                    <>
                        <Sparkle className="size-6 -translate-y-0.5 animate-sparkle fill-white/80 absolute left-2 opacity-50" />
                        <Sparkle
                            style={{ animationDelay: "1s" }}
                            className="absolute bottom-2.5 right-3.5 z-20 size-2 rotate-12 animate-sparkle fill-white/80 opacity-50"
                        />
                        <Sparkle
                            style={{ animationDelay: "1.5s", animationDuration: "2.5s" }}
                            className="absolute right-5 top-2.5 size-1 -rotate-12 animate-sparkle fill-white/80 opacity-50"
                        />
                        <Sparkle
                            style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
                            className="absolute left-3 top-3 size-1.5 animate-sparkle fill-white/80 opacity-50"
                        />
                    </>
                )}

                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}

                <span className="font-semibold z-10 flex items-center gap-2 relative">
                    {children}
                </span>
            </div>

            {!!particleState && !isGhost && !props.disabled && (
                <Particles
                    id={partId}
                    className={cn("pointer-events-none absolute -bottom-4 -left-4 -right-4 -top-4 z-0 opacity-0 transition-opacity", {
                        "group-hover:opacity-100": particleState === "ready",
                    })}
                    particlesLoaded={async () => {
                        setParticlesReady("ready");
                    }}
                    options={modifiedOptions}
                />
            )}
        </motion.button>
    );
}
