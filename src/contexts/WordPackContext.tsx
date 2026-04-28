import { createContext, useContext, useState, type ReactNode } from "react";
import { type WordPack, DEFAULT_WORD_PACK, filterWordPack } from "@/lib/game/WordPack";

interface WordPackContextType {
    activeWordPack: WordPack;
    activePackId: string;
    availablePacks: WordPack[];
    setWordPack: (id: string) => void;
}

const WordPackContext = createContext<WordPackContextType | undefined>(undefined);

// PACK DEFINITIONS
// In a real app, these might come from a DB or separate files
// const SYLLABLE_1_PACK = createWordPack("syl-1", "Monosyllabic", "Short, punchy words.", rawWords); 
// const SYLLABLE_3_PACK = createWordPack("syl-3", "Lyricist", "Multi-syllabic complex rhymes.", rawWords);

// For now, let's just create placeholder variants of the default pack to prove the system works
// We will implement real filtering in the next step
// PACK DEFINITIONS
// Generated dynamically from the default pack using filters
const BEGINNER_PACK = filterWordPack(DEFAULT_WORD_PACK, "easy", "Beginner Pack", "Simple, monosyllabic words. Great for starting out.", 1, { maxSyllables: 1 });
const INTERMEDIATE_PACK = filterWordPack(DEFAULT_WORD_PACK, "med", "Flow State", "Standard rhymes with good flow. A mix of short and medium words.", 3, { minSyllables: 1, maxSyllables: 3 });
const MASTER_PACK = filterWordPack(DEFAULT_WORD_PACK, "hard", "Master Class", "Complex multisalibic rhymes for advanced lyricists.", 5, { minSyllables: 2, minLength: 6 });

const AVAILABLE_PACKS = [
    DEFAULT_WORD_PACK,
    BEGINNER_PACK,
    INTERMEDIATE_PACK,
    MASTER_PACK
];

export function WordPackProvider({ children }: { children: ReactNode }) {
    const [activePackId, setActivePackId] = useState<string>(() => {
        return localStorage.getItem("activeWordPackId") || "core";
    });

    const activeWordPack = AVAILABLE_PACKS.find(p => p.id === activePackId) || DEFAULT_WORD_PACK;

    const setWordPack = (id: string) => {
        if (AVAILABLE_PACKS.find(p => p.id === id)) {
            setActivePackId(id);
            localStorage.setItem("activeWordPackId", id);
        }
    };

    return (
        <WordPackContext.Provider value={{
            activeWordPack,
            activePackId,
            availablePacks: AVAILABLE_PACKS,
            setWordPack
        }}>
            {children}
        </WordPackContext.Provider>
    );
}

export function useWordPack() {
    const context = useContext(WordPackContext);
    if (!context) {
        throw new Error("useWordPack must be used within a WordPackProvider");
    }
    return context;
}
