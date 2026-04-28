import React, { createContext, useContext, useState, useEffect } from "react";
import { BEATS } from "@/data/beats";
import type { Beat } from "@/lib/audio/BeatPlayer";
import { BeatStorage } from "@/lib/storage/BeatStorage";

interface BeatContextType {
    currentBeat: Beat;
    allBeats: Beat[];
    setCurrentBeat: (beat: Beat) => void;
    addCustomBeat: (file: File) => Promise<void>;
    removeCustomBeat: (id: string) => Promise<void>;
}

const BeatContext = createContext<BeatContextType | undefined>(undefined);

export function BeatProvider({ children }: { children: React.ReactNode }) {
    const [currentBeat, setCurrentBeat] = useState<Beat>(BEATS[0]);
    const [customBeats, setCustomBeats] = useState<Beat[]>([]);

    useEffect(() => {
        // Load saved beats from DB
        BeatStorage.getAllBeats().then(loadedBeats => {
            setCustomBeats(loadedBeats);
        });
    }, []);

    const addCustomBeat = async (file: File) => {
        const id = `custom-${Date.now()}`;
        const newBeat: Beat = {
            id,
            name: file.name.substring(0, 20),
            description: "Custom Uploaded Track",
            bpm: 120, // Todo: Detect BPM?
            style: "custom",
            bars_per_loop: 4,
            energy_level: 5,
            complexity_level: 5,
            audioSrc: URL.createObjectURL(file)
        };

        // Save to DB
        await BeatStorage.saveBeat(newBeat, file);

        // Update State
        setCustomBeats(prev => [newBeat, ...prev]);
        setCurrentBeat(newBeat);
    };

    const removeCustomBeat = async (id: string) => {
        await BeatStorage.deleteBeat(id);
        setCustomBeats(prev => prev.filter(b => b.id !== id));
        // If deleted beat was active, switch to default
        if (currentBeat.id === id) {
            setCurrentBeat(BEATS[0]);
        }
    };

    const allBeats = [...BEATS, ...customBeats];

    return (
        <BeatContext.Provider value={{ currentBeat, setCurrentBeat, allBeats, addCustomBeat, removeCustomBeat }}>
            {children}
        </BeatContext.Provider>
    );
}

export function useBeat() {
    const context = useContext(BeatContext);
    if (context === undefined) {
        throw new Error("useBeat must be used within a BeatProvider");
    }
    return context;
}
