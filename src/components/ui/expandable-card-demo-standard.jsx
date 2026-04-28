
"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useNavigate } from "react-router-dom";

export default function ExpandableCardDemo() {
    const [active, setActive] = useState(null);
    const ref = useRef(null);
    const id = useId();
    const navigate = useNavigate();

    useEffect(() => {
        function onKeyDown(event) {
            if (event.key === "Escape") {
                setActive(null);
            }
        }

        if (active && typeof active === "object") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        (<div className="h-full w-full flex flex-col items-center justify-center bg-transparent">
            <h2 className="text-4xl font-black text-white/90 mb-8 tracking-tighter">Drill Chamber</h2>
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 h-full w-full z-10" />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === "object" ? (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                            onClick={() => setActive(null)}>
                            <CloseIcon />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-zinc-900 sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <motion.div layoutId={`image-${active.title}-${id}`}>
                                <img
                                    width={200}
                                    height={200}
                                    priority
                                    src={active.src}
                                    alt={active.title}
                                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top" />
                            </motion.div>

                            <div>
                                <div className="flex justify-between items-start p-4">
                                    <div className="">
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold text-white text-2xl">
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.description}-${id}`}
                                            className="text-zinc-400 text-base">
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.a
                                        layoutId={`button-${active.title}-${id}`}
                                        onClick={() => navigate(active.ctaLink)}
                                        target="_blank"
                                        className="px-4 py-3 text-sm rounded-full font-bold bg-cyan-500 text-black cursor-pointer hover:bg-cyan-400 transition-colors">
                                        {active.ctaText}
                                    </motion.a>
                                </div>
                                <div className="pt-4 relative px-4">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-neutral-400 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400">
                                        {typeof active.content === "function" ? active.content() : active.content}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <ul className="max-w-2xl mx-auto w-full gap-4">
                {cards.map((card, index) => (
                    <motion.div
                        layoutId={`card-${card.title}-${id}`}
                        key={`card-${card.title}-${id}`}
                        onClick={() => setActive(card)}
                        className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/10 my-2">
                        <div className="flex gap-4 flex-col md:flex-row items-center">
                            <motion.div layoutId={`image-${card.title}-${id}`}>
                                <img
                                    width={100}
                                    height={100}
                                    src={card.src}
                                    alt={card.title}
                                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top" />
                            </motion.div>
                            <div className="">
                                <motion.h3
                                    layoutId={`title-${card.title}-${id}`}
                                    className="font-medium text-white text-center md:text-left">
                                    {card.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${card.description}-${id}`}
                                    className="text-zinc-400 text-center md:text-left">
                                    {card.description}
                                </motion.p>
                            </div>
                        </div>
                        <motion.button
                            layoutId={`button-${card.title}-${id}`}
                            className="px-4 py-2 text-sm rounded-full font-bold bg-white/10 hover:bg-cyan-500 hover:text-black text-white mt-4 md:mt-0 transition-all">
                            {card.ctaText}
                        </motion.button>
                    </motion.div>
                ))}
            </ul>
        </div>)
    );
}

export const CloseIcon = () => {
    return (
        (<motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>)
    );
};

// DRILL DATA CARDS
const cards = [
    {
        title: "No-Pause Drill",
        description: "Silence > 0.8s = IMMEDIATE FAILURE.",
        src: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop",
        ctaText: "Enter Drill",
        ctaLink: "/drill/no-pause",
        content: () => {
            return (
                <p>
                    In the <strong>No-Pause Drill</strong>, you must keep flow going constantly.
                    If you stop rapping for more than 0.8 seconds, the drill fails instantly.
                    <br /> <br />
                    Perfect for building stamina and eliminating hesitation.
                </p>
            );
        },
    },
    {
        title: "Battle Simulator",
        description: "Face off against AI interruptions. (BETA)",
        src: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=1000&auto=format&fit=crop",
        ctaText: "Fight",
        ctaLink: "/battle",
        content: () => {
            return (
                <p>
                    Step into the arena with the <strong>Battle Simulator</strong>.
                    The AI will drop verbal attacks and angles. You must respond in real-time.
                    <br /> <br />
                    Features an Audience Reaction System that judges your performance.
                </p>
            );
        },
    },
    {
        title: "Pattern Trainer",
        description: "AABB / ABAB Rhyme Schemes.",
        src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
        ctaText: "Rhyme",
        ctaLink: "/drill/pattern",
        content: () => {
            return (
                <p>
                    Master complex rhyme schemes in <strong>Pattern Trainer</strong>.
                    Words are allocated to specific bars (e.g., A-A-B-B).
                    <br /><br />
                    Great for structuring your freestyle verses.
                </p>
            );
        },
    },
];
