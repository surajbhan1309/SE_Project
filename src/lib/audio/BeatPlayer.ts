import * as Tone from "tone";

export interface Beat {
    id: string;
    name: string;
    bpm: number;
    style: string;
    bars_per_loop: number;
    energy_level: number; // 1-5
    complexity_level: number; // 1-5
    description?: string;
    audioSrc?: string; // URL for full instrumental track
}

export class BeatPlayer {
    private player: Tone.Player | null = null;
    private loop: Tone.Loop | null = null;

    // Legacy Synths (Fallback)
    private kick: Tone.MembraneSynth | null = null;
    private snare: Tone.NoiseSynth | null = null;
    private hihat: Tone.MetalSynth | null = null;

    private currentBeat: Beat | null = null;
    private isPlaying: boolean = false;
    private isLoaded: boolean = false;

    constructor() { }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    public get getCurrentBeat(): Beat | null {
        return this.currentBeat;
    }

    private async initAudio(beat: Beat) {
        // 1. CLEANUP
        this.stop();
        if (this.player) {
            this.player.dispose();
            this.player = null;
        }

        // 2. MASTER VOLUME
        Tone.Destination.volume.value = -3; // Louder for tracks

        // 3. LOAD TRACK (If provided)
        if (beat.audioSrc) {
            try {
                this.player = new Tone.Player({
                    url: beat.audioSrc,
                    loop: true,
                    autostart: false,
                    onload: () => {
                        console.log("Track Loaded:", beat.name);
                    }
                }).toDestination();
                await Tone.loaded();
            } catch (e) {
                console.warn("Failed to load track, falling back to synths:", e);
                this.player = null;
                this.initSynths();
            }
        }
        // 4. FALLBACK: Procedural Synths (Only if no track)
        else {
            this.initSynths();
        }
    }

    private initSynths() {
        if (this.kick) return;

        console.log("Initializing Legacy Synths (Tuned)");
        // Punchier Kick
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4,
                attackCurve: "exponential"
            }
        }).toDestination();

        // Tighter Snare
        this.snare = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0
            }
        }).toDestination();
        this.snare.volume.value = -3;

        // Crisper Hi-Hats
        this.hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).toDestination();
        this.hihat.volume.value = -15;
    }

    public async loadBeat(beat: Beat): Promise<void> {
        this.currentBeat = beat;
        this.isLoaded = false;

        await this.initAudio(beat);

        Tone.Transport.bpm.value = beat.bpm;
        this.isLoaded = true;
        return Promise.resolve();
    }

    private startLegacyLoop() {
        if (this.loop) this.loop.dispose();

        const style = this.currentBeat?.style || "generic";
        const complexity = this.currentBeat?.complexity_level || 3;

        this.loop = new Tone.Loop((time) => {
            try {
                const t = (offset: string) => time + Tone.Time(offset).toSeconds();
                // const isFill = Math.random() < (complexity * 0.05);

                // --- TRAP / GRIME (Fast Hi-Hats, Heavy 808s) ---
                if (style === "grime" || style === "trap") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:2")); // Delayed kick

                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));

                    // Rolling Hats (Optimized)
                    for (let i = 0; i < 8; i++) { // 8th notes
                        const beat = Math.floor(i / 2);
                        const sixteenth = (i % 2) * 2;

                        // Basic 8th pattern
                        if (i % 2 === 0 || Math.random() > 0.3) {
                            this.hihat?.triggerAttackRelease("32n", t(`0:${beat}:${sixteenth}`), 0.3);
                        }
                    }
                }
                // --- DRILL (Syncopated Snare, Sliding Bass feel) ---
                else if (style === "drill") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:1:3")); // Late kick
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:2"));

                    // Drill Snare Pattern (on 3 and 8 usually, translated to Tone time)
                    this.snare?.triggerAttackRelease("8n", t("0:1:0")); // 3
                    this.snare?.triggerAttackRelease("8n", t("0:2:2")); // 8 (delayed)

                    // Fast triplet hats
                    if (Math.random() > 0.5) this.hihat?.triggerAttackRelease("32n", t("0:0:2"), 0.5);
                    this.hihat?.triggerAttackRelease("32n", t("0:1:2"), 0.5);
                    this.hihat?.triggerAttackRelease("32n", t("0:3:3"), 0.5);
                }
                // --- BOOM BAP (Swing, Simple) ---
                else if (style === "afrobeat" || style === "boom-bap") {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:1:2")); // Kick swing
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:1"));

                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));

                    // Steady Hats
                    for (let i = 0; i < 4; i++) {
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:0`), 0.7);
                        this.hihat?.triggerAttackRelease("16n", t(`0:${i}:2`), 0.4);
                    }
                }
                // --- GENERIC / FALLBACK ---
                else {
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:0:0"));
                    this.kick?.triggerAttackRelease("C1", "8n", t("0:2:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:1:0"));
                    this.snare?.triggerAttackRelease("8n", t("0:3:0"));
                    for (let i = 0; i < 8; i++) {
                        this.hihat?.triggerAttackRelease("32n", time + (i * Tone.Time("8n").toSeconds()), 0.5);
                    }
                }
            } catch (e) {
                console.error("Audio Loop Error:", e);
            }

        }, "1m").start(0);
    }

    public async start(): Promise<void> {
        if (!this.isLoaded || !this.currentBeat) return;

        // Resume Audio Context
        if (Tone.context.state !== "running") {
            await Tone.context.resume();
        }
        await Tone.start();

        // Transport Reset
        Tone.Transport.cancel();
        Tone.Transport.stop();
        Tone.Transport.position = 0;

        // MODE 1: AUDIO TRACK
        if (this.player && this.player.loaded) {
            // Unsync to ensure it loops independently of Transport quirks
            this.player.unsync();
            this.player.loop = true;
            this.player.start();
        }
        // MODE 2: LEGACY SYNTHS
        else {
            this.startLegacyLoop();
        }

        Tone.Transport.start();
        this.isPlaying = true;
    }

    public stop(): void {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        if (this.player) {
            this.player.stop();
        }
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
        this.isPlaying = false;
    }
}
