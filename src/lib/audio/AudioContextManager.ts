export class AudioContextManager {
    private static instance: AudioContextManager;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;

    private constructor() { }

    public static getInstance(): AudioContextManager {
        if (!AudioContextManager.instance) {
            AudioContextManager.instance = new AudioContextManager();
        }
        return AudioContextManager.instance;
    }

    public async initialize(): Promise<void> {
        if (this.audioContext) return; // Already initialized

        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();

        // Request Microphone Access
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.microphone.connect(this.analyser);

            // Do NOT connect to destination (speakers) to avoid feedback loop
        } catch (error) {
            console.error("Microphone access denied or error:", error);
            throw error;
        }
    }

    public getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    public getAudioContext(): AudioContext | null {
        return this.audioContext;
    }

    public resumeContext(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
