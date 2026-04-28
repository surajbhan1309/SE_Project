// Minimal phonetic dictionary mapping vowels to common sounds
// We use a simplified Arpabet-like set:
// AA (fAther), AE (cAt), AH (cUt), AO (dOg), AW (fOUl), AY (fIle), 
// EH (bEt), ER (bUrn), EY (stAy), IH (sIt), IY (sEE), OW (gO), 
// OY (tOy), UH (bOOk), UW (fOOd)

const VOWEL_MAP: Record<string, string> = {
    // AE (Cat, Bat, Rap)
    "CAT": "AE", "BAT": "AE", "HAT": "AE", "RAP": "AE", "TAP": "AE", "MAP": "AE",
    "BACK": "AE", "BLACK": "AE", "SLACK": "AE", "TRACK": "AE", "FACT": "AE",

    // AY (My, Ride, Time)
    "MY": "AY", "FLY": "AY", "SKY": "AY", "HIGH": "AY", "RIDE": "AY", "SIDE": "AY",
    "TIME": "AY", "RHYME": "AY", "CLIMB": "AY", "MIND": "AY", "GRIND": "AY", "SHINE": "AY",

    // OW (Flow, Go, Slow)
    "FLOW": "OW", "GO": "OW", "LOW": "OW", "SLOW": "OW", "SHOW": "OW", "KNOW": "OW",
    "CODE": "OW", "ROAD": "OW", "MODE": "OW", "COLD": "OW", "GOLD": "OW",

    // EY (Stay, Play, Day)
    "STAY": "EY", "PLAY": "EY", "DAY": "EY", "WAY": "EY", "SAY": "EY", "PAY": "EY",
    "GAME": "EY", "NAME": "EY", "SAME": "EY", "LATE": "EY", "GREAT": "EY",

    // IY (See, Me, Free)
    "SEE": "IY", "ME": "IY", "FREE": "IY", "BE": "IY", "KEY": "IY", "STREET": "IY",
    "HEAT": "IY", "BEAT": "IY", "FEET": "IY", "REAL": "IY", "FEEL": "IY",

    // EH (Set, Get, Check)
    "SET": "EH", "GET": "EH", "LET": "EH", "CHECK": "EH", "DECK": "EH", "NECK": "EH",
    "STEP": "EH", "REP": "EH", "TEXT": "EH", "NEXT": "EH", "BEST": "EH"
};

export class RhymeEngine {

    /**
     * Extracts the primary stressed vowel sound from a word.
     * Uses a local map first, then heuristics.
     */
    public getVowelSound(word: string): string {
        const upper = word.toUpperCase().replace(/[^A-Z]/g, ''); // Clean word
        if (!upper) return "";

        // 1. Direct Lookup
        if (VOWEL_MAP[upper]) return VOWEL_MAP[upper];

        // 2. Simple Heuristics (Very rough fallback)
        if (upper.endsWith("IGHT") || upper.endsWith("ITE") || upper.endsWith("IME") || upper.endsWith("INE")) return "AY";
        if (upper.endsWith("AY") || upper.endsWith("ATE") || upper.endsWith("AKE") || upper.endsWith("AME")) return "EY";
        if (upper.endsWith("OW") || upper.endsWith("ODE") || upper.endsWith("OAD") || upper.endsWith("ONE")) return "OW";
        if (upper.endsWith("EE") || upper.endsWith("EA") || upper.endsWith("EET")) return "IY";
        if (upper.endsWith("CK") || upper.endsWith("AP") || upper.endsWith("AT") || upper.endsWith("AD")) return "AE";

        return "UNKNOWN";
    }

    /**
     * Checks if two words rhyme based on vowel matching.
     */
    public isRhyme(word1: string, word2: string): boolean {
        const v1 = this.getVowelSound(word1);
        const v2 = this.getVowelSound(word2);

        if (v1 === "UNKNOWN" || v2 === "UNKNOWN") return false; // Strict mode: unknown is failure
        return v1 === v2;
    }

    /**
     * Checks if a word contains a specific target vowel sound.
     */
    public matchesVowel(word: string, targetVowel: string): boolean {
        const v = this.getVowelSound(word);
        return v === targetVowel;
    }

    /**
     * Returns a random target vowel / rhyme scheme for drills.
     */
    public getRandomVowelTarget(): { vowel: string, example: string } {
        const targets = [
            { vowel: "AE", example: "Cat / Bat" },
            { vowel: "AY", example: "Time / Shine" },
            { vowel: "OW", example: "Flow / Go" },
            { vowel: "EY", example: "Play / Stay" },
            { vowel: "IY", example: "See / Free" },
            { vowel: "EH", example: "Check / Deck" }
        ];
        return targets[Math.floor(Math.random() * targets.length)];
    }
}
