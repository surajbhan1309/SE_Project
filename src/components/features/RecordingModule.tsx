import { useState, useEffect, useRef } from "react";
import { Mic, Circle, Download, Square } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

export function RecordingModule({ isRecording, autoArm = false }: { isRecording: boolean; autoArm?: boolean }) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]); // Use ref to avoid closure staleness
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isArmed, setIsArmed] = useState(false);

    useEffect(() => {
        if (autoArm && !isArmed && !mediaRecorder) {
            armRecording();
        }
    }, [autoArm, isArmed, mediaRecorder]);

    useEffect(() => {
        // Init logic
        if (isArmed && isRecording && mediaRecorder && mediaRecorder.state === "inactive") {
            startRecording();
        } else if (!isRecording && mediaRecorder && mediaRecorder.state === "recording") {
            stopRecording();
        }
    }, [isRecording, isArmed, mediaRecorder]);

    // Auto-download when URL is ready
    useEffect(() => {
        if (audioUrl) {
            downloadRecording();
        }
    }, [audioUrl]);

    const armRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = []; // Reset chunks

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                chunksRef.current = [];
            };

            setMediaRecorder(recorder);
            setIsArmed(true);
            setAudioUrl(null); // Reset previous recording
        } catch (err) {
            console.error("Error accessing microphone:", err);
            // alert("Microphone access denied for recording."); // annoyances
        }
    };

    const startRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "inactive") {
            chunksRef.current = [];
            mediaRecorder.start();
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            // Do NOT disarm here if we want to allow re-recording without re-permission, 
            // but for this flow (one session), we can keeping it armed or disarm. 
            // The user wants download.
            setIsArmed(false);
            setMediaRecorder(null); // Cleanup
        }
    };

    const downloadRecording = () => {
        if (!audioUrl) return;
        const a = document.createElement("a");
        a.href = audioUrl;
        a.download = `flowstate-session-${Date.now()}.webm`;
        document.body.appendChild(a); // Append to body for Firefox support
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex items-center gap-4 pointer-events-auto">
            {!isArmed && !audioUrl && !autoArm && (
                <NeonButton size="sm" variant="ghost" onClick={armRecording}>
                    <Mic className="w-4 h-4 mr-2" /> RECORD SESSION
                </NeonButton>
            )}

            {isArmed && !isRecording && (
                <div className="flex items-center text-red-500 font-bold animate-pulse">
                    <Circle className="w-3 h-3 mr-2 fill-current" /> READY
                </div>
            )}

            {isRecording && isArmed && (
                <div className="flex items-center text-red-500 font-bold animate-pulse">
                    <Square className="w-3 h-3 mr-2 fill-current" /> REC
                </div>
            )}

            {audioUrl && !isRecording && (
                <NeonButton size="sm" variant="primary" onClick={downloadRecording}>
                    <Download className="w-4 h-4 mr-2" /> SAVE RECORDING
                </NeonButton>
            )}
        </div>
    );
}
