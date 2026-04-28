import rawWords from "@/data/words.json";

export interface Word {
    word: string; // The active word (e.g., "CAT")
    syllable_count: number;
    phonetic_rhyme_id: string; // "AE", "AY" etc.
    tags: string[]; // ["food", "slang"]
}

export interface WordPack {
    id: string;
    name: string;
    description: string;
    difficulty_rating: number; // 1-5
    is_builtin: boolean;
    is_unlocked: boolean;
    rhyme_map: Record<string, Word[]>; // Keyed by phonetic_id
}

// Basic heuristic for syllable counting
function countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

export const createWordPack = (
    id: string,
    name: string,
    description: string,
    rawData: Record<string, string[]>
): WordPack => {
    const rhyme_map: Record<string, Word[]> = {};

    Object.entries(rawData).forEach(([rhymeId, words]) => {
        rhyme_map[rhymeId] = words.map(w => ({
            word: w,
            syllable_count: countSyllables(w),
            phonetic_rhyme_id: rhymeId,
            tags: []
        }));
    });

    return {
        id,
        name,
        description,
        difficulty_rating: 1, // Default
        is_builtin: true,
        is_unlocked: true,
        rhyme_map
    };
};

export interface PackFilterOptions {
    minSyllables?: number;
    maxSyllables?: number;
    minLength?: number;
}

export const filterWordPack = (
    basePack: WordPack,
    newId: string,
    newName: string,
    newDescription: string,
    difficulty: number,
    options: PackFilterOptions
): WordPack => {
    const newRhymeMap: Record<string, Word[]> = {};

    Object.entries(basePack.rhyme_map).forEach(([rhymeId, words]) => {
        const filteredWords = words.filter(w => {
            if (options.minSyllables && w.syllable_count < options.minSyllables) return false;
            if (options.maxSyllables && w.syllable_count > options.maxSyllables) return false;
            if (options.minLength && w.word.length < options.minLength) return false;
            return true;
        });

        if (filteredWords.length > 0) {
            newRhymeMap[rhymeId] = filteredWords;
        }
    });

    return {
        id: newId,
        name: newName,
        description: newDescription,
        difficulty_rating: difficulty,
        is_builtin: true,
        is_unlocked: true,
        rhyme_map: newRhymeMap
    };
};

// Singleton Default Pack
export const DEFAULT_WORD_PACK = createWordPack("core", "Core Pack", "The standard hip-hop vocabulary.", rawWords);
