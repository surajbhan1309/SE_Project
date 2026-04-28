export class SpeechEngine {
    private recognition: any | null = null; // using any for webkitSpeechRecognition
    private isListening: boolean = false;
    private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
            } else {
                console.error("Web Speech API not supported in this browser.");
            }
        }
    }

    public start(
        onResult: (text: string, isFinal: boolean) => void,
        onFiller?: (word: string) => void
    ) {
        if (!this.recognition) return;

        this.onResultCallback = onResult;

        this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const text = event.results[i][0].transcript;

                // Filler Check (simple scan)
                if (onFiller) {
                    const words = text.toLowerCase().split(" ");
                    const fillers = ["um", "uh", "likes", "like", "umm", "ahh"];
                    // Check last few words
                    const lastWord = words[words.length - 1];
                    if (fillers.includes(lastWord)) {
                        onFiller(lastWord);
                    }
                }

                if (event.results[i].isFinal) {
                    finalTranscript += text;
                } else {
                    interimTranscript += text;
                }
            }

            if (this.onResultCallback) {
                // Send the most relevant text
                this.onResultCallback(finalTranscript || interimTranscript, !!finalTranscript);
            }
        };

        this.recognition.onerror = (event: any) => {
            // Ignore common non-critical errors or just log debug
            if (event.error === 'no-speech' || event.error === 'network') {
                console.debug("Speech recognition minor error:", event.error);
            } else {
                console.warn("Speech recognition error", event.error);
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Auto-restart if it stops unexpectedly while we think we are listening
                // Add small delay to prevent rapid loops on error
                setTimeout(() => {
                    if (this.isListening) {
                        try { this.recognition.start(); } catch (e) { /* ignore */ }
                    }
                }, 100);
            }
        };

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (e) {
            console.warn("Speech recognition already started or failed", e);
        }
    }

    public stop() {
        this.isListening = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore errors if already stopped or invalid state
                console.debug("SpeechEngine stop handled:", e);
            }
        }
    }
}
