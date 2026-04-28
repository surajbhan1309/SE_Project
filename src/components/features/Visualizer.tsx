import { useEffect, useRef } from "react";

interface VisualizerProps {
    analyser: AnalyserNode | null;
    className?: string;
}

export function Visualizer({ analyser, className }: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // Clear with transparent or extremely dark bg
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                // Gradient or Neon Color - using CSS var colors logic roughly
                // Primary is violet (270), secondary is cyan (190)
                // Let's make it dynamic based on height

                const hue = 260 + (barHeight / 140) * 60; // range from purple to pink
                ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;

                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                ctx.shadowBlur = 0; // reset for performance?

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [analyser]);

    return <canvas ref={canvasRef} className={className} width={500} height={100} />;
}
