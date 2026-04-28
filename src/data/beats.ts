import type { Beat } from "@/lib/audio/BeatPlayer";

export const BEATS: Beat[] = [
    {
        id: "custom-url",
        name: "CUSTOM URL",
        description: "Paste any MP3 link for your instrumental.",
        bpm: 120, // Default until user sets it
        style: "custom",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 5,
        audioSrc: "" // Will be populated by UI
    },
    {
        id: "trap-pro",
        name: "Pro Trap Banger",
        description: "Hard hitting 808s and rapid hats. (Hybrid)",
        bpm: 140,
        style: "grime", // Fallback style
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 4,
    },
    {
        id: "drill-uk",
        name: "UK Drill Ghost",
        description: "Sliding bass and syncopated snare.",
        bpm: 142,
        style: "drill",
        bars_per_loop: 4,
        energy_level: 5,
        complexity_level: 5
    },
    {
        id: "boom-bap-90s",
        name: "90s Boom Bap",
        description: "Dusty drums and swing.",
        bpm: 90,
        style: "boom-bap",
        bars_per_loop: 4,
        energy_level: 3,
        complexity_level: 3
    },
    {
        id: "chill-lofi",
        name: "Lofi Study Flow",
        description: "Relaxed tempo for practice.",
        bpm: 80,
        style: "generic",
        bars_per_loop: 4,
        energy_level: 2,
        complexity_level: 1
    }
];
