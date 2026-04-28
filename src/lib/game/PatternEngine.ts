import { DEFAULT_WORD_PACK, type Word, type WordPack } from "@/lib/game/WordPack";

export interface PatternConfig {
    id: string;
    name: string;
    slots: string[]; // ["A", "A", "B", "B"]
    description?: string;
}

export const PATTERNS: Record<string, PatternConfig> = {
    "AABB": { id: "AABB", name: "Couplets", slots: ["A", "A", "B", "B"] },
    "ABAB": { id: "ABAB", name: "Alternate", slots: ["A", "B", "A", "B"] },
    "AAAA": { id: "AAAA", name: "Mono", slots: ["A", "A", "A", "A"] },
    "A_AA": { id: "A_AA", name: "Hybrid", slots: ["A", "A", "A", "A"] },
};

export const COLOR_MAP: Record<string, string> = {
    "A": "#F97316", // Orange
    "B": "#3B82F6", // Blue
    "C": "#22C55E", // Green
    "D": "#EAB308", // Yellow
};

interface RhymeTarget {
    vowel: string;
    words: Word[];
}

export class PatternEngine {
    private currentPattern: PatternConfig = PATTERNS["AABB"];
    private currentPack: WordPack = DEFAULT_WORD_PACK;

    // wordCache removed in favor of barWordCache

    // Cache vowels per verse (A -> "OH", B -> "AY")
    private vowelCache: Record<number, Record<string, RhymeTarget>> = {};

    constructor() {
        this.reset();
    }

    public setPattern(patternId: string) {
        if (PATTERNS[patternId]) {
            this.currentPattern = PATTERNS[patternId];
        } else {
            console.warn(`Pattern ${patternId} not found, defaulting to AABB`);
            this.currentPattern = PATTERNS["AABB"];
        }
        this.reset();
    }

    public setPack(pack: WordPack) {
        this.currentPack = pack;
        this.reset();
    }

    public getPattern(): PatternConfig {
        return this.currentPattern;
    }

    // Pool state: rhymeId -> list of words remaining
    private wordPools: Record<string, Word[]> = {};

    // reset() is defined below to clear barWordCache
    // private wordCache: Record<number, Record<string, Word>> = {}; // This was removed
    // public reset() {
    //     this.wordCache = {};
    //     this.vowelCache = {};
    //     this.refreshPools();
    // }

    private refreshPools() {
        // Initialize or top-up pools
        if (!this.currentPack) return;

        Object.keys(this.currentPack.rhyme_map).forEach(rhymeId => {
            if (!this.wordPools[rhymeId] || this.wordPools[rhymeId].length === 0) {
                this.wordPools[rhymeId] = this.shuffleArray([...this.currentPack.rhyme_map[rhymeId]]);
            }
        });
    }

    private getRandomTarget(): RhymeTarget {
        const vowels = Object.keys(this.currentPack.rhyme_map);
        const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
        return {
            vowel: randomVowel,
            words: this.currentPack.rhyme_map[randomVowel]
        };
    }

    private getVowelsForVerse(verse: number): Record<string, RhymeTarget> {
        if (this.vowelCache[verse]) return this.vowelCache[verse];

        // Unique groups in current pattern (e.g. A, B)
        const uniqueGroups = Array.from(new Set(this.currentPattern.slots));
        const verseVowels: Record<string, RhymeTarget> = {};

        // Assign a unique vowel target to each group
        const usedVowels = new Set<string>();

        uniqueGroups.forEach(group => {
            let target = this.getRandomTarget();
            // Try to find a unique vowel not used yet in this verse
            let attempts = 0;
            while (usedVowels.has(target.vowel) && attempts < 20) {
                target = this.getRandomTarget();
                attempts++;
            }
            usedVowels.add(target.vowel);
            verseVowels[group] = target;
        });

        this.vowelCache[verse] = verseVowels;
        return this.vowelCache[verse];
    }

    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private getNextWord(target: RhymeTarget): Word {
        // Ensure pool exists and has words
        const rhymeId = target.vowel;

        // Safety fallback if rhyme ID logic is fuzzy (target.vowel vs target.words[0].phonetic_rhyme_id)
        // We use the vowel key from rhyme_map
        if (!this.wordPools[rhymeId] || this.wordPools[rhymeId].length === 0) {
            // Refill
            const freshWords = this.currentPack.rhyme_map[rhymeId];
            if (!freshWords || freshWords.length === 0) {
                // Critical failure fallback
                return { word: "???", syllable_count: 1, phonetic_rhyme_id: rhymeId, tags: [] };
            }
            this.wordPools[rhymeId] = this.shuffleArray([...freshWords]);
        }

        // Pop one word
        return this.wordPools[rhymeId].pop()!;
    }

    // Cache words by absolute bar index to ensure history is preserved but never repeated cyclically
    private barWordCache: Record<number, Word> = {};

    public reset() {
        this.barWordCache = {};
        this.vowelCache = {};
        this.refreshPools();
    }

    // ... (keep refreshPools, shuffleArray, getNextWord as is)

    private getWordForBar(barIndex: number): Word {
        if (this.barWordCache[barIndex]) return this.barWordCache[barIndex];

        // 1. Determine which verse this bar belongs to (for Rhyme Target consistency)
        // A verse is typically 16 bars. We keep the same *rhyme sounds* (e.g. "AY", "OH") for a duration?
        // Or should AABB change rhymes every 4 bars?
        // Usually AABB implies the structure.
        // Let's stick to: Vowels are consistent for the "Verse" (16 bars), but words change.
        const verseIndex = Math.floor(barIndex / 16); // 0, 1...

        // 2. Determine Pattern Slot (A, B, etc)
        const patternLength = this.currentPattern.slots.length; // 4
        // Which slot in the pattern? 0..3
        const slotIndex = barIndex % patternLength;
        const group = this.currentPattern.slots[slotIndex];

        // 3. Get the Vowel Target for this Group in this Verse
        const verseVowels = this.getVowelsForVerse(verseIndex);
        const target = verseVowels[group];

        // 4. Get a FRESH word from the pool
        const word = this.getNextWord(target);

        // 5. Cache it
        this.barWordCache[barIndex] = word;
        return word;
    }

    public getTargetForBar(_bar: number, _verse: number = 0): {
        vowel: string,
        label: string,
        suggestion: string,
        color: string
    } {
        // Bar is 1-indexed incoming? 
        // Let's assume input 'bar' is globalBarIndex (0-indexed) to avoid confusion, 
        // OR PatternDrill is passing 1-indexed relative bars.

        // CORRECTION: The caller (PatternDrill) was passing (relativeBar, verse).
        // note: relativeBar was 1..4.
        // We really need GLOBAL bar index to be unique.
        // I will change the signature to accept `globalBarIndex` (0-indexed).

        // If the caller passes (1..4, verse), we can reconstruct:
        // global = (verse * 16) + (relative - 1).

        // BUT logic is cleaner if we just ask for `globalBarIndex`.
        // I will handle the conversion here if needed, or assume the caller updates.
        // To be safe and compatible with current PatternDrill call:
        // PatternDrill calls: `getTargetForBar(relativeBarInPattern, currentVerseForThisBar)` 
        // val 1: 1..4
        // val 2: 0..N

        // Let's reinterpret arguments.
        // arg1: barNum (could be global if we change caller, but currently relative)
        // arg2: verseNum

        // Implied global index:
        // This is tricky because `relativeBar` wraps every 4.
        // We don't know if it's bar 5 (relative 1) or bar 1 (relative 1).
        // WE NEED THE CALLER TO PASS GLOBAL INDEX.

        // I will overload or change behavior. Current caller passes `relativeBarInPattern` (1-4).
        // I cannot derive global index from (1-4) and verse (0) uniquely if verse=16 bars.
        // (Verse 0 has Bar 1, 2, 3, 4 AND Bar 5, 6, 7, 8).
        // Bar 5 is relative 1 (in pattern AABB).
        // So `PatternDrill` MUST pass specific global index.

        return { vowel: "", label: "", suggestion: "UPDATE_CALLER", color: "#F00" };
    }

    // NEW METHOD to be used by updated PatternDrill
    public getContentForBar(globalBarIndex: number): {
        vowel: string,
        label: string,
        suggestion: string,
        color: string
    } {
        const word = this.getWordForBar(globalBarIndex);

        const patternLength = this.currentPattern.slots.length;
        const slotIndex = globalBarIndex % patternLength;
        const group = this.currentPattern.slots[slotIndex];

        // Get vowel for display
        const verseIndex = Math.floor(globalBarIndex / 16);
        const verseVowels = this.getVowelsForVerse(verseIndex);
        const vowel = verseVowels[group]?.vowel || "?";

        return {
            vowel,
            label: group,
            suggestion: word.word,
            color: COLOR_MAP[group] || "#FFF"
        };
    }
}
