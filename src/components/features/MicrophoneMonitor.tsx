import { useEffect, useState, useRef } from "react";
import { AudioContextManager } from "@/lib/audio/AudioContextManager";
import { Mic, AlertCircle } from "lucide-react";

interface MicrophoneMonitorProps {
    renderVisualizer?: (analyser: AnalyserNode) => React.ReactNode;
    onSilence?: (isSilent: boolean) => void;
    silenceThreshold?: number; // Time in ms before silence is triggered
}

export function MicrophoneMonitor({ renderVisualizer, onSilence, silenceThreshold = 800 }: MicrophoneMonitorProps) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const silenceTimer = useRef<number | null>(null);
    const lastAudioTime = useRef<number>(Date.now());

    useEffect(() => {
        const initMic = async () => {
            try {
                const manager = AudioContextManager.getInstance();
                await manager.initialize();
                setAnalyser(manager.getAnalyser());
                setIsListening(true);
            } catch (err) {
                console.error(err);
                setError("Microphone access denied.");
            }
        };
        initMic();
    }, []);

    // Improved Silence Detection Logic
    useEffect(() => {
        if (!analyser || !onSilence) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;

            // Threshold for "silence" in terms of volume (0-255)
            // 20 is a safe bet for background noise, 10 is very quiet
            if (average > 15) {
                lastAudioTime.current = Date.now();
                if (silenceTimer.current) {
                    onSilence(false); // Noise detected, reset silence
                    silenceTimer.current = null;
                }
            } else {
                // If silent for longer than threshold
                if (Date.now() - lastAudioTime.current > silenceThreshold) {
                    if (!silenceTimer.current) {
                        onSilence(true);
                        silenceTimer.current = 1; // Mark as notified
                    }
                }
            }
            requestAnimationFrame(checkAudio);
        };

        const frameId = requestAnimationFrame(checkAudio);
        return () => cancelAnimationFrame(frameId);
    }, [analyser, onSilence, silenceThreshold]);


    if (error) {
        return (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        );
    }

    if (!isListening) {
        return <div className="text-muted-foreground animate-pulse">Initializing Mic...</div>;
    }

    return (
        <div className="w-full">
            {analyser && renderVisualizer ? renderVisualizer(analyser) : (
                <div className="flex items-center gap-2 text-primary">
                    <Mic className="w-4 h-4 animate-pulse" /> Mic Active
                </div>
            )}
        </div>
    );
}
