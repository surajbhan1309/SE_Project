export class PromptEngine {
    private topics = ["City Life", "Future Tech", "Underground", "Outer Space", "Ancient History", "Love & Heartbreak", "Hustle", "Nature"];
    private words = [
        "Glitch", "Neon", "Shadow", "Rhythm", "Power", "Cyber", "Flow", "System",
        "Data", "Pulse", "Circuit", "Echo", "Void", "Matrix", "Signal", "Noise"
    ];

    public getTopic(): string {
        return this.topics[Math.floor(Math.random() * this.topics.length)];
    }

    public getWord(): string {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

    public getWords(count: number): string[] {
        const shuffled = [...this.words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
